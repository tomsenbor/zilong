# Article Detail Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved scheme C article detail page with a generated table of contents and complete, readable guide chapters.

**Architecture:** Add a small browser-safe utility module for heading metadata and reading-time calculation. The existing article route will render the API HTML unchanged, then enhance its `h2` elements with anchors and a generated table of contents. Styling remains isolated to article detail selectors.

**Tech Stack:** Vanilla JavaScript ES modules, HTML, CSS, Vitest, Express API.

---

### Task 1: Article layout utilities

**Files:**
- Create: `public/js/article-layout.js`
- Create: `tests/article-layout.test.js`

- [ ] Write tests for stable section IDs, duplicate headings and Chinese reading-time estimation.
- [ ] Run `npm.cmd test -- tests/article-layout.test.js` and confirm failure because the module does not exist.
- [ ] Implement `createArticleOutline()` and `estimateReadingMinutes()`.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Detail page structure and interaction

**Files:**
- Modify: `public/js/app.js`
- Modify: `tests/api.test.js`

- [ ] Add an API regression assertion that the built-in article detail returns its complete HTML with at least four `h2` chapters and the final chapter text.
- [ ] Run the focused API test and verify the assertion against real seeded data.
- [ ] Render a guide overview, sticky directory, complete article HTML and mobile directory control.
- [ ] Assign IDs to every `h2`, wire directory links, and highlight the current chapter while scrolling.

### Task 3: Responsive visual hierarchy

**Files:**
- Modify: `public/css/app.css`

- [ ] Style the article shell, directory, overview cards, chapter headings, paragraphs, lists, blockquotes, tables and media.
- [ ] Add desktop sticky navigation and mobile single-column behavior.
- [ ] Run `npm.cmd test` and `npm.cmd run css`.
- [ ] Start or reuse the local app and visually verify one full article at desktop and mobile widths.
