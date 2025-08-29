# RESTful CRUD 路由模板框架

## 核心设计范式

### 1. 基础结构模式
```typescript
export const {ENTITY}_Route = new Elysia({ prefix: "/{entities}" })
  .model({entity}RouteModel)
  // 列表查询
  .get("/", async ({ query }) => { /* 分页+筛选+排序逻辑 */ })
  // 详情查询
  .get("/:id", async ({ params }) => { /* 单条记录查询 */ })
  // 更新操作
  .put("/:id", async ({ params, body }) => { /* 更新逻辑 */ })
  // 删除操作
  .delete("/:id", async ({ params }) => { /* 删除逻辑 */ })
  // 自定义业务端点
  .get("/custom-endpoint", async () => { /* 自定义业务逻辑 */ });
```

### 2. 参数化占位符

| 占位符 | 说明 | 示例值 |
|--------|------|--------|
| `{ENTITY}` | 实体名称（大写） | `User`, `Product`, `Order` |
| `{entity}` | 实体名称（小写） | `user`, `product`, `order` |
| `{entities}` | 实体复数形式 | `users`, `products`, `orders` |
| `{SCHEMA}` | 数据库表模式 | `userSchema`, `productSchema` |
| `{STATUS_ENUM}` | 状态枚举定义 | `UserStatus`, `ProductStatus` |

### 3. 查询构建模板

```typescript
// 条件构建
const conditions = [];
if ({search_field}) {
  conditions.push(or(
    like({SCHEMA}.{field}, `%${search}%`),
    like({SCHEMA}.{field}, `%${search}%`)
  ));
}
if ({status_field}) {
  conditions.push(eq({SCHEMA}.status, Number(statusQ)));
}

// 排序配置
const allowedSortFields = {
  id: {SCHEMA}.id,
  // 添加其他可排序字段
  createdAt: {SCHEMA}.createdAt,
};

const sortFields =
				allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
				{SCHEMA}.id;
	// 排序配置
const sortOrderValue =
					sortOrder === "desc" ? desc(sortFields) : asc(sortFields);

const queryBuilder = db
					.select()
					.from( {SCHEMA})
					.where(conditions.length > 0 ? and(...conditions) : undefined)
					.orderBy(sortOrderValue);

				// 分页处理
				if (page && pageSize) {
					const offsetValue = ((Number(page) || 1) - 1) * pageSize;
					queryBuilder.limit(pageSize).offset(offsetValue);
				}

				// 执行查询
				const result = await queryBuilder;


        			// 获取总数
				const total = await db
					.select({ value: count() })
					.from( {SCHEMA})
					.where(conditions.length > 0 ? and(...conditions) : undefined);
	if (!total[0]) {
					return status(200, "查询用户列表为空");
				}

				return page
					? pageRes(result, total[0].value, page, pageSize, "获取用户列表成功")
					: commonRes(result, 200, "获取用户列表成功");

```

### 4. 响应格式规范

```typescript
// 分页响应
return pageRes(result, totalCount, page, pageSize, "操作成功消息");

// 普通响应
return commonRes(data, 200, "操作成功消息");

// 错误响应
return status(400, "错误消息");
return status(200, "失败消息");
```

## 完整模板实现

