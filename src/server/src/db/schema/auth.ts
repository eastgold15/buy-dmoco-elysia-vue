// ---------------------------登录相关--------------------------------------

import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar
} from "drizzle-orm/pg-core";

// 用户表
export const userSchema = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		username: varchar("username", { length: 50 }).notNull().unique(),
		password: varchar("password", { length: 255 }), // OAuth用户可能没有密码
		email: varchar("email", { length: 100 }).unique(), // @typebox { format: 'email' }
		nickname: varchar("nickname", { length: 50 }),
		avatar: varchar("avatar", { length: 255 }),
		role: varchar("role", { length: 20 }).notNull().default("user"), // user, admin
		status: integer("status").notNull().default(1), // 1: 正常, 0: 禁用
		// OAuth 相关字段
		googleId: varchar("google_id", { length: 100 }), // Google OAuth ID
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(users) => [
		index("user_id_idx").on(users.id),
		index("user_email_idx").on(users.email),
		index("user_google_id_idx").on(users.googleId),
	],
);
export const userRelations = relations(userSchema, ({ many }) => ({
	tokens: many(tokenSchema),
}));

export const tokenSchema = pgTable(
	"tokens",
	{
		id: serial("id").primaryKey(),
		ownerId: serial("owner_id").references(() => userSchema.id),
		accessToken: text("access_token").notNull(),
		refreshToken: text("refresh_token").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(token) => [index("token_id_idx").on(token.id)],
);
export const tokenRelations = relations(tokenSchema, ({ one }) => ({
	owner: one(userSchema, {
		fields: [tokenSchema.ownerId],
		references: [userSchema.id],
	}),
}));

// -----------------------------------------------------------------
