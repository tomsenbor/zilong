# 星露谷物语攻略站

面向《星露谷物语》1.6.15 的中文攻略与大型结构化资料库。前台支持分类、
搜索、筛选、排序和分页；后台支持单管理员登录、攻略与资料 CRUD、图片上传、
JSON 导出和数据库备份。

前台同时提供三个可交互产品：

- 鱼类条件查询器：按季节、天气、时间、地点、获取方式和分类筛选。
- 作物收益计算器：比较预算、地块、职业、肥料、种植地点和加工方式下的收益。
- 社区中心进度清单：按房间保存完成状态，支持季节筛选、导入和导出。

社区中心进度保存在当前浏览器的 `localStorage` 中，不会写入服务器数据库。

## 技术栈

- 前端：HTML、Tailwind CSS、原生 JavaScript
- 后端：Node.js 24、Express 5
- 数据：Node.js 内置 SQLite
- 部署：Docker Compose
- 测试：Vitest、Supertest

## 目录结构

```text
.
├─ public/                 # 前台、后台与游戏素材
│  ├─ assets/game/        # 预置像素素材
│  ├─ css/
│  └─ js/
├─ scripts/seed.js        # 幂等种子导入
├─ src/
│  ├─ db/                 # 迁移、初始化与大型种子
│  ├─ features/           # 认证、内容、后台、媒体
│  ├─ middleware/
│  ├─ app.js
│  └─ server.js
├─ tests/                 # 配置、应用与 API 测试
├─ Dockerfile
└─ compose.yaml
```

## 本地运行

需要 Node.js 22.5 或更高版本，推荐 Node.js 24。

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run css
npm.cmd start
```

浏览器访问：

- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`
- 健康检查：`http://localhost:3000/api/health`
- 实用工具：`http://localhost:3000/#tools`
- 鱼类查询：`http://localhost:3000/#tools/fish`
- 作物计算：`http://localhost:3000/#tools/crops`
- 社区中心：`http://localhost:3000/#tools/community-center`

启动命令会自动读取项目根目录的 `.env`。开发环境默认管理员为
`admin / change-me-now`，此密码仅允许本地开发使用。

## Docker 部署

生产部署要求 HTTPS。容器端口默认只绑定到主机的 `127.0.0.1:3000`，
再由主机上的 Caddy 或 Nginx 提供公网 HTTPS。

1. 创建生产环境变量文件：

```powershell
Copy-Item .env.production.example .env.production
```

编辑 `.env.production`，必须更换 `SESSION_SECRET` 和 `ADMIN_PASSWORD`。
生产密码至少 12 位，Session 密钥至少 32 位。程序会拒绝使用默认密码启动。

2. 构建并启动容器：

```powershell
docker compose --env-file .env.production up -d --build
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs -f
```

默认基础镜像使用 AWS Public ECR，国内网络通常比 Docker Hub 稳定。需要切换时，
可在 `.env.production` 中设置 `BASE_IMAGE=node:24-alpine` 或其他兼容镜像。

3. 配置 HTTPS 反向代理：

仓库中的 `deploy/Caddyfile.example` 可作为主机 Caddy 配置。将
`guide.example.com` 替换为实际域名，解析域名后启动或重载 Caddy。
应用设置 `TRUST_PROXY=1` 后会正确识别代理转发的 HTTPS 请求，并签发
`Secure` 后台登录 Cookie。

4. 更新：

```powershell
docker compose --env-file .env.production pull
docker compose --env-file .env.production up -d --build
```

数据库和上传图片保存在 Docker 命名卷 `stardew-data` 与
`stardew-uploads` 中，实际卷名固定为 `stardew-guide-data` 与
`stardew-guide-uploads`，重建容器不会丢失。

仅在本机 HTTP 验收时，可以临时设置 `COOKIE_SECURE=false` 和
`TRUST_PROXY=false`。公网环境不得关闭安全 Cookie。

## 数据备份与恢复

后台“数据工具”可下载一致性的 SQLite 备份和 JSON 导出。

查看卷位置：

```powershell
docker volume inspect stardew-guide-data
docker volume inspect stardew-guide-uploads
```

恢复时先停止容器，将备份数据库替换卷中的 `stardew.db`，然后重新启动。
建议升级前同时备份数据库卷和上传目录卷。

## 数据维护

`npm.cmd run seed` 会幂等补全内置 1.6.15 资料，不会删除后台新增内容。
后台可继续新增和编辑资料，属性字段由各资料分类的 `fields_json` 控制。

内置资料缺少实际图标时，运行：

```powershell
npm.cmd run assets:sync
npm.cmd run seed
```

同步脚本只补充缺失文件，不覆盖现有素材；大尺寸图片会规范为适合列表展示的尺寸。下载来源和仍未匹配的条目记录在 `docs/game-assets-sources.json`。

## API 摘要

- `GET /api/datasets`
- `GET /api/datasets/:slug/entries`
- `GET /api/articles`
- `GET /api/search?q=关键词`
- `GET /api/tools/fish`
- `GET /api/tools/crops`
- `POST /api/tools/crops/calculate`
- `GET /api/tools/community-center`
- `POST /api/admin/auth/login`
- `/api/admin/articles`、`/api/admin/entries` CRUD
- `POST /api/admin/media`
- `GET /api/admin/export`
- `GET /api/admin/backup`

所有后台写接口都需要 Session 和 `x-csrf-token`。

## 测试

```powershell
npm.cmd test
npm.cmd run check
```

测试使用临时 SQLite 数据库，不会修改正式数据。

## 上线检查

```powershell
docker compose --env-file .env.production ps
curl.exe -I https://你的域名/
curl.exe https://你的域名/api/health
```

健康接口应返回 `status: ok` 与 `database: ready`。随后登录后台，完成一次
图片上传、攻略保存和数据库备份下载，再正式开放访问。
