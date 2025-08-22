<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { client } from '@/share/useTreaty'

// PrimeVue 组件
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import ToggleSwitch from 'primevue/toggleswitch'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import Image from 'primevue/image'
import FileUpload from 'primevue/fileupload'
import MultiSelect from 'primevue/multiselect'

// 类型定义
interface Product {
    id: number
    name: string
    description: string
    price: number
    originalPrice?: number
    stock: number
    sku: string
    images: string[]
    categoryId: number
    categoryName?: string
    tags: string[]
    isActive: boolean
    isFeatured: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
}

interface ProductForm {
    name: string
    description: string
    price: number
    originalPrice?: number
    stock: number
    sku: string
    images: string[]
    categoryId: number | null
    tags: string[]
    isActive: boolean
    isFeatured: boolean
    sortOrder: number
}

interface Category {
    id: number
    name: string
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const products = ref<Product[]>([])
const selectedProducts = ref<Product[]>([])
const categories = ref<Category[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const sortField = ref('createdAt')
const sortOrder = ref(-1) // 1 for asc, -1 for desc
const searchKeyword = ref('')
const filterCategory = ref<number | null>(null)
const filterStatus = ref('all')
const showCreateDialog = ref(false)
const editingProduct = ref<Product | null>(null)

// 表单数据
const productForm = ref<ProductForm>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    sku: '',
    images: [],
    categoryId: null,
    tags: [],
    isActive: true,
    isFeatured: false,
    sortOrder: 0
})

// 选项数据
const statusOptions = [
    { label: '全部', value: 'all' },
    { label: '上架', value: true },
    { label: '下架', value: false }
]

const availableTags = ref([
    '热销', '新品', '推荐', '限时优惠', '包邮', '精选'
])

// 工具函数
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()

// 计算属性
const isFormValid = computed(() => {
    return productForm.value.name.trim() &&
        productForm.value.description.trim() &&
        productForm.value.price > 0 &&
        productForm.value.stock >= 0 &&
        productForm.value.sku.trim() &&
        productForm.value.categoryId !== null
})

const categoryOptions = computed(() => {
    return categories.value.map(cat => ({
        label: cat.name,
        value: cat.id
    }))
})

const tagOptions = computed(() => {
    return availableTags.value.map(tag => ({
        label: tag,
        value: tag
    }))
})

// 方法
const loadProducts = async () => {
    try {
        loading.value = true
        const params = {
            page: page.value,
            pageSize: pageSize.value,
            sortBy: sortField.value,
            sortOrder: sortOrder.value === 1 ? 'asc' : 'desc',
            search: searchKeyword.value || undefined,
            categoryId: filterCategory.value || undefined,
            isActive: filterStatus.value !== 'all' ? filterStatus.value : undefined
        }

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模拟数据
        const mockProducts: Product[] = [
            {
                id: 1,
                name: 'iPhone 15 Pro',
                description: '最新款iPhone，配备A17 Pro芯片',
                price: 7999,
                originalPrice: 8999,
                stock: 50,
                sku: 'IP15P-001',
                images: ['/uploads/iphone15pro.jpg'],
                categoryId: 1,
                categoryName: '手机数码',
                tags: ['新品', '热销'],
                isActive: true,
                isFeatured: true,
                sortOrder: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                name: 'MacBook Pro 14"',
                description: '专业级笔记本电脑，M3芯片',
                price: 14999,
                originalPrice: 16999,
                stock: 30,
                sku: 'MBP14-001',
                images: ['/uploads/macbookpro14.jpg'],
                categoryId: 2,
                categoryName: '电脑办公',
                tags: ['推荐', '精选'],
                isActive: true,
                isFeatured: false,
                sortOrder: 2,
                createdAt: new Date(Date.now() - 86400000),
                updatedAt: new Date(Date.now() - 86400000)
            }
        ]
        
        products.value = mockProducts
        total.value = mockProducts.length
        
    } catch (error) {
        console.error('加载商品失败:', error)
        products.value = []
        total.value = 0
        toast.add({ severity: 'error', summary: '错误', detail: '加载商品失败' })
    } finally {
        loading.value = false
    }
}

