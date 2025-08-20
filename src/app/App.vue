<script setup>
import { ref } from 'vue';
import CategoryNav from './components/CategoryNav.vue';
import Drawer from 'primevue/drawer';
import Button from 'primevue/button';

const isMobileMenuOpen = ref(false);
const currentLanguage = ref('中文');
const isUserLoggedIn = ref(false);

const toggleMobileMenu = () => {
	isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
 
const closeMobileMenu = () => {
	isMobileMenuOpen.value = false;
};

const switchLanguage = () => {
	currentLanguage.value = currentLanguage.value === '中文' ? 'English' : '中文';
};

const toggleFavorites = () => {
	// TODO: 实现收藏功能
	console.log('切换收藏');
};

const handleLogin = () => {
	// TODO: 实现登录功能
	console.log('处理登录');
};
</script>

<template>
	<div class="w-full h-full">
		<!-- 网站头部 -->
		<header class="w-full">
			<!-- 顶部信息栏 -->

			<div class=" w-full flex  flex-justify-between">
				<div class="px-4">
					<span class="shipping-info">FREE SHIPPING on orders over $59* details</span>
				</div>
				<div class="px-4">
					<a href="#" class="px-2">Track Order</a>
					<a href="#" class="px-2	">Help</a>
				</div>
			</div>

			<!-- 主要头部区域 -->
			<div class="header-main">
				<div class="container">
					<!-- 桌面端布局 -->
					<div class="md:flex  flex-justify-around">
						<!-- 左侧：语言切换 -->


						<div class="header-left">
							<button @click="switchLanguage" class="language-btn">
								<div class="i-ic:baseline-g-translate"></div>
								<span>{{ currentLanguage }}</span>
								<div class="i-ic:baseline-keyboard-arrow-down"></div>
							</button>
						</div>

						<!-- 中间：Logo -->
						<div class="header-center">
							<RouterLink to="/" class="logo-link">
								<h1 class="logo-text">外贸商城</h1>
							</RouterLink>
						</div>

						<!-- 右侧：搜索、收藏、登录、购物袋 -->
						<div class="header-right">
							<!-- 搜索框 -->
							<div class="search-box">
								<input type="text" placeholder="搜索商品..." class="search-input">
								<button class="search-btn">
									<div class="i-ic:baseline-search"></div>
								</button>
							</div>

							<!-- 功能按钮组 -->
							<div class="action-buttons">
								<!-- 收藏 -->
								<button @click="toggleFavorites" class="action-btn" title="收藏">
									<div class="i-ic:baseline-favorite-border"></div>
								</button>

								<!-- 登录/用户信息 -->
								<button @click="handleLogin" class="action-btn" :title="isUserLoggedIn ? '用户中心' : '登录'">
									<div :class="isUserLoggedIn ? 'i-ic:baseline-person' : 'i-ic:baseline-login'"></div>
								</button>

								<!-- 购物袋 -->
								<button class="cart-btn">
									<div class="i-ic:baseline-shopping-bag"></div>
									<span class="cart-count">0</span>
								</button>
							</div>
						</div>
					</div>

					<!-- 移动端布局 -->
					<div class="header-content mobile-header flex md:hidden">
						<!-- 左侧：菜单按钮 -->
						<div class="mobile-left">
							<button @click="toggleMobileMenu" class="mobile-menu-btn">
								<div class="i-ic:baseline-menu"></div>
							</button>
						</div>

						<!-- 中间：Logo和搜索 -->
						<div class="mobile-center">
							<RouterLink to="/" class="mobile-logo-link">
								<h1 class="mobile-logo-text">外贸商城</h1>
							</RouterLink>
							<div class="mobile-search-box">
								<input type="text" placeholder="搜索..." class="mobile-search-input">
								<button class="mobile-search-btn">
									<div class="i-ic:baseline-search"></div>
								</button>
							</div>
						</div>

						<!-- 右侧：购物袋 -->
						<div class="mobile-right">
							<button class="mobile-cart-btn">
								<div class="i-ic:baseline-shopping-bag"></div>
								<span class="mobile-cart-count">0</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</header>

		<!-- 分类导航 - 桌面版 -->
		<div class="hidden md:block">
			<CategoryNav />
		</div>



		<!-- <Button icon="pi pi-plus" @click="toggleMobileMenu" /> -->

		<Drawer v-model:visible="isMobileMenuOpen">
			<template #header>
				<div class="flex items-center gap-2">
					<h3 class="text-lg font-semibold text-gray-800">商品分类</h3>
				</div>
			</template>
			<!-- 移动端分类菜单 -->
			<div class="overflow-y-auto h-full pb-20">
				<CategoryNav :is-mobile="true" @category-selected="closeMobileMenu" />
			</div>
			<template #footer>
				<div class="flex items-center gap-2">
					<Button label="Account" icon="pi pi-user" class="flex-auto" variant="outlined"></Button>
					<Button label="Logout" icon="pi pi-sign-out" class="flex-auto" severity="danger" text></Button>
				</div>
			</template>
		</Drawer>



		<!-- 主要内容区域 -->
		<main class="main-content">
			<Suspense>
				<template #default>
					<RouterView />
				</template>
				<template #fallback>
					<div class="loading-container">
						<div class="loading-spinner">
							<i class="pi pi-spin pi-spinner"></i>
							<span>Loading...</span>
						</div>
					</div>
				</template>
			</Suspense>
		</main>

		<!-- 网站底部 -->
		<footer class="site-footer">
			<div class="container">
				<div class="footer-content">
					<div class="footer-section">
						<h4>For You</h4>
						<ul>
							<li><a href="#">Favorites</a></li>
							<li><a href="#">Gift Cards</a></li>
							<li><a href="#">Afterpay</a></li>
						</ul>
					</div>

					<div class="footer-section">
						<h4>Connect with Us</h4>
						<ul>
							<li><a href="#">Back to top</a></li>
						</ul>
					</div>

					<div class="footer-section">
						<h4>Legal</h4>
						<ul>
							<li><a href="#">Terms of Use</a></li>
							<li><a href="#">Privacy & Cookie Policy</a></li>
							<li><a href="#">Text Messaging Terms</a></li>
							<li><a href="#">Bulk Buyer Policy</a></li>
							<li><a href="#">Accessibility</a></li>
						</ul>
					</div>
				</div>

				<div class="footer-bottom">
					<p>© 2024 WWW.APPARELCITY.COM.CN All Rights Reserved 赣ICP备2024041550号-5</p>
				</div>
			</div>
		</footer>
	</div>
</template>

<style scoped>
/* 顶部信息栏样式 */
.shipping-info {
	@apply text-sm text-gray-600;
}

/* 头部主要区域 */
.header-main {
	@apply bg-white shadow-sm border-b border-gray-200 py-4;
}

.container {
	@apply max-w-7xl mx-auto px-4;
}

/* 桌面端头部布局 */
.desktop-header {
	@apply justify-between;
}

.header-left {
	@apply flex items-center;
}

.language-btn {
	@apply flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 bg-transparent border border-gray-300 rounded-lg transition-all duration-200 cursor-pointer;
}

.language-btn div {
	@apply w-4 h-4;
}

/* 中间Logo区域 */
.header-center {
	@apply flex items-center;
}

.logo-link {
	@apply text-decoration-none;
}

.logo-text {
	@apply text-2xl font-bold text-blue-600 m-0;
}

/* 右侧功能区域 */
.header-right {
	@apply flex items-center space-x-4;
}

.search-box {
	@apply flex items-center;
}

.search-input {
	@apply px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64;
}

.search-btn {
	@apply px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200;
}

.search-btn div {
	@apply w-4 h-4;
}

.action-buttons {
	@apply flex items-center space-x-2;
}

.action-btn {
	@apply p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-all duration-200 bg-transparent border-none cursor-pointer;
}

.action-btn div {
	@apply w-5 h-5;
}

.cart-btn {
	@apply relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-all duration-200 bg-transparent border-none cursor-pointer;
}

.cart-btn div {
	@apply w-5 h-5;
}

.cart-count {
	@apply absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center;
}

/* 移动端头部布局 */
.mobile-header {
	@apply items-center justify-between py-2;
}

.mobile-left {
	@apply flex items-center;
}

.mobile-menu-btn {
	@apply p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-all duration-200 bg-transparent border-none cursor-pointer;
}

.mobile-menu-btn div {
	@apply w-6 h-6;
}

.mobile-center {
	@apply flex-1 flex flex-col items-center space-y-2;
}

.mobile-logo-link {
	@apply text-decoration-none;
}

.mobile-logo-text {
	@apply text-xl font-bold text-blue-600 m-0;
}

.mobile-search-box {
	@apply flex items-center w-full max-w-sm;
}

.mobile-search-input {
	@apply flex-1 px-3 py-1.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm;
}

.mobile-search-btn {
	@apply px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200;
}

.mobile-search-btn div {
	@apply w-4 h-4;
}

.mobile-right {
	@apply flex items-center;
}

.mobile-cart-btn {
	@apply relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-all duration-200 bg-transparent border-none cursor-pointer;
}

.mobile-cart-btn div {
	@apply w-5 h-5;
}

.mobile-cart-count {
	@apply absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center;
}

/* 主要内容区域 */
.main-content {
	@apply flex-1 min-h-screen;
}

.loading-container {
	@apply flex items-center justify-center min-h-96;
}

.loading-spinner {
	@apply flex flex-col items-center space-y-2 text-gray-600;
}

/* 底部样式 */
.site-footer {
	@apply bg-gray-800 text-white py-12;
}

.footer-content {
	@apply grid grid-cols-1 md:grid-cols-3 gap-8;
}

.footer-section h4 {
	@apply text-lg font-semibold mb-4;
}

.footer-section ul {
	@apply list-none p-0 m-0;
}

.footer-section li {
	@apply mb-2;
}

.footer-section a {
	@apply text-gray-300 hover:text-white transition-colors duration-200 text-decoration-none;
}

.footer-bottom {
	@apply mt-8 pt-8 border-t border-gray-700 text-center text-gray-400;
}
</style>