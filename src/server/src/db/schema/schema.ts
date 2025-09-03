import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	json,
	numeric,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	varchar
} from "drizzle-orm/pg-core";
import { userSchema } from "./auth";

/**
 * 商品分类表 - 用于组织和分类商品
 */
export const categoriesSchema = pgTable("categories", {
	id: serial("id").primaryKey(), // 分类ID，主键
	name: varchar("name", { length: 100 }).notNull(), // 分类名称
	slug: varchar("slug", { length: 100 }).notNull().unique(), // 分类别名，用于URL优化
	description: text("description"), // 分类描述
	parentId: integer("parent_id"), // 父级分类ID，用于构建分类层级结构
	sortOrder: integer("sort_order").default(0), // 排序顺序
	isVisible: boolean("is_visible").default(true), // 是否可见
	icon: varchar("icon", { length: 255 }), // 分类图标
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});



/**
 * 商品表 - 存储所有商品信息
 */
export const productsSchema = pgTable("products", {
	id: serial("id").primaryKey(), // 商品ID，主键
	name: varchar("name", { length: 255 }).notNull(), // 商品名称
	slug: varchar("slug", { length: 255 }).notNull().unique(), // 商品别名，用于URL优化
	description: text("description"), // 商品详细描述
	shortDescription: text("short_description"), // 商品简短描述
	price: numeric("price", { precision: 10, scale: 2 }).notNull(), // 商品价格
	comparePrice: numeric("compare_price", { precision: 10, scale: 2 }), // 对比价格（原价）
	cost: numeric("cost", { precision: 10, scale: 2 }), // 成本价
	sku: varchar("sku", { length: 100 }).unique(), // SKU编码
	barcode: varchar("barcode", { length: 100 }), // 条形码
	weight: numeric("weight", { precision: 8, scale: 2 }), // 重量
	dimensions: json("dimensions"), // 尺寸信息（长宽高）
	colors: json("colors"), // 可选颜色
	sizes: json("sizes"), // 可选尺寸
	materials: json("materials"), // 材质信息
	careInstructions: text("care_instructions"), // 保养说明
	features: json("features"), // 商品特性
	specifications: json("specifications"), // 技术规格
	categoryId: integer("category_id").references(() => categoriesSchema.id, { onDelete: "set null" }), // 所属分类ID
	stock: integer("stock").default(0), // 库存数量
	minStock: integer("min_stock").default(0), // 最小库存警告线
	isActive: boolean("is_active").default(true), // 是否激活（上架）
	isFeatured: boolean("is_featured").default(false), // 是否推荐
	metaTitle: varchar("meta_title", { length: 255 }), // SEO标题
	metaDescription: text("meta_description"), // SEO描述
	metaKeywords: varchar("meta_keywords", { length: 500 }), // SEO关键词
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});

// 商品关系定义
export const productRelations = relations(productsSchema, ({ one, many }) => ({
	category: one(categoriesSchema, {
		fields: [productsSchema.categoryId],
		references: [categoriesSchema.id],
	}),
	// 商品图片关联
	productImages: many(productImagesSchema),
	// 商品视频关联
	productVideos: many(productVideosSchema),
}));

// 商品关系定义将在表定义之后

/**
 * 商品评价表 - 存储用户对商品的评价
 */
export const reviewsSchema = pgTable("reviews", {
	id: serial("id").primaryKey(), // 评价ID，主键
	productId: integer("product_id")
		.references(() => productsSchema.id, { onDelete: "cascade" })
		.notNull(), // 关联的商品ID
	userName: integer("user_name").references(() => userSchema.id, { onDelete: "set null" }), // 用户名
	// userEmail: varchar("user_email", { length: 255 }), // 用户邮箱
	rating: integer("rating").notNull(), // 评分（1-5星）
	title: varchar("title", { length: 255 }), // 评价标题
	content: text("content").notNull(), // 评价内容
	isVerified: boolean("is_verified").default(false), // 是否为验证购买用户
	isApproved: boolean("is_approved").default(false), // 是否已审核通过
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});

export const reviewRelations = relations(reviewsSchema, ({ one }) => ({
	product: one(productsSchema, {
		fields: [reviewsSchema.productId],
		references: [productsSchema.id],
	}),
	user: one(userSchema, {
		fields: [reviewsSchema.userName],
		references: [userSchema.id],
	}),
}));

/**
 * 网站配置表 - 存储网站的各种配置项
 */
export const siteConfigSchema = pgTable("site_config", {
	id: serial("id").primaryKey(), // 配置ID，主键
	key: varchar("key", { length: 100 }).notNull().unique(), // 配置键名
	value: text("value"), // 配置值
	description: text("description"), // 配置描述
	category: varchar("category", { length: 50 }).default("general"), // 配置分类
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});

