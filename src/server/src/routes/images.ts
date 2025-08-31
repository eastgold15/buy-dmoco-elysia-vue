/**
 * 图片管理路由
 * 提供图片列表、详情、管理等功能
 */

import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { Elysia, status, t } from "elysia";
import { nanoid } from "nanoid";
import { db } from "../db/connection";
import { imagesSchema } from "../db/schema";
import { commonRes, pageRes } from "../plugins/Res";
import { imageRouteModel, type UpdateImageDto } from "./images.model";
import { ossService } from "./oss";

// 图片状态枚举
const ImageStatus = {
	ACTIVE: 1,
	DISABLED: 0,
} as const;

export const imagesRoute = new Elysia({ prefix: "/images" })
	.model(imageRouteModel)

	// 获取图片列表
	.get("/", async ({ query }) => {
		try {
			const { page, pageSize, search, category, sortBy = "uploadDate", sortOrder = "desc" } = query;

			// 构建查询条件
			const conditions = [];
			if (search) {
				conditions.push(
					or(
						like(imagesSchema.fileName, `%${search}%`),
						like(imagesSchema.originalName, `%${search}%`),
						like(imagesSchema.altText, `%${search}%`),
					)
				);
			}
			if (category) {
				conditions.push(eq(imagesSchema.category, category));
			}

			// 排序配置
			const allowedSortFields = {
				id: imagesSchema.id,
				fileName: imagesSchema.fileName,
				createdAt: imagesSchema.createdAt,
				updatedAt: imagesSchema.updatedAt,
				fileSize: imagesSchema.fileSize,
			};

			const sortField = allowedSortFields[sortBy as keyof typeof allowedSortFields] || imagesSchema.createdAt;
			const sortOrderValue = sortOrder === "desc" ? desc(sortField) : asc(sortField);

			const queryBuilder = db
				.select()
				.from(imagesSchema)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(sortOrderValue);

			// 分页处理
			if (page && pageSize) {
				const offsetValue = ((Number(page) || 1) - 1) * pageSize;
				queryBuilder.limit(pageSize).offset(offsetValue);
			}

			// 获取总数查询
			const totalQuery = db
				.select({ value: count() })
				.from(imagesSchema)
				.where(conditions.length > 0 ? and(...conditions) : undefined);

			const [data, totalResult] = await Promise.all([
				queryBuilder,
				totalQuery
			]);

			return page
				? pageRes(data, totalResult[0]?.value || 0, page, pageSize, "获取图片列表成功")
				: commonRes(data, 200, "获取图片列表成功");
		} catch (error) {
			console.error("获取图片列表失败:", error);
			return commonRes(null, 500, "获取图片列表失败");
		}
	}, {
		query: "ImageListQueryDto",
		detail: {
			tags: ["Images"],
			summary: "获取图片列表",
			description: "分页获取图片列表，支持搜索、分类筛选和排序",
		},
	})

	// 根据ID获取图片详情
	.get("/:id", async ({ params: { id }, status }) => {
		try {
			const image = await db
				.select()
				.from(imagesSchema)
				.where(eq(imagesSchema.id, id))
				.limit(1);

			if (image.length === 0) {
				return status(404, "图片不存在");
			}

			return commonRes(image[0], 200, "获取图片详情成功");
		} catch (error) {
			console.error("获取图片详情失败:", error);
			return status(500, "获取图片详情失败");
		}
	}, {
		params: "IdParams",
		detail: {
			tags: ["Images"],
			summary: "获取图片详情",
			description: "根据ID获取图片详细信息",
		},
	})

	// // 创建图片记录
	// .post("/", async ({ body }) => {
	// 	try {
	// 		const {
	// 			fileName,
	// 			originalName,
	// 			url,
	// 			category,
	// 			fileSize,
	// 			mimeType,
	// 			altText,
	// 		} = body;

	// 		const imageId = nanoid();
	// 		const now = new Date().toISOString();

	// 		const newImage = {
	// 			id: imageId,
	// 			fileName,
	// 			originalName,
	// 			url,
	// 			category,
	// 			fileSize,
	// 			mimeType,
	// 			altText: altText || "",
	// 			uploadDate: now,
	// 			updatedDate: now,
	// 		};

	// 		await db.insert(imagesSchema).values(newImage);

	// 		return commonRes(newImage, 201, "创建图片记录成功");
	// 	} catch (error) {
	// 		console.error("创建图片记录失败:", error);
	// 		return commonRes(null, 500, "创建图片记录失败");
	// 	}
	// }, {
	// 	body: "CreateImageDto",
	// 	detail: {
	// 		tags: ["Images"],
	// 		summary: "创建图片记录",
	// 		description: "在数据库中创建新的图片记录",
	// 	},
	// })

	// 更新图片信息
	.put("/:id", async ({ params: { id }, body, status }) => {
		try {
			// 检查图片是否存在
			const existingImage = await db
				.select()
				.from(imagesSchema)
				.where(eq(imagesSchema.id, +id))
				.limit(1);

			if (existingImage.length === 0) {
				return status(404, "图片不存在");
			}

			const updateData: Record<string, any> = Object.fromEntries(Object.entries(body).filter(([_, value]) => {
				return value !== undefined && value !== null
			}))




			await db.update(imagesSchema).set(updateData).where(eq(imagesSchema.id, +id));

			// 获取更新后的图片信息
			const updatedImage = await db
				.select()
				.from(imagesSchema)
				.where(eq(imagesSchema.id, +id))
				.limit(1);

			return commonRes(updatedImage[0], 200, "更新图片信息成功");
		} catch (error) {
			console.error("更新图片信息失败:", error);
			return status(500, "更新图片信息失败");
		}
	}, {
		params: "IdParams",
		body: "UpdateImageDto",
		detail: {
			tags: ["Images"],
			summary: "更新图片信息",
			description: "更新图片的基本信息",
		},
	})

	// 删除单个图片
	.delete("/:id", async ({ params: { id }, status }) => {
		try {
			// 获取图片信息
			const image = await db
				.select()
				.from(imagesSchema)
				.where(eq(imagesSchema.id, +id))
				.limit(1);

			if (!image[0]) {
				return status(404, "图片不存在");
			}

			const imageData = image[0];

			try {
				// 从OSS删除文件
				const key = imageData.url.split("/").slice(-3).join("/");
				console.log('key:', key)

				await ossService.deleteFile(key);
			} catch (ossError) {
				console.warn("从OSS删除文件失败:", ossError);
				// 继续删除数据库记录，即使OSS删除失败
			}

			// 从数据库删除记录
			await db.delete(imagesSchema).where(eq(imagesSchema.id, +id));

			return commonRes({ deletedId: id }, 200, "删除图片成功");
		} catch (error) {
			console.error("删除图片失败:", error);
			return status(500, "删除图片失败");
		}
	}, {
		params: "IdParams",
		detail: {
			tags: ["Images"],
			summary: "删除图片",
			description: "删除指定的图片记录和文件",
		},
	})

	// 批量删除图片
	.delete("/batch", async ({ body: { imageIds } }) => {
		try {


			if (!imageIds || imageIds.length === 0) {
				return commonRes(null, 400, "请提供要删除的图片ID列表");
			}

			// 获取要删除的图片信息
			const imagesToDelete = await db
				.select()
				.from(imagesSchema)
				.where(inArray(imagesSchema.id, imageIds));

			if (imagesToDelete.length === 0) {
				return commonRes(null, 404, "没有找到要删除的图片");
			}

			// 从OSS删除文件
			const deletePromises = imagesToDelete.map(async (image) => {
				try {
					const key = image.url.split("/").slice(-3).join("/");
					await ossService.deleteFile(key);
				} catch (ossError) {
					console.warn(`从OSS删除文件失败 ${image.id}:`, ossError);
					// 继续删除数据库记录，即使OSS删除失败
				}
			});

			await Promise.allSettled(deletePromises);

			// 从数据库删除记录
			await db.delete(imagesSchema).where(inArray(imagesSchema.id, imageIds));

			return commonRes({
				deletedCount: imagesToDelete.length,
				deletedIds: imageIds,
			}, 200, "批量删除图片成功");
		} catch (error) {
			console.error("批量删除图片失败:", error);
			return commonRes(null, 500, "批量删除图片失败");
		}
	}, {
		body: "BatchDeleteImageDto",
		detail: {
			tags: ["Images"],
			summary: "批量删除图片",
			description: "批量删除多个图片记录和文件",
		},
	})

	// 获取图片统计信息
	.get("/stats/overview", async () => {
		try {
			// 总图片数
			const totalImagesResult = await db
				.select({ value: count() })
				.from(imagesSchema);

			// 按分类统计
			const categoryStats = await db
				.select({
					category: imagesSchema.category,
					count: count(),
				})
				.from(imagesSchema)
				.groupBy(imagesSchema.category);

			// 计算总文件大小
			const sizeResult = await db
				.select({ fileSize: imagesSchema.fileSize })
				.from(imagesSchema);

			const totalSize = sizeResult.reduce(
				(sum, item) => sum + (item.fileSize || 0),
				0,
			);

			return commonRes({
				totalImages: totalImagesResult[0]?.value || 0,
				totalSize,
				categoryStats: categoryStats.map((stat) => ({
					category: stat.category,
					count: stat.count,
				})),
			}, 200, "获取图片统计信息成功");
		} catch (error) {
			console.error("获取图片统计失败:", error);
			return commonRes(null, 500, "获取图片统计失败");
		}
	}, {
		detail: {
			tags: ["Images"],
			summary: "获取图片统计信息",
			description: "获取图片的统计概览信息",
		},
	})

