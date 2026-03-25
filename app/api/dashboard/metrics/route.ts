import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  calcROAS,
  calcCPA,
  calcROI,
  calcNetProfit,
} from "@/lib/kpi";
import { parseLocalDate, startOfDay, endOfDay, getDateRange } from "@/lib/date";
import type { KPIMetrics } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  let startDate: Date;
  let endDate: Date;

  const startParam = searchParams.get("startDate");
  const endParam = searchParams.get("endDate");
  const period = searchParams.get("period") as "today" | "yesterday" | "7d" | "30d" | null;

  if (startParam && endParam) {
    startDate = startOfDay(parseLocalDate(startParam));
    endDate = endOfDay(parseLocalDate(endParam));
  } else {
    const range = getDateRange(period ?? "7d");
    startDate = range.startDate;
    endDate = range.endDate;
  }

  try {
    const [adsAgg, salesAgg] = await Promise.all([
      prisma.facebookAd.aggregate({
        where: { date: { gte: startDate, lte: endDate } },
        _sum: {
          spend: true,
          impressions: true,
          linkClicks: true,
          checkoutsInitiated: true,
        },
      }),
      prisma.sale.aggregate({
        where: {
          status: { in: ["approved", "complete"] },
          transactionDate: { gte: startDate, lte: endDate },
        },
        _sum: { totalSaleValue: true },
        _count: { id: true },
      }),
    ]);

    const spend = Number(adsAgg._sum.spend ?? 0);
    const revenue = Number(salesAgg._sum.totalSaleValue ?? 0);
    const sales = salesAgg._count.id;

    const metrics: KPIMetrics = {
      totalSpend: spend,
      totalRevenue: revenue,
      netProfit: calcNetProfit(revenue, spend),
      roas: calcROAS(revenue, spend),
      totalSales: sales,
      avgCPA: calcCPA(spend, sales),
      roi: calcROI(revenue, spend),
    };

    return NextResponse.json(metrics);
  } catch (err) {
    console.error("[dashboard/metrics] Error:", err);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
