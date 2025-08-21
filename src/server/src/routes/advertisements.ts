import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "../db/connection";
import { advertisementsSchema } from "../db/schema/schema";
import { commonRes, pageRes } from "../plugins/Res";
import { advertisementsModel } from "./advertisements.model";
import { Elysia, t } from "elysia";

export const advertisementsRoute = new Elysia({ prefix: '/advertisements', tags: ['Advertisements'] })
    .model(advertisementsModel)
    .get(
        "/",
        async ({ query: { page, pageSize, sortBy, sortOrder, search, type, position, isActive } }) => {
            try {
                // 搜索条件：支持标题和描述搜索
                const conditions = [];
                if (search) {
                    conditions.push(
                        or(
                            like(advertisementsSchema.title, `%${search}%`),
                            like(advertisementsSchema.link, `%${search}%`),
                        ),
                    );
                }
                if (type) {
                    conditions.push(eq(advertisementsSchema.type, type));
                }
                if (position) {
                    conditions.push(eq(advertisementsSchema.position, position));
                }
                if (isActive !== undefined) {
                    conditions.push(eq(advertisementsSchema.isActive, isActive));
                }

                // 允许的排序字段
                const allowedSortFields = {
                    title: advertisementsSchema.title,
                    sortOrder: advertisementsSchema.sortOrder,
                    createdAt: advertisementsSchema.createdAt,
                    updatedAt: advertisementsSchema.updatedAt,
                };

                // 确定排序字段和方向
                const sortFields =
                    allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
                    advertisementsSchema.sortOrder;
                const sortOrderValue =
                    sortOrder === "desc" ? desc(sortFields) : asc(sortFields);

                // 构建查询
                const queryBuilder = db
                    .select()
                    .from(advertisementsSchema)
                    .where(conditions.length > 0 ? and(...conditions) : undefined)
                    .orderBy(sortOrderValue);

                // 分页处理
                if (page && pageSize) {
                    const offsetValue = ((Number(page) || 1) - 1) * pageSize;
                    queryBuilder.limit(pageSize).offset(offsetValue);
                }

                // 执行查询
                const result = await queryBuilder;

                // 获取总数
                const total = await db
                    .select({ value: count() })
                    .from(advertisementsSchema)
                    .where(conditions.length > 0 ? and(...conditions) : undefined);

                // 返回结果
                return page
                    ? pageRes(
                        result,
                        total[0]?.value || 0,
                        page,
                        pageSize,
                        "分页获取广告列表成功",
                    )
                    : commonRes(result, 200, "获取广告列表成功");
            } catch (error) {
                console.error("获取广告列表出错:", error);
                throw new Error("获取广告列表失败");
            }
        },
        {
            query: "AdvertisementListQueryDto",
            detail: {
                tags: ["Advertisements"],
                summary: "获取广告列表",
                description: "获取广告列表，支持分页、搜索和排序",
            },
        },
    )

    // 获取Banner广告
    .get('/banner', async ({ query: { position } }) => {
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
    },
        {
            query: t.Object({
                position: t.Optional(t.String()),
            }),
        })

    // 获取轮播图广告
    .get('/carousel', async () => {
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
    .get('/:id', async ({ params: { id } }) => {
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
    .post('/', async ({ body }) => {
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
    .put('/:id', async ({ params: { id }, body }) => {
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
    },
        {
            body: 'UpdateAdvertisementDto',
        })

    // 删除广告
    .delete('/:id', async ({ params: { id } }) => {
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
    .patch('/:id/toggle', async ({ params: { id } }) => {
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

    // 获取激活的广告
    .get('/active', async ({ query: { type, position } }) => {
        try {
            const conditions = [eq(advertisementsSchema.isActive, true)];

            if (type) {
                conditions.push(eq(advertisementsSchema.type, type));
            }
            if (position) {
                conditions.push(eq(advertisementsSchema.position, position));
            }



            let query = db
                .select()
                .from(advertisementsSchema)
                .where(and(...conditions))
                .orderBy(desc(advertisementsSchema.sortOrder));



            const advertisements = await query;

            return commonRes(advertisements, 200, '获取活跃广告成功');
        } catch (error) {
            console.error('获取活跃广告失败:', error);
            return commonRes(null, 500, '获取活跃广告失败');
        }
    }, {
        query: t.Object({
            type: t.Optional(t.String()),
            position: t.Optional(t.String()),
        }),
    })

    // 更新广告排序
    .patch('/:id/sort', async ({ params: { id }, body: { sortOrder } }) => {
        try {

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
    }, {
        body: 'UpdateSortRequest',
    })