// // 生成预签名URL
// .post("/presigned-url", async ({ body }) => {
// 	try {
// 		const { fileName, category = "general" } = body;

// 		// 生成唯一的文件名
// 		const timestamp = Date.now();
// 		const randomStr = Math.random().toString(36).substring(2, 8);
// 		const fileExtension = fileName.split(".").pop();
// 		const uniqueFileName = `${timestamp}_${randomStr}.${fileExtension}`;
// 		const key = `${category}/${uniqueFileName}`;

// 		// 生成预签名URL
// 		const presignedUrl = await ossService.generatePresignedUploadUrl(
// 			key,
// 			3600,
// 			"application/octet-stream",
// 		); // 1小时有效期
// 		const publicUrl = ossService.getPublicUrl(key);

// 		return commonRes({
// 			presignedUrl,
// 			publicUrl,
// 			key,
// 			fileName: uniqueFileName,
// 		}, 200, "生成预签名URL成功");
// 	} catch (error) {
// 		console.error("生成预签名URL失败:", error);
// 		return commonRes(null, 500, "生成预签名URL失败");
// 	}
// }, {
// 	body: "PresignedUrlRequestDto",
// 	detail: {
// 		tags: ["Images"],
// 		summary: "获取预签名上传URL",
// 		description: "获取用于直接上传到OSS的预签名URL",
// 	},
// })

