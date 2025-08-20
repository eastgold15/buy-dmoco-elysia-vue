import { SQL } from "bun";

import { drizzle } from "drizzle-orm/bun-sql";
import { envConfig } from "../config/env.ts";
import * as schema from "./schema/index.ts";

// 确保环境配置已加载
envConfig.loadConfig();

// 获取数据库连接URL
const databaseUrl = envConfig.get(
	"DATABASE_URL",
	"postgres://app_user:app_pass@localhost:5432/MechanicEndWorld",
);

console.log("1111", databaseUrl);

// Bun 内置的 SQL 客户端实例
const client = new SQL(databaseUrl!);

// 创建 Drizzle ORM 实例
export const db = drizzle({
	connection: {
		url: databaseUrl,
	},
	schema,
	client,
	casing: "snake_case",
});

// - Bun SQL 提供了高性能的底层数据库连接
// - Drizzle ORM 提供了类型安全和查询构建功能
// - 这种结合让你既能享受 Bun 的性能优势，又能使用 Drizzle 的 ORM 功能
