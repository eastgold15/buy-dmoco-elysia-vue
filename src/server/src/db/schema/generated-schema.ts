/**
 * 自动生成的数据库 Schema 文件
 * 请勿手动修改此文件，运行 `bun run generate:schema` 重新生成
 * 生成时间: 2025-08-20T05:38:32.898Z
 */

import { userSchema, tokenSchema } from './auth.ts';
import { categoriesSchema, productsSchema, reviewsSchema, siteConfigSchema, advertisementsSchema, skillEffectsSchema } from './schema.ts';

export const dbSchema = {
  userSchema,
  tokenSchema,
  categoriesSchema,
  productsSchema,
  reviewsSchema,
  siteConfigSchema,
  advertisementsSchema,
  skillEffectsSchema,
};

/**
 * 数据库 Schema 类型
 */
export type DbSchema = typeof dbSchema;

/**
 * 所有表的名称列表
 */
export const tableNames = ['userSchema', 'tokenSchema', 'categoriesSchema', 'productsSchema', 'reviewsSchema', 'siteConfigSchema', 'advertisementsSchema', 'skillEffectsSchema'] as const;

/**
 * 表名称类型
 */
export type TableName = typeof tableNames[number];
