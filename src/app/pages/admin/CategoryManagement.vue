<template>
  <div class="category-management">
    <!-- 页面标题和操作栏 -->
    <div class="header-section">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">分类管理</h1>
          <p class="text-gray-600 mt-1">管理商品分类，支持树形结构、排序和显示控制</p>
        </div>
        <Button 
          label="新增分类" 
          icon="pi pi-plus" 
          @click="showCreateDialog = true"
          class="p-button-success"
        />
      </div>

      <!-- 工具栏 -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex gap-3">
          <Button 
            label="展开全部" 
            icon="pi pi-angle-down" 
            @click="expandAll"
            class="p-button-outlined"
            size="small"
          />
          <Button 
            label="收起全部" 
            icon="pi pi-angle-up" 
            @click="collapseAll"
            class="p-button-outlined"
            size="small"
          />
          <Button 
            label="刷新" 
            icon="pi pi-refresh" 
            @click="loadCategories"
            class="p-button-outlined"
            size="small"
          />
        </div>
        <div class="flex gap-3">
          <InputText 
            v-model="searchKeyword" 
            placeholder="搜索分类名称..."
            class="w-64"
          />
          <Dropdown 
            v-model="filterStatus" 
            :options="statusOptions" 
            optionLabel="label" 
            optionValue="value" 
            placeholder="筛选状态"
            class="w-32"
          />
        </div>
      </div>
    </div>

    <!-- 分类树表格 -->
    <div class="table-section">
      <TreeTable 
        :value="filteredCategories" 
        :loading="loading"
        :expandedKeys="expandedKeys"
        @node-expand="onNodeExpand"
        @node-collapse="onNodeCollapse"
        class="p-treetable-sm"
        showGridlines
        responsiveLayout="scroll"
      >
        <!-- 分类名称列 -->
        <Column field="name" header="分类名称" :expander="true" style="width: 300px">
          <template #body="{ node }">
            <div class="flex items-center gap-2">
              <i v-if="node.data.icon" :class="node.data.icon" class="text-lg"></i>
              <span class="font-medium">{{ node.data.name }}</span>
              <Tag v-if="node.data.level === 0" value="顶级" severity="info" class="text-xs" />
            </div>
          </template>
        </Column>

        <!-- 描述列 -->
        <Column field="description" header="描述" style="width: 200px">
          <template #body="{ node }">
            <span class="text-gray-600 text-sm">{{ node.data.description || '-' }}</span>
          </template>
        </Column>

        <!-- 排序列 -->
        <Column field="sort" header="排序" style="width: 120px">
          <template #body="{ node }">
            <div class="flex items-center gap-2">
              <InputNumber 
                v-model="node.data.sort" 
                :min="0" 
                :max="9999"
                @blur="updateSort(node.data.id, node.data.sort)"
                class="w-20"
                size="small"
                :showButtons="true"
                buttonLayout="horizontal"
                decrementButtonClass="p-button-secondary"
                incrementButtonClass="p-button-secondary"
              />
              <div class="flex flex-col gap-1">
                <Button 
                  icon="pi pi-angle-up" 
                  @click="moveCategoryUp(node.data)"
                  class="p-button-text p-button-sm"
                  size="small"
                  v-tooltip.top="'上移'"
                />
                <Button 
                  icon="pi pi-angle-down" 
                  @click="moveCategoryDown(node.data)"
                  class="p-button-text p-button-sm"
                  size="small"
                  v-tooltip.top="'下移'"
                />
              </div>
            </div>
          </template>
        </Column>

        <!-- 显示状态列 -->
        <Column field="isVisible" header="显示状态" style="width: 140px">
          <template #body="{ node }">
            <div class="flex items-center gap-3">
              <InputSwitch 
                v-model="node.data.isVisible" 
                @change="toggleVisibility(node.data.id)"
                class="scale-90"
              />
              <div class="flex items-center gap-1">
                <i :class="node.data.isVisible ? 'pi pi-eye text-green-600' : 'pi pi-eye-slash text-gray-400'" class="text-sm"></i>
                <Tag 
                  :value="node.data.isVisible ? '显示' : '隐藏'" 
                  :severity="node.data.isVisible ? 'success' : 'secondary'"
                  class="text-xs px-2 py-1"
                />
              </div>
            </div>
          </template>
        </Column>

        <!-- 创建时间列 -->
        <Column field="createdAt" header="创建时间" style="width: 150px">
          <template #body="{ node }">
            <span class="text-gray-500 text-sm">{{ formatDate(node.data.createdAt) }}</span>
          </template>
        </Column>

        <!-- 操作列 -->
        <Column header="操作" style="width: 200px">
          <template #body="{ node }">
            <div class="flex gap-2">
              <Button 
                icon="pi pi-plus" 
                @click="showCreateChildDialog(node.data)"
                class="p-button-success p-button-sm"
                v-tooltip.top="'添加子分类'"
              />
              <Button 
                icon="pi pi-pencil" 
                @click="showEditDialog(node.data)"
                class="p-button-warning p-button-sm"
                v-tooltip.top="'编辑'"
              />
              <Button 
                icon="pi pi-trash" 
                @click="confirmDelete(node.data)"
                class="p-button-danger p-button-sm"
                v-tooltip.top="'删除'"
                :disabled="hasChildren(node)"
              />
            </div>
          </template>
        </Column>
      </TreeTable>
    </div>

    <!-- 创建/编辑分类对话框 -->
    <Dialog 
      v-model:visible="showCreateDialog" 
      :header="editingCategory ? '编辑分类' : '新增分类'" 
      :modal="true" 
      :closable="true"
      class="w-96"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">分类名称 *</label>
          <InputText 
            v-model="categoryForm.name" 
            placeholder="请输入分类名称"
            class="w-full"
            :class="{ 'p-invalid': !categoryForm.name }"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">父分类</label>
          <TreeSelect 
            v-model="categoryForm.parentId" 
            :options="categoryTreeOptions" 
            placeholder="选择父分类（留空为顶级分类）"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">描述</label>
          <Textarea 
            v-model="categoryForm.description" 
            placeholder="请输入分类描述"
            rows="3"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">排序</label>
            <InputNumber 
              v-model="categoryForm.sort" 
              :min="0" 
              :max="9999"
              placeholder="排序值"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">图标</label>
            <InputText 
              v-model="categoryForm.icon" 
              placeholder="图标类名"
              class="w-full"
            />
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2">
            <Checkbox v-model="categoryForm.isVisible" :binary="true" />
            <span class="text-sm font-medium">显示分类</span>
          </label>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            label="取消" 
            @click="closeDialog"
            class="p-button-text"
          />
          <Button 
            :label="editingCategory ? '更新' : '创建'" 
            @click="saveCategory"
            class="p-button-success"
            :loading="saving"
            :disabled="!categoryForm.name"
          />
        </div>
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<style scoped>
/* 自定义样式优化 */
.category-management {
  @apply bg-white rounded-lg shadow-sm;
}

