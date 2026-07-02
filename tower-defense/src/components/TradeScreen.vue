<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { ITEMS, RARITY_COLOR, Rarity } from '../data/loot'
import { audio } from '../game/audio'

const store = useGameStore()
const tab = ref<'sell' | 'buy'>('sell')
const toast = ref('')

// 市场：所有物品可买卖
const marketList = computed(() => Object.values(ITEMS).sort((a, b) => a.price - b.price))

function sell(itemId: string) {
  if (store.sellItem(itemId, 1)) {
    const it = ITEMS[itemId]
    toast.value = `售出 ${it.name}，获得 ${it.price} 金币`
    audio.uiClick(); audio.coin()
    autoClear()
  }
}
function buy(itemId: string) {
  const it = ITEMS[itemId]
  const cost = Math.ceil(it.price * 1.3)
  if (store.buyItem(itemId, 1)) {
    toast.value = `购入 ${it.name}，花费 ${cost} 金币`
    audio.uiClick(); audio.build()
    autoClear()
  } else {
    toast.value = '金币不足'; autoClear()
  }
}
function sellAll() {
  let total = 0
  store.inventoryList.forEach(e => {
    const r = store.sellItem(e.item.id, e.count)
    if (r) total += e.item.price * e.count
  })
  if (total > 0) { toast.value = `一键售空，获得 ${total} 金币`; audio.coin(); audio.win() }
  else toast.value = '背包已空'
  autoClear()
}
let timer: any = null
function autoClear() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => toast.value = '', 2200)
}
</script>

<template>
  <section class="screen trade grain">
    <!-- Q 版 CSS 集市场景 -->
    <div class="scene">
      <div class="market-bg"></div>
      <div class="stall" v-for="i in 3" :key="i" :style="{ left: (8+i*28)+'%', bottom: '10%', transform: `scaleX(${i%2 ? 1 : -1})` }"><div class="stall-roof"></div><div class="stall-body"></div></div>
      <div class="lanterns" v-for="i in 5" :key="'l'+i" :style="{ left: (5+i*19)+'%', top: '8%', animationDelay: (i*0.4)+'s' }"></div>
    </div>

    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('main')"><span class="ms">arrow_back</span></button>
      <h1>集市交易</h1>
      <div class="gold-chip"><span class="ms si">payments</span>{{ store.gold.toLocaleString() }}</div>
    </header>

    <div class="tabs">
      <div :class="['t', { on: tab==='sell' }]" @click="tab='sell'"><span class="ms si">backpack</span>出售</div>
      <div :class="['t', { on: tab==='buy' }]" @click="tab='buy'"><span class="ms si">storefront</span>收购</div>
    </div>

    <div class="info-bar">
      <span>背包价值 <b class="v">{{ store.inventoryValue }}</b> 金币</span>
      <button class="sell-all" v-if="tab==='sell' && store.inventoryList.length" @click="sellAll"><span class="ms si">sell</span>一键售空</button>
    </div>

    <div class="list">
      <!-- 出售：显示背包 -->
      <template v-if="tab==='sell'">
        <div v-if="!store.inventoryList.length" class="empty">
          <span class="ms">backpack</span>
          <p>背包空空如也，去战斗击杀敌军获取战利品吧！</p>
        </div>
        <div v-for="e in store.inventoryList" :key="e.item.id" :class="['card', e.item.rarity]">
          <div class="ic" :style="{ color: RARITY_COLOR[e.item.rarity as Rarity] }"><span class="ms">{{ e.item.icon }}</span></div>
          <div class="info">
            <div class="nm">{{ e.item.name }} <span class="rt" :style="{ color: RARITY_COLOR[e.item.rarity as Rarity] }">{{ e.item.rarity }}</span> <span class="cnt">×{{ e.count }}</span></div>
            <div class="ds">{{ e.item.desc }}</div>
          </div>
          <button class="op sell" @click="sell(e.item.id)">售 {{ e.item.price }}</button>
        </div>
      </template>
      <!-- 收购：显示市场 -->
      <template v-else>
        <div v-for="it in marketList" :key="it.id" :class="['card', it.rarity]">
          <div class="ic" :style="{ color: RARITY_COLOR[it.rarity] }"><span class="ms">{{ it.icon }}</span></div>
          <div class="info">
            <div class="nm">{{ it.name }} <span class="rt" :style="{ color: RARITY_COLOR[it.rarity] }">{{ it.rarity }}</span></div>
            <div class="ds">{{ it.desc }}</div>
          </div>
          <button class="op buy" :disabled="store.gold < Math.ceil(it.price * 1.3)" @click="buy(it.id)">购 {{ Math.ceil(it.price * 1.3) }}</button>
        </div>
      </template>
    </div>

    <transition name="fade">
      <div class="toast" v-if="toast"><span class="ms si">campaign</span>{{ toast }}</div>
    </transition>
  </section>
