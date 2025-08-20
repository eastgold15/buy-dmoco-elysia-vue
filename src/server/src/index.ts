import Elysia from "elysia";

import { envConfig } from './config/env'
import { categoriesRoute } from './routes/categories';
import { productsRoute } from './routes/products';
import { siteConfigRoute } from './routes/site-config';
import { layoutRoute } from './routes/layout';
import { advertisementsRoute } from './routes/advertisements';
import { uploadRoute } from './routes/upload';
import { err_handler } from "./utils/err.global";
import { swaggerPlugin } from "./plugins/swagger";
import { logPlugin } from "./plugins/logger";

export const api = new Elysia({ prefix: '/api' })

    .use(swaggerPlugin)
    .use(logPlugin)

    .get('/', "hello world")


    // 使用模块化路由
    .use(categoriesRoute)
    .use(productsRoute)
    .use(siteConfigRoute)
    .use(layoutRoute)
    .use(advertisementsRoute)
    .use(uploadRoute)


    //全局错误
    .use(err_handler)


console.log('🦊 Elysia is running at http://localhost:' + envConfig.get('APP_PORT'));
console.log('📚 API Documentation: http://localhost:' + envConfig.get('APP_PORT') + '/swagger');
