import { Elysia } from 'elysia';
import { db } from '../db/connection';
import { siteConfigSchema } from '../db/schema/schema';
import { eq } from 'drizzle-orm';
import { commonRes } from '../plugins/Res';
import { siteConfigsModel } from './siteConfigs.model';

export const siteConfigsRoute = new Elysia({ prefix: '/api' })
    .model(siteConfigsModel)
    // 获取所有配置
    .get('/site-configs', async () => {
        try {
            const dbConfigs = await db.select().from(siteConfigSchema);
            return commonRes(dbConfigs, 200);
        } catch (error) {
            console.error('获取网站配置失败:', error);
            return commonRes(null, 500, '获取网站配置失败');
        }
    }, {
        detail: {
            tags: ['SiteConfigs'],
            summary: '获取所有配置',
            description: '获取所有网站配置信息'
        }
    })
    
    // 根据分类获取配置
    .get('/site-configs/category/:category', async ({ params: { category } }) => {
        try {
            const dbConfigs = await db.select()
                .from(siteConfigSchema)
                .where(eq(siteConfigSchema.category, category));
            return commonRes(dbConfigs, 200);
        } catch (error) {
            console.error('根据分类获取配置失败:', error);
            return commonRes(null, 500, '根据分类获取配置失败');
        }
    }, {
        params: 'CategoryParams',
        detail: {
            tags: ['SiteConfigs'],
            summary: '根据分类获取配置',
            description: '根据分类获取网站配置信息'
        }
    })
    
    // 根据键获取配置
    .get('/site-configs/:key', async ({ params: { key } }) => {
        try {
            const [dbConfig] = await db.select()
                .from(siteConfigSchema)
                .where(eq(siteConfigSchema.key, key))
                .limit(1);
            
            if (!dbConfig) {
                return commonRes(null, 404, '配置不存在');
            }
            
            return commonRes(dbConfig, 200);
        } catch (error) {
            console.error('根据键获取配置失败:', error);
            return commonRes(null, 500, '根据键获取配置失败');
        }
    }, {
        params: 'KeyParams',
        detail: {
            tags: ['SiteConfigs'],
            summary: '根据键获取配置',
            description: '根据配置键获取特定配置信息'
        }
    })
    
    // 创建配置
    .post('/site-configs', async ({ body }) => {
        try {
            const data = body as any;
            const [newConfig] = await db.insert(siteConfigSchema)
                .values({
                    key: data.key,
                    value: data.value,
                    description: data.description,
                    category: data.category || 'general'
                })
                .returning();
            
            return commonRes(newConfig, 201);
        } catch (error) {
            console.error('创建配置失败:', error);
            return commonRes(null, 500, '创建配置失败');
        }
    }, {
        body: 'CreateSiteConfigDto',
        detail: {
            tags: ['SiteConfigs'],
            summary: '创建配置',
            description: '创建新的网站配置项'
        }
    })
    
    // 更新配置
    .put('/site-configs/:key', async ({ params: { key }, body }) => {
        try {
            const data = body as any;
            const [updatedConfig] = await db.update(siteConfigSchema)
                .set({
                    value: data.value,
                    description: data.description,
                    category: data.category,
                    updatedAt: new Date()
                })
                .where(eq(siteConfigSchema.key, key))
                .returning();
            
            if (!updatedConfig) {
                return commonRes(null, 404, '配置不存在');
            }
            
            return commonRes(updatedConfig, 200);
        } catch (error) {
            console.error('更新配置失败:', error);
            return commonRes(null, 500, '更新配置失败');
        }
    })
    
    // 删除配置
    .delete('/site-configs/:key', async ({ params: { key } }) => {
        try {
            const result = await db.delete(siteConfigSchema)
                .where(eq(siteConfigSchema.key, key));
            
            if (result.rowCount === 0) {
                return commonRes(null, 404, '配置不存在');
            }
            
            return commonRes({ success: true }, 200);
        } catch (error) {
            console.error('删除配置失败:', error);
            return commonRes(null, 500, '删除配置失败');
        }
    })
    
    // 批量更新配置
    .patch('/site-configs/batch', async ({ body }) => {
        try {
            const configs = body as { key: string; value: string }[];
            
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
            
            return commonRes({ success: true }, 200);
        } catch (error) {
            console.error('批量更新配置失败:', error);
            return commonRes(null, 500, '批量更新配置失败');
        }
    })
    
    // 初始化默认配置
    .post('/site-configs/initialize', async () => {
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
                // 检查配置是否已存在
                const [existing] = await db.select()
                    .from(siteConfigSchema)
                    .where(eq(siteConfigSchema.key, config.key))
                    .limit(1);
                
                if (!existing) {
                    await db.insert(siteConfigSchema).values(config);
                }
            }
            
            return commonRes({ success: true, message: '默认配置初始化完成' }, 200);
        } catch (error) {
            console.error('初始化默认配置失败:', error);
            return commonRes(null, 500, '初始化默认配置失败');
        }
    });