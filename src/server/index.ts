import Elysia from "elysia";
import { CategoryService } from './services/categoryService';
import type { CreateCategoryRequest, UpdateCategoryRequest, ApiResponse } from './types/category';

export const api = new Elysia()
    // 原有接口
    .get('/app', () => {
        return "huan yin"
    })
    .get('', () => {
        return "hello world"
    })
    
    // 分类管理API
    // 获取分类树形结构
    .get('/categories/tree', () => {
        try {
            const categoryTree = CategoryService.getCategoryTree();
            const response: ApiResponse<typeof categoryTree> = {
                success: true,
                data: categoryTree
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取分类树失败'
            };
            return response;
        }
    })
    
    // 获取所有分类（管理后台用）
    .get('/categories', () => {
        try {
            const categories = CategoryService.getAllCategories();
            const response: ApiResponse<typeof categories> = {
                success: true,
                data: categories
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取分类列表失败'
            };
            return response;
        }
    })
    
    // 根据ID获取分类
    .get('/categories/:id', ({ params: { id } }) => {
        try {
            const category = CategoryService.getCategoryById(id);
            if (!category) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '分类不存在'
                };
                return response;
            }
            const response: ApiResponse<typeof category> = {
                success: true,
                data: category
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取分类失败'
            };
            return response;
        }
    })
    
    // 创建分类
    .post('/categories', ({ body }) => {
        try {
            const categoryData = body as CreateCategoryRequest;
            const newCategory = CategoryService.createCategory(categoryData);
            const response: ApiResponse<typeof newCategory> = {
                success: true,
                data: newCategory,
                message: '分类创建成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '创建分类失败'
            };
            return response;
        }
    })
    
    // 更新分类
    .put('/categories/:id', ({ params: { id }, body }) => {
        try {
            const updateData = body as UpdateCategoryRequest;
            const updatedCategory = CategoryService.updateCategory(id, updateData);
            if (!updatedCategory) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '分类不存在'
                };
                return response;
            }
            const response: ApiResponse<typeof updatedCategory> = {
                success: true,
                data: updatedCategory,
                message: '分类更新成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '更新分类失败'
            };
            return response;
        }
    })
    
    // 删除分类
    .delete('/categories/:id', ({ params: { id } }) => {
        try {
            const deleted = CategoryService.deleteCategory(id);
            if (!deleted) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '分类不存在'
                };
                return response;
            }
            const response: ApiResponse<null> = {
                success: true,
                message: '分类删除成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '删除分类失败'
            };
            return response;
        }
    })
    
    // 获取子分类
    .get('/categories/:id/children', ({ params: { id } }) => {
        try {
            const children = CategoryService.getChildCategories(id);
            const response: ApiResponse<typeof children> = {
                success: true,
                data: children
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '获取子分类失败'
            };
            return response;
        }
    })
