// 防御塔数据：玩家在塔位上建造
export type TowerKind = 'archer' | 'ballista' | 'catapult' | 'barracks'

export interface TowerDef {
  kind: TowerKind
  name: string
  asset: string
  range: number
  damage: number
  fireRate: number      // 每秒攻击次数
  splash?: number       // 溅射半径
  cost: number
  unlockRank: number
  // 兵营专属
  soldierId?: string
  soldierMax?: number
  rallyRange?: number
  desc: string
}

import { ASSETS } from './assets'

export const TOWERS: Record<TowerKind, TowerDef> = {
  archer: {
    kind: 'archer', name: '弓箭塔', asset: ASSETS.towers.archer,
    range: 170, damage: 16, fireRate: 1.6, cost: 120, unlockRank: 1,
    desc: '箭塔如雨，射速极快，对轻甲敌兵效果显著。',
  },
  ballista: {
    kind: 'ballista', name: '床弩塔', asset: ASSETS.towers.ballista,
    range: 240, damage: 70, fireRate: 0.45, cost: 200, unlockRank: 3,
    desc: '床弩蓄力一击，穿透重甲，射程极远。',
  },
  catapult: {
    kind: 'catapult', name: '投石塔', asset: ASSETS.towers.catapult,
    range: 220, damage: 45, fireRate: 0.6, splash: 50, cost: 260, unlockRank: 4,
    desc: '抛石砸落，范围杀伤，群体克星。',
  },
  barracks: {
    kind: 'barracks', name: '兵营', asset: ASSETS.towers.barracks,
    range: 0, damage: 0, fireRate: 0, cost: 140, unlockRank: 1,
    soldierId: 'shield', soldierMax: 3, rallyRange: 90,
    desc: '兵营驻军，自动生产士兵据守要道，阻敌于塔下。',
  },
}
