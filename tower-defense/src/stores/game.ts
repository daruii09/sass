import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RANKS, rankByClears } from '../data/commander'

export type ScreenName =
  | 'splash' | 'auth' | 'main' | 'commander' | 'codex'
  | 'levels' | 'battle' | 'result' | 'exchange'

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

  const rankIndex = computed(() => rankByClears(totalClears.value))
  const rank = computed(() => RANKS[rankIndex.value])
  const nextRank = computed(() => RANKS[rankIndex.value + 1] || null)

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

  return {
    screen, user, gold, cash, totalClears, levelStars, lastResult,
    currentLevelId, signDay, signedToday,
    rankIndex, rank, nextRank,
    go, login, addGold, recordResult, exchange,
  }
})
