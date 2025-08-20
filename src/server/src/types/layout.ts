// 顶部配置接口
export interface HeaderConfig {
	id: number;
	shippingText: string; // 免运费信息
	trackOrderText: string; // 订单跟踪文本
	helpText: string; // 帮助文本
	trackOrderUrl: string; // 订单跟踪链接
	helpUrl: string; // 帮助链接
	isActive: boolean; // 是否启用
	createdAt: Date;
	updatedAt: Date;
}

// 底部配置接口
export interface FooterConfig {
	id: number;
	sectionTitle: string; // 分区标题
	linkText: string; // 链接文本
	linkUrl: string; // 链接地址
	sortOrder: number; // 排序
	isActive: boolean; // 是否启用
	createdAt: Date;
	updatedAt: Date;
}

// 底部配置分组接口
export interface FooterSection {
	sectionTitle: string;
	links: {
		text: string;
		url: string;
	}[];
}

// 顶部配置请求接口
export interface UpdateHeaderConfigRequest {
	shippingText?: string;
	trackOrderText?: string;
	helpText?: string;
	trackOrderUrl?: string;
	helpUrl?: string;
	isActive?: boolean;
}

// 底部配置请求接口
export interface CreateFooterConfigRequest {
	sectionTitle: string;
	linkText: string;
	linkUrl: string;
	sortOrder?: number;
	isActive?: boolean;
}

export interface UpdateFooterConfigRequest {
	sectionTitle?: string;
	linkText?: string;
	linkUrl?: string;
	sortOrder?: number;
	isActive?: boolean;
}

// API响应接口
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

// 布局配置响应接口
export interface LayoutConfigResponse {
	header: HeaderConfig;
	footer: FooterSection[];
}