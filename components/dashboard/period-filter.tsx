"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Period, DateRange } from "@/lib/date";
import { getDateRange, parseLocalDate, startOfDay, endOfDay } from "@/lib/date";

interface PeriodFilterProps {
  onChange: (range: DateRange) => void;
  defaultPeriod?: Period;
}

const PERIODS: { label: string; value: Period }[] = [
  { label: "Hoje", value: "today" },
  { label: "Ontem", value: "yesterday" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Personalizado", value: "custom" },
];

export function PeriodFilter({ onChange, defaultPeriod = "7d" }: PeriodFilterProps) {
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  function handlePeriodChange(p: Period) {
    setPeriod(p);
    if (p !== "custom") {
      onChange(getDateRange(p));
    }
  }

  function handleCustomApply() {
    if (!customStart || !customEnd) return;
    onChange({
      startDate: startOfDay(parseLocalDate(customStart)),
      endDate: endOfDay(parseLocalDate(customEnd)),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-slate-700 overflow-hidden">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
            className={cn(
              "px-3 py-1.5 text-sm transition-colors",
              period === p.value
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-slate-500 text-sm">até</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleCustomApply}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
