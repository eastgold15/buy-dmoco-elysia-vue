// 前端广告相关类型定义

// 广告类型枚举 - 只有轮播图
export type AdvertisementType = "carousel";

// 广告位置枚举 - 只有首页轮播和分类页顶部
export type AdvertisementPosition =
	| "home-hero"
	| "category-top";

// 广告基础信息
export interface Advertisement {
	id: number;
	title: string;
	type: AdvertisementType;
	image: string;
	link?: string;
	position?: string;
	sortOrder: number;
	isActive: boolean;
	startDate?: string;
	endDate?: string;
	createdAt: string;
	updatedAt: string;
}

// 创建广告表单
export interface AdvertisementForm {
	title: string;
	type: AdvertisementType;
	image: string;
	link?: string;
	position?: string;
	sortOrder: number;
	isActive: boolean;
	startDate?: string;
	endDate?: string;
}

// 广告查询参数
export interface AdvertisementQuery {
	type?: AdvertisementType;
	position?: string;
	isActive?: boolean;
	page?: number;
	limit?: number;
}

// 广告API响应
export interface AdvertisementResponse {
	success: boolean;
	data?: Advertisement;
	message?: string;
	error?: string;
}

export interface AdvertisementListResponse {
	success: boolean;
	data?: {
		advertisements: Advertisement[];
		total: number;
		page: number;
		limit: number;
	};
	message?: string;
	error?: string;
}




