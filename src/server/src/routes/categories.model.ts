import { t } from "elysia";
import { DbType } from "../db/database.types";
import { UnoQuery } from "../utils/common.model";

// 分类模型定义
export const categoriesModel = {
	// 创建分类请求参数
	CreateCategoryDto: t.Omit(
		DbType.typebox.insert.categoriesSchema,
		["id", "createdAt", "updatedAt"]
	),

	// 更新分类请求参数
	UpdateCategoryDto: t.Omit(
		DbType.typebox.insert.categoriesSchema,
		["id", "createdAt", "updatedAt"]
	),

	// 排序更新请求
	UpdateSortRequest: t.Object({
		sortOrder: t.Number({ minimum: 0 }),
	}),

	// 分类列表查询参数
	CategoryListQueryDto: t.Object({
		...UnoQuery.properties,
		name: t.Optional(t.String()),
		parentId: t.Optional(t.String()),
		isVisible: t.Optional(t.Boolean()),
	}),
};
