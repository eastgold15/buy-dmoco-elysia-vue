# 前端代码规范和最佳实践

## 1. Vue3 组件开发规范

### 1.1 组合式API使用
- **优先使用** Composition API 而非 Options API
- **使用 `<script setup>`** 简化组件定义
- **响应式数据** 使用 `ref()` 和 `reactive()`
- **示例**：
  ```vue
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  
  const loading = ref(false)
  const formData = reactive({
    name: '',
    description: ''
  })
  
  const isValid = computed(() => formData.name.length > 0)
  </script>
  ```

### 1.2 TypeScript 集成
- **全面使用 TypeScript** 提供类型安全
- **定义接口** 描述数据结构
- **类型导入** 使用 `type` 关键字
- **示例**：
  ```typescript
  interface Category {
    id: string
    name: string
    slug: string
    sort: number
    isVisible: boolean
  }
  
  const categories = ref<Category[]>([])
  ```

## 2. PrimeVue 组件使用规范

### 2.1 组件选择原则
- **优先使用 PrimeVue 组件** 而非自定义组件
- **保持设计一致性** 使用统一的组件库
- **常用组件**：
  - `DataTable` - 数据表格
  - `TreeTable` - 树形表格
  - `Dialog` - 对话框
  - `Button` - 按钮
  - `InputText` - 文本输入
  - `Dropdown` - 下拉选择
  - `Toast` - 消息提示

### 2.2 表格组件使用
- **TreeTable** 用于层级数据展示
- **Column** 定义表格列
- **模板插槽** 自定义列内容
- **示例**：
  ```vue
  <TreeTable :value="categories" :expandedKeys="expandedKeys">
    <Column field="name" header="分类名称" :expander="true">
      <template #body="{ node }">
        <div class="flex items-center gap-2">
          <i :class="node.data.icon" v-if="node.data.icon"></i>
          <span>{{ node.data.name }}</span>
        </div>
      </template>
    </Column>
  </TreeTable>
  ```

### 2.3 表单组件使用
- **统一表单验证** 使用一致的验证规则
- **响应式表单** 双向数据绑定
- **错误处理** 显示友好的错误信息
- **示例**：
  ```vue
  <div class="field">
    <label for="name">分类名称 *</label>
    <InputText 
      id="name" 
      v-model="categoryForm.name" 
      :class="{ 'p-invalid': !categoryForm.name }" 
      placeholder="请输入分类名称" 
    />
  </div>
  ```

## 3. 状态管理规范

### 3.1 本地状态管理
- **组件内状态** 使用 `ref()` 和 `reactive()`
- **计算属性** 使用 `computed()` 处理派生状态
- **侦听器** 使用 `watch()` 和 `watchEffect()`

### 3.2 全局状态管理
- **Pinia** 用于复杂的全局状态
- **组合式Store** 使用 `defineStore()`
- **模块化** 按功能划分不同的store

## 4. API 请求规范

### 4.1 使用 ofetch
- **统一使用 ofetch** 进行HTTP请求
- **错误处理** 统一处理API错误
- **类型安全** 定义请求和响应类型
- **示例**：
  ```typescript
  interface ApiResponse<T> {
    code: number
    message: string
    data: T
  }
  
  const fetchCategories = async (): Promise<Category[]> => {
    const response = await $fetch<ApiResponse<Category[]>>('/api/categories')
    if (response.code === 200) {
      return response.data
    }
    throw new Error(response.message)
  }
  ```

### 4.2 请求状态管理
- **Loading状态** 显示加载指示器
- **错误状态** 显示错误信息
- **成功状态** 显示操作结果

## 5. 样式规范

### 5.1 UnoCSS 使用
- **原子化CSS** 使用 UnoCSS 工具类
- **响应式设计** 使用断点前缀
- **主题一致性** 使用设计系统颜色
- **示例**：
  ```vue
  <div class="flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm">
    <Button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
      保存
    </Button>
  </div>
  ```

### 5.2 PrimeVue 主题
- **使用内置主题** 保持视觉一致性
- **自定义CSS变量** 调整主题色彩
- **响应式布局** 适配不同屏幕尺寸

## 6. 组件设计规范

### 6.1 组件拆分原则
- **单一职责** 每个组件只负责一个功能
- **可复用性** 设计通用的组件接口
- **组合优于继承** 使用组合式API组合功能

### 6.2 Props 和 Emits
- **明确定义** 使用 TypeScript 定义 props 类型
- **默认值** 为可选 props 提供合理默认值
- **事件命名** 使用动词形式命名事件
- **示例**：
  ```typescript
  interface Props {
    modelValue: string
    placeholder?: string
    disabled?: boolean
  }
  
  const props = withDefaults(defineProps<Props>(), {
    placeholder: '',
    disabled: false
  })
  
  const emit = defineEmits<{
    'update:modelValue': [value: string]
    'change': [value: string]
  }>()
  ```

## 7. 路由管理规范

### 7.1 路由结构
- **嵌套路由** 反映页面层级关系
- **动态路由** 使用参数传递数据
- **路由守卫** 实现权限控制

### 7.2 页面组件
- **页面级组件** 放在 `pages` 目录
- **布局组件** 放在 `layouts` 目录
- **通用组件** 放在 `components` 目录

## 8. 错误处理规范

### 8.1 用户友好的错误信息
- **Toast 消息** 显示操作结果
- **表单验证** 实时验证用户输入
- **网络错误** 提供重试机制

### 8.2 错误边界
- **组件错误** 使用 `onErrorCaptured`
- **全局错误** 配置全局错误处理器
- **错误上报** 记录和上报错误信息

## 9. 性能优化规范

### 9.1 组件优化
- **懒加载** 使用 `defineAsyncComponent`
- **虚拟滚动** 处理大列表
- **防抖节流** 优化用户交互

### 9.2 打包优化
- **代码分割** 按路由分割代码
- **Tree Shaking** 移除未使用代码
- **资源压缩** 优化图片和静态资源

## 10. 测试规范

### 10.1 单元测试
- **组件测试** 使用 Vue Test Utils
- **工具函数测试** 测试纯函数逻辑
- **Mock 依赖** 隔离外部依赖

### 10.2 端到端测试
- **用户流程测试** 测试完整的用户操作
- **跨浏览器测试** 确保兼容性
- **性能测试** 监控页面性能

## 11. 代码组织规范

### 11.1 目录结构
```
src/app/
├── components/          # 通用组件
│   ├── ui/             # UI组件
│   └── business/       # 业务组件
├── pages/              # 页面组件
│   ├── admin/          # 管理后台页面
│   └── frontend/       # 前台页面
├── layouts/            # 布局组件
├── types/              # TypeScript类型定义
└── utils/              # 工具函数
```

### 11.2 命名规范
- **组件名称** 使用 PascalCase
- **文件名称** 使用 PascalCase 或 kebab-case
- **变量名称** 使用 camelCase
- **常量名称** 使用 UPPER_SNAKE_CASE

---

**注意**：这些规范旨在提高代码质量、可维护性和团队协作效率，应该在整个项目中保持一致。