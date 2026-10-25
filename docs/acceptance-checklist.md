# QuestPilot 赛项交付验收清单

更新时间：2026-10-25（Asia/Shanghai）

> 每一项都应当是**可以在交付包内被第三方复现**的动作。勾选前先实际执行一次，
> 不要把"仓库里曾经有"当成"交付包里有"。

## 官方材料映射

- [x] 技术文档源稿：`docs/competition-technical-doc.md`
- [x] PDF 技术文档：`docs/competition-technical-doc.pdf`，22 页，不超过 30 页
- [x] PDF 已按 2026-10-25 源稿重新导出：A4、封面 + 带页码的目录 + 每页页脚页码 + 6 张真实界面截图
- [x] 普通话 5–8 分钟视频稿：`docs/demo-script.md`
- [x] README、依赖清单、环境变量模板：`README.md`、`package.json`、`.env.example`
- [ ] 提交前由团队创建或指定 GitHub/Gitee 公共/评审可访问仓库
- [x] 报名信息已填入（2026-10-25）：黑龙江职业学院第二校区 · C 组 · 团队 SIHP（编号 41026）· 成员潘庆涛、李嘉鹏、付松洋 · 指导教师冯玉雷、张兴华
- [ ] 录制并验收 1080p 普通话 MP4

## 代码质量

- [x] `pnpm typecheck` 通过
- [x] `pnpm lint` 通过，且**配置了真实规则**
      （`eslint-config-next` core-web-vitals + typescript，未使用变量为 error）
- [x] `pnpm build` 通过
- [x] `pnpm test` 通过：17 个用例（切块与检索排序、评分加权、密码哈希、工作区隔离、模型状态）
- [x] 数据隔离：注册即建独立工作区，业务读写按 `teamId` 过滤，跨工作区 id 返回 404
- [x] 路由保护：`proxy.ts` 拦截 8 个工作区路由 + `/dashboard` 服务端二次校验 session
- [x] 业务 API session 校验，匿名/无效/过期 session 返回 401
- [x] `.env.local`、`data/`、`uploads/`、`node_modules/`、`.next/` 不进入交付包
- [ ] 浏览器主流程无控制台错误（录制前用无痕窗口走一遍并截图留证）

## 当前已实现并可本地演示

- [x] 首页、登录、注册、退出登录
- [x] 工作台（服务端渲染，`dynamic = "force-dynamic"`，非构建期快照）
- [x] 计划画布：读取已保存计划、生成、重规划，并标注 `live / fallback-schema / fallback-error / demo`
- [x] 资料上传（TXT/Markdown）与**真实的片段级检索**：命中片段、相似度分数、字符区间
- [x] 作品评审：分数由项目状态计算或由模型打分，每个维度带证据；不再固定 78 分
- [x] 媒体上传：文件真实写入 `uploads/`，任务状态流转与真实字节数校验
- [x] 团队成员、邀请记录、教师批注（按登录账号记录作者）
- [x] 个人资料修改（`PATCH /api/me`）
- [x] 错误页与 404 页（`app/error.tsx`、`app/not-found.tsx`）
- [x] 键盘可见焦点样式、`prefers-reduced-motion` 支持
- [x] 响应式工作区布局与统一导航

## 仍需真实服务配置后验收

- [ ] PostgreSQL + Prisma 实际读写与迁移
- [ ] MinIO 文件保存、下载和权限隔离
- [ ] PDF/网页正文解析
- [ ] FFmpeg 转码/抽帧、真实转写模型、视觉模型
- [ ] Embedding 语义召回（当前为词法检索，两者不可混称）
- [ ] Worker 任务锁、进度、重试、超时和临时文件清理
- [ ] SMTP 邮箱验证和邀请邮件
- [ ] 生产 session 存储（数据库）与成员加入流程（工作区隔离已实现，见「代码质量」一节）

## 打包检查（务必逐条确认）

- [ ] 交付目录内**不存在** `node_modules/`、`.next/`、`data/`、`uploads/`、`tsconfig.tsbuildinfo`
- [ ] `pnpm-workspace.yaml` 是仓库版本，不含 `set this to true or false` 之类的占位残留
- [ ] `QuestPilot-git-history.bundle` 已重建：不包含 `.agents/`、`AI交接文档/`、`.learnings/`、`AGENTS.md`、`scripts/clean-owned-assets.py`
- [ ] `scripts/` 目录下没有与去水印 / 去 AI 标记相关的脚本
- [ ] 在**干净目录**中解压 → `pnpm install` → `pnpm build` 一次通过

## 录制前

- [ ] 无痕浏览器匿名访问 `/dashboard` 跳转 `/login`
- [ ] 学生演示账号可登录并看到完整示例空间
- [ ] 所有演示结果标明为模型结果、检索结果或样例（界面上已有来源标签）
- [ ] 不显示 API key、SMTP 密码、真实隐私数据或调试面板
- [ ] 成片控制在 5–8 分钟，普通话清晰，字幕同步，MP4 至少 1080p
