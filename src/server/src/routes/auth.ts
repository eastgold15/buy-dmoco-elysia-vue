import { createUserToken } from "@pori15/elysia-auth-drizzle";
import { eq, or } from "drizzle-orm";
import { Elysia, status } from "elysia";
import { envConfig } from "../config/env";
import { db } from "../db/connection";
import { tokenSchema, userSchema } from "../db/schema";
import { commonRes } from "../plugins/Res";
import { authRouteModel } from "./auth.model";

export const authRoute = new Elysia({ prefix: "/auth" })
	.state("hashpasswd", "")
	.model(authRouteModel)
	// .use(authPlugin)
	// 用户登录
	.post(
		"/login",
		async ({ body: { username, password, remember }, status }) => {
			try {
				// 查找用户（同时支持用户名和邮箱登录）
				const finduser = await db
					.select()
					.from(userSchema)
					.where(
						or(
							eq(userSchema.username, username),
							eq(userSchema.email, username),
						),
					)
					.limit(1);

				if (!finduser.length || !finduser[0])
					return status(401, "用户名或密码错误");
				const userData = finduser[0];

				// 检查用户状态
				if (userData.status !== 1) return status(401, "账户已被禁用");

				// 检查是否为OAuth用户（没有密码）
				if (!userData.password && userData.googleId) {
					return status(401, "该账号是通过谷歌登录的，请使用谷歌登录");
				}

				// 检查用户是否有密码
				if (!userData.password) {
					return status(401, "账户未设置密码，请联系管理员");
				}
				// 验证密码
				const isPasswordValid = await Bun.password.verify(
					password,
					userData.password,
				);
				if (!isPasswordValid) {
					status(401, "用户名或密码错误");
				}

				const { accessToken, refreshToken } = await createUserToken({
					db,
					usersSchema: userSchema,
					tokensSchema: tokenSchema,
				})(userData.id.toString(), {
					secret: envConfig.get("JWT_SECRET") || "tzd",
					accessTokenTime: `${remember ? 12 : 2}h`,
					refreshTokenTime: "7d",
				});

				return commonRes(
					{
						token: {
							accessToken,
							refreshToken,
						},
						user: {
							id: userData.id,
							username: userData.username,
							email: userData.email,
							avatar: userData.avatar,
							role: userData.role,
						},
					},
					200,
					"登录成功",
				);
			} catch (err) {
				console.error("登录失败:", err);
				return status(500, "登录失败");
			}
		},
		{
			body: "loginDto",
			detail: {
				tags: ["Auth"],
				summary: "用户登录",
				description: "用户名密码登录",
			},
		},
	)
	.post(
		"/register",
		async ({ body: { username, password } }) => {
			// username 重复

			const finduser = await db
				.select()
				.from(userSchema)
				.where(eq(userSchema.username, username));

			if (finduser.length) {
				return status(400, "用户名已存在");
			}
			const insertUser = await db
				.insert(userSchema)
				.values({
					username,
					password: await Bun.password.hash(password),
				})
				.returning({ id: userSchema.id, username: userSchema.username });

			if (!insertUser[0]) {
				return status(500, "注册失败");
			}

			return commonRes(
				{
					id: insertUser[0].id,
					username: insertUser[0].username,
				},
				200,
				"注册成功",
			);
		},
		{
			body: "CreateUserDto",
			detail: {
				tags: ["Auth"],
				summary: "用户注册",
				description: "用户名密码注册",
			},
		},
	);
