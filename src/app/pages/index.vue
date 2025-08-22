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

            <!-- 合作伙伴区域 -->
            <section class="py-16 bg-white/10 backdrop-blur-sm">
                <div class="max-w-7xl mx-auto px-4">
                    <h3 class="text-3xl font-bold text-white text-center mb-12">合作伙伴</h3>
                    <div class="space-y-6">
                        <div v-for="partner in partners" :key="partner.id"
                            class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div class="flex flex-col md:flex-row">
                                <!-- 左侧图片 -->
                                <div class="md:w-1/2">
                                    <img :src="partner.image" :alt="partner.name" class="w-full h-64 md:h-48 object-cover">
                                </div>
                                <!-- 右侧内容 -->
                                <div class="md:w-1/2 p-6 flex flex-col justify-center">
                                    <h4 class="text-2xl font-bold text-gray-800 mb-4">{{ partner.name }}</h4>
                                    <p class="text-gray-600 mb-6 leading-relaxed">{{ partner.description }}</p>
                                    <div class="text-center">
                                        <a :href="partner.url" target="_blank" rel="noopener noreferrer"
                                            class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
                                            访问官网
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- 页脚 -->
        <footer class="bg-black/20 backdrop-blur-sm text-white py-12">
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <!-- 公司信息 -->
                    <div>
                        <h4 class="text-xl font-bold mb-4">{{ footerConfig.footer_about_title || '关于我们' }}</h4>
                        <p class="text-gray-300 leading-relaxed">{{ footerConfig.footer_about_content || '专注于外贸服装行业多年，我们拥有丰富的经验和专业的团队。' }}</p>
                    </div>
                    <!-- 联系信息 -->
                    <div>
                        <h4 class="text-xl font-bold mb-4">联系我们</h4>
                        <div class="space-y-2 text-gray-300">
                            <p v-if="footerConfig.footer_company_phone">电话: {{ footerConfig.footer_company_phone }}</p>
                            <p v-if="footerConfig.footer_company_email">邮箱: {{ footerConfig.footer_company_email }}</p>
                            <p v-if="footerConfig.footer_company_address">地址: {{ footerConfig.footer_company_address }}</p>
                        </div>
                    </div>
                    <!-- 社交媒体 -->
                    <div>
                        <h4 class="text-xl font-bold mb-4">关注我们</h4>
                        <div class="flex space-x-4">
                            <a v-if="footerConfig.footer_social_facebook" :href="footerConfig.footer_social_facebook" target="_blank" class="text-gray-300 hover:text-white transition-colors">
                                <i class="fab fa-facebook-f text-xl"></i>
                            </a>
                            <a v-if="footerConfig.footer_social_twitter" :href="footerConfig.footer_social_twitter" target="_blank" class="text-gray-300 hover:text-white transition-colors">
                                <i class="fab fa-twitter text-xl"></i>
                            </a>
                            <a v-if="footerConfig.footer_social_instagram" :href="footerConfig.footer_social_instagram" target="_blank" class="text-gray-300 hover:text-white transition-colors">
                                <i class="fab fa-instagram text-xl"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="border-t border-gray-600 pt-6 text-center">
                    <p class="text-gray-300">&copy; 2024 {{ footerConfig.footer_company_name || 'Catalyst Brands' }}. {{ footerConfig.copyright || '保留所有权利。' }}</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { $fetch } from 'ofetch'

// 合作伙伴数据
const partners = ref([])

// 页脚配置数据
const footerConfig = ref({})

// 加载合作伙伴数据
const loadPartners = async () => {
    try {
        const response = await $fetch('/api/partners/list')
        if (response.success && response.data) {
            partners.value = response.data
        }
    } catch (error) {
        console.error('获取合作伙伴数据失败:', error)
    }
}

// 加载页脚配置数据
const loadFooterConfig = async () => {
    try {
        const response = await $fetch('/api/site-configs/category/footer')
        if (response.success && response.data) {
            // 将配置数组转换为对象，便于模板使用
            const configObj = {}
            response.data.forEach(config => {
                configObj[config.key] = config.value
            })
            footerConfig.value = configObj
        }
    } catch (error) {
        console.error('获取页脚配置失败:', error)
    }
}

// 页面加载时的初始化
onMounted(async () => {
    console.log('首页已加载')
    await Promise.all([
        loadPartners(),
        loadFooterConfig()
    ])
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