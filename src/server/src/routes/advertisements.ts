import { Elysia } from "elysia";
import { AdvertisementService } from '../services/advertisementService';
import type { CreateAdvertisementRequest, UpdateAdvertisementRequest, AdvertisementQuery } from '../../../types/advertisement';
import type { ApiResponse } from '../../../types/category';

export const advertisementsRoute = new Elysia({ tags: ['Advertisements'] })
    // 获取广告列表
    .get('/advertisements', async ({ query }) => {
        try {
            const queryParams: AdvertisementQuery = {
                type: query.type as any,
                position: query.position as any,
                isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
                page: query.page ? parseInt(query.page as string) : 1,
                limit: query.limit ? parseInt(query.limit as string) : 20
            };
            const result = await AdvertisementService.getAdvertisements(queryParams);
            const response: ApiResponse<typeof result> = {
                success: true,
                data: result
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取广告列表失败'
            };
            return response;
        }
    })

    // 获取Banner广告
    .get('/advertisements/banner', async ({ query }) => {
        try {
            const position = query.position as any;
            const advertisements = await AdvertisementService.getBannerAdvertisements(position);
            const response: ApiResponse<typeof advertisements> = {
                success: true,
                data: advertisements
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取Banner广告失败'
            };
            return response;
        }
    })

    // 获取轮播图广告
    .get('/advertisements/carousel', async ({ query }) => {
        try {
            const position = query.position as any;
            const advertisements = await AdvertisementService.getCarouselAdvertisements(position);
            const response: ApiResponse<typeof advertisements> = {
                success: true,
                data: advertisements
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取轮播图广告失败'
            };
            return response;
        }
    })

    // 根据ID获取广告
    .get('/advertisements/:id', async ({ params: { id } }) => {
        try {
            const advertisement = await AdvertisementService.getAdvertisementById(id);
            if (!advertisement) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '广告不存在'
                };
                return response;
            }
            const response: ApiResponse<typeof advertisement> = {
                success: true,
                data: advertisement
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取广告失败'
            };
            return response;
        }
    })

    // 创建广告
    .post('/advertisements', async ({ body }) => {
        try {
            const createData = body as CreateAdvertisementRequest;
            const advertisement = await AdvertisementService.createAdvertisement(createData);
            const response: ApiResponse<typeof advertisement> = {
                success: true,
                data: advertisement,
                message: '广告创建成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '创建广告失败'
            };
            return response;
        }
    })

    // 更新广告
    .put('/advertisements/:id', async ({ params: { id }, body }) => {
        try {
            const updateData = body as UpdateAdvertisementRequest;
            const advertisement = await AdvertisementService.updateAdvertisement(id, updateData);
            if (!advertisement) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '广告不存在'
                };
                return response;
            }
            const response: ApiResponse<typeof advertisement> = {
                success: true,
                data: advertisement,
                message: '广告更新成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '更新广告失败'
            };
            return response;
        }
    })

    // 删除广告
    .delete('/advertisements/:id', async ({ params: { id } }) => {
        try {
            const deleted = await AdvertisementService.deleteAdvertisement(id);
            if (!deleted) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '广告不存在'
                };
                return response;
            }
            const response: ApiResponse<null> = {
                success: true,
                message: '广告删除成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '删除广告失败'
            };
            return response;
        }
    })

    // 切换广告状态
    .patch('/advertisements/:id/toggle-status', async ({ params: { id } }) => {
        try {
            const advertisement = await AdvertisementService.toggleAdvertisementStatus(id);
            if (!advertisement) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '广告不存在'
                };
                return response;
            }
            const response: ApiResponse<typeof advertisement> = {
                success: true,
                data: advertisement,
                message: '广告状态切换成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '切换广告状态失败'
            };
            return response;
        }
    })

    // 获取活跃广告（前台展示用）
    .get('/advertisements/active', async ({ query }) => {
        try {
            const type = query.type as any;
            const position = query.position as any;
            const limit = query.limit ? parseInt(query.limit as string) : undefined;
            const advertisements = await AdvertisementService.getActiveAdvertisements(type, position, limit);
            const response: ApiResponse<typeof advertisements> = {
                success: true,
                data: advertisements
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取活跃广告失败'
            };
            return response;
        }
    })

    // 更新广告排序
    .patch('/advertisements/:id/sort', async ({ params: { id }, body }) => {
        try {
            const { sortOrder } = body as { sortOrder: number };
            const advertisement = await AdvertisementService.updateAdvertisementSort(id, sortOrder);
            if (!advertisement) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '广告不存在'
                };
                return response;
            }
            const response: ApiResponse<typeof advertisement> = {
                success: true,
                data: advertisement,
                message: '广告排序更新成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '更新广告排序失败'
            };
            return response;
        }
    })