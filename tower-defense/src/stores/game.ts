import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RANKS, rankByClears } from '../data/commander'
import { ITEMS, ItemDef } from '../data/loot'

export type ScreenName =
  | 'splash' | 'auth' | 'main' | 'commander' | 'codex'
  | 'levels' | 'battle' | 'result' | 'exchange' | 'trade'
  | 'profile' | 'mine' | 'gacha' | 'world' | 'pvp' | 'alliance'

export const useGameStore = defineStore('game', () => {
  const screen = ref<ScreenName>('splash')
  const user = ref<{ name: string; isGuest: boolean } | null>(null)
  const gold = ref(5000)
  const cash = ref(0)
  const totalClears = ref(0)        // 累计通关次数（主帅经验）
  const levelStars = ref<Record<number, number>>({})  // {levelId: stars}
  const lastResult = ref<{ win: boolean; gold: number; levelId: number } | null>(null)
  const currentLevelId = ref(1)
  const signDay = ref(0)
  const signedToday = ref(false)
  // 背包：{itemId: 数量}
  const inventory = ref<Record<string, number>>({})
  // 最近一次掉落提示队列（战斗中展示）
  const lootToast = ref<{ id: string; name: string; icon: string; rarity: string; t: number } | null>(null)

  // === 音乐开关 ===
  const musicOn = ref(true)

  // === 好友系统 ===
  const friends = ref<{ name: string; code: string; addedAt: number }[]>([])
  const myInviteCode = ref('')

  // === 用户交易商品 ===
  interface UserProduct { id: string; name: string; icon: string; price: number; seller: string; desc: string }
  const userProducts = ref<UserProduct[]>([])

  // === 挖矿系统 ===
  interface MineDevice { id: string; name: string; icon: string; level: number; hashRate: number; cost: number; owned: number }
  const mineDevices = ref<MineDevice[]>([
    { id: 'pick', name: '铁镐', icon: 'hardware', level: 1, hashRate: 10, cost: 500, owned: 0 },
    { id: 'rig', name: '矿机', icon: 'precision_manufacturing', level: 2, hashRate: 50, cost: 2000, owned: 0 },
    { id: 'farm', name: '矿场', icon: 'domain', level: 3, hashRate: 200, cost: 8000, owned: 0 },
    { id: 'factory', name: '兵工厂', icon: 'factory', level: 4, hashRate: 800, cost: 30000, owned: 0 },
    { id: 'dragon', name: '龙脉矿', icon: 'auto_awesome', level: 5, hashRate: 3000, cost: 120000, owned: 0 },
  ])
  const totalHashRate = computed(() => mineDevices.value.reduce((s, d) => s + d.hashRate * d.owned, 0))
  const mineLog = ref<{ time: number; hash: string; amount: number }[]>([])
  const mineEarnings = ref(0) // 今日累计收益

  // === 武将孵化池 ===
  interface GachaHero { id: string; name: string; icon: string; rarity: string; atk: number; def: number }
  const ownedHeroes = ref<GachaHero[]>([])
  const gachaCost = ref(300) // 单抽 300 金币

  // === PvP 对战 ===
  // PvP 需军阶 >= 3 才开放（pvpUnlock 在 rankIndex 定义后声明）
  const PVP_UNLOCK_RANK = 3
  const pvpRank = ref(1000)  // ELO 积分
  const pvpWins = ref(0)
  const pvpLoses = ref(0)
  const pvpHistory = ref<{ time: number; opp: string; result: 'win'|'lose'; delta: number }[]>([])
  const matching = ref(false)
  const matchProgress = ref(0)

  // === 结盟系统 ===
  // 结盟需军阶 >= 4 才开放（allianceUnlock 在 rankIndex 定义后声明）
  const ALLIANCE_UNLOCK_RANK = 4
  interface Alliance { id: string; name: string; members: string[]; leader: string; createdAt: number }
  const myAlliance = ref<Alliance | null>(null)
  const allianceInvites = ref<{ from: string; allianceName: string; t: number }[]>([])

  // === 掠夺加速令 ===
  const speedTokens = ref(0)  // 加速令数量
  const garrison = ref<Record<string, number>>({})  // 城池驻兵 {regionId: count}

  const rankIndex = computed(() => rankByClears(totalClears.value))
  const rank = computed(() => RANKS[rankIndex.value])
  const nextRank = computed(() => RANKS[rankIndex.value + 1] || null)
  const pvpUnlock = computed(() => rankIndex.value + 1 >= PVP_UNLOCK_RANK)
  const allianceUnlock = computed(() => rankIndex.value + 1 >= ALLIANCE_UNLOCK_RANK)

  // 背包物品列表（带数量与定义）
  const inventoryList = computed(() => {
    return Object.entries(inventory.value)
      .filter(([id, n]) => n > 0 && ITEMS[id])
      .map(([id, n]) => ({ item: ITEMS[id] as ItemDef, count: n }))
  })
  // 背包总价值
  const inventoryValue = computed(() =>
    inventoryList.value.reduce((s, e) => s + e.item.price * e.count, 0)
  )

  function go(s: ScreenName) { screen.value = s }
  function login(name: string, isGuest: boolean) {
    user.value = { name, isGuest }
    go('main')
  }
  function addGold(n: number) { gold.value = Math.max(0, gold.value + n) }
  function recordResult(win: boolean, levelId: number, reward: number) {
    lastResult.value = { win, gold: win ? reward : Math.floor(reward / 5), levelId }
    if (win) {
      addGold(lastResult.value.gold)
      if (!levelStars.value[levelId]) levelStars.value[levelId] = 1
      totalClears.value++
    }
  }
  function exchange(amount: number) {
    if (gold.value < amount) return false
    gold.value -= amount
    cash.value += amount / 10000
    return true
  }
  // 添加掉落物品到背包
  function addLoot(itemId: string) {
    inventory.value[itemId] = (inventory.value[itemId] || 0) + 1
    const it = ITEMS[itemId]
    if (it) lootToast.value = { id: it.id, name: it.name, icon: it.icon, rarity: it.rarity, t: Date.now() }
  }
  // 出售物品（交易系统）：换金币
  function sellItem(itemId: string, count = 1): boolean {
    if ((inventory.value[itemId] || 0) < count) return false
    const it = ITEMS[itemId]
    if (!it) return false
    inventory.value[itemId] -= count
    if (inventory.value[itemId] <= 0) delete inventory.value[itemId]
    gold.value += Math.floor(it.price * count)
    return true
  }
  // 购买物品（交易系统）：花金币（市价略有溢价）
  function buyItem(itemId: string, count = 1): boolean {
    const it = ITEMS[itemId]
    if (!it) return false
    const cost = Math.ceil(it.price * 1.3) * count
    if (gold.value < cost) return false
    gold.value -= cost
    inventory.value[itemId] = (inventory.value[itemId] || 0) + count
    return true
  }
  function clearLootToast() { lootToast.value = null }

  // === 音乐 ===
  function toggleMusic() { musicOn.value = !musicOn.value }

  // === 好友 ===
  function genInviteCode() { myInviteCode.value = 'FH' + Math.random().toString(36).slice(2, 8).toUpperCase() }
  function addFriend(name: string, code: string) {
    if (friends.value.find(f => f.code === code)) return false
    friends.value.push({ name, code, addedAt: Date.now() })
    return true
  }

  // === 用户交易 ===
  function addUserProduct(name: string, price: number, icon: string, desc: string) {
    const id = 'up_' + Date.now()
    userProducts.value.push({ id, name, icon, price, seller: user.value?.name || '未知', desc })
  }
  function removeUserProduct(id: string) {
    userProducts.value = userProducts.value.filter(p => p.id !== id)
  }

  // === 挖矿 ===
  function buyMineDevice(deviceId: string) {
    const d = mineDevices.value.find(x => x.id === deviceId)
    if (!d || gold.value < d.cost) return false
    gold.value -= d.cost
    d.owned++
    return true
  }
  // 随机生成哈希值
  function genHash(): string {
    return '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  }
  // 挖矿收益（每秒根据哈希率产出）
  function mineTick() {
    if (totalHashRate.value <= 0) return
    const amount = Math.floor(totalHashRate.value * (0.8 + Math.random() * 0.4))
    mineEarnings.value += amount
    gold.value += amount
    mineLog.value.unshift({ time: Date.now(), hash: genHash(), amount })
    if (mineLog.value.length > 50) mineLog.value.length = 50
  }
  function resetDailyEarnings() { mineEarnings.value = 0 }

  // === 武将孵化 ===
  function gachaPull(): GachaHero | null {
    if (gold.value < gachaCost.value) return null
    gold.value -= gachaCost.value
    const roll = Math.random()
    let rarity: string, pool: { id: string; name: string; icon: string; atk: number; def: number }[]
    if (roll < 0.02) { rarity = 'legendary'; pool = GA_POOL.legendary }
    else if (roll < 0.1) { rarity = 'epic'; pool = GA_POOL.epic }
    else if (roll < 0.35) { rarity = 'rare'; pool = GA_POOL.rare }
    else { rarity = 'common'; pool = GA_POOL.common }
    const hero = pool[Math.floor(Math.random() * pool.length)]
    const h = { ...hero, rarity }
    ownedHeroes.value.push(h)
    return h
  }

  // === PvP 对战 ===
  const OPP_NAMES = ['破阵子', '铁血侯', '镇北王', '平南将', '征西大将军', '靖海伯', '安西都护', '骁骑营']
  function startMatch() {
    if (!pvpUnlock.value || matching.value) return
    matching.value = true
    matchProgress.value = 0
  }
  // 模拟匹配完成：返回对手信息
  function finishMatch(): { opp: string; oppRank: number; oppPower: number } {
    matching.value = false
    const opp = OPP_NAMES[Math.floor(Math.random() * OPP_NAMES.length)]
    const oppRank = pvpRank.value + Math.floor((Math.random() - 0.5) * 200)
    const oppPower = 500 + Math.floor(Math.random() * 1500)
    return { opp, oppRank, oppPower }
  }
  // 结算对战
  function settlePvp(opp: string, win: boolean) {
    const delta = win ? 20 + Math.floor(Math.random() * 30) : -(15 + Math.floor(Math.random() * 25))
    pvpRank.value = Math.max(0, pvpRank.value + delta)
    if (win) { pvpWins.value++; addGold(200 + Math.floor(Math.random() * 300)) }
    else pvpLoses.value++
    pvpHistory.value.unshift({ time: Date.now(), opp, result: win ? 'win' : 'lose', delta })
    if (pvpHistory.value.length > 20) pvpHistory.value.length = 20
  }

  // === 结盟 ===
  function createAlliance(name: string) {
    if (!allianceUnlock.value || myAlliance.value) return false
    myAlliance.value = { id: 'al_' + Date.now(), name, members: [user.value?.name || '主帅'], leader: user.value?.name || '主帅', createdAt: Date.now() }
    return true
  }
  function leaveAlliance() { myAlliance.value = null }
  function inviteToAlliance(playerName: string) {
    if (!myAlliance.value) return false
    if (myAlliance.value.members.length >= 3) return false  // 最多三方结盟
    if (myAlliance.value.members.includes(playerName)) return false
    myAlliance.value.members.push(playerName)
    return true
  }
  // 判断某玩家是否为盟友
  function isAlly(playerName: string): boolean {
    return !!myAlliance.value && myAlliance.value.members.includes(playerName)
  }

  // === 加速令 ===
  function buySpeedToken(count = 1) {
    const cost = 200 * count
    if (gold.value < cost) return false
    gold.value -= cost
    speedTokens.value += count
    return true
  }
  function useSpeedToken(): boolean {
    if (speedTokens.value <= 0) return false
    speedTokens.value--
    return true
  }
  // 驻兵
  function deployGarrison(regionId: string, count: number) {
    garrison.value[regionId] = (garrison.value[regionId] || 0) + count
  }

  return {
    screen, user, gold, cash, totalClears, levelStars, lastResult,
    currentLevelId, signDay, signedToday, inventory, lootToast,
    rankIndex, rank, nextRank, inventoryList, inventoryValue,
    musicOn, friends, myInviteCode, userProducts,
    mineDevices, totalHashRate, mineLog, mineEarnings,
    ownedHeroes, gachaCost,
    pvpUnlock, pvpRank, pvpWins, pvpLoses, pvpHistory, matching, matchProgress,
    allianceUnlock, myAlliance, allianceInvites,
    speedTokens, garrison,
    go, login, addGold, recordResult, exchange,
    addLoot, sellItem, buyItem, clearLootToast,
    toggleMusic, genInviteCode, addFriend,
    addUserProduct, removeUserProduct,
    buyMineDevice, mineTick, resetDailyEarnings,
    gachaPull,
    startMatch, finishMatch, settlePvp,
    createAlliance, leaveAlliance, inviteToAlliance, isAlly,
    buySpeedToken, useSpeedToken, deployGarrison,
  }
})

// === 武将孵化池数据 ===
const GA_POOL = {
  common: [
    { id: 'gc1', name: '步卒', icon: 'person', atk: 10, def: 8 },
    { id: 'gc2', name: '弓手', icon: 'north_east', atk: 14, def: 5 },
    { id: 'gc3', name: '枪兵', icon: 'arrow_forward', atk: 12, def: 10 },
    { id: 'gc4', name: '斥候', icon: 'directions_run', atk: 8, def: 6 },
  ],
  rare: [
    { id: 'gr1', name: '校刀手', icon: 'hardware', atk: 22, def: 16 },
    { id: 'gr2', name: '弩手', icon: 'gps_fixed', atk: 26, def: 10 },
    { id: 'gr3', name: '铁骑', icon: 'directions_horse', atk: 28, def: 18 },
  ],
  epic: [
    { id: 'ge1', name: '虎贲卫', icon: 'shield', atk: 40, def: 35 },
    { id: 'ge2', name: '神射手', icon: 'my_location', atk: 48, def: 20 },
    { id: 'ge3', name: '陷阵营', icon: 'fitness_center', atk: 52, def: 40 },
  ],
  legendary: [
    { id: 'gl1', name: '吕布', icon: 'crown', atk: 90, def: 60 },
    { id: 'gl2', name: '赵云', icon: 'star', atk: 85, def: 75 },
    { id: 'gl3', name: '诸葛亮', icon: 'psychology', atk: 70, def: 80 },
  ],
}
