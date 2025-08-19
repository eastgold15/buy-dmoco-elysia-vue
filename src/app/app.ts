import App from "@/app/App.vue";

import { createSSRApp } from "vue";
import {
	createMemoryHistory,
	createRouter,
	createWebHistory,
} from "vue-router";

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import 'virtual:uno.css';
import CountView from "./pages/test.vue";
import HomeView from "./pages/HomeView.vue";


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
		],
	});

	app.use(router);
	app.use(PrimeVue, {
		theme: {
			preset: Aura
		}
	});

	return { app, router };
};
