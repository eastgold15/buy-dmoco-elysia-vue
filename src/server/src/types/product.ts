// 商品相关数据类型定义

// 商品尺寸信息
export interface ProductSize {
  id: string;
  name: string; // 如 'S', 'M', 'L', 'XL'
  ukSize?: string; // 英国尺码
  euSize?: string; // 欧洲尺码
  usSize?: string; // 美国尺码
  stock: number; // 库存数量
  isAvailable: boolean; // 是否可用
}

// 商品颜色信息
export interface ProductColor {
  id: string;
  name: string; // 颜色名称
  hexCode: string; // 颜色代码
  imageUrl?: string; // 颜色对应的商品图片
}

// 商品图片信息
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean; // 是否为主图
  sortOrder: number; // 排序
}

// 商品视频信息
export interface ProductVideo {
  id: string;
  url: string;
  thumbnail: string; // 视频缩略图
  title: string;
  duration?: number; // 视频时长（秒）
}

// 商品评价信息
export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5星评分
  comment: string;
  images?: string[]; // 评价图片
  createdAt: Date;
  isVerified: boolean; // 是否验证购买
}

// 商品规格信息
export interface ProductSpecification {
  name: string;
  value: string;
}

// 商品价格信息
export interface ProductPrice {
  originalPrice: number; // 原价
  currentPrice: number; // 现价
  currency: string; // 货币单位
  discount?: number; // 折扣百分比
  installmentPrice?: number; // 分期付款价格
  installmentCount?: number; // 分期数量
}

// 商品库存信息
export interface ProductStock {
  totalStock: number; // 总库存
  availableStock: number; // 可用库存
  reservedStock: number; // 预留库存
  lowStockThreshold: number; // 低库存阈值
}

// 商品SEO信息
export interface ProductSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string; // URL友好的标识符
}

// 商品主要数据结构
export interface Product {
  id: string;
  title: string; // 商品标题
  shortDescription: string; // 简短描述
  fullDescription: string; // 详细描述
  brand: string; // 品牌
  model: string; // 型号
  sku: string; // 商品编码
  
  // 价格信息
  price: ProductPrice;
  
  // 分类信息
  categoryId: string;
  categoryPath: string[]; // 分类路径
  tags: string[]; // 标签
  
  // 商品媒体
  images: ProductImage[];
  videos: ProductVideo[];
  
  // 商品变体
  colors: ProductColor[];
  sizes: ProductSize[];
  
  // 库存信息
  stock: ProductStock;
  
  // 商品规格
  specifications: ProductSpecification[];
  
  // 商品特性
  features: string[]; // 商品特点
  materials: string[]; // 材质信息
  careInstructions: string[]; // 护理说明
  
  // 评价信息
  reviews: ProductReview[];
  averageRating: number; // 平均评分
  totalReviews: number; // 总评价数
  
  // 商品状态
  isActive: boolean; // 是否激活
  isFeatured: boolean; // 是否推荐
  isNew: boolean; // 是否新品
  isOnSale: boolean; // 是否促销
  
  // SEO信息
  seo: ProductSEO;
  
  // 时间信息
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // 销售信息
  salesCount: number; // 销售数量
  viewCount: number; // 浏览次数
  
  // 配送信息
  weight: number; // 重量（克）
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  
  // 相关商品
  relatedProductIds: string[];
  
  // 奖励积分
  rewardPoints: number;
}

// 商品列表查询参数
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  sortBy?: 'price' | 'rating' | 'sales' | 'newest' | 'name';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
}

// 商品列表响应
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 创建商品请求
export interface CreateProductRequest {
  title: string;
  shortDescription: string;
  fullDescription: string;
  brand: string;
  model: string;
  categoryId: string;
  price: Omit<ProductPrice, 'currency'>;
  images: Omit<ProductImage, 'id'>[];
  colors: Omit<ProductColor, 'id'>[];
  sizes: Omit<ProductSize, 'id'>[];
  specifications: ProductSpecification[];
  features: string[];
  materials: string[];
  careInstructions: string[];
  tags: string[];
  weight: number;
  dimensions: Product['dimensions'];
  seo: ProductSEO;
}

// 更新商品请求
export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

// 商品变体选择
export interface ProductVariantSelection {
  productId: string;
  colorId?: string;
  sizeId?: string;
  quantity: number;
}

// 购物车商品项
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  colorId?: string;
  sizeId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
}

// 收藏商品
export interface FavoriteProduct {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  addedAt: Date;
}