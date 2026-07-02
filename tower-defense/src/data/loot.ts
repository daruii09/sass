// 战利品系统：击杀敌军概率掉落物品，物品可在交易系统买卖
// 物品分 4 个稀有度：common / rare / epic / legendary

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface ItemDef {
  id: string
  name: string
  icon: string        // Material Symbols 图标名
  rarity: Rarity
  price: number       // 交易售价(金币)
  desc: string
}

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#9e9e9e',
  rare: '#4fc3f7',
  epic: '#ba68c8',
  legendary: '#ffb300',
}

export const ITEMS: Record<string, ItemDef> = {
  // 普通：常见材料
  iron:   { id: 'iron',   name: '精铁',   icon: 'hardware',       rarity: 'common',    price: 30,  desc: '锻造兵器的基础材料，击杀普通敌军有概率掉落。' },
  wood:   { id: 'wood',   name: '硬木',   icon: 'forest',         rarity: 'common',    price: 25,  desc: '修筑塔防与攻城器械所需木材。' },
  leather:{ id: 'leather',name: '皮革',   icon: 'work',           rarity: 'common',    price: 28,  desc: '制作轻甲与盾牌的牛皮，山贼身上常见。' },
  herb:   { id: 'herb',   name: '草药',   icon: 'eco',            rarity: 'common',    price: 35,  desc: '疗伤草药，急救令的炼制原料。' },
  // 稀有
  gem:    { id: 'gem',    name: '璞玉',   icon: 'diamond',        rarity: 'rare',      price: 180, desc: '未雕琢的玉石，兑换可观金币。' },
  steel:  { id: 'steel',  name: '百炼钢', icon: 'shield',         rarity: 'rare',      price: 160, desc: '百炼精钢，重甲与床弩专用。' },
  silk:   { id: 'silk',   name: '蜀锦',   icon: 'styler',         rarity: 'rare',      price: 150, desc: '名贵蜀锦，军旗与将袍用料。' },
  // 史诗
  blueprint: { id: 'blueprint', name: '兵械图', icon: 'architecture', rarity: 'epic',   price: 480, desc: '失传的兵械图纸，可高价交易或研究强化。' },
  dragonScale:{ id: 'dragonScale', name: '龙鳞', icon: 'auto_awesome', rarity: 'epic',  price: 520, desc: '传说蛟龙遗鳞，顶级护甲材料。' },
  // 传说
  tigerTally: { id: 'tigerTally', name: '虎符', icon: 'military_tech', rarity: 'legendary', price: 1200, desc: '调兵虎符，仅 BOSS 蛮王掉落，价值连城。' },
}

// 敌人掉落表：[物品id, 概率]
export interface DropEntry { item: string; rate: number }
export const DROP_TABLE: Record<string, DropEntry[]> = {
  bandit:  [{ item: 'wood', rate: 0.18 }, { item: 'leather', rate: 0.12 }],
  archer:  [{ item: 'wood', rate: 0.15 }, { item: 'herb', rate: 0.10 }],
  cavalry: [{ item: 'iron', rate: 0.18 }, { item: 'leather', rate: 0.12 }],
  heavy:   [{ item: 'iron', rate: 0.22 }, { item: 'steel', rate: 0.08 }],
  eagle:   [{ item: 'herb', rate: 0.16 }, { item: 'silk', rate: 0.06 }],
  siege:   [{ item: 'iron', rate: 0.30 }, { item: 'blueprint', rate: 0.10 }],
  brute:   [{ item: 'steel', rate: 0.20 }, { item: 'dragonScale', rate: 0.06 }],
  boss:    [{ item: 'tigerTally', rate: 1.0 }, { item: 'dragonScale', rate: 0.6 }, { item: 'gem', rate: 1.0 }],
}

// 滚动一次掉落：可能掉多个物品
export function rollLoot(enemyId: string): ItemDef[] {
  const table = DROP_TABLE[enemyId]
  if (!table) return []
  const drops: ItemDef[] = []
  for (const e of table) {
    if (Math.random() < e.rate) {
      const it = ITEMS[e.item]
      if (it) drops.push(it)
    }
  }
  return drops
}