/**
 * 广告管理表 - 存储网站广告信息
 */
export const advertisementsSchema = pgTable("advertisements", {
	id: serial("id").primaryKey(), // 广告ID，主键
	title: varchar("title", { length: 255 }).notNull(), // 广告标题
	type: varchar("type", { length: 50 }).notNull(), // 广告类型
	imageId: integer("image_id")
		.references(() => imagesSchema.id, { onDelete: "set null" })
		.notNull(), // 广告图片URL
	link: varchar("link", { length: 500 }), // 广告链接
	position: varchar("position", { length: 100 }), // 广告位置
	sortOrder: integer("sort_order").default(0), // 排序顺序
	isActive: boolean("is_active").default(true), // 是否激活
	startDate: timestamp("start_date"), // 开始展示日期
	endDate: timestamp("end_date"), // 结束展示日期
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});

export const adRelation = relations(advertisementsSchema, ({ one }) => ({
	image: one(imagesSchema, {
		fields: [advertisementsSchema.imageId],
		references: [imagesSchema.id],
	}),
}));

// 订单状态枚举
export const orderState = pgEnum("order_state", [
	"pending",
	"confirmed",
	"processing",
	"shipped",
	"delivered",
	"cancelled",
]);

// 支付状态枚举
export const paymentState = pgEnum("payment_state", [
	"pending",
	"paid",
	"failed",
	"refunded",
]);

/**
 * 订单表 - 存储用户订单信息
 */
export const ordersSchema = pgTable("orders", {
	id: serial("id").primaryKey(), // 订单ID，主键
	orderNumber: varchar("order_number", { length: 50 }).notNull().unique(), // 订单编号
	customerName: varchar("customer_name", { length: 100 }).notNull(), // 客户姓名
	customerEmail: varchar("customer_email", { length: 255 }).notNull(), // 客户邮箱
	customerPhone: varchar("customer_phone", { length: 20 }), // 客户电话
	shippingAddress: json("shipping_address").notNull(), // 收货地址
	billingAddress: json("billing_address"), // 账单地址
	subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(), // 小计金额
	shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }).default(
		"0.00",
	), // 运费
	taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0.00"), // 税费
	discountAmount: numeric("discount_amount", {
		precision: 10,
		scale: 2,
	}).default("0.00"), // 折扣金额
	totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(), // 总金额
	currency: varchar("currency", { length: 3 }).default("USD"), // 货币类型
	orderState: orderState("order_state"), // 订单状态
	paymentState: paymentState("payment_state"), // 支付状态
	paymentMethod: varchar("payment_method", { length: 50 }), // 支付方式
	paymentId: varchar("payment_id", { length: 255 }), // 支付ID
	trackingNumber: varchar("tracking_number", { length: 100 }), // 物流跟踪号
	shippingMethod: varchar("shipping_method", { length: 50 }), // 配送方式
	notes: text("notes"), // 订单备注
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});

/**
 * 订单项表 - 存储订单中的具体商品信息
 */
export const orderItemsSchema = pgTable("order_items", {
	id: serial("id").primaryKey(), // 订单项ID，主键
	orderId: integer("order_id")
		.references(() => ordersSchema.id, { onDelete: "cascade" })
		.notNull(), // 关联的订单ID
	productId: integer("product_id")
		.references(() => productsSchema.id, { onDelete: "set null" })
		.notNull(), // 关联的商品ID
	productName: varchar("product_name", { length: 255 }).notNull(), // 商品名称（快照）
	productSku: varchar("product_sku", { length: 100 }), // 商品SKU（快照）
	productImage: text("product_image"), // 商品图片URL（快照）
	unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(), // 单价
	quantity: integer("quantity").notNull(), // 数量
	totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(), // 总价
	selectedColor: varchar("selected_color", { length: 50 }), // 选择的颜色
	selectedSize: varchar("selected_size", { length: 50 }), // 选择的尺寸
	productOptions: json("product_options"), // 其他商品选项
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});

// 退款状态枚举
export const refundState = pgEnum("refund_state", [
	"pending",
	"approved",
	"rejected",
	"processed",
]);

/**
 * 退款表 - 存储退款申请信息
 */
export const refundsSchema = pgTable("refunds", {
	id: serial("id").primaryKey(), // 退款ID，主键
	orderId: integer("order_id")
		.references(() => ordersSchema.id, { onDelete: "cascade" })
		.notNull(), // 关联的订单ID
	refundNumber: varchar("refund_number", { length: 50 }).notNull().unique(), // 退款编号
	amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // 退款金额
	reason: text("reason").notNull(), // 退款原因
	refundState: refundState("refund_state"), // 退款状态
	refundMethod: varchar("refund_method", { length: 50 }), // 退款方式
	processedAt: timestamp("processed_at"), // 处理时间
	notes: text("notes"), // 备注信息
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});

