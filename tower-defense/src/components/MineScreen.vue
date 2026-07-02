<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import { audio } from '../game/audio'

const store = useGameStore()

const mineInterval = ref<number>(0)
const activeTab = ref<'devices' | 'earnings'>('devices')

const totalHash = computed(() => store.totalHashRate)
const logList = computed(() => store.mineLog.slice(0, 50))
const earningsPerSec = computed(() => totalHash.value)

onMounted(() => {
  mineInterval.value = window.setInterval(() => store.mineTick(), 1000)
})

onUnmounted(() => {
  clearInterval(mineInterval.value)
})

function buyDevice(deviceId: string) {
  if (store.buyMineDevice(deviceId)) {
    audio.coin()
  }
}

function formatTime(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function truncateHash(hash: string) {
  return hash.length > 12 ? hash.slice(0, 8) + '...' + hash.slice(-4) : hash
}

function levelBg(level: number): string {
  const map: Record<number, string> = {
    1: '#4a3a2a',
    2: '#3a4a5a',
    3: '#5a3a6a',
    4: '#6a4a3a',
    5: '#8a6a2a',
  }
  return map[level] || '#4a3a2a'
}

function levelBorder(level: number): string {
  const map: Record<number, string> = {
    1: 'rgba(212,164,55,0.35)',
    2: 'rgba(79,195,247,0.5)',
    3: 'rgba(186,104,200,0.5)',
    4: 'rgba(255,138,101,0.5)',
    5: '#ffb300',
  }
  return map[level] || 'rgba(212,164,55,0.35)'
}
</script>

<template>
  <section class="screen mine grain">
    <!-- 地下矿洞场景背景 -->
    <div class="scene">
      <div class="cave-bg"></div>
      <div class="gold-vein v1"></div>
      <div class="gold-vein v2"></div>
      <div class="gold-vein v3"></div>
      <div class="sparkle s1"></div>
      <div class="sparkle s2"></div>
      <div class="sparkle s3"></div>
      <div class="sparkle s4"></div>
      <div class="sparkle s5"></div>
      <div class="sparkle s6"></div>
      <div class="sparkle s7"></div>
      <div class="sparkle s8"></div>
    </div>
    <div class="bg-overlay"></div>

    <!-- 头部 -->
    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('profile')">
        <span class="ms">arrow_back</span>
      </button>
      <div class="hd-info">
        <h1>挖矿工坊</h1>
        <div class="hd-stats">
          <span class="hd-stat">
            <span class="hd-label">算力</span>
            <span class="hd-val">{{ totalHash }} H/s</span>
          </span>
          <span class="hd-stat">
            <span class="hd-label">今日收益</span>
            <span class="hd-val gold-text">{{ store.mineEarnings.toLocaleString() }}</span>
          </span>
        </div>
      </div>
      <span class="spacer"></span>
    </header>

    <!-- 标签栏 -->
    <div class="tabs">
      <div :class="['t', { on: activeTab === 'devices' }]" @click="activeTab = 'devices'">矿机设备</div>
      <div :class="['t', { on: activeTab === 'earnings' }]" @click="activeTab = 'earnings'">收益记录</div>
    </div>

    <!-- 标签 1：矿机设备 -->
    <div class="body" v-if="activeTab === 'devices'">
      <!-- 哈希率展示 -->
      <div class="hash-display">
        <div class="hash-big">
          <span class="hash-num">{{ totalHash }}</span>
          <span class="hash-unit">H/s</span>
        </div>
        <div class="hash-ring"></div>
        <div class="earnings-rate">
          <span class="earnings-label">每秒收益</span>
          <span class="earnings-val gold-text">{{ earningsPerSec }} 金/秒</span>
        </div>
      </div>

      <!-- 矿机卡片网格 -->
      <div class="device-grid">
        <div
          v-for="d in store.mineDevices"
          :key="d.id"
          class="device-card"
          :style="{ background: `linear-gradient(160deg, ${levelBg(d.level)}, ${levelBg(d.level)}dd)` }"
        >
          <div class="card-border" :style="{ borderColor: levelBorder(d.level) }"></div>
          <div class="card-icon">
            <span class="ms">{{ d.icon }}</span>
          </div>
          <div class="card-body">
            <div class="card-name">{{ d.name }}</div>
            <div class="card-level">Lv.{{ d.level }}</div>
            <div class="card-owned">拥有 {{ d.owned }}</div>
            <div class="card-hash">算力 {{ d.hashRate }} H/s</div>
            <div class="card-cost gold-text">{{ d.cost.toLocaleString() }} 金</div>
            <button
              class="btn btn-crimson card-btn"
              :disabled="store.gold < d.cost"
              @click="buyDevice(d.id)"
            >
              购买
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签 2：收益记录 -->
    <div class="body" v-if="activeTab === 'earnings'">
      <!-- 今日总收益 -->
      <div class="today-earnings card">
        <div class="today-label">今日总收益</div>
        <div class="today-amount gold-text">{{ store.mineEarnings.toLocaleString() }} 金</div>
      </div>

      <!-- 收益日志列表 -->
      <div class="log-list" v-if="logList.length">
        <div
          v-for="(entry, i) in logList"
          :key="entry.time + '-' + i"
          :class="['log-row', { odd: i % 2 === 0 }]"
        >
          <span class="log-time">{{ formatTime(entry.time) }}</span>
          <span class="log-hash">{{ truncateHash(entry.hash) }}</span>
          <span class="log-amount gold-text">+{{ entry.amount }} 金</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-log card" v-else>
        <span class="ms">inbox</span>
        <p>暂无收益记录，部署矿机开始挖矿吧！</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mine { background: linear-gradient(180deg, #1a1008 0%, #0d0805 100%); }

/* === 地下矿洞场景 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.cave-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 30% 20%, #3a2210 0%, transparent 55%),
    radial-gradient(ellipse at 70% 60%, #2a1a08 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, #1a0e04 0%, #0d0805 100%);
}

/* 金脉纹理 */
.gold-vein {
  position: absolute; border-radius: 50%;
  background: radial-gradient(ellipse, var(--gold-light) 0%, var(--gold) 20%, transparent 70%);
  opacity: 0.12; filter: blur(3px);
  animation: veinPulse 4s ease-in-out infinite;
}
.v1 { width: 180px; height: 40px; top: 18%; left: 10%; transform: rotate(-15deg); animation-delay: 0s; }
.v2 { width: 140px; height: 30px; top: 52%; right: 8%; transform: rotate(20deg); animation-delay: -1.5s; }
.v3 { width: 200px; height: 35px; bottom: 22%; left: 20%; transform: rotate(-8deg); animation-delay: -3s; }
@keyframes veinPulse {
  0%, 100% { opacity: 0.08; }
  50% { opacity: 0.18; }
}

/* 金色闪烁粒子 */
.sparkle {
  position: absolute; width: 4px; height: 4px;
  background: var(--gold-light); border-radius: 50%;
  box-shadow: 0 0 6px var(--gold), 0 0 12px var(--gold-light);
  animation: sparkleFloat 3s ease-in-out infinite;
  pointer-events: none;
}
.s1 { top: 15%; left: 25%; animation-delay: 0s; }
.s2 { top: 28%; right: 22%; animation-delay: -0.8s; }
.s3 { top: 42%; left: 35%; animation-delay: -1.6s; animation-duration: 3.5s; }
.s4 { top: 55%; right: 40%; animation-delay: -2.2s; }
.s5 { top: 68%; left: 18%; animation-delay: -0.4s; animation-duration: 2.8s; }
.s6 { top: 78%; right: 15%; animation-delay: -1.2s; }
.s7 { top: 33%; left: 55%; animation-delay: -2.8s; animation-duration: 3.2s; }
.s8 { top: 88%; left: 45%; animation-delay: -1.8s; }
@keyframes sparkleFloat {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
  50% { opacity: 0.9; transform: translateY(-8px) scale(1.2); }
}

.bg-overlay {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(10,5,3,0.6) 0%, transparent 20%, transparent 75%, rgba(10,5,3,0.9) 100%);
}

/* === 头部 === */
.hd { position: relative; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 22px; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hd-info { flex: 1; min-width: 0; }
.hd-info h1 {
  font-family: var(--font-display); font-size: 20px; color: var(--gold);
  letter-spacing: 2px; margin-bottom: 4px;
}
.hd-stats { display: flex; gap: 16px; }
.hd-stat { display: flex; align-items: center; gap: 4px; font-size: 11px; }
.hd-label { color: rgba(255,255,255,0.45); }
.hd-val { color: var(--gold-light); font-family: var(--font-num); font-size: 12px; }
.spacer { width: 38px; flex-shrink: 0; }

/* === 标签栏 === */
.tabs {
  position: relative; z-index: 3;
  display: flex; margin: 0 16px; gap: 0;
  border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(212,164,55,0.2);
}
.t {
  flex: 1; text-align: center; padding: 10px 0;
  font-family: var(--font-display); font-size: 14px;
  color: rgba(255,255,255,0.5); cursor: pointer;
  background: rgba(0,0,0,0.3);
  transition: background .25s, color .25s;
}
.t.on {
  background: rgba(212,164,55,0.18); color: var(--gold-light);
  box-shadow: inset 0 -2px 0 var(--gold);
}
.t:active { transform: scale(0.97); }

/* === 滚动区域 === */
.body {
  position: relative; z-index: 3; flex: 1; overflow-y: auto;
  padding: 12px 16px 22px; display: flex; flex-direction: column; gap: 12px;
}

/* === 哈希率展示 === */
.hash-display {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  padding: 22px 0 16px;
  overflow: hidden;
}
.hash-ring {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 140px; height: 140px; border-radius: 50%;
  border: 1px solid rgba(212,164,55,0.15);
  animation: ringPulse 2s ease-in-out infinite;
}
@keyframes ringPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0; }
}
.hash-big {
  position: relative; z-index: 2;
  display: flex; align-items: baseline; gap: 6px;
}
.hash-num {
  font-family: var(--font-num); font-size: 40px; font-weight: 700;
  color: var(--gold-light);
  animation: hashGlow 2s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(212,164,55,0.5), 0 0 40px rgba(212,164,55,0.25);
}
.hash-unit {
  font-family: var(--font-num); font-size: 16px; color: var(--gold);
  opacity: 0.8;
}
@keyframes hashGlow {
  0%, 100% { text-shadow: 0 0 20px rgba(212,164,55,0.5), 0 0 40px rgba(212,164,55,0.25); }
  50% { text-shadow: 0 0 30px rgba(212,164,55,0.8), 0 0 60px rgba(245,230,168,0.4); }
}
.earnings-rate {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 6px; margin-top: 8px;
}
.earnings-label { font-size: 12px; color: rgba(255,255,255,0.5); }
.earnings-val { font-family: var(--font-num); font-size: 14px; font-weight: 700; }

/* === 矿机卡片网格 === */
.device-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.device-card {
  position: relative; border-radius: 14px; overflow: hidden;
  padding: 14px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  text-align: center;
}
.card-border {
  position: absolute; inset: 0; border-radius: 14px;
  border: 2px solid; pointer-events: none;
}
.card-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; color: var(--gold-light);
}
.card-body { display: flex; flex-direction: column; align-items: center; gap: 3px; width: 100%; }
.card-name { font-family: var(--font-display); font-size: 14px; color: #fff; letter-spacing: 1px; }
.card-level {
  font-family: var(--font-num); font-size: 10px;
  color: var(--gold); background: rgba(0,0,0,0.4);
  padding: 1px 8px; border-radius: 8px;
}
.card-owned { font-size: 11px; color: rgba(255,255,255,0.5); }
.card-hash { font-size: 11px; color: var(--gold-light); font-family: var(--font-num); }
.card-cost { font-family: var(--font-num); font-size: 12px; font-weight: 700; }
.card-btn {
  width: 100%; padding: 8px; border-radius: 10px;
  font-size: 13px; font-family: var(--font-display); letter-spacing: 1px;
  margin-top: 2px;
}
.card-btn:disabled {
  opacity: 0.4; cursor: not-allowed; pointer-events: none;
}

/* === 今日总收益 === */
.today-earnings {
  padding: 18px; display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.today-label { font-size: 13px; color: rgba(255,255,255,0.5); }
.today-amount { font-family: var(--font-num); font-size: 28px; font-weight: 700; }

/* === 收益日志列表 === */
.log-list {
  display: flex; flex-direction: column; gap: 0;
  border: 1px solid rgba(212,164,55,0.15); border-radius: 14px;
  overflow: hidden;
}
.log-row {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; font-size: 12px;
}
.log-row.odd { background: rgba(255,255,255,0.03); }
.log-time { color: rgba(255,255,255,0.45); font-family: var(--font-num); font-size: 11px; flex-shrink: 0; }
.log-hash {
  font-family: 'Courier New', 'Consolas', monospace;
  color: rgba(255,255,255,0.55); font-size: 11px;
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.log-amount { font-family: var(--font-num); font-size: 12px; font-weight: 700; flex-shrink: 0; }

/* === 空状态 === */
.empty-log {
  padding: 32px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.empty-log .ms { font-size: 40px; color: rgba(255,255,255,0.15); }
.empty-log p { font-size: 13px; color: rgba(255,255,255,0.4); text-align: center; }
</style>