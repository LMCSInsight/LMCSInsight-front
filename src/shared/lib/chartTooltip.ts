export function valueOnlyTooltipFormatter(value: unknown): [string, string] {
  return [String(value ?? ''), '']
}
