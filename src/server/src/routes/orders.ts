/**
 * 订单管理路由
 * 提供订单的 CRUD 操作和相关功能
 */

import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import {
	orderItemsSchema,
	ordersSchema,
	refundsSchema
} from "../db/schema";
import { commonRes, pageRes } from "../plugins/Res";

import { ordersRouteModel } from "./orders.model";

// 订单状态枚举
const ORDER_STATUS = {
	PENDING: "pending",
	CONFIRMED: "confirmed",
	PROCESSING: "processing",
	SHIPPED: "shipped",
	DELIVERED: "delivered",
	CANCELLED: "cancelled",
} as const;

// 支付状态枚举
const PAYMENT_STATUS = {
	PENDING: "pending",
	PAID: "paid",
	FAILED: "failed",
	REFUNDED: "refunded",
} as const;

// 退款状态枚举
const REFUND_STATUS = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
	PROCESSED: "processed",
} as const;

export const ordersRoute = new Elysia({ prefix: "orders", tags: ["Orders"] })
	.model(ordersRouteModel)
	// 获取订单列表
	.get(
		"/",
		async ({ query }) => {
			try {
				// 解构查询参数
				const {
					search,
					page,
					pageSize,
					sortBy,
					sortOrder,
					status,
					paymentStatus,
					customerEmail,
					orderNumber,
				} = query;

				// 构建查询条件
				const conditions = [];

				// 搜索条件
				if (search) {
					conditions.push(
						or(
							like(ordersSchema.orderNumber, `%${search}%`),
							like(ordersSchema.customerName, `%${search}%`),
							like(ordersSchema.customerEmail, `%${search}%`)
						)
					);
				}

				// 状态筛选
				if (status) {
					conditions.push(eq(ordersSchema.orderState, status));
				}
				if (paymentStatus) {
					conditions.push(eq(ordersSchema.paymentState, paymentStatus));
				}
				if (customerEmail) {
					conditions.push(like(ordersSchema.customerEmail, `%${customerEmail}%`));
				}
				if (orderNumber) {
					conditions.push(like(ordersSchema.orderNumber, `%${orderNumber}%`));
				}

				// 排序配置
				const allowedSortFields = {
					id: ordersSchema.id,
					orderNumber: ordersSchema.orderNumber,
					customerName: ordersSchema.customerName,
					totalAmount: ordersSchema.totalAmount,
					status: ordersSchema.orderState,
					createdAt: ordersSchema.createdAt,
					updatedAt: ordersSchema.updatedAt,
				};

				const sortFields =
					allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
					ordersSchema.createdAt;
				const sortOrderValue =
					sortOrder === "asc" ? asc(sortFields) : desc(sortFields);

				// 构建查询
				const queryBuilder = db
					.select()
					.from(ordersSchema)
					.where(conditions.length > 0 ? and(...conditions) : undefined)
					.orderBy(sortOrderValue);

				// 分页处理
				if (page && pageSize) {
					const offsetValue = ((Number(page) || 1) - 1) * Number(pageSize);
					queryBuilder.limit(Number(pageSize)).offset(offsetValue);
				}

				// 获取总数查询
				const totalQuery = db
					.select({ value: count() })
					.from(ordersSchema)
					.where(conditions.length > 0 ? and(...conditions) : undefined);

				// 并行执行查询
				const [data, totalResult] = await Promise.all([
					queryBuilder,
					totalQuery,
				]);

				return page
					? pageRes(
						data,
						totalResult[0]?.value || 0,
						Number(page),
						Number(pageSize),
						"获取订单列表成功"
					)
					: commonRes(data, 200, "获取订单列表成功");
			} catch (error) {
				console.error("获取订单列表失败:", error);
				return commonRes(null, 500, "获取订单列表失败");
			}
		},
		{
			query: "ordersQuery",
			detail: {
				tags: ["Orders"],
				summary: "获取订单列表",
				description: "获取订单列表，支持分页、排序和筛选",
			},
		},
	)

	// 根据ID获取订单详情
	.get(
		"/:id",
		async ({ params: { id } }) => {
			try {
				// 获取订单基本信息
				const [order] = await db
					.select()
					.from(ordersSchema)
					.where(eq(ordersSchema.id, Number(id)));

				if (!order) {
					return commonRes(null, 404, "订单不存在");
				}

				// 获取订单项
				const orderItems = await db
					.select()
					.from(orderItemsSchema)
					.where(eq(orderItemsSchema.orderId, Number(id)));

				// 获取退款记录
				const refunds = await db
					.select()
					.from(refundsSchema)
					.where(eq(refundsSchema.orderId, Number(id)));

				return commonRes(
					{
						...order,
						orderItems,
						refunds,
					},
					200,
					"获取订单详情成功"
				);
			} catch (error) {
				console.error("获取订单详情失败:", error);
				return commonRes(null, 500, "获取订单详情失败");
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Orders"],
				summary: "获取订单详情",
				description: "根据订单ID获取订单详细信息，包括订单项和退款记录",
			},
		},
	)

	// 更新订单状态
	.patch(
		"/:id/status",
		async ({ params: { id }, body }) => {
			try {
				const { status, notes } = body;

				// 验证订单是否存在
				const [existingOrder] = await db
					.select()
					.from(ordersSchema)
					.where(eq(ordersSchema.id, Number(id)));

				if (!existingOrder) {
					return commonRes(null, 404, "订单不存在");
				}

				// 更新订单状态
				const [updatedOrder] = await db
					.update(ordersSchema)
					.set({
						status,
						notes,
						updatedAt: new Date(),
					})
					.where(eq(ordersSchema.id, Number(id)))
					.returning();

				return commonRes(updatedOrder, 200, "订单状态更新成功");
			} catch (error) {
				console.error("更新订单状态失败:", error);
				return commonRes(null, 500, "更新订单状态失败");
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: ordersRouteModel.updateOrderStatusSchema,
			detail: {
				tags: ["Orders"],
				summary: "更新订单状态",
				description: "更新指定订单的状态",
			},
		},
	)

	// 更新订单物流信息
	.patch(
		"/:id/shipping",
		async ({ params: { id }, body }) => {
			try {
				const { trackingNumber, shippingMethod } = body;

				// 验证订单是否存在
				const [existingOrder] = await db
					.select()
					.from(ordersSchema)
					.where(eq(ordersSchema.id, Number(id)));

				if (!existingOrder) {
					return commonRes(null, 404, "订单不存在");
				}

				// 更新物流信息
				const [updatedOrder] = await db
					.update(ordersSchema)
					.set({
						trackingNumber,
						shippingMethod,
						status: "shipped", // 添加物流信息时自动更新为已发货
						updatedAt: new Date(),
					})
					.where(eq(ordersSchema.id, Number(id)))
					.returning();

				return commonRes(updatedOrder, 200, "物流信息更新成功");
			} catch (error) {
				console.error("更新物流信息失败:", error);
				return commonRes(null, 500, "更新物流信息失败");
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: ordersRouteModel.updateShippingSchema,
			detail: {
				tags: ["Orders"],
				summary: "更新订单物流信息",
				description: "更新指定订单的物流跟踪信息",
			},
		},
	)

	// 获取退款列表
	.get(
		"/refunds",
		async ({ query }) => {
			try {
				// 解构查询参数
				const {
					search,
					page,
					pageSize,
					sortBy,
					sortOrder,
					status,
					orderId,
				} = query;

				// 构建查询条件
				const conditions = [];

				// 搜索条件
				if (search) {
					conditions.push(
						or(
							like(refundsSchema.refundNumber, `%${search}%`),
							like(refundsSchema.reason, `%${search}%`)
						)
					);
				}

				// 状态筛选
				if (status) {
					conditions.push(eq(refundsSchema.status, status));
				}
				if (orderId) {
					conditions.push(eq(refundsSchema.orderId, Number(orderId)));
				}

				// 排序配置
				const allowedSortFields = {
					id: refundsSchema.id,
					refundNumber: refundsSchema.refundNumber,
					amount: refundsSchema.amount,
					status: refundsSchema.status,
					createdAt: refundsSchema.createdAt,
					updatedAt: refundsSchema.updatedAt,
				};

				const sortFields =
					allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
					refundsSchema.createdAt;
				const sortOrderValue =
					sortOrder === "asc" ? asc(sortFields) : desc(sortFields);

				// 构建查询
				const queryBuilder = db
					.select({
						id: refundsSchema.id,
						orderId: refundsSchema.orderId,
						orderNumber: ordersSchema.orderNumber,
						customerName: ordersSchema.customerName,
						customerEmail: ordersSchema.customerEmail,
						refundNumber: refundsSchema.refundNumber,
						amount: refundsSchema.amount,
						reason: refundsSchema.reason,
						status: refundsSchema.status,
						refundMethod: refundsSchema.refundMethod,
						processedAt: refundsSchema.processedAt,
						notes: refundsSchema.notes,
						createdAt: refundsSchema.createdAt,
						updatedAt: refundsSchema.updatedAt,
					})
					.from(refundsSchema)
					.leftJoin(ordersSchema, eq(refundsSchema.orderId, ordersSchema.id))
					.where(conditions.length > 0 ? and(...conditions) : undefined)
					.orderBy(sortOrderValue);

				// 分页处理
				if (page && pageSize) {
					const offsetValue = ((Number(page) || 1) - 1) * Number(pageSize);
					queryBuilder.limit(Number(pageSize)).offset(offsetValue);
				}

				// 获取总数查询
				const totalQuery = db
					.select({ value: count() })
					.from(refundsSchema)
					.where(conditions.length > 0 ? and(...conditions) : undefined);

				// 并行执行查询
				const [data, totalResult] = await Promise.all([
					queryBuilder,
					totalQuery,
				]);

				return page
					? pageRes(
						data,
						totalResult[0]?.value || 0,
						Number(page),
						Number(pageSize),
						"获取退款列表成功"
					)
					: commonRes(data, 200, "获取退款列表成功");
			} catch (error) {
				console.error("获取退款列表失败:", error);
				return commonRes(null, 500, "获取退款列表失败");
			}
		},
		{
			query: ordersRouteModel.refundsQuery,
			detail: {
				tags: ["Orders"],
				summary: "获取退款列表",
				description: "获取退款申请列表，支持分页、排序和筛选",
			},
		},
	)

	// 创建退款申请
	.post(
		"/:id/refunds",
		async ({ params: { id }, body }) => {
			try {
				const { amount, reason, refundMethod } = body;

				// 检查订单是否存在
				const [order] = await db
					.select()
					.from(ordersSchema)
					.where(eq(ordersSchema.id, parseInt(id, 10)));

				if (!order) {
					return commonRes(null, 404, "订单不存在");
				}

				// 生成退款单号
				const refundNumber = `RF${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

				// 创建退款记录
				const [newRefund] = await db
					.insert(refundsSchema)
					.values({
						orderId: parseInt(id, 10),
						refundNumber,
						amount,
						reason,
						refundMethod,
						status: REFUND_STATUS.PENDING,
					})
					.returning();

				return commonRes(newRefund, 201, "退款申请创建成功");
			} catch (error) {
				console.error("创建退款申请失败:", error);
				return commonRes(null, 500, "创建退款申请失败");
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: ordersRouteModel.createRefundSchema,
			detail: {
				tags: ["Orders"],
				summary: "创建退款申请",
				description: "为指定订单创建退款申请",
			},
		},
	)

	// 处理退款申请
	.patch(
		"/refunds/:id",
		async ({ params, body }) => {
			try {
				const refundId = Number(params.id);
				const { status, refundMethod } = body;

				// 验证退款申请是否存在
				const refund = await db
					.select()
					.from(refundsSchema)
					.where(eq(refundsSchema.id, refundId))
					.limit(1);

				if (refund.length === 0) {
					return commonRes(null, 404, "退款申请不存在");
				}

				// 更新退款申请
				const [updatedRefund] = await db
					.update(refundsSchema)
					.set({
						status,
						refundMethod,
						updatedAt: new Date(),
					})
					.where(eq(refundsSchema.id, refundId))
					.returning();

				return commonRes(updatedRefund, 200, "退款申请处理成功");
			} catch (error) {
				console.error("处理退款申请失败:", error);
				return commonRes(null, 500, "处理退款申请失败");
			}
		},
		{
			params: ordersRouteModel.IdParams,
			body: ordersRouteModel.processRefundSchema,
			detail: {
				tags: ["Orders"],
				summary: "处理退款申请",
				description: "审批或拒绝退款申请",
			},
		},
	)

	// 获取订单统计信息
	.get(
		"/statistics",
		async ({ query }) => {
			try {
				const { startDate, endDate } = query;

				// 构建时间筛选条件
				const conditions = [];
				if (startDate) {
					conditions.push(sql`${ordersSchema.createdAt} >= ${startDate}`);
				}
				if (endDate) {
					conditions.push(sql`${ordersSchema.createdAt} <= ${endDate}`);
				}

				const whereClause =
					conditions.length > 0 ? and(...conditions) : undefined;

				// 获取订单统计
				const [orderStats] = await db
					.select({
						totalOrders: count(),
						totalRevenue: sql<number>`sum(${ordersSchema.totalAmount})`,
						averageOrderValue: sql<number>`avg(${ordersSchema.totalAmount})`,
					})
					.from(ordersSchema)
					.where(whereClause);

				// 获取各状态订单数量
				const statusStats = await db
					.select({
						status: ordersSchema.status,
						count: count(),
					})
					.from(ordersSchema)
					.where(whereClause)
					.groupBy(ordersSchema.status);

				// 获取支付状态统计
				const paymentStats = await db
					.select({
						paymentStatus: ordersSchema.paymentStatus,
						count: count(),
					})
					.from(ordersSchema)
					.where(whereClause)
					.groupBy(ordersSchema.paymentStatus);

				return commonRes(
					{
						orderStats,
						statusStats,
						paymentStats,
					},
					200,
					"获取订单统计成功"
				);
			} catch (error) {
				console.error("获取订单统计失败:", error);
				return commonRes(null, 500, "获取订单统计失败");
			}
		},
		{
			query: ordersRouteModel.statisticsQuery,
			detail: {
				tags: ["Orders"],
				summary: "获取订单统计信息",
				description: "获取订单的统计数据，包括总数、收入等",
			},
		},
	);
