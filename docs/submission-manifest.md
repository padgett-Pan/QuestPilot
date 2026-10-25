# QuestPilot 省赛材料清单

本清单对应本地交付包。包内不含远程仓库、不含真实密钥、不含运行时数据、不含 node_modules 和构建缓存。

> **打包前先执行 `docs/acceptance-checklist.md` 的「打包检查」一节。**
> 那一节列出的排除项如果漏做，会把运行数据、密码哈希和构建缓存一起交出去。

## 交付内容

| 路径 | 用途 |
|---|---|
| `app/`、`components/`、`lib/` | Next.js 页面、组件、认证、检索、AI 适配与本地运行时 |
| `prisma/`、`worker/` | 数据模型（部署目标）与 Worker 入口 |
| `public/` | 网站静态素材 |
| `package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`tsconfig.json` 等 | 依赖、构建与本地运行配置 |
| `proxy.ts` | 工作区路由保护；**缺失会导致页面可被匿名访问** |
| `eslint.config.mjs`、`postcss.config.mjs` | 代码检查与样式构建配置 |
| `.env.example` | 环境变量模板，分「已接通」与「部署目标预留」两段 |
| `README.md` | 安装、运行、演示账号和当前边界 |
| `docs/competition-technical-doc.pdf` | 省赛要求的 PDF 技术文档（源稿更新后需重新导出） |
| `docs/competition-technical-doc.md` | 技术文档可编辑源稿 |
| `docs/architecture.md` | 当前运行架构和部署目标说明 |
| `docs/demo-script.md` | 5–8 分钟普通话演示视频稿 |
| `docs/acceptance-checklist.md` | 提交前验收清单 |
| `QuestPilot-git-history.bundle` | 本地 Git 历史。**已重建为干净历史**（10 次提交、79 个文件，见下方复核方法） |

## 未包含内容

`.env.local`、`data/`、`tmp/`、`uploads/`、`minio/`、`node_modules/`、`.next/`、`tsconfig.tsbuildinfo`、日志、浏览器测试产物、内部交接文档、官网抓取原始材料、第三方密钥和任何真实个人数据。

另需确认 `scripts/` 目录下不存在与去水印 / 去 AI 标记相关的脚本，且 Git bundle 的历史中同样不含此类内容。

## 关于 Git bundle

原始 bundle 的历史中包含 `.agents/`、`AI交接文档/`、`.learnings/`、`AGENTS.md` 等内部材料。这些文件与赛事提交无关，其中部分内容会被误读为刻意处理 AI 生成痕迹，因此交付版**已重建**：

1. 从原 bundle 取回历史；
2. 用 `git filter-branch --index-filter` 从所有提交中剔除上述内部路径与 `scripts/clean-owned-assets.py`；
3. 追加收尾提交，用当前工作树重新打包；
4. 删除 `refs/original` 备份引用并执行 `git gc --prune=now`，避免旧对象随 bundle 一起被带走。

复核方法（在任意空目录执行）：

```bash
git clone QuestPilot-git-history.bundle qp-history
cd qp-history
git log --all --name-only --pretty=format: | sort -u \
  | grep -E "\.agents|AI交接|\.learnings|AGENTS\.md|clean-owned-assets"
```

预期结果为**无输出**。当前包已实测通过。

## 提交前必须由团队补齐

1. 按官方提交入口准备 GitHub/Gitee 公共或评审可访问仓库。
2. 录制最终 5–8 分钟、1080p 以上普通话 MP4。
3. 源稿改动后重新导出 PDF 技术文档，并补上界面截图与架构图。
4. 在真实服务配置完成后重新运行完整验收，不要把演示骨架描述成已上线能力。

> 报名信息（学校、组别、成员和指导教师）已于 2026-10-25 填入技术文档与演示稿：黑龙江职业学院第二校区 · C 组 · 团队 SIHP（编号 41026）· 成员潘庆涛、李嘉鹏、付松洋 · 指导教师冯玉雷、张兴华。
