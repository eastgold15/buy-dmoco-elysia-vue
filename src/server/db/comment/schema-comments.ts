import { fileURLToPath } from "node:url";
import {
	basicInstanceSchema,
	enemyerSchema,
	itemSchema,
	otherJsonSchema,
	playerSchema,
	raceSchema,
	shopInfoSchema,
	shopPoolsSchema,
	shopTiersSchema,
	skillEffectsSchema,
	stageSchema,
	tokensSchema,
	usersSchema,
	waveEnemyerSchema,
	waveSchema,
	weaponInfoSchema,
} from "../schema/index.ts";
import { pgComments, runPgComments } from "./comment.plugin.ts";

// 为用户表添加注释
pgComments(usersSchema, {
	id: "用户ID，主键",
	username: "用户名，唯一",
	password: "密码，加密存储",
	email: "电子邮件，唯一",
	nickname: "昵称",
	avatar: "头像URL",
	status: "状态，1:正常，0:禁用",
	createdAt: "创建时间",
	updatedAt: "更新时间",
});

// 为令牌表添加注释
pgComments(tokensSchema, {
	id: "令牌ID，主键",
	ownerId: "所有者ID，关联用户表",
	accessToken: "访问令牌",
	refreshToken: "刷新令牌",
	createdAt: "创建时间",
});

// 为技能效果表添加注释
pgComments(skillEffectsSchema, {
	id: "效果ID，主键",
	buffName: "buff名称",
	maxFloor: "最大层数",
	value: "效果值",
	negative: "是否为负效果",
	buffLv: "buff的驱散等级",
	description: "效果描述",
});

// 为种族表添加注释
pgComments(raceSchema, {
	id: "种族ID，主键",
	name: "种族名称",
	parentBy: "父种族ID",
	description: "种族描述",
});

// 为基础实例表添加注释
pgComments(basicInstanceSchema, {
	id: "基础实例ID，主键",
	entityType: "实体类型，玩家或敌人",
	entityName: "实体名称",
	assetId: "资源ID",
	describe: "实体描述",
	attackRange: "攻击距离",
	maxHp: "最大生命值",
	moveSpeed: "移速",
	attack: "攻击力",
	atkSpeed: "攻击速度",
	size: "体型大小，[宽,高]",
	criticalRate: "暴击率",
	criticalDmg: "暴击伤害",
	resistance: "各个属性的抗性",
});

// 为玩家表添加注释
pgComments(playerSchema, {
	id: "玩家ID，主键",
	basicInstanceID: "基础实例ID，外键",
	level: "玩家等级",
	exp: "经验值",
	damageUP: "伤害提升",
	goldGotten: "升级得到的金币",
	property: "玩家属性，JSON格式",
});

// 为敌人表添加注释
pgComments(enemyerSchema, {
	id: "敌人ID，主键",
	basicInstanceID: "基础实例ID，外键",
	raceID: "种族ID，外键",
	award_drops: "奖励掉落信息数组，包含物品ID、数量和几率的JSON数组",
});

// 为物品表添加注释
pgComments(itemSchema, {
	id: "物品ID，主键",
	name: "物品名称",
	itemType:
		"物品类型，枚举值（Gear:齿轮, Weapon:武器, Chip:芯片, GearGroove:齿轮槽, ChipGroove:芯片槽, Resource:资源道具, IncomeGear:收益齿轮, Other:其他）",
	level: "物品等级",
	attributes: "物品属性，JSON格式",
	prices: "物品价格信息，JSON格式",
	description: "物品描述",
});

// 为关卡表添加注释
pgComments(stageSchema, {
	id: "关卡ID，主键",
	name: "关卡名称",
	description: "关卡描述",
	enemyCreatorTimer: "敌人生成时间",
	difficulty: "难度等级",
});

// 为波次表添加注释
pgComments(waveSchema, {
	id: "波次ID，主键",
	stageId: "关卡ID，外键",
	durationTime: "波次持续时间（秒）",
	isBoss: "是否为BOSS或精英怪",
});

// 为波次敌人配置表添加注释
pgComments(waveEnemyerSchema, {
	id: "配置ID，主键",
	waveId: "波次ID，外键",
	enemyerId: "敌人ID，外键",
	count: "敌人数量",
	isPosRandom: "是否为随机位置",
	path: "位置坐标[x,y]",
	spawnDelay: "生成延迟（毫秒）",
});

// 为武器表添加注释
pgComments(weaponInfoSchema, {
	id: "武器ID，主键",
	name: "武器名称",
	value: "武器值",
	attribute: "武器属性",
	weaponType: "武器类型",
	maxBlue: "最大蓝量",
	isPenetrate: "是否穿透",
	targetCount: "目标数量",
	bulletSpeed: "子弹速度",
});

// 为其他JSON表添加注释
pgComments(otherJsonSchema, {
	id: "ID，主键",
	gearGrowth: "齿轮成长表，JSON格式",
});

// 为商店等级表添加注释
pgComments(shopTiersSchema, {
	id: "商店等级ID，主键",
	name: "商店名称",
	unlockLevel: "解锁等级",
	refreshCost: "刷新费用，JSON格式",
	upgradeCost: "商店升级消耗的金币数量",
	maxSlots: "最大商品槽位数",
	maxWeapons: "本级商店可装配的总武器数量上限",
	weaponLimits: "各个武器的数量上限，JSON格式，键为武器ID，值为数量上限",
	discountConfig: "商店道具的折扣配置，JSON格式，包含概率和比例",
});

// 为商店物品池表添加注释
pgComments(shopPoolsSchema, {
	id: "物品池ID，主键",
	shopTierId: "商店等级ID，外键",
	itemId: "物品ID，外键",
	itemType: "物品类型过滤",
	minLevel: "最小等级",
	maxLevel: "最大等级",
	itemWeights: "具体物品ID对应的权重配置，JSON格式，键为物品ID，值为权重",
	weight: "默认权重/概率（当itemWeights为空时使用）",
});

// 为商店信息表添加注释
pgComments(shopInfoSchema, {
	id: "信息ID，主键",
	lv: "等级",
	gearRate: "齿轮概率数组",
	weaponRate: "武器概率",
	chipRate: "芯片概率数组",
	weaponGrooveRate: "武器槽概率",
	chipGrooveRate: "芯片槽概率",
});

// 检查是否作为入口点运行
function isEntryPoint(importMetaUrl: string) {
	try {
		const __filename = fileURLToPath(importMetaUrl);
		const __entryFile = process.argv?.[1];
		return __entryFile === __filename;
	} catch (error) {
		return false;
	}
}

// 如果直接运行此文件，则执行注释添加
if (isEntryPoint(import.meta.url)) {
	runPgComments().catch(console.error);
}
