// 广告相关类型定义

// 广告类型枚举
export type AdvertisementType = 'banner' | 'carousel';

// 广告位置枚举
export type AdvertisementPosition = 'home-hero' | 'home-banner' | 'product-detail' | 'category-top' | 'sidebar';

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
	startDate?: Date;
	endDate?: Date;
	createdAt: Date;
	updatedAt: Date;
}

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
}

// 轮播图广告特定类型
export interface CarouselAdvertisement extends Advertisement {
	type: 'carousel';
}

// Banner广告特定类型
export interface BannerAdvertisement extends Advertisement {
	type: 'banner';
}

// 文件上传响应
export interface FileUploadResponse {
	success: boolean;
	data?: {
		filename: string;
		url: string;
		size: number;
	};
	message?: string;
}