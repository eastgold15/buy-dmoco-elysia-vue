<template>
  <div class="header-config-page">
    <div class="page-header">
      <h1 class="text-2xl font-bold text-gray-800">顶部配置管理</h1>
      <p class="text-gray-600 mt-2">管理网站顶部横幅和导航信息</p>
    </div>

    <Card class="mt-6">
      <template #title>
        <div class="flex items-center gap-2">
          <i class="ic:round-settings text-blue-500"></i>
          顶部配置
        </div>
      </template>
      
      <template #content>
        <form @submit.prevent="saveConfig" class="space-y-6">
          <!-- 顶部横幅文本 -->
          <div class="field">
            <label for="bannerText" class="block text-sm font-medium text-gray-700 mb-2">
              顶部横幅文本
            </label>
            <InputText
              id="bannerText"
              v-model="config.bannerText"
              placeholder="例如：FREE SHIPPING on orders over $59* details"
              class="w-full"
            />
            <small class="text-gray-500">显示在网站顶部的横幅信息</small>
          </div>

          <!-- 横幅链接 -->
          <div class="field">
            <label for="bannerLink" class="block text-sm font-medium text-gray-700 mb-2">
              横幅链接
            </label>
            <InputText
              id="bannerLink"
              v-model="config.bannerLink"
              placeholder="例如：/shipping-info"
              class="w-full"
            />
            <small class="text-gray-500">点击横幅时跳转的链接地址</small>
          </div>

          <!-- 追踪订单文本 -->
          <div class="field">
            <label for="trackOrderText" class="block text-sm font-medium text-gray-700 mb-2">
              追踪订单文本
            </label>
            <InputText
              id="trackOrderText"
              v-model="config.trackOrderText"
              placeholder="例如：Track Order"
              class="w-full"
            />
          </div>

          <!-- 追踪订单链接 -->
          <div class="field">
            <label for="trackOrderLink" class="block text-sm font-medium text-gray-700 mb-2">
              追踪订单链接
            </label>
            <InputText
              id="trackOrderLink"
              v-model="config.trackOrderLink"
              placeholder="例如：/track-order"
              class="w-full"
            />
          </div>

          <!-- 帮助链接 -->
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              帮助链接
            </label>
            <div class="space-y-3">
              <div v-for="(link, index) in config.helpLinks" :key="index" class="flex gap-2">
                <InputText
                  v-model="link.text"
                  placeholder="链接文本"
                  class="flex-1"
                />
                <InputText
                  v-model="link.url"
                  placeholder="链接地址"
                  class="flex-1"
                />
                <Button
                  type="button"
                  icon="ic:round-delete"
                  severity="danger"
                  outlined
                  @click="removeHelpLink(index)"
                  :disabled="config.helpLinks.length <= 1"
                />
              </div>
              <Button
                type="button"
                icon="ic:round-add"
                label="添加帮助链接"
                outlined
                @click="addHelpLink"
                class="w-full"
              />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 pt-4">
            <Button
              type="submit"
              label="保存配置"
              icon="ic:round-save"
              :loading="saving"
              class="flex-1"
            />
            <Button
              type="button"
              label="重置"
              icon="ic:round-refresh"
              severity="secondary"
              outlined
              @click="resetConfig"
              :disabled="saving"
            />
          </div>
        </form>
      </template>
    </Card>

    <!-- 预览区域 -->
    <Card class="mt-6">
      <template #title>
        <div class="flex items-center gap-2">
          <i class="ic:round-preview text-green-500"></i>
          配置预览
        </div>
      </template>
      
      <template #content>
        <div class="border rounded-lg p-4 bg-gray-50">
          <!-- 顶部横幅预览 -->
          <div v-if="config.bannerText" class="bg-blue-600 text-white text-center py-2 px-4 text-sm">
            <a :href="config.bannerLink || '#'" class="hover:underline">
              {{ config.bannerText }}
            </a>
          </div>
          
          <!-- 导航栏预览 -->
          <div class="bg-white border-b p-4">
            <div class="flex justify-between items-center">
              <div class="text-lg font-bold">LOGO</div>
              <div class="flex items-center gap-4 text-sm">
                <a v-if="config.trackOrderText" :href="config.trackOrderLink || '#'" class="hover:underline">
                  {{ config.trackOrderText }}
                </a>
                <div v-if="config.helpLinks.length" class="flex gap-2">
                  <a
                    v-for="link in config.helpLinks"
                    :key="link.text"
                    :href="link.url || '#'"
                    class="hover:underline"
                  >
                    {{ link.text }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { apiFetch } from '../../utils/api'
import type { HeaderConfig, CreateHeaderConfigRequest, UpdateHeaderConfigRequest, ApiResponse } from '../../types/layout'

// 响应式数据
const toast = useToast()
const saving = ref(false)
const loading = ref(false)

// 配置数据
const config = ref<HeaderConfig>({
  id: '',
  bannerText: '',
  bannerLink: '',
  trackOrderText: 'Track Order',
  trackOrderLink: '/track-order',
  helpLinks: [
    { text: 'Help', url: '/help' }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
})

// 原始配置备份
const originalConfig = ref<HeaderConfig | null>(null)

// 添加帮助链接
const addHelpLink = () => {
  config.value.helpLinks.push({ text: '', url: '' })
}

// 删除帮助链接
const removeHelpLink = (index: number) => {
  if (config.value.helpLinks.length > 1) {
    config.value.helpLinks.splice(index, 1)
  }
}

// 加载配置
const loadConfig = async () => {
  try {
    loading.value = true
    const response = await apiFetch<ApiResponse<HeaderConfig>>('/api/header-config')
    
    if (response.success && response.data) {
      config.value = { ...response.data }
      originalConfig.value = { ...response.data }
    }
  } catch (error) {
    console.error('加载顶部配置失败:', error)
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: '无法加载顶部配置',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    saving.value = true
    
    // 验证必填字段
    if (!config.value.bannerText.trim()) {
      toast.add({
        severity: 'warn',
        summary: '验证失败',
        detail: '请填写顶部横幅文本',
        life: 3000
      })
      return
    }

    // 验证帮助链接
    const validHelpLinks = config.value.helpLinks.filter(link => 
      link.text.trim() && link.url.trim()
    )
    
    if (validHelpLinks.length === 0) {
      toast.add({
        severity: 'warn',
        summary: '验证失败',
        detail: '至少需要一个有效的帮助链接',
        life: 3000
      })
      return
    }

    config.value.helpLinks = validHelpLinks

    let response: ApiResponse<HeaderConfig>
    
    if (originalConfig.value?.id) {
      // 更新现有配置
      const updateData: UpdateHeaderConfigRequest = {
        bannerText: config.value.bannerText,
        bannerLink: config.value.bannerLink,
        trackOrderText: config.value.trackOrderText,
        trackOrderLink: config.value.trackOrderLink,
        helpLinks: config.value.helpLinks
      }
      
      response = await apiFetch<ApiResponse<HeaderConfig>>('/api/header-config', {
        method: 'PUT',
        body: updateData
      })
    } else {
      // 创建新配置
      const createData: CreateHeaderConfigRequest = {
        bannerText: config.value.bannerText,
        bannerLink: config.value.bannerLink,
        trackOrderText: config.value.trackOrderText,
        trackOrderLink: config.value.trackOrderLink,
        helpLinks: config.value.helpLinks
      }
      
      response = await apiFetch<ApiResponse<HeaderConfig>>('/api/header-config', {
        method: 'POST',
        body: createData
      })
    }

    if (response.success && response.data) {
      config.value = { ...response.data }
      originalConfig.value = { ...response.data }
      
      toast.add({
        severity: 'success',
        summary: '保存成功',
        detail: response.message || '顶部配置已保存',
        life: 3000
      })
    } else {
      throw new Error(response.error || '保存失败')
    }
  } catch (error) {
    console.error('保存顶部配置失败:', error)
    toast.add({
      severity: 'error',
      summary: '保存失败',
      detail: error instanceof Error ? error.message : '保存顶部配置失败',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

// 重置配置
const resetConfig = () => {
  if (originalConfig.value) {
    config.value = { ...originalConfig.value }
  } else {
    config.value = {
      id: '',
      bannerText: '',
      bannerLink: '',
      trackOrderText: 'Track Order',
      trackOrderLink: '/track-order',
      helpLinks: [
        { text: 'Help', url: '/help' }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  toast.add({
    severity: 'info',
    summary: '已重置',
    detail: '配置已重置到原始状态',
    life: 3000
  })
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.header-config-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.field small {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
}
</style>