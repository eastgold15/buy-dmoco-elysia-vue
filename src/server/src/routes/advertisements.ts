/**
 * 广告管理路由
 * 提供广告列表、详情、管理等功能
 */

import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { Elysia, status } from "elysia";
import { db } from "../db/connection";
import { advertisementsSchema } from "../db/schema/schema";
import { commonRes, pageRes } from "../plugins/Res";
import { advertisementsModel } from "./advertisements.model";


export const advertisementsRoute = new Elysia({ prefix: "/advertisements" })
	.model(advertisementsModel)
	.guard(
		{
			transform({ body }: { body: any }) {
				body.startDate = body.startDate ? new Date(body.startDate) : null,
					body.endDate = body.endDate ? new Date(body.endDate) : null
			}

		}, (app) => app
			// 创建广告
			.post("/", async ({ body }) => {
				try {
					const [newAdvertisement] = await db
						.insert(advertisementsSchema)
						.values(body)
						.returning();
					return commonRes(newAdvertisement, 200, "创建广告成功");
				} catch (error) {
					console.error("创建广告失败:", error);
					return status(500, "创建广告失败");
				}
			}, {
				body: "CreateAdvertisementDto"
			})
			// 更新广告信息
			.put("/:id", async ({ params: { id }, body }) => {
				try {
					// 存在性检查
					const existing = await getById(advertisementsSchema, +id);
					if (!existing) return status(404, "广告不存在");

					body.updatedAt = new Date();

					// 执行更新
					const [updated] = await db
						.update(advertisementsSchema)
						.set(body)
						.where(eq(advertisementsSchema.id, +id))
						.returning();
					return commonRes(updated, 200, "更新广告成功");
				} catch (error) {
					console.error("更新广告失败:", error);
					return status(500, "更新广告失败");
				}
			}, {
				body: "UpdateAdvertisementDto"
			})
	)

	// 获取广告列表
	.get("/", async ({ query }) => {
		try {
			const { page, pageSize, search, type, position, isActive, sortBy, sortOrder } = query;

			// 构建查询条件
			const conditions = [];
			if (search) {
				conditions.push(
					or(
						like(advertisementsSchema.title, `%${search}%`),
						like(advertisementsSchema.link, `%${search}%`)
					)
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

			// 排序配置
			const allowedSortFields = {
				id: advertisementsSchema.id,
				title: advertisementsSchema.title,
				sortOrder: advertisementsSchema.sortOrder,
				createdAt: advertisementsSchema.createdAt,
				updatedAt: advertisementsSchema.updatedAt,
			};

			const sortFields =
				allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
				advertisementsSchema.sortOrder;

			// 排序配置
			const sortOrderValue =
				sortOrder === "desc" ? desc(sortFields) : asc(sortFields);

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

			// 获取总数query
			const totalQuery = await db
				.select({ value: count() })
				.from(advertisementsSchema)
				.where(conditions.length > 0 ? and(...conditions) : undefined);

			const [data, totalResult] = await Promise.all([
				queryBuilder,
				totalQuery
			]);

			return page
				? pageRes(data, totalResult[0]?.value || 0, page, pageSize, "获取广告列表成功")
				: commonRes(data, 200, "获取广告列表成功");
		} catch (error) {
			console.error("查询广告列表失败:", error);
			return status(500, "查询广告列表失败");
		}
	}, {
		query: "AdvertisementListQueryDto"
	})

	// 根据ID获取广告详情
	.get("/:id", async ({ params: { id } }) => {
		try {
			const item = await getById(advertisementsSchema, +id);
			if (!item) return commonRes(null, 404, "广告不存在");
			return commonRes(item, 200, "获取广告详情成功");
		} catch (error) {
			console.error("查询广告详情失败:", error);
			return status(500, "查询广告详情失败");
		}
	})



	// 删除广告
	.delete("/:id", async ({ params: { id } }) => {
		try {
			const existing = await getById(advertisementsSchema, +id);
			if (!existing) return status(404, "广告不存在");

			await db
				.delete(advertisementsSchema)
				.where(eq(advertisementsSchema.id, +id));
			return commonRes(null, 200, "广告删除成功");
		} catch (error) {
			console.error("删除广告失败:", error);
			return status(500, "删除广告失败");
		}
	})

	// 获取指定位置的轮播图广告
	.get("/position/:position", async ({ params: { position } }) => {
		try {
			const conditions = [
				eq(advertisementsSchema.type, "carousel"),
				eq(advertisementsSchema.isActive, true),
				eq(advertisementsSchema.position, position),
			];

			const advertisements = await db
				.select()
				.from(advertisementsSchema)
				.where(and(...conditions))
				.orderBy(desc(advertisementsSchema.sortOrder));

			return commonRes(advertisements, 200, `获取${position}位置轮播图成功`);
		} catch (error) {
			console.error(`获取${position}位置轮播图失败:`, error);
			return status(500, `获取${position}位置轮播图失败`);
		}
	})

	// 获取轮播图广告
	.get("/carousel", async () => {
		try {
			const advertisements = await db
				.select()
				.from(advertisementsSchema)
				.where(
					and(
						eq(advertisementsSchema.type, "carousel"),
						eq(advertisementsSchema.isActive, true),
					)
				)
				.orderBy(desc(advertisementsSchema.sortOrder));

			return commonRes(advertisements, 200, "获取轮播图广告成功");
		} catch (error) {
			console.error("获取轮播图广告失败:", error);
			return status(500, "获取轮播图广告失败");
		}
	})

	// 切换广告状态
	.patch("/:id/toggle", async ({ params: { id } }) => {
		try {
			// 先获取当前状态
			const existing = await getById(advertisementsSchema, +id);
			if (!existing) return commonRes(null, 404, "广告不存在");

			// 切换状态
			const [advertisement] = await db
				.update(advertisementsSchema)
				.set({
					isActive: !existing.isActive,
					updatedAt: new Date(),
				})
				.where(eq(advertisementsSchema.id, +id))
				.returning();

			return commonRes(advertisement, 200, "切换广告状态成功");
		} catch (error) {
			console.error("切换广告状态失败:", error);
			return status(500, "切换广告状态失败");
		}
	})

	// 更新广告排序
	.patch("/:id/sort", async ({ params: { id }, body: { sortOrder } }) => {
		try {
			const existing = await getById(advertisementsSchema, +id);
			if (!existing) return commonRes(null, 404, "广告不存在");

			const [advertisement] = await db
				.update(advertisementsSchema)
				.set({
					sortOrder,
					updatedAt: new Date(),
				})
				.where(eq(advertisementsSchema.id, +id))
				.returning();

			return commonRes(advertisement, 200, "更新广告排序成功");
		} catch (error) {
			console.error("更新广告排序失败:", error);
			return status(500, "更新广告排序失败");
		}
	}, {
		body: "UpdateSortRequest"
	});

// 工具函数
async function getById(schema: any, id: number) {
	const result = await db.select().from(schema).where(eq(schema.id, id)).limit(1);
	return result[0];
}