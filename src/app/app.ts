import App from "@/app/App.vue";

import { createSSRApp } from "vue";
import {
	createMemoryHistory,
	createRouter,
	createWebHistory,
} from "vue-router";

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import 'primeicons/primeicons.css';
import 'virtual:uno.css';
import CountView from "./pages/test.vue";
import Home from "./pages/Home.vue";
import HomeView from "./pages/HomeView.vue";
import ProductDetail from "./pages/ProductDetail.vue";
import CategoryManagement from "./pages/admin/CategoryManagement.vue";
import SiteConfig from "./pages/admin/SiteConfig.vue";
import HeaderConfig from "./pages/admin/HeaderConfig.vue";
import FooterConfig from "./pages/admin/FooterConfig.vue";
import AdvertisementManagement from "./pages/admin/AdvertisementManagement.vue";
import ImageManager from "./pages/admin/ImageManager.vue";
import Search from "./pages/Search.vue";
import Index from "./pages/index.vue";

export const createApp = async () => {
	const app = createSSRApp(App);
	const router = createRouter({
		history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
		routes: [
			{
				path: "/",
				name: "index",
				component: Index,
			},
			{
				path: "/home",
				name: "home",
				component: Home,
			},
			{
				path: "/counter",
				name: "counter",
				component: CountView,
			},
			{
				path: "/product/:id",
				name: "product-detail",
				component: ProductDetail,
			},
			{
				path: "/search",
				name: "search",
				component: Search,
			},
			{
				path: "/admin/categories",
				name: "category-management",
				component: CategoryManagement,
			},
			{
				path: "/admin/settings",
				name: "site-config",
				component: SiteConfig,
			},
			{
				path: "/admin/header-config",
				name: "header-config",
				component: HeaderConfig,
			},
			{
				path: "/admin/footer-config",
				name: "footer-config",
				component: FooterConfig,
			},
			{
				path: "/admin/advertisements",
				name: "admin-advertisements",
				component: AdvertisementManagement,
			},
			{
				path: "/admin/images",
				name: "image-manager",
				component: ImageManager,
			},
		],
	});

	app.use(router);
	app.use(PrimeVue, {
		theme: {
			preset: Aura
		}
	});
	app.use(ConfirmationService);
	app.use(ToastService);
	app.directive('tooltip', Tooltip);
	app.component('ProgressSpinner', ProgressSpinner);
	app.component('Button', Button);

	return { app, router };
};
