# 星露谷物语攻略站设计规格

## 1. 项目目标

构建一个面向中文玩家的《星露谷物语》大型攻略资料站。内容以截至
2026 年 6 月 11 日最新正式版 1.6.15 为基准，覆盖结构化图鉴和长篇攻略，
并通过单管理员后台持续维护。

项目必须满足：

- 前台分类浏览、全文搜索、组合筛选、排序和分页可正常使用。
- 后台登录、攻略及结构化数据的新增、编辑、删除可正常使用。
- 后台支持图片上传、替换和删除。
- 前后端通过 Express REST API 完整联调。
- 桌面、平板和手机端均可使用。
- Docker 部署后数据库和上传图片可持久化。

## 2. 技术方案

- 前端：语义化 HTML、Tailwind CSS、原生 JavaScript。
- 后端：Node.js、Express。
- 数据库：SQLite，使用 `better-sqlite3` 执行迁移和查询。
- 身份认证：服务端 Session、SQLite Session 存储、bcrypt 密码哈希。
- 图片上传：Multer，文件保存至持久化 `uploads` 目录。
- 参数校验：Zod。
- 安全：Helmet、CSRF Token、登录和写接口限流、上传白名单。
- 测试：Vitest、Supertest、Playwright。
- 部署：Docker Compose，挂载 `data` 与 `uploads` 卷。

SQLite 适合单实例、单管理员和读多写少的攻略站。相比 JSON 文件，它能可靠
支持大型数据集的筛选、分页、事务和全文检索；相比 PostgreSQL，它显著降低
个人站点的部署和维护成本。

## 3. 视觉系统

采用已确认的 B 方案“森林资料馆”：

- 主色为森林深绿，辅色为木棕、麦穗金和羊皮纸米白。
- 前台顶部使用游戏 Logo 和宽幅场景图，资料区降低装饰密度。
- 分类卡片使用现有作物、鱼类、人物、料理和技能像素图标。
- 表格使用米白背景、绿色筛选区、清晰的表头和移动端横向滚动。
- 后台沿用相同色板，但不使用大幅背景图，优先保证表单和表格效率。
- 所有像素素材使用 `image-rendering: pixelated`，普通照片保持平滑缩放。
- 尊重 `prefers-reduced-motion`，动画仅用于轻量 hover 和状态反馈。

桌面素材目录仅作为导入源。项目实际使用的素材复制到
`public/assets/game`，避免运行时依赖用户桌面路径。

## 4. 信息架构

### 前台

1. 首页
   - Logo、主导航、全站搜索。
   - 分类入口、热门攻略、版本提示、资料统计。
2. 资料库
   - 分类侧栏或移动端筛选抽屉。
   - 关键词、季节、地点、天气、标签等组合筛选。
   - 卡片视图与表格视图。
   - 排序和分页。
3. 攻略详情
   - 标题、摘要、主图、正文、分类、标签、更新时间和版本。
   - 相关结构化数据和相关文章。
4. 全站搜索
   - 同时返回攻略和资料条目。
   - 显示命中类型、摘要、分类和分页。

### 后台

1. 登录页。
2. 仪表盘：条目统计、最近更新、图片占用。
3. 攻略管理：列表、搜索、新增、编辑、删除、发布状态。
4. 资料管理：按数据集切换，使用动态字段表单维护条目。
5. 分类与标签管理。
6. 图片库：上传、预览、替换、引用检查、删除。
7. 数据工具：JSON 导入、JSON 导出、数据库备份下载。

## 5. 数据模型

### 核心表

- `admins`：管理员账号、密码哈希、最后登录时间。
- `categories`：分类名称、slug、图标、说明、排序。
- `articles`：攻略标题、slug、摘要、正文、封面、状态、版本和时间戳。
- `article_categories`：攻略与分类多对多关系。
- `tags`、`article_tags`：标签及攻略标签关系。
- `datasets`：结构化数据集定义，如作物、鱼类、村民。
- `dataset_fields`：每个数据集的字段定义、类型、选项和展示顺序。
- `dataset_entries`：资料条目的通用字段、主图、版本和发布时间。
- `dataset_entry_values`：条目动态字段值，保留文本值和数值值便于筛选排序。
- `media`：上传文件名、原始名、MIME、大小、尺寸和引用信息。
- `settings`：站点名、当前内容版本等少量全局配置。

