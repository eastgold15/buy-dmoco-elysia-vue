# 后端代码规范和最佳实践

## 1. 类型定义规范

### 1.1 使用自动生成的类型
- **优先使用** `DbType.typebox.insert` 和 `DbType.typebox.select` 自动生成的类型
- **避免手动定义** 与数据库schema重复的类型
- **示例**：
  ```typescript
  // ✅ 推荐：使用自动生成的类型
  CreateCategoryDto: DbType.typebox.insert.categoriesSchema,
  UpdateCategoryDto: t.Partial(DbType.typebox.insert.categoriesSchema),
  
  // ❌ 避免：手动定义重复类型
  CreateCategoryDto: t.Object({
    name: t.String(),
    slug: t.String(),
    // ...
  })
  ```

### 1.2 字段映射规范
- **数据库字段** 使用 snake_case 或 camelCase（根据schema定义）
- **前端字段** 使用 camelCase
- **API层负责字段映射**，确保前后端字段名一致性
- **示例**：
  ```typescript
  // 数据库字段：sortOrder
  // 前端字段：sort
  // API映射：
  sortOrder: body.sort || 0
  ```

## 2. 数据库操作规范

### 2.1 插入操作
- **包含所有必要字段**，确保与schema定义一致
- **使用默认值**处理可选字段
- **示例**：
  ```typescript
  const result = await db.insert(categoriesSchema).values({
    name: body.name,
    slug: body.slug,
    description: body.description,
    parentId: body.parentId || null,
    sortOrder: body.sort || 0,
    isVisible: body.isVisible ?? true,
    icon: body.icon,
    image: body.image,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  ```

### 2.2 更新操作
- **使用spread操作符**简化更新逻辑
- **确保类型安全**
- **示例**：
  ```typescript
  await db.update(categoriesSchema)
    .set({
      ...body,
      updatedAt: new Date()
    })
    .where(eq(categoriesSchema.id, parseInt(id)))
  ```

## 3. API路由规范

### 3.1 路由结构
- **RESTful设计**：GET、POST、PUT、DELETE
- **嵌套资源**：`/categories/:id/children`
- **操作端点**：`/categories/:id/toggle-visibility`

### 3.2 响应格式
- **统一响应结构**：使用 `commonRes` 和 `pageRes`
- **错误处理**：返回适当的HTTP状态码和错误信息
- **示例**：
  ```typescript
  return commonRes({
    code: 200,
    message: '操作成功',
    data: result
  });
  ```

## 4. 类型转换规范

### 4.1 数据库字段命名规范
- **优先保持一致性**：数据库字段名应与前端业务字段名保持一致
- **避免不必要转换**：减少字段映射转换函数的使用
- **命名建议**：
  - 使用驼峰命名：`sortOrder` → `sort`
  - 布尔字段使用 `is` 前缀：`isVisible`
  - 时间字段使用 `At` 后缀：`createdAt`

### 4.2 数据库到业务类型转换（仅在必要时使用）
- **仅在字段名不一致时**创建转换函数
- **保持转换逻辑简单**确保所有字段正确映射
- **示例**（不推荐，应优先统一字段名）：
  ```typescript
  // 仅在无法统一字段名时使用
  function dbCategoryToCategory(dbCategory: any): Category {
    return {
      id: dbCategory.id.toString(),
      name: dbCategory.name,
      slug: dbCategory.slug,
      sort: dbCategory.sortOrder || 0, // 字段映射
      // ...
    };
  }
  ```

## 5. 环境配置规范

### 5.1 条件导入
- **SSR兼容性**：使用条件导入避免服务端渲染错误
- **示例**：
  ```typescript
  let OSS: any = null;
  if (typeof window !== 'undefined') {
    OSS = (await import('ali-oss')).default;
  }
  ```

## 6. 代码组织规范

### 6.1 文件结构
- **模型定义**：`*.model.ts` - 包含TypeBox schema和类型定义
- **路由实现**：`*.ts` - 包含API路由和业务逻辑
- **数据库schema**：`schema/*.ts` - 数据库表结构定义

### 6.2 导入规范
- **相对路径**用于项目内部模块
- **绝对路径**用于第三方库
- **类型导入**使用 `type` 关键字

## 7. 错误处理规范

### 7.1 异常捕获
- **使用try-catch**包装数据库操作
- **返回友好错误信息**
- **记录错误日志**（如果需要）

### 7.2 验证规范
- **使用TypeBox验证**请求参数
- **数据库约束**作为最后防线
- **前端验证**提升用户体验

## 8. 性能优化规范

### 8.1 查询优化
- **使用索引**优化常用查询
- **分页查询**处理大数据集
- **选择性查询**只获取需要的字段

### 8.2 缓存策略
- **适当使用缓存**减少数据库查询
- **缓存失效**确保数据一致性

## 9. 安全规范



### 9.2 权限控制
- **身份验证**确保用户身份
- **授权检查**控制资源访问
- **敏感信息保护**避免泄露

## 10. 测试规范

### 10.1 单元测试
- **测试覆盖**关键业务逻辑
- **模拟依赖**隔离测试环境
- **断言明确**验证预期结果

### 10.2 集成测试
- **API测试**验证接口功能
- **数据库测试**确保数据一致性
- **端到端测试**验证完整流程

---

**注意**：这些规范应该在整个项目中保持一致，定期review和更新以适应项目发展需要。