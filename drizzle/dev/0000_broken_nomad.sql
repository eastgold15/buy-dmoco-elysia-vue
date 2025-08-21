CREATE TABLE "tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(100),
	"nickname" varchar(50),
	"avatar" varchar(255),
	"status" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"image" text NOT NULL,
	"link" varchar(500),
	"position" varchar(100),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"parent_id" integer,
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"icon" varchar(255),
	"image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "footer_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_title" varchar(100) NOT NULL,
	"link_text" varchar(100) NOT NULL,
	"link_url" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "header_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipping_text" varchar(200) DEFAULT 'FREE SHIPPING on orders over $59* details',
	"track_order_text" varchar(100) DEFAULT 'Track Order',
	"help_text" varchar(100) DEFAULT 'Help',
	"track_order_url" varchar(255) DEFAULT '#',
	"help_url" varchar(255) DEFAULT '#',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"category" varchar(50) DEFAULT 'general' NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"alt_text" text DEFAULT '',
	"upload_date" timestamp DEFAULT now() NOT NULL,
	"updated_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"short_description" text,
	"price" numeric(10, 2) NOT NULL,
	"compare_price" numeric(10, 2),
	"cost" numeric(10, 2),
	"sku" varchar(100),
	"barcode" varchar(100),
	"weight" numeric(8, 2),
	"dimensions" json,
	"images" json,
	"videos" json,
	"colors" json,
	"sizes" json,
	"materials" json,
	"care_instructions" text,
	"features" json,
	"specifications" json,
	"category_id" integer,
	"stock" integer DEFAULT 0,
	"min_stock" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"user_name" varchar(100) NOT NULL,
	"user_email" varchar(255),
	"rating" integer NOT NULL,
	"title" varchar(255),
	"content" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"description" text,
	"category" varchar(50) DEFAULT 'general',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "token_id_idx" ON "tokens" USING btree ("id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "users" USING btree ("id");