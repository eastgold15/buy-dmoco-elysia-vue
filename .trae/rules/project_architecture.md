# 项目架构和最佳实践

## 1. 项目概述

### 1.1 技术栈
- **后端框架**: Elysia (TypeScript)
- **前端框架**: Vue 3 + TypeScript
- **UI组件库**: PrimeVue + UnoCSS
- **数据库**: PostgreSQL + Drizzle ORM
- **包管理器**: Bun
- **构建工具**: Vite
- **类型验证**: TypeBox

### 1.2 项目目标
创建一个可配置的外贸网站系统，为小商户提供服装类商品销售平台，包含：
- 商品分类管理
- 商品展示和详情
- 订单和支付系统
- 广告管理系统
- 网站配置管理
- 搜索功能

## 2. 项目结构

### 2.1 目录架构
```
d:\Users\boer\Desktop\html/
├── .trae/                    # Trae AI 配置
│   └── rules/               # 项目规则文档
├── src/
│   ├── app/                 # 前端应用
│   │   ├── components/      # Vue组件
│   │   ├── pages/          # 页面组件
│   │   ├── layouts/        # 布局组件
│   │   ├── types/          # TypeScript类型
│   │   └── utils/          # 工具函数
│   ├── server/             # 后端服务
│   │   └── src/
│   │       ├── routes/     # API路由
│   │       ├── db/         # 数据库相关
│   │       ├── plugins/    # Elysia插件
│   │       └── utils/      # 工具函数
│   ├── client/             # 客户端入口
│   └── share/              # 共享代码
├── public/                 # 静态资源
├── drizzle/               # 数据库迁移
└── themes/                # 主题配置
```

### 2.2 模块划分
- **用户界面层**: Vue3组件 + PrimeVue + UnoCSS
- **API层**: Elysia路由 + TypeBox验证
- **业务逻辑层**: 服务类和工具函数
- **数据访问层**: Drizzle ORM + PostgreSQL

## 3. 数据库设计规范

### 3.1 表设计原则
- **命名规范**: 使用复数形式表名 (categories, products)
- **字段命名**: 使用camelCase或snake_case保持一致
- **主键**: 使用自增整数或UUID
- **时间戳**: 包含createdAt和updatedAt字段
- **软删除**: 重要数据使用deletedAt字段

### 3.2 关系设计
- **外键约束**: 明确定义表间关系
- **索引优化**: 为常用查询字段添加索引
- **数据完整性**: 使用数据库约束保证数据一致性

### 3.3 Schema管理
```typescript
// 示例：分类表设计
export const categoriesSchema = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").default(0),
  isVisible: boolean("is_visible").default(true),
  icon: varchar("icon", { length: 255 }),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

## 4. API设计规范

### 4.1 RESTful设计
- **资源导向**: URL表示资源，HTTP方法表示操作
- **状态码**: 正确使用HTTP状态码
- **版本控制**: API版本管理策略

### 4.2 请求/响应格式
```typescript
// 统一响应格式
interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp?: string
}

// 分页响应格式
interface PageResponse<T> {
  code: number
  message: string
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
  }
}
```

### 4.3 错误处理
- **统一错误格式**: 使用一致的错误响应结构
- **错误码定义**: 明确的错误码和错误信息
- **日志记录**: 记录详细的错误信息用于调试

## 5. 前后端协作规范

### 5.1 接口约定
- **API文档**: 使用OpenAPI/Swagger文档
- **类型共享**: 前后端共享TypeScript类型定义
- **Mock数据**: 开发阶段使用Mock数据

### 5.2 数据流
```
前端组件 → API请求 → 后端路由 → 业务逻辑 → 数据库操作
    ↓         ↓         ↓         ↓         ↓
响应处理 ← JSON响应 ← 数据转换 ← 结果处理 ← 查询结果
```

## 6. 状态管理架构

### 6.1 前端状态管理
- **本地状态**: 组件内使用ref/reactive
- **全局状态**: 使用Pinia store
- **服务端状态**: 使用SWR或TanStack Query

### 6.2 数据同步
- **乐观更新**: 提升用户体验
- **错误回滚**: 失败时恢复原状态
- **缓存策略**: 合理的缓存失效机制

## 7. 安全架构

### 7.1 身份认证
- **JWT Token**: 无状态身份验证
- **刷新机制**: Token自动刷新
- **权限控制**: 基于角色的访问控制

### 7.2 数据安全
- **输入验证**: 前后端双重验证
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 输出转义和CSP策略
- **CSRF防护**: 使用CSRF Token

## 8. 性能优化架构

### 8.1 前端优化
- **代码分割**: 按路由和组件分割
- **懒加载**: 组件和路由懒加载
- **缓存策略**: 浏览器缓存和应用缓存
- **CDN**: 静态资源CDN加速

### 8.2 后端优化
- **数据库优化**: 索引、查询优化
- **缓存层**: Redis缓存热点数据
- **连接池**: 数据库连接池管理
- **负载均衡**: 多实例负载分担

## 9. 部署架构

### 9.1 开发环境
- **本地开发**: Vite开发服务器
- **热重载**: 代码变更自动刷新
- **环境变量**: 开发环境配置

### 9.2 生产环境
- **容器化**: Docker容器部署
- **反向代理**: Nginx代理和负载均衡
- **HTTPS**: SSL证书配置
- **监控**: 应用性能监控

## 10. 测试架构

### 10.1 测试策略
- **单元测试**: 函数和组件测试
- **集成测试**: API和数据库测试
- **端到端测试**: 用户流程测试
- **性能测试**: 负载和压力测试

### 10.2 测试工具
- **前端测试**: Vitest + Vue Test Utils
- **后端测试**: Bun test + 测试数据库
- **E2E测试**: Playwright或Cypress

## 11. 开发流程

### 11.1 Git工作流
- **分支策略**: Git Flow或GitHub Flow
- **提交规范**: Conventional Commits
- **代码审查**: Pull Request审查

### 11.2 CI/CD流程
```
代码提交 → 自动测试 → 代码审查 → 合并主分支 → 自动部署
```

## 12. 监控和维护

### 12.1 应用监控
- **性能监控**: 响应时间、吞吐量
- **错误监控**: 错误率、异常追踪
- **业务监控**: 用户行为、转化率

### 12.2 日志管理
- **结构化日志**: JSON格式日志
- **日志级别**: ERROR、WARN、INFO、DEBUG
- **日志聚合**: 集中式日志管理

## 13. 扩展性设计

### 13.1 模块化设计
- **插件系统**: 支持功能扩展
- **微服务**: 服务拆分和独立部署
- **API网关**: 统一API入口

### 13.2 配置管理
- **环境配置**: 多环境配置管理
- **功能开关**: 特性开关控制
- **动态配置**: 运行时配置更新

---

**注意**: 这个架构文档应该随着项目发展不断更新和完善，确保架构决策的一致性和可追溯性。