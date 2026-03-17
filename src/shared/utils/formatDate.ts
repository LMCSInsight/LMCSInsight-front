export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  const d = typeof date === "object" && "getTime" in date ? date : new Date(date);
  return d.toLocaleDateString(undefined, options);
}

export function formatDateTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  const d = typeof date === "object" && "getTime" in date ? date : new Date(date);
  return d.toLocaleDateString(undefined, options);
}
