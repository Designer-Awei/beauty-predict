/**
 * API相关类型定义
 */

// 示例：通用API响应类型
declare interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
