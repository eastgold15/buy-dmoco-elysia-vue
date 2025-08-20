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
import 'primeicons/primeicons.css';
import 'virtual:uno.css';
import CountView from "./pages/test.vue";
import HomeView from "./pages/HomeView.vue";
import ProductDetail from "./pages/ProductDetail.vue";
import CategoryManagement from "./pages/admin/CategoryManagement.vue";


export const createApp = async () => {
	const app = createSSRApp(App);




	const router = createRouter({
		history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
		routes: [
			{
				path: "/",
				name: "home",
				component: HomeView,
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
				path: "/admin/categories",
				name: "category-management",
				component: CategoryManagement,
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

	return { app, router };
};
