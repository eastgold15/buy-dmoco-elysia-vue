# Google OAuth 2.0 登录集成指南

本项目已集成了 Google OAuth 2.0 登录功能，用户可以使用谷歌账号快速登录。

## 功能特性

- ✅ Google OAuth 2.0 授权登录
- ✅ 自动用户注册和信息同步
- ✅ JWT 令牌生成和管理
- ✅ 支持传统用户名/密码登录和 OAuth 登录
- ✅ 前端登录状态管理
- ✅ 安全的 Cookie 和 Header 认证

## 配置步骤

### 1. Google Cloud Console 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API 和 Google Identity API
4. 创建 OAuth 2.0 客户端 ID：
   - 转到「凭据」页面
   - 点击「创建凭据」>「OAuth 客户端 ID」
   - 选择「Web 应用程序」
   - 添加授权重定向 URI：`http://localhost:3000/api/auth/google/callback`
   - 记录客户端 ID 和客户端密钥

### 2. 环境变量配置

复制 `.env.example` 为 `.env` 并填写以下配置：

```bash
# 基础配置
APP_PORT=3000
JWT_SECRET=your-super-secret-jwt-key
COOKIE_SECRET=your-cookie-secret-key

# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Google OAuth 配置
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# 前端 URL
FRONTEND_URL=http://localhost:5173
```

### 3. 数据库迁移

运行数据库迁移以添加 OAuth 相关字段：

```bash
# 生成并应用数据库迁移
bun run db:push
```

新增字段说明：
- `role`: 用户角色（user/admin）
- `googleId`: Google OAuth 用户 ID
- `password`: 现在为可选字段（OAuth 用户可能没有密码）

## API 端点

### 认证相关端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/google` | GET | 重定向到 Google 授权页面 |
| `/api/auth/google/callback` | GET | Google 授权回调处理 |
| `/api/auth/login` | POST | 传统用户名密码登录 |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/auth/logout` | POST | 用户注销 |

### 使用示例

#### 1. Google 登录（前端）

```javascript
// 重定向到 Google 登录
window.location.href = 'http://localhost:3000/api/auth/google'
```

#### 2. 传统登录

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'your-username', // 或邮箱
    password: 'your-password',
    remember: true // 可选，延长令牌有效期
  })
})

const result = await response.json()
if (result.code === 200) {
  // 存储令牌
  localStorage.setItem('access_token', result.data.token.accessToken)
  localStorage.setItem('refresh_token', result.data.token.refreshToken)
}
```

#### 3. 获取用户信息

```javascript
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})

const userInfo = await response.json()
```

## 前端组件

### GoogleLoginButton 组件

使用已创建的 Google 登录按钮组件：

```vue
<template>
  <div>
    <!-- 其他登录表单 -->
    
    <div class=\"mt-4\">
      <div class=\"relative\">
        <div class=\"absolute inset-0 flex items-center\">
          <div class=\"w-full border-t border-gray-300\" />
        </div>
        <div class=\"relative flex justify-center text-sm\">
          <span class=\"px-2 bg-white text-gray-500\">或</span>
        </div>
      </div>
      
      <div class=\"mt-4\">
        <GoogleLoginButton />
      </div>
    </div>
  </div>
</template>

<script setup>
import GoogleLoginButton from '@/components/GoogleLoginButton.vue'
</script>
```

### OAuth 回调处理

在路由中添加回调页面：

```javascript
// router/index.js
import AuthCallback from '@/pages/AuthCallback.vue'

const routes = [
  // ... 其他路由
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback
  }
]
```

## 安全特性

### 1. JWT 令牌管理
- Access Token: 短期有效（2-12小时）
- Refresh Token: 长期有效（7-30天）
- 自动令牌刷新机制

### 2. 用户数据保护
- 密码使用 Bun 内置的安全哈希
- OAuth 用户无需密码
- 用户状态检查（激活/禁用）

### 3. 认证中间件
- 基于 `@pori15/elysia-auth-drizzle` 插件
- 支持 Header、Cookie、Query 三种认证方式
- 可配置公共路由，无需认证访问

## 错误处理

### 常见错误及解决方案

1. **OAuth 配置错误**
   - 检查 Google Client ID 和 Secret
   - 确认重定向 URI 配置正确

2. **数据库连接问题**
   - 检查 DATABASE_URL 配置
   - 确保数据库服务运行正常

3. **JWT 令牌问题**
   - 检查 JWT_SECRET 配置
   - 确认令牌未过期

4. **CORS 问题**
   - 确保前后端 URL 配置正确
   - 检查 FRONTEND_URL 环境变量

## 开发调试

### 启动开发服务

```bash
# 启动后端服务
bun run dev:server

# 启动前端服务
bun run dev
```

### 查看 API 文档

访问 Swagger 文档：`http://localhost:3000/swagger`

### 数据库管理

```bash
# 查看数据库
bun run db:studio

# 重置数据库
bun run db:reset
```

## 部署注意事项

1. **环境变量**
   - 生产环境需要更新所有 URL（包括 Google OAuth 配置）
   - 使用强密码作为 JWT_SECRET 和 COOKIE_SECRET

2. **SSL/HTTPS**
   - 生产环境必须使用 HTTPS
   - 更新 Google OAuth 重定向 URI 为 HTTPS

3. **域名配置**
   - 更新 GOOGLE_REDIRECT_URI 为生产域名
   - 更新 FRONTEND_URL 为生产前端地址

## 扩展功能

### 添加其他 OAuth 提供商

项目使用 `elysia-oauth2` 插件，支持 63+ OAuth 提供商：

```typescript
// 在 oauth.ts 中添加更多提供商
export const oauthPlugin = new Elysia()
  .use(
    oauth2({
      Google: [...],
      GitHub: [
        process.env.GITHUB_CLIENT_ID,
        process.env.GITHUB_CLIENT_SECRET,
        process.env.GITHUB_REDIRECT_URI
      ],
      // 更多提供商...
    })
  )
```

### 用户权限管理

```typescript
// 基于用户角色的权限控制
app.get('/admin/*', ({ isConnected, connectedUser }) => {
  if (!isConnected || connectedUser.role !== 'admin') {
    return { error: 'Insufficient permissions' }
  }
  // 管理员功能...
})
```

## 技术栈

- **后端**: Elysia.js + TypeScript
- **认证**: @pori15/elysia-auth-drizzle + elysia-oauth2
- **数据库**: PostgreSQL + Drizzle ORM
- **OAuth**: Arctic (63+ 提供商支持)
- **前端**: Vue 3 + TypeScript

## 支持

如有问题，请查看：
1. [Elysia 官方文档](https://elysiajs.com/)
2. [elysia-oauth2 文档](https://github.com/bogeychan/elysia-oauth2)
3. [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