const loadCategories = async () => {
    try {
        // 模拟分类数据
        categories.value = [
            { id: 1, name: '手机数码' },
            { id: 2, name: '电脑办公' },
            { id: 3, name: '家用电器' },
            { id: 4, name: '服装鞋帽' },
            { id: 5, name: '图书音像' }
        ]
    } catch (error) {
        console.error('加载分类失败:', error)
        toast.add({ severity: 'error', summary: '错误', detail: '加载分类失败' })
    }
}

// 分页处理
const onPage = (event: any) => {
    page.value = event.page + 1
    pageSize.value = event.rows
    loadProducts()
}

// 排序处理
const onSort = (event: any) => {
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder
    loadProducts()
}

// 搜索处理
const handleSearch = () => {
    page.value = 1
    loadProducts()
}

// 筛选处理
const handleFilter = () => {
    page.value = 1
    loadProducts()
}

// 显示编辑对话框
const showEditDialog = (product: Product) => {
    editingProduct.value = product
    productForm.value = {
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        sku: product.sku,
        images: [...product.images],
        categoryId: product.categoryId,
        tags: [...product.tags],
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        sortOrder: product.sortOrder
    }
    showCreateDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
    showCreateDialog.value = false
    editingProduct.value = null
    productForm.value = {
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        stock: 0,
        sku: '',
        images: [],
        categoryId: null,
        tags: [],
        isActive: true,
        isFeatured: false,
        sortOrder: 0
    }
}

// 保存商品
const saveProduct = async () => {
    if (!isFormValid.value) {
        toast.add({ severity: 'warn', summary: '警告', detail: '请填写必填字段' })
        return
    }

    try {
        saving.value = true

        if (editingProduct.value) {
            // 更新
            toast.add({ severity: 'success', summary: '成功', detail: '更新商品成功' })
        } else {
            // 创建
            toast.add({ severity: 'success', summary: '成功', detail: '创建商品成功' })
        }
        
        closeDialog()
        loadProducts()
    } catch (error) {
        console.error('保存商品失败:', error)
        toast.add({ severity: 'error', summary: '错误', detail: '保存商品失败' })
    } finally {
        saving.value = false
    }
}

// 确认删除
const confirmDelete = (product: Product) => {
    confirm.require({
        message: `确定要删除商品 "${product.name}" 吗？`,
        header: '删除确认',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => deleteProduct(product.id)
    })
}

// 删除商品
const deleteProduct = async (id: number) => {
    try {
        toast.add({ severity: 'success', summary: '成功', detail: '删除商品成功' })
        loadProducts()
    } catch (error) {
        console.error('删除商品失败:', error)
        toast.add({ severity: 'error', summary: '错误', detail: '删除商品失败' })
    }
}

// 切换上架状态
const toggleActive = async (product: Product) => {
    try {
        toast.add({
            severity: 'success',
            summary: '成功',
            detail: `${product.isActive ? '上架' : '下架'}商品成功`
        })
        loadProducts()
    } catch (error) {
        product.isActive = !product.isActive
        console.error('切换状态失败:', error)
        toast.add({ severity: 'error', summary: '错误', detail: '切换状态失败' })
    }
}

// 切换推荐状态
const toggleFeatured = async (product: Product) => {
    try {
        toast.add({
            severity: 'success',
            summary: '成功',
            detail: `${product.isFeatured ? '设为推荐' : '取消推荐'}成功`
        })
        loadProducts()
    } catch (error) {
        product.isFeatured = !product.isFeatured
        console.error('切换推荐状态失败:', error)
        toast.add({ severity: 'error', summary: '错误', detail: '切换推荐状态失败' })
    }
}

