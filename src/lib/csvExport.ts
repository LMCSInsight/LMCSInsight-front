/** Excel-friendly CSV (UTF-8 BOM, semicolon separator). */
export function buildCsv(
  headers: string[],
  rows: string[][],
  separator = ',',
): string {
  const esc = (cell: string) => {
    const s = String(cell ?? '')
    if (s.includes('"') || s.includes('\n') || s.includes(separator)) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const lines = [
    headers.map(esc).join(separator),
    ...rows.map((r) => r.map(esc).join(separator)),
  ]
  return `\uFEFF${lines.join('\n')}`
}
