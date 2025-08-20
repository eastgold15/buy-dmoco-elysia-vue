// 商品分类数据类型定义
export interface Category {
  id: string;
  slug: string; // URL友好的标识符
  name: string; // 分类名称
  parentId?: string; // 父分类ID，用于构建树形结构
  level: number; // 分类层级，0为顶级分类
  sort: number; // 排序权重
  isVisible: boolean; // 是否显示
  description?: string; // 分类描述
  icon?: string; // 分类图标
  image?: string; // 分类图片
  createdAt: Date;
  updatedAt: Date;
}

// 创建分类请求参数
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: string;
  sort?: number;
  isVisible?: boolean;
  description?: string;
  icon?: string;
  image?: string;
}

// 更新分类请求参数
export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: string;
  sort?: number;
  isVisible?: boolean;
  description?: string;
  icon?: string;
  image?: string;
}

// 分类树形结构
export interface CategoryTree extends Category {
  children: CategoryTree[];
}

// API响应格式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}