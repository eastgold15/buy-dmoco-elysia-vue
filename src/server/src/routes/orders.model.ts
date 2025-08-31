
import { t } from "elysia";
import { UnoQuery } from '../utils/common.model';



export const ordersRouteModel = {
	// 订单查询参数
	ordersQuery: t.Object({
		...UnoQuery.properties,

		customerEmail: t.Optional(t.String()),
		orderNumber: t.Optional(t.String()),
	}),

	// 退款查询参数
	refundsQuery: t.Object({
		...UnoQuery.properties,
		status: t.Optional(t.String()),
		orderId: t.Optional(t.String()),
	}),
	statisticsQuery: t.Object({
		startDate: t.Optional(t.String()),
		endDate: t.Optional(t.String()),
	}),

	updateOrderStatusSchema: t.Object({
		status: t.String(),
		notes: t.Optional(t.String()),
	}),

	updateShippingSchema: t.Object({
		trackingNumber: t.String(),
		shippingMethod: t.Optional(t.String()),
	}),
	createRefundSchema: t.Object({
		amount: t.String(),
		reason: t.String(),
		refundMethod: t.Optional(t.String()),
	}),
	processRefundSchema: t.Object({
		status: t.String(),
		notes: t.Optional(t.String()),
	})
}







