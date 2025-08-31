import { adapter } from "@domcojs/vercel";
import vue from "@vitejs/plugin-vue";
import { domco } from "domco";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import { envConfig } from "./src/server/src/config/env";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
export default defineConfig({
	plugins: [
		vue(),
		UnoCSS(), // 添加UnoCSS插件
		domco({ adapter: adapter() }),
		Components({
			resolvers: [PrimeVueResolver()],
		}),
	],
	server: {
		port: Number(envConfig.get("APP_PORT")) || 3000,
	},
});
