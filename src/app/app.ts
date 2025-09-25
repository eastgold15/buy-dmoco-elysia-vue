import Aura from "@primeuix/themes/aura";
import Button from "primevue/button";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ProgressSpinner from "primevue/progressspinner";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import { createSSRApp } from "vue";
import {
	createMemoryHistory,
	createRouter,
	createWebHistory,
} from "vue-router";
import App from "@/app/App.vue";
import "primeicons/primeicons.css";
import "virtual:uno.css";
// 组件将通过 unplugin-vue-components 自动导入，无需手动导入


export const createApp = async () => {
	const app = createSSRApp(App);
	const router = createRouter({
		history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
		routes: [
			// 首页重定向
			{
				path: "/",
				redirect: "/home",
			},
			// 登录页面（无布局）
			{
				path: "/login",
				name: "login",
				component: () => import("./pages/Login.vue"),
			},
			// 注册页面（无布局）
			{
				path: "/register",
				name: "register",
				component: () => import("./pages/Register.vue"),
			},
			// OAuth 回调页面（无布局）
			{
				path: "/auth/callback",
				name: "auth-callback",
				component: () => import("./pages/AuthCallback.vue"),
			},
			{
				path: "/",
				component: () => import("./layouts/ClientLayout.vue"),
				children: [
					{
						path: "home",
						name: "home",
						component: () => import("./pages/Home.vue"),
					},
					{
						path: "product/:id",
						name: "product-detail",
						component: () => import("./pages/ProductDetail.vue"),
					},
					{
						path: "search",
						name: "search",
						component: () => import("./pages/Search.vue"),
					},
				],
			},
			// 管理端路由（使用AdminLayout布局）
			{
				path: "/admin",
				component: () => import("./layouts/AdminLayout.vue"),
				children: [
					{
						path: "",
						redirect: "/admin/dashboard",
					},
					{
						path: "dashboard",
						name: "dashboard",
						component: () => import("./pages/admin/Dashboard.vue"),
					},
					{
						path: "TestToast",
						name: "TestToast",
						component: () => import("./pages/admin/TestToast.vue"),
					},
					{
						path: "products",
						name: "products-management",
						component: () => import("./pages/admin/ProductsManagement.vue"),
					},
					{
						path: "products/add",
						name: "add-product",
						component: () => import("./pages/admin/AddProduct.vue"),
					},
					{
						path: "orders",
						name: "orders-management",
						component: () => import("./pages/admin/OrdersManagement.vue"),
					},
					{
						path: "refunds",
						name: "refunds-management",
						component: () => import("./pages/admin/RefundsManagement.vue"),
					},
					{
						path: "users",
						name: "users-management",
						component: () => import("./pages/admin/UsersManagement.vue"),
					},
					{
						path: "admins",
						name: "admins-management",
						component: () => import("./pages/admin/AdminsManagement.vue"),
					},
					{
						path: "categories",
						name: "category-management",
						component: () => import("./pages/admin/CategoryManagement.vue"),
					},
					{
						path: "partners",
						name: "partners-management",
						component: () => import("./pages/admin/PartnersManagement.vue"),
					},
					{
						path: "settings",
						name: "site-config",
						component: () => import("./pages/admin/SiteConfig.vue"),
					},

					{
						path: "advertisements",
						name: "admin-advertisements",
						component: () => import("./pages/admin/AdvertisementManagement.vue"),
					},
					{
						path: "images",
						name: "image-manager",
						component: () => import("./pages/admin/ImageManager.vue"),
					},
					{
						path: "media",
						name: "media-manager",
						component: () => import("./pages/admin/MediaManage.vue"),
					},
					{
						path: "payment-settings",
						name: "payment-settings",
						component: () => import("./pages/admin/PaymentSettings.vue"),
					},
					{
						path: "shipping-settings",
						name: "shipping-settings",
						component: () => import("./pages/admin/ShippingSettings.vue"),
					},
					{
						path: "sales-reports",
						name: "sales-reports",
						component: () => import("./pages/admin/SalesReports.vue"),
					},
					{
						path: "users-reports",
						name: "users-reports",
						component: () => import("./pages/admin/UsersReports.vue"),
					},
				],
			},
		],
	});

	app.use(router);
	app.use(PrimeVue, {
		theme: {
			preset: Aura,
			options: {
				darkModeSelector: ".dark",
			},
		},
	});
	app.use(ConfirmationService);
	app.use(ToastService);
	app.directive("tooltip", Tooltip);
	app.component("ProgressSpinner", ProgressSpinner);
	app.component("Button", Button)
	return { app, router };
};
