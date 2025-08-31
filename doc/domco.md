创建新项目
首先，您需要在计算机上安装 Node、Bun 或 Deno。然后运行下面的脚本以创建一个新项目。如果您已经有一个现有的客户端 Vite 项目想要添加服务器，请查看迁移说明。create

npm create domco@latest
切入点
Domco 按文件名标识应用程序的入口点。这些入口点带有 前缀，以便于识别。+

+应用程序
应用程序入口点位于 中，这是应用程序的服务器入口点。src/server/

src/
└── server/
	└── +app.(js,ts,jsx,tsx)
该模块导出一个对象，其中包含一个接收 Request 的函数，并返回一个 Response。+appdefaultfetch

// src/server/+app
export default {
	fetch(req: Request) {
		return new Response("Hello world");
	},
};
从这里，您可以根据 req.url 将不同的请求路由到不同的响应。

// src/server/+app
export default {
	fetch(req: Request) {
		const url = new URL(req.url);
		if (url.pathname === "/") {
			return new Response("Hello");
		} else if (url.pathname === "/world") {
			return new Response("World");
		}
		return new Response("Not found");
	},
};
或者，您可以使用 Fetch API 兼容路由器，例如 Hono。大多数路由器都提供了一个 or 方法来处理生产中的请求，您可以将其传递到导出中。fetchhandlerdefault

// src/server/+app
import { Hono } from "hono";
const app = new Hono();
// pass to the default export
export default { fetch: app.fetch };
// or if the method is named `fetch`, export directly
export default app;
+页面
要创建页面，请在 中的目录中添加文件。+page.htmlsrc/client/

domco 将 Vite 配置为自动将每个入口点作为单独的入口点进行处理。这些页面中链接的所有内容都将在运行时捆绑并包含在输出中。您可以通过 client：page 虚拟模块提供页面的转换内容。+page.htmlvite build

src/
├── client/
│	└── +page.html
└── server/
	└── +app.ts
+脚本
其中的每个文件都将被 Vite 作为入口点处理。客户端脚本可以通过标签在页面中使用，也可以在没有页面的服务器上使用 client：script 虚拟模块。+script.(js,ts,jsx,tsx)src/client/script

src/
├── client/
│	└── +script.ts
└── server/
	└── +app.ts
虚拟模块
全栈开发和服务器端渲染的一个挑战性方面是在开发和生产过程中正确管理客户端文件。在开发中，您需要直接链接到源文件，才能受益于 TypeScript 支持和热模块替换 （HMR） 等功能。在生产环境中，构建过程会转换每个文件，并将哈希值应用于文件名以进行缓存。

Domco 使用虚拟模块解决这些问题。您可以轻松地在响应中提供 a 或包含 a 的标签。Domco 确保在开发和生产过程中链接正确的资产。+page+script

客户端：page
您可以从此模块或其子路径之一导入任何转换后的 HTML。domco 在导入的页面上调用 Vite 的 transformIndexHtml 钩子，并将其内联到您的服务器包中。+page.html

// src/server/+app
// returns transformed content of `src/client/+page.html`
import { html } from "client:page";
// `src/client/other/+page.html`
import { html as otherHtml } from "client:page/other";
export default {
	fetch(req: Request) {
		return new Response(
			html, // bundled client application
			{ headers: { "content-type": "text/html" } },
		);
	},
};
您还可以将链接的 JS 入口点的信息导入到页面。这包含 client：script 提供的相同数据。chunk

import { chunk } from "client:page";
chunk.src.assets; // ex: assets might contain a font path you want to preload
客户端：脚本
您还可以轻松获取服务器上任何模块的 和 相关标签。这些标签可以通过虚拟模块访问。它们可以包含在 HTML 字符串中，也可以包含在 JSX 中。<script><link>+scriptclient:script

在开发中，domco 将脚本链接到源代码。在生产中，domco 读取客户端构建生成的清单，并包括这些文件名及其导入的哈希版本。

// src/server/+app
import {
	// arrays of the hashed related paths for the entry point.
	src,
	// string of <script> and <link> tags for related resources
	tags,
} from "client:script";
// `src/client/other/+script.ts`
import { tags as otherTags } from "client:script/other";
export default {
	fetch(req: Request) {
		return new Response(
			`<!doctype html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					${tags}
					<title>Document</title>
				</head>
				...
			</html>`,
			{ headers: { "content-type": "text/html" } },
		);
	},
};
预渲染
将属性添加到导出到预渲染路由。可以是要预渲染的路径或路径，也可以是返回路径的函数。prerenderdefaultprerenderArraySet

// src/server/+app
export default {
	fetch(req) {
		//...
	},
	prerender: ["/", "/post-1", "/post-2", "/some.css", "/some.json"],
};
Vite 构建完成后，domco 将从您的应用程序导入并向提供的每个路径发出请求。响应将在生成时写入文件。如果路径没有扩展名，则会添加到文件路径的末尾。default.fetchdefault.prerenderdist/client/(path)/index.html

对于上述导出，domco 将请求每个路径并从响应中生成以下文件。

预渲染路径（Prerender Path）	创建的文件
/	dist/client/index.html
/post-1	dist/client/post-1/index.html
/post-2	dist/client/post-2/index.html
/some.css	dist/client/some.css
/some.json	dist/client/some.json
如果您使用的是适配器，则这些静态文件将在处理程序前面提供。因此，当找到路由的文件时，它会直接提供，而不会点击您的获取处理程序。fetchindex.html