import { eq, desc, asc, and, or, like, sql, ilike } from 'drizzle-orm';
import { db } from '../db/connection';
import { productsSchema, categoriesSchema } from '../db/schema/schema';
import type { Product, ProductSearchParams, ProductSearchResult } from '../types/product';

// 数据库类型到业务类型的转换
function dbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description,
    shortDescription: dbProduct.shortDescription,
    price: parseFloat(dbProduct.price) || 0,
    salePrice: dbProduct.salePrice ? parseFloat(dbProduct.salePrice) : null,
    sku: dbProduct.sku,
    images: dbProduct.images || [],
    colors: dbProduct.colors || [],
    sizes: dbProduct.sizes || [],
    tags: dbProduct.tags || [],
    specifications: dbProduct.specifications || {},
    categoryId: dbProduct.categoryId?.toString(),
    stock: dbProduct.stock || 0,
    minStock: dbProduct.minStock || 0,
    isActive: dbProduct.isActive,
    isFeatured: dbProduct.isFeatured,
    metaTitle: dbProduct.metaTitle,
    metaDescription: dbProduct.metaDescription,
    metaKeywords: dbProduct.metaKeywords,
    createdAt: dbProduct.createdAt,
    updatedAt: dbProduct.updatedAt
  };
}

export class ProductService {
  // 获取所有商品
  static async getAllProducts(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  }): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      // 构建查询条件
      const conditions = [];
      
      if (params?.categoryId) {
        conditions.push(eq(productsSchema.categoryId, parseInt(params.categoryId)));
      }
      
      if (params?.isActive !== undefined) {
        conditions.push(eq(productsSchema.isActive, params.isActive));
      }
      
      if (params?.isFeatured !== undefined) {
        conditions.push(eq(productsSchema.isFeatured, params.isFeatured));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // 获取商品列表
      const dbProducts = await db
        .select()
        .from(productsSchema)
        .where(whereClause)
        .orderBy(desc(productsSchema.createdAt))
        .limit(limit)
        .offset(offset);

      // 获取总数
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(productsSchema)
        .where(whereClause);
      
      const total = totalResult[0]?.count || 0;
      const products = dbProducts.map(dbProductToProduct);

      return {
        products,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('获取商品列表失败:', error);
      throw new Error('获取商品列表失败');
    }
  }

  // 根据ID获取商品
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const dbProduct = await db.select().from(productsSchema).where(eq(productsSchema.id, parseInt(id))).limit(1);
      return dbProduct.length > 0 ? dbProductToProduct(dbProduct[0]) : null;
    } catch (error) {
      console.error('获取商品详情失败:', error);
      throw new Error('获取商品详情失败');
    }
  }

  // 根据slug获取商品
  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const dbProduct = await db.select().from(productsSchema).where(eq(productsSchema.slug, slug)).limit(1);
      return dbProduct.length > 0 ? dbProductToProduct(dbProduct[0]) : null;
    } catch (error) {
      console.error('获取商品详情失败:', error);
      throw new Error('获取商品详情失败');
    }
  }

  // 搜索商品
  static async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
    try {
      const {
        query = '',
        categoryId,
        minPrice,
        maxPrice,
        colors = [],
        sizes = [],
        tags = [],
        isActive = true,
        isFeatured,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = params;

      const offset = (page - 1) * limit;
      const conditions = [];

      // 基础条件：只显示激活的商品
      if (isActive !== undefined) {
        conditions.push(eq(productsSchema.isActive, isActive));
      }

      // 关键词搜索：在商品名称、描述、标签中搜索
      if (query.trim()) {
        const searchTerm = `%${query.trim()}%`;
        conditions.push(
          or(
            ilike(productsSchema.name, searchTerm),
            ilike(productsSchema.description, searchTerm),
            ilike(productsSchema.shortDescription, searchTerm),
            ilike(productsSchema.metaKeywords, searchTerm),
            sql`${productsSchema.tags}::text ILIKE ${searchTerm}`
          )
        );
      }

      // 分类筛选
      if (categoryId) {
        conditions.push(eq(productsSchema.categoryId, parseInt(categoryId)));
      }

      // 价格范围筛选
      if (minPrice !== undefined) {
        conditions.push(sql`${productsSchema.price} >= ${minPrice}`);
      }
      if (maxPrice !== undefined) {
        conditions.push(sql`${productsSchema.price} <= ${maxPrice}`);
      }

      // 颜色筛选
      if (colors.length > 0) {
        const colorConditions = colors.map(color => 
          sql`${productsSchema.colors}::text ILIKE ${'%' + color + '%'}`
        );
        conditions.push(or(...colorConditions));
      }

      // 尺寸筛选
      if (sizes.length > 0) {
        const sizeConditions = sizes.map(size => 
          sql`${productsSchema.sizes}::text ILIKE ${'%' + size + '%'}`
        );
        conditions.push(or(...sizeConditions));
      }

      // 标签筛选
      if (tags.length > 0) {
        const tagConditions = tags.map(tag => 
          sql`${productsSchema.tags}::text ILIKE ${'%' + tag + '%'}`
        );
        conditions.push(or(...tagConditions));
      }

      // 推荐商品筛选
      if (isFeatured !== undefined) {
        conditions.push(eq(productsSchema.isFeatured, isFeatured));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // 排序
      let orderByClause;
      const isDesc = sortOrder === 'desc';
      
      switch (sortBy) {
        case 'price':
          orderByClause = isDesc ? desc(productsSchema.price) : asc(productsSchema.price);
          break;
        case 'name':
          orderByClause = isDesc ? desc(productsSchema.name) : asc(productsSchema.name);
          break;
        case 'createdAt':
        default:
          orderByClause = isDesc ? desc(productsSchema.createdAt) : asc(productsSchema.createdAt);
          break;
      }

      // 获取商品列表
      const dbProducts = await db
        .select()
        .from(productsSchema)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      // 获取总数
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(productsSchema)
        .where(whereClause);
      
      const total = totalResult[0]?.count || 0;
      const products = dbProducts.map(dbProductToProduct);

      return {
        products,
        total,
        page,
        limit,
        query,
        filters: {
          categoryId,
          minPrice,
          maxPrice,
          colors,
          sizes,
          tags,
          isFeatured
        },
        sort: {
          sortBy,
          sortOrder
        }
      };
    } catch (error) {
      console.error('搜索商品失败:', error);
      throw new Error('搜索商品失败');
    }
  }

  // 获取推荐商品
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const dbProducts = await db
        .select()
        .from(productsSchema)
        .where(and(
          eq(productsSchema.isActive, true),
          eq(productsSchema.isFeatured, true)
        ))
        .orderBy(desc(productsSchema.createdAt))
        .limit(limit);

      return dbProducts.map(dbProductToProduct);
    } catch (error) {
      console.error('获取推荐商品失败:', error);
      throw new Error('获取推荐商品失败');
    }
  }

  // 获取相关商品（同分类）
  static async getRelatedProducts(productId: string, categoryId: string, limit: number = 4): Promise<Product[]> {
    try {
      const dbProducts = await db
        .select()
        .from(productsSchema)
        .where(and(
          eq(productsSchema.isActive, true),
          eq(productsSchema.categoryId, parseInt(categoryId)),
          sql`${productsSchema.id} != ${parseInt(productId)}`
        ))
        .orderBy(desc(productsSchema.createdAt))
        .limit(limit);

      return dbProducts.map(dbProductToProduct);
    } catch (error) {
      console.error('获取相关商品失败:', error);
      throw new Error('获取相关商品失败');
    }
  }

  // 获取热门搜索关键词（基于商品标签和名称）
  static async getPopularSearchTerms(limit: number = 10): Promise<string[]> {
    try {
      // 这里简化实现，实际项目中可能需要统计搜索日志
      const dbProducts = await db
        .select({
          tags: productsSchema.tags,
          name: productsSchema.name
        })
        .from(productsSchema)
        .where(eq(productsSchema.isActive, true))
        .limit(100);

      const terms = new Set<string>();
      
      dbProducts.forEach(product => {
        // 从标签中提取关键词
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach((tag: string) => {
            if (tag && tag.trim()) {
              terms.add(tag.trim().toLowerCase());
            }
          });
        }
        
        // 从商品名称中提取关键词（简单分词）
        if (product.name) {
          const words = product.name.split(/\s+/);
          words.forEach(word => {
            if (word.length > 2) {
              terms.add(word.toLowerCase());
            }
          });
        }
      });

      return Array.from(terms).slice(0, limit);
    } catch (error) {
      console.error('获取热门搜索关键词失败:', error);
      return [];
    }
  }

  // 获取商品筛选选项（颜色、尺寸、价格范围等）
  static async getFilterOptions(categoryId?: string): Promise<{
    colors: string[];
    sizes: string[];
    priceRange: { min: number; max: number };
    tags: string[];
  }> {
    try {
      const conditions = [eq(productsSchema.isActive, true)];
      
      if (categoryId) {
        conditions.push(eq(productsSchema.categoryId, parseInt(categoryId)));
      }

      const whereClause = and(...conditions);

      const dbProducts = await db
        .select({
          colors: productsSchema.colors,
          sizes: productsSchema.sizes,
          tags: productsSchema.tags,
          price: productsSchema.price
        })
        .from(productsSchema)
        .where(whereClause);

      const colors = new Set<string>();
      const sizes = new Set<string>();
      const tags = new Set<string>();
      let minPrice = Infinity;
      let maxPrice = 0;

      dbProducts.forEach(product => {
        // 收集颜色
        if (product.colors && Array.isArray(product.colors)) {
          product.colors.forEach((color: string) => {
            if (color && color.trim()) {
              colors.add(color.trim());
            }
          });
        }

        // 收集尺寸
        if (product.sizes && Array.isArray(product.sizes)) {
          product.sizes.forEach((size: string) => {
            if (size && size.trim()) {
              sizes.add(size.trim());
            }
          });
        }

        // 收集标签
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach((tag: string) => {
            if (tag && tag.trim()) {
              tags.add(tag.trim());
            }
          });
        }

        // 计算价格范围
        const price = parseFloat(product.price) || 0;
        if (price > 0) {
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        }
      });

      return {
        colors: Array.from(colors).sort(),
        sizes: Array.from(sizes).sort(),
        tags: Array.from(tags).sort(),
        priceRange: {
          min: minPrice === Infinity ? 0 : minPrice,
          max: maxPrice
        }
      };
    } catch (error) {
      console.error('获取筛选选项失败:', error);
      return {
        colors: [],
        sizes: [],
        tags: [],
        priceRange: { min: 0, max: 0 }
      };
    }
  }
}