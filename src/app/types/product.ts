// 前端商品相关类型定义

// 商品基础信息
export interface Product {
	id: string;
	name: string;
	slug: string;
	description?: string;
	shortDescription?: string;
	price: number;
	salePrice?: number;
	sku: string;
	stock: number;
	weight?: number;
	dimensions?: string;
	categoryId?: string;
	brand?: string;
	tags?: string[];
	images: string[];
	colors?: ProductColor[];
	sizes?: ProductSize[];
	isActive: boolean;
	isFeatured: boolean;
	metaTitle?: string;
	metaDescription?: string;
	createdAt: string;
	updatedAt: string;
}

// 商品颜色
export interface ProductColor {
	name: string;
	value: string; // 颜色值，如 #FF0000
	image?: string; // 该颜色对应的商品图片
}

// 商品尺寸
export interface ProductSize {
	name: string;
	value: string;
	stock?: number;
}

// 商品搜索参数
export interface ProductSearchParams {
	q?: string; // 搜索关键词
	categoryId?: string;
	minPrice?: number;
	maxPrice?: number;
	brand?: string;
	color?: string;
	size?: string;
	inStock?: boolean;
	isFeatured?: boolean;
	sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

// 商品表单数据
export interface ProductForm {
	name: string;
	slug: string;
	description?: string;
	shortDescription?: string;
	price: number;
	salePrice?: number;
	sku: string;
	stock: number;
	weight?: number;
	dimensions?: string;
	categoryId?: string;
	brand?: string;
	tags?: string[];
	images: string[];
	colors?: ProductColor[];
	sizes?: ProductSize[];
	isActive: boolean;
	isFeatured: boolean;
	metaTitle?: string;
	metaDescription?: string;
}

// API响应类型
export interface ProductResponse {
	success: boolean;
	data?: Product;
	message?: string;
	error?: string;
}

export interface ProductListResponse {
	success: boolean;
	data?: {
		products: Product[];
		total: number;
		page: number;
		limit: number;
	};
	message?: string;
	error?: string;
}

// 商品评价
export interface ProductReview {
	id: string;
	productId: string;
	userName: string;
	userEmail?: string;
	rating: number; // 1-5星
	title?: string;
	content: string;
	isVerified: boolean;
	createdAt: string;
	updatedAt: string;
}

// 商品评价表单
export interface ReviewForm {
	productId: string;
	userName: string;
	userEmail?: string;
	rating: number;
	title?: string;
	content: string;
}

// 评价API响应
export interface ReviewResponse {
	success: boolean;
	data?: ProductReview;
	message?: string;
	error?: string;
}

export interface ReviewListResponse {
	success: boolean;
	data?: {
		reviews: ProductReview[];
		total: number;
		page: number;
		limit: number;
		averageRating: number;
	};
	message?: string;
	error?: string;
}