1. 项目是 https://domco.robino.dev/tutorial 提供的全栈框架
2. ui 组件是unocss 和 primevue ，组件尽量使用primevue 提供的组件
3. 项目后端是elysia 框架，前端是vue3
4. 使用ofetch 来请求后端api



## 项目目标
 做一个可以配置的外贸网站，提供给小商户去售卖衣服服装类。
 1. 分类 网站有一个商品分类，当时鼠标移动上去，展开一个下拉框，展示该分类下的商品。有一个后台管理，可以管理分类栏目。需要有：显示/隐藏	排序、操作、栏目名称 。应该是一个树形。

 2. 商品 每个商品有一个详情页，展示商品的详细信息，包括图片、价格、描述等
 5. 支付 订单支付完成后，会跳转到支付成功页面，展示支付成功信息
 6. 广告管理，广告分为轮播图广告和 banner 广告。轮播图广告在首页展示，banner 广告在商品详情页展示。后台可以上传图片管理，替换广告的连接和图片
 7. 网站管理 站点名称，logo、关键字、备案号、站点版权
 8. 底部可以配置，应该有这些信息For You
Favorites
Gift Cards
Afterpay
Connect with Us
Back to top
Terms of Use
Privacy & Cookie Policy
Text Messaging Terms
Bulk Buyer Policy
Accessibility
Do Not Sell or Share My Personal Information
© 2024 WWW.APPARELCITY.COM.CN All Rights Reserved 赣ICP备2024041550号-5

9. 顶部有这些信息，FREE SHIPPING on orders over $59* details
Sign InSign In
Join Rewards
Track Order
 Facility: Alderwood Mall
 也是可以配置 

 10. 需要有商品搜索功能


11. 商品 需要有这些信息 
JACK & JONES Blupaulin Knit Mens Polo Shirt
$54.99
or 4 payments of $13.75 by Learn more
Color: BLACK


Size:
Choose a size to continue, Selection will refresh the page with new results
    
Size Chart
FREE In Store Returns (?)

Get 10% off* - Buy online, Pick up in store*
Earn 55 Reward Points (?)
30 points = $1 Reward
You can earn up to this amount of Tillys Rewards points for purchasing this item. 30 points = $1 Reward
5 out of 5 Customer Rating
Be the first to write a review
| Be the first to ask a question
Jack & Jones Blupaulin Knit Polo Shirt. Knit fabrication. Collared neckline. Slim fit. Short sleeves. Rib hem. 62% Cotton 38% Polyester. Machine wash. Imported.

11. 图标使用 @iconify-json/ic

~~创建数据库模型和API - 设计商品分类的数据结构，包括树形结构支持，创建分类管理的后端API接口~~


~~实现商品分类前端组件 - 创建可配置的商品分类导航组件，支持鼠标悬停展开下拉菜单~~

~~设计商品数据模型 - 创建商品的完整数据结构，包括图片、价格、描述、颜色、尺寸等信息~~

开发分类管理后台 - 创建分类管理页面，支持显示/隐藏、排序、树形结构操作

实现商品详情页 - 创建商品详情页面，展示所有商品信息，包括评价、尺寸选择等功能

开发网站配置系统 - 创建网站基本信息管理，包括站点名称、logo、关键字、备案号等

实现商品搜索功能 - 创建商品搜索接口和前端搜索组件

实现顶部和底部配置 - 创建可配置的网站头部和底部信息管理功能

开发广告管理系统 - 实现轮播图和banner广告的上传、管理和展示功能

集成支付系统 - 实现订单支付流程和支付成功页面