/** Splits 100% across `n` supervisors (integers, sum = 100). */
export function splitContribPercent(n: number): number[] {
  if (n <= 0) return []
  const base = Math.floor(100 / n)
  const rem = 100 - base * n
  return Array.from({ length: n }, (_, i) => (i < rem ? base + 1 : base))
}
