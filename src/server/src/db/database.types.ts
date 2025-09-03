/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */

import { t } from 'elysia'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { spreads } from '../utils/dizzle.type'
import { dbSchema } from './schema/index'

/**
 * 数据库 TypeBox 配置
 */
export const DbType = {
  typebox: {
    insert: {
      userSchema: createInsertSchema(dbSchema.userSchema, {
        email: t.String({ format: "email" })
      }),
      tokenSchema: createInsertSchema(dbSchema.tokenSchema),
      categoriesSchema: createInsertSchema(dbSchema.categoriesSchema),
      productsSchema: createInsertSchema(dbSchema.productsSchema, {
        price: t.Number({ minimum: 0 }),
        comparePrice: t.Number({ minimum: 0 }),
        cost: t.Number({ minimum: 0 }),
        stock: t.Number({ minimum: 0 }),
        minStock: t.Number({ minimum: 0 }),
        weight: t.Number({ minimum: 0 }),
        categoryId: t.Number({ minimum: -1 }),
      }),
      productImagesSchema: createInsertSchema(dbSchema.productImagesSchema),
  productVideosSchema: createInsertSchema(dbSchema.productVideosSchema),
      reviewsSchema: createInsertSchema(dbSchema.reviewsSchema),
      siteConfigSchema: createInsertSchema(dbSchema.siteConfigSchema),
      advertisementsSchema: createInsertSchema(dbSchema.advertisementsSchema),
      ordersSchema: createInsertSchema(dbSchema.ordersSchema),
      orderItemsSchema: createInsertSchema(dbSchema.orderItemsSchema),
      refundsSchema: createInsertSchema(dbSchema.refundsSchema),
      partnersSchema: createInsertSchema(dbSchema.partnersSchema),
      imagesSchema: createInsertSchema(dbSchema.imagesSchema),
      videosSchema: createInsertSchema(dbSchema.videosSchema),
    
    },
    select: {
      userSchema: createSelectSchema(dbSchema.userSchema, {
        email: t.String({ format: "email" })
      }),
      tokenSchema: createSelectSchema(dbSchema.tokenSchema),
      categoriesSchema: createSelectSchema(dbSchema.categoriesSchema),
      productsSchema: createSelectSchema(dbSchema.productsSchema),
      productImagesSchema: createSelectSchema(dbSchema.productImagesSchema),
  productVideosSchema: createSelectSchema(dbSchema.productVideosSchema),
      reviewsSchema: createSelectSchema(dbSchema.reviewsSchema),
      siteConfigSchema: createSelectSchema(dbSchema.siteConfigSchema),
      advertisementsSchema: createSelectSchema(dbSchema.advertisementsSchema),
      ordersSchema: createSelectSchema(dbSchema.ordersSchema),
      orderItemsSchema: createSelectSchema(dbSchema.orderItemsSchema),
      refundsSchema: createSelectSchema(dbSchema.refundsSchema),
      partnersSchema: createSelectSchema(dbSchema.partnersSchema),
      imagesSchema: createSelectSchema(dbSchema.imagesSchema),
      videosSchema: createSelectSchema(dbSchema.videosSchema),
    
    }
  },
  spreads: {
    insert: spreads({
      userSchema: createInsertSchema(dbSchema.userSchema, {
        email: t.String({ format: "email" })
      }),
      tokenSchema: createInsertSchema(dbSchema.tokenSchema),
      categoriesSchema: createInsertSchema(dbSchema.categoriesSchema),
      productsSchema: createInsertSchema(dbSchema.productsSchema),
      productImagesSchema: createInsertSchema(dbSchema.productImagesSchema),
  productVideosSchema: createInsertSchema(dbSchema.productVideosSchema),
      reviewsSchema: createInsertSchema(dbSchema.reviewsSchema),
      siteConfigSchema: createInsertSchema(dbSchema.siteConfigSchema),
      advertisementsSchema: createInsertSchema(dbSchema.advertisementsSchema),
      ordersSchema: createInsertSchema(dbSchema.ordersSchema),
      orderItemsSchema: createInsertSchema(dbSchema.orderItemsSchema),
      refundsSchema: createInsertSchema(dbSchema.refundsSchema),
      partnersSchema: createInsertSchema(dbSchema.partnersSchema),
      imagesSchema: createInsertSchema(dbSchema.imagesSchema),
      videosSchema: createInsertSchema(dbSchema.videosSchema),
    
    }, 'insert'),
    select: spreads({
      userSchema: createSelectSchema(dbSchema.userSchema, {
        email: t.String({ format: "email" })
      }),
      tokenSchema: createSelectSchema(dbSchema.tokenSchema),
      categoriesSchema: createSelectSchema(dbSchema.categoriesSchema),
      productsSchema: createSelectSchema(dbSchema.productsSchema),
      productImagesSchema: createSelectSchema(dbSchema.productImagesSchema),
  productVideosSchema: createSelectSchema(dbSchema.productVideosSchema),
      reviewsSchema: createSelectSchema(dbSchema.reviewsSchema),
      siteConfigSchema: createSelectSchema(dbSchema.siteConfigSchema),
      advertisementsSchema: createSelectSchema(dbSchema.advertisementsSchema),
      ordersSchema: createSelectSchema(dbSchema.ordersSchema),
      orderItemsSchema: createSelectSchema(dbSchema.orderItemsSchema),
      refundsSchema: createSelectSchema(dbSchema.refundsSchema),
      partnersSchema: createSelectSchema(dbSchema.partnersSchema),
      imagesSchema: createSelectSchema(dbSchema.imagesSchema),
      videosSchema: createSelectSchema(dbSchema.videosSchema),
    
    }, 'select')
  }
} as const
