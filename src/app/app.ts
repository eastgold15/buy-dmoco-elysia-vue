import App from "@/app/App.vue";

import { createSSRApp } from "vue";
import HomeView from "./pages/HomeView.vue";
import CountView from "./pages/CountView.vue";
import {
	createMemoryHistory,
	createRouter,
	createWebHistory,
} from "vue-router";

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

	return { app, router };
};