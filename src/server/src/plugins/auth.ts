import { elysiaAuthDrizzlePlugin } from "@pori15/elysia-auth-drizzle";
import { Elysia } from "elysia";
import { envConfig } from "../config/env";
import { db } from "../db/connection";
import { tokenSchema, userSchema } from "../db/schema";

export const authPlugin = new Elysia({ name: "authPlugin" })
	.use(
		elysiaAuthDrizzlePlugin({
			jwtSecret: envConfig.get("JWT_SECRET") || "tzd",
			cookieSecret: envConfig.get("COOKIE_SECRET") || "cookie-secret",
			drizzle: {
				db: db,
				usersSchema: userSchema,
				tokensSchema: tokenSchema,
			},
			getTokenFrom: {
				from: "header",
				headerName: "authorization",
			},
			PublicUrlConfig: [
				{ url: "/api/auth/*", method: "*" },
				{ url: "/", method: "GET" },
				{ url: "/api/products", method: "GET" },
				{ url: "/api/categories", method: "GET" },
				{ url: "/api/advertisements", method: "GET" },
				{ url: "/api/partners", method: "GET" },
				{ url: "/api/images", method: "GET" },
				{ url: "/api/site-config", method: "GET" },
				{ url: "/api/statistics", method: "GET" },
				{ url: "/swagger", method: "GET" },
				{ url: "/swagger/json", method: "GET" },
			],
		}),
	)
	.as("global")
	.onError(({ error }) => {
		console.log(error);
		throw new Error("auth插件错误");
	});
