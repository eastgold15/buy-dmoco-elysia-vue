import { eq, desc, asc, and, isNull, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import { categoriesSchema } from '../db/schema/schema';
import type { Category, CategoryTree, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category';

// 数据库类型到业务类型的转换
function dbCategoryToCategory(dbCategory: any): Category {
  return {
    id: dbCategory.id.toString(),
    name: dbCategory.name,
    slug: dbCategory.slug,
    description: dbCategory.description,
    parentId: dbCategory.parentId?.toString(),
    level: 0, // 将在构建树时计算
    sort: dbCategory.sortOrder || 0,
    isVisible: dbCategory.isVisible,
    icon: dbCategory.icon,
    image: dbCategory.image,
    createdAt: dbCategory.createdAt,
    updatedAt: dbCategory.updatedAt
  };
}

export class CategoryService {
  // 获取所有分类
  static async getAllCategories(): Promise<Category[]> {
    try {
      const dbCategories = await db.select().from(categoriesSchema).orderBy(asc(categoriesSchema.sortOrder));
      return dbCategories.map(dbCategoryToCategory);
    } catch (error) {
      console.error('获取所有分类失败:', error);
      throw new Error('获取分类列表失败');
    }
  }

  // 获取分类树形结构
  static async getCategoryTree(): Promise<CategoryTree[]> {
    try {
      const allCategories = await this.getAllCategories();
      const rootCategories = allCategories.filter(cat => !cat.parentId && cat.isVisible);
      return rootCategories.map(cat => this.buildCategoryTree(cat, allCategories));
    } catch (error) {
      console.error('获取分类树失败:', error);
      throw new Error('获取分类树失败');
    }
  }

  // 构建单个分类的树形结构
  private static buildCategoryTree(category: Category, allCategories: Category[]): CategoryTree {
    const children = allCategories
      .filter(cat => cat.parentId === category.id && cat.isVisible)
      .sort((a, b) => a.sort - b.sort)
      .map(cat => this.buildCategoryTree(cat, allCategories));

    return {
      ...category,
      children
    };
  }

  // 根据ID获取分类
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const dbCategory = await db.select().from(categoriesSchema).where(eq(categoriesSchema.id, parseInt(id))).limit(1);
      return dbCategory.length > 0 ? dbCategoryToCategory(dbCategory[0]) : null;
    } catch (error) {
      console.error('获取分类失败:', error);
      throw new Error('获取分类失败');
    }
  }

  // 创建新分类
  static async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      // 使用传入的slug，如果没有则自动生成
      const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const newCategoryData = {
        name: data.name,
        slug: slug,
        description: data.description,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        sortOrder: data.sort || 0,
        isVisible: data.isVisible !== undefined ? data.isVisible : true,
        icon: data.icon,
        image: data.image
      };
      
      const result = await db.insert(categoriesSchema).values(newCategoryData).returning();
      return dbCategoryToCategory(result[0]);
    } catch (error) {
      console.error('创建分类失败:', error);
      throw new Error('创建分类失败');
    }
  }

  // 更新分类
  static async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category | null> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: new Date()
      };
      
      // 处理slug字段
      if (data.slug !== undefined) {
        updateData.slug = data.slug;
      } else if (data.name && !data.slug) {
        // 如果更新了名称但没有提供slug，则自动生成
        updateData.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      
      // 转换parentId
      if (data.parentId !== undefined) {
        updateData.parentId = data.parentId ? parseInt(data.parentId) : null;
      }
      
      // 转换sort为sortOrder
      if (data.sort !== undefined) {
        updateData.sortOrder = data.sort;
        delete updateData.sort;
      }
      
      const result = await db.update(categoriesSchema)
        .set(updateData)
        .where(eq(categoriesSchema.id, parseInt(id)))
        .returning();
        
      return result.length > 0 ? dbCategoryToCategory(result[0]) : null;
    } catch (error) {
      console.error('更新分类失败:', error);
      throw new Error('更新分类失败');
    }
  }

  // 删除分类
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      // 检查是否有子分类
      const children = await db.select().from(categoriesSchema).where(eq(categoriesSchema.parentId, parseInt(id)));
      if (children.length > 0) {
        throw new Error('该分类下还有子分类，无法删除');
      }
      
      const result = await db.delete(categoriesSchema).where(eq(categoriesSchema.id, parseInt(id))).returning();
      return result.length > 0;
    } catch (error) {
      console.error('删除分类失败:', error);
      throw new Error('删除分类失败');
    }
  }

  // 获取分类层级
  private static async getCategoryLevel(parentId: string): Promise<number> {
    const parent = await this.getCategoryById(parentId);
    return parent ? parent.level : 0;
  }

  // 获取子分类
  static async getChildCategories(parentId: string): Promise<Category[]> {
    try {
      const dbCategories = await db.select().from(categoriesSchema)
        .where(eq(categoriesSchema.parentId, parseInt(parentId)))
        .orderBy(asc(categoriesSchema.sortOrder));
      return dbCategories.map(dbCategoryToCategory);
    } catch (error) {
      console.error('获取子分类失败:', error);
      throw new Error('获取子分类失败');
    }
  }

  // 更新分类排序
  static async updateCategorySort(id: string, sortOrder: number): Promise<boolean> {
    try {
      const result = await db.update(categoriesSchema)
        .set({ sortOrder, updatedAt: new Date() })
        .where(eq(categoriesSchema.id, parseInt(id)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('更新分类排序失败:', error);
      throw new Error('更新分类排序失败');
    }
  }

  // 切换分类显示状态
  static async toggleCategoryVisibility(id: string): Promise<boolean> {
    try {
      const category = await this.getCategoryById(id);
      if (!category) {
        throw new Error('分类不存在');
      }
      
      const result = await db.update(categoriesSchema)
        .set({ isVisible: !category.isVisible, updatedAt: new Date() })
        .where(eq(categoriesSchema.id, parseInt(id)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('切换分类显示状态失败:', error);
      throw new Error('切换分类显示状态失败');
    }
  }

  // 分类上移
  static async moveCategoryUp(id: string): Promise<boolean> {
    try {
      const category = await this.getCategoryById(id);
      if (!category) {
        throw new Error('分类不存在');
      }

      // 获取同级分类中排序值小于当前分类且最接近的分类
      const prevCategory = await db.select()
        .from(categoriesSchema)
        .where(
          and(
            category.parentId 
              ? eq(categoriesSchema.parentId, parseInt(category.parentId))
              : isNull(categoriesSchema.parentId),
            sql`${categoriesSchema.sortOrder} < ${category.sort}`
          )
        )
        .orderBy(desc(categoriesSchema.sortOrder))
        .limit(1);

      if (prevCategory.length === 0) {
        return false; // 已经是第一个，无法上移
      }

      // 交换排序值
      const prevSort = prevCategory[0].sortOrder;
      const currentSort = category.sort;

      await db.update(categoriesSchema)
        .set({ sortOrder: prevSort, updatedAt: new Date() })
        .where(eq(categoriesSchema.id, parseInt(id)));

      await db.update(categoriesSchema)
        .set({ sortOrder: currentSort, updatedAt: new Date() })
        .where(eq(categoriesSchema.id, prevCategory[0].id));

      return true;
    } catch (error) {
      console.error('分类上移失败:', error);
      throw new Error('分类上移失败');
    }
  }

  // 分类下移
  static async moveCategoryDown(id: string): Promise<boolean> {
    try {
      const category = await this.getCategoryById(id);
      if (!category) {
        throw new Error('分类不存在');
      }

      // 获取同级分类中排序值大于当前分类且最接近的分类
      const nextCategory = await db.select()
        .from(categoriesSchema)
        .where(
          and(
            category.parentId 
              ? eq(categoriesSchema.parentId, parseInt(category.parentId))
              : isNull(categoriesSchema.parentId),
            sql`${categoriesSchema.sortOrder} > ${category.sort}`
          )
        )
        .orderBy(asc(categoriesSchema.sortOrder))
        .limit(1);

      if (nextCategory.length === 0) {
        return false; // 已经是最后一个，无法下移
      }

      // 交换排序值
      const nextSort = nextCategory[0].sortOrder;
      const currentSort = category.sort;

      await db.update(categoriesSchema)
        .set({ sortOrder: nextSort, updatedAt: new Date() })
        .where(eq(categoriesSchema.id, parseInt(id)));

      await db.update(categoriesSchema)
        .set({ sortOrder: currentSort, updatedAt: new Date() })
        .where(eq(categoriesSchema.id, nextCategory[0].id));

      return true;
    } catch (error) {
      console.error('分类下移失败:', error);
      throw new Error('分类下移失败');
    }
  }
}