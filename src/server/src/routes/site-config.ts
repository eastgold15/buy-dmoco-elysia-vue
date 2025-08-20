import { Elysia } from "elysia";
import { SiteConfigService } from '../services/siteConfigService';
import type { CreateSiteConfigRequest, UpdateSiteConfigRequest } from '../../../types/siteConfig';
import type { ApiResponse } from '../../../types/category';

export const siteConfigRoute = new Elysia({ tags: ['Site Config'] })
    // 获取所有配置
    .get('/site-config', async () => {
        try {
            const configs = await SiteConfigService.getAllConfigs();
            const response: ApiResponse<typeof configs> = {
                success: true,
                data: configs
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取网站配置失败'
            };
            return response;
        }
    })

    // 根据分类获取配置
    .get('/site-config/category/:category', async ({ params: { category } }) => {
        try {
            const configs = await SiteConfigService.getConfigsByCategory(category);
            const response: ApiResponse<typeof configs> = {
                success: true,
                data: configs
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取配置失败'
            };
            return response;
        }
    })

    // 根据键获取单个配置
    .get('/site-config/:key', async ({ params: { key } }) => {
        try {
            const config = await SiteConfigService.getConfigByKey(key);
            if (config) {
                const response: ApiResponse<typeof config> = {
                    success: true,
                    data: config
                };
                return response;
            } else {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '配置不存在'
                };
                return response;
            }
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取配置失败'
            };
            return response;
        }
    })

    // 创建配置
    .post('/site-config', async ({ body }) => {
        try {
            const createData = body as CreateSiteConfigRequest;
            const config = await SiteConfigService.createConfig(createData);
            const response: ApiResponse<typeof config> = {
                success: true,
                data: config
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '创建配置失败'
            };
            return response;
        }
    })

    // 更新配置
    .put('/site-config/:key', async ({ params: { key }, body }) => {
        try {
            const updateData = body as UpdateSiteConfigRequest;
            const config = await SiteConfigService.updateConfig(key, updateData);
            if (config) {
                const response: ApiResponse<typeof config> = {
                    success: true,
                    data: config
                };
                return response;
            } else {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '配置不存在'
                };
                return response;
            }
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '更新配置失败'
            };
            return response;
        }
    })

    // 删除配置
    .delete('/site-config/:key', async ({ params: { key } }) => {
        try {
            const deleted = await SiteConfigService.deleteConfig(key);
            if (deleted) {
                const response: ApiResponse<null> = {
                    success: true,
                    message: '配置删除成功'
                };
                return response;
            } else {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '配置不存在'
                };
                return response;
            }
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '删除配置失败'
            };
            return response;
        }
    })

    // 批量更新配置
    .put('/site-config/batch', async ({ body }) => {
        try {
            const configs = body as Record<string, any>;
            const updated = await SiteConfigService.batchUpdateConfigs(configs);
            const response: ApiResponse<typeof updated> = {
                success: true,
                data: updated,
                message: '批量更新成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '批量更新失败'
            };
            return response;
        }
    })