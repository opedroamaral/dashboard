"use client";

import { useState, useEffect, useCallback } from "react";
import { PeriodFilter } from "./period-filter";
import { KpiGrid } from "./kpi-grid";
import { RevenueChart } from "./revenue-chart";
import { DataTable } from "./data-table";
import { SyncButton } from "./sync-button";
import { getDateRange, formatDate } from "@/lib/date";
import type { KPIMetrics, ChartDataPoint, PaginatedResponse, TableRow } from "@/types/dashboard";

export function DashboardClient() {
  const defaultRange = getDateRange("7d");
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [page, setPage] = useState(1);

  const [metrics, setMetrics] = useState<KPIMetrics | undefined>();
  const [chartData, setChartData] = useState<ChartDataPoint[] | undefined>();
  const [tableData, setTableData] = useState<PaginatedResponse<TableRow> | undefined>();

  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  const fetchData = useCallback(
    async (start: Date, end: Date, p: number) => {
      const params = new URLSearchParams({
        startDate: formatDate(start),
        endDate: formatDate(end),
        page: String(p),
      });

      setLoadingMetrics(true);
      setLoadingChart(true);
      setLoadingTable(true);

      fetch(`/api/dashboard/metrics?${params}`)
        .then((r) => r.json())
        .then(setMetrics)
        .finally(() => setLoadingMetrics(false));

      fetch(`/api/dashboard/chart?${params}`)
        .then((r) => r.json())
        .then(setChartData)
        .finally(() => setLoadingChart(false));

      fetch(`/api/dashboard/table?${params}`)
        .then((r) => r.json())
        .then(setTableData)
        .finally(() => setLoadingTable(false));
    },
    []
  );

  useEffect(() => {
    fetchData(startDate, endDate, page);
  }, [startDate, endDate, page, fetchData]);

  function handlePeriodChange({ startDate: s, endDate: e }: { startDate: Date; endDate: Date }) {
    setStartDate(s);
    setEndDate(e);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-slate-100">AdMetrics</h1>
          </div>
          <div className="flex items-center gap-4">
            <PeriodFilter onChange={handlePeriodChange} defaultPeriod="7d" />
            <SyncButton />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        <KpiGrid metrics={metrics} loading={loadingMetrics} />
        <RevenueChart data={chartData} loading={loadingChart} />
        <DataTable
          data={tableData}
          loading={loadingTable}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
}
