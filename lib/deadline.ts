/** 省赛提交截止时间（组委会 2026-10-18 刷新核对）。 */
export const SUBMISSION_DEADLINE = new Date("2026-11-18T23:59:59+08:00");

/** 距离截止还剩多少天（向上取整，最少 0）。 */
export function daysLeft(now: Date = new Date()): number {
  const ms = SUBMISSION_DEADLINE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** 按当前时段返回问候语。 */
export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 6) return "夜深了";
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}
