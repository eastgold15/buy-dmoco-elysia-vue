// Elysia + Drizzle 统一响应格式工具文件

import { type TSchema, t } from "elysia";

export const Meta = t.Object({
	total: t.Number(),
	page: t.Number(),
	pageSize: t.Number(),
	totalPages: t.Number(),
});

/**
 * 工厂函数 构建通用返回类型
 * @param dataSchema 数据类型
 * @returns
 */
export const commonResSchema = <T extends TSchema>(dataSchema: T) => {
	return t.Object({
		code: t.Number(),
		message: t.String(),
		data: dataSchema,
	});
};

export const pageResSchema = <T extends TSchema>(dataSchema: T) => {
	return t.Object({
		code: t.Number(),
		message: t.String(),
		data: t.Object({
			items: t.MaybeEmpty(t.Array(dataSchema)),
			meta: Meta,
		}),
	});
};

// 成功响应函数
export function commonRes<T>(
	data: T,
	code = 200,
	message = "操作成功",
): {
	code: number;
	message: string;
	data: T;
} {
	return {
		code,
		message,
		data,
	};
}

// 分页响应函数
export function pageRes<T>(
	data: T[],
	total: number,
	page = 1,
	pageSize = 10,
	message = "获取成功",
) {
	return commonRes(
		{
			items: data,
			meta: {
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize),
			},
		},
		200,
		message,
	);
}
