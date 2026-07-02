// 防御塔数据：3 级升级，每级样式与属性不同
export type TowerKind = 'archer' | 'ballista' | 'catapult' | 'barracks'

export interface TowerTier {
  asset: string
  range: number
  damage: number
  fireRate: number
  splash?: number
  cost: number        // 升级到本级的花费(含本级建造)
  soldierMax?: number
}

export interface TowerDef {
  kind: TowerKind
  name: string
  unlockRank: number
  soldierId?: string
  rallyRange?: number
  desc: string
  tiers: [TowerTier, TowerTier, TowerTier]
}

import { ASSETS } from './assets'

export const TOWERS: Record<TowerKind, TowerDef> = {
  archer: {
    kind: 'archer', name: '弓箭塔', unlockRank: 1,
    desc: '箭塔如雨，射速极快，对轻甲敌兵效果显著。可升级三级。',
    tiers: [
      { asset: ASSETS.towers.archer1, range: 160, damage: 14, fireRate: 1.5, cost: 120 },
      { asset: ASSETS.towers.archer2, range: 190, damage: 22, fireRate: 1.9, cost: 180 },
      { asset: ASSETS.towers.archer3, range: 230, damage: 34, fireRate: 2.4, cost: 280 },
    ],
  },
  ballista: {
    kind: 'ballista', name: '床弩塔', unlockRank: 3,
    desc: '床弩蓄力一击，穿透重甲，射程极远。可升级三级。',
    tiers: [
      { asset: ASSETS.towers.ballista1, range: 230, damage: 60, fireRate: 0.45, cost: 200 },
      { asset: ASSETS.towers.ballista2, range: 270, damage: 90, fireRate: 0.6, cost: 280 },
      { asset: ASSETS.towers.ballista3, range: 320, damage: 130, fireRate: 0.75, cost: 420 },
    ],
  },
  catapult: {
    kind: 'catapult', name: '投石塔', unlockRank: 4,
    desc: '抛石砸落，范围杀伤，群体克星。可升级三级。',
    tiers: [
      { asset: ASSETS.towers.catapult1, range: 200, damage: 38, fireRate: 0.55, splash: 45, cost: 260 },
      { asset: ASSETS.towers.catapult2, range: 230, damage: 55, fireRate: 0.7, splash: 60, cost: 340 },
      { asset: ASSETS.towers.catapult3, range: 270, damage: 80, fireRate: 0.85, splash: 80, cost: 500 },
    ],
  },
  barracks: {
    kind: 'barracks', name: '兵营', unlockRank: 1, soldierId: 'shield', rallyRange: 90,
    desc: '兵营驻军，自动生产士兵据守要道。可升级三级提升驻军数量与质量。',
    tiers: [
      { asset: ASSETS.towers.barracks1, range: 0, damage: 0, fireRate: 0, cost: 140, soldierMax: 3 },
      { asset: ASSETS.towers.barracks2, range: 0, damage: 0, fireRate: 0, cost: 200, soldierMax: 4 },
      { asset: ASSETS.towers.barracks3, range: 0, damage: 0, fireRate: 0, cost: 300, soldierMax: 5 },
    ],
  },
}
