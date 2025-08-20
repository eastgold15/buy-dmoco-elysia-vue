<template>
  <div class="site-config-page">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">网站配置</h1>
        <p class="text-gray-600 mt-1">管理网站的基本信息和设置</p>
      </div>
      <div class="flex gap-2">
        <Button label="重置" icon="pi pi-refresh" severity="secondary" @click="resetConfigs" />
        <Button label="保存" icon="pi pi-save" @click="saveConfigs" :loading="saving" />
      </div>
    </div>

    <!-- 配置分类标签 -->
    <TabView v-model:activeIndex="activeTab" class="config-tabs">
      <!-- 基本设置 -->
      <TabPanel header="基本设置">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="field">
              <label for="site_name" class="block text-sm font-medium text-gray-700 mb-2">
                网站名称 <span class="text-red-500">*</span>
              </label>
              <InputText
                id="site_name"
                v-model="configs.site_name"
                placeholder="请输入网站名称"
                class="w-full"
                :class="{ 'p-invalid': errors.site_name }"
              />
              <small v-if="errors.site_name" class="p-error">{{ errors.site_name }}</small>
            </div>

            <div class="field">
              <label for="site_logo" class="block text-sm font-medium text-gray-700 mb-2">
                网站Logo
              </label>
              <InputText
                id="site_logo"
                v-model="configs.site_logo"
                placeholder="https://example.com/logo.png"
                class="w-full"
              />
              <small class="text-gray-500">请输入Logo图片的完整URL地址</small>
            </div>

            <div class="field">
              <label for="currency" class="block text-sm font-medium text-gray-700 mb-2">
                货币单位
              </label>
              <Dropdown
                id="currency"
                v-model="configs.currency"
                :options="currencyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="选择货币单位"
                class="w-full"
              />
            </div>
          </div>

          <div class="space-y-4">
            <div class="field">
              <label for="header_notice" class="block text-sm font-medium text-gray-700 mb-2">
                顶部通知
              </label>
              <Textarea
                id="header_notice"
                v-model="configs.header_notice"
                placeholder="FREE SHIPPING on orders over $59* details"
                rows="3"
                class="w-full"
              />
              <small class="text-gray-500">显示在网站顶部的通知信息</small>
            </div>

            <div class="field">
              <label for="free_shipping_threshold" class="block text-sm font-medium text-gray-700 mb-2">
                免费配送门槛
              </label>
              <InputNumber
                id="free_shipping_threshold"
                v-model="configs.free_shipping_threshold"
                placeholder="59"
                :min="0"
                :max="9999"
                class="w-full"
              />
              <small class="text-gray-500">订单金额超过此数值免费配送</small>
            </div>
          </div>
        </div>
      </TabPanel>

      <!-- SEO设置 -->
      <TabPanel header="SEO设置">
        <div class="space-y-6">
          <div class="field">
            <label for="site_keywords" class="block text-sm font-medium text-gray-700 mb-2">
              SEO关键词
            </label>
            <InputText
              id="site_keywords"
              v-model="configs.site_keywords"
              placeholder="外贸,服装,时尚,购物"
              class="w-full"
            />
            <small class="text-gray-500">多个关键词用逗号分隔</small>
          </div>

          <div class="field">
            <label for="site_description" class="block text-sm font-medium text-gray-700 mb-2">
              网站描述
            </label>
            <Textarea
              id="site_description"
              v-model="configs.site_description"
              placeholder="专业的外贸服装购物平台"
              rows="4"
              class="w-full"
            />
            <small class="text-gray-500">网站SEO描述，显示在搜索结果中</small>
          </div>
        </div>
      </TabPanel>

      <!-- 联系信息 -->
      <TabPanel header="联系信息">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="field">
              <label for="contact_email" class="block text-sm font-medium text-gray-700 mb-2">
                联系邮箱
              </label>
              <InputText
                id="contact_email"
                v-model="configs.contact_email"
                placeholder="contact@example.com"
                type="email"
                class="w-full"
                :class="{ 'p-invalid': errors.contact_email }"
              />
              <small v-if="errors.contact_email" class="p-error">{{ errors.contact_email }}</small>
            </div>

            <div class="field">
              <label for="contact_phone" class="block text-sm font-medium text-gray-700 mb-2">
                联系电话
              </label>
              <InputText
                id="contact_phone"
                v-model="configs.contact_phone"
                placeholder="+86 400-123-4567"
                class="w-full"
              />
            </div>
          </div>

          <div class="space-y-4">
            <div class="field">
              <label for="contact_address" class="block text-sm font-medium text-gray-700 mb-2">
                联系地址
              </label>
              <Textarea
                id="contact_address"
                v-model="configs.contact_address"
                placeholder="请输入公司地址"
                rows="3"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </TabPanel>

      <!-- 法律信息 -->
      <TabPanel header="法律信息">
        <div class="space-y-6">
          <div class="field">
            <label for="icp_number" class="block text-sm font-medium text-gray-700 mb-2">
              ICP备案号
            </label>
            <InputText
              id="icp_number"
              v-model="configs.icp_number"
              placeholder="京ICP备12345678号"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="copyright" class="block text-sm font-medium text-gray-700 mb-2">
              版权信息
            </label>
            <Textarea
              id="copyright"
              v-model="configs.copyright"
              placeholder="© 2024 公司名称 All Rights Reserved"
              rows="3"
              class="w-full"
            />
            <small class="text-gray-500">显示在网站底部的版权信息</small>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { apiFetch } from '../../utils/api'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