// 格式化金额
const formatCurrency = (amount: number) => {
    return '¥' + amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 格式化日期
const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 跳转到添加商品页面
const goToAddProduct = () => {
    router.push('/admin/products/add')
}

// 组件挂载时加载数据
onMounted(() => {
    loadCategories()
    loadProducts()
})
</script>

<template>
    <div class="products-management">
        <!-- 页面标题和操作栏 -->
        <div class="header-section">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">商品管理</h1>
                    <p class="text-gray-600 mt-1">管理商品信息，包括价格、库存、分类等</p>
                </div>
                <div class="flex gap-3">
                    <Button label="添加商品" icon="pi pi-plus" @click="goToAddProduct" class="p-button-success" />
                    <Button label="批量导入" icon="pi pi-upload" class="p-button-outlined" />
                </div>
            </div>

            <!-- 工具栏 -->
            <div class="flex justify-between items-center mb-4">
                <div class="flex gap-3">
                    <Button label="刷新" icon="pi pi-refresh" @click="loadProducts" class="p-button-outlined"
                        size="small" />
                    <Button label="批量上架" icon="pi pi-check" class="p-button-outlined"
                        size="small" :disabled="!selectedProducts.length" />
                    <Button label="批量下架" icon="pi pi-times" class="p-button-outlined"
                        size="small" :disabled="!selectedProducts.length" />
                </div>
                <div class="flex gap-3">
                    <InputText v-model="searchKeyword" placeholder="搜索商品名称或SKU..." class="w-64" @input="handleSearch" />
                    <Dropdown v-model="filterCategory" :options="categoryOptions" optionLabel="label" optionValue="value"
                        placeholder="筛选分类" class="w-32" @change="handleFilter" showClear />
                    <Dropdown v-model="filterStatus" :options="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="筛选状态" class="w-32" @change="handleFilter" />
                </div>
            </div>
        </div>

        <!-- 商品数据表格 -->
        <div class="table-section">
            <DataTable :value="products" tableStyle="min-width: 50rem" :loading="loading"
                v-model:selection="selectedProducts" dataKey="id" paginator :rows="pageSize"
                :rowsPerPageOptions="[5, 10, 20, 50]" :totalRecords="total" :lazy="true" @page="onPage" @sort="onSort"
                :sortField="sortField" :sortOrder="sortOrder" :first="(page - 1) * pageSize" class="p-datatable-sm"
                showGridlines responsiveLayout="scroll" selectionMode="multiple" :metaKeySelection="false">

                <template #header>
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span class="text-xl font-bold">商品列表</span>
                        <Button icon="pi pi-refresh" rounded raised />
                    </div>
                </template>

                <!-- 选择列 -->
                <Column selectionMode="multiple" class="w-[3%]"></Column>

                <!-- 商品图片列 -->
                <Column field="images" header="图片" class="w-[8%]">
                    <template #body="{ data }">
                        <div class="flex justify-center">
                            <Image v-if="data.images && data.images.length > 0" :src="data.images[0]" :alt="data.name"
                                width="60" height="60" class="rounded-lg border border-gray-200" preview />
                            <div v-else class="w-15 h-15 bg-gray-100 rounded-lg flex items-center justify-center">
                                <i class="pi pi-image text-gray-400 text-xl"></i>
                            </div>
                        </div>
                    </template>
                </Column>

                <!-- 商品信息列 -->
                <Column field="name" header="商品信息" sortable class="w-[20%]">
                    <template #body="{ data }">
                        <div>
                            <p class="font-medium text-sm mb-1">{{ data.name }}</p>
                            <p class="text-xs text-gray-600 mb-1">SKU: {{ data.sku }}</p>
                            <div class="flex flex-wrap gap-1">
                                <Tag v-for="tag in data.tags" :key="tag" :value="tag" severity="info" class="text-xs" />
                            </div>
                        </div>
                    </template>
                </Column>

                <!-- 分类列 -->
                <Column field="categoryName" header="分类" class="w-[10%]">
                    <template #body="{ data }">
                        <Tag :value="data.categoryName || '未分类'" severity="secondary" class="text-xs" />
                    </template>
                </Column>

                <!-- 价格列 -->
                <Column field="price" header="价格" sortable class="w-[12%]">
                    <template #body="{ data }">
                        <div>
                            <p class="font-medium text-sm text-red-600">{{ formatCurrency(data.price) }}</p>
                            <p v-if="data.originalPrice && data.originalPrice > data.price" 
                                class="text-xs text-gray-400 line-through">
                                {{ formatCurrency(data.originalPrice) }}
                            </p>
                        </div>
                    </template>
                </Column>

                <!-- 库存列 -->
                <Column field="stock" header="库存" sortable class="w-[8%]">
                    <template #body="{ data }">
                        <Tag :value="data.stock" 
                            :severity="data.stock > 10 ? 'success' : data.stock > 0 ? 'warning' : 'danger'" 
                            class="text-xs" />
                    </template>
                </Column>

                <!-- 状态列 -->
                <Column field="isActive" header="状态" class="w-[12%]">
                    <template #body="{ data }">
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center gap-2">
                                <ToggleSwitch v-model="data.isActive" @change="toggleActive(data)" class="scale-75" />
                                <Tag :value="data.isActive ? '上架' : '下架'"
                                    :severity="data.isActive ? 'success' : 'secondary'" class="text-xs" />
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model="data.isFeatured" @change="toggleFeatured(data)" binary class="scale-75" />
                                <span class="text-xs text-gray-600">推荐</span>
                            </div>
                        </div>
                    </template>
                </Column>

                <!-- 创建时间列 -->
                <Column field="createdAt" header="创建时间" sortable class="w-[12%]">
                    <template #body="{ data }">
                        <span class="text-gray-500 text-sm">{{ formatDate(data.createdAt) }}</span>
                    </template>
                </Column>

                <!-- 操作列 -->
                <Column header="操作" class="w-[15%]">
                    <template #body="{ data }">
                        <div class="flex gap-2">
                            <Button icon="pi pi-eye" @click="router.push(`/admin/products/${data.id}`)"
                                class="p-button-info p-button-sm" v-tooltip.top="'查看'" />
                            <Button icon="pi pi-pencil" @click="showEditDialog(data)"
                                class="p-button-warning p-button-sm" v-tooltip.top="'编辑'" />
                            <Button icon="pi pi-trash" @click="confirmDelete(data)" class="p-button-danger p-button-sm"
                                v-tooltip.top="'删除'" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- 创建/编辑商品对话框 -->
        <Dialog v-model:visible="showCreateDialog" :header="editingProduct ? '编辑商品' : '新增商品'" :modal="true"
            :closable="true" class="w-[800px]">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">商品名称 *</label>
                        <InputText v-model="productForm.name" placeholder="请输入商品名称" class="w-full"
                            :class="{ 'p-invalid': !productForm.name }" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">商品SKU *</label>
                        <InputText v-model="productForm.sku" placeholder="请输入商品SKU" class="w-full"
                            :class="{ 'p-invalid': !productForm.sku }" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">商品分类 *</label>
                        <Dropdown v-model="productForm.categoryId" :options="categoryOptions" optionLabel="label" 
                            optionValue="value" placeholder="请选择分类" class="w-full"
                            :class="{ 'p-invalid': !productForm.categoryId }" />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium mb-2">销售价格 *</label>
                            <InputNumber v-model="productForm.price" :min="0" :maxFractionDigits="2" 
                                placeholder="0.00" class="w-full" :class="{ 'p-invalid': productForm.price <= 0 }" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">原价</label>
                            <InputNumber v-model="productForm.originalPrice" :min="0" :maxFractionDigits="2" 
                                placeholder="0.00" class="w-full" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">库存数量 *</label>
                        <InputNumber v-model="productForm.stock" :min="0" placeholder="0" class="w-full"
                            :class="{ 'p-invalid': productForm.stock < 0 }" />
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">商品描述 *</label>
                        <Textarea v-model="productForm.description" placeholder="请输入商品描述" rows="4" class="w-full"
                            :class="{ 'p-invalid': !productForm.description }" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">商品标签</label>
                        <MultiSelect v-model="productForm.tags" :options="tagOptions" optionLabel="label" 
                            optionValue="value" placeholder="选择标签" class="w-full" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">排序权重</label>
                        <InputNumber v-model="productForm.sortOrder" :min="0" :max="999" placeholder="0" class="w-full" />
                    </div>

                    <div class="flex gap-6">
                        <div class="flex items-center gap-2">
                            <ToggleSwitch v-model="productForm.isActive" />
                            <label class="text-sm">立即上架</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model="productForm.isFeatured" binary />
                            <label class="text-sm">设为推荐</label>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <Button label="取消" @click="closeDialog" class="p-button-text" />
                    <Button :label="editingProduct ? '更新' : '创建'" @click="saveProduct" 
                        :loading="saving" :disabled="!isFormValid" />
                </div>
            </template>
        </Dialog>

        <!-- 确认对话框 -->
        <ConfirmDialog />
    </div>
</template>

<style scoped>
.products-management {
    @apply p-0;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .header-section {
        @apply mb-4;
    }
    
    .table-section {
        @apply overflow-x-auto;
    }
}
</style>