// 前端分类相关类型定义

// 分类基础信息
export interface Category {
	id: string;
	slug: string;
	name: string;
	parentId?: string;
	level: number;
	sortOrder: number;
	isVisible: boolean;
	description?: string;
	icon?: string;
	image?: string;
	metaTitle?: string;
	metaDescription?: string;
	createdAt: string;
	updatedAt: string;
	children?: Category[];
	productCount?: number;
}

// 分类树形结构
export interface CategoryTree extends Category {
	children: CategoryTree[];
}

// 分类表单数据
export interface CategoryForm {
	name: string;
	slug: string;
	parentId?: string;
	description?: string;
	icon?: string;
	image?: string;
	isVisible: boolean;
	sortOrder: number;
	metaTitle?: string;
	metaDescription?: string;
}

// 分类查询参数
export interface CategoryQuery {
	parentId?: string;
	level?: number;
	isVisible?: boolean;
	includeChildren?: boolean;
	includeProductCount?: boolean;
}

// API响应类型
export interface CategoryResponse {
	success: boolean;
	data?: Category;
	message?: string;
	error?: string;
}

export interface CategoryListResponse {
	success: boolean;
	data?: Category[];
	message?: string;
	error?: string;
}

export interface CategoryTreeResponse {
	success: boolean;
	data?: CategoryTree[];
	message?: string;
	error?: string;
}

// 通用API响应类型
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}