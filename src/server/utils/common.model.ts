import { t } from "elysia";

// 公共查询列表类型
export const UnoQuery = t.Partial(
	t.Object({
		search: t.String(),
		page: t.Number(),
		pageSize: t.Number(),
		sortBy: t.String(),
		sortOrder: t.String(),
	}),
);
