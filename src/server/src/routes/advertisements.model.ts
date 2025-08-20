
import { t } from 'elysia';
import { UnoQuery } from '../utils/common.model';
import { DbType } from '../db/database.types';

// 广告类型枚举
export type AdvertisementType = 'banner' | 'carousel';

// 广告位置枚举
export type AdvertisementPosition = 'home-hero' | 'home-banner' | 'product-detail' | 'category-top' | 'sidebar';

// 创建广告请求
export interface CreateAdvertisementRequest {
	title: string;
	type: AdvertisementType;
	image: string;
	link?: string;
	position?: string;
	sortOrder?: number;
	isActive?: boolean;
	startDate?: Date;
	endDate?: Date;
}

// 更新广告请求
export interface UpdateAdvertisementRequest {
	title?: string;
	type?: AdvertisementType;
	image?: string;
	link?: string;
	position?: string;
	sortOrder?: number;
	isActive?: boolean;
	startDate?: Date;
	endDate?: Date;
}

// Elysia模型定义
export const advertisementsModel = {
    // 创建广告请求参数
    CreateAdvertisementDto: DbType.typebox.insert.advertisementsSchema,

    // 更新广告请求参数
    UpdateAdvertisementDto: t.Partial(DbType.typebox.insert.advertisementsSchema),

    // 排序更新请求
    UpdateSortRequest: t.Object({
        sortOrder: t.Number({ minimum: 0 })
    }),

    // 广告列表查询参数
    AdvertisementListQueryDto: t.Object({
        ...UnoQuery,
        name: t.Optional(t.String()),
        isVisible: t.Optional(t.Boolean()),
    }),
}