// // 确认文件上传完成
// .post("/confirm-upload", async ({ body }) => {
// 	try {
// 		const { key, originalName, category, fileSize, mimeType, altText } = body;

// 		// 检查文件是否存在
// 		const exists = await ossService.fileExists(key);
// 		if (!exists) {
// 			return commonRes(null, 400, "文件上传未完成或不存在");
// 		}

// 		// 获取文件信息
// 		const fileStats = await ossService.getFileStats(key);
// 		const publicUrl = ossService.getPublicUrl(key);

// 		// 创建数据库记录
// 		const imageId = nanoid();
// 		const now = new Date().toISOString();
// 		const fileName = key.split("/").pop() || originalName;

// 		const newImage = {
// 			id: imageId,
// 			fileName,
// 			originalName,
// 			url: publicUrl,
// 			category,
// 			fileSize: fileStats?.size || fileSize,
// 			mimeType,
// 			altText: altText || "",
// 			uploadDate: now,
// 			updatedDate: now,
// 		};

// 		await db.insert(imagesSchema).values(newImage);

// 		return commonRes(newImage, 201, "确认文件上传成功");
// 	} catch (error) {
// 		console.error("确认文件上传失败:", error);
// 		return commonRes(null, 500, "确认文件上传失败");
// 	}
// }, {
// 	body: "ConfirmUploadDto",
// 	detail: {
// 		tags: ["Images"],
// 		summary: "确认上传完成",
// 		description: "确认文件上传完成并创建数据库记录",
// 	},
// });
