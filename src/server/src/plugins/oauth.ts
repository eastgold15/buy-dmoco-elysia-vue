import { createUserToken } from "@pori15/elysia-auth-drizzle";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { oauth2 } from "elysia-oauth2";
import { envConfig } from "../config/env";
import { db } from "../db/connection";
import { tokenSchema, userSchema } from "../db/schema";
import { commonRes } from "./Res";

// OAuth 配置
export const oauthPlugin = new Elysia({ name: "oauthPlugin" })
	.use(
		oauth2({
			Google: [
				envConfig.get("GOOGLE_CLIENT_ID") || "",
				envConfig.get("GOOGLE_CLIENT_SECRET") || "",
				envConfig.get("GOOGLE_REDIRECT_URI") ||
					"http://localhost:3000/api/auth/google/callback",
			],
		}),
	)
	// 谷歌登录重定向
	.get("/auth/google", ({ oauth2, redirect }) => {
		const url = oauth2.createURL("Google", ["email", "profile", "openid"]);

		// 设置访问类型为离线，以获取refresh token
		url.searchParams.set("access_type", "offline");
		url.searchParams.set("prompt", "consent");

		return redirect(url.href);
	})

	// 谷歌登录回调
	.get("/auth/google/callback", async ({ oauth2, query, redirect }) => {
		try {
			// 检查是否有错误
			if (query.error) {
				console.error("Google OAuth error:", query.error);
				return redirect(
					`${envConfig.get("FRONTEND_URL") || "http://localhost:5173"}/login?error=oauth_error`,
				);
			}

			// 获取访问令牌
			const tokens = await oauth2.authorize("Google");
			const accessToken = tokens.accessToken();

			// 使用访问令牌获取用户信息
			const userInfoResponse = await fetch(
				`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
			);

			if (!userInfoResponse.ok) {
				throw new Error("Failed to fetch user info from Google");
			}

			const googleUser = await userInfoResponse.json();

			// 查找或创建用户
			let user = await db
				.select()
				.from(userSchema)
				.where(eq(userSchema.email, googleUser.email))
				.limit(1);

			if (user.length === 0) {
				// 创建新用户
				const newUser = await db
					.insert(userSchema)
					.values({
						email: googleUser.email,
						username: googleUser.name || googleUser.email,
						password: "", // OAuth用户不需要密码
						avatar: googleUser.picture || "",
						status: 1, // 默认激活状态
						role: "user",
						googleId: googleUser.id,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();
				user = newUser;
			} else {
				// 更新现有用户的Google ID和头像（如果没有的话）
				const existingUser = user[0];
				if (!existingUser.googleId || existingUser.googleId !== googleUser.id) {
					await db
						.update(userSchema)
						.set({
							googleId: googleUser.id,
							avatar: existingUser.avatar || googleUser.picture || "",
							updatedAt: new Date(),
						})
						.where(eq(userSchema.id, existingUser.id));
				}
			}

			// 生成JWT令牌
			const tokenGenerator = createUserToken({
				db,
				usersSchema: userSchema,
				tokensSchema: tokenSchema,
			});

			const tokenResult = await tokenGenerator(user[0].id.toString(), {
				secret: envConfig.get("JWT_SECRET") || "tzd",
				accessTokenTime: "7d", // 7天有效期
				refreshTokenTime: "30d", // 30天刷新令牌
			});

			// 重定向到前端，携带令牌
			const frontendUrl =
				envConfig.get("FRONTEND_URL") || "http://localhost:5173";
			const callbackUrl = `${frontendUrl}/auth/callback?token=${tokenResult.accessToken}&refresh_token=${tokenResult.refreshToken}`;

			return redirect(callbackUrl);
		} catch (error) {
			console.error("Google OAuth callback error:", error);
			const frontendUrl =
				envConfig.get("FRONTEND_URL") || "http://localhost:5173";
			return redirect(`${frontendUrl}/login?error=callback_error`);
		}
	})

	// 获取当前用户信息（需要认证）
	.get("/auth/me", ({ isConnected, connectedUser }) => {
		if (!isConnected) {
			return commonRes(null, 401, "未登录");
		}

		return commonRes(
			{
				id: connectedUser.id,
				username: connectedUser.username,
				email: connectedUser.email,
				avatar: connectedUser.avatar,
				role: connectedUser.role,
				createdAt: connectedUser.createdAt,
			},
			200,
			"获取用户信息成功",
		);
	})

	// 注销
	.post("/auth/logout", async ({ isConnected, connectedUser }) => {
		if (!isConnected || !connectedUser) {
			return commonRes(null, 401, "未登录");
		}

		try {
			// 删除数据库中的令牌
			await db
				.delete(tokenSchema)
				.where(eq(tokenSchema.ownerId, connectedUser.id));

			return commonRes(null, 200, "注销成功");
		} catch (error) {
			console.error("注销失败:", error);
			return commonRes(null, 500, "注销失败");
		}
	});
