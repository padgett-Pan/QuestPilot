export const rubric = [
  { label: "AI 技术深度", value: 35, score: 82, color: "#2563eb" },
  { label: "创新性", value: 25, score: 78, color: "#7c3aed" },
  { label: "前端工程质量", value: 10, score: 76, color: "#0891b2" },
  { label: "实用性", value: 10, score: 75, color: "#0d9488" },
  { label: "用户体验", value: 10, score: 80, color: "#f59e0b" },
  { label: "社会价值与商业潜力", value: 10, score: 72, color: "#db2777" },
];

export const tasks = [
  { title: "明确真实用户与核心场景", phase: "01 发现问题", owner: "陈同学", status: "已完成", priority: "高", progress: 100 },
  { title: "完成 AI 技术路线设计", phase: "02 建立方案", owner: "林老师", status: "进行中", priority: "高", progress: 64 },
  { title: "搭建可演示的计划画布", phase: "03 做出闭环", owner: "陈同学", status: "待开始", priority: "高", progress: 18 },
  { title: "录制评审流程素材", phase: "04 打磨交付", owner: "陈同学", status: "待开始", priority: "中", progress: 0 },
];

export const insights = [
  { label: "AI 技术深度", value: "82", trend: "+8", tone: "blue" },
  { label: "计划完成度", value: "64%", trend: "+12%", tone: "violet" },
  { label: "资料覆盖度", value: "76%", trend: "+21%", tone: "teal" },
  { label: "评审准备度", value: "3.8/5", trend: "稳定", tone: "amber" },
];

export const reviewActions = [
  { title: "补充 RAG 引用证据", detail: "将 AI 技术路线中的每个关键判断绑定到资料片段。", priority: "高", icon: "↗" },
  { title: "让教师批注进入任务闭环", detail: "批注需要生成负责人、截止日期和可追踪状态。", priority: "中", icon: "✦" },
  { title: "准备一份可复现的媒体样例", detail: "用 3 分钟演示视频验证转写、抽帧和评分输出。", priority: "中", icon: "◌" },
];
