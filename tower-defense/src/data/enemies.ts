// 敌人数据
import { ASSETS } from './assets'

export interface EnemyDef {
  id: string
  name: string
  asset: string
  hp: number
  atk: number
  speed: number       // 路径速度(像素/秒)
  armor: number       // 减伤
  bounty: number      // 击杀金币
  damage: number      // 到达终点对基地的伤害
  boss?: boolean
  desc: string
}

export const ENEMIES: Record<string, EnemyDef> = {
  bandit: { id:'bandit', name:'山贼步兵', asset: ASSETS.enemies.bandit,
    hp: 100, atk: 14, speed: 38, armor: 0, bounty: 8, damage: 1,
    desc: '乌合之众，血薄速快，先锋炮灰。' },
  archer: { id:'archer', name:'山贼弓手', asset: ASSETS.enemies.archer,
    hp: 80, atk: 18, speed: 34, armor: 0, bounty: 10, damage: 1,
    desc: '游射骚扰，远程攻击我方士兵。' },
  cavalry: { id:'cavalry', name:'流寇骑兵', asset: ASSETS.enemies.cavalry,
    hp: 180, atk: 22, speed: 70, armor: 2, bounty: 16, damage: 2,
    desc: '来去如风，高速突防，需长枪兵拦截。' },
  heavy: { id:'heavy', name:'重甲步兵', asset: ASSETS.enemies.heavy,
    hp: 420, atk: 30, speed: 22, armor: 8, bounty: 24, damage: 2,
    desc: '铁甲巨斧，硬如磐石，需床弩破甲。' },
  eagle: { id:'eagle', name:'飞鹰斥候', asset: ASSETS.enemies.eagle,
    hp: 120, atk: 16, speed: 90, armor: 0, bounty: 18, damage: 1,
    desc: '飞鹰探路，速度极快，趁虚而入。' },
  siege: { id:'siege', name:'攻城车', asset: ASSETS.enemies.siege,
    hp: 900, atk: 50, speed: 16, armor: 12, bounty: 50, damage: 5,
    desc: '撞城巨械，血厚防高，威胁基地。' },
  brute: { id:'brute', name:'蛮族勇士', asset: ASSETS.enemies.brute,
    hp: 680, atk: 42, speed: 28, armor: 5, bounty: 40, damage: 3,
    desc: '蛮族狂战，攻高血厚，战场绞肉机。' },
  boss: { id:'boss', name:'蛮王', asset: ASSETS.enemies.boss,
    hp: 2400, atk: 80, speed: 24, armor: 10, bounty: 200, damage: 10, boss: true,
    desc: '蛮族之王，一夫当关，关卡终极威胁。' },
}
