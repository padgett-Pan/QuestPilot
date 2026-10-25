/**
 * QuestPilot 后台 Worker 入口（部署骨架）。
 *
 * 当前实现只做启动自检与心跳，不领取任何任务。真实媒体流水线需要在此补齐：
 *   1. 从数据库原子领取 QUEUED 任务（SELECT ... FOR UPDATE SKIP LOCKED）
 *   2. FFmpeg 探测 / 抽取音轨 / 关键帧
 *   3. 调用转写与视觉模型
 *   4. 回写结构化结果、进度、失败重试与临时文件清理
 */
import { setTimeout as wait } from "node:timers/promises";

const REQUIRED = ["DATABASE_URL"];

function selfCheck() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`[worker] 缺少环境变量：${missing.join(", ")}，当前仅运行骨架心跳。`);
  }
}

async function main() {
  selfCheck();
  console.log("[worker] QuestPilot worker started (skeleton mode, no job consumption).");
  let beats = 0;
  for (;;) {
    await wait(3000);
    beats += 1;
    if (process.env.NODE_ENV !== "production") {
      console.log(`[worker] heartbeat #${beats} at ${new Date().toISOString()}`);
    }
  }
}

main().catch((error) => {
  console.error("[worker] fatal:", error);
  process.exit(1);
});
