
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

/**
 * 商品分类表
 */
export const categoriesSchema = pgTable("categories", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	slug: varchar("slug", { length: 100 }).notNull().unique(),
	description: text("description"),
	parentId: integer("parent_id"),
	sortOrder: integer("sort_order").default(0),
	isVisible: boolean("is_visible").default(true),
	icon: varchar("icon", { length: 255 }),
	image: varchar("image", { length: 255 }),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 商品表
 */
export const productsSchema = pgTable("products", {

	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	slug: varchar("slug", { length: 255 }).notNull().unique(),
	description: text("description"),
	shortDescription: text("short_description"),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
	cost: decimal("cost", { precision: 10, scale: 2 }),
	sku: varchar("sku", { length: 100 }).unique(),
	barcode: varchar("barcode", { length: 100 }),
	weight: decimal("weight", { precision: 8, scale: 2 }),
	dimensions: json("dimensions"),
	images: json("images"),
	videos: json("videos"),
	colors: json("colors"),
	sizes: json("sizes"),
	materials: json("materials"),
	careInstructions: text("care_instructions"),
	features: json("features"),
	specifications: json("specifications"),
	categoryId: integer("category_id").references(() => categoriesSchema.id),
	stock: integer("stock").default(0),
	minStock: integer("min_stock").default(0),
	isActive: boolean("is_active").default(true),
	isFeatured: boolean("is_featured").default(false),
	metaTitle: varchar("meta_title", { length: 255 }),
	metaDescription: text("meta_description"),
	metaKeywords: varchar("meta_keywords", { length: 500 }),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 商品评价表
 */
export const reviewsSchema = pgTable("reviews", {
	id: serial("id").primaryKey(),
	productId: integer("product_id").references(() => productsSchema.id).notNull(),
	userName: varchar("user_name", { length: 100 }).notNull(),
	userEmail: varchar("user_email", { length: 255 }),
	rating: integer("rating").notNull(),
	title: varchar("title", { length: 255 }),
	content: text("content").notNull(),
	isVerified: boolean("is_verified").default(false),
	isApproved: boolean("is_approved").default(false),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 网站配置表
 */
export const siteConfigSchema = pgTable("site_config", {
	id: serial("id").primaryKey(),
	key: varchar("key", { length: 100 }).notNull().unique(),
	value: text("value"),
	description: text("description"),
	category: varchar("category", { length: 50 }).default("general"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 广告管理表
 */
export const advertisementsSchema = pgTable("advertisements", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	type: varchar("type", { length: 50 }).notNull(),
	image: text("image").notNull(),
	link: varchar("link", { length: 500 }),
	position: varchar("position", { length: 100 }),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	startDate: timestamp("start_date"),
	endDate: timestamp("end_date"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 顶部配置表
 */
export const headerConfigSchema = pgTable("header_config", {
	id: serial("id").primaryKey(),
	shippingText: varchar("shipping_text", { length: 200 }).default("FREE SHIPPING on orders over $59* details"),
	trackOrderText: varchar("track_order_text", { length: 100 }).default("Track Order"),
	helpText: varchar("help_text", { length: 100 }).default("Help"),
	trackOrderUrl: varchar("track_order_url", { length: 255 }).default("#"),
	helpUrl: varchar("help_url", { length: 255 }).default("#"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 底部配置表
 */
export const footerConfigSchema = pgTable("footer_config", {
	id: serial("id").primaryKey(),
	sectionTitle: varchar("section_title", { length: 100 }).notNull(),
	linkText: varchar("link_text", { length: 100 }).notNull(),
	linkUrl: varchar("link_url", { length: 255 }).notNull(),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 图片管理表
 */
export const imagesSchema = pgTable("images", {
	id: varchar("id", { length: 21 }).primaryKey(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	originalName: varchar("original_name", { length: 255 }).notNull(),
	url: text("url").notNull(),
	category: varchar("category", { length: 50 }).notNull().default("general"),
	fileSize: integer("file_size").notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	altText: text("alt_text").default(""),
	uploadDate: timestamp("upload_date").defaultNow().notNull(),
	updatedDate: timestamp("updated_date").defaultNow(),
});

