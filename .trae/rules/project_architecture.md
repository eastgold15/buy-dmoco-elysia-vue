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

