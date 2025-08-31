/**
 * 分类管理路由
 * 提供分类列表、详情、管理等功能
 */

import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { Elysia, status } from "elysia";
import { db } from "../db/connection";
import { categoriesSchema } from "../db/schema";
import { commonRes, pageRes } from "../plugins/Res";
import { buildTree } from "../../../share/utils/buildTree";
import { categoriesModel } from "./categories.model";

// 分类状态枚举
const CategoryStatus = {
	VISIBLE: true,
	HIDDEN: false,
} as const;

export const categoriesRoute = new Elysia({ prefix: "/categories" })
	.model(categoriesModel)


	// 获取分类列表
	.get("/", async ({ query }) => {
		try {
			const { page, pageSize, search, name, parentId, isVisible, sortBy, sortOrder } = query;

			// 构建查询条件
			const conditions = [];
			if (search) {
				conditions.push(
					or(
						like(categoriesSchema.name, `%${search}%`),
						like(categoriesSchema.description, `%${search}%`)
					)
				);
			}
			if (name) {
				conditions.push(like(categoriesSchema.name, `%${name}%`));
			}
			if (parentId) {
				conditions.push(eq(categoriesSchema.parentId, parseInt(parentId, 10)));
			}
			if (isVisible !== undefined) {
				conditions.push(eq(categoriesSchema.isVisible, isVisible));
			}

			// 排序配置
			const allowedSortFields = {
				id: categoriesSchema.id,
				name: categoriesSchema.name,
				sortOrder: categoriesSchema.sortOrder,
				createdAt: categoriesSchema.createdAt,
				updatedAt: categoriesSchema.updatedAt,
			};

			const sortFields =
				allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
				categoriesSchema.sortOrder;

			// 排序配置
			const sortOrderValue =
				sortOrder === "desc" ? desc(sortFields) : asc(sortFields);

			const queryBuilder = db
				.select()
				.from(categoriesSchema)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(sortOrderValue);

			// 分页处理
			if (page && pageSize) {
				const offsetValue = ((Number(page) || 1) - 1) * pageSize;
				queryBuilder.limit(pageSize).offset(offsetValue);
			}

			// 获取总数query
			const totalQuery = await db
				.select({ value: count() })
				.from(categoriesSchema)
				.where(conditions.length > 0 ? and(...conditions) : undefined);

			const [data, totalResult] = await Promise.all([
				queryBuilder,
				totalQuery
			]);

			return page
				? pageRes(data, totalResult[0]?.value || 0, page, pageSize, "获取分类列表成功")
				: commonRes(data, 200, "获取分类列表成功");
		} catch (error) {
			console.error("查询分类列表失败:", error);
			return status(500, "查询分类列表失败");
		}
	}, {
		query: "CategoryListQueryDto"
	})

	// 根据ID获取分类详情
	.get("/:id", async ({ params: { id } }) => {
		try {
			const item = await getById(categoriesSchema, +id);
			if (!item) return status(404, "分类不存在");
			return commonRes(item, 200, "获取分类详情成功");
		} catch (error) {
			console.error("查询分类详情失败:", error);
			return status(500, "查询分类详情失败");
		}
	})

	// 创建分类
	.post("/", async ({ body }) => {
		try {
			const [newCategory] = await db
				.insert(categoriesSchema)
				.values(body)
				.returning();
			return commonRes(newCategory, 200, "创建分类成功");
		} catch (error: any) {
			console.error("创建分类失败:", error);
			if (!error.cause) {
				return commonRes(error.message, 500, "创建分类失败，请稍后重试");
			}
			return commonRes(error.cause.detail, 500, "创建分类失败，请稍后重试");
			// 其他数据库错误
		}
	}, {
		body: "CreateCategoryDto"
	})

	// 更新分类信息
	.put("/:id", async ({ params: { id }, body }) => {
		try {
			// 存在性检查
			const existing = await getById(categoriesSchema, +id);
			if (!existing) return status(404, "分类不存在");

			// 执行更新
			const [updated] = await db
				.update(categoriesSchema)
				.set({ ...body, updatedAt: new Date() })
				.where(eq(categoriesSchema.id, +id))
				.returning();
			return commonRes(updated, 200, "更新分类成功");
		} catch (error: any) {
			console.error("更新分类失败:", error);

			// 处理唯一约束冲突错误
			if (error.code === '23505') {
				if (error.constraint_name === 'categories_slug_unique') {
					return commonRes(null, 400, "分类标识符已存在，请使用不同的名称");
				}
				return commonRes(null, 400, "数据已存在，请检查输入信息");
			}

			// 其他数据库错误
			return commonRes(null, 500, "更新分类失败，请稍后重试");
		}
	}, {
		body: "UpdateCategoryDto"
	})

	// 删除分类
	.delete("/:id", async ({ params: { id } }) => {
		try {
			const existing = await getById(categoriesSchema, +id);
			if (!existing) return status(404, "分类不存在");

			await db
				.delete(categoriesSchema)
				.where(eq(categoriesSchema.id, +id));
			return status(200, "分类删除成功");
		} catch (error) {
			console.error("删除分类失败:", error);
			return status(500, "删除分类失败");
		}
	})

	// 获取分类树形结构
	.get("/tree", async () => {
		try {
			const dbCategories = await db
				.select()
				.from(categoriesSchema)
				.orderBy(asc(categoriesSchema.sortOrder));

			const allCategories = dbCategories.map((cat) => ({
				...cat,
				id: cat.id.toString(),
				parentId: cat.parentId?.toString(),
			}));

			return commonRes(buildTree(allCategories), 200, "获取分类树成功");
		} catch (error) {
			console.error("获取分类树失败:", error);
			return status(500, "获取分类树失败");
		}
	})

	// 切换分类显示状态
	.patch("/:id/toggle", async ({ params: { id } }) => {
		try {
			const existing = await getById(categoriesSchema, +id);
			if (!existing) return status(404, "分类不存在");

			const [category] = await db
				.update(categoriesSchema)
				.set({
					isVisible: !existing.isVisible,
					updatedAt: new Date(),
				})
				.where(eq(categoriesSchema.id, +id))
				.returning();

			return commonRes(category, 200, "切换分类状态成功");
		} catch (error) {
			console.error("切换分类状态失败:", error);
			return status(500, "切换分类状态失败");
		}
	})

	// 更新分类排序
	.patch("/:id/sort", async ({ params: { id }, body: { sortOrder } }) => {
		try {
			const existing = await getById(categoriesSchema, +id);
			if (!existing) return status(404, "分类不存在");

			const [category] = await db
				.update(categoriesSchema)
				.set({
					sortOrder,
					updatedAt: new Date(),
				})
				.where(eq(categoriesSchema.id, +id))
				.returning();

			return commonRes(category, 200, "更新分类排序成功");
		} catch (error) {
			console.error("更新分类排序失败:", error);
			return status(500, "更新分类排序失败");
		}
	}, {
		body: "UpdateSortRequest"
	});

// 工具函数
async function getById(schema: any, id: number) {
	const result = await db.select().from(schema).where(eq(schema.id, id)).limit(1);
	return result[0];
}