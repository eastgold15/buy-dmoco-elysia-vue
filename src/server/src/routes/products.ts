import { and, asc, count, desc, eq, getTableColumns, gte, ilike, like, lte, or, sql } from "drizzle-orm";
import { Elysia, status } from "elysia";
import { db } from "../db/connection";
import { categoriesSchema, productsSchema } from "../db/schema";
import { commonRes, pageRes } from "../plugins/Res";
import { productsModel } from "./products.model";
import { object, string } from "zod";

export const productsRoute = new Elysia({
	prefix: "products",
	tags: ["Products"],
})
	.model(productsModel)
	.guard(
		{
			transform({ body }: { body: any }) {
				console.log(body);
				// 处理parentId：如果是对象格式{"key":true}，提取key作为parentId
				if (body.parentId) {
					if (typeof body.parentId === "object" && body.parentId !== null) {
						// 从对象中提取第一个key作为parentId
						const keys = Object.keys(body.parentId);
						if (!keys[0]) return
						if (keys.length > 0) {
							body.parentId = parseInt(keys[0], 10);
						}
					} else {
						body.parentId = parseInt(body.parentId.toString(), 10);
					}
				}

			},
		},
		(app) =>
			app
				// 创建商品
				.post(
					"/",
					async ({ body, status }) => {
						try {
							const productData = {
								...body,
								price: String(body.price),
								comparePrice: String(body.comparePrice),
								cost: String(body.cost),
								weight: String(body.weight),

							};

							const [newProduct] = await db
								.insert(productsSchema)
								.values(productData)
								.returning();

							return commonRes(newProduct, 201, "商品创建成功");
						} catch (error) {
							console.error("创建商品失败:", error);
							return status(500, "创建商品失败");
						}
					},
					{
						body: "CreateProductDto",
						detail: {
							tags: ["Products"],
							summary: "创建商品",
							description: "创建新的商品",
						},
					},
				),
	)
	// 获取所有商品
	.get(
		"/",
		async ({
			query: {
				page,
				pageSize,
				sortBy,
				sortOrder,
				search,
				categoryId,
				isActive,
				isFeatured,
			}, status
		}) => {
			try {
				// 搜索条件：支持商品名称、SKU和描述搜索
				const conditions = [];
				if (search) {
					conditions.push(
						or(
							like(productsSchema.name, `%${search}%`),
							like(productsSchema.sku, `%${search}%`),
							like(productsSchema.description, `%${search}%`),
						),
					);
				}

				if (categoryId) {
					conditions.push(
						eq(productsSchema.categoryId, categoryId),
					);
				}

				if (isActive !== undefined) {
					conditions.push(eq(productsSchema.isActive, isActive === true));
				}
				if (isFeatured !== undefined) {
					conditions.push(eq(productsSchema.isFeatured, isFeatured === true));
				}

				// 允许的排序字段
				const allowedSortFields = {
					name: productsSchema.name,
					price: productsSchema.price,
					stock: productsSchema.stock,
					createdAt: productsSchema.createdAt,
					updatedAt: productsSchema.updatedAt,
				};

				// 确定排序字段和方向
				const sortFields =
					allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
					productsSchema.createdAt;
				const sortOrderValue =
					sortOrder === "asc" ? asc(sortFields) : desc(sortFields);


				// 获取 products 表的所有列
				const productColumns = getTableColumns(productsSchema);
				// 构建查询
				const queryBuilder = db
					.select({
						...productColumns,
						categoryName: categoriesSchema.name,
					})
					.from(productsSchema)
					.leftJoin(
						categoriesSchema,
						eq(productsSchema.categoryId, categoriesSchema.id),
					)
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
					.from(productsSchema)
					.where(conditions.length > 0 ? and(...conditions) : undefined);

				// 返回结果
				return page
					? pageRes(
						result,
						total[0]?.value || 0,
						page,
						pageSize,
						"分页获取商品成功",
					)
					: commonRes(result, 200, "获取商品列表成功");
			} catch (error) {
				console.error("获取商品列表失败:", error);
				return status(500, "获取商品列表失败");
			}
		},
		{
			query: "ProductListQueryDto",
			detail: {
				tags: ["Products"],
				summary: "获取商品列表",
				description: "获取商品列表，支持分页、搜索和排序",
			},
		},
	)

	// 根据ID获取商品详情
	.get(
		"/:id",
		async ({ params: { id }, status }) => {
			try {

				const productColumns = getTableColumns(productsSchema);

				const [dbProduct] = await db
					.select({
						...productColumns,
						categoryName: categoriesSchema.name,
					})
					.from(productsSchema)
					.leftJoin(
						categoriesSchema,
						eq(productsSchema.categoryId, categoriesSchema.id),
					)
					.where(eq(productsSchema.id, parseInt(id, 10)))
					.limit(1);

				if (!dbProduct) {
					return status(404, "商品不存在");
				}

				return commonRes(dbProduct, 200);
			} catch (error) {
				console.error("获取商品详情失败:", error);
				return status(500, "获取商品详情失败");
			}
		},
		{

			detail: {
				tags: ["Products"],
				summary: "根据ID获取商品详情",
				description: "根据商品ID获取商品的详细信息",
			},
		},
	)

	// 根据slug获取商品详情
	.get(
		"/slug/:slug",
		async ({ params: { slug }, status }) => {
			try {

				const productColumns = getTableColumns(productsSchema);
				const [dbProduct] = await db
					.select({
						...productColumns,
						categoryName: categoriesSchema.name,
					})
					.from(productsSchema)
					.leftJoin(
						categoriesSchema,
						eq(productsSchema.categoryId, categoriesSchema.id),
					)
					.where(eq(productsSchema.slug, slug))
					.limit(1);

				if (!dbProduct) {
					return status(404, "商品不存在");
				}

				return commonRes(dbProduct, 200);
			} catch (error) {
				console.error("获取商品详情失败:", error);
				return status(500, "获取商品详情失败");
			}
		},
		{

			detail: {
				tags: ["Products"],
				summary: "根据slug获取商品详情",
				description: "根据商品slug获取商品的详细信息",
			},
		},
	)

	// 更新商品
	.put(
		"/:id",
		async ({ params: { id }, body }) => {
			try {
				const updateData = Object.fromEntries(
					Object.entries(body).filter(([__, value]) => {
						return value !== undefined;
					})
				)
				// 添加更新时间
				updateData.updatedAt = new Date();

				const [updatedProduct] = await db
					.update(productsSchema)
					.set(updateData)
					.where(eq(productsSchema.id, parseInt(id, 10)))
					.returning();

				if (!updatedProduct) {
					return status(404, "商品不存在");
				}

				return commonRes(updatedProduct, 200, "商品更新成功");
			} catch (error) {

				return status(500, "更新商品失败");
			}
		},
		{

			body: "UpdateProductDto",
			detail: {
				tags: ["Products"],
				summary: "更新商品",
				description: "根据商品ID更新商品信息",
			},
		},
	)

	// 搜索商品
	.get(
		"/search",
		async ({ query: {
			categoryId,
			minPrice,
			maxPrice,
			// colors,
			// sizes,
			sortBy = "createdAt",
			sortOrder = "desc",
			page = 1,
			pageSize = 20,
			// tags,
			// brand,
			search,
		} }) => {
			try {

				// 必须是激活的
				const conditions = [eq(productsSchema.isActive, true)];

				const searchConditions = [
					like(productsSchema.name, `%${search}%`),
					like(productsSchema.description, `%${search}%`),
					like(productsSchema.shortDescription, `%${search}%`),
				].filter((condition) => condition !== undefined)

				// 搜索条件
				if (search) {
					conditions.push(...searchConditions);
				}

				// 分类筛选
				if (categoryId) {
					conditions.push(
						eq(productsSchema.categoryId, categoryId),
					);
				}

				// 价格范围筛选
				if (minPrice !== undefined) {
					conditions.push(
						gte(productsSchema.price, `${minPrice}`)
					);
				}
				if (maxPrice !== undefined) {
					conditions.push(
						lte(productsSchema.price, `${maxPrice}`)
					);
				}

				// 暂时少些

				// // 颜色筛选
				// if (colors.length > 0) {
				// 	const colorConditions = colors.map(
				// 		(color) =>
				// 			sql`${productsSchema.colors} @> ${JSON.stringify([color])}`,
				// 	);
				// 	conditions.push(or(...colorConditions));
				// }

				// // 尺寸筛选
				// if (sizes.length > 0) {
				// 	const sizeConditions = sizes.map(
				// 		(size) => sql`${productsSchema.sizes} @> ${JSON.stringify([size])}`,
				// 	);
				// 	conditions.push(or(...sizeConditions));
				// }

				// // 特性筛选
				// if (features.length > 0) {
				// 	const featureConditions = features.map(
				// 		(feature) =>
				// 			sql`${productsSchema.features} @> ${JSON.stringify([feature])}`,
				// 	);
				// 	conditions.push(or(...featureConditions));
				// }

				// // 推荐商品筛选
				// if (isFeatured !== undefined) {
				// 	conditions.push(eq(productsSchema.isFeatured, isFeatured));
				// }

				const whereClause = conditions.length > 0 ? and(...conditions) : undefined


				const allowedSortFields = {
					name: productsSchema.name,
					price: productsSchema.price,
					createdAt: productsSchema.createdAt,
					updatedAt: productsSchema.updatedAt,
				};

				const sortFields =
					allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
					productsSchema.id;
				// 排序配置
				const sortOrderValue =
					sortOrder === "desc" ? desc(sortFields) : asc(sortFields);



				const productColumns = getTableColumns(productsSchema);
				const offsetValue = ((Number(page) || 1) - 1) * pageSize;


				// 获取商品列表
				const result = await db
					.select({
						...productColumns,
						categoryName: categoriesSchema.name,
					})
					.from(productsSchema)
					.leftJoin(
						categoriesSchema,
						eq(productsSchema.categoryId, categoriesSchema.id),
					)
					.where(whereClause)
					.orderBy(sortOrderValue)
					.limit(pageSize).offset(offsetValue);

				// 获取总数
				const total = await db
					.select({ value: count() })
					.from(productsSchema)
					.where(whereClause);



				return pageRes(
					result,
					total[0] ? total[0].value : 0,
					page,
					pageSize,
					"获取商品列表成功"
				);
			} catch (error) {
				console.error("搜索商品失败:", error);
				return status(500, "搜索商品失败");
			}
		},
		{
			query: "ProductSearchQueryDto",
			detail: {
				tags: ["Products"],
				summary: "搜索商品",
				description: "根据关键词搜索商品，支持分页、排序和筛选",
			},
		},
	)

