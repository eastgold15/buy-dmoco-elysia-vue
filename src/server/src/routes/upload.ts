import { Elysia, status } from "elysia";
import { commonRes } from "../plugins/Res";
import { handleUploadError } from "../utils/errorHandler";
import { ossService } from "./oss";
import {
	MAX_FILE_SIZE,
	SUPPORTED_IMAGE_TYPES,
	uploadModel,
} from "./upload.model";
import { imagesSchema } from "../db/schema";
import { db } from "../db/connection";
export const uploadRoute = new Elysia({ prefix: "/upload", tags: ["Upload"] })
	.model(uploadModel)
	// 上传广告图片
	.post(
		"/advertisement",
		async ({ body: { file }, status }) => {
			try {
				if (!file) {
					return status(400, "没有上传文件");
				}
				// 读取文件内容并上传到OSS
				const fileBuffer = await file.arrayBuffer();
				const buffer = new Uint8Array(fileBuffer);

				const imageUrl = await ossService.uploadImage(
					buffer,
					"advertisements",
					file.name,
				);

				// 返回文件URL
				return commonRes(
					{
						url: imageUrl,
						fileName: file.name,
					},
					200,
					"文件上传成功",
				);
			} catch (error) {
				return handleUploadError(error);
			}
		},
		{
			body: "FileUploadDto",
			detail: {
				tags: ["Upload"],
				summary: "上传广告图片",
				description: "上传广告图片到OSS存储",
			},
		},
	)

	// 上传商品图片
	.post(
		"/product",
		async ({ body: { files } }) => {
			try {
				if (!files) {
					return status(400, "没有上传文件");
				}

				// 处理单个文件或多个文件，统一转换为数组
				const fileArray = Array.isArray(files) ? files : [files];
				const uploadResults = [];

				for (const file of fileArray) {


					// 读取文件内容并上传到OSS
					const fileBuffer = await file.arrayBuffer();
					const buffer = new Uint8Array(fileBuffer);

					const imageUrl = await ossService.uploadImage(
						buffer,
						"products",
						file.name,
					);

					uploadResults.push({
						url: imageUrl,
						fileName: file.name,
					});
				}

				// 返回文件URL数组
				return commonRes(
					{
						urls: uploadResults.map((result) => result.url),
						files: uploadResults,
					},
					200,
					`成功上传 ${uploadResults.length} 个文件`,
				);
			} catch (error) {
				return handleUploadError(error);
			}
		},
		{
			body: "FilesUploadDto",
			detail: {
				tags: ["Upload"],
				summary: "上传商品图片",
				description: "上传商品图片到OSS存储",
			},
		},
	)

	// 上传分类图片
	.post(
		"/category",
		async ({ body: { file } }) => {
			try {
				// 读取文件内容并上传到OSS
				const fileBuffer = await file.arrayBuffer();
				const buffer = new Uint8Array(fileBuffer);

				const imageUrl = await ossService.uploadImage(
					buffer,
					"categories",
					file.name,
				);

				// 返回文件URL
				return commonRes(
					{
						url: imageUrl,
						fileName: file.name,
					},
					200,
					"文件上传成功",
				);
			} catch (error) {
				return handleUploadError(error);
			}
		},
		{
			body: "FileUploadDto",
			detail: {
				tags: ["Upload"],
				summary: "上传分类图片",
				description: "上传分类图片到OSS存储",
			},
		},
	)

	// 上传通用图片
	.post(
		"/general/:folder",
		async ({ body: { file }, params: { folder } }) => {
			try {
				// 读取文件内容并上传到OSS
				const fileBuffer = await file.arrayBuffer();
				const buffer = new Uint8Array(fileBuffer);

				const imageUrl = await ossService.uploadImage(
					buffer,
					folder,
					file.name,
				);

				// 保存图片结果到数据库
				await db.insert(imagesSchema).values({
					url: imageUrl,
					fileName: file.name,
					originalName: file.name,
					category: folder,
					fileSize: file.size,
					mimeType: file.type,
					updatedDate: new Date(),
				});

				// 返回文件URL
				return commonRes(
					{
						url: imageUrl,
						fileName: file.name,
					},
					200,
					"文件上传成功",
				);
			} catch (error) {
				return handleUploadError(error);
			}
		},
		{
			body: "CommonFileUploadDto",
			detail: {
				tags: ["Upload"],
				summary: "上传通用图片",
				description: "上传通用图片到OSS存储",
			},
		},
	);
