// 关卡：5 章 × 10 关 = 50 关
import { ASSETS } from './assets'
import { ENEMIES } from './enemies'

export interface Wave { enemy: string; count: number; gap: number; delay?: number }
export interface LevelDef {
  id: number
  chapter: number
  name: string
  bg: string
  startGrain: number
  baseHp: number
  waves: Wave[]
  reward: number
  boss?: boolean
}

export interface ChapterDef {
  name: string
  icon: string
  enemy: string
  bg: string
}

export const CHAPTERS: ChapterDef[] = [
  { name: '边境烽烟', icon: '山', enemy: '山贼流寇', bg: ASSETS.bg.grassland },
  { name: '荒漠戈壁', icon: '漠', enemy: '沙漠马贼', bg: ASSETS.bg.desert },
  { name: '雪域雄关', icon: '雪', enemy: '北方蛮族', bg: ASSETS.bg.snow },
  { name: '江南水乡', icon: '水', enemy: '水匪海寇', bg: ASSETS.bg.river },
  { name: '帝都决战', icon: '都', enemy: '叛军禁军', bg: ASSETS.bg.capital },
]

function makeWaves(spec: [string, number, number][]): Wave[] {
  return spec.map(([enemy, count, gap], i) => ({ enemy, count, gap, delay: i === 0 ? 2 : 0 }))
}

export const LEVELS: LevelDef[] = (() => {
  const list: LevelDef[] = []
  let id = 1
  const recipes: [number, [string, number, number][]][] = [
    // chapter, waves
    [0, [['bandit',4,1.8],['bandit',6,1.5],['archer',4,1.6],['bandit',8,1.2]]],
    [0, [['bandit',6,1.5],['archer',5,1.4],['bandit',8,1.2],['eagle',4,1.0]]],
    [0, [['bandit',8,1.2],['cavalry',3,1.8],['archer',6,1.3],['bandit',10,1.0]]],
    [0, [['cavalry',5,1.5],['archer',6,1.2],['heavy',2,2.2],['bandit',12,0.9]]],
    [0, [['heavy',3,2.0],['cavalry',6,1.3],['archer',8,1.0],['bandit',14,0.8]]],
    [0, [['eagle',8,0.9],['cavalry',6,1.2],['heavy',4,1.8],['archer',10,0.9]]],
    [0, [['bandit',16,0.8],['cavalry',8,1.0],['heavy',5,1.6],['archer',12,0.8]]],
    [0, [['heavy',6,1.5],['eagle',10,0.7],['cavalry',10,0.9],['archer',14,0.7]]],
    [0, [['siege',1,3],['heavy',8,1.4],['cavalry',12,0.8],['archer',16,0.6]]],
    [0, [['brute',2,2],['heavy',10,1.2],['cavalry',14,0.7],['boss',1,0]]],
    [1, [['bandit',12,1.0],['archer',10,1.0],['cavalry',8,1.0],['heavy',4,1.8]]],
    [1, [['cavalry',10,1.0],['eagle',12,0.8],['heavy',6,1.6],['archer',12,0.8]]],
    [1, [['heavy',8,1.4],['cavalry',12,0.9],['eagle',14,0.7],['bandit',20,0.6]]],
    [1, [['siege',2,2.5],['heavy',10,1.2],['cavalry',14,0.8],['archer',18,0.6]]],
    [1, [['brute',4,1.8],['heavy',12,1.0],['cavalry',16,0.7],['eagle',20,0.5]]],
    [1, [['siege',3,2],['brute',5,1.6],['heavy',14,0.9],['cavalry',18,0.6]]],
    [1, [['boss',1,0],['brute',6,1.5],['heavy',16,0.8],['cavalry',20,0.5]]],
    [2, [['heavy',14,0.9],['cavalry',18,0.6],['eagle',22,0.5],['brute',8,1.4]]],
    [2, [['siege',4,1.8],['brute',8,1.2],['heavy',18,0.7],['cavalry',22,0.5]]],
    [2, [['boss',2,1.5],['siege',5,1.6],['brute',12,1.0],['heavy',22,0.6]]],
    [3, [['brute',12,1.0],['siege',6,1.4],['heavy',22,0.6],['eagle',26,0.4]]],
    [3, [['boss',3,1.4],['brute',16,0.8],['siege',8,1.2],['cavalry',26,0.4]]],
    [4, [['boss',1,0],['siege',10,1.0],['brute',20,0.6],['heavy',30,0.4]]],
  ]
  // 扩展到 50 关
  while (recipes.length < 50) {
    const r = recipes[recipes.length - 1]
    recipes.push([r[0], r[1].map(w => [w[0], w[1] + 2, Math.max(0.4, w[2] - 0.05)] as [string, number, number])])
  }
  recipes.forEach((rec, i) => {
    const ch = rec[0]
    list.push({
      id,
      chapter: ch,
      name: `第 ${id} 关`,
      bg: CHAPTERS[ch].bg,
      startGrain: 380 + i * 12,
      baseHp: 20,
      waves: makeWaves(rec[1]),
      reward: 80 + i * 18,
      boss: id % 10 === 0,
    })
    id++
  })
  return list
})()

export function levelsOfChapter(ch: number): LevelDef[] {
  return LEVELS.filter(l => l.chapter === ch)
}

export function levelById(id: number): LevelDef | undefined {
  return LEVELS.find(l => l.id === id)
}
