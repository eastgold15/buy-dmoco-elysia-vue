import { treaty } from "@elysiajs/eden";
import type { EndApp } from "@/server/+app";

// 在客户端使用当前域名和端口
const baseUrl =
	typeof window !== "undefined"
		? `${window.location.protocol}//${window.location.host}`
		: "http://localhost:9004";

// 创建Eden Treaty客户端
const client = treaty<EndApp>(baseUrl);

// 导出客户端实例
export { client };
