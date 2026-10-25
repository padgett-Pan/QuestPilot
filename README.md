# QuestPilot · 竞途智策

QuestPilot 面向高校竞赛团队，把目标、计划、资料、作品反馈和教师意见组织在同一工作区，帮助团队找到可执行的下一步。

**参赛信息：** 2026 第九届传智杯全国大学生数智创新与 AI 应用大赛 · AI WEB 网页开发挑战赛 · 团队 SIHP（编号 41026）· C 组 · 黑龙江职业学院第二校区 · 成员：潘庆涛（队长）、李嘉鹏、付松洋 · 指导教师：冯玉雷、张兴华

## 当前版本

本仓库提供可本地运行的 Next.js Web 应用和可复现演示流程。业务数据存储在本地 `data/runtime-store.json`。

**已实现且可验证：**

| 能力 | 实现方式 |
|---|---|
| 页面访问控制 | `proxy.ts` 拦截工作区路由；`/dashboard` 在服务端二次校验 session |
| 账号体系 | scrypt + 每用户随机盐、常量时间比较、7 天有效期的服务端 session |
| AI 计划生成 | OpenAI 兼容 Chat Completions + Zod schema 校验；失败按 `fallback-schema` / `fallback-error` / `demo` 如实标注来源 |
| 资料检索 | 段落级切块 + TF-IDF 加权 + 余弦相似度，返回命中片段、相似度分数与字符区间；配置模型后可基于片段作答 |
| 证据驱动评审 | 分数由任务进度、资料片段、媒体任务、团队反馈计算，或由模型按维度打分，每个分数带证据说明 |
| 媒体任务 | 文件真实写入 `uploads/`，任务状态 QUEUED → PROCESSING → COMPLETED/FAILED |

**尚未接入（不要描述为已完成）：**

- PostgreSQL / Prisma 实际读写（schema 与 seed 已提供，Web 运行链路仍走 JSON store）
- MinIO 对象存储、SMTP 邮件、邮箱验证
- PDF / 网页正文解析（链接只记录条目）
- FFmpeg 抽帧、语音转写、视觉模型（媒体分析返回标注为样例的建议，不产出转写文本）
- 数据库级 session 与成员加入流程（账号已按工作区隔离，session 仍存本地 JSON）

实现状态与限制的完整说明见 [`docs/competition-technical-doc.md`](docs/competition-technical-doc.md)。

## 本地运行

环境：Windows 10/11、Node.js 22、pnpm 10+。

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

打开 `http://localhost:3000`。

本地演示账号：

- 学生：`student@questpilot.local` / `demo-student-password`
- 指导教师：`teacher@questpilot.local` / `demo-teacher-password`

账号只用于本地演示。新注册账号会拿到独立工作区（只带一份评分标准摘要作为起步资料），两个账号互相看不到对方的数据；仍不要放入真实个人资料。

## 可选：接入文本模型

将值写入本地 `.env.local`，不要提交密钥：

```env
AI_BASE_URL=
AI_API_KEY=
AI_TEXT_MODEL=
```

三个变量同时填写才会启用真实模型；任一为空则使用本地可复现结果，界面会显示"演示模式"。

模型接通后，受影响的功能有：计划生成、资料问答（基于检索片段的作答）、作品评审打分。**转写与视觉分析仍未接通**，`AI_VISION_MODEL` / `AI_TRANSCRIBE_MODEL` 只是部署目标预留项，代码当前不读取。

## 检查命令

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm test` 运行 `tests/` 下的 17 个用例（检索排序、评分加权、密码哈希、工作区隔离、模型状态），基于 `node --test` 与 `tsx`，无需额外测试框架。

`pnpm lint` 使用 `eslint-config-next`（core-web-vitals + typescript）并开启未使用变量检查，不是空跑配置。

## 比赛材料

- [`docs/competition-technical-doc.pdf`](docs/competition-technical-doc.pdf)：省赛技术文档，22 页（封面 + 目录页码 + 每页页脚 + 6 张界面截图），少于 30 页。
- [`docs/competition-technical-doc.md`](docs/competition-technical-doc.md)：技术文档可编辑源稿。**修改源稿后必须重新导出 PDF。**
- [`docs/demo-script.md`](docs/demo-script.md)：5–8 分钟普通话视频演示稿与录制检查表。
- [`docs/architecture.md`](docs/architecture.md)：运行架构和能力边界。
- [`docs/acceptance-checklist.md`](docs/acceptance-checklist.md)：提交前验收清单。

官方赛道要求以 [2026 AI WEB 网页开发挑战赛详情页](https://www.boxuegu.com/matchTrack/detail/?id=10037) 和组委会最终通知为准。当前官方页面列出的省赛作品提交截止为 2026-11-18；学校可能设置更早的校内截止。

## 安全

`.env.local`、`data/`、`uploads/` 和临时文件均不应加入代码提交或比赛压缩包。公开部署前须完成数据库持久化、团队权限隔离、真实模型配置、HTTPS 与生产级 session 管理。

打包比赛材料时请排除 `node_modules/`、`.next/`、`data/`、`uploads/` 与 `*.tsbuildinfo`，`docs/submission-manifest.md` 列出了应该包含的清单。