.header-section {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-lg border-b border-gray-200;
}

.table-section {
  @apply p-6;
}

/* TreeTable 样式优化 */
:deep(.p-treetable) {
  @apply border border-gray-200 rounded-lg overflow-hidden;
}

:deep(.p-treetable .p-treetable-thead > tr > th) {
  @apply bg-gray-50 text-gray-700 font-semibold border-b border-gray-200;
}

:deep(.p-treetable .p-treetable-tbody > tr) {
  @apply hover:bg-blue-50 transition-colors duration-200;
}

:deep(.p-treetable .p-treetable-tbody > tr > td) {
  @apply border-b border-gray-100 py-3;
}

/* InputNumber 样式优化 */
:deep(.p-inputnumber) {
  @apply rounded-md;
}

:deep(.p-inputnumber .p-inputnumber-input) {
  @apply text-center;
}

/* InputSwitch 样式优化 */
:deep(.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
  @apply bg-green-500;
}

/* Tag 样式优化 */
:deep(.p-tag) {
  @apply font-medium;
}

/* Button 样式优化 */
:deep(.p-button-sm) {
  @apply shadow-sm;
}

/* Dialog 样式优化 */
:deep(.p-dialog .p-dialog-header) {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200;
}

:deep(.p-dialog .p-dialog-content) {
  @apply bg-white;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { $fetch } from 'ofetch'

// PrimeVue 组件
import Button from 'primevue/button'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import TreeSelect from 'primevue/treeselect'
import InputSwitch from 'primevue/inputswitch'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'

// 类型定义
interface Category {
  id: string
  name: string
  parentId?: string
  level: number
  sort: number
  isVisible: boolean
  description?: string
  icon?: string
  createdAt: Date
  updatedAt: Date
}

interface CategoryTree {
  key: string
  data: Category
  children?: CategoryTree[]
}

interface CategoryForm {
  name: string
  parentId?: string
  description?: string
  sort: number
  isVisible: boolean
  icon?: string
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const categories = ref<CategoryTree[]>([])
const expandedKeys = ref<Record<string, boolean>>({})
const searchKeyword = ref('')
const filterStatus = ref('all')
const showCreateDialog = ref(false)
const editingCategory = ref<Category | null>(null)

// 表单数据
const categoryForm = ref<CategoryForm>({
  name: '',
  parentId: undefined,
  description: '',
  sort: 0,
  isVisible: true,
  icon: ''
})

// 状态选项
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '显示', value: 'visible' },
  { label: '隐藏', value: 'hidden' }
]

