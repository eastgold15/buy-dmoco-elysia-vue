<template>
  <div class="footer-config-page">
    <div class="page-header">
      <h1 class="text-2xl font-bold text-gray-800">底部配置管理</h1>
      <p class="text-gray-600 mt-2">管理网站底部信息和链接</p>
    </div>

    <Card class="mt-6">
      <template #title>
        <div class="flex items-center gap-2">
          <i class="ic:round-settings text-blue-500"></i>
          底部配置
        </div>
      </template>
      
      <template #content>
        <form @submit.prevent="saveConfig" class="space-y-6">
          <!-- 版权信息 -->
          <div class="field">
            <label for="copyright" class="block text-sm font-medium text-gray-700 mb-2">
              版权信息
            </label>
            <InputText
              id="copyright"
              v-model="config.copyright"
              placeholder="例如：© 2024 WWW.APPARELCITY.COM.CN All Rights Reserved 赣ICP备2024041550号-5"
              class="w-full"
            />
            <small class="text-gray-500">显示在网站底部的版权信息</small>
          </div>

          <!-- 返回顶部文本 -->
          <div class="field">
            <label for="backToTopText" class="block text-sm font-medium text-gray-700 mb-2">
              返回顶部文本
            </label>
            <InputText
              id="backToTopText"
              v-model="config.backToTopText"
              placeholder="例如：Back to top"
              class="w-full"
            />
          </div>

          <!-- 底部栏目 -->
          <div class="field">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              底部栏目
            </label>
            <div class="space-y-4">
              <div v-for="(section, sectionIndex) in config.sections" :key="sectionIndex" class="border rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-medium text-gray-800">栏目 {{ sectionIndex + 1 }}</h4>
                  <Button
                    type="button"
                    icon="ic:round-delete"
                    severity="danger"
                    outlined
                    size="small"
                    @click="removeSection(sectionIndex)"
                    :disabled="config.sections.length <= 1"
                  />
                </div>
                
                <!-- 栏目标题 -->
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-600 mb-1">
                    栏目标题
                  </label>
                  <InputText
                    v-model="section.title"
                    placeholder="例如：For You"
                    class="w-full"
                  />
                </div>

                <!-- 栏目链接 -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">
                    栏目链接
                  </label>
                  <div class="space-y-2">
                    <div v-for="(link, linkIndex) in section.links" :key="linkIndex" class="flex gap-2">
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
                        size="small"
                        @click="removeLink(sectionIndex, linkIndex)"
                        :disabled="section.links.length <= 1"
                      />
                    </div>
                    <Button
                      type="button"
                      icon="ic:round-add"
                      label="添加链接"
                      outlined
                      size="small"
                      @click="addLink(sectionIndex)"
                      class="w-full"
                    />
                  </div>
                </div>
              </div>
              
              <Button
                type="button"
                icon="ic:round-add"
                label="添加栏目"
                outlined
                @click="addSection"
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
            <Button
              type="button"
              label="初始化默认配置"
              icon="ic:round-restore"
              severity="info"
              outlined
              @click="initializeDefault"
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
          <!-- 底部预览 -->
          <div class="bg-gray-800 text-white p-6">
            <!-- 底部栏目 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div v-for="section in config.sections" :key="section.title" class="space-y-2">
                <h4 class="font-semibold text-lg">{{ section.title }}</h4>
                <ul class="space-y-1">
                  <li v-for="link in section.links" :key="link.text">
                    <a :href="link.url || '#'" class="text-gray-300 hover:text-white text-sm">
                      {{ link.text }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- 返回顶部 -->
            <div v-if="config.backToTopText" class="text-center mb-4">
              <a href="#" class="text-blue-400 hover:text-blue-300 text-sm">
                {{ config.backToTopText }}
              </a>
            </div>
            
            <!-- 版权信息 -->
            <div v-if="config.copyright" class="text-center text-gray-400 text-sm border-t border-gray-700 pt-4">
              {{ config.copyright }}
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
import { client } from '@/share/useTreaty'
import type { FooterConfig, FooterSection, CreateFooterConfigRequest, UpdateFooterConfigRequest, ApiResponse } from '../../types/layout'

// 响应式数据
const toast = useToast()
const saving = ref(false)
const loading = ref(false)

// 配置数据
const config = ref<FooterConfig>({
  id: '',
  copyright: '',
  backToTopText: 'Back to top',
  sections: [
    {
      title: 'For You',
      links: [
        { text: 'Favorites', url: '/favorites' }
      ]
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
})

// 原始配置备份
const originalConfig = ref<FooterConfig | null>(null)

// 添加栏目
const addSection = () => {
  config.value.sections.push({
    title: '',
    links: [
      { text: '', url: '' }
    ]
  })
}

// 删除栏目
const removeSection = (index: number) => {
  if (config.value.sections.length > 1) {
    config.value.sections.splice(index, 1)
  }
}

// 添加链接
const addLink = (sectionIndex: number) => {
  config.value.sections[sectionIndex].links.push({ text: '', url: '' })
}

// 删除链接
const removeLink = (sectionIndex: number, linkIndex: number) => {
  const section = config.value.sections[sectionIndex]
  if (section.links.length > 1) {
    section.links.splice(linkIndex, 1)
  }
}

// 加载配置
const loadConfig = async () => {
  try {
    loading.value = true
    const { data, error } = await client.api['footer-config'].get()
    
    if (data) {
      config.value = { ...data }
      originalConfig.value = { ...data }
    } else {
      console.error('加载底部配置失败:', error)
    }
  } catch (error) {
    console.error('加载底部配置失败:', error)
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: '无法加载底部配置',
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
    if (!config.value.copyright.trim()) {
      toast.add({
        severity: 'warn',
        summary: '验证失败',
        detail: '请填写版权信息',
        life: 3000
      })
      return
    }

    // 验证栏目
    const validSections = config.value.sections.filter(section => {
      if (!section.title.trim()) return false
      const validLinks = section.links.filter(link => 
        link.text.trim() && link.url.trim()
      )
      section.links = validLinks
      return validLinks.length > 0
    })
    
    if (validSections.length === 0) {
      toast.add({
        severity: 'warn',
        summary: '验证失败',
        detail: '至少需要一个有效的栏目',
        life: 3000
      })
      return
    }

    config.value.sections = validSections

    let response: ApiResponse<FooterConfig>
    
    if (originalConfig.value?.id) {
      // 更新现有配置
      const updateData: UpdateFooterConfigRequest = {
        copyright: config.value.copyright,
        backToTopText: config.value.backToTopText,
        sections: config.value.sections
      }
      
      const { data: updateResult, error: updateError } = await client.api['footer-config'].put(updateData)
      response = { success: !!updateResult, data: updateResult, error: updateError }
    } else {
      // 创建新配置
      const createData: CreateFooterConfigRequest = {
        copyright: config.value.copyright,
        backToTopText: config.value.backToTopText,
        sections: config.value.sections
      }
      
      const { data: createResult, error: createError } = await client.api['footer-config'].post(createData)
      response = { success: !!createResult, data: createResult, error: createError }
    }

    if (response.success && response.data) {
      config.value = { ...response.data }
      originalConfig.value = { ...response.data }
      
      toast.add({
        severity: 'success',
        summary: '保存成功',
        detail: response.message || '底部配置已保存',
        life: 3000
      })
    } else {
      throw new Error(response.error || '保存失败')
    }
  } catch (error) {
    console.error('保存底部配置失败:', error)
    toast.add({
      severity: 'error',
      summary: '保存失败',
      detail: error instanceof Error ? error.message : '保存底部配置失败',
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
      copyright: '',
      backToTopText: 'Back to top',
      sections: [
        {
          title: 'For You',
          links: [
            { text: 'Favorites', url: '/favorites' }
          ]
        }
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

// 初始化默认配置
const initializeDefault = async () => {
  try {
    saving.value = true
    
    const { data, error } = await client.api['footer-config'].initialize.post()
    const response = { success: !!data, data, error }

    if (response.success) {
      toast.add({
        severity: 'success',
        summary: '初始化成功',
        detail: response.message || '默认底部配置已初始化',
        life: 3000
      })
      
      // 重新加载配置
      await loadConfig()
    } else {
      throw new Error(response.error || '初始化失败')
    }
  } catch (error) {
    console.error('初始化默认配置失败:', error)
    toast.add({
      severity: 'error',
      summary: '初始化失败',
      detail: error instanceof Error ? error.message : '初始化默认配置失败',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.footer-config-page {
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