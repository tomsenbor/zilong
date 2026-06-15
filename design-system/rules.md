# UI Kit v3 Lockdown Rules

## Positioning

- The site is a modern Chinese wiki and tool hub first.
- Stardew Valley visual language is only a light accent.
- Information clarity has priority over game UI decoration.

## Forbidden

- Do not use wood, wood-panel, pixel-frame, pixel-button, ui-card, ui-button, base-card, page-hero, panel, or page-level custom card/button systems.
- Do not use wood texture or large decorative backgrounds as structural layout.
- Do not create page-specific card, button, search, or header styles.
- Do not hard-code layout heights.
- Do not use absolute positioning for ordinary layout.
- Do not load old `/css/app.css`, Tailwind CSS, or `homepage.css` in public/admin HTML.

## Required

- Load only `tokens.css`, `base.css`, `layout.css`, and `components.css` as the UI entrypoints.
- Use `.card` for every card-like surface.
- Use `.btn.primary`, `.btn.secondary`, or `.btn.ghost` for every button or button-like link.
- Use `.page-header` for every page title region.
- Use `.search-bar` for every search form.
- Use shared render helpers for SiteHeader, SiteFooter, PageHeader, SearchBar, BaseCard, and Button.
- Mobile layouts must collapse to one column and must not create horizontal scrolling.
