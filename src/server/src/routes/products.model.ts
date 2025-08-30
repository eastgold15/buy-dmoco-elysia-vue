import { t } from "elysia";
import { DbType } from "../db/database.types";
import { UnoQuery } from "../utils/common.model";

// 商品模型定义
export const productsModel = {
	// // 创建商品请求参数
	CreateProductDto: t.Omit(DbType.typebox.insert.productsSchema, ["id", "createdAt", "updatedAt"]),

	// // 更新商品请求参数
	UpdateProductDto: t.Omit(DbType.typebox.insert.productsSchema, ["id", "createdAt", "updatedAt"]),

	// // 商品列表查询参数
	ProductListQueryDto: t.Object({
		...UnoQuery.properties,
		categoryId: t.Optional(t.Number()),
		isActive: t.Optional(t.Boolean()),
		isFeatured: t.Optional(t.Boolean()),
	}),

	// 商品搜索查询参数
	ProductSearchQueryDto: t.Object({
		...UnoQuery.properties,
		categoryId: t.Optional(t.Number()),
		minPrice: t.Optional(t.Number()),
		maxPrice: t.Optional(t.Number()),
		colors: t.Optional(t.Array(t.String())),
		sizes: t.Optional(t.Array(t.String())),
		tags: t.Optional(t.Array(t.String())),
		brand: t.Optional(t.String()),
		sortBy: t.Optional(
			t.Union([
				t.Literal("price"),
				t.Literal("name"),
				t.Literal("createdAt"),
				t.Literal("updatedAt"),
			]),
		),
	}),
};