</template>

<style scoped>
.trade { background: linear-gradient(180deg, #1a1410 0%, #2a1f14 100%); }
/* === Q 版 CSS 集市场景 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.market-bg { position: absolute; inset: 0; background: linear-gradient(180deg, #3a2a18 0%, #d4944a 20%, #e8c888 35%, #6a4a2a 70%, #1a0e04 100%); }
.stall { position: absolute; width: 60px; }
.stall-roof { width: 70px; height: 24px; margin-left: -5px; background: linear-gradient(180deg, var(--crimson), #5a0000); clip-path: polygon(10% 100%, 0 50%, 50% 0, 100% 50%, 90% 100%); border-bottom: 2px solid var(--gold); }
.stall-body { width: 60px; height: 28px; background: linear-gradient(180deg, #5a3a1a, #2a1808); border-radius: 0 0 4px 4px; border: 1px solid rgba(212,164,55,0.3); border-top: none; }
.lanterns { position: absolute; width: 14px; height: 18px; background: var(--crimson); border: 1px solid var(--gold); border-radius: 50%; animation: lanternSway 3s ease-in-out infinite; transform-origin: top center; box-shadow: 0 0 10px rgba(255,140,60,0.5); }
.lanterns::before { content: ''; position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 1px; height: 4px; background: #3a2410; }
@keyframes lanternSway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.hd { position: relative; z-index: 3; display: flex; align-items: center; gap: 10px; padding: 14px 16px; }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 22px; padding: 0; display: flex; align-items: center; justify-content: center; }
.hd h1 { flex: 1; font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.gold-chip { display: flex; align-items: center; gap: 3px; padding: 6px 12px; border-radius: 14px; background: rgba(0,0,0,0.55); border: 1px solid rgba(212,164,55,0.4); color: var(--gold-light); font-family: var(--font-num); font-size: 13px; font-weight: 700; }

.tabs { position: relative; z-index: 3; display: flex; gap: 6px; padding: 0 14px 10px; }
.t { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; text-align: center; padding: 9px; border-radius: 10px; font-size: 13px; font-weight: 600; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.45); cursor: pointer; border: 1px solid transparent; transition: all .2s; }
.t.on { background: rgba(212,164,55,0.15); color: var(--gold); border-color: var(--gold); }

.info-bar { position: relative; z-index: 3; display: flex; justify-content: space-between; align-items: center; margin: 0 14px 8px; padding: 8px 12px; background: rgba(212,164,55,0.08); border-radius: 8px; font-size: 12px; color: rgba(255,255,255,0.7); }
.v { color: var(--gold); font-family: var(--font-num); }
.sell-all { display: flex; align-items: center; gap: 2px; padding: 4px 10px; border-radius: 8px; background: var(--crimson); color: var(--gold-light); border: 1px solid var(--gold); font-size: 11px; cursor: pointer; }

.list { position: relative; z-index: 3; flex: 1; overflow-y: auto; padding: 0 14px 20px; display: flex; flex-direction: column; gap: 8px; }
.empty { text-align: center; color: rgba(255,255,255,0.4); padding: 40px 0; }
.empty .ms { font-size: 48px; color: rgba(212,164,55,0.3); }
.empty p { font-size: 13px; margin-top: 8px; }
.card { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(212,164,55,0.2); border-radius: 12px; border-left-width: 3px; }
.card.common { border-left-color: #9e9e9e; }
.card.rare { border-left-color: #4fc3f7; }
.card.epic { border-left-color: #ba68c8; }
.card.legendary { border-left-color: #ffb300; box-shadow: 0 0 12px rgba(255,179,0,0.2); }
.ic { width: 44px; height: 44px; border-radius: 10px; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.info { flex: 1; min-width: 0; }
.nm { font-size: 14px; font-weight: 700; color: var(--gold-light); display: flex; align-items: center; gap: 6px; }
.rt { font-size: 9px; text-transform: uppercase; opacity: 0.8; }
.cnt { font-family: var(--font-num); font-size: 12px; color: var(--gold); }
.ds { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 2px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.op { flex-shrink: 0; padding: 8px 12px; border-radius: 8px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--font-body); }
.op.sell { background: linear-gradient(135deg, var(--gold-deep), var(--gold)); color: var(--ink); }
.op.buy { background: rgba(46,125,91,0.3); color: #6BFF9E; border: 1px solid rgba(107,255,158,0.4); }
.op.buy:disabled { opacity: 0.35; cursor: not-allowed; }
.op:active:not(:disabled) { transform: scale(0.94); }

.si { font-size: 16px; color: var(--gold); }
.toast { position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.88); color: var(--gold-light); padding: 10px 18px; border-radius: 20px; border: 1px solid var(--gold); font-size: 13px; z-index: 99; }
.fade-enter-active, .fade-leave-active { transition: opacity .3s, transform .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
