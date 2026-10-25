import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type RuntimeUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "STUDENT" | "TEACHER";
  verified: boolean;
};

export type RuntimeTask = {
  id: string;
  title: string;
  description: string;
  phase: string;
  owner: string;
  priority: string;
  status: string;
  progress: number;
  dueDate?: string;
};

export type RuntimePlan = {
  id: string;
  title: string;
  summary: string;
  goal: string;
  source?: string;
  tasks: RuntimeTask[];
  risks: string[];
  updatedAt: string;
};

export type RuntimeDocument = {
  id: string;
  title: string;
  sourceType: string;
  content: string;
  citations: number;
  createdAt: string;
};

export type RuntimeMedia = {
  id: string;
  name: string;
  kind: "AUDIO" | "VIDEO";
  size: number;
  storageKey?: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  result?: Record<string, unknown>;
  createdAt: string;
};

export type RuntimeReview = {
  id: string;
  score: number;
  summary: string;
  dimensions: { label: string; score: number; evidence?: string }[];
  actions: string[];
  evidence?: { label: string; value: string }[];
  source?: string;
  comments: { id: string; author: string; body: string; createdAt: string }[];
  createdAt: string;
};

export type RuntimeSession = { userId: string; expiresAt: string };

type RuntimeState = {
  users: RuntimeUser[];
  sessions: Record<string, RuntimeSession | string>;
  plans: RuntimePlan[];
  documents: RuntimeDocument[];
  media: RuntimeMedia[];
  reviews: RuntimeReview[];
  team: {
    id: string;
    name: string;
    members: { id: string; name: string; role: string; email: string }[];
    invitations: { email: string; status: string; createdAt: string }[];
  };
};

const dataPath = path.join(process.cwd(), "data", "runtime-store.json");
const globalForStore = globalThis as unknown as { questpilotStore?: RuntimeState };

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SCRYPT_KEYLEN = 64;

function now() {
  return new Date().toISOString();
}
function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

/**
 * 密码哈希：scrypt + 每用户独立随机盐，输出 `scrypt$<salt-hex>$<hash-hex>`。
 * 早期版本使用固定盐的 64 字节 hex，verifyPassword 仍兼容，便于演示数据迁移。
 */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("scrypt$")) {
    const [, saltHex, hashHex] = stored.split("$");
    if (!saltHex || !hashHex) return false;
    const derived = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), SCRYPT_KEYLEN);
    const expected = Buffer.from(hashHex, "hex");
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
  }
  // 兼容旧格式（固定盐、无算法前缀）
  const legacy = crypto.scryptSync(password, "questpilot-local-salt", SCRYPT_KEYLEN);
  const expected = Buffer.from(stored, "hex");
  return legacy.length === expected.length && crypto.timingSafeEqual(legacy, expected);
}

