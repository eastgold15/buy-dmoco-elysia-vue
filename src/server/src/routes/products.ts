import { Elysia } from "elysia";
import { ProductService } from '../services/productService';
import type { ProductSearchParams } from '../../../types/product';
import type { ApiResponse } from '../../../types/category';

export const productsRoute = new Elysia({ tags: ['Products'] })
    // 获取所有商品
    .get('/products', async ({ query }) => {
        try {
            const params = {
                page: query.page ? parseInt(query.page as string) : 1,
                limit: query.limit ? parseInt(query.limit as string) : 20,
                categoryId: query.categoryId as string,
                isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
                isFeatured: query.isFeatured !== undefined ? query.isFeatured === 'true' : undefined
            };
            const result = await ProductService.getAllProducts(params);
            const response: ApiResponse<typeof result> = {
                success: true,
                data: result
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取商品列表失败'
            };
            return response;
        }
    })

    // 根据ID获取商品详情
    .get('/products/:id', async ({ params: { id } }) => {
        try {
            const product = await ProductService.getProductById(id);
            if (!product) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '商品不存在'
                };
                return response;
            }
            const response: ApiResponse<typeof product> = {
                success: true,
                data: product
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取商品详情失败'
            };
            return response;
        }
    })

    // 根据slug获取商品详情
    .get('/products/slug/:slug', async ({ params: { slug } }) => {
        try {
            const product = await ProductService.getProductBySlug(slug);
            if (!product) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '商品不存在'
                };
                return response;
            }
            const response: ApiResponse<typeof product> = {
                success: true,
                data: product
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取商品详情失败'
            };
            return response;
        }
    })

    // 搜索商品
    .get('/products/search', async ({ query }) => {
        try {
            const searchParams = {
                query: query.q as string,
                categoryId: query.categoryId as string,
                minPrice: query.minPrice ? parseFloat(query.minPrice as string) : undefined,
                maxPrice: query.maxPrice ? parseFloat(query.maxPrice as string) : undefined,
                colors: query.colors ? (query.colors as string).split(',') : [],
                sizes: query.sizes ? (query.sizes as string).split(',') : [],
                tags: query.tags ? (query.tags as string).split(',') : [],
                isActive: query.isActive !== undefined ? query.isActive === 'true' : true,
                isFeatured: query.isFeatured !== undefined ? query.isFeatured === 'true' : undefined,
                sortBy: (query.sortBy as 'price' | 'name' | 'createdAt') || 'createdAt',
                sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
                page: query.page ? parseInt(query.page as string) : 1,
                limit: query.limit ? parseInt(query.limit as string) : 20
            };
            const result = await ProductService.searchProducts(searchParams);
            const response: ApiResponse<typeof result> = {
                success: true,
                data: result
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '搜索商品失败'
            };
            return response;
        }
    })

    // 获取推荐商品
    .get('/products/featured', async ({ query }) => {
        try {
            const limit = query.limit ? parseInt(query.limit as string) : 8;
            const products = await ProductService.getFeaturedProducts(limit);
            const response: ApiResponse<typeof products> = {
                success: true,
                data: products
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取推荐商品失败'
            };
            return response;
        }
    })

    // 获取相关商品
    .get('/products/:id/related', async ({ params: { id }, query }) => {
        try {
            const product = await ProductService.getProductById(id);
            if (!product || !product.categoryId) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '商品不存在或无分类信息'
                };
                return response;
            }
            const limit = query.limit ? parseInt(query.limit as string) : 4;
            const relatedProducts = await ProductService.getRelatedProducts(id, product.categoryId, limit);
            const response: ApiResponse<typeof relatedProducts> = {
                success: true,
                data: relatedProducts
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取相关商品失败'
            };
            return response;
        }
    })

    // 获取热门搜索关键词
    .get('/products/search/popular-terms', async ({ query }) => {
        try {
            const limit = query.limit ? parseInt(query.limit as string) : 10;
            const terms = await ProductService.getPopularSearchTerms(limit);
            const response: ApiResponse<typeof terms> = {
                success: true,
                data: terms
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取热门搜索关键词失败'
            };
            return response;
        }
    })

    // 获取商品筛选选项
    .get('/products/filter-options', async ({ query }) => {
        try {
            const categoryId = query.categoryId as string;
            const options = await ProductService.getFilterOptions(categoryId);
            const response: ApiResponse<typeof options> = {
                success: true,
                data: options
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取筛选选项失败'
            };
            return response;
        }
    })