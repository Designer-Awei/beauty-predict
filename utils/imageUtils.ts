/**
 * 图片处理相关工具函数
 */

// 示例：图片格式校验
export function isValidImageType(fileType: string): boolean {
  return ['image/jpeg', 'image/png', 'image/bmp'].includes(fileType);
} 