function seed(): RuntimeState {
  return {
    users: [
      {
        id: "user_student",
        email: "student@questpilot.local",
        name: "陈同学",
        passwordHash: hashPassword("demo-student-password"),
        role: "STUDENT",
        verified: true,
      },
      {
        id: "user_teacher",
        email: "teacher@questpilot.local",
        name: "林老师",
        passwordHash: hashPassword("demo-teacher-password"),
        role: "TEACHER",
        verified: true,
      },
    ],
    sessions: {},
    plans: [
      {
        id: "plan_demo",
        title: "QuestPilot 首轮冲刺计划",
        summary: "用四个阶段完成从选题到评审可用版本的推进。",
        goal: "完成 AI Web 竞赛作品",
        source: "demo",
        risks: ["真实模型需要结构化校验", "视频处理需要 FFmpeg", "API 密钥不能进入仓库"],
        updatedAt: now(),
        tasks: [
          {
            id: "task_1",
            title: "明确真实用户与核心场景",
            description: "完成学生和指导教师的备赛流程假设。",
            phase: "01 发现问题",
            owner: "陈同学",
            priority: "HIGH",
            status: "DONE",
            progress: 100,
          },
          {
            id: "task_2",
            title: "完成 AI 技术路线设计",
            description: "确定 Agent、RAG、媒体评审和兜底方案。",
            phase: "02 建立方案",
            owner: "林老师",
            priority: "HIGH",
            status: "IN_PROGRESS",
            progress: 64,
          },
          {
            id: "task_3",
            title: "搭建可演示的计划画布",
            description: "实现任务状态、负责人和截止日期。",
            phase: "03 做出闭环",
            owner: "陈同学",
            priority: "HIGH",
            status: "TODO",
            progress: 18,
          },
          {
            id: "task_4",
            title: "录制评审流程素材",
            description: "准备 5–8 分钟讲解结构和关键演示场景。",
            phase: "04 打磨交付",
            owner: "陈同学",
            priority: "MEDIUM",
            status: "TODO",
            progress: 0,
          },
        ],
      },
    ],
    documents: [
      {
        id: "doc_demo",
        title: "传智杯 AI WEB 评分标准摘要",
        sourceType: "official",
        content:
          "AI 技术深度占 35%，创新性占 25%。作品必须原创、以 Web 应用呈现，并体现 AI 的深度应用。省赛提交包含代码仓库、5–8 分钟视频和 30 页以内技术文档。",
        citations: 1,
        createdAt: now(),
      },
    ],
    media: [],
    reviews: [
      {
        id: "review_demo",
        score: 78,
        summary: "方向清晰，AI 闭环具备展示潜力；下一步需要补充证据链、媒体评审和演示脚本。",
        source: "demo",
        dimensions: [
          { label: "AI 技术深度", score: 82 },
          { label: "创新性", score: 78 },
          { label: "前端工程质量", score: 76 },
          { label: "实用性", score: 75 },
          { label: "用户体验", score: 80 },
          { label: "社会价值与商业潜力", score: 72 },
        ],
        actions: ["补充 RAG 引用证据", "让教师批注进入任务闭环", "准备一份可复现的媒体样例"],
        comments: [
          {
            id: "comment_demo",
            author: "林老师",
            body: "建议把 AI 给出的每个结论都绑定到任务或评分维度。",
            createdAt: now(),
          },
        ],
        createdAt: now(),
      },
    ],
    team: {
      id: "team_demo",
      name: "QuestPilot 竞赛先锋队",
      members: [
        { id: "user_teacher", name: "林老师", role: "指导教师", email: "teacher@questpilot.local" },
        { id: "user_student", name: "陈同学", role: "产品与前端", email: "student@questpilot.local" },
        { id: "user_student_2", name: "周同学", role: "AI 与数据", email: "student2@questpilot.local" },
      ],
      invitations: [],
    },
  };
}

function load(): RuntimeState {
  if (globalForStore.questpilotStore) return globalForStore.questpilotStore;
  try {
    if (fs.existsSync(dataPath)) {
      globalForStore.questpilotStore = JSON.parse(fs.readFileSync(dataPath, "utf8")) as RuntimeState;
    }
  } catch {
    // 文件损坏时回落到种子数据，避免整站 500
  }
  globalForStore.questpilotStore ??= seed();
  return globalForStore.questpilotStore;
}

export function getStore() {
  return load();
}

export function saveStore() {
  const state = load();
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(state, null, 2), "utf8");
  return state;
}

export function createId(prefix: string) {
  return id(prefix);
}

export function passwordHash(password: string) {
  return hashPassword(password);
}

export function createSession(userId: string): string {
  const token = id("session");
  const state = load();
  state.sessions[token] = { userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() };
  saveStore();
  return token;
}

/** 读取 session 并校验过期时间；过期条目会被顺手清理。 */
export function getUserBySession(token?: string): RuntimeUser | null {
  if (!token) return null;
  const state = load();
  const entry = state.sessions[token];
  if (!entry) return null;

  const userId = typeof entry === "string" ? entry : entry.userId;
  const expiresAt = typeof entry === "string" ? null : entry.expiresAt;

  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    delete state.sessions[token];
    saveStore();
    return null;
  }

  return state.users.find((user) => user.id === userId) ?? null;
}

export function destroySession(token?: string) {
  if (!token) return;
  const state = load();
  if (state.sessions[token]) {
    delete state.sessions[token];
    saveStore();
  }
}

/** 邮箱统一按小写存储，避免 A@x.com / a@x.com 重复注册。 */
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
