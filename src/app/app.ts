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
// 布局组件
import ClientLayout from "./layouts/ClientLayout.vue";
import AdminLayout from "./layouts/AdminLayout.vue";

// 用户端页面
import Index from "./pages/index.vue";
import Home from "./pages/Home.vue";
import ProductDetail from "./pages/ProductDetail.vue";
import Search from "./pages/Search.vue";
import CountView from "./pages/test.vue";

// 管理端页面
import Dashboard from "./pages/admin/Dashboard.vue";
import CategoryManagement from "./pages/admin/CategoryManagement.vue";
import ProductsManagement from "./pages/admin/ProductsManagement.vue";
import AddProduct from "./pages/admin/AddProduct.vue";
import OrdersManagement from "./pages/admin/OrdersManagement.vue";
import UsersManagement from "./pages/admin/UsersManagement.vue";
import AdminsManagement from "./pages/admin/AdminsManagement.vue";
import SiteConfig from "./pages/admin/SiteConfig.vue";
import HeaderConfig from "./pages/admin/HeaderConfig.vue";
import FooterConfig from "./pages/admin/FooterConfig.vue";
import AdvertisementManagement from "./pages/admin/AdvertisementManagement.vue";
import ImageManager from "./pages/admin/ImageManager.vue";
import PartnersManagement from "./pages/admin/PartnersManagement.vue";
import RefundsManagement from "./pages/admin/RefundsManagement.vue";
import PaymentSettings from "./pages/admin/PaymentSettings.vue";
import ShippingSettings from "./pages/admin/ShippingSettings.vue";
import SalesReports from "./pages/admin/SalesReports.vue";
import UsersReports from "./pages/admin/UsersReports.vue";
export const createApp = async () => {
	const app = createSSRApp(App);
	const router = createRouter({
		history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
		routes: [
			// 用户端路由（使用ClientLayout布局）
			{
				path: "/",
				component: Index,
			},
			{
				path: "/",
				component: ClientLayout,
				children: [
					{
						path: "home",
						name: "home",
						component: Home,
					},
					{
						path: "counter",
						name: "counter",
						component: CountView,
					},
					{
						path: "product/:id",
						name: "product-detail",
						component: ProductDetail,
					},
					{
						path: "search",
						name: "search",
						component: Search,
					},
				],
			},
			// 管理端路由（使用AdminLayout布局）
			{
				path: "/admin",
				component: AdminLayout,
				children: [
					{
						path: "",
						redirect: "/admin/dashboard",
					},
					{
						path: "dashboard",
						name: "dashboard",
						component: Dashboard,
					},
					{
						path: "products",
						name: "products-management",
						component: ProductsManagement,
					},
					{
						path: "products/add",
						name: "add-product",
						component: AddProduct,
					},
					{
					path: "orders",
					name: "orders-management",
					component: OrdersManagement,
				},
					{
						path: "refunds",
						name: "refunds-management",
						component: RefundsManagement,
					},
					{
						path: "users",
						name: "users-management",
						component: UsersManagement,
					},
					{
						path: "admins",
						name: "admins-management",
						component: AdminsManagement,
					},
					{
						path: "categories",
						name: "category-management",
						component: CategoryManagement,
					},
					{
						path: "partners",
						name: "partners-management",
						component: PartnersManagement,
					},
					{
						path: "settings",
						name: "site-config",
						component: SiteConfig,
					},
					{
						path: "header-config",
						name: "header-config",
						component: HeaderConfig,
					},
					{
						path: "footer-config",
						name: "footer-config",
						component: FooterConfig,
					},
					{
						path: "advertisements",
						name: "admin-advertisements",
						component: AdvertisementManagement,
					},
					{
						path: "images",
						name: "image-manager",
						component: ImageManager,
					},
					{
						path: "payment-settings",
						name: "payment-settings",
						component: PaymentSettings,
					},
					{
						path: "shipping-settings",
						name: "shipping-settings",
						component: ShippingSettings,
					},
					{
						path: "sales-reports",
						name: "sales-reports",
						component: SalesReports,
					},
					{
						path: "users-reports",
						name: "users-reports",
						component: UsersReports,
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
				darkModeSelector: '.dark',
			}
		}
	});
	app.use(ConfirmationService);
	app.use(ToastService);
	app.directive('tooltip', Tooltip);
	app.component('ProgressSpinner', ProgressSpinner);
	app.component('Button', Button);

	return { app, router };
};
