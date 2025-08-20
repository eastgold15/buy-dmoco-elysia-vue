import { Elysia } from "elysia";
import { LayoutService } from '../services/layoutService';
import type { CreateHeaderConfigRequest, UpdateHeaderConfigRequest, CreateFooterConfigRequest, UpdateFooterConfigRequest } from '../../../types/layout';
import type { ApiResponse } from '../../../types/category';

export const layoutRoute = new Elysia({ tags: ['Layout'] })
    // 头部配置相关API
    // 获取头部配置
    .get('/layout/header', async () => {
        try {
            const headerConfig = await LayoutService.getHeaderConfig();
            const response: ApiResponse<typeof headerConfig> = {
                success: true,
                data: headerConfig
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取头部配置失败'
            };
            return response;
        }
    })

    // 创建头部配置
    .post('/layout/header', async ({ body }) => {
        try {
            const createData = body as CreateHeaderConfigRequest;
            const headerConfig = await LayoutService.createHeaderConfig(createData);
            const response: ApiResponse<typeof headerConfig> = {
                success: true,
                data: headerConfig,
                message: '头部配置创建成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '创建头部配置失败'
            };
            return response;
        }
    })

    // 更新头部配置
    .put('/layout/header', async ({ body }) => {
        try {
            const updateData = body as UpdateHeaderConfigRequest;
            const headerConfig = await LayoutService.updateHeaderConfig(updateData);
            const response: ApiResponse<typeof headerConfig> = {
                success: true,
                data: headerConfig,
                message: '头部配置更新成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '更新头部配置失败'
            };
            return response;
        }
    })

    // 底部配置相关API
    // 获取底部配置
    .get('/layout/footer', async () => {
        try {
            const footerConfig = await LayoutService.getFooterConfig();
            const response: ApiResponse<typeof footerConfig> = {
                success: true,
                data: footerConfig
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取底部配置失败'
            };
            return response;
        }
    })

    // 创建底部配置
    .post('/layout/footer', async ({ body }) => {
        try {
            const createData = body as CreateFooterConfigRequest;
            const footerConfig = await LayoutService.createFooterConfig(createData);
            const response: ApiResponse<typeof footerConfig> = {
                success: true,
                data: footerConfig,
                message: '底部配置创建成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '创建底部配置失败'
            };
            return response;
        }
    })

    // 更新底部配置
    .put('/layout/footer', async ({ body }) => {
        try {
            const updateData = body as UpdateFooterConfigRequest;
            const footerConfig = await LayoutService.updateFooterConfig(updateData);
            const response: ApiResponse<typeof footerConfig> = {
                success: true,
                data: footerConfig,
                message: '底部配置更新成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '更新底部配置失败'
            };
            return response;
        }
    })

    // 获取完整布局配置
    .get('/layout/config', async () => {
        try {
            const headerConfig = await LayoutService.getHeaderConfig();
            const footerConfig = await LayoutService.getFooterConfig();
            const response: ApiResponse<{ header: typeof headerConfig, footer: typeof footerConfig }> = {
                success: true,
                data: {
                    header: headerConfig,
                    footer: footerConfig
                }
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取布局配置失败'
            };
            return response;
        }
    })