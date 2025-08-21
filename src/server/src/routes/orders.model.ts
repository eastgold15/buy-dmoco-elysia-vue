
// 布局配置模型定义
export const OrdersModel = {
  // 创建头部配置请求参数
  // CreateHeaderConfigDto: DbType.typebox.insert,

  // 更新头部配置请求参数
  UpdateHeaderConfigDto: t.Object({
    ...DbType.spreads.insert.headerConfigSchema
  }),

  // 创建底部配置请求参数
  CreateFooterConfigDto: DbType.typebox.insert.footerConfigSchema,

  // 更新底部配置请求参数
  UpdateFooterConfigDto: t.Object({
    ...DbType.spreads.insert.footerConfigSchema
  }),

  // 底部配置查询参数
  FooterConfigQueryDto: t.Object({
    ...UnoQuery.properties,
    isActive: t.Optional(t.Boolean()),
    sectionType: t.Optional(t.String())
  }),

  // 路径参数
  IdParams: t.Object({
    id: t.String()
  })
};