// // 获取推荐商品
// .get(
// 	"/featured",
// 	async ({ query }) => {
// 		try {
// 			const pageSize = query.pageSize
// 				? parseInt(query.pageSize as string, 10)
// 				: 8;

// 			const dbProducts = await db
// 				.select({
// 					id: productsSchema.id,
// 					name: productsSchema.name,
// 					slug: productsSchema.slug,
// 					description: productsSchema.description,
// 					shortDescription: productsSchema.shortDescription,
// 					price: productsSchema.price,
// 					comparePrice: productsSchema.comparePrice,
// 					sku: productsSchema.sku,
// 					stock: productsSchema.stock,
// 					images: productsSchema.images,
// 					colors: productsSchema.colors,
// 					sizes: productsSchema.sizes,
// 					features: productsSchema.features,
// 					categoryId: productsSchema.categoryId,
// 					categoryName: categoriesSchema.name,
// 					isActive: productsSchema.isActive,
// 					isFeatured: productsSchema.isFeatured,
// 					weight: productsSchema.weight,
// 					dimensions: productsSchema.dimensions,
// 					materials: productsSchema.materials,
// 					// brand: productsSchema.brand, // 字段不存在
// 					metaTitle: productsSchema.metaTitle,
// 					metaDescription: productsSchema.metaDescription,
// 					metaKeywords: productsSchema.metaKeywords,
// 					createdAt: productsSchema.createdAt,
// 					updatedAt: productsSchema.updatedAt,
// 				})
// 				.from(productsSchema)
// 				.leftJoin(
// 					categoriesSchema,
// 					eq(productsSchema.categoryId, categoriesSchema.id),
// 				)
// 				.where(
// 					and(
// 						eq(productsSchema.isActive, true),
// 						eq(productsSchema.isFeatured, true),
// 					),
// 				)
// 				.orderBy(desc(productsSchema.createdAt))
// 				.limit(pageSize);

