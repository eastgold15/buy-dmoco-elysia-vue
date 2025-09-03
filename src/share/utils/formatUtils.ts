/**
 * 格式化工具函数
 */


/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatSize = (bytes: number): string => {
  const k = 1024;
  const dm = 3;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  if (bytes === 0) {
    return `0 ${sizes[0]}`;
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${formattedSize} ${sizes[i]}`;
};

/**
 * 格式化日期
 * @param dateString 日期字符串
 * @param locale 地区设置，默认为'zh-CN'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (dateString: string, locale: string = 'zh-CN'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 获取图片完整URL
 * @param url 相对路径或文件名
 * @returns 完整的图片URL
 */
export const getImageUrl = (url: string): string => {
  const domain = import.meta.env.VITE_HUAWEI_DOMAIN || 'http://img.cykycyky.top';
  return `${domain}/${url}`;
};

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
};

/**
 * 在新标签页打开URL
 * @param url 要打开的URL
 */
export const openInNewTab = (url: string): void => {
  window.open(url, '_blank');
};