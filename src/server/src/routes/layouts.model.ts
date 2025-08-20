import { t } from 'elysia';
import { UnoQuery } from '../utils/common.model';
import { DbType } from '../db/database.types';

// 布局配置模型定义
export const layoutsModel = {
  // 创建头部配置请求参数
  CreateHeaderConfigDto: DbType.typebox.insert.headerConfigSchema,

  // 更新头部配置请求参数
  UpdateHeaderConfigDto: t.Partial(DbType.typebox.insert.headerConfigSchema),

  // 创建底部配置请求参数
  CreateFooterConfigDto: DbType.typebox.insert.footerConfigSchema,

  // 更新底部配置请求参数
  UpdateFooterConfigDto: t.Partial(DbType.typebox.insert.footerConfigSchema),

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

// 导出类型
export type CreateHeaderConfigDto = typeof layoutsModel.CreateHeaderConfigDto;
export type UpdateHeaderConfigDto = typeof layoutsModel.UpdateHeaderConfigDto;
export type CreateFooterConfigDto = typeof layoutsModel.CreateFooterConfigDto;
export type UpdateFooterConfigDto = typeof layoutsModel.UpdateFooterConfigDto;
export type FooterConfigQueryDto = typeof layoutsModel.FooterConfigQueryDto;
export type IdParams = typeof layoutsModel.IdParams;