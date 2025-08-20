import { adapter } from "@domcojs/vercel";
import vue from "@vitejs/plugin-vue";
import { domco } from "domco";
import { config, configDotenv } from "dotenv";
import UnoCSS from 'unocss/vite';
import { defineConfig } from "vite";
import { envConfig } from './src/server/src/config/env'
export default defineConfig({
	plugins: [
		vue(),
		UnoCSS(), // 添加UnoCSS插件
		domco({ adapter: adapter() })
	],
	server: {
		port: envConfig.get('APP_PORT') || 3000,
	},
});