```typescript
/**
 * {ENTITY}管理路由
 * 提供{ENTITY}列表、详情、管理等功能
 */

import { and, asc, count, desc, eq, like } from "drizzle-orm";
import { Elysia, status, t } from "elysia";
import { db } from "../db/connection";
import { {SCHEMA} } from "../db/schema";
import { commonRes, pageRes } from "../plugins/Res";
import { {entity}RouteModel } from "./{entities}.model";

// {ENTITY}状态枚举
const {STATUS_ENUM} = {
  ACTIVE: 1,
  DISABLED: 0,
} as const;

export const {entities}Route = new Elysia({ prefix: "/{entities}" })
  .model({entity}RouteModel)
  
  // 获取{ENTITY}列表
  .get("/", async ({ query }) => {
    try {
      const { page, pageSize, search, status: statusQ, sortBy, sortOrder } = query;
      
      // 构建查询条件
      const conditions = [];
      if (search) {
        conditions.push(like({SCHEMA}.{search_field}, `%${search}%`));
      }
      if (statusQ !== undefined) {
        conditions.push(eq({SCHEMA}.status, Number(statusQ)));
      }

      // 排序和分页逻辑
      const result = await buildQueryWithPagination({SCHEMA}, conditions, {
        page, pageSize, sortBy, sortOrder
      });

      return page
        ? pageRes(result, totalCount, page, pageSize, "获取{ENTITY}列表成功")
        : commonRes(result, 200, "获取{ENTITY}列表成功");
    } catch (error) {
      return handleError(error, "查询{ENTITY}列表失败");
    }
  }, {
    query: t.Object({
      page: t.Optional(t.Number({ minimum: 1 })),
      pageSize: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
      search: t.Optional(t.String()),
      status: t.Optional(t.Number()),
      sortBy: t.Optional(t.String()),
      sortOrder: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
    })
  })

  // 根据ID获取{ENTITY}详情
  .get("/:id", async ({ params: { id } }) => {
    try {
      const item = await getById({SCHEMA}, +id);
      if (!item) return status(404, "{ENTITY}不存在");
      return commonRes(item, 200, "获取{ENTITY}详情成功");
    } catch (error) {
      return handleError(error, "查询{ENTITY}详情失败");
    }
  })

  // 更新{ENTITY}信息
  .put("/:id", async ({ params: { id }, body }) => {
    try {
      // 存在性检查
      const existing = await getById({SCHEMA}, +id);
      if (!existing) return status(404, "{ENTITY}不存在");

      // 唯一性验证（可选）
      if (body.uniqueField) {
        const duplicate = await checkDuplicate({SCHEMA}, body.uniqueField, +id);
        if (duplicate) return status(400, "字段值已存在");
      }

      // 执行更新
      const updated = await update{ENTITY}(+id, body);
      return commonRes(updated, 200, "更新{ENTITY}成功");
    } catch (error) {
      return handleError(error, "更新{ENTITY}失败");
    }
  })

  // 删除{ENTITY}
  .delete("/:id", async ({ params: { id } }) => {
    try {
      const existing = await getById({SCHEMA}, +id);
      if (!existing) return status(404, "{ENTITY}不存在");

      await softDelete({SCHEMA}, +id);
      return status(200, "{ENTITY}删除成功");
    } catch (error) {
      return handleError(error, "删除{ENTITY}失败");
    }
  });

// 工具函数模板
async function buildQueryWithPagination(schema, conditions, options) {
  const { page, pageSize, sortBy = "id", sortOrder = "desc" } = options;
  
  const allowedSortFields = {
    id: schema.id,
    createdAt: schema.createdAt,
    // 扩展其他排序字段
  };

  const sortField = allowedSortFields[sortBy] || schema.id;
  const orderBy = sortOrder === "desc" ? desc(sortField) : asc(sortField);

  const query = db.select().from(schema);
  
  if (conditions.length > 0) {
    query.where(and(...conditions));
  }
  
  query.orderBy(orderBy);

  if (page && pageSize) {
    const offset = (page - 1) * pageSize;
    query.limit(pageSize).offset(offset);
  }

  const [data, totalResult] = await Promise.all([
    query,
    db.select({ value: count() }).from(schema).where(conditions.length > 0 ? and(...conditions) : undefined)
  ]);

  return { data, total: totalResult[0]?.value || 0 };
}

async function getById(schema, id) {
  const result = await db.select().from(schema).where(eq(schema.id, id)).limit(1);
  return result[0];
}

function handleError(error, message) {
  console.error(`${message}:`, error);
  return { code: 500, message, data: null };
}
```

## 同名的model文件，需要复用


```typescript
export const userRouteModel = {
	updateProfileSchema: t.Object({
    ... 类型使用typebox类型，可以复用src\server\src\db\database.types.ts 提供的类型
	}),
	// 统一查询参数
	usersQuery: t.Object({
		...UnoQuery.properties,
	}),
};


```
## 实现约束条件

1. **数据库依赖**: 必须使用 Drizzle ORM 和 Elysia 框架
2. **响应格式**: 必须遵循 `commonRes` 和 `pageRes` 格式规范
3. **错误处理**: 所有操作必须包含 try-catch 错误处理
4. **参数验证**: 使用 Elysia 的 t 进行输入参数验证
5. **分页限制**: 每页大小限制为 1-100 条记录
6. **状态管理**: 使用枚举定义状态值，避免魔法数字

## 扩展指南

1. **添加新字段**: 在 `allowedSortFields` 和查询条件中扩展
2. **新增端点**: 遵循现有的方法命名和参数规范
3. **业务逻辑**: 在工具函数中封装可复用的业务逻辑
4. **权限控制**: 在路由处理前添加权限验证中间件
5. **缓存策略**: 在适当的端点添加缓存逻辑

## 使用示例

替换以下占位符：
- `{ENTITY}` → `Product`
- `{entity}` → `product` 
- `{entities}` → `products`
- `{SCHEMA}` → `productSchema`
- `{STATUS_ENUM}` → `ProductStatus`
- `{search_field}` → `name` (产品名称字段)