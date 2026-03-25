import { cn } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, string> = {
  approved: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  complete: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  refunded: "bg-red-500/20 text-red-400 border border-red-500/30",
  cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
  pending: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
};

export function Badge({ status, className }: BadgeProps) {
  const style = statusMap[status.toLowerCase()] ?? "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
