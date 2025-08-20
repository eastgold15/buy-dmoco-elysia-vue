/**
 * API 工具函数
 * 处理客户端和服务端的 API 请求基础 URL
 */

/**
 * 获取 API 基础 URL
 * 在客户端使用当前域名和端口，在服务端使用 localhost:9004
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // 客户端：使用当前域名和端口
    return `${window.location.protocol}//${window.location.host}`;
  } else {
    // 服务端：使用固定的本地地址
    return 'http://localhost:9004';
  }
}

/**
 * 构建完整的 API URL
 * @param path API 路径，如 '/api/categories'
 * @returns 完整的 API URL
 */
export function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * 创建带有正确基础 URL 的 fetch 函数
 * @param path API 路径
 * @param options fetch 选项
 * @returns Promise
 */
export async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const { $fetch } = await import('ofetch');
  const url = buildApiUrl(path);
  return $fetch<T>(url, options);
}