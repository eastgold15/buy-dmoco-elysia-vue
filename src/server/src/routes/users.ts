/**
 * 用户管理路由
 * 提供用户列表、用户详情、管理员管理等功能
 */

import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { Elysia, status, t } from "elysia";
import { db } from "../db/connection";
import { userSchema } from "../db/schema";
import { commonRes, pageRes } from "../plugins/Res";
import { userRouteModel } from "./users.model";

// 用户状态枚举
const UserStatus = {
	ACTIVE: 1,
	DISABLED: 0,
} as const;



export const usersRoute = new Elysia({ prefix: "/users" })
	.model(userRouteModel)
	// 获取用户列表
	.get(
		"/",
		async ({
			query: {
				page,
				pageSize,
				search,
				status: statusQ,
				sortBy = "createdAt",
				sortOrder = "desc",
			},
			status,
		}) => {
			try {
				// 构建查询条件
				const conditions = [];

				if (search) {
					conditions.push(
						or(
							like(userSchema.username, `%${search}%`),
							like(userSchema.nickname, `%${search}%`),
						),
					);
				}

				if (statusQ !== undefined) {
					conditions.push(eq(userSchema.status, Number(statusQ)));
				}

				const allowedSortFields = {
					id: userSchema.id,
					username: userSchema.username,
					status: userSchema.status,
					createdAt: userSchema.createdAt,
					updatedAt: userSchema.updatedAt,
				};

				const sortFields =
					allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
					userSchema.id;
				// 排序配置
				const sortOrderValue =
					sortOrder === "desc" ? desc(sortFields) : asc(sortFields);

				const queryBuilder = db
					.select()
					.from(userSchema)
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
					.from(userSchema)
					.where(conditions.length > 0 ? and(...conditions) : undefined);

				if (!total[0]) {
					return status(200, "查询用户列表为空");
				}

				return page
					? pageRes(result, total[0].value, page, pageSize, "获取用户列表成功")
					: commonRes(result, 200, "获取用户列表成功");
			} catch (error) {
				console.error("查询用户列表失败:", error);
				return {
					code: 500,
					message: "查询用户列表失败",
					data: null,
				};
			}
		},
		{
			detail: {
				tags: ["用户管理"],
				summary: "获取用户列表",
				description: "分页获取用户列表，支持搜索、状态筛选和排序",
			},
			query: t.Object({
				page: t.Optional(t.Number({ minimum: 1 })),
				pageSize: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
				search: t.Optional(t.String()),
				status: t.Optional(t.Number()),
				sortBy: t.Optional(t.String()),
				sortOrder: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
			}),
		},
	)

	// 根据ID获取用户详情
	.get(
		"/:id",
		async ({ params: { id }, status }) => {
			try {
				const user = await db
					.select({
						id: userSchema.id,
						username: userSchema.username,
						email: userSchema.email,
						nickname: userSchema.nickname,
						avatar: userSchema.avatar,
						status: userSchema.status,
						createdAt: userSchema.createdAt,
						updatedAt: userSchema.updatedAt,
					})
					.from(userSchema)
					.where(eq(userSchema.id, +id))
					.limit(1);

				if (user.length === 0) {
					return status(404, "用户不存在");
				}

				return commonRes(user[0], 200, "获取用户详情成功");
			} catch (error) {
				console.error("查询用户详情失败:", error);
				return {
					code: 500,
					message: "查询用户详情失败",
					data: null,
				};
			}
		},
		{
			detail: {
				tags: ["用户管理"],
				summary: "获取用户详情",
				description: "根据用户ID获取用户详细信息",
			},
			params: t.Object({
				id: t.String(),
			}),
		},
	)

	// 更新用户信息
	.put(
		"/:id",
		async ({ params: { id }, body: { nickname, email, avatar } }) => {
			try {
				// 检查用户是否存在
				const existingUser = await db
					.select({ id: userSchema.id })
					.from(userSchema)
					.where(eq(userSchema.id, +id))
					.limit(1);

				if (existingUser.length === 0) {
					return status(404, "用户不存在");
				}

				// 如果更新用户名，检查是否重复
				if (nickname) {
					const duplicateUsername = await db
						.select({ id: userSchema.id })
						.from(userSchema)
						.where(
							and(eq(userSchema.username, nickname), eq(userSchema.id, +id)),
						)
						.limit(1);

					if (duplicateUsername.length > 0) {
						return status(200, "用户名已存在");
					}
				}

				// 如果更新邮箱，检查是否重复
				if (email) {
					const duplicateEmail = await db
						.select({ id: userSchema.id })
						.from(userSchema)
						.where(and(eq(userSchema.email, email), eq(userSchema.id, +id)))
						.limit(1);

					if (duplicateEmail.length > 0) {
						return status(200, "邮箱已存在");
					}
				}

				// 更新用户
				const [updatedUser] = await db
					.update(userSchema)
					.set({
						nickname,
						email,
						avatar,
						updatedAt: new Date(),
					})
					.where(eq(userSchema.id, +id))
					.returning();

				return commonRes(updatedUser, 200, "更新用户成功");
			} catch (error) {
				console.error("更新用户失败:", error);
				return status(500, "更新用户失败");
			}
		},
		{
			detail: {
				tags: ["用户管理"],
				summary: "更新用户信息",
				description: "根据用户ID更新用户信息",
			},
			body: "updateProfileSchema",
		},
	)

	// 删除用户（软删除，设置状态为禁用）
	.delete(
		"/:id",
		async ({ params: { id } }) => {
			try {
				// 检查用户是否存在
				const existingUser = await db
					.select({ id: userSchema.id })
					.from(userSchema)
					.where(eq(userSchema.id, +id))
					.limit(1);

				if (existingUser.length === 0) {
					return status(200, "用户不存在");
				}

				// 软删除：设置状态为禁用
				await db
					.update(userSchema)
					.set({
						status: UserStatus.DISABLED,
						updatedAt: new Date(),
					})
					.where(eq(userSchema.id, +id));

				return status(200, "用户删除成功");
			} catch (error) {
				console.error("删除用户失败:", error);
				return status(500, "删除用户失败");
			}
		},
		{
			detail: {
				tags: ["用户管理"],
				summary: "删除用户",
				description: "根据用户ID删除用户账户",
			},
		},
	)

	// 获取管理员列表（基于业务逻辑，这里假设通过某种方式标识管理员）
	.get(
		"/admins",
		async ({ query: { page, pageSize, search, sortBy, sortOrder } }) => {
			try {
				// 构建查询条件（这里假设管理员是通过某种业务逻辑识别的）
				const conditions = [eq(userSchema.status, UserStatus.ACTIVE)];

				if (search) {
					conditions.push(like(userSchema.username, `%${search}%`));
				}

				const allowedSortFields = {
					id: userSchema.id,
					username: userSchema.username,
					status: userSchema.status,
					createdAt: userSchema.createdAt,
					updatedAt: userSchema.updatedAt,
				};

				const sortFields =
					allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
					userSchema.id;
				// 排序配置
				const sortOrderValue =
					sortOrder === "desc" ? desc(sortFields) : asc(sortFields);

				const queryBuilder = db
					.select({
						id: userSchema.id,
						username: userSchema.username,
						email: userSchema.email,
						nickname: userSchema.nickname,
						avatar: userSchema.avatar,
						status: userSchema.status,
						createdAt: userSchema.createdAt,
						updatedAt: userSchema.updatedAt,
					})
					.from(userSchema)
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
					.from(userSchema)
					.where(conditions.length > 0 ? and(...conditions) : undefined);

				return page
					? pageRes(
						result,
						total[0]?.value || 0,
						page,
						pageSize,
						"获取管理员列表成功",
					)
					: commonRes(result, 200, "获取管理员列表成功");
			} catch (error) {
				console.error("查询管理员列表失败:", error);
				return {
					code: 500,
					message: "查询管理员列表失败",
					data: null,
				};
			}
		},
		{
			detail: {
				tags: ["用户管理"],
				summary: "获取管理员列表",
				description: "分页获取管理员用户列表，支持搜索和排序",
			},
			query: "usersQuery",
		},
	)

	// 获取用户统计信息
	.get(
		"/statistics",
		async () => {
			try {
				// 总用户数
				const totalUsersResult = await db
					.select({ totalUsers: count() })
					.from(userSchema);
				const totalUsers = totalUsersResult[0]?.totalUsers || 0;

				// 活跃用户数
				const activeUsersResult = await db
					.select({ activeUsers: count() })
					.from(userSchema)
					.where(eq(userSchema.status, UserStatus.ACTIVE));
				const activeUsers = activeUsersResult[0]?.activeUsers || 0;

				// 禁用用户数
				const disabledUsersResult = await db
					.select({ disabledUsers: count() })
					.from(userSchema)
					.where(eq(userSchema.status, UserStatus.DISABLED));
				const disabledUsers = disabledUsersResult[0]?.disabledUsers || 0;

				// 今日新增用户数（假设有创建时间字段）
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				const todayNewUsersResult = await db
					.select({ todayNewUsers: count() })
					.from(userSchema)
					.where(eq(userSchema.createdAt, today));
				const todayNewUsers = todayNewUsersResult[0]?.todayNewUsers || 0;

				return commonRes(
					{
						totalUsers,
						activeUsers,
						disabledUsers,
						todayNewUsers,
						userGrowthRate:
							totalUsers > 0
								? ((todayNewUsers / totalUsers) * 100).toFixed(2)
								: "0.00",
					},
					200,
					"获取用户统计信息成功",
				);
			} catch (error) {
				console.error("获取用户统计信息失败:", error);
				return status(500, "获取用户统计信息失败");
			}
		},
		{
			detail: {
				tags: ["用户管理"],
				summary: "获取用户统计信息",
				description: "获取用户总数、活跃用户数、禁用用户数等统计信息",
			},
		},
	);
