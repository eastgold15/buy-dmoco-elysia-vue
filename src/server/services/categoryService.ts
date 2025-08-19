import type { Category, CategoryTree, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category';

// 模拟数据库存储（实际项目中应该使用真实数据库）
let categories: Category[] = [
  {
    id: '1',
    name: '男装',
    level: 0,
    sort: 1,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: '女装',
    level: 0,
    sort: 2,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'T恤',
    parentId: '1',
    level: 1,
    sort: 1,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: '衬衫',
    parentId: '1',
    level: 1,
    sort: 2,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: '连衣裙',
    parentId: '2',
    level: 1,
    sort: 1,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export class CategoryService {
  // 获取所有分类
  static getAllCategories(): Category[] {
    return categories.sort((a, b) => a.sort - b.sort);
  }

  // 获取分类树形结构
  static getCategoryTree(): CategoryTree[] {
    const rootCategories = categories.filter(cat => !cat.parentId && cat.isVisible);
    return rootCategories.map(cat => this.buildCategoryTree(cat));
  }

  // 构建单个分类的树形结构
  private static buildCategoryTree(category: Category): CategoryTree {
    const children = categories
      .filter(cat => cat.parentId === category.id && cat.isVisible)
      .sort((a, b) => a.sort - b.sort)
      .map(cat => this.buildCategoryTree(cat));

    return {
      ...category,
      children
    };
  }

  // 根据ID获取分类
  static getCategoryById(id: string): Category | undefined {
    return categories.find(cat => cat.id === id);
  }

  // 创建新分类
  static createCategory(data: CreateCategoryRequest): Category {
    const newCategory: Category = {
      id: Date.now().toString(), // 简单的ID生成，实际应使用UUID
      name: data.name,
      parentId: data.parentId,
      level: data.parentId ? this.getCategoryLevel(data.parentId) + 1 : 0,
      sort: data.sort || categories.length + 1,
      isVisible: data.isVisible !== undefined ? data.isVisible : true,
      description: data.description,
      icon: data.icon,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    categories.push(newCategory);
    return newCategory;
  }

  // 更新分类
  static updateCategory(id: string, data: UpdateCategoryRequest): Category | null {
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) return null;

    const category = categories[categoryIndex];
    const updatedCategory: Category = {
      ...category,
      ...data,
      level: data.parentId ? this.getCategoryLevel(data.parentId) + 1 : category.level,
      updatedAt: new Date()
    };

    categories[categoryIndex] = updatedCategory;
    return updatedCategory;
  }

  // 删除分类
  static deleteCategory(id: string): boolean {
    const hasChildren = categories.some(cat => cat.parentId === id);
    if (hasChildren) {
      throw new Error('无法删除包含子分类的分类');
    }

    const initialLength = categories.length;
    categories = categories.filter(cat => cat.id !== id);
    return categories.length < initialLength;
  }

  // 获取分类层级
  private static getCategoryLevel(parentId: string): number {
    const parent = this.getCategoryById(parentId);
    return parent ? parent.level : 0;
  }

  // 获取子分类
  static getChildCategories(parentId: string): Category[] {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.sort - b.sort);
  }
}