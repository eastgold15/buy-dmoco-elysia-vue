import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection';
import { headerConfigSchema, footerConfigSchema } from '../db/schema/schema';
import type {
	HeaderConfig,
	FooterConfig,
	FooterSection,
	UpdateHeaderConfigRequest,
	CreateFooterConfigRequest,
	UpdateFooterConfigRequest,
	LayoutConfigResponse
} from '../types/layout';

/**
 * 布局配置服务类
 * 处理顶部和底部配置的数据库操作
 */
export class LayoutService {
	/**
	 * 获取顶部配置
	 */
	static async getHeaderConfig(): Promise<HeaderConfig | null> {
		try {
			const configs = await db.select().from(headerConfigSchema)
				.where(eq(headerConfigSchema.isActive, true))
				.limit(1);
			
			return configs[0] || null;
		} catch (error) {
			console.error('获取顶部配置失败:', error);
			throw error;
		}
	}

	/**
	 * 更新顶部配置
	 */
	static async updateHeaderConfig(data: UpdateHeaderConfigRequest): Promise<HeaderConfig> {
		try {
			// 先检查是否存在配置
			const existingConfig = await this.getHeaderConfig();
			
			if (existingConfig) {
				// 更新现有配置
				const updated = await db.update(headerConfigSchema)
					.set({
						...data,
						updatedAt: new Date()
					})
					.where(eq(headerConfigSchema.id, existingConfig.id))
					.returning();
				
				return updated[0];
			} else {
				// 创建新配置
				const created = await db.insert(headerConfigSchema)
					.values(data)
					.returning();
				
				return created[0];
			}
		} catch (error) {
			console.error('更新顶部配置失败:', error);
			throw error;
		}
	}

	/**
	 * 获取所有底部配置
	 */
	static async getFooterConfigs(): Promise<FooterConfig[]> {
		try {
			return await db.select().from(footerConfigSchema)
				.where(eq(footerConfigSchema.isActive, true))
				.orderBy(footerConfigSchema.sortOrder, footerConfigSchema.id);
		} catch (error) {
			console.error('获取底部配置失败:', error);
			throw error;
		}
	}

	/**
	 * 获取分组的底部配置
	 */
	static async getFooterSections(): Promise<FooterSection[]> {
		try {
			const configs = await this.getFooterConfigs();
			
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
			
			return Object.values(sections);
		} catch (error) {
			console.error('获取底部分区配置失败:', error);
			throw error;
		}
	}

	/**
	 * 创建底部配置
	 */
	static async createFooterConfig(data: CreateFooterConfigRequest): Promise<FooterConfig> {
		try {
			const created = await db.insert(footerConfigSchema)
				.values(data)
				.returning();
			
			return created[0];
		} catch (error) {
			console.error('创建底部配置失败:', error);
			throw error;
		}
	}

	/**
	 * 更新底部配置
	 */
	static async updateFooterConfig(id: number, data: UpdateFooterConfigRequest): Promise<FooterConfig> {
		try {
			const updated = await db.update(footerConfigSchema)
				.set({
					...data,
					updatedAt: new Date()
				})
				.where(eq(footerConfigSchema.id, id))
				.returning();
			
			if (updated.length === 0) {
				throw new Error('底部配置不存在');
			}
			
			return updated[0];
		} catch (error) {
			console.error('更新底部配置失败:', error);
			throw error;
		}
	}

	/**
	 * 删除底部配置
	 */
	static async deleteFooterConfig(id: number): Promise<boolean> {
		try {
			const deleted = await db.update(footerConfigSchema)
				.set({ isActive: false, updatedAt: new Date() })
				.where(eq(footerConfigSchema.id, id))
				.returning();
			
			return deleted.length > 0;
		} catch (error) {
			console.error('删除底部配置失败:', error);
			throw error;
		}
	}

	/**
	 * 获取完整的布局配置
	 */
	static async getLayoutConfig(): Promise<LayoutConfigResponse> {
		try {
			const [header, footer] = await Promise.all([
				this.getHeaderConfig(),
				this.getFooterSections()
			]);
			
			// 如果没有顶部配置，创建默认配置
			const headerConfig = header || await this.updateHeaderConfig({
				shippingText: "FREE SHIPPING on orders over $59* details",
				trackOrderText: "Track Order",
				helpText: "Help",
				trackOrderUrl: "#",
				helpUrl: "#",
				isActive: true
			});
			
			return {
				header: headerConfig,
				footer
			};
		} catch (error) {
			console.error('获取布局配置失败:', error);
			throw error;
		}
	}

	/**
	 * 初始化默认底部配置
	 */
	static async initializeDefaultFooterConfig(): Promise<void> {
		try {
			const existingConfigs = await this.getFooterConfigs();
			
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
					await this.createFooterConfig(config);
				}
			}
		} catch (error) {
			console.error('初始化默认底部配置失败:', error);
			throw error;
		}
	}
}