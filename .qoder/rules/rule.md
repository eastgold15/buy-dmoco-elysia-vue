---
trigger: manual
---


项目新建Vue界面必须使用primeVue的组件，或者是unocss查。自己创建组件。


一旦修改db/schema下的dirzzle数据库表格之后就必须要运行一个脚本命令db:push
`
"db:push": "bun run db:schema && drizzle-kit push --config=src/server/src/.container/dev/drizzle-dev.config.ts"
`，把数据库更改同步到数据库。在进行api访问。