// 工具函数
const confirm = useConfirm()
const toast = useToast()

// 计算属性
const filteredCategories = computed(() => {
  let result = categories.value
  
  // 搜索过滤
  if (searchKeyword.value) {
    result = filterByKeyword(result, searchKeyword.value)
  }
  
  // 状态过滤
  if (filterStatus.value !== 'all') {
    const isVisible = filterStatus.value === 'visible'
    result = filterByStatus(result, isVisible)
  }
  
  return result
})

const categoryTreeOptions = computed(() => {
  return buildTreeSelectOptions(categories.value)
})

// 方法
const loadCategories = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/categories')
    if (response.success) {
      categories.value = buildCategoryTree(response.data)
    } else {
      toast.add({ severity: 'error', summary: '错误', detail: response.error || '加载分类失败' })
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    toast.add({ severity: 'error', summary: '错误', detail: '加载分类失败' })
  } finally {
    loading.value = false
  }
}

const buildCategoryTree = (categoryList: Category[]): CategoryTree[] => {
  const categoryMap = new Map<string, CategoryTree>()
  const rootCategories: CategoryTree[] = []
  
  // 创建节点映射
  categoryList.forEach(category => {
    categoryMap.set(category.id, {
      key: category.id,
      data: category,
      children: []
    })
  })
  
  // 构建树形结构
  categoryList.forEach(category => {
    const node = categoryMap.get(category.id)!
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId)
      if (parent) {
        parent.children!.push(node)
      }
    } else {
      rootCategories.push(node)
    }
  })
  
  return rootCategories
}

const buildTreeSelectOptions = (treeData: CategoryTree[]): any[] => {
  return treeData.map(node => ({
    key: node.data.id,
    label: node.data.name,
    data: node.data.id,
    children: node.children ? buildTreeSelectOptions(node.children) : undefined
  }))
}

const filterByKeyword = (treeData: CategoryTree[], keyword: string): CategoryTree[] => {
  const filtered: CategoryTree[] = []
  
  treeData.forEach(node => {
    const matchesKeyword = node.data.name.toLowerCase().includes(keyword.toLowerCase())
    const filteredChildren = node.children ? filterByKeyword(node.children, keyword) : []
    
    if (matchesKeyword || filteredChildren.length > 0) {
      filtered.push({
        ...node,
        children: filteredChildren
      })
    }
  })
  
  return filtered
}

const filterByStatus = (treeData: CategoryTree[], isVisible: boolean): CategoryTree[] => {
  const filtered: CategoryTree[] = []
  
  treeData.forEach(node => {
    const matchesStatus = node.data.isVisible === isVisible
    const filteredChildren = node.children ? filterByStatus(node.children, isVisible) : []
    
    if (matchesStatus || filteredChildren.length > 0) {
      filtered.push({
        ...node,
        children: filteredChildren
      })
    }
  })
  
  return filtered
}

const expandAll = () => {
  const keys: Record<string, boolean> = {}
  const addKeys = (nodes: CategoryTree[]) => {
    nodes.forEach(node => {
      keys[node.key] = true
      if (node.children) {
        addKeys(node.children)
      }
    })
  }
  addKeys(categories.value)
  expandedKeys.value = keys
}

const collapseAll = () => {
  expandedKeys.value = {}
}

const onNodeExpand = (node: any) => {
  expandedKeys.value[node.key] = true
}

const onNodeCollapse = (node: any) => {
  delete expandedKeys.value[node.key]
}

const showCreateChildDialog = (parentCategory: Category) => {
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    parentId: parentCategory.id,
    description: '',
    sort: 0,
    isVisible: true,
    icon: ''
  }
  showCreateDialog.value = true
}

const showEditDialog = (category: Category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    parentId: category.parentId,
    description: category.description || '',
    sort: category.sort,
    isVisible: category.isVisible,
    icon: category.icon || ''
  }
  showCreateDialog.value = true
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    parentId: undefined,
    description: '',
    sort: 0,
    isVisible: true,
    icon: ''
  }
}

const saveCategory = async () => {
  if (!categoryForm.value.name) {
    toast.add({ severity: 'warn', summary: '警告', detail: '请输入分类名称' })
    return
  }
  
  try {
    saving.value = true
    
    const requestData = {
      name: categoryForm.value.name,
      parentId: categoryForm.value.parentId || undefined,
      description: categoryForm.value.description,
      sort: categoryForm.value.sort,
      isVisible: categoryForm.value.isVisible,
      icon: categoryForm.value.icon
    }
    
    let response
    if (editingCategory.value) {
      // 更新分类
      response = await $fetch(`/api/categories/${editingCategory.value.id}`, {
        method: 'PUT',
        body: requestData
      })
    } else {
      // 创建分类
      response = await $fetch('/api/categories', {
        method: 'POST',
        body: requestData
      })
    }
    
    if (response.success) {
      toast.add({ 
        severity: 'success', 
        summary: '成功', 
        detail: editingCategory.value ? '分类更新成功' : '分类创建成功' 
      })
      closeDialog()
      await loadCategories()
    } else {
      toast.add({ severity: 'error', summary: '错误', detail: response.error || '操作失败' })
    }
  } catch (error) {
    console.error('保存分类失败:', error)
    toast.add({ severity: 'error', summary: '错误', detail: '保存分类失败' })
  } finally {
    saving.value = false
  }
}

