import { t } from "elysia";
import { UnoQuery } from "../utils/common.model";

export const userRouteModel = {
	updateProfileSchema: t.Object({
		nickname: t.Optional(t.String({ maxLength: 50 })),
		email: t.Optional(t.String({ format: "email", maxLength: 100 })),
		avatar: t.Optional(t.String({ maxLength: 255 })),
	}),

	// 统一查询参数
	usersQuery: t.Object({
		...UnoQuery.properties,
	}),
};
