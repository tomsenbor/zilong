export function buildRequestOptions(options = {}) {
  return {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  };
}

export async function api(url, options = {}) {
  const response = await fetch(url, buildRequestOptions(options));
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error?.message || `请求失败（${response.status}）`);
    error.status = response.status;
    error.code = payload.error?.code;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

export const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

export const imageFallback = "/assets/game/36px-Prismatic_Shard.png";