const updateSort = async (categoryId: string, sortOrder: number) => {
  try {
    const response = await $fetch(`/api/categories/${categoryId}/sort`, {
      method: 'PATCH',
      body: { sortOrder }
    })
    
    if (response.success) {
      toast.add({ severity: 'success', summary: '成功', detail: '排序更新成功' })
    } else {
      toast.add({ severity: 'error', summary: '错误', detail: response.error || '更新排序失败' })
      await loadCategories() // 重新加载数据
    }
  } catch (error) {
    console.error('更新排序失败:', error)
    toast.add({ severity: 'error', summary: '错误', detail: '更新排序失败' })
    await loadCategories()
  }
}

const moveCategoryUp = async (category: Category) => {
  try {
    const response = await $fetch(`/api/categories/${category.id}/move-up`, {
      method: 'PATCH'
    })
    
    if (response.success) {
      toast.add({ severity: 'success', summary: '成功', detail: '分类上移成功' })
      await loadCategories()
    } else {
      toast.add({ severity: 'error', summary: '错误', detail: response.error || '上移失败' })
    }
  } catch (error) {
    console.error('上移分类失败:', error)
    toast.add({ severity: 'error', summary: '错误', detail: '上移分类失败' })
  }
}

const moveCategoryDown = async (category: Category) => {
  try {
    const response = await $fetch(`/api/categories/${category.id}/move-down`, {
      method: 'PATCH'
    })
    
    if (response.success) {
      toast.add({ severity: 'success', summary: '成功', detail: '分类下移成功' })
      await loadCategories()
    } else {
      toast.add({ severity: 'error', summary: '错误', detail: response.error || '下移失败' })
    }
  } catch (error) {
    console.error('更新排序失败:', error)
    toast.add({ severity: 'error', summary: '错误', detail: '更新排序失败' })
    await loadCategories()
  }
}

const toggleVisibility = async (categoryId: string) => {
  try {
    const response = await $fetch(`/api/categories/${categoryId}/toggle-visibility`, {
      method: 'PATCH'
    })
    
    if (response.success) {
      toast.add({ severity: 'success', summary: '成功', detail: '显示状态更新成功' })
    } else {
      toast.add({ severity: 'error', summary: '错误', detail: response.error || '更新显示状态失败' })
      await loadCategories() // 重新加载数据
    }
  } catch (error) {
    console.error('更新显示状态失败:', error)
    toast.add({ severity: 'error', summary: '错误', detail: '更新显示状态失败' })
    await loadCategories()
  }
}

const confirmDelete = (category: Category) => {
  confirm.require({
    message: `确定要删除分类 "${category.name}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteCategory(category.id)
  })
}

const deleteCategory = async (categoryId: string) => {
  try {
    const response = await $fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      toast.add({ severity: 'success', summary: '成功', detail: '分类删除成功' })
      await loadCategories()
    } else {
      toast.add({ severity: 'error', summary: '错误', detail: response.error || '删除分类失败' })
    }
  } catch (error) {
    console.error('删除分类失败:', error)
    toast.add({ severity: 'error', summary: '错误', detail: '删除分类失败' })
  }
}

const hasChildren = (node: CategoryTree): boolean => {
  return node.children ? node.children.length > 0 : false
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-management {
  @apply p-6 bg-gray-50 min-h-screen;
}

.header-section {
  @apply bg-white rounded-lg shadow-sm p-6 mb-6;
}

.table-section {
  @apply bg-white rounded-lg shadow-sm p-6;
}

:deep(.p-treetable) {
  @apply border-0;
}

:deep(.p-treetable .p-treetable-thead > tr > th) {
  @apply bg-gray-50 border-gray-200 text-gray-700 font-semibold;
}

:deep(.p-treetable .p-treetable-tbody > tr > td) {
  @apply border-gray-200;
}

:deep(.p-treetable .p-treetable-tbody > tr:hover) {
  @apply bg-gray-50;
}

:deep(.p-inputnumber-input) {
  @apply text-center;
}

:deep(.p-togglebutton) {
  @apply text-xs;
}

:deep(.p-dialog .p-dialog-content) {
  @apply p-6;
}

:deep(.p-dialog .p-dialog-footer) {
  @apply p-6 pt-0;
}
</style>