// 			return commonRes(dbProducts, 200);
// 		} catch (error) {
// 			console.error("获取推荐商品失败:", error);
// 			return commonRes(null, 500, "获取推荐商品失败");
// 		}
// 	},
// 	{
// 		query: "RelatedProductsQueryDto",
// 		detail: {
// 			tags: ["Products"],
// 			summary: "获取推荐商品",
// 			description: "获取推荐的特色商品列表",
// 		},
// 	},
// )

// // 获取相关商品
// .get(
// 	"/:id/related",
// 	async ({ params: { id }, query }) => {
// 		try {
// 			// 先获取当前商品的分类信息
// 			const [currentProduct] = await db
// 				.select({ categoryId: productsSchema.categoryId })
// 				.from(productsSchema)
// 				.where(eq(productsSchema.id, parseInt(id, 10)))
// 				.limit(1);

// 			if (!currentProduct || !currentProduct.categoryId) {
// 				return commonRes(null, 404, "商品不存在或无分类信息");
// 			}

// 			const pageSize = query.pageSize
// 				? parseInt(query.pageSize as string, 10)
// 				: 4;

// 			// 获取同分类的其他商品
// 			const dbProducts = await db
// 				.select({
// 					id: productsSchema.id,
// 					name: productsSchema.name,
// 					slug: productsSchema.slug,
// 					description: productsSchema.description,
// 					shortDescription: productsSchema.shortDescription,
// 					price: productsSchema.price,
// 					comparePrice: productsSchema.comparePrice,
// 					sku: productsSchema.sku,
// 					stock: productsSchema.stock,
// 					images: productsSchema.images,
// 					colors: productsSchema.colors,
// 					sizes: productsSchema.sizes,
// 					features: productsSchema.features,
// 					categoryId: productsSchema.categoryId,
// 					categoryName: categoriesSchema.name,
// 					isActive: productsSchema.isActive,
// 					isFeatured: productsSchema.isFeatured,
// 					weight: productsSchema.weight,
// 					dimensions: productsSchema.dimensions,
// 					materials: productsSchema.materials,
// 					// brand: productsSchema.brand, // 字段不存在
// 					metaTitle: productsSchema.metaTitle,
// 					metaDescription: productsSchema.metaDescription,
// 					metaKeywords: productsSchema.metaKeywords,
// 					createdAt: productsSchema.createdAt,
// 					updatedAt: productsSchema.updatedAt,
// 				})
// 				.from(productsSchema)
// 				.leftJoin(
// 					categoriesSchema,
// 					eq(productsSchema.categoryId, categoriesSchema.id),
// 				)
// 				.where(
// 					and(
// 						eq(productsSchema.categoryId, currentProduct.categoryId),
// 						eq(productsSchema.isActive, true),
// 						sql`${productsSchema.id} != ${parseInt(id, 10)}`,
// 					),
// 				)
// 				.orderBy(desc(productsSchema.createdAt))
// 				.limit(pageSize);

