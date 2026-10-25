# QuestPilot 架构说明

## 当前运行架构

```text
浏览器 → Next.js App Router → Route Handlers → 本地运行时 JSON
                         │         └→ 检索层（切块 + TF-IDF 余弦）
                         └→ AI 文本适配器（可选）→ fallback + 来源标记
```

- Next.js 16 App Router 承载 Server Components、Client Components 和 Route Handlers。
- `proxy.ts` 对八个工作区路由做 cookie 存在性快速检查（Edge 运行时无法读文件）；`/dashboard` 在服务端用 `getCurrentUser()` 做真实 session 校验，业务 API 通过 `lib/api-auth.ts` 的 `requireApiUser()` 校验。
- `lib/ai.ts` 对计划生成提供 OpenAI 兼容文本请求（45s 超时）与 Zod 输出校验；失败时回退结构化演示计划，并返回 `live / fallback-schema / fallback-error / demo` 来源标记，前端如实显示。
- `lib/retrieval.ts` 负责资料切块与词法检索：段落优先切块（320 字滑动、60 字重叠）→ 中文二元组 / 英文整词切分 → TF-IDF 加权 → 余弦相似度 → top-k 命中片段，附相似度分数与字符区间。
- `lib/review.ts` 把项目状态压成事实清单，据此计算或由模型评审六个维度，每个分数附证据。
- `lib/runtime-store.ts` 使用 `data/runtime-store.json` 保存演示用户、session、计划、资料条目、媒体任务、评审和团队。密码为 scrypt + 每用户随机盐；session 带 `expiresAt`。

## 部署目标配置（当前未完成端到端接入）

```text
Next.js → PostgreSQL + Prisma
       → MinIO 文件存储
       → Worker → FFmpeg / 转写模型 / 视觉模型
```

仓库含 PostgreSQL + pgvector、MinIO、Prisma schema 和 Worker 启动配置，但当前应用仍使用本地 JSON store。Worker 入口（`worker/index.mjs`）只做启动自检与心跳，没有领取任务或媒体处理逻辑。运行 `docker compose up -d` 只能启动基础设施，不表示 Web 应用已经迁移到这些服务。

## AI 能力边界

| 能力 | 当前实现 |
|---|---|
| 计划生成 | 可调用配置的 OpenAI 兼容文本模型，输出经 Zod 校验；失败回退并标注来源 |
| AI 教练流 | 文本模型可配置；本地模式返回固定建议 |
| 知识库 | TXT/Markdown 切块存储 + 片段级词法检索（TF-IDF / 余弦）；网页链接仅记录条目；未接 embedding 与向量库 |
| 作品评审 | 由任务进度、资料片段、媒体任务、团队反馈计算，或由模型按维度打分；每项附证据 |
| 音视频评审 | 上传规格校验、文件落盘到 `uploads/`、任务状态流转；未接转写/抽帧/视觉推理，结果显式标记 `isSample` |
| Embedding | 未实现。检索为词法方案，不能与 embedding 语义召回混称 |

## 认证与安全边界

- HTTP-only、SameSite=Lax Cookie，生产模式启用 Secure；服务端 session 记录 `expiresAt`（7 天），到期自动失效，退出登录同时删除服务端 token。
- 密码使用 scrypt + 每用户随机盐，比较使用 `crypto.timingSafeEqual`；登录时对不存在的账号也执行一次等价开销的哈希，避免通过响应时间枚举账号。
- 工作区页面做快速登录跳转；受保护业务 API 独立校验有效本地 session。
- 团队改名已限制为教师角色；注册邮箱统一小写存储，避免重复注册。
- 当前只实现单机演示 session；没有数据库 session、邮箱验证、真实邀请邮件或跨团队数据隔离。
- `.env.local`、`data/`、`uploads/` 不纳入 Git；提交模板只放占位值，并区分「已接通」与「部署目标预留」两段。

## 当前已知限制

本地 JSON store 不适合多实例部署，存在并发覆盖风险；共享 demo team 不是多租户权限模型；Worker 与 PostgreSQL/MinIO 未完成集成；词法检索对同义改写不敏感，缺少 embedding 召回与重排。公开部署前先完成数据库、权限隔离、语义检索、媒体流水线和生产会话改造。
