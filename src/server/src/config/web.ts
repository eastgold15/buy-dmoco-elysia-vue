export const webConfig = [
  // 基本设置
  {
    key: "site_name",
    value: "外贸服装商城",
    description: "网站名称",
    category: "general",
  },
  {
    key: "site_logo",
    value: "",
    description: "网站Logo URL",
    category: "general",
  },
  {
    key: "site_keywords",
    value: "外贸,服装,时尚,购物",
    description: "网站关键词",
    category: "seo",
  },
  {
    key: "site_description",
    value: "专业的外贸服装购物平台",
    description: "网站描述",
    category: "seo",
  },


  {
    key: "icp_number",
    value: "",
    description: "ICP备案号",
    category: "legal",
  },
  {
    key: "copyright",
    value: "© 2024 外贸服装商城 All Rights Reserved",
    description: "版权信息",
    category: "legal",
  },
  {
    key: "header_notice",
    value: "FREE SHIPPING on orders over $59* details",
    description: "顶部通知",
    category: "general",
  },
  {
    key: "free_shipping_threshold",
    value: "59",
    description: "免费配送门槛",
    category: "general",
  },
  {
    key: "currency",
    value: "USD",
    description: "货币单位",
    category: "general",
  },

  // 导航页配置
  {
    key: "nav_home_enabled",
    value: "true",
    description: "是否显示首页导航",
    category: "navigation",
  },
  {
    key: "nav_products_enabled",
    value: "true",
    description: "是否显示产品导航",
    category: "navigation",
  },
  {
    key: "nav_categories_enabled",
    value: "true",
    description: "是否显示分类导航",
    category: "navigation",
  },
  {
    key: "nav_about_enabled",
    value: "true",
    description: "是否显示关于我们导航",
    category: "navigation",
  },
  {
    key: "nav_contact_enabled",
    value: "true",
    description: "是否显示联系我们导航",
    category: "navigation",
  },

  // 网站顶部配置
  {
    key: "header_banner_text",
    value: "FREE SHIPPING on orders over $59* details",
    description: "顶部横幅文本",
    category: "header",
  },
  {
    key: "header_banner_link",
    value: "/shipping-info",
    description: "顶部横幅链接",
    category: "header",
  },
  {
    key: "header_track_order_text",
    value: "Track Order",
    description: "追踪订单文本",
    category: "header",
  },
  {
    key: "header_track_order_link",
    value: "/track-order",
    description: "追踪订单链接",
    category: "header",
  },
  {
    key: "header_help_links",
    value:
      '[{"text":"Help","url":"/help"},{"text":"Contact","url":"/contact"}]',
    description: "帮助链接JSON",
    category: "header",
  },
  {
    key: "header_search_enabled",
    value: "true",
    description: "是否显示搜索框",
    category: "header",
  },
  {
    key: "header_cart_enabled",
    value: "true",
    description: "是否显示购物车图标",
    category: "header",
  },
  {
    key: "header_user_menu_enabled",
    value: "true",
    description: "是否显示用户菜单",
    category: "header",
  },

  // 底部配置
  {
    key: "footer_copyright",
    value:
      "© 2024 WWW.APPARELCITY.COM.CN All Rights Reserved 赣ICP备2024041550号-5",
    description: "版权信息",
    category: "footer",
  },
  {
    key: "footer_back_to_top_text",
    value: "Back to top",
    description: "返回顶部文本",
    category: "footer",
  },
  {
    key: "footer_sections",
    value:
      '[{"title":"For You","links":[{"text":"Favorites","url":"/favorites"},{"text":"Gift Cards","url":"/gift-cards"}]},{"title":"Connect with Us","links":[{"text":"Customer Service","url":"/customer-service"},{"text":"Social Media","url":"/social"}]},{"title":"Legal","links":[{"text":"Terms of Use","url":"/terms"},{"text":"Privacy Policy","url":"/privacy"}]}]',
    description: "底部栏目JSON",
    category: "footer",
  },
  {
    key: "footer_company_name",
    value: "外贸服装商城有限公司",
    description: "公司名称",
    category: "footer",
  },
];