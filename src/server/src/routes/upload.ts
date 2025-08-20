import { Elysia } from "elysia";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { ApiResponse } from '../../../types/category';

export const uploadRoute = new Elysia({ tags: ['Upload'] })
    // 上传广告图片
    .post('/upload/advertisement', async ({ body }) => {
        try {
            const formData = body as any;
            const file = formData.file;
            
            if (!file) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '没有上传文件'
                };
                return response;
            }

            // 确保上传目录存在
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'advertisements');
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            // 生成文件名
            const timestamp = Date.now();
            const originalName = file.name || 'upload';
            const extension = originalName.split('.').pop() || 'jpg';
            const fileName = `${timestamp}.${extension}`;
            const filePath = join(uploadDir, fileName);

            // 保存文件
            const buffer = await file.arrayBuffer();
            await writeFile(filePath, new Uint8Array(buffer));

            // 返回文件URL
            const fileUrl = `/uploads/advertisements/${fileName}`;
            const response: ApiResponse<{ url: string; fileName: string }> = {
                success: true,
                data: {
                    url: fileUrl,
                    fileName: fileName
                },
                message: '文件上传成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '文件上传失败'
            };
            return response;
        }
    })

    // 上传商品图片
    .post('/upload/product', async ({ body }) => {
        try {
            const formData = body as any;
            const file = formData.file;
            
            if (!file) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '没有上传文件'
                };
                return response;
            }

            // 确保上传目录存在
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            // 生成文件名
            const timestamp = Date.now();
            const originalName = file.name || 'upload';
            const extension = originalName.split('.').pop() || 'jpg';
            const fileName = `${timestamp}.${extension}`;
            const filePath = join(uploadDir, fileName);

            // 保存文件
            const buffer = await file.arrayBuffer();
            await writeFile(filePath, new Uint8Array(buffer));

            // 返回文件URL
            const fileUrl = `/uploads/products/${fileName}`;
            const response: ApiResponse<{ url: string; fileName: string }> = {
                success: true,
                data: {
                    url: fileUrl,
                    fileName: fileName
                },
                message: '文件上传成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '文件上传失败'
            };
            return response;
        }
    })

    // 上传分类图片
    .post('/upload/category', async ({ body }) => {
        try {
            const formData = body as any;
            const file = formData.file;
            
            if (!file) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '没有上传文件'
                };
                return response;
            }

            // 确保上传目录存在
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'categories');
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            // 生成文件名
            const timestamp = Date.now();
            const originalName = file.name || 'upload';
            const extension = originalName.split('.').pop() || 'jpg';
            const fileName = `${timestamp}.${extension}`;
            const filePath = join(uploadDir, fileName);

            // 保存文件
            const buffer = await file.arrayBuffer();
            await writeFile(filePath, new Uint8Array(buffer));

            // 返回文件URL
            const fileUrl = `/uploads/categories/${fileName}`;
            const response: ApiResponse<{ url: string; fileName: string }> = {
                success: true,
                data: {
                    url: fileUrl,
                    fileName: fileName
                },
                message: '文件上传成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '文件上传失败'
            };
            return response;
        }
    })

    // 通用文件上传
    .post('/upload/general', async ({ body }) => {
        try {
            const formData = body as any;
            const file = formData.file;
            const folder = formData.folder || 'general';
            
            if (!file) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '没有上传文件'
                };
                return response;
            }

            // 确保上传目录存在
            const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            // 生成文件名
            const timestamp = Date.now();
            const originalName = file.name || 'upload';
            const extension = originalName.split('.').pop() || 'jpg';
            const fileName = `${timestamp}.${extension}`;
            const filePath = join(uploadDir, fileName);

            // 保存文件
            const buffer = await file.arrayBuffer();
            await writeFile(filePath, new Uint8Array(buffer));

            // 返回文件URL
            const fileUrl = `/uploads/${folder}/${fileName}`;
            const response: ApiResponse<{ url: string; fileName: string }> = {
                success: true,
                data: {
                    url: fileUrl,
                    fileName: fileName
                },
                message: '文件上传成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '文件上传失败'
            };
            return response;
        }
    })