<template>
  <div class="env-test-page">
    <h1>环境变量测试页面</h1>
    <div class="env-info">
      <h2>VITE_HUAWEI_DOMAIN 测试</h2>
      <p><strong>环境变量值:</strong> {{ huaweiDomain }}</p>
      <p><strong>测试URL:</strong> {{ testImageUrl }}</p>
      <div class="image-test">
        <h3>图片测试:</h3>
        <img :src="testImageUrl" alt="测试图片" style="max-width: 200px; border: 1px solid #ccc;" @error="onImageError" @load="onImageLoad" />
        <p><strong>加载状态:</strong> {{ imageStatus }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 获取环境变量
const huaweiDomain = import.meta.env.VITE_HUAWEI_DOMAIN || '未设置'

// 测试图片URL
const testImageUrl = computed(() => {
  const domain = import.meta.env.VITE_HUAWEI_DOMAIN || 'http://img.cykycyky.top'
  return `${domain}/general/test.jpg`
})

// 图片加载状态
const imageStatus = ref('加载中...')

const onImageLoad = () => {
  imageStatus.value = '✅ 加载成功'
}

const onImageError = () => {
  imageStatus.value = '❌ 加载失败'
}

// 在控制台输出调试信息
console.log('🔍 环境变量调试信息:')
console.log('VITE_HUAWEI_DOMAIN:', import.meta.env.VITE_HUAWEI_DOMAIN)
console.log('测试图片URL:', testImageUrl.value)
console.log('所有环境变量:', import.meta.env)
</script>

<style scoped>
.env-test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.env-info {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.image-test {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 5px;
}

h1, h2, h3 {
  color: #333;
}

p {
  margin: 10px 0;
}

strong {
  color: #666;
}
</style>