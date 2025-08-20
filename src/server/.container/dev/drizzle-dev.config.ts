import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "drizzle/dev",
	schema: "src/server/db/schema/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: "postgres://app_user:app_pass@localhost:5432/buy",	
	},
});
