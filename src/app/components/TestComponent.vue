<template>
  <div class="test-component">
    <h3>这是一个测试组件</h3>
    <p>用于验证 unplugin-vue-components 自动导入功能</p>
  </div>
</template>

<script setup lang="ts">
// 测试组件
console.log('TestComponent 已加载');
</script>

<style scoped>
.test-component {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin: 1rem 0;
}
</style>