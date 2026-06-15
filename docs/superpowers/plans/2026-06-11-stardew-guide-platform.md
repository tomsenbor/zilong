# 星露谷物语攻略站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建可通过 Docker 部署、带大型初始资料库和单管理员后台的星露谷物语 1.6.15 中文攻略站。

**Architecture:** 单个 Express 应用同时提供 REST API 与静态 HTML/Tailwind/JavaScript 页面。SQLite 保存内容、动态资料字段、媒体元数据和 Session；本地目录保存上传文件，FTS5 提供全文搜索。

**Tech Stack:** Node.js 22、Express、better-sqlite3、Zod、Multer、bcryptjs、express-session、Tailwind CSS、Vitest、Supertest、Playwright、Docker Compose。

---

## 文件结构

- `src/app.js`：创建和配置 Express 应用。
- `src/server.js`：启动服务和处理退出信号。
- `src/config.js`：读取、校验环境变量。
- `src/db/*`：SQLite 连接、迁移、初始化和仓储。
- `src/features/auth/*`：登录、Session、CSRF。
- `src/features/content/*`：分类、攻略、资料集和搜索。
- `src/features/media/*`：上传、替换、引用保护。
- `src/features/admin/*`：管理 CRUD、导入导出和备份。
- `src/middleware/*`：错误、校验、认证和限流。
- `public/*`：前台、后台、共享样式与浏览器脚本。
- `seeds/*`：按资料集拆分的 1.6.15 初始数据。
- `tests/*`：单元、API 与浏览器测试。

### Task 1: 项目骨架与配置

- [ ] 创建 `package.json`、环境变量样例、Vitest 配置和基础目录。
- [ ] 编写配置校验测试并确认失败。
- [ ] 实现 `src/config.js` 使测试通过。
- [ ] 创建 Express 健康检查和静态文件服务。
- [ ] 运行 `npm test` 与 `npm run lint`。

### Task 2: SQLite 模型与迁移

- [ ] 编写临时数据库迁移测试。
- [ ] 实现核心表、索引、FTS5 表和触发器。
- [ ] 实现数据库连接、事务和管理员初始化。
- [ ] 验证重复迁移幂等且外键启用。

### Task 3: 大型种子资料

- [ ] 定义数据集与字段 JSON Schema。
- [ ] 创建作物、鱼类、村民、料理、物品、技能、任务、节日和地点种子文件。
- [ ] 编写导入器测试，验证条目计数、slug 唯一和图片路径。
- [ ] 实现幂等种子导入和素材复制脚本。

### Task 4: 登录、安全与 Session

- [ ] 编写登录成功、失败、退出和未授权测试。
- [ ] 实现 bcrypt 登录、SQLite Session、CSRF 和限流。
- [ ] 设置安全 Cookie、Helmet 和统一错误格式。
- [ ] 验证所有管理写接口均受保护。

### Task 5: 公共内容 API

- [ ] 编写分类、攻略、数据集、筛选、排序和分页测试。
- [ ] 实现公共仓储、服务和路由。
- [ ] 编写中文全文搜索测试。
- [ ] 实现 FTS 搜索及搜索结果分页。

### Task 6: 管理 CRUD API

- [ ] 编写攻略、分类、标签、字段和资料条目 CRUD 测试。
- [ ] 实现 Zod 校验和事务写入。
- [ ] 实现发布状态、slug 冲突和引用冲突响应。
- [ ] 验证写操作同步 FTS 索引。

### Task 7: 媒体与数据工具 API

- [ ] 编写上传类型、体积、替换和引用保护测试。
- [ ] 实现媒体上传、替换、删除和静态访问。
- [ ] 实现 JSON 导入、导出和 SQLite 备份下载。
- [ ] 验证失败操作不会遗留孤立文件。

### Task 8: 森林资料馆前台

- [ ] 实现共享 Tailwind 主题、导航、页脚和响应式组件。
- [ ] 实现首页分类、统计、热门内容和搜索入口。
- [ ] 实现资料库筛选、排序、表格/卡片切换和分页。
- [ ] 实现攻略详情、资料详情和搜索结果页。
- [ ] 增加空状态、加载状态和错误提示。

### Task 9: 管理后台

- [ ] 实现登录页和 Session 恢复。
- [ ] 实现仪表盘、攻略列表与编辑器。
- [ ] 实现动态资料表单、分类标签和图片库。
- [ ] 实现导入、导出、备份和删除确认。
- [ ] 验证手机端可完成核心管理操作。

### Task 10: Docker、文档与联调

- [ ] 创建 `Dockerfile`、`compose.yaml` 和健康检查。
- [ ] 编写 README，包括目录、运行、账号配置、备份、恢复和升级。
- [ ] 运行全部 Vitest 与 Supertest 测试。
- [ ] 启动服务并用 Playwright 验证前台搜索分页和后台 CRUD 上传。
- [ ] 构建 Docker 镜像并验证卷持久化。

