import { Elysia } from 'elysia';
import { db } from '../db/connection';
import { headerConfig as headerConfigSchema, footerConfig as footerConfigSchema } from '../db/schema';
import { eq } from 'drizzle-orm';
import { commonRes } from '../plugins/Res';
import { layoutsModel, type HeaderConfig, type FooterConfig, type FooterSection } from './layouts.model';

export const layoutsRoute = new Elysia({ tags: ['Layouts'] })
	.model(layoutsModel)
	// 获取顶部配置
	.get('/layouts/header', async () => {
		try {
			const configs = await db.select().from(headerConfigSchema)
				.where(eq(headerConfigSchema.isActive, true))
				.limit(1);

			const headerConfig = configs[0] || null;
			return commonRes(headerConfig, 200, '获取顶部配置成功');
		} catch (error) {
			console.error('获取顶部配置失败:', error);
			return commonRes(null, 500, '获取顶部配置失败');
		}
	}, {
		detail: {
			tags: ['Layouts'],
			summary: '获取顶部配置',
			description: '获取当前激活的顶部配置信息'
		}
	})

	// 更新顶部配置
	.put('/layouts/header', async ({ body }) => {
		try {
			const data = body

			// 先检查是否存在配置
			const existingConfigs = await db.select().from(headerConfigSchema)
				.where(eq(headerConfigSchema.isActive, true))
				.limit(1);

			let headerConfig;

			if (existingConfigs.length > 0) {
				// 更新现有配置
				const [updated] = await db.update(headerConfigSchema)
					.set({
						...data,
						updatedAt: new Date()
					})
					.where(eq(headerConfigSchema.id, existingConfigs[0].id))
					.returning();

				headerConfig = updated;
			} else {
				// 创建新配置
				const [created] = await db.insert(headerConfigSchema)
					.values(data)
					.returning();

				headerConfig = created;
			}

			return commonRes(headerConfig, 200, '更新顶部配置成功');
		} catch (error) {
			console.error('更新顶部配置失败:', error);
			return commonRes(null, 500, '更新顶部配置失败');
		}
	}, {
		body: 'UpdateHeaderConfigDto',
		detail: {
			tags: ['Layouts'],
			summary: '更新顶部配置',
			description: '更新或创建顶部配置信息'
		}
	})

	// 获取所有底部配置
	.get('/layouts/footer', async () => {
		try {
			const footerConfigs = await db.select().from(footerConfigSchema)
				.where(eq(footerConfigSchema.isActive, true))
				.orderBy(footerConfigSchema.sortOrder, footerConfigSchema.id);

			return commonRes(footerConfigs, 200, '获取底部配置成功');
		} catch (error) {
			console.error('获取底部配置失败:', error);
			return commonRes(null, 500, '获取底部配置失败');
		}
	}, {
		detail: {
			tags: ['Layouts'],
			summary: '获取底部配置',
			description: '获取所有激活的底部配置信息'
		}
	})

	// 获取分组的底部配置
	.get('/layouts/footer/sections', async () => {
		try {
			const configs = await db.select().from(footerConfigSchema)
				.where(eq(footerConfigSchema.isActive, true))
				.orderBy(footerConfigSchema.sortOrder, footerConfigSchema.id);

			// 按分区标题分组
			const sections: { [key: string]: FooterSection } = {};

			configs.forEach(config => {
				if (!sections[config.sectionTitle]) {
					sections[config.sectionTitle] = {
						sectionTitle: config.sectionTitle,
						links: []
					};
				}

				sections[config.sectionTitle].links.push({
					text: config.linkText,
					url: config.linkUrl
				});
			});

			const footerSections = Object.values(sections);
			return commonRes(footerSections, 200, '获取底部分区配置成功');
		} catch (error) {
			console.error('获取底部分区配置失败:', error);
			return commonRes(null, 500, '获取底部分区配置失败');
		}
	})

	// 创建底部配置
	.post('/layouts/footer', async ({ body }) => {
		try {
			const data = body
			const [created] = await db.insert(footerConfigSchema)
				.values(data)
				.returning();

			return commonRes(created, 201, '创建底部配置成功');
		} catch (error) {
			console.error('创建底部配置失败:', error);
			return commonRes(null, 500, '创建底部配置失败');
		}
	}, {
		body: 'CreateFooterConfigDto',
		detail: {
			tags: ['Layouts'],
			summary: '创建底部配置',
			description: '创建新的底部配置项'
		}
	})

	// 更新底部配置
	.put('/layouts/footer/:id', async ({ params: { id }, body }) => {
		try {
			const data = body
			const [updated] = await db.update(footerConfigSchema)
				.set({
					...data,
					updatedAt: new Date()
				})
				.where(eq(footerConfigSchema.id, parseInt(id)))
				.returning();

			if (!updated) {
				return commonRes(null, 404, '底部配置不存在');
			}

			return commonRes(updated, 200, '更新底部配置成功');
		} catch (error) {
			console.error('更新底部配置失败:', error);
			return commonRes(null, 500, '更新底部配置失败');
		}
	}, {
		params: 'IdParams',
		body: 'UpdateFooterConfigDto',
		detail: {
			tags: ['Layouts'],
			summary: '更新底部配置',
			description: '更新指定的底部配置项'
		}
	})

	// 删除底部配置
	.delete('/layouts/footer/:id', async ({ params: { id } }) => {
		try {
			const [deleted] = await db.update(footerConfigSchema)
				.set({ isActive: false, updatedAt: new Date() })
				.where(eq(footerConfigSchema.id, parseInt(id)))
				.returning();

			if (!deleted) {
				return commonRes(null, 404, '底部配置不存在');
			}

			return commonRes(null, 200, '删除底部配置成功');
		} catch (error) {
			console.error('删除底部配置失败:', error);
			return commonRes(null, 500, '删除底部配置失败');
		}
	}, {
		params: 'IdParams',
		detail: {
			tags: ['Layouts'],
			summary: '删除底部配置',
			description: '删除指定的底部配置项'
		}
	})

	// 获取完整的布局配置
	.get('/layouts/config', async () => {
		try {
			// 获取顶部配置
			const headerConfigs = await db.select().from(headerConfigSchema)
				.where(eq(headerConfigSchema.isActive, true))
				.limit(1);

			// 获取底部配置并分组
			const footerConfigs = await db.select().from(footerConfigSchema)
				.where(eq(footerConfigSchema.isActive, true))
				.orderBy(footerConfigSchema.sortOrder, footerConfigSchema.id);

			// 按分区标题分组
			const sections: { [key: string]: FooterSection } = {};

			footerConfigs.forEach(config => {
				if (!sections[config.sectionTitle]) {
					sections[config.sectionTitle] = {
						sectionTitle: config.sectionTitle,
						links: []
					};
				}

				sections[config.sectionTitle].links.push({
					text: config.linkText,
					url: config.linkUrl
				});
			});

			const footer = Object.values(sections);

			// 如果没有顶部配置，创建默认配置
			let header = headerConfigs[0];
			if (!header) {
				const [created] = await db.insert(headerConfigSchema)
					.values({
						shippingText: "FREE SHIPPING on orders over $59* details",
						trackOrderText: "Track Order",
						helpText: "Help",
						trackOrderUrl: "#",
						helpUrl: "#",
						isActive: true
					})
					.returning();
				header = created;
			}

			const layoutConfig = {
				header,
				footer
			};

			return commonRes(layoutConfig, 200, '获取布局配置成功');
		} catch (error) {
			console.error('获取布局配置失败:', error);
			return commonRes(null, 500, '获取布局配置失败');
		}
	})

	// 初始化默认底部配置
	.post('/layouts/footer/initialize', async () => {
		try {
			const existingConfigs = await db.select().from(footerConfigSchema)
				.where(eq(footerConfigSchema.isActive, true));

			if (existingConfigs.length === 0) {
				// 创建默认底部配置
				const defaultConfigs = [
					// For You 分区
					{ sectionTitle: "For You", linkText: "Favorites", linkUrl: "/favorites", sortOrder: 1 },
					{ sectionTitle: "For You", linkText: "Gift Cards", linkUrl: "/gift-cards", sortOrder: 2 },
					{ sectionTitle: "For You", linkText: "Afterpay", linkUrl: "/afterpay", sortOrder: 3 },

					// Connect with Us 分区
					{ sectionTitle: "Connect with Us", linkText: "Back to top", linkUrl: "#top", sortOrder: 4 },

					// Legal 分区
					{ sectionTitle: "Legal", linkText: "Terms of Use", linkUrl: "/terms", sortOrder: 5 },
					{ sectionTitle: "Legal", linkText: "Privacy & Cookie Policy", linkUrl: "/privacy", sortOrder: 6 },
					{ sectionTitle: "Legal", linkText: "Text Messaging Terms", linkUrl: "/text-terms", sortOrder: 7 },
					{ sectionTitle: "Legal", linkText: "Bulk Buyer Policy", linkUrl: "/bulk-buyer", sortOrder: 8 },
					{ sectionTitle: "Legal", linkText: "Accessibility", linkUrl: "/accessibility", sortOrder: 9 },
					{ sectionTitle: "Legal", linkText: "Do Not Sell or Share My Personal Information", linkUrl: "/privacy-rights", sortOrder: 10 }
				];

				for (const config of defaultConfigs) {
					await db.insert(footerConfigSchema)
						.values(config);
				}

				return commonRes(null, 201, '初始化默认底部配置成功');
			} else {
				return commonRes(null, 200, '底部配置已存在，无需初始化');
			}
		} catch (error) {
			console.error('初始化默认底部配置失败:', error);
			return commonRes(null, 500, '初始化默认底部配置失败');
		}
	});