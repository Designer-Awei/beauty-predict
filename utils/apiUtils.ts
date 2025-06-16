/**
 * API请求封装工具函数
 */

// 示例：通用fetch请求
export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('请求失败');
  return res.json();
}
