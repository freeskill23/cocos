export function getTodaysPurchaseCount(total: number): number {
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  const ratio = Math.min(hours / 24, 1);
  return Math.min(Math.round(total * ratio), total);
}
