import { eq } from "drizzle-orm";
import { Elysia, status, t } from "elysia";
import { db } from "../db/connection";
import { siteConfigSchema } from "../db/schema";
import { commonRes } from "../plugins/Res";
import { siteConfigsModel } from "./siteConfigs.model";

export const siteConfigsRoute = new Elysia({ prefix: "siteConfigs", tags: ["站点配置"] })
	.model(siteConfigsModel)
	// 获取所有配置
	.get(
		"/",
		async () => {
			try {
				const dbConfigs = await db.select().from(siteConfigSchema);
				return commonRes(dbConfigs, 200);
			} catch (error) {
				console.error("获取网站配置失败:", error);
				return commonRes(null, 500, "获取网站配置失败");
			}
		},
		{
			detail: {
				tags: ["SiteConfigs"],
				summary: "获取所有配置",
				description: "获取所有网站配置信息",
			},
		},
	)

	// 根据分类获取配置
	.get(
		"/category/:category",
		async ({ params: { category } }) => {
			try {
				const dbConfigs = await db
					.select()
					.from(siteConfigSchema)
					.where(eq(siteConfigSchema.category, category))


				return commonRes(dbConfigs, 200);
			} catch (error) {
				return status(500, "根据分类获取配置失败");
			}
		},
		{
			params: t.Object({
				category: t.String(),
			}),
			detail: {
				tags: ["SiteConfigs"],
				summary: "根据分类获取配置",
				description: "根据分类获取网站配置信息",
			},
		},
	)

	// 根据键获取配置
	.get(
		"/:key",
		async ({ params: { key } }) => {
			try {
				const [dbConfig] = await db
					.select()
					.from(siteConfigSchema)
					.where(eq(siteConfigSchema.key, key))
					.limit(1);

				if (!dbConfig) {
					return commonRes(null, 404, "配置不存在");
				}

				return commonRes(dbConfig, 200);
			} catch (error) {
				console.error("根据键获取配置失败:", error);
				return commonRes(null, 500, "根据键获取配置失败");
			}
		},
		{
			params: t.Object({
				key: t.String(),
			}),
			detail: {
				tags: ["SiteConfigs"],
				summary: "根据键获取配置",
				description: "根据配置键获取特定配置信息",
			},
		},
	)

	// 创建配置
	.post(
		"/",
		async ({ body }) => {
			try {
				const data = body as any;
				const [newConfig] = await db
					.insert(siteConfigSchema)
					.values({
						key: data.key,
						value: data.value,
						description: data.description,
						category: data.category || "general",
					})
					.returning();

				return commonRes(newConfig, 201);
			} catch (error) {
				console.error("创建配置失败:", error);
				return commonRes(null, 500, "创建配置失败");
			}
		},
		{
			body: "CreateSiteConfigDto",
			detail: {
				tags: ["SiteConfigs"],
				summary: "创建配置",
				description: "创建新的网站配置项",
			},
		},
	)

	// 更新配置
	.put(
		"/:key",
		async ({ params: { key }, body }) => {
			try {
				const data = body as any;
				const [updatedConfig] = await db
					.update(siteConfigSchema)
					.set({
						value: data.value,
						description: data.description,
						category: data.category,
						updatedAt: new Date(),
					})
					.where(eq(siteConfigSchema.key, key))
					.returning();

				if (!updatedConfig) {
					return commonRes(null, 404, "配置不存在");
				}

				return commonRes(updatedConfig, 200);
			} catch (error) {
				console.error("更新配置失败:", error);
				return commonRes(null, 500, "更新配置失败");
			}
		},
		{
			params: "KeyParams",
			body: "UpdateSiteConfigDto",
			detail: {
				tags: ["SiteConfigs"],
				summary: "更新配置",
				description: "根据键更新特定配置项",
			},
		},
	)

	// 删除配置
	.delete(
		"/:key",
		async ({ params: { key } }) => {
			try {
				const [result] = await db
					.delete(siteConfigSchema)
					.where(eq(siteConfigSchema.key, key))
					.returning({ id: siteConfigSchema.id });

				console.log(result);

				return commonRes(result, 200, "删除成功");
			} catch (error) {
				console.error("删除配置失败:", error);
				return commonRes(null, 500, "删除配置失败");
			}
		},
		{
			params: t.Object({
				key: t.String(),
			}),
			detail: {
				tags: ["SiteConfigs"],
				summary: "删除配置",
				description: "根据键删除特定配置项",
			},
		},
	)

	// // 初始化默认配置
	// .post(
	// 	"/initialize",
	// 	async () => {
	// 		try {
	// 			const defaultConfigs = webConfig;

	// 			for (const config of defaultConfigs) {
	// 				// 检查配置是否已存在
	// 				const [existing] = await db
	// 					.select()
	// 					.from(siteConfigSchema)
	// 					.where(eq(siteConfigSchema.key, config.key))
	// 					.limit(1);

	// 				if (!existing) {
	// 					await db.insert(siteConfigSchema).values(config);
	// 				}
	// 			}

	// 			return commonRes({ success: true, message: "默认配置初始化完成" }, 200);
	// 		} catch (error) {
	// 			console.error("初始化默认配置失败:", error);
	// 			return commonRes(null, 500, "初始化默认配置失败");
	// 		}
	// 	},
	// 	{
	// 		detail: {
	// 			tags: ["SiteConfigs"],
	// 			summary: "初始化默认配置",
	// 			description: "初始化网站的默认配置项",
	// 		},
	// 	},
	// )

	// 批量更新配置
	.patch(
		"/batch",
		async ({ body }) => {
			try {
				const updateData = body;

				// 批量更新配置
				for (const config of updateData) {
					await db
						.update(siteConfigSchema)
						.set({
							value: config.value,
							description: config.description,
							category: config.category,
							updatedAt: new Date(),
						})
						.where(eq(siteConfigSchema.key, config.key));
				}

				return commonRes(null, 200, "批量更新配置成功");
			} catch (error) {
				console.error("批量更新配置失败:", error);
				return commonRes(null, 500, "批量更新配置失败");
			}
		},
		{
			body: "BatchUpdateSiteConfigDto",
			detail: {
				tags: ["SiteConfigs"],
				summary: "批量更新配置",
				description: "批量更新网站配置项",
			},
		},
	);
