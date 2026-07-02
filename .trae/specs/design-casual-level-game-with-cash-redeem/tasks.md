# Tasks

- [x] Task 1: 确定游戏核心玩法与技术方案
  - [x] SubTask 1.1: 确定游戏类型（横版/竖版、平台跳跃/物理解谜等）
  - [x] SubTask 1.2: 选择技术引擎与平台（Unity / Cocos Creator / Web 等）
  - [x] SubTask 1.3: 定义操作方式与核心循环文档

- [x] Task 2: 设计关卡体系与数值
  - [x] SubTask 2.1: 设计 3 大世界主题与 30 关关卡蓝图
  - [x] SubTask 2.2: 制定难度曲线、敌人/障碍配置表
  - [x] SubTask 2.3: 设计每日挑战与无尽/限时模式规则

- [x] Task 3: 规划美术资源清单与风格
  - [x] SubTask 3.1: 确定美术风格指南（色彩、造型、分辨率）
  - [x] SubTask 3.2: 列出角色、敌人、场景、UI、特效、音效资源清单
  - [x] SubTask 3.3: 制定资源命名规范与交付验收流程

- [x] Task 4: 设计金币经济系统
  - [x] SubTask 4.1: 设计金币获取途径与数值公式
  - [x] SubTask 4.2: 设计每日任务、签到、成就奖励表
  - [x] SubTask 4.3: 确定金币服务端存储与防篡改方案

- [x] Task 5: 设计现金兑换与提现系统
  - [x] SubTask 5.1: 确定金币-现金兑换汇率与最低提现门槛
  - [x] SubTask 5.2: 设计兑换订单、提现申请、审核打款状态机
  - [x] SubTask 5.3: 接入支付通道（微信/支付宝/银行卡）并设计回调对账

- [x] Task 6: 合规与风控方案
  - [x] SubTask 6.1: 设计实名认证流程与未成年保护策略
  - [x] SubTask 6.2: 制定反作弊规则（金币校验、行为检测、外挂识别）
  - [x] SubTask 6.3: 设计提现风控策略（设备/IP/身份证限频、二次验证）

- [x] Task 7: 产出可落地的项目文档
  - [x] SubTask 7.1: 汇总策划案（玩法、关卡、经济、兑换）
  - [x] SubTask 7.2: 输出技术架构与接口概览
  - [x] SubTask 7.3: 制定开发排期与里程碑

# Task Dependencies

- Task 4 依赖 Task 1、Task 2
- Task 5 依赖 Task 4
- Task 6 依赖 Task 5
- Task 7 依赖 Task 1 ~ Task 6
