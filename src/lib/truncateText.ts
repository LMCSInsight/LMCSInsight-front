/** Truncate for table cells; keep full string in a `title` tooltip on the host element. */
export function truncateWithEllipsis(text: string, maxChars: number): string {
  const t = (text ?? '').trim()
  if (maxChars < 4) return t.length > maxChars ? `${t.slice(0, maxChars)}…` : t
  if (t.length <= maxChars) return t
  return `${t.slice(0, maxChars - 1)}…`
}
