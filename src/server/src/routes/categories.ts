import { Elysia } from "elysia";
import { CategoryService } from '../services/categoryService';
import type { CreateCategoryRequest, UpdateCategoryRequest, ApiResponse } from '../types/category';

export const categoriesRoute = new Elysia({ tags: ['Categories'] })
    // 获取分类树形结构
    .get('/categories/tree', async () => {
        try {
            const categoryTree = await CategoryService.getCategoryTree();
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
    .get('/categories', async () => {
        try {
            const categories = await CategoryService.getAllCategories();
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
    .get('/categories/:id', async ({ params: { id } }) => {
        try {
            const category = await CategoryService.getCategoryById(id);
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
    .post('/categories', async ({ body }) => {
        try {
            const categoryData = body as CreateCategoryRequest;
            const newCategory = await CategoryService.createCategory(categoryData);
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
    .put('/categories/:id', async ({ params: { id }, body }) => {
        try {
            const updateData = body as UpdateCategoryRequest;
            const updatedCategory = await CategoryService.updateCategory(id, updateData);
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
    .delete('/categories/:id', async ({ params: { id } }) => {
        try {
            const deleted = await CategoryService.deleteCategory(id);
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
    .get('/categories/:id/children', async ({ params: { id } }) => {
        try {
            const children = await CategoryService.getChildCategories(id);
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

    // 更新分类排序
    .patch('/categories/:id/sort', async ({ params: { id }, body }) => {
        try {
            const { sortOrder } = body as { sortOrder: number };
            const updated = await CategoryService.updateCategorySort(id, sortOrder);
            if (!updated) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '分类不存在'
                };
                return response;
            }
            const response: ApiResponse<null> = {
                success: true,
                message: '排序更新成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '更新排序失败'
            };
            return response;
        }
    })

    // 切换分类显示状态
    .patch('/categories/:id/toggle-visibility', async ({ params: { id } }) => {
        try {
            const updated = await CategoryService.toggleCategoryVisibility(id);
            if (!updated) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '分类不存在'
                };
                return response;
            }
            const response: ApiResponse<null> = {
                success: true,
                message: '显示状态切换成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '切换显示状态失败'
            };
            return response;
        }
    })

    // 分类上移
    .patch('/categories/:id/move-up', async ({ params: { id } }) => {
        try {
            const updated = await CategoryService.moveCategoryUp(id);
            if (!updated) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '无法上移分类'
                };
                return response;
            }
            const response: ApiResponse<null> = {
                success: true,
                message: '分类上移成功'
            };
            return response;
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '分类上移失败'
            };
            return response;
        }
    })

    // 分类下移
    .patch('/categories/:id/move-down', async ({ params: { id } }) => {
        try {
            const success = await CategoryService.moveCategoryDown(id);
            if (success) {
                const response: ApiResponse<{ message: string }> = {
                    success: true,
                    data: { message: '分类下移成功' }
                };
                return response;
            } else {
                const response: ApiResponse<null> = {
                    success: false,
                    error: '分类下移失败'
                };
                return response;
            }
        } catch (error) {
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : '分类下移失败'
            };
            return response;
        }
    })