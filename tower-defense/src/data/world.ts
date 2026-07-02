export interface WorldRegion {
  id: string
  name: string       // e.g. "京师", "南京", "西安", "成都", "广州", "沈阳", "开封", "武昌", "杭州", "福州", "昆明", "兰州"
  type: 'capital' | 'city' | 'town' | 'fortress'
  x: number          // percentage position on map (0-100)
  y: number          // percentage position on map (0-100)
  owner: string | null   // player name who owns it, null = NPC
  defense: number    // defense power (0-100)
  plunderTime: number // minutes to plunder
  resourceBonus: number // gold bonus multiplier
  connectedTo: string[] // adjacent region IDs
}

export const WORLD_MAP: WorldRegion[] = [
  {
    id: 'beijing', name: '京师', type: 'capital',
    x: 72, y: 18, owner: null, defense: 30,
    plunderTime: 15, resourceBonus: 2.5,
    connectedTo: ['shenyang', 'taiyuan', 'jinan', 'nanjing'],
  },
  {
    id: 'nanjing', name: '南京', type: 'city',
    x: 68, y: 42, owner: null, defense: 25,
    plunderTime: 12, resourceBonus: 2.0,
    connectedTo: ['beijing', 'jinan', 'kaifeng', 'hangzhou', 'nanchang'],
  },
  {
    id: 'xian', name: '西安', type: 'city',
    x: 48, y: 32, owner: null, defense: 22,
    plunderTime: 10, resourceBonus: 1.8,
    connectedTo: ['lanzhou', 'taiyuan', 'kaifeng', 'chengdu'],
  },
  {
    id: 'chengdu', name: '成都', type: 'city',
    x: 35, y: 48, owner: null, defense: 20,
    plunderTime: 10, resourceBonus: 1.8,
    connectedTo: ['xian', 'lanzhou', 'kunming', 'changsha', 'wuchang'],
  },
  {
    id: 'guangzhou', name: '广州', type: 'city',
    x: 55, y: 72, owner: null, defense: 18,
    plunderTime: 8, resourceBonus: 1.6,
    connectedTo: ['changsha', 'nanchang', 'fuzhou'],
  },
  {
    id: 'shenyang', name: '沈阳', type: 'fortress',
    x: 78, y: 12, owner: null, defense: 28,
    plunderTime: 12, resourceBonus: 1.5,
    connectedTo: ['beijing'],
  },
  {
    id: 'kaifeng', name: '开封', type: 'city',
    x: 62, y: 35, owner: null, defense: 18,
    plunderTime: 8, resourceBonus: 1.5,
    connectedTo: ['taiyuan', 'xian', 'nanjing', 'jinan', 'wuchang'],
  },
  {
    id: 'wuchang', name: '武昌', type: 'city',
    x: 60, y: 50, owner: null, defense: 16,
    plunderTime: 7, resourceBonus: 1.4,
    connectedTo: ['kaifeng', 'nanjing', 'nanchang', 'changsha', 'chengdu'],
  },
  {
    id: 'hangzhou', name: '杭州', type: 'city',
    x: 72, y: 48, owner: null, defense: 16,
    plunderTime: 7, resourceBonus: 1.4,
    connectedTo: ['nanjing', 'nanchang', 'fuzhou'],
  },
  {
    id: 'fuzhou', name: '福州', type: 'town',
    x: 68, y: 62, owner: null, defense: 14,
    plunderTime: 6, resourceBonus: 1.3,
    connectedTo: ['hangzhou', 'nanchang', 'guangzhou'],
  },
  {
    id: 'kunming', name: '昆明', type: 'town',
    x: 30, y: 62, owner: null, defense: 14,
    plunderTime: 6, resourceBonus: 1.3,
    connectedTo: ['chengdu', 'guangzhou'],
  },
  {
    id: 'lanzhou', name: '兰州', type: 'fortress',
    x: 38, y: 28, owner: null, defense: 20,
    plunderTime: 8, resourceBonus: 1.2,
    connectedTo: ['xian', 'chengdu'],
  },
  {
    id: 'taiyuan', name: '太原', type: 'city',
    x: 58, y: 25, owner: null, defense: 16,
    plunderTime: 7, resourceBonus: 1.3,
    connectedTo: ['beijing', 'xian', 'kaifeng'],
  },
  {
    id: 'jinan', name: '济南', type: 'city',
    x: 68, y: 30, owner: null, defense: 15,
    plunderTime: 6, resourceBonus: 1.2,
    connectedTo: ['beijing', 'nanjing', 'kaifeng'],
  },
  {
    id: 'changsha', name: '长沙', type: 'town',
    x: 55, y: 58, owner: null, defense: 14,
    plunderTime: 5, resourceBonus: 1.2,
    connectedTo: ['wuchang', 'nanchang', 'guangzhou', 'chengdu', 'kunming'],
  },
  {
    id: 'nanchang', name: '南昌', type: 'town',
    x: 65, y: 55, owner: null, defense: 12,
    plunderTime: 5, resourceBonus: 1.1,
    connectedTo: ['nanjing', 'wuchang', 'hangzhou', 'fuzhou', 'guangzhou', 'changsha'],
  },
]