/**
 * 合作伙伴表 - 存储合作伙伴信息，image_id关联媒体表
 */
export const partnersSchema = pgTable("partners", {
	id: serial("id").primaryKey(), // 合作伙伴ID，主键
	name: varchar("name", { length: 255 }).notNull(), // 合作伙伴名称
	description: text("description").notNull(), // 合作伙伴描述
	imageId: integer("image_id").references(() => imagesSchema.id, {
		onDelete: "set null",
	}), // 关联的图片ID
	url: varchar("url", { length: 500 }).notNull(), // 合作伙伴链接
	sortOrder: integer("sort_order").default(0), // 排序顺序
	isActive: boolean("is_active").default(true), // 是否激活
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});

// 合作伙伴关系定义
export const partnerRelations = relations(partnersSchema, ({ one }) => ({
	image: one(imagesSchema, {
		fields: [partnersSchema.imageId],
		references: [imagesSchema.id],
	}),
}));

/**
 * 图片管理表 - 存储网站所有图片文件信息
 */
export const imagesSchema = pgTable("images", {
	id: serial("id").primaryKey(), // 图片ID，主键
	url: text("url").notNull(), // 图片文件URL
	altText: text("alt_text").default(""), // 替代文本
	mimeType: varchar("mime_type", { length: 100 }).notNull(), // MIME类型
	fileSize: integer("file_size").notNull(), // 文件大小，单位：bytes
	fileName: varchar("file_name", { length: 255 }).notNull(), // 文件名
	originalName: varchar("original_name", { length: 255 }).notNull(), // 原始文件名
	category: varchar("category", { length: 50 }).notNull().default("general"), // 图片分类
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});


// 图片关系定义 图片对于产品是主表
export const imageRelations = relations(imagesSchema, ({ many }) => ({
	// 商品图片关联
	productImages: many(productImagesSchema),
	// 广告图片关联
	advertisements: one(advertisementsSchema),
	// 合作伙伴图片关联
	partners: one(partnersSchema),
	// 视频缩略图关联
	videoThumbnails: one(videosSchema),
}));

/**
 * 商品图片关联表 - 存储商品与图片的多对多关系
 */
export const productImagesSchema = pgTable("product_images", {
	id: serial("id").primaryKey(), // 关联ID，主键
	productId: integer("product_id")
		.references(() => productsSchema.id, { onDelete: "cascade" })
		.notNull(), // 商品ID
	imageId: integer("image_id")
		.references(() => imagesSchema.id, { onDelete: "cascade" })
		.notNull(), // 图片ID
	sortOrder: integer("sort_order").default(0), // 排序顺序
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
});

const productImageRelation = relations(productImagesSchema, ({ one }) => ({
	image: onemptied(imagesSchema, {
		fields: [productImagesSchema.imageId],
		references: [imagesSchema.id],
	}),
}))











// 商品图片关联表关系
export const productImageRelations = relations(productImagesSchema, ({ one }) => ({
	product: one(productsSchema, {
		fields: [productImagesSchema.productId],
		references: [productsSchema.id],
	}),
	image: one(imagesSchema, {
		fields: [productImagesSchema.imageId],
		references: [imagesSchema.id],
	}),
}));

// 商品视频关联表关系
export const productVideoRelations = relations(productVideosSchema, ({ one }) => ({
	product: one(productsSchema, {
		fields: [productVideosSchema.productId],
		references: [productsSchema.id],
	}),
	video: one(videosSchema, {
		fields: [productVideosSchema.videoId],
		references: [videosSchema.id],
	}),
}));




/**
 * 视频管理表 - 存储网站所有视频文件信息
 */
export const videosSchema = pgTable("videos", {
	id: serial("id").primaryKey(), // 视频ID，主键
	url: text("url").notNull(), // 视频文件URL
	altText: text("alt_text").default(""), // 替代文本
	mimeType: varchar("mime_type", { length: 100 }).notNull(), // MIME类型
	fileSize: integer("file_size").notNull(), // 文件大小，单位：bytes
	fileName: varchar("file_name", { length: 255 }).notNull(), // 文件名
	category: varchar("category", { length: 50 }).notNull().default("general"), // 视频分类
	duration: integer("duration"), // 视频时长（秒）
	thumbnailId: integer("thumbnail_id").references(() => imagesSchema.id, { onDelete: "set null" }), // 视频缩略图
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(), // 更新时间
});

// 视频关系
export const videoRelations = relations(videosSchema, ({ one, many }) => ({
	// 缩略图
	thumbnail: one(imagesSchema, {
		fields: [videosSchema.thumbnailId],
		references: [imagesSchema.id],
	}),
	// 商品视频关联
	productVideos: one(productVideosSchema),
}));

