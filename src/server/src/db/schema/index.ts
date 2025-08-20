// 导出所有数据库模式

export * from "./auth.ts";
export * from "./schema.ts";


// ------------------上面是导出schema--------------------------------------
// - 导出 dbTable 对象，包含 insert 和 select 两个经过处理的数据库模式
// - 主要用于类型转换，将 Drizzle 表结构转为 TypeBox 类型

import { spreads } from "../../utils/dizzle.type.ts";
// 生成所有的shema
import { dbSchema } from "./generated-schema.ts";
// 导出 TypeBox 类型
export const dbTable = {
	insert: spreads(dbSchema, "insert"),
	select: spreads(dbSchema, "select"),
} as const;

type  a=   typeof  dbTable.select.footerConfigSchema
