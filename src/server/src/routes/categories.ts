import { Elysia } from "elysia";
import { eq, desc, asc, and, isNull, sql, like, or } from 'drizzle-orm';
import { db } from '../db/connection';
import { categoriesSchema } from '../db/schema';
import { commonRes, pageRes } from '../plugins/Res';
import { categoriesModel, type Category, type CategoryTree } from './categories.model';



// 获取所有分类
// 构建单个分类的树形结构
function buildCategoryTree(category: Category, allCategories: Category[]): CategoryTree {
    const children = allCategories
        .filter(cat => cat.parentId === category.id && cat.isVisible)
        .map(cat => buildCategoryTree(cat, allCategories));

    return {
        ...category,
        children
    };
}

export const categoriesRoute = new Elysia({ tags: ['Categories'] })
    .model(categoriesModel)
    // 获取分类树形结构
    .get('/categories/tree', async () => {
        try {
            const dbCategories = await db.select().from(categoriesSchema).orderBy(asc(categoriesSchema.sortOrder));
            const allCategories = dbCategories.map(cat => ({
                ...cat,
                id: cat.id.toString(),
                parentId: cat.parentId?.toString(),
                level: 0
            }));
            const rootCategories = allCategories.filter(cat => !cat.parentId && cat.isVisible);
            const categoryTree = rootCategories.map(cat => buildCategoryTree(cat, allCategories));
            return commonRes(categoryTree, 200, '获取分类树成功');
        } catch (error) {
            console.error('获取分类树失败:', error);
            return commonRes(null, 500, '获取分类树失败');
        }
    },
        {

            detail: {
                tags: ["Categories"],
                summary: "获取分类树形结构",
                description: '获取分类树形结构',
            }
        })

    // 获取所有分类（管理后台用）
    .get('/categories', async ({ query: { page, pageSize, sortBy, sortOrder, search, name, parentId, isVisible } }) => {
        try {
            // 搜索条件构建
            const conditions = [];

            // search参数：使用or连接多个字段搜索
            if (search) {
                conditions.push(
                    or(
                        like(categoriesSchema.name, `%${search}%`),
                        like(categoriesSchema.description, `%${search}%`)
                    )
                );
            }

            // 独立的精确搜索条件
            if (name) {
                conditions.push(like(categoriesSchema.name, `%${name}%`));
            }

            if (parentId) {
                conditions.push(eq(categoriesSchema.parentId, parseInt(parentId)));
            }

            if (isVisible !== undefined) {
                conditions.push(eq(categoriesSchema.isVisible, isVisible));
            }

            // 允许的排序字段
            const allowedSortFields = {
                id: categoriesSchema.id,
                name: categoriesSchema.name,
                sortOrder: categoriesSchema.sortOrder,
                createdAt: categoriesSchema.createdAt
            };

            // 确定排序字段和方向
            const sortField = allowedSortFields[sortBy as keyof typeof allowedSortFields] || categoriesSchema.sortOrder;
            const sortOrderValue = sortOrder === 'desc' ? desc(sortField) : asc(sortField);

            // 构建基础查询
            const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

            // 根据是否有page参数决定分页或全部查询
            if (page !== undefined) {
                // 分页查询
                const pageNum = Number(page) || 1;
                const pageSizeNum = Number(pageSize) || 10;
                const offset = (pageNum - 1) * pageSizeNum;

                const [result, totalResult] = await Promise.all([
                    db.select().from(categoriesSchema)
                        .where(whereCondition)
                        .orderBy(sortOrderValue)
                        .limit(pageSizeNum)
                        .offset(offset),
                    db.select({ value: sql`count(*)` }).from(categoriesSchema)
                        .where(whereCondition)
                ]);

                const categories = result.map(cat => ({
                    ...cat,
                    id: cat.id.toString(),
                    parentId: cat.parentId?.toString(),
                    level: 0
                }));
                return pageRes(categories, Number(totalResult[0]?.value), pageNum, pageSizeNum, '分页获取分类列表成功');
            }

            // 全部查询
            const result = await db.select().from(categoriesSchema)
                .where(whereCondition)
                .orderBy(sortOrderValue);

            const categories = result.map(cat => ({
                ...cat,
                id: cat.id.toString(),
                parentId: cat.parentId?.toString(),
                level: 0
            }));
            return commonRes(categories, 200, '获取分类列表成功');
        } catch (error) {
            console.error('获取分类列表失败:', error);
            return commonRes(null, 500, '获取分类列表失败');
        }
    }, {
        query: 'UnifiedQueryParams'
    })

    // 根据ID获取分类
    .get('/categories/:id', async ({ params: { id } }) => {
        try {

            const dbCategory = await db.select().from(categoriesSchema).where(eq(categoriesSchema.id, parseInt(id))).limit(1);
            const category = dbCategory.length > 0 ? {
                ...dbCategory[0],
                id: dbCategory[0].id.toString(),
                parentId: dbCategory[0].parentId?.toString(),
                level: 0
            } : null;
            if (!category) {
                return commonRes(null, 404, '分类不存在');
            }
            return commonRes(category, 200, '获取分类成功');
        } catch (error) {
            console.error('获取分类失败:', error);
            return commonRes(null, 500, '获取分类失败');
        }
    })

    // 创建分类
    .post('/categories', async ({ body }) => {
        try {
            const result = await db.insert(categoriesSchema).values({
                name: body.name,
                slug: body.slug,
                description: body.description,
                parentId: body.parentId || null,
                sortOrder: body.sortOrder || 0,
                isVisible: body.isVisible ?? true,
                icon: body.icon,
                image: body.image,
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning();
            const newCategory = {
                ...result[0],
                id: result[0].id.toString(),
                parentId: result[0].parentId?.toString(),
                level: 0
            }
            return commonRes(newCategory, 201, '分类创建成功');
        } catch (error) {
            console.error('创建分类失败:', error);
            return commonRes(null, 500, '创建分类失败');
        }
    }, {
        body: 'CreateCategoryDto',
        detail: {
            tags: ["Categories"],
            summary: "创建分类",
            description: '创建分类',
        }
    })

    // 更新分类
    .put('/categories/:id', async ({ params: { id }, body }) => {
        try {
            const result = await db.update(categoriesSchema)
                .set({
                    ...body,
                    updatedAt: new Date()
                })
                .where(eq(categoriesSchema.id, parseInt(id)))
                .returning();

            if (result.length === 0) {
                return commonRes(null, 404, '分类不存在');
            }

            const updatedCategory = {
                ...result[0],
                id: result[0].id.toString(),
                parentId: result[0].parentId?.toString(),
                level: 0
            };
            if (!updatedCategory) {
                return commonRes(null, 404, '分类不存在');
            }
            return commonRes(updatedCategory, 200, '分类更新成功');
        } catch (error) {
            console.error('更新分类失败:', error);
            return commonRes(null, 500, '更新分类失败');
        }
    }, {
        body: 'UpdateCategoryDto',
        detail: {
            tags: ["Categories"],
            summary: "更新分类",
            description: '更新分类',
        }


    })

    // 删除分类
    .delete('/categories/:id', async ({ params: { id } }) => {
        try {
            const deleted = await deleteCategory(id);
            if (!deleted) {
                return commonRes(null, 404, '分类不存在');
            }
            return commonRes(null, 200, '分类删除成功');
        } catch (error) {
            console.error('删除分类失败:', error);
            return commonRes(null, 500, '删除分类失败');
        }
    })

    // 获取子分类
    .get('/categories/:id/children', async ({ params: { id } }) => {
        try {
            // 获取指定父分类下的所有子分类
            const dbChildren = await db.select().from(categoriesSchema)
                .where(eq(categoriesSchema.parentId, parseInt(id)))
                .orderBy(asc(categoriesSchema.sortOrder));

            const children = dbChildren.map(cat => ({
                ...cat,
                id: cat.id.toString(),
                parentId: cat.parentId?.toString(),
                level: 0
            }));
            return commonRes(children, 200, '获取子分类成功');
        } catch (error) {
            console.error('获取子分类失败:', error);
            return commonRes(null, 500, '获取子分类失败');
        }
    })

    // 更新分类排序
    .patch('/categories/:id/sort', async ({ params: { id }, body }) => {
        try {
            const { sortOrder } = body as { sortOrder: number };

            // 更新分类的排序值
            const result = await db.update(categoriesSchema)
                .set({
                    sortOrder: sortOrder,
                    updatedAt: new Date()
                })
                .where(eq(categoriesSchema.id, parseInt(id)))
                .returning();

            if (result.length === 0) {
                return commonRes(null, 404, '分类不存在');
            }

            const updated = {
                ...result[0],
                id: result[0].id.toString(),
                parentId: result[0].parentId?.toString(),
                level: 0
            };
            return commonRes(updated, 200, '排序更新成功');
        } catch (error) {
            console.error('更新排序失败:', error);
            return commonRes(null, 500, '更新排序失败');
        }
    })

    // 切换分类显示状态
    .patch('/categories/:id/toggle-visibility', async ({ params: { id } }) => {
        try {
            // 获取当前分类
            const currentCategory = await db.select().from(categoriesSchema)
                .where(eq(categoriesSchema.id, parseInt(id)))
                .limit(1);

            if (currentCategory.length === 0) {
                return commonRes(null, 404, '分类不存在');
            }

            // 切换显示状态
            const result = await db.update(categoriesSchema)
                .set({
                    isVisible: !currentCategory[0].isVisible,
                    updatedAt: new Date()
                })
                .where(eq(categoriesSchema.id, parseInt(id)))
                .returning();

            const updated = {
                ...result[0],
                id: result[0].id.toString(),
                parentId: result[0].parentId?.toString(),
                level: 0
            };
            return commonRes(updated, 200, '显示状态切换成功');
        } catch (error) {
            console.error('切换显示状态失败:', error);
            return commonRes(null, 500, '切换显示状态失败');
        }
    })

    // 分类上移
    .patch('/categories/:id/move-up', async ({ params: { id } }) => {
        try {
            // 获取当前分类
            const currentCategory = await db.select().from(categoriesSchema)
                .where(eq(categoriesSchema.id, parseInt(id)))
                .limit(1);

            if (currentCategory.length === 0) {
                return commonRes(null, 404, '分类不存在');
            }

            const current = currentCategory[0];

            // 查找同级别中排序值小于当前分类且最接近的分类
            const prevCategory = await db.select().from(categoriesSchema)
                .where(
                    and(
                        current.parentId ? eq(categoriesSchema.parentId, current.parentId) : isNull(categoriesSchema.parentId),
                        sql`${categoriesSchema.sortOrder} < ${current.sortOrder}`
                    )
                )
                .orderBy(desc(categoriesSchema.sortOrder))
                .limit(1);

            if (prevCategory.length === 0) {
                return commonRes(null, 400, '已经是第一个分类，无法上移');
            }

            const prev = prevCategory[0];

            // 交换排序值
            await db.update(categoriesSchema)
                .set({ sortOrder: prev.sortOrder, updatedAt: new Date() })
                .where(eq(categoriesSchema.id, current.id));

            await db.update(categoriesSchema)
                .set({ sortOrder: current.sortOrder, updatedAt: new Date() })
                .where(eq(categoriesSchema.id, prev.id));

            return commonRes(null, 200, '分类上移成功');
        } catch (error) {
            console.error('分类上移失败:', error);
            return commonRes(null, 500, '分类上移失败');
        }
    })

    // 分类下移
    .patch('/categories/:id/move-down', async ({ params: { id } }) => {
        try {
            // 获取当前分类
            const currentCategory = await db.select().from(categoriesSchema)
                .where(eq(categoriesSchema.id, parseInt(id)))
                .limit(1);

            if (currentCategory.length === 0) {
                return commonRes(null, 404, '分类不存在');
            }

            const current = currentCategory[0];

            // 查找同级别中排序值大于当前分类且最接近的分类
            const nextCategory = await db.select().from(categoriesSchema)
                .where(
                    and(
                        current.parentId ? eq(categoriesSchema.parentId, current.parentId) : isNull(categoriesSchema.parentId),
                        sql`${categoriesSchema.sortOrder} > ${current.sortOrder}`
                    )
                )
                .orderBy(asc(categoriesSchema.sortOrder))
                .limit(1);

            if (nextCategory.length === 0) {
                return commonRes(null, 400, '已经是最后一个分类，无法下移');
            }

            const next = nextCategory[0];

            // 交换排序值
            await db.update(categoriesSchema)
                .set({ sortOrder: next.sortOrder, updatedAt: new Date() })
                .where(eq(categoriesSchema.id, current.id));

            await db.update(categoriesSchema)
                .set({ sortOrder: current.sortOrder, updatedAt: new Date() })
                .where(eq(categoriesSchema.id, next.id));

            return commonRes(null, 200, '分类下移成功');
        } catch (error) {
            console.error('分类下移失败:', error);
            return commonRes(null, 500, '分类下移失败');
        }
    })