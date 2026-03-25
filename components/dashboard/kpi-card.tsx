import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber, formatPercent, formatMultiplier } from "@/lib/utils";

type Format = "currency" | "percentage" | "multiplier" | "number";

interface KpiCardProps {
  label: string;
  value: number;
  format?: Format;
  loading?: boolean;
  positive?: boolean; // override color
}

function formatValue(value: number, format: Format): string {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percentage":
      return formatPercent(value);
    case "multiplier":
      return formatMultiplier(value);
    default:
      return formatNumber(value);
  }
}

export function KpiCard({
  label,
  value,
  format = "currency",
  loading = false,
  positive,
}: KpiCardProps) {
  const isPositive = positive ?? value >= 0;

  return (
    <Card>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-8 w-32" />
      ) : (
        <p
          className={`text-2xl font-bold ${
            format === "currency" || format === "number"
              ? "text-slate-100"
              : isPositive
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {formatValue(value, format)}
        </p>
      )}
    </Card>
  );
}
