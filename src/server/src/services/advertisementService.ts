import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import { advertisementsSchema } from '../db/schema/schema';
import type {
	Advertisement,
	CreateAdvertisementRequest,
	UpdateAdvertisementRequest,
	AdvertisementQuery,
	AdvertisementType,
} from '../types/advertisement';

/**
 * 广告服务类
 * 提供广告管理的所有业务逻辑
 */
export class AdvertisementService {
	/**
	 * 获取广告列表
	 * @param query 查询参数
	 * @returns 广告列表和分页信息
	 */
	static async getAdvertisements(query: AdvertisementQuery = {}) {
		try {
			const { type, position, isActive, page = 1, limit = 10 } = query;
			const offset = (page - 1) * limit;

			// 构建查询条件
			const conditions = [];
			if (type) {
				conditions.push(eq(advertisementsSchema.type, type));
			}
			if (position) {
				conditions.push(eq(advertisementsSchema.position, position));
			}
			if (isActive !== undefined) {
				conditions.push(eq(advertisementsSchema.isActive, isActive));
			}

			// 查询广告列表
			const advertisements = await db
				.select()
				.from(advertisementsSchema)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(advertisementsSchema.sortOrder), desc(advertisementsSchema.createdAt))
				.limit(limit)
				.offset(offset);

			// 查询总数
			const [{ count }] = await db
				.select({ count: sql<number>`count(*)` })
				.from(advertisementsSchema)
				.where(conditions.length > 0 ? and(...conditions) : undefined);

			return {
				advertisements,
				total: count,
				page,
				limit,
			};
		} catch (error) {
			console.error('获取广告列表失败:', error);
			throw new Error('获取广告列表失败');
		}
	}

	/**
	 * 根据ID获取广告
	 * @param id 广告ID
	 * @returns 广告信息
	 */
	static async getAdvertisementById(id: number): Promise<Advertisement | null> {
		try {
			const [advertisement] = await db
				.select()
				.from(advertisementsSchema)
				.where(eq(advertisementsSchema.id, id));

			return advertisement || null;
		} catch (error) {
			console.error('获取广告详情失败:', error);
			throw new Error('获取广告详情失败');
		}
	}

	/**
	 * 创建广告
	 * @param data 广告数据
	 * @returns 创建的广告
	 */
	static async createAdvertisement(data: CreateAdvertisementRequest): Promise<Advertisement> {
		try {
			const [advertisement] = await db
				.insert(advertisementsSchema)
				.values({
					title: data.title,
					type: data.type,
					image: data.image,
					link: data.link,
					position: data.position,
					sortOrder: data.sortOrder || 0,
					isActive: data.isActive ?? true,
					startDate: data.startDate,
					endDate: data.endDate,
				})
				.returning();

			return advertisement;
		} catch (error) {
			console.error('创建广告失败:', error);
			throw new Error('创建广告失败');
		}
	}

	/**
	 * 更新广告
	 * @param id 广告ID
	 * @param data 更新数据
	 * @returns 更新后的广告
	 */
	static async updateAdvertisement(id: number, data: UpdateAdvertisementRequest): Promise<Advertisement> {
		try {
			const [advertisement] = await db
				.update(advertisementsSchema)
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where(eq(advertisementsSchema.id, id))
				.returning();

			if (!advertisement) {
				throw new Error('广告不存在');
			}

			return advertisement;
		} catch (error) {
			console.error('更新广告失败:', error);
			throw new Error('更新广告失败');
		}
	}

	/**
	 * 删除广告
	 * @param id 广告ID
	 * @returns 是否删除成功
	 */
	static async deleteAdvertisement(id: number): Promise<boolean> {
		try {
			const [deleted] = await db
				.delete(advertisementsSchema)
				.where(eq(advertisementsSchema.id, id))
				.returning();

			return !!deleted;
		} catch (error) {
			console.error('删除广告失败:', error);
			throw new Error('删除广告失败');
		}
	}

	/**
	 * 切换广告状态
	 * @param id 广告ID
	 * @param isActive 是否激活
	 * @returns 更新后的广告
	 */
	static async toggleAdvertisementStatus(id: number, isActive: boolean): Promise<Advertisement> {
		try {
			const [advertisement] = await db
				.update(advertisementsSchema)
				.set({
					isActive,
					updatedAt: new Date(),
				})
				.where(eq(advertisementsSchema.id, id))
				.returning();

			if (!advertisement) {
				throw new Error('广告不存在');
			}

			return advertisement;
		} catch (error) {
			console.error('切换广告状态失败:', error);
			throw new Error('切换广告状态失败');
		}
	}

	/**
	 * 获取轮播图广告
	 * @returns 激活的轮播图广告列表
	 */
	static async getCarouselAdvertisements(): Promise<Advertisement[]> {
		try {
			const advertisements = await db
				.select()
				.from(advertisementsSchema)
				.where(
					and(
						eq(advertisementsSchema.type, 'carousel'),
						eq(advertisementsSchema.isActive, true)
					)
				)
				.orderBy(desc(advertisementsSchema.sortOrder));

			return advertisements;
		} catch (error) {
			console.error('获取轮播图广告失败:', error);
			throw new Error('获取轮播图广告失败');
		}
	}

	/**
	 * 获取Banner广告
	 * @param position 广告位置
	 * @returns 激活的Banner广告列表
	 */
	static async getBannerAdvertisements(position?: string): Promise<Advertisement[]> {
		try {
			const conditions = [
				eq(advertisementsSchema.type, 'banner'),
				eq(advertisementsSchema.isActive, true),
			];

			if (position) {
				conditions.push(eq(advertisementsSchema.position, position));
			}

			const advertisements = await db
				.select()
				.from(advertisementsSchema)
				.where(and(...conditions))
				.orderBy(desc(advertisementsSchema.sortOrder));

			return advertisements;
		} catch (error) {
			console.error('获取Banner广告失败:', error);
			throw new Error('获取Banner广告失败');
		}
	}

	/**
	 * 更新广告排序
	 * @param id 广告ID
	 * @param sortOrder 排序值
	 * @returns 更新后的广告
	 */
	static async updateAdvertisementSort(id: number, sortOrder: number): Promise<Advertisement> {
		try {
			const [advertisement] = await db
				.update(advertisementsSchema)
				.set({
					sortOrder,
					updatedAt: new Date(),
				})
				.where(eq(advertisementsSchema.id, id))
				.returning();

			if (!advertisement) {
				throw new Error('广告不存在');
			}

			return advertisement;
		} catch (error) {
			console.error('更新广告排序失败:', error);
			throw new Error('更新广告排序失败');
		}
	}
}