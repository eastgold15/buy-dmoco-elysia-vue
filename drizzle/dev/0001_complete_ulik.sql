CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_sku" varchar(100),
	"product_image" text,
	"unit_price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"selected_color" varchar(50),
	"selected_size" varchar(50),
	"product_options" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"customer_name" varchar(100) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(20),
	"shipping_address" json NOT NULL,
	"billing_address" json,
	"subtotal" numeric(10, 2) NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0.00',
	"tax_amount" numeric(10, 2) DEFAULT '0.00',
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(20) DEFAULT 'pending',
	"payment_status" varchar(20) DEFAULT 'pending',
	"payment_method" varchar(50),
	"payment_id" varchar(255),
	"tracking_number" varchar(100),
	"shipping_method" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"refund_number" varchar(50) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"refund_method" varchar(50),
	"processed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "refunds_refund_number_unique" UNIQUE("refund_number")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;