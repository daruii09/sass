// 兵种数据：玩家可部署的士兵
export interface UnitDef {
  id: string
  name: string
  type: 'melee' | 'ranged' | 'siege' | 'cavalry'
  asset: string          // 精灵图 URL
  hp: number
  atk: number
  range: number          // 攻击范围(像素)
  speed: number          // 移动速度(像素/秒)
  atkSpeed: number       // 攻击间隔(秒)
  cost: number           // 粮草消耗
  unlockRank: number     // 解锁所需主帅阶
  desc: string
}

import { ASSETS } from './assets'

export const UNITS: UnitDef[] = [
  { id: 'shield', name: '刀盾兵', type: 'melee', asset: ASSETS.units.soldierShield,
    hp: 220, atk: 18, range: 36, speed: 34, atkSpeed: 1.1, cost: 60, unlockRank: 1,
    desc: '边军标配，持刀圆盾，肉盾型近战，性价比高。' },
  { id: 'spear', name: '长枪兵', type: 'melee', asset: ASSETS.units.soldierSpear,
    hp: 260, atk: 24, range: 48, speed: 30, atkSpeed: 1.3, cost: 80, unlockRank: 2,
    desc: '长枪如林，对骑兵有奇效，攻击距离略远。' },
  { id: 'archer', name: '弓箭手', type: 'ranged', asset: ASSETS.units.soldierArcher,
    hp: 140, atk: 22, range: 180, speed: 32, atkSpeed: 1.0, cost: 90, unlockRank: 2,
    desc: '弓如霹雳，远程压制，需近战保护。' },
  { id: 'ballista', name: '床弩手', type: 'ranged', asset: ASSETS.units.soldierBallista,
    hp: 160, atk: 60, range: 240, speed: 18, atkSpeed: 2.6, cost: 160, unlockRank: 3,
    desc: '床弩一发破甲，专克重甲与攻城器械。' },
  { id: 'catapult', name: '投石车', type: 'siege', asset: ASSETS.units.soldierCatapult,
    hp: 180, atk: 80, range: 280, speed: 14, atkSpeed: 3.4, cost: 220, unlockRank: 4,
    desc: '抛石攻城，范围杀伤，移动缓慢。' },
  { id: 'cavalry', name: '重装骑兵', type: 'cavalry', asset: ASSETS.units.soldierCavalry,
    hp: 420, atk: 40, range: 40, speed: 70, atkSpeed: 1.2, cost: 200, unlockRank: 4,
    desc: '铁骑冲锋，高速高血，撕裂敌阵利器。' },
  { id: 'guard', name: '精锐禁卫', type: 'melee', asset: ASSETS.units.soldierGuard,
    hp: 600, atk: 55, range: 44, speed: 36, atkSpeed: 1.0, cost: 320, unlockRank: 6,
    desc: '金甲双刀，禁军精锐，攻防俱佳的终极近战。' },
]

export function unitById(id: string): UnitDef | undefined {
  return UNITS.find(u => u.id === id)
}
