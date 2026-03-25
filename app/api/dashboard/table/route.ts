import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  calcROAS,
  calcCPA,
  calcCTR,
  calcCVR,
  calcNetProfit,
  calcTicketMedio,
} from "@/lib/kpi";
import { parseLocalDate, startOfDay, endOfDay, getDateRange } from "@/lib/date";
import type { TableRow, PaginatedResponse } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  let startDate: Date;
  let endDate: Date;

  const startParam = searchParams.get("startDate");
  const endParam = searchParams.get("endDate");
  const period = searchParams.get("period") as "today" | "yesterday" | "7d" | "30d" | null;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50", 10);

  if (startParam && endParam) {
    startDate = startOfDay(parseLocalDate(startParam));
    endDate = endOfDay(parseLocalDate(endParam));
  } else {
    const range = getDateRange(period ?? "7d");
    startDate = range.startDate;
    endDate = range.endDate;
  }

  try {
    type AdsRow = {
      adId: string;
      adName: string;
      adsetName: string;
      campaignName: string;
      spend: number;
      impressions: number;
      linkClicks: number;
      checkoutsInitiated: number;
    };

    type SalesRow = {
      utmContent: string;
      revenue: number;
      sales: number;
    };

    const [adsRaw, salesRaw] = await Promise.all([
      prisma.$queryRaw<AdsRow[]>`
        SELECT
          "adId",
          "adName",
          "adsetName",
          "campaignName",
          SUM(spend)::float as spend,
          SUM(impressions)::int as impressions,
          SUM("linkClicks")::int as "linkClicks",
          SUM("checkoutsInitiated")::int as "checkoutsInitiated"
        FROM "FacebookAd"
        WHERE date >= ${startDate} AND date <= ${endDate}
        GROUP BY "adId", "adName", "adsetName", "campaignName"
      `,
      prisma.$queryRaw<SalesRow[]>`
        SELECT
          "utmContent",
          SUM("totalSaleValue")::float as revenue,
          COUNT(id)::int as sales
        FROM "Sale"
        WHERE status IN ('approved', 'complete')
          AND "transactionDate" >= ${startDate} AND "transactionDate" <= ${endDate}
          AND "utmContent" IS NOT NULL
        GROUP BY "utmContent"
      `,
    ]);

    const salesMap = new Map(
      salesRaw.map((s: SalesRow) => [s.utmContent, { revenue: s.revenue, sales: s.sales }])
    );

    const rows: TableRow[] = adsRaw.map((ad: AdsRow) => {
      const salesData = salesMap.get(ad.adId) ?? { revenue: 0, sales: 0 };
      const spend = ad.spend;
      const revenue = salesData.revenue;
      const sales = salesData.sales;

      return {
        adId: ad.adId,
        adName: ad.adName,
        adsetName: ad.adsetName,
        campaignName: ad.campaignName,
        spend,
        impressions: ad.impressions,
        linkClicks: ad.linkClicks,
        checkoutsInitiated: ad.checkoutsInitiated,
        revenue,
        profit: calcNetProfit(revenue, spend),
        roas: calcROAS(revenue, spend),
        cpa: calcCPA(spend, sales),
        ctr: calcCTR(ad.linkClicks, ad.impressions),
        cvr: calcCVR(sales, ad.linkClicks),
        sales,
        ticketMedio: calcTicketMedio(revenue, sales),
      };
    });

    // Sort by spend descending by default
    rows.sort((a, b) => b.spend - a.spend);

    const total = rows.length;
    const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

    const response: PaginatedResponse<TableRow> = {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[dashboard/table] Error:", err);
    return NextResponse.json({ error: "Failed to fetch table data" }, { status: 500 });
  }
}
