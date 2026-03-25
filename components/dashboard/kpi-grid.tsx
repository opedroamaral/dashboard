import { KpiCard } from "./kpi-card";
import type { KPIMetrics } from "@/types/dashboard";

interface KpiGridProps {
  metrics?: KPIMetrics;
  loading?: boolean;
}

export function KpiGrid({ metrics, loading = false }: KpiGridProps) {
  const m = metrics ?? {
    totalSpend: 0,
    totalRevenue: 0,
    netProfit: 0,
    roas: 0,
    totalSales: 0,
    avgCPA: 0,
    roi: 0,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <KpiCard label="Gasto Total" value={m.totalSpend} format="currency" loading={loading} />
      <KpiCard label="Receita Total" value={m.totalRevenue} format="currency" loading={loading} />
      <KpiCard
        label="Lucro Líquido"
        value={m.netProfit}
        format="currency"
        loading={loading}
        positive={m.netProfit >= 0}
      />
      <KpiCard
        label="ROAS"
        value={m.roas}
        format="multiplier"
        loading={loading}
        positive={m.roas >= 1}
      />
      <KpiCard label="Vendas" value={m.totalSales} format="number" loading={loading} />
      <KpiCard label="CPA Médio" value={m.avgCPA} format="currency" loading={loading} />
    </div>
  );
}
