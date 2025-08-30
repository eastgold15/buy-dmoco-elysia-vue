import { t } from "elysia";

// 支持的图片类型
export const SUPPORTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
];

// 最大文件大小 (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 文件上传响应类型
export interface UploadResponse {
	success: boolean;
	message: string;
	url?: string;
	fileName?: string;
	error?: string;
}

// 文件上传模型定义
export const uploadModel = {
	// 文件上传请求参数
	FilesUploadDto: t.Object({
		files: t.Files({
			type: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
			maxSize: 5 * 1024 * 1024, // 5MB
		}),
	}),

	// 文件上传请求参数
	FileUploadDto: t.Object({
		file: t.File({
			type: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
			maxSize: 5 * 1024 * 1024, // 5MB
		}),
	}),

	// 文件上传请求参数
	CommonFileUploadDto: t.Object({
		file: t.File({
			type: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
			maxSize: 5 * 1024 * 1024, // 5MB
		})
	}),

};

