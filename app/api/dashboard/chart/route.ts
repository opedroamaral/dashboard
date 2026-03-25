import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseLocalDate, startOfDay, endOfDay, getDateRange, formatDate, fillMissingDates } from "@/lib/date";
import type { ChartDataPoint } from "@/types/dashboard";

export const dynamic = 'force-dynamic'

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
    type AdsChartRow = { date: string; spend: number };
    type SalesChartRow = { date: string; revenue: number };

    const [adsRaw, salesRaw] = await Promise.all([
      prisma.$queryRaw<AdsChartRow[]>`
        SELECT
          TO_CHAR(date, 'YYYY-MM-DD') as date,
          SUM(spend)::float as spend
        FROM "FacebookAd"
        WHERE date >= ${startDate} AND date <= ${endDate}
        GROUP BY date
        ORDER BY date ASC
      `,
      prisma.$queryRaw<SalesChartRow[]>`
        SELECT
          TO_CHAR(DATE("transactionDate"), 'YYYY-MM-DD') as date,
          SUM("totalSaleValue")::float as revenue
        FROM "Sale"
        WHERE status IN ('approved', 'complete')
          AND "transactionDate" >= ${startDate} AND "transactionDate" <= ${endDate}
        GROUP BY DATE("transactionDate")
        ORDER BY date ASC
      `,
    ]);

    const spendMap = new Map(adsRaw.map((r: AdsChartRow) => [r.date, r.spend]));
    const revenueMap = new Map(salesRaw.map((r: SalesChartRow) => [r.date, r.revenue]));

    const allDates: ChartDataPoint[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      const key = formatDate(current);
      const spend = (spendMap.get(key) as number | undefined) ?? 0;
      const revenue = (revenueMap.get(key) as number | undefined) ?? 0;
      allDates.push({ date: key, spend, revenue, profit: revenue - spend });
      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json(allDates);
  } catch (err) {
    console.error("[dashboard/chart] Error:", err);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
