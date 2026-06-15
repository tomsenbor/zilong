const aliasMap = new Map([
  ["old-card", ["card"]],
  ["base-card", ["card"]],
  ["ui-card", ["card"]],
  ["stardew-panel", ["card"]],
  ["pixel-button", ["btn", "btn-primary"]],
  ["ui-button", ["btn", "btn-secondary"]],
  ["farm-button", ["btn", "btn-primary"]],
  ["primary", ["btn-primary"]],
  ["secondary", ["btn-secondary"]],
  ["ghost", ["btn-ghost"]],
  ["search-input", ["form-control", "input"]],
  ["site-input", ["form-control", "input"]],
  ["input", ["form-control", "input"]],
  ["select", ["form-control", "select"]]
]);

function addClass(output, value) {
  if (!value) return;
  String(value).split(/\s+/).filter(Boolean).forEach((token) => {
    output.add(token);
    for (const alias of aliasMap.get(token) || []) output.add(alias);
  });
}

export function uiClass(...tokens) {
  const output = new Set();
  for (const token of tokens.flat(Infinity)) {
    if (!token) continue;
    if (typeof token === "object") {
      for (const [key, enabled] of Object.entries(token)) {
        if (enabled) addClass(output, key);
      }
    } else {
      addClass(output, token);
    }
  }
  return [...output].join(" ");
}

export const classMap = Object.freeze(Object.fromEntries(aliasMap));
