import { Elysia } from 'elysia';
import { db } from '../db/connection';
import { advertisements as advertisementsSchema } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { commonRes, pageRes } from '../plugins/Res';
import { advertisementsModel, type CreateAdvertisementRequest, type UpdateAdvertisementRequest, type AdvertisementType } from './advertisements.model'
export const advertisementsRoute = new Elysia({ tags: ['Advertisements'] })
    .model(advertisementsModel)
    // 获取广告列表
    .get('/advertisements', async ({ query: { type, position, isActive, page, limit } }) => {
        try {
            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 10;
            const offset = (pageNum - 1) * limitNum;

            // 构建查询条件
            const conditions = [];
            if (type) {
                conditions.push(eq(advertisementsSchema.type, type as AdvertisementType));
            }
            if (position) {
                conditions.push(eq(advertisementsSchema.position, position));
            }
            if (isActive !== undefined) {
                conditions.push(eq(advertisementsSchema.isActive, isActive === 'true'));
            }

            // 查询广告列表
            const [advertisements, totalResult] = await Promise.all([
                db.select()
                    .from(advertisementsSchema)
                    .where(conditions.length > 0 ? and(...conditions) : undefined)
                    .orderBy(desc(advertisementsSchema.sortOrder), desc(advertisementsSchema.createdAt))
                    .limit(limitNum)
                    .offset(offset),
                db.select({ count: sql<number>`count(*)` })
                    .from(advertisementsSchema)
                    .where(conditions.length > 0 ? and(...conditions) : undefined)
            ]);

            return pageRes(advertisements, Number(totalResult[0]?.count), pageNum, limitNum, '获取广告列表成功');
        } catch (error) {
            console.error('获取广告列表失败:', error);
            return commonRes(null, 500, '获取广告列表失败');
        }
    }, {
        query: 'AdvertisementListQueryDto',
        detail: {
            summary: '获取广告列表',
            description: '根据查询参数获取广告列表',
        }

    })

    // 获取Banner广告
    .get('/advertisements/banner', async ({ query: { position } }) => {
        try {
            const conditions = [
                eq(advertisementsSchema.type, 'banner'),
                eq(advertisementsSchema.isActive, true),
            ];

            if (position) {
                conditions.push(eq(advertisementsSchema.position, position));
            }

            const advertisements = await db
                .select()
                .from(advertisementsSchema)
                .where(and(...conditions))
                .orderBy(desc(advertisementsSchema.sortOrder));

            return commonRes(advertisements, 200, '获取Banner广告成功');
        } catch (error) {
            console.error('获取Banner广告失败:', error);
            return commonRes(null, 500, '获取Banner广告失败');
        }
    })

    // 获取轮播图广告
    .get('/advertisements/carousel', async () => {
        try {
            const advertisements = await db
                .select()
                .from(advertisementsSchema)
                .where(
                    and(
                        eq(advertisementsSchema.type, 'carousel'),
                        eq(advertisementsSchema.isActive, true)
                    )
                )
                .orderBy(desc(advertisementsSchema.sortOrder));

            return commonRes(advertisements, 200, '获取轮播图广告成功');
        } catch (error) {
            console.error('获取轮播图广告失败:', error);
            return commonRes(null, 500, '获取轮播图广告失败');
        }
    })

    // 根据ID获取广告
    .get('/advertisements/:id', async ({ params: { id } }) => {
        try {
            const [advertisement] = await db
                .select()
                .from(advertisementsSchema)
                .where(eq(advertisementsSchema.id, parseInt(id)));

            if (!advertisement) {
                return commonRes(null, 404, '广告不存在');
            }

            return commonRes(advertisement, 200, '获取广告成功');
        } catch (error) {
            console.error('获取广告详情失败:', error);
            return commonRes(null, 500, '获取广告详情失败');
        }
    })

    // 创建广告
    .post('/advertisements', async ({ body }) => {
        try {
            const [advertisement] = await db
                .insert(advertisementsSchema)
                .values({
                    title: body.title,
                    type: body.type,
                    image: body.image,
                    link: body.link,
                    position: body.position,
                    sortOrder: body.sortOrder || 0,
                    isActive: body.isActive ?? true,
                    startDate: body.startDate,
                    endDate: body.endDate,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning();

            return commonRes(advertisement, 201, '广告创建成功');
        } catch (error) {
            console.error('创建广告失败:', error);
            return commonRes(null, 500, '创建广告失败');
        }
    }, {
        body: 'CreateAdvertisementDto',
        detail: {
            tags: ['Advertisements'],
            summary: '创建广告',
            description: '创建新的广告',
        }
    })

    // 更新广告
    .put('/advertisements/:id', async ({ params: { id }, body }) => {
        try {
            const [advertisement] = await db
                .update(advertisementsSchema)
                .set({
                    ...body,
                    updatedAt: new Date(),
                })
                .where(eq(advertisementsSchema.id, parseInt(id)))
                .returning();

            if (!advertisement) {
                return commonRes(null, 404, '广告不存在');
            }

            return commonRes(advertisement, 200, '广告更新成功');
        } catch (error) {
            console.error('更新广告失败:', error);
            return commonRes(null, 500, '更新广告失败');
        }
    })

    // 删除广告
    .delete('/advertisements/:id', async ({ params: { id } }) => {
        try {
            const [deleted] = await db
                .delete(advertisementsSchema)
                .where(eq(advertisementsSchema.id, parseInt(id)))
                .returning();

            if (!deleted) {
                return commonRes(null, 404, '广告不存在');
            }

            return commonRes(null, 200, '广告删除成功');
        } catch (error) {
            console.error('删除广告失败:', error);
            return commonRes(null, 500, '删除广告失败');
        }
    })

    // 切换广告状态
    .patch('/advertisements/:id/toggle', async ({ params: { id } }) => {
        try {
            // 先获取当前状态
            const [current] = await db
                .select({ isActive: advertisementsSchema.isActive })
                .from(advertisementsSchema)
                .where(eq(advertisementsSchema.id, parseInt(id)));

            if (!current) {
                return commonRes(null, 404, '广告不存在');
            }

            // 切换状态
            const [advertisement] = await db
                .update(advertisementsSchema)
                .set({
                    isActive: !current.isActive,
                    updatedAt: new Date(),
                })
                .where(eq(advertisementsSchema.id, parseInt(id)))
                .returning();

            return commonRes(advertisement, 200, '广告状态更新成功');
        } catch (error) {
            console.error('更新广告状态失败:', error);
            return commonRes(null, 500, '更新广告状态失败');
        }
    })

    // 获取活跃广告（前台展示用）
    .get('/advertisements/active', async ({ query: { type, position, limit } }) => {
        try {
            const conditions = [eq(advertisementsSchema.isActive, true)];

            if (type) {
                conditions.push(eq(advertisementsSchema.type, type));
            }
            if (position) {
                conditions.push(eq(advertisementsSchema.position, position));
            }

            const limitNum = limit ? parseInt(limit as string) : undefined;

            let query = db
                .select()
                .from(advertisementsSchema)
                .where(and(...conditions))
                .orderBy(desc(advertisementsSchema.sortOrder));

            if (limitNum) {
                query = query.limit(limitNum);
            }

            const advertisements = await query;

            return commonRes(advertisements, 200, '获取活跃广告成功');
        } catch (error) {
            console.error('获取活跃广告失败:', error);
            return commonRes(null, 500, '获取活跃广告失败');
        }
    })

    // 更新广告排序
    .patch('/advertisements/:id/sort', async ({ params: { id }, body }) => {
        try {
            const { sortOrder } = body as { sortOrder: number };
            const [advertisement] = await db
                .update(advertisementsSchema)
                .set({
                    sortOrder,
                    updatedAt: new Date(),
                })
                .where(eq(advertisementsSchema.id, parseInt(id)))
                .returning();

            if (!advertisement) {
                return commonRes(null, 404, '广告不存在');
            }

            return commonRes(advertisement, 200, '广告排序更新成功');
        } catch (error) {
            console.error('更新广告排序失败:', error);
            return commonRes(null, 500, '更新广告排序失败');
        }
    })