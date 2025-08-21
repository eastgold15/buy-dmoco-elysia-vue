<template>
    <div class="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400">
        <!-- 顶部导航栏 -->
        <nav class="bg-white/10 backdrop-blur-sm border-b border-white/20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-white">Catalyst Brands</h1>
                    </div>
                    <div class="hidden md:block">
                        <div class="ml-10 flex items-baseline space-x-4">
                            <a href="#"
                                class="text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium">首页</a>
                            <a href="#"
                                class="text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium">产品</a>
                            <a href="#"
                                class="text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium">关于我们</a>
                            <a href="#"
                                class="text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium">联系我们</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- 主要内容区域 -->
        <main class="relative">
            <!-- 品牌介绍区域 -->
            <section class="text-center py-20 px-4">
                <div class="max-w-4xl mx-auto">
                    <h2 class="text-5xl font-bold text-white mb-6">Introducing</h2>
                    <div class="text-6xl font-bold text-white mb-8">
                        <span class="text-red-600">Catalyst</span>
                        <span class="text-yellow-400">Brands</span>
                    </div>

                    <div class="text-white text-lg leading-relaxed space-y-4 mb-12">
                        <p>我们通过化妆品牌，现在，我们正在工作7个不同的品牌的客户，具有各种性质</p>
                        <p>和对成功的大胆愿景。</p>
                        <p>正如科学中的催化剂能够不断改变汽车上工作一样，作为一个团队，我们大胆的方法</p>
                        <p>作为，我们的客户"催化剂"区域了我们加速制造和制造的能力307万。</p>
                        <p>我们团队为美国各地的客户带来市场系统，专业知识和化妆品"公司改进力"</p>
                        <p class="font-semibold text-yellow-300">我们的品牌</p>
                    </div>
                </div>
            </section>

            <!-- 产品展示区域 -->
            <section class="py-16">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <!-- 左侧产品图片 -->
                        <div class="grid grid-cols-3 gap-4">
                            <!-- 产品图片1 -->
                            <!-- <div class="bg-white rounded-lg overflow-hidden shadow-lg">
                                <img src="@/01.jpg" alt="时尚女装" class="w-full h-full object-cover">
                            </div> -->
                            <!-- 产品图片2 -->
                            <!-- <div class="bg-white rounded-lg overflow-hidden shadow-lg">
                                <img src="@/02.jpg" alt="夏季连衣裙" class="w-full h-full object-cover">
                            </div> -->
                            <!-- 产品图片3 -->
                            <div class="bg-white rounded-lg overflow-hidden shadow-lg">
                                <img src="../public/02.jpg" alt="商务休闲装" class="w-full h-full object-cover">

                            </div>
                        </div>

                        <!-- 右侧JCPenney品牌区域 -->
                        <div class="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-12 text-center text-white">
                            <div class="mb-8">
                                <h3 class="text-4xl font-bold mb-4">JCPenney</h3>
                                <p class="text-lg opacity-90">美国知名零售品牌·30年专业经验</p>
                            </div>
                            <button
                                class="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                探索更多
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 特色产品区域 -->
            <section class="py-16 bg-white/10 backdrop-blur-sm">
                <div class="max-w-7xl mx-auto px-4">
                    <h3 class="text-3xl font-bold text-white text-center mb-12">热门产品</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div v-for="product in featuredProducts" :key="product.id"
                            class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                            <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover">
                            <div class="p-4">
                                <h4 class="font-semibold text-gray-800 mb-2">{{ product.name }}</h4>
                                <p class="text-red-600 font-bold text-lg">${{ product.price }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- 页脚 -->
        <footer class="bg-black/20 backdrop-blur-sm text-white py-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <p>&copy; 2024 Catalyst Brands. 保留所有权利。</p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 特色产品数据
const featuredProducts = ref([
    {
        id: 1,
        name: '时尚上衣',
        price: 89.99,
        image: '01.jpg'

    },
    {
        id: 2,
        name: '夏季连衣裙',
        price: 129.99,
        image: '01.jpg'
    },
    {
        id: 3,
        name: '商务衬衫',
        price: 79.99,
        image: '01.jpg'
    },
    {
        id: 4,
        name: '休闲裤装',
        price: 99.99,
        image: '01.jpg'
    }
])

// 页面加载时的初始化
onMounted(() => {
    console.log('首页已加载')
})
</script>

<style scoped>
/* 自定义样式 */
.backdrop-blur-sm {
    backdrop-filter: blur(4px);
}

/* 渐变动画 */
@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.bg-gradient-to-br {
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
}
</style>