export type CollectionPeriod = "day" | "week" | "month";

export function currentIsoWeek(): string {
  const date = new Date();
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const year = thursday.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const week =
    1 +
    Math.round(
      ((thursday.getTime() - jan4.getTime()) / 86400000 -
        3 +
        ((jan4.getDay() + 6) % 7)) /
        7,
    );
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoWeekRange(isoWeek: string): { from: string; to: string } {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeek);
  if (!match) {
    const today = todayDate();
    return { from: today, to: today };
  }
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = (jan4.getDay() + 6) % 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  };
}

export function monthRange(month: string): { from: string; to: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) {
    const today = todayDate();
    return { from: today, to: today };
  }
  const year = Number(match[1]);
  const mon = Number(match[2]) - 1;
  const from = new Date(year, mon, 1);
  const to = new Date(year, mon + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function formatCollectionPeriodLabel(
  period: CollectionPeriod,
  value: string,
): string {
  if (period === "day") {
    return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  if (period === "week") {
    const { from, to } = isoWeekRange(value);
    const fromLabel = new Date(`${from}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    const toLabel = new Date(`${to}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${fromLabel} – ${toLabel}`;
  }
  const [year, mon] = value.split("-");
  const monthDate = new Date(Number(year), Number(mon) - 1, 1);
  return monthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
