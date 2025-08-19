import { adapter } from "@domcojs/vercel";
import vue from "@vitejs/plugin-vue";
import { domco } from "domco";
import UnoCSS from 'unocss/vite';
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		vue(),
		UnoCSS(), // 添加UnoCSS插件
		domco({ adapter: adapter() })
	],
});