// 			return commonRes(dbProducts, 200);
// 		} catch (error) {
// 			console.error("获取相关商品失败:", error);
// 			return commonRes(null, 500, "获取相关商品失败");
// 		}
// 	},
// 	{
// 		query: "RelatedProductsQueryDto",
// 		detail: {
// 			tags: ["Products"],
// 			summary: "获取相关商品",
// 			description: "根据商品ID获取同分类的相关商品",
// 		},
// 	},
// )

// // 获取热门搜索关键词
// .get(
// 	"/search/popular-terms",
// 	async ({ query }) => {
// 		try {
// 			const pageSize = query.pageSize || 10;

// 			// 从商品的标签和名称中提取热门搜索词
// 			const dbProducts = await db
// 				.select({
// 					name: productsSchema.name,
// 					tags: productsSchema.tags,
// 				})
// 				.from(productsSchema)
// 				.where(eq(productsSchema.isActive, true));

// 			const termCounts = new Map<string, number>();

// 			dbProducts.forEach((product) => {
// 				// 从商品名称中提取词汇
// 				const nameWords = product.name.toLowerCase().split(/\s+/);
// 				nameWords.forEach((word) => {
// 					if (word.length > 2) {
// 						termCounts.set(word, (termCounts.get(word) || 0) + 2); // 名称权重更高
// 					}
// 				});

