import { formatCropDays } from '../../../public/js/wiki-days.js';

// Shared by the API and initial HTML so paging uses identical filters and order.
export function selectEntries(items, datasetSlug, params = {}) {
  const query = String(params.q || '').trim().toLowerCase();
  const filtered = items.filter(item => {
    if (query && !`${item.name} ${item.aliases} ${item.summary}`.toLowerCase().includes(query)) return false;
    return Object.entries(params).every(([key, value]) => {
      if (['q', 'page', 'pageSize', 'sort', 'order'].includes(key) || !value) return true;
      const actual = item.attributes[key];
      if (datasetSlug === 'crops' && key === 'days') return formatCropDays(actual) === formatCropDays(value);
      return Array.isArray(actual) ? actual.includes(value) : String(actual || '').includes(String(value));
    });
  });
  const sort = String(params.sort || 'name');
  const direction = params.order === 'desc' ? -1 : 1;
  return filtered.sort((a, b) => String(a[sort] ?? a.attributes[sort] ?? '').localeCompare(
    String(b[sort] ?? b.attributes[sort] ?? ''), 'zh-CN', { numeric: true }
  ) * direction);
}
