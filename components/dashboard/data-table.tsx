"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatMultiplier,
} from "@/lib/utils";
import type { TableRow, PaginatedResponse } from "@/types/dashboard";

interface DataTableProps {
  data?: PaginatedResponse<TableRow>;
  loading?: boolean;
  onPageChange?: (page: number) => void;
}

const columnHelper = createColumnHelper<TableRow>();

const columns = [
  columnHelper.accessor("adName", {
    header: "Anúncio",
    cell: (info) => (
      <div>
        <p className="text-slate-200 text-sm font-medium truncate max-w-[200px]">
          {info.getValue()}
        </p>
        <p className="text-slate-500 text-xs truncate max-w-[200px]">
          {info.row.original.campaignName}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("spend", {
    header: "Gasto",
    cell: (info) => (
      <span className="text-slate-200 text-sm">{formatCurrency(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("revenue", {
    header: "Receita",
    cell: (info) => (
      <span className="text-emerald-400 text-sm">{formatCurrency(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("profit", {
    header: "Lucro",
    cell: (info) => (
      <span
        className={`text-sm font-medium ${
          info.getValue() >= 0 ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {formatCurrency(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("roas", {
    header: "ROAS",
    cell: (info) => (
      <span
        className={`text-sm font-medium ${
          info.getValue() >= 1 ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {formatMultiplier(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("cpa", {
    header: "CPA",
    cell: (info) => (
      <span className="text-slate-300 text-sm">{formatCurrency(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("ctr", {
    header: "CTR",
    cell: (info) => (
      <span className="text-slate-300 text-sm">{formatPercent(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("cvr", {
    header: "CVR",
    cell: (info) => (
      <span className="text-slate-300 text-sm">{formatPercent(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("sales", {
    header: "Vendas",
    cell: (info) => (
      <span className="text-slate-200 text-sm font-medium">
        {formatNumber(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("impressions", {
    header: "Impressões",
    cell: (info) => (
      <span className="text-slate-400 text-sm">{formatNumber(info.getValue())}</span>
    ),
  }),
];

export function DataTable({ data, loading = false, onPageChange }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? 0,
  });

  return (
    <Card className="p-0">
      <div className="p-5 border-b border-slate-700/50">
        <h2 className="text-sm font-medium text-slate-400">
          Detalhamento por Anúncio
        </h2>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-slate-700/50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-300 whitespace-nowrap"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" && " ↑"}
                      {header.column.getIsSorted() === "desc" && " ↓"}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500 text-sm">
                    Nenhum dado encontrado para o período selecionado.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {data.total} anúncios — Página {data.page} de {data.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(data.page - 1)}
              disabled={data.page <= 1}
              className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange?.(data.page + 1)}
              disabled={data.page >= data.totalPages}
              className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
