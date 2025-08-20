//xx.ts
import { and, asc, count, desc, like, or } from "drizzle-orm";
import { db } from "../../db/connection.ts";
import { skillEffectsSchema } from "../../db/schema/schema.ts";

import { authPlugin } from "../../plugins/auth.ts";
import { commonRes, pageRes } from "../../plugins/Res.ts";
import type { ElysiaApp } from "../../server.ts";
import { skillEffectModel } from "./skillEffect.model.ts";

export default (app: ElysiaApp) =>
	app
		.use(authPlugin)
		.model(skillEffectModel)
		.get(
			"/",
			async ({ query: { page, pageSize, sortBy, sortOrder, search } }) => {
				try {
					// 搜索条件：支持技能名称和描述搜索

					const conditions = [];
					if (search) {
						conditions.push(
							or(
								like(skillEffectsSchema.buffName, `%${search}%`),
								like(skillEffectsSchema.description, `%${search}%`),
							),
						);
					}
					// 允许的排序字段
					const allowedSortFields = {
						buffName: skillEffectsSchema.buffName,
						maxFloor: skillEffectsSchema.maxFloor,
						value: skillEffectsSchema.value,
						buffLv: skillEffectsSchema.buffLv,
					};

					// 确定排序字段和方向
					const sortFields =
						allowedSortFields[sortBy as keyof typeof allowedSortFields] ||
						skillEffectsSchema.id;
					const sortOrderValue =
						sortOrder === "desc" ? desc(sortFields) : asc(sortFields);

					// 构建查询
					const queryBuilder = db
						.select()
						.from(skillEffectsSchema)
						.where(conditions.length > 0 ? and(...conditions) : undefined)
						.orderBy(sortOrderValue);

					// 分页处理
					if (page && pageSize) {
						const offsetValue = ((Number(page) || 1) - 1) * pageSize;
						queryBuilder.limit(pageSize).offset(offsetValue);
					}

					// 执行查询
					const result = await queryBuilder;

					// 将negative字段转换为boolean类型
					const transformedResult = result.map((item) => ({
						...item,
						negative: Boolean(item.negative), // 将tinyint转换为boolean
					}));

					// 获取总数
					const total = await db
						.select({ value: count() })
						.from(skillEffectsSchema);

					// 返回结果
					return page
						? pageRes(
							transformedResult,
							total[0]?.value || 0,
							page,
							pageSize,
							"分页获取技能效果成功",
						)
						: commonRes(transformedResult, 200, "获取技能效果列表成功");
				} catch (error) {
					console.error("获取技能效果列表出错:", error);
					throw new Error("获取技能效果列表失败");
				}
			},
			{
				query: "skillEffectQuery",
				detail: {
					tags: ["SkillEffect"],
					summary: "获取技能效果列表",
					description: "获取技能效果列表，支持分页、搜索和排序",
				},
			},
		);



//skillEffect.model.ts 
import { t } from "elysia";
import { UnoQuery } from "../../utils/common.model.ts";

// 技能效果模型定义
export const skillEffectModel = {
	// 统一查询参数
	skillEffectQuery: t.Object({
		...UnoQuery.properties,
	}),
};
