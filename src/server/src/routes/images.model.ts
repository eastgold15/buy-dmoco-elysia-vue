import { t } from "elysia";
import { DbType } from "../db/database.types";
import { UnoQuery } from "../utils/common.model";

// 图片管理模型定义
export const imageRouteModel = {
	// 创建图片请求参数
	CreateImageDto: DbType.typebox.insert.imagesSchema,

	// 更新图片请求参数
	UpdateImageDto: t.Object({
		fileName: t.Optional(DbType.spreads.insert.imagesSchema.fileName),
		category: DbType.spreads.insert.imagesSchema.category,
		altText: DbType.spreads.insert.imagesSchema.altText,
	}),

	// 图片列表查询参数
	ImageListQueryDto: t.Object({
		...UnoQuery.properties,
		category: t.Optional(t.String()),
		search: t.Optional(t.String()),
		mimeType: t.Optional(t.String()),
	}),

	// 批量删除请求参数
	BatchDeleteImageDto: t.Object({
		imageIds: t.Array(t.Number()),
	}),

	// 预签名URL请求参数
	PresignedUrlDto: t.Object({
		fileName: t.String(),
		category: t.Optional(t.String()),
	}),

	// 确认上传请求参数
	ConfirmUploadDto: t.Object({
		key: t.String(),
		originalName: t.String(),
		category: t.String(),
		fileSize: t.Number(),
		mimeType: t.String(),
		altText: t.Optional(t.String()),
	}),

	// 路径参数
	IdParams: t.Object({
		id: t.String(),
	}),
};

// 导出类型
export type CreateImageDto = typeof imageRouteModel.CreateImageDto;
export type UpdateImageDto = typeof imageRouteModel.UpdateImageDto.static;
export type ImageListQueryDto = typeof imageRouteModel.ImageListQueryDto;
export type BatchDeleteImageDto = typeof imageRouteModel.BatchDeleteImageDto;
export type PresignedUrlDto = typeof imageRouteModel.PresignedUrlDto;
export type ConfirmUploadDto = typeof imageRouteModel.ConfirmUploadDto;
export type IdParams = typeof imageRouteModel.IdParams;
