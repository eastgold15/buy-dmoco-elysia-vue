import Elysia from "elysia";

import { envConfig } from "./config/env";
import { authPlugin, oauthPlugin } from "./plugins";
import { logPlugin } from "./plugins/logger";
import { swaggerPlugin } from "./plugins/swagger";
import { advertisementsRoute } from "./routes/advertisements";
import { authRoute } from "./routes/auth";
import { categoriesRoute } from "./routes/categories";
import { imagesRoute } from "./routes/images";
import { ordersRoute } from "./routes/orders";
import { partnersRoute } from "./routes/partners";
import { productsRoute } from "./routes/products";
import { siteConfigsRoute } from "./routes/siteConfigs";
import { statisticsRoute } from "./routes/statistics";
import { uploadRoute } from "./routes/upload";
import { usersRoute } from "./routes/users";
import { err_handler } from "./utils/err.global";

export const api = new Elysia({ prefix: "/api" })

	.use(swaggerPlugin)
	.use(logPlugin)
	.use(authPlugin) // 认证插件
	.use(oauthPlugin) // OAuth 插件
	// 使用模块化路由
	.use(authRoute) // 认证路由
	.use(categoriesRoute)
	.use(productsRoute)
	.use(siteConfigsRoute)

	.use(advertisementsRoute)
	.use(uploadRoute)
	.use(imagesRoute)
	.use(ordersRoute)
	.use(usersRoute)
	.use(statisticsRoute)
	.use(partnersRoute)

	//全局错误
	.use(err_handler);

console.log(
	`🦊 Elysia is running at http://localhost:${envConfig.get("APP_PORT")}`,
);
console.log(
	"📚 API Documentation: http://localhost:" +
		envConfig.get("APP_PORT") +
		"/swagger",
);
