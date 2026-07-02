import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RANKS, rankByClears } from '../data/commander'
import { ITEMS, ItemDef } from '../data/loot'

export type ScreenName =
  | 'splash' | 'auth' | 'main' | 'commander' | 'codex'
  | 'levels' | 'battle' | 'result' | 'exchange' | 'trade'

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

  const rankIndex = computed(() => rankByClears(totalClears.value))
  const rank = computed(() => RANKS[rankIndex.value])
  const nextRank = computed(() => RANKS[rankIndex.value + 1] || null)

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

  return {
    screen, user, gold, cash, totalClears, levelStars, lastResult,
    currentLevelId, signDay, signedToday, inventory, lootToast,
    rankIndex, rank, nextRank, inventoryList, inventoryValue,
    go, login, addGold, recordResult, exchange,
    addLoot, sellItem, buyItem, clearLootToast,
  }
})