// 				// 从标签中提取词汇
// 				if (product.tags && Array.isArray(product.tags)) {
// 					product.tags.forEach((tag: string) => {
// 						if (tag && tag.trim().length > 1) {
// 							const cleanTag = tag.trim().toLowerCase();
// 							termCounts.set(cleanTag, (termCounts.get(cleanTag) || 0) + 1);
// 						}
// 					});
// 				}
// 			});

// 			// 按频次排序并取前N个
// 			const sortedTerms = Array.from(termCounts.entries())
// 				.sort((a, b) => b[1] - a[1])
// 				.slice(0, pageSize)
// 				.map(([term]) => term);

// 			return commonRes(sortedTerms, 200);
// 		} catch (error) {
// 			console.error("获取热门搜索关键词失败:", error);
// 			return commonRes(null, 500, "获取热门搜索关键词失败");
// 		}
// 	},
// 	{
// 		query: "PopularTermsQueryDto",
// 		detail: {
// 			tags: ["Products"],
// 			summary: "获取热门搜索关键词",
// 			description: "获取基于商品数据的热门搜索关键词",
// 		},
// 	},
// )

// // 获取商品筛选选项
// .get(
// 	"/filter-options",
// 	async ({ query }) => {
// 		try {
// 			const categoryId = query.categoryId
// 				? parseInt(query.categoryId as string, 10)
// 				: undefined;

// 			// 构建查询条件
// 			const conditions = [eq(productsSchema.isActive, true)];
// 			if (categoryId) {
// 				conditions.push(eq(productsSchema.categoryId, categoryId));
// 			}

// 			// 获取商品数据
// 			const dbProducts = await db
// 				.select({
// 					colors: productsSchema.colors,
// 					sizes: productsSchema.sizes,
// 					tags: productsSchema.tags,
// 					price: productsSchema.price,
// 				})
// 				.from(productsSchema)
// 				.where(and(...conditions));

// 			// 提取唯一的颜色、尺寸、标签
// 			const colorsSet = new Set<string>();
// 			const sizesSet = new Set<string>();
// 			const tagsSet = new Set<string>();
// 			let minPrice = Infinity;
// 			let maxPrice = -Infinity;

// 			dbProducts.forEach((product) => {
// 				// 处理颜色
// 				if (product.colors && Array.isArray(product.colors)) {
// 					product.colors.forEach((color: string) => {
// 						if (color?.trim()) {
// 							colorsSet.add(color.trim());
// 						}
// 					});
// 				}

// 				// 处理尺寸
// 				if (product.sizes && Array.isArray(product.sizes)) {
// 					product.sizes.forEach((size: string) => {
// 						if (size?.trim()) {
// 							sizesSet.add(size.trim());
// 						}
// 					});
// 				}

// 				// 处理标签
// 				if (product.tags && Array.isArray(product.tags)) {
// 					product.tags.forEach((tag: string) => {
// 						if (tag?.trim()) {
// 							tagsSet.add(tag.trim());
// 						}
// 					});
// 				}

// 				// 处理价格范围
// 				if (product.price) {
// 					const price = parseFloat(product.price.toString());
// 					if (!isNaN(price)) {
// 						minPrice = Math.min(minPrice, price);
// 						maxPrice = Math.max(maxPrice, price);
// 					}
// 				}
// 			});

// 			const options = {
// 				colors: Array.from(colorsSet).sort(),
// 				sizes: Array.from(sizesSet).sort(),
// 				tags: Array.from(tagsSet).sort(),
// 				priceRange: {
// 					min: minPrice === Infinity ? 0 : minPrice,
// 					max: maxPrice === -Infinity ? 0 : maxPrice,
// 				},
// 			};

// 			return commonRes(options, 200);
// 		} catch (error) {
// 			console.error("获取筛选选项失败:", error);
// 			return commonRes(null, 500, "获取筛选选项失败");
// 		}
// 	},
// 	{
// 		query: "FilterOptionsQueryDto",
// 		detail: {
// 			tags: ["Products"],
// 			summary: "获取商品筛选选项",
// 			description: "获取商品的筛选选项，包括颜色、尺寸、标签和价格范围",
// 		},
// 	},
// );