// 组合式API
const toast = useToast()

// 响应式数据
const activeTab = ref(0)
const saving = ref(false)
const loading = ref(false)

// 配置数据
const configs = reactive({
  site_name: '',
  site_logo: '',
  site_keywords: '',
  site_description: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  icp_number: '',
  copyright: '',
  header_notice: '',
  free_shipping_threshold: 59,
  currency: 'USD'
})

// 原始配置数据（用于重置）
const originalConfigs = reactive({ ...configs })

// 表单验证错误
const errors = reactive({
  site_name: '',
  contact_email: ''
})

// 货币选项
const currencyOptions = [
  { label: '美元 (USD)', value: 'USD' },
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '欧元 (EUR)', value: 'EUR' },
  { label: '英镑 (GBP)', value: 'GBP' }
]

// 加载配置数据
const loadConfigs = async () => {
  try {
    loading.value = true
    const response = await apiFetch('/api/site-config')
    
    if (response.success && response.data) {
      // 将配置数组转换为对象
      response.data.forEach((config: any) => {
        if (config.key in configs) {
          // 处理数字类型
          if (config.key === 'free_shipping_threshold') {
            configs[config.key as keyof typeof configs] = Number(config.value) || 59
          } else {
            configs[config.key as keyof typeof configs] = config.value || ''
          }
        }
      })
      
      // 保存原始数据
      Object.assign(originalConfigs, configs)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '加载配置失败',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// 验证表单
const validateForm = () => {
  let isValid = true
  
  // 清空错误
  errors.site_name = ''
  errors.contact_email = ''
  
  // 验证网站名称
  if (!configs.site_name.trim()) {
    errors.site_name = '网站名称不能为空'
    isValid = false
  }
  
  // 验证邮箱格式
  if (configs.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configs.contact_email)) {
    errors.contact_email = '请输入有效的邮箱地址'
    isValid = false
  }
  
  return isValid
}

// 保存配置
const saveConfigs = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'warn',
      summary: '验证失败',
      detail: '请检查表单中的错误',
      life: 3000
    })
    return
  }
  
  try {
    saving.value = true
    
    // 准备批量更新数据
    const updateData = Object.entries(configs).map(([key, value]) => ({
      key,
      value: String(value)
    }))
    
    const response = await apiFetch('/api/site-config/batch', {
      method: 'PATCH',
      body: updateData
    })
    
    if (response.success) {
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '配置保存成功',
        life: 3000
      })
      
      // 更新原始数据
      Object.assign(originalConfigs, configs)
    } else {
      throw new Error(response.error || '保存失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '保存配置失败',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

// 重置配置
const resetConfigs = () => {
  Object.assign(configs, originalConfigs)
  
  // 清空错误
  errors.site_name = ''
  errors.contact_email = ''
  
  toast.add({
    severity: 'info',
    summary: '提示',
    detail: '配置已重置',
    life: 3000
  })
}

// 初始化默认配置
const initializeConfigs = async () => {
  try {
    const response = await apiFetch('/api/site-config/initialize', {
      method: 'POST'
    })
    
    if (response.success) {
      await loadConfigs()
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '默认配置初始化成功',
        life: 3000
      })
    }
  } catch (error) {
    console.error('初始化配置失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadConfigs()
  
  // 如果没有配置数据，初始化默认配置
  if (!configs.site_name) {
    await initializeConfigs()
  }
})
</script>

<style scoped>
.site-config-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.config-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.field {
  margin-bottom: 1rem;
}

.p-tabview-panels {
  padding: 2rem;
}

.p-error {
  color: #e24c4c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.p-invalid {
  border-color: #e24c4c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .site-config-page {
    padding: 16px;
  }
  
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .p-tabview-panels {
    padding: 1rem;
  }
}
</style>