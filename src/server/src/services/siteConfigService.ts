import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { siteConfigSchema } from '../db/schema/schema';
import type { SiteConfig, CreateSiteConfigRequest, UpdateSiteConfigRequest } from '../types/siteConfig';

// 数据库类型到业务类型的转换
function dbSiteConfigToSiteConfig(dbConfig: any): SiteConfig {
  return {
    id: dbConfig.id.toString(),
    key: dbConfig.key,
    value: dbConfig.value,
    description: dbConfig.description,
    category: dbConfig.category,
    createdAt: dbConfig.createdAt,
    updatedAt: dbConfig.updatedAt
  };
}

export class SiteConfigService {
  // 获取所有配置
  static async getAllConfigs(): Promise<SiteConfig[]> {
    try {
      const dbConfigs = await db.select().from(siteConfigSchema);
      return dbConfigs.map(dbSiteConfigToSiteConfig);
    } catch (error) {
      console.error('获取网站配置失败:', error);
      throw new Error('获取网站配置失败');
    }
  }

  // 根据分类获取配置
  static async getConfigsByCategory(category: string): Promise<SiteConfig[]> {
    try {
      const dbConfigs = await db.select()
        .from(siteConfigSchema)
        .where(eq(siteConfigSchema.category, category));
      return dbConfigs.map(dbSiteConfigToSiteConfig);
    } catch (error) {
      console.error('根据分类获取配置失败:', error);
      throw new Error('根据分类获取配置失败');
    }
  }

  // 根据键获取配置
  static async getConfigByKey(key: string): Promise<SiteConfig | null> {
    try {
      const dbConfig = await db.select()
        .from(siteConfigSchema)
        .where(eq(siteConfigSchema.key, key))
        .limit(1);
      
      return dbConfig.length > 0 ? dbSiteConfigToSiteConfig(dbConfig[0]) : null;
    } catch (error) {
      console.error('根据键获取配置失败:', error);
      throw new Error('根据键获取配置失败');
    }
  }

  // 创建配置
  static async createConfig(data: CreateSiteConfigRequest): Promise<SiteConfig> {
    try {
      const newConfig = await db.insert(siteConfigSchema)
        .values({
          key: data.key,
          value: data.value,
          description: data.description,
          category: data.category || 'general'
        })
        .returning();
      
      return dbSiteConfigToSiteConfig(newConfig[0]);
    } catch (error) {
      console.error('创建配置失败:', error);
      throw new Error('创建配置失败');
    }
  }

  // 更新配置
  static async updateConfig(key: string, data: UpdateSiteConfigRequest): Promise<SiteConfig | null> {
    try {
      const updatedConfig = await db.update(siteConfigSchema)
        .set({
          value: data.value,
          description: data.description,
          category: data.category,
          updatedAt: new Date()
        })
        .where(eq(siteConfigSchema.key, key))
        .returning();
      
      return updatedConfig.length > 0 ? dbSiteConfigToSiteConfig(updatedConfig[0]) : null;
    } catch (error) {
      console.error('更新配置失败:', error);
      throw new Error('更新配置失败');
    }
  }

  // 删除配置
  static async deleteConfig(key: string): Promise<boolean> {
    try {
      const result = await db.delete(siteConfigSchema)
        .where(eq(siteConfigSchema.key, key));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('删除配置失败:', error);
      throw new Error('删除配置失败');
    }
  }

  // 批量更新配置
  static async updateMultipleConfigs(configs: { key: string; value: string }[]): Promise<boolean> {
    try {
      // 使用事务批量更新
      await db.transaction(async (tx) => {
        for (const config of configs) {
          await tx.update(siteConfigSchema)
            .set({
              value: config.value,
              updatedAt: new Date()
            })
            .where(eq(siteConfigSchema.key, config.key));
        }
      });
      
      return true;
    } catch (error) {
      console.error('批量更新配置失败:', error);
      throw new Error('批量更新配置失败');
    }
  }

  // 初始化默认配置
  static async initializeDefaultConfigs(): Promise<void> {
    try {
      const defaultConfigs = [
        { key: 'site_name', value: '外贸服装商城', description: '网站名称', category: 'general' },
        { key: 'site_logo', value: '', description: '网站Logo URL', category: 'general' },
        { key: 'site_keywords', value: '外贸,服装,时尚,购物', description: '网站关键词', category: 'seo' },
        { key: 'site_description', value: '专业的外贸服装购物平台', description: '网站描述', category: 'seo' },
        { key: 'icp_number', value: '', description: 'ICP备案号', category: 'legal' },
        { key: 'copyright', value: '© 2024 外贸服装商城 All Rights Reserved', description: '版权信息', category: 'legal' },
        { key: 'contact_email', value: '', description: '联系邮箱', category: 'contact' },
        { key: 'contact_phone', value: '', description: '联系电话', category: 'contact' },
        { key: 'free_shipping_threshold', value: '59', description: '免费配送门槛', category: 'shipping' },
        { key: 'currency', value: 'USD', description: '货币单位', category: 'general' }
      ];

      for (const config of defaultConfigs) {
        const existing = await this.getConfigByKey(config.key);
        if (!existing) {
          await this.createConfig(config);
        }
      }
    } catch (error) {
      console.error('初始化默认配置失败:', error);
      throw new Error('初始化默认配置失败');
    }
  }
}