### 搜索

使用 SQLite FTS5 建立攻略和资料条目搜索索引。新增、编辑和删除操作通过事务
同步索引。搜索范围包括标题、摘要、正文、条目名称、别名和动态字段文本值。

### 初始数据范围

首版大型种子数据优先覆盖：

- 作物与种子。
- 鱼类、蟹笼与鱼塘。
- 村民、生日、住址和礼物喜好。
- 料理与配方。
- 基础资源、矿物、文物、武器、戒指和工具。
- 技能与职业。
- 任务、节日和重要地点。

所有条目带 `game_version` 字段。1.7 发布后可以增量导入而不改变表结构。

## 6. API 设计

公共接口统一使用 `/api`：

- `GET /api/categories`
- `GET /api/articles`
- `GET /api/articles/:slug`
- `GET /api/datasets`
- `GET /api/datasets/:slug/entries`
- `GET /api/datasets/:slug/entries/:entrySlug`
- `GET /api/search`

管理接口统一使用 `/api/admin`：

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/session`
- 攻略、分类、标签、数据集、字段和条目的 REST CRUD。
- `POST /api/admin/media`
- `PUT /api/admin/media/:id`
- `DELETE /api/admin/media/:id`
- `POST /api/admin/import`
- `GET /api/admin/export`
- `GET /api/admin/backup`

列表接口返回 `{ items, pagination, filters }`。错误统一返回
`{ error: { code, message, details? } }`。所有写接口校验 Session、CSRF Token
和 Zod Schema。

## 7. 图片策略

- 支持 PNG、JPEG、WebP 和 GIF。
- 单文件默认上限 5 MB，可通过环境变量调整。
- 读取真实 MIME 和图片尺寸，不信任扩展名。
- 文件名使用随机 UUID，原始文件名单独保存。
- 替换图片时先写新文件并更新数据库，事务成功后再清理旧文件。
- 被攻略或资料引用的图片禁止直接删除，接口返回引用列表。
- 项目预置游戏素材与管理员上传素材分开存储。

## 8. 错误处理与安全

- API 404、校验错误、认证错误、冲突和服务器错误有明确状态码。
- 后台表单显示字段级错误，并保留未提交内容。
- 删除操作需要二次确认；数据库操作使用事务。
- Session Cookie 使用 `HttpOnly`、`SameSite=Lax`，生产环境启用 `Secure`。
- 首次启动通过环境变量创建或更新管理员，不在代码中保存明文密码。
- 登录接口限流，上传接口限制数量、类型和体积。
- 攻略正文使用受控 Markdown，并在渲染时进行 HTML 清理。

## 9. Docker 与数据持久化

应用容器监听 `3000` 端口。Docker Compose 挂载：

- `/app/data`：SQLite 数据库、迁移状态和备份。
- `/app/uploads`：管理员上传图片。

环境变量至少包括：

- `NODE_ENV`
- `PORT`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `DATABASE_PATH`
- `UPLOAD_DIR`
- `MAX_UPLOAD_MB`

部署文档包含构建、启动、查看日志、备份、恢复和升级步骤。

## 10. 测试与验收

### 自动化测试

- 数据层：迁移、筛选、排序、分页、FTS 同步。
- API：登录、退出、Session、CSRF、攻略 CRUD、资料 CRUD、上传和引用保护。
- 浏览器：前台搜索筛选分页；后台登录、新增、编辑、上传、删除。

### 人工验收

- Chrome/Edge 桌面宽度 1440 px。
- 平板宽度 768 px。
- 手机宽度 390 px。
- Docker 重启后攻略数据和上传图片仍存在。
- 无登录用户不能访问任何管理写接口。
- 中文关键词可以在攻略正文和结构化资料中搜索。

## 11. 范围边界

首版不包含公开注册、多管理员角色、评论、收藏同步、付费、第三方 OAuth、
多语言和自动抓取外部网站。完整资料通过项目内种子文件维护，后台可继续增补。

