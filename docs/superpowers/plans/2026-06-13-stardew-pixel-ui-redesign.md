# Stardew Pixel UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有星露谷物语攻略站公开前台重构为已确认的五页面像素田园设计，同时保留全部 API、后台和工具功能。

**Architecture:** 保持单页 Hash Router 和现有 Express API。新增纯模板模块承载可测试的页面片段，`app.js` 负责数据加载与事件绑定，`app.css` 提供统一木质设计系统和响应式布局。

**Tech Stack:** HTML5、CSS3、原生 ES Modules、Node.js、Express、Vitest、Supertest。

---

### Task 1: 前台视觉契约

**Files:**
- Create: `tests/site-view.test.js`
- Create: `public/js/site-view.js`

- [ ] **Step 1: Write the failing test**

测试首页按钮组、六张热门攻略、分类选择、图鉴卡片和物品弹窗的语义结构。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/site-view.test.js`

Expected: FAIL because `public/js/site-view.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

实现无 DOM 副作用的 HTML 模板函数，并统一转义所有动态文本。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- tests/site-view.test.js`

Expected: PASS.

### Task 2: 公共外壳和首页

**Files:**
- Modify: `public/index.html`
- Modify: `public/js/app.js`
- Modify: `public/css/app.css`
- Test: `tests/site-view.test.js`

- [ ] **Step 1: Add failing shell and layout assertions**

断言木质导航、搜索面板、居中按钮组、四张统计卡、六张快捷分类卡、三个工具入口、六张热门攻略卡和隐藏广告位。

- [ ] **Step 2: Run targeted test and confirm failure**

Run: `npm.cmd test -- tests/site-view.test.js`

- [ ] **Step 3: Implement the homepage**

使用本地农场背景、中文 Logo 和像素图标构建首页；热门攻略卡移除版本标签。

- [ ] **Step 4: Run targeted test**

Run: `npm.cmd test -- tests/site-view.test.js`

Expected: PASS.

### Task 3: 分类页和图鉴列表

**Files:**
- Modify: `public/js/app.js`
- Modify: `public/js/site-view.js`
- Modify: `public/css/app.css`
- Test: `tests/site-view.test.js`

- [ ] **Step 1: Add failing category and library assertions**

断言无 `dataset` 参数显示九宫格分类页；带参数显示木质侧栏、搜索排序栏和物品网格。

- [ ] **Step 2: Run targeted test and confirm failure**

Run: `npm.cmd test -- tests/site-view.test.js`

- [ ] **Step 3: Implement category and library views**

复用现有 `/api/datasets` 和 `/api/datasets/:slug/entries`，保留筛选、分页和视图切换。

- [ ] **Step 4: Run targeted and API tests**

Run: `npm.cmd test -- tests/site-view.test.js tests/api.test.js`

Expected: PASS.

### Task 4: 物品弹窗和攻略详情

**Files:**
- Modify: `public/js/app.js`
- Modify: `public/js/site-view.js`
- Modify: `public/css/app.css`
- Test: `tests/site-view.test.js`
- Test: `tests/article-layout.test.js`

- [ ] **Step 1: Add failing modal and right TOC assertions**

断言物品详情为可关闭、可切换标签的对话框；攻略详情使用主内容加右侧目录结构。

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm.cmd test -- tests/site-view.test.js tests/article-layout.test.js`

- [ ] **Step 3: Implement modal and article layout**

直接访问条目路由时先渲染对应图鉴，再打开弹窗；保持浏览器后退关闭行为。

- [ ] **Step 4: Run targeted tests**

Run: `npm.cmd test -- tests/site-view.test.js tests/article-layout.test.js`

Expected: PASS.

### Task 5: 验证和视觉 QA

**Files:**
- Create: `design-qa.md`
- Modify: `public/css/app.css` if QA finds P0/P1/P2 issues

- [ ] **Step 1: Run complete verification**

Run: `npm.cmd run check`

Expected: all tests pass, CSS builds, syntax checks pass.

- [ ] **Step 2: Start the local server**

Run: `npm.cmd start`

Expected: `http://localhost:3000` serves the redesigned site.

- [ ] **Step 3: Capture desktop and mobile views**

Capture homepage, category page, library, item modal and article detail at matching states.

- [ ] **Step 4: Compare against the approved design**

Write `design-qa.md`, fix all P0/P1/P2 findings, and repeat until `final result: passed`.

- [ ] **Step 5: Build Docker image**

Run: `docker compose --env-file .env.production build`

Expected: image builds successfully.

