import { t } from "elysia";
import { DbType } from "../db/database.types";

// 广告模型定义
export const authRouteModel = {
	// 登录
	loginDto: t.Object({
		username: t.String(),
		email: t.Optional(t.String()),
		password: t.String(),
		remember: t.Optional(t.Boolean()),
	}),
	// 创建用户请求参数
	CreateUserDto: t.Object({
		username: t.String(),
		email: t.Optional(t.String()),
		password: t.String(),
	}),

	// // 更新广告请求参数
	// UpdateAdvertisementDto: t.Object({
	// 	...DbType.spreads.insert.advertisementsSchema,
	// }),

	// // 排序更新请求
	// UpdateSortRequest: t.Object({
	// 	sortOrder: t.Number(),
	// }),
	// // 广告列表查询参数
	// AdvertisementListQueryDto: t.Object({
	// 	...UnoQuery.properties,
	// 	type: t.Optional(t.String()),
	// 	position: t.Optional(t.String()),
	// 	isActive: t.Optional(t.Boolean()),
	// }),
};
