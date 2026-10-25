// Database-only seed script. It requires a generated Prisma Client.
// @ts-nocheck
import { PrismaClient, Role, MembershipRole, JobStatus } from "@prisma/client";

const prisma = new PrismaClient();

const rubric = [
  { name: "AI 技术深度", weight: 35, color: "#2563eb" },
  { name: "创新性", weight: 25, color: "#7c3aed" },
  { name: "前端工程质量", weight: 10, color: "#0891b2" },
  { name: "实用性", weight: 10, color: "#0d9488" },
  { name: "用户体验", weight: 10, color: "#f59e0b" },
  { name: "社会价值与商业潜力", weight: 10, color: "#db2777" },
];

async function main() {
  const competition = await prisma.competition.upsert({
    where: { id: "competition-2026-questpilot" },
    update: { rubric },
    create: {
      id: "competition-2026-questpilot",
      name: "2026 第九届传智杯全国大学生数智创新与 AI 应用大赛",
      season: "2026",
      description: "AI WEB 网页开发挑战赛",
      rubric,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@questpilot.local" },
    update: {},
    create: {
      email: "teacher@questpilot.local",
      passwordHash: "demo-teacher-password",
      name: "林老师",
      role: Role.TEACHER,
      emailVerifiedAt: new Date(),
    },
  });
  const student = await prisma.user.upsert({
    where: { email: "student@questpilot.local" },
    update: {},
    create: {
      email: "student@questpilot.local",
      passwordHash: "demo-student-password",
      name: "陈同学",
      role: Role.STUDENT,
      emailVerifiedAt: new Date(),
    },
  });

  const team = await prisma.team.upsert({
    where: { id: "team-questpilot-demo" },
    update: {},
    create: {
      id: "team-questpilot-demo",
      name: "QuestPilot 竞赛先锋队",
      description: "面向 AI Web 挑战赛的三人示范团队",
    },
  });
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: teacher.id } },
    update: { role: MembershipRole.TEACHER },
    create: { teamId: team.id, userId: teacher.id, role: MembershipRole.TEACHER },
  });
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: student.id } },
    update: { role: MembershipRole.STUDENT },
    create: { teamId: team.id, userId: student.id, role: MembershipRole.STUDENT },
  });

  const goal = await prisma.goal.upsert({
    where: { id: "goal-questpilot-demo" },
    update: {},
    create: {
      id: "goal-questpilot-demo",
      title: "在省赛截止前完成可演示的 AI 原生 Web 应用",
      brief: "围绕真实学生备赛场景，完成选题、AI 技术闭环、团队协作与演示材料。",
      skills: ["React", "AI Agent", "RAG", "产品设计"],
      availability: { hoursPerWeek: 18, deadline: "2026-11-18" },
      userId: student.id,
      teamId: team.id,
      competitionId: competition.id,
    },
  });

  const plan = await prisma.plan.upsert({
    where: { id: "plan-questpilot-demo" },
    update: {},
    create: {
      id: "plan-questpilot-demo",
      title: "QuestPilot 首轮冲刺计划",
      summary: "用四个阶段完成从选题到评审可用版本的推进。",
      goalId: goal.id,
      teamId: team.id,
      generatedBy: "demo",
    },
  });

  const tasks = [
    ["明确真实用户与核心场景", "完成访谈假设、场景边界和成功指标。", "01 发现问题", "陈同学", "DONE", "HIGH"],
    ["完成 AI 技术路线设计", "确定 Agent、RAG、媒体评审与兜底方案。", "02 建立方案", "林老师", "IN_PROGRESS", "HIGH"],
    ["搭建可演示的计划画布", "让目标、阶段、任务和责任人形成可编辑闭环。", "03 做出闭环", "陈同学", "TODO", "HIGH"],
    ["录制评审流程素材", "准备 5—8 分钟讲解结构和关键演示场景。", "04 打磨交付", "陈同学", "TODO", "MEDIUM"],
  ];
  for (const [title, description, phase, owner, status, priority] of tasks) {
    const exists = await prisma.planTask.findFirst({ where: { planId: plan.id, title } });
    if (!exists) await prisma.planTask.create({ data: { planId: plan.id, title, description, phase, owner, status, priority } });
  }

  const document = await prisma.knowledgeDocument.upsert({
    where: { id: "doc-competition-rubric" },
    update: {},
    create: {
      id: "doc-competition-rubric",
      title: "传智杯 AI WEB 评分标准摘要",
      sourceType: "official",
      mimeType: "text/markdown",
      content: "AI 技术深度占 35%，创新性占 25%。作品必须原创、以 Web 应用呈现，并体现 AI 的深度应用。省赛提交包含代码仓库、5—8 分钟视频和 30 页以内技术文档。",
      teamId: team.id,
      status: JobStatus.COMPLETED,
    },
  });
  const chunks = await prisma.knowledgeChunk.count({ where: { documentId: document.id } });
  if (chunks === 0) {
    await prisma.knowledgeChunk.create({ data: { documentId: document.id, content: document.content, index: 0 } });
  }

  const review = await prisma.aIReview.upsert({
    where: { id: "review-questpilot-demo" },
    update: {},
    create: {
      id: "review-questpilot-demo",
      title: "首轮方案 AI 评审",
      summary: "方向清晰，AI 闭环具备展示潜力；下一步需要补充证据链、媒体评审和演示脚本。",
      score: 78,
      teamId: team.id,
      dimensions: rubric.map((r) => ({ ...r, score: r.name === "AI 技术深度" ? 82 : r.name === "创新性" ? 78 : 76 })),
      actions: ["补充 RAG 引用证据", "把教师批注纳入任务闭环", "为音视频评审准备一份可复现样例"],
    },
  });

  await prisma.comment.upsert({
    where: { id: "comment-questpilot-demo" },
    update: {},
    create: { id: "comment-questpilot-demo", body: "建议把 AI 给出的每个结论都绑定到任务或评分维度，方便答辩时展示。", userId: teacher.id, teamId: team.id, reviewId: review.id },
  });

  console.log(`Seeded ${competition.name} with ${team.name}`);
}

main().finally(() => prisma.$disconnect());
