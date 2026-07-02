# 休闲闯关游戏（金币兑现金）规划 Spec

## Why

设计一款轻量级休闲闯关游戏，核心循环为「闯关 → 赚金币 → 兑换现金」，以低门槛玩法和高频奖励吸引用户留存，同时通过广告/内购实现平台变现。

## What Changes

- 新增游戏核心玩法：横版/竖版闯关，包含角色移动、跳跃、障碍、敌人、终点等机制。
- 新增关卡系统：至少 3 大世界 × 10 小关，难度曲线递增，含教学关、Boss 关与每日挑战关。
- 新增经济系统：金币获取（通关奖励、关卡内收集、连击/无伤/速通加成、每日任务、签到）。
- 新增现金兑换系统：金币按浮动/固定汇率兑换为现金，支持提现到微信/支付宝/银行卡。
- 新增美术资源规划：角色、敌人、场景、道具、UI、特效、音效资源清单与风格规范。
- 新增合规与风控：实名认证、反作弊、提现门槛、税务与法律合规。

## Impact

- 受影响能力：游戏玩法、关卡设计、经济数值、支付提现、用户成长、社交分享、广告接入。
- 受影响系统：客户端游戏引擎、服务端用户/金币/订单服务、支付通道、风控系统、运营后台。

## ADDED Requirements

### Requirement: 核心闯关玩法

The system SHALL provide a casual level-based game where the player controls a character to reach the level goal while avoiding or overcoming obstacles and enemies.

#### Scenario: 成功通关

- **WHEN** 玩家操作角色到达关卡终点或完成通关条件
- **THEN** 结算关卡，显示星级评价、金币奖励与用时

#### Scenario: 失败重试

- **WHEN** 玩家角色生命值归零或超出时间限制
- **THEN** 显示失败界面，提供「重试」「观看广告复活」「返回关卡列表」选项

### Requirement: 关卡设计

The system SHALL provide a structured level progression with at least 3 worlds and 10 levels per world, plus daily challenge levels.

#### Scenario: 世界解锁

- **WHEN** 玩家完成上一世界指定数量关卡
- **THEN** 解锁下一个世界，并播放解锁动画

#### Scenario: 关卡选择

- **WHEN** 玩家进入关卡选择界面
- **THEN** 显示当前已解锁关卡、每关最高星级、未解锁关卡锁定状态

#### Scenario: 每日挑战

- **WHEN** 每日 00:00（北京时间）
- **THEN** 刷新一个限时挑战关卡，通关可获额外金币/道具

### Requirement: 金币经济系统

The system SHALL reward players with gold coins for completing levels and achievements, and track balances server-side.

#### Scenario: 通关奖励

- **WHEN** 玩家成功通关
- **THEN** 基础金币 = 关卡基础值 × 星级系数，并展示明细

#### Scenario: 关卡内收集

- **WHEN** 玩家在关卡中拾取金币、宝箱或隐藏道具
- **THEN** 实时增加本局金币，结算时一并发放

#### Scenario: 每日任务与签到

- **WHEN** 玩家完成「通关 3 次」「收集 100 金币」「分享 1 次」等任务，或每日签到
- **THEN** 发放对应金币奖励，任务每日 00:00 重置

### Requirement: 现金兑换系统

The system SHALL allow players to convert accumulated gold coins into withdrawable cash through a compliant payment channel.

#### Scenario: 金币兑换现金

- **WHEN** 玩家在兑换页面输入兑换金币数量
- **THEN** 按当前汇率计算可得现金，扣除金币并生成待提现订单

#### Scenario: 提现申请

- **WHEN** 玩家发起提现且满足最低提现门槛、已完成实名认证
- **THEN** 提交提现申请，进入审核/打款流程，并展示预计到账时间

#### Scenario: 汇率与门槛管理

- **WHEN** 运营人员在后台调整汇率或最低提现门槛
- **THEN** 新配置对后续兑换生效，已生成订单不受影响

### Requirement: 美术资源规划

The system SHALL define a consistent art style and produce asset list covering characters, environments, UI, VFX, and audio.

#### Scenario: 风格确定

- **WHEN** 项目立项
- **THEN** 输出美术风格指南（色彩、造型、动画帧率、分辨率），例如 Q版卡通 / 像素风 / 扁平插画风

#### Scenario: 资源交付

- **WHEN** 每个版本迭代
- **THEN** 按资源清单交付角色动画、场景切片、UI 素材、特效与音效，并经过客户端验收

### Requirement: 合规与风控

The system SHALL implement real-name verification, anti-cheat measures, and withdrawal limits to comply with regulations and prevent fraud.

#### Scenario: 实名认证

- **WHEN** 玩家首次提现
- **THEN** 强制完成实名认证（姓名+身份证），未成年账户限制或禁止提现

#### Scenario: 反作弊检测

- **WHEN** 服务端检测到异常金币增长、修改器、脚本挂机
- **THEN** 冻结收益、标记账号、触发人工复核或自动清零

#### Scenario: 提现风控

- **WHEN** 同一设备/IP/身份证短期内高频提现
- **THEN** 触发风险校验，要求二次验证或延迟打款

## MODIFIED Requirements

无。

## REMOVED Requirements

无。
