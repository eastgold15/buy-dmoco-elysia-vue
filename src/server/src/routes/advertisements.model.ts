import { t } from "elysia";
import { DbType } from "../db/database.types";
import { UnoQuery } from "../utils/common.model";

// 广告模型定义
export const advertisementsModel = {
	// 创建广告请求参数
	CreateAdvertisementDto: t.Omit(
		DbType.typebox.insert.advertisementsSchema,
		["id", "createdAt", "updatedAt"]
	),

	// 更新广告请求参数
	UpdateAdvertisementDto: t.Object({
		...DbType.spreads.insert.advertisementsSchema,
	}),

	// 排序更新请求
	UpdateSortRequest: t.Object({
		sortOrder: t.Number(),
	}),
	
	// 广告列表查询参数
	AdvertisementListQueryDto: t.Object({
		...UnoQuery.properties,
		type: t.Optional(t.String()),
		position: t.Optional(t.String()),
		isActive: t.Optional(t.Boolean()),
	}),
};
