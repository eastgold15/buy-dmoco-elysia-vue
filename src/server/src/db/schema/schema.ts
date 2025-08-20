
import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
	decimal,
	json
} from "drizzle-orm/pg-core";

// 商品分类表
export const categoriesSchema = pgTable("categories", {
	id: serial("id").primaryKey(), // 分类ID
	name: varchar("name", { length: 100 }).notNull(), // 分类名称
	slug: varchar("slug", { length: 100 }).notNull().unique(), // URL友好的标识符
	description: text("description"), // 分类描述
	parentId: integer("parent_id"), // 父分类ID，支持树形结构
	sortOrder: integer("sort_order").default(0), // 排序顺序
	isVisible: boolean("is_visible").default(true), // 是否显示
	icon: varchar("icon", { length: 255 }), // 分类图标
	image: varchar("image", { length: 255 }), // 分类图片
	createdAt: timestamp("created_at").defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at").defaultNow(), // 更新时间
});

// 商品表
export const productsSchema = pgTable("products", {
	id: serial("id").primaryKey(), // 商品ID
	name: varchar("name", { length: 255 }).notNull(), // 商品名称
	slug: varchar("slug", { length: 255 }).notNull().unique(), // URL友好的标识符
	description: text("description"), // 商品描述
	shortDescription: text("short_description"), // 简短描述
	price: decimal("price", { precision: 10, scale: 2 }).notNull(), // 价格
	comparePrice: decimal("compare_price", { precision: 10, scale: 2 }), // 对比价格
	cost: decimal("cost", { precision: 10, scale: 2 }), // 成本价
	sku: varchar("sku", { length: 100 }).unique(), // 商品编码
	barcode: varchar("barcode", { length: 100 }), // 条形码
	weight: decimal("weight", { precision: 8, scale: 2 }), // 重量
	dimensions: json("dimensions"), // 尺寸信息 {length, width, height}
	images: json("images"), // 商品图片数组
	videos: json("videos"), // 商品视频数组
	colors: json("colors"), // 颜色选项
	sizes: json("sizes"), // 尺寸选项
	materials: json("materials"), // 材质信息
	careInstructions: text("care_instructions"), // 护理说明
	features: json("features"), // 商品特性
	specifications: json("specifications"), // 规格参数
	categoryId: integer("category_id").references(() => categoriesSchema.id), // 分类ID
	stock: integer("stock").default(0), // 库存数量
	minStock: integer("min_stock").default(0), // 最小库存
	isActive: boolean("is_active").default(true), // 是否激活
	isFeatured: boolean("is_featured").default(false), // 是否推荐
	metaTitle: varchar("meta_title", { length: 255 }), // SEO标题
	metaDescription: text("meta_description"), // SEO描述
	metaKeywords: varchar("meta_keywords", { length: 500 }), // SEO关键词
	createdAt: timestamp("created_at").defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at").defaultNow(), // 更新时间
});

// 商品评价表
export const reviewsSchema = pgTable("reviews", {
	id: serial("id").primaryKey(), // 评价ID
	productId: integer("product_id").references(() => productsSchema.id).notNull(), // 商品ID
	userName: varchar("user_name", { length: 100 }).notNull(), // 用户名
	userEmail: varchar("user_email", { length: 255 }), // 用户邮箱
	rating: integer("rating").notNull(), // 评分 1-5
	title: varchar("title", { length: 255 }), // 评价标题
	content: text("content").notNull(), // 评价内容
	isVerified: boolean("is_verified").default(false), // 是否验证购买
	isApproved: boolean("is_approved").default(false), // 是否审核通过
	createdAt: timestamp("created_at").defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at").defaultNow(), // 更新时间
});

// 网站配置表
export const siteConfigSchema = pgTable("site_config", {
	id: serial("id").primaryKey(), // 配置ID
	key: varchar("key", { length: 100 }).notNull().unique(), // 配置键
	value: text("value"), // 配置值
	description: text("description"), // 配置描述
	category: varchar("category", { length: 50 }).default("general"), // 配置分类
	createdAt: timestamp("created_at").defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at").defaultNow(), // 更新时间
});

// 广告管理表
export const advertisementsSchema = pgTable("advertisements", {
	id: serial("id").primaryKey(), // 广告ID
	title: varchar("title", { length: 255 }).notNull(), // 广告标题
	type: varchar("type", { length: 50 }).notNull(), // 广告类型：banner, carousel
	image: varchar("image", { length: 500 }).notNull(), // 广告图片
	link: varchar("link", { length: 500 }), // 广告链接
	position: varchar("position", { length: 100 }), // 广告位置
	sortOrder: integer("sort_order").default(0), // 排序
	isActive: boolean("is_active").default(true), // 是否激活
	startDate: timestamp("start_date"), // 开始时间
	endDate: timestamp("end_date"), // 结束时间
	createdAt: timestamp("created_at").defaultNow(), // 创建时间
	updatedAt: timestamp("updated_at").defaultNow(), // 更新时间
});

// 技能效果表 (保留原有表)
export const skillEffectsSchema = pgTable("skill_effect", {
	id: serial("id").primaryKey(), // 效果ID
	buffName: varchar("buff_name", { length: 50 }).notNull(),
	maxFloor: integer("max_floor").notNull(),
	value: integer("value").notNull(), // 效果值
	negative: boolean("negative"), // 是否为负效果
	buffLv: integer("buffLv").notNull(), // buff的驱散等级
	description: text("description"), // 效果描述
});
