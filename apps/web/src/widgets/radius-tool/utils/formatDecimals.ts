export function formatDecimals(value: number): number {
  let val = value as number;
  /**
   * 25 % 1 = 0
   * 25.3 % 1 = 0.3
   */
  const numOfDecimal = val % 1 === 0 ? 0 : 1;
  return Number(val.toFixed(numOfDecimal));
}
