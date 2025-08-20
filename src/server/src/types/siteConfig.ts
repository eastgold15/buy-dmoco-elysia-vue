// 网站配置相关类型定义

export interface SiteConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSiteConfigRequest {
  key: string;
  value: string;
  description?: string;
  category?: string;
}

export interface UpdateSiteConfigRequest {
  value?: string;
  description?: string;
  category?: string;
}

// 网站配置分类
export type SiteConfigCategory = 
  | 'general'    // 基本设置
  | 'seo'        // SEO设置
  | 'legal'      // 法律信息
  | 'contact'    // 联系信息
  | 'shipping'   // 配送设置
  | 'payment'    // 支付设置
  | 'social'     // 社交媒体
  | 'appearance' // 外观设置
  | 'advanced';  // 高级设置

// 预定义的配置键
export const SITE_CONFIG_KEYS = {
  // 基本设置
  SITE_NAME: 'site_name',
  SITE_LOGO: 'site_logo',
  SITE_FAVICON: 'site_favicon',
  CURRENCY: 'currency',
  TIMEZONE: 'timezone',
  LANGUAGE: 'language',
  
  // SEO设置
  SITE_KEYWORDS: 'site_keywords',
  SITE_DESCRIPTION: 'site_description',
  SITE_TITLE: 'site_title',
  
  // 法律信息
  ICP_NUMBER: 'icp_number',
  COPYRIGHT: 'copyright',
  PRIVACY_POLICY: 'privacy_policy',
  TERMS_OF_SERVICE: 'terms_of_service',
  
  // 联系信息
  CONTACT_EMAIL: 'contact_email',
  CONTACT_PHONE: 'contact_phone',
  CONTACT_ADDRESS: 'contact_address',
  BUSINESS_HOURS: 'business_hours',
  
  // 配送设置
  FREE_SHIPPING_THRESHOLD: 'free_shipping_threshold',
  SHIPPING_NOTICE: 'shipping_notice',
  
  // 社交媒体
  FACEBOOK_URL: 'facebook_url',
  TWITTER_URL: 'twitter_url',
  INSTAGRAM_URL: 'instagram_url',
  YOUTUBE_URL: 'youtube_url',
  
  // 外观设置
  THEME_COLOR: 'theme_color',
  HEADER_NOTICE: 'header_notice',
  FOOTER_TEXT: 'footer_text'
} as const;

// 配置项的显示信息
export interface SiteConfigMeta {
  key: string;
  label: string;
  description: string;
  category: SiteConfigCategory;
  type: 'text' | 'textarea' | 'url' | 'email' | 'number' | 'color' | 'file';
  required?: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// 所有配置项的元数据
export const SITE_CONFIG_META: SiteConfigMeta[] = [
  {
    key: SITE_CONFIG_KEYS.SITE_NAME,
    label: '网站名称',
    description: '显示在浏览器标题栏和网站头部的名称',
    category: 'general',
    type: 'text',
    required: true,
    placeholder: '请输入网站名称'
  },
  {
    key: SITE_CONFIG_KEYS.SITE_LOGO,
    label: '网站Logo',
    description: '网站Logo图片URL',
    category: 'general',
    type: 'url',
    placeholder: 'https://example.com/logo.png'
  },
  {
    key: SITE_CONFIG_KEYS.SITE_KEYWORDS,
    label: 'SEO关键词',
    description: '网站SEO关键词，用逗号分隔',
    category: 'seo',
    type: 'text',
    placeholder: '外贸,服装,时尚,购物'
  },
  {
    key: SITE_CONFIG_KEYS.SITE_DESCRIPTION,
    label: '网站描述',
    description: '网站SEO描述，显示在搜索结果中',
    category: 'seo',
    type: 'textarea',
    placeholder: '专业的外贸服装购物平台'
  },
  {
    key: SITE_CONFIG_KEYS.ICP_NUMBER,
    label: 'ICP备案号',
    description: '网站ICP备案号',
    category: 'legal',
    type: 'text',
    placeholder: '京ICP备12345678号'
  },
  {
    key: SITE_CONFIG_KEYS.COPYRIGHT,
    label: '版权信息',
    description: '网站底部显示的版权信息',
    category: 'legal',
    type: 'text',
    placeholder: '© 2024 公司名称 All Rights Reserved'
  },
  {
    key: SITE_CONFIG_KEYS.CONTACT_EMAIL,
    label: '联系邮箱',
    description: '客服联系邮箱',
    category: 'contact',
    type: 'email',
    placeholder: 'contact@example.com'
  },
  {
    key: SITE_CONFIG_KEYS.CONTACT_PHONE,
    label: '联系电话',
    description: '客服联系电话',
    category: 'contact',
    type: 'text',
    placeholder: '+86 400-123-4567'
  },
  {
    key: SITE_CONFIG_KEYS.FREE_SHIPPING_THRESHOLD,
    label: '免费配送门槛',
    description: '订单金额超过此数值免费配送',
    category: 'shipping',
    type: 'number',
    placeholder: '59'
  },
  {
    key: SITE_CONFIG_KEYS.HEADER_NOTICE,
    label: '顶部通知',
    description: '网站顶部显示的通知信息',
    category: 'appearance',
    type: 'text',
    placeholder: 'FREE SHIPPING on orders over $59* details'
  }
];