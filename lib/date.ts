export type Period = "today" | "yesterday" | "7d" | "30d" | "custom";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function getDateRange(period: Period): DateRange {
  const now = new Date();
  const today = startOfDay(now);

  switch (period) {
    case "today":
      return { startDate: today, endDate: endOfDay(now) };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: yesterday, endDate: endOfDay(yesterday) };
    }
    case "7d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { startDate: start, endDate: endOfDay(now) };
    }
    case "30d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { startDate: start, endDate: endOfDay(now) };
    }
    default:
      return { startDate: today, endDate: endOfDay(now) };
  }
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function parseLocalDate(s: string): Date {
  const [year, month, day] = s.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d;
}

export function fillMissingDates<T extends { date: string }>(
  data: T[],
  startDate: Date,
  endDate: Date,
  defaultValues: Omit<T, "date">
): T[] {
  const map = new Map(data.map((d) => [d.date, d]));
  const result: T[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const key = formatDate(current);
    result.push(map.get(key) ?? ({ date: key, ...defaultValues } as T));
    current.setDate(current.getDate() + 1);
  }

  return result;
}
