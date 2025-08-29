/**
 * 统一错误处理工具
 * 提供标准化的错误响应格式
 */

import { status } from "elysia";
import { commonRes } from "../plugins/Res";

/**
 * 处理业务逻辑错误
 * @param error 错误对象
 * @param defaultMessage 默认错误消息
 * @returns 标准化的错误响应
 */
export function handleBusinessError(error: unknown, defaultMessage: string) {
  console.error("业务逻辑错误:", error);
  const message = error instanceof Error ? error.message : defaultMessage;
  return commonRes(null, 500, message);
}

/**
 * 处理验证错误
 * @param message 错误消息
 * @returns 标准化的验证错误响应
 */
export function handleValidationError(message: string) {
  return commonRes(null, 400, message);
}

/**
 * 处理资源不存在错误
 * @param resourceName 资源名称
 * @returns 标准化的资源不存在错误响应
 */
export function handleNotFoundError(resourceName: string) {
  return commonRes(null, 404, `${resourceName}不存在`);
}

/**
 * 处理数据库操作错误
 * @param error 错误对象
 * @param operation 操作名称
 * @returns 标准化的数据库错误响应
 */
export function handleDatabaseError(error: unknown, operation: string) {
  console.error(`数据库${operation}操作失败:`, error);
  return commonRes(null, 500, `${operation}操作失败`);
}

/**
 * 处理文件上传错误
 * @param error 错误对象
 * @returns 标准化的文件上传错误响应
 */
export function handleUploadError(error: unknown) {
  console.error("文件上传失败:", error);
  const message = error instanceof Error ? error.message : "文件上传失败";
  return status(500, message);
}