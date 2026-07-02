<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import { audio } from '../game/audio'

const store = useGameStore()

const matchTimer = ref<number>(0)
const matchOpponent = ref<{ opp: string; oppRank: number; oppPower: number } | null>(null)
const showMatchResult = ref(false)
const battleResult = ref<'win' | 'lose' | null>(null)
const lastDelta = ref(0)
const lastGold = ref(0)

const locked = computed(() => !store.pvpUnlock)
const winRate = computed(() =>
  store.pvpWins + store.pvpLoses > 0
    ? Math.round((store.pvpWins / (store.pvpWins + store.pvpLoses)) * 100)
    : 0
)

function startMatching() {
  if (store.matching || matchOpponent.value) return
  store.startMatch()
  let p = 0
  matchTimer.value = window.setInterval(() => {
    p += 2
    if (p >= 100) {
      store.matchProgress = 100
      finishMatching()
    } else {
      store.matchProgress = p
    }
  }, 60)
}

function finishMatching() {
  if (matchTimer.value) {
    clearInterval(matchTimer.value)
    matchTimer.value = 0
  }
  matchOpponent.value = store.finishMatch()
}

function simulateBattle(win: boolean) {
  if (!matchOpponent.value) return
  const goldBefore = store.gold
  store.settlePvp(matchOpponent.value.opp, win)
  lastDelta.value = store.pvpHistory[0]?.delta ?? 0
  lastGold.value = store.gold - goldBefore
  battleResult.value = win ? 'win' : 'lose'
  showMatchResult.value = true
  if (win) audio.win()
  else audio.lose()
}

function closeResult() {
  showMatchResult.value = false
  battleResult.value = null
  matchOpponent.value = null
  lastDelta.value = 0
  lastGold.value = 0
}

function formatTime(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onUnmounted(() => {
  if (matchTimer.value) clearInterval(matchTimer.value)
})
</script>

<template>
  <section class="screen pvp grain">
    <!-- 战场背景 -->
    <div class="scene">
      <div class="field-bg"></div>
      <div class="swords">
        <div class="sword l"></div>
        <div class="sword r"></div>
        <div class="pommel"></div>
      </div>
      <div class="ember e1"></div>
      <div class="ember e2"></div>
      <div class="ember e3"></div>
      <div class="ember e4"></div>
      <div class="ember e5"></div>
    </div>
    <div class="bg-overlay"></div>

    <!-- 头部 -->
    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('main')">
        <span class="ms">arrow_back</span>
      </button>
      <h1>实时对战</h1>
      <span class="spacer"></span>
    </header>

    <!-- 锁定遮罩 -->
    <div class="lock-overlay" v-if="locked">
      <span class="ms lock-icon">lock</span>
      <div class="lock-text">需军阶 3 级解锁 PvP</div>
      <div class="lock-sub">提升主帅军阶后再来挑战各路诸侯</div>
    </div>

    <!-- 主体 -->
    <div class="body" v-else>
      <!-- 玩家战绩卡 -->
      <div class="stats-card card">
        <div class="stats-top">
          <div class="rank-badge-wrap">
            <span class="ms rank-icon">military_tech</span>
            <span class="rank-name">{{ store.rank?.name || '新兵' }}</span>
          </div>
          <div class="rank-points">
            <div class="rp-label">对战积分</div>
            <div class="rp-val gold-text">{{ store.pvpRank }}</div>
          </div>
        </div>
        <div class="stats-row">
          <div class="stat-cell">
            <div class="cell-label">胜场</div>
            <div class="cell-val win">{{ store.pvpWins }}</div>
          </div>
          <div class="cell-sep"></div>
          <div class="stat-cell">
            <div class="cell-label">败场</div>
            <div class="cell-val lose">{{ store.pvpLoses }}</div>
          </div>
          <div class="cell-sep"></div>
          <div class="stat-cell">
            <div class="cell-label">胜率</div>
            <div class="cell-val gold-text">{{ winRate }}%</div>
          </div>
        </div>
      </div>

      <!-- 匹配 / 对手区 -->
      <div class="arena">
        <!-- 待匹配按钮 -->
        <button
          v-if="!store.matching && !matchOpponent"
          class="match-btn btn btn-crimson"
          @click="startMatching"
        >
          <span class="ms">flash_on</span>
          <span>匹配对手</span>
        </button>

        <!-- 匹配中 -->
        <div class="matching" v-if="store.matching">
          <div class="radar">
            <div class="radar-ring r1"></div>
            <div class="radar-ring r2"></div>
            <div class="radar-core"></div>
          </div>
          <div class="match-text">正在匹配对手...</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: store.matchProgress + '%' }"></div>
          </div>
          <div class="progress-num">{{ Math.floor(store.matchProgress) }}%</div>
        </div>

        <!-- 对手卡 -->
        <transition name="slide-in">
          <div class="opponent-card" v-if="matchOpponent">
            <div class="opp-header">敌方主帅</div>
            <div class="opp-name">{{ matchOpponent.opp }}</div>
            <div class="opp-stats">
              <div class="opp-stat">
                <span class="os-label">积分</span>
                <span class="os-val">{{ matchOpponent.oppRank }}</span>
              </div>
              <div class="opp-stat">
                <span class="os-label">战力</span>
                <span class="os-val">{{ matchOpponent.oppPower }}</span>
              </div>
            </div>
            <div class="vs-divider">
              <span class="vs-badge">VS</span>
            </div>
            <div class="opp-actions">
              <button class="btn btn-crimson opp-btn fight" @click="simulateBattle(true)">
                <span class="ms">whatshot</span> 开战
              </button>
              <button class="btn btn-ghost opp-btn retreat" @click="closeResult">
                <span class="ms"> directions_run</span> 撤退
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- 对战历史 -->
      <div class="history">
        <div class="history-title">
          <span class="ms">history</span>
          <span>近期对战</span>
        </div>
        <div class="history-list" v-if="store.pvpHistory.length">
          <div
            v-for="(h, i) in store.pvpHistory"
            :key="h.time + '-' + i"
            :class="['h-row', { odd: i % 2 === 0 }]"
          >
            <span :class="['h-badge', h.result]">{{ h.result === 'win' ? '胜' : '败' }}</span>
            <span class="h-opp">{{ h.opp }}</span>
            <span :class="['h-delta', h.result]">{{ h.delta >= 0 ? '+' : '' }}{{ h.delta }}</span>
            <span class="h-time">{{ formatTime(h.time) }}</span>
          </div>
        </div>
        <div class="empty card" v-else>
          <span class="ms">shield</span>
          <p>尚无对战记录，匹配对手开启征战</p>
        </div>
      </div>
    </div>

    <!-- 战斗结算弹窗 -->
    <transition name="modal">
      <div class="result-mask" v-if="showMatchResult" @click.self="closeResult">
        <div :class="['result-modal', battleResult]">
          <div class="result-char">{{ battleResult === 'win' ? '胜' : '败' }}</div>
          <div class="result-title">{{ battleResult === 'win' ? '凯旋而归' : '兵败如山倒' }}</div>
          <div class="result-info">
            <div class="ri-row">
              <span class="ri-label">积分变化</span>
              <span :class="['ri-val', lastDelta >= 0 ? 'win' : 'lose']">
                {{ lastDelta >= 0 ? '+' : '' }}{{ lastDelta }}
              </span>
            </div>
            <div class="ri-row">
              <span class="ri-label">金币奖励</span>
              <span class="ri-val gold-text">{{ lastGold >= 0 ? '+' : '' }}{{ lastGold }}</span>
            </div>
          </div>
          <button class="btn btn-primary result-btn" @click="closeResult">返回</button>
        </div>
      </div>
    </transition>
  </section>
</template>

<style scoped>
.pvp { background: linear-gradient(180deg, #1a0606 0%, #2a0a0a 50%, #140404 100%); }

/* === 战场背景 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.field-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% 20%, #4a0e0e 0%, transparent 55%),
    radial-gradient(ellipse at 20% 70%, #2a0808 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, #2a0808 0%, transparent 50%),
    linear-gradient(180deg, #1a0606 0%, #0d0303 100%);
}

/* 交叉双剑剪影 */
.swords {
  position: absolute; top: 42%; left: 50%;
  width: 320px; height: 320px;
  transform: translate(-50%, -50%);
  opacity: 0.07;
  animation: swordGlow 6s ease-in-out infinite;
  pointer-events: none;
}
.sword {
  position: absolute; top: 50%; left: 50%;
  width: 300px; height: 6px;
  background: linear-gradient(90deg, transparent 0%, var(--gold-deep) 15%, var(--gold-light) 50%, var(--gold-deep) 85%, transparent 100%);
  transform-origin: center;
  border-radius: 3px;
  box-shadow: 0 0 12px rgba(212,164,55,0.4);
}
.sword.l { transform: translate(-50%, -50%) rotate(45deg); }
.sword.r { transform: translate(-50%, -50%) rotate(-45deg); }
.pommel {
  position: absolute; top: 50%; left: 50%;
  width: 26px; height: 26px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, var(--gold-light), var(--gold-deep));
  box-shadow: 0 0 20px rgba(212,164,55,0.6);
}
@keyframes swordGlow {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.12; }
}

/* 飘动余烬 */
.ember {
  position: absolute; width: 4px; height: 4px;
  background: #ff6b3a; border-radius: 50%;
  box-shadow: 0 0 6px #ff6b3a, 0 0 12px rgba(255,107,58,0.6);
  animation: emberFloat 5s ease-in-out infinite;
  opacity: 0.6;
}
.e1 { top: 70%; left: 18%; animation-delay: 0s; }
.e2 { top: 78%; left: 40%; animation-delay: -1.2s; animation-duration: 6s; }
.e3 { top: 65%; right: 25%; animation-delay: -2.4s; }
.e4 { top: 82%; right: 12%; animation-delay: -3.6s; animation-duration: 4.5s; }
.e5 { top: 60%; left: 55%; animation-delay: -1.8s; }
@keyframes emberFloat {
  0% { transform: translateY(0) scale(0.6); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
}

.bg-overlay {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(10,3,3,0.55) 0%, transparent 18%, transparent 72%, rgba(10,3,3,0.95) 100%);
}

/* === 头部 === */
.hd { position: relative; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 22px; padding: 0; display: flex; align-items: center; justify-content: center; }
.hd h1 { font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.spacer { width: 38px; }

/* === 锁定遮罩 === */
.lock-overlay {
  position: relative; z-index: 3; flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 40px;
}
.lock-icon {
  font-size: 64px; color: var(--gold-deep);
  filter: drop-shadow(0 0 16px rgba(212,164,55,0.3));
}
.lock-text {
  font-family: var(--font-display); font-size: 20px;
  color: var(--gold-light); letter-spacing: 2px;
}
.lock-sub { font-size: 12px; color: rgba(255,255,255,0.45); text-align: center; }

/* === 主体 === */
.body {
  position: relative; z-index: 3; flex: 1; overflow-y: auto;
  padding: 0 16px 22px; display: flex; flex-direction: column; gap: 14px;
}

/* === 战绩卡 === */
.stats-card { padding: 16px; }
.stats-top {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 12px; border-bottom: 1px solid rgba(212,164,55,0.15);
}
.rank-badge-wrap { display: flex; align-items: center; gap: 8px; }
.rank-icon { font-size: 26px; color: var(--gold); }
.rank-name {
  font-family: var(--font-display); font-size: 16px;
  color: var(--gold-light); letter-spacing: 1px;
}
.rank-points { text-align: right; }
.rp-label { font-size: 11px; color: rgba(255,255,255,0.5); }
.rp-val { font-family: var(--font-num); font-size: 22px; font-weight: 700; }

.stats-row {
  display: flex; align-items: center; padding-top: 12px;
}
.stat-cell { flex: 1; text-align: center; }
.cell-sep { width: 1px; height: 30px; background: rgba(255,255,255,0.12); }
.cell-label { font-size: 11px; color: rgba(255,255,255,0.5); }
.cell-val { font-family: var(--font-num); font-size: 20px; font-weight: 700; margin-top: 4px; }
.cell-val.win { color: #6BFF9E; }
.cell-val.lose { color: #FF6B6B; }

/* === 竞技场 === */
.arena {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 220px; padding: 16px 0;
}

/* 匹配按钮 */
.match-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 20px 48px; border-radius: 16px;
  font-size: 22px; letter-spacing: 4px;
  animation: matchPulse 1.8s ease-in-out infinite;
}
.match-btn .ms { font-size: 26px; }
@keyframes matchPulse {
  0%, 100% { box-shadow: 0 6px 18px rgba(139,0,0,0.4), 0 0 0 0 rgba(192,57,43,0.5); }
  50% { box-shadow: 0 6px 24px rgba(139,0,0,0.6), 0 0 0 14px rgba(192,57,43,0); }
}

/* 匹配中 */
.matching {
  display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%;
}
.radar {
  position: relative; width: 100px; height: 100px;
  display: flex; align-items: center; justify-content: center;
}
.radar-ring {
  position: absolute; border-radius: 50%;
  border: 1.5px solid var(--gold);
}
.r1 { width: 100px; height: 100px; animation: radarPulse 1.8s ease-out infinite; }
.r2 { width: 100px; height: 100px; animation: radarPulse 1.8s ease-out infinite 0.9s; }
.radar-core {
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--gold-light);
  box-shadow: 0 0 12px var(--gold);
}
@keyframes radarPulse {
  0% { transform: scale(0.3); opacity: 0.9; }
  100% { transform: scale(1); opacity: 0; }
}
.match-text {
  font-family: var(--font-display); font-size: 14px;
  color: var(--gold-light); letter-spacing: 1px;
}
.progress-bar {
  width: 80%; height: 10px; border-radius: 6px; overflow: hidden;
  background: rgba(0,0,0,0.5); border: 1px solid rgba(212,164,55,0.3);
  position: relative;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold-deep), var(--gold), var(--gold-light));
  border-radius: 6px;
  position: relative;
  transition: width 0.06s linear;
}
.progress-fill::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
  animation: shine 1.4s linear infinite;
}
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.progress-num {
  font-family: var(--font-num); font-size: 13px; color: var(--gold-light);
}

/* 对手卡 */
.opponent-card {
  width: 100%;
  background: linear-gradient(160deg, rgba(60,12,12,0.95), rgba(30,6,6,0.95));
  border: 1px solid rgba(212,164,55,0.4);
  border-radius: 16px;
  padding: 18px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
}
.opp-header {
  font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 2px;
}
.opp-name {
  font-family: var(--font-display); font-size: 22px;
  color: var(--gold-light); letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(212,164,55,0.4);
}
.opp-stats {
  display: flex; gap: 24px; margin-top: 2px;
}
.opp-stat { display: flex; flex-direction: column; align-items: center; }
.os-label { font-size: 11px; color: rgba(255,255,255,0.5); }
.os-val { font-family: var(--font-num); font-size: 16px; color: var(--gold); font-weight: 700; }

.vs-divider {
  position: relative; width: 100%; height: 28px;
  display: flex; align-items: center; justify-content: center;
  margin: 6px 0;
}
.vs-divider::before, .vs-divider::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,164,55,0.4), transparent);
}
.vs-badge {
  font-family: var(--font-display); font-size: 16px; font-weight: 700;
  color: var(--crimson-light);
  padding: 0 14px;
  text-shadow: 0 0 10px rgba(192,57,43,0.6);
}

.opp-actions {
  display: flex; gap: 10px; width: 100%;
}
.opp-btn {
  flex: 1; padding: 12px; border-radius: 10px;
  font-size: 15px; letter-spacing: 1px;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.opp-btn .ms { font-size: 18px; }

.slide-in-enter-active { animation: slideIn 0.4s cubic-bezier(.2,.8,.2,1); }
.slide-in-leave-active { animation: slideIn 0.25s reverse; }
@keyframes slideIn {
  0% { opacity: 0; transform: translateY(20px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* === 历史 === */
.history { display: flex; flex-direction: column; gap: 8px; }
.history-title {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-display); font-size: 14px; color: var(--gold);
  letter-spacing: 1px; padding: 0 2px;
}
.history-title .ms { font-size: 18px; }

.history-list {
  border: 1px solid rgba(212,164,55,0.15); border-radius: 12px; overflow: hidden;
}
.h-row {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; font-size: 12px;
}
.h-row.odd { background: rgba(255,255,255,0.03); }
.h-badge {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; font-family: var(--font-display);
  flex-shrink: 0;
}
.h-badge.win { background: rgba(107,255,158,0.18); color: #6BFF9E; border: 1px solid rgba(107,255,158,0.4); }
.h-badge.lose { background: rgba(255,107,107,0.18); color: #FF6B6B; border: 1px solid rgba(255,107,107,0.4); }
.h-opp {
  flex: 1; min-width: 0;
  color: rgba(255,255,255,0.8);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.h-delta {
  font-family: var(--font-num); font-weight: 700; font-size: 12px; flex-shrink: 0;
}
.h-delta.win { color: #6BFF9E; }
.h-delta.lose { color: #FF6B6B; }
.h-time {
  font-family: var(--font-num); font-size: 10px;
  color: rgba(255,255,255,0.4); flex-shrink: 0;
}

.empty {
  padding: 26px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.empty .ms { font-size: 36px; color: rgba(255,255,255,0.15); }
.empty p { font-size: 12px; color: rgba(255,255,255,0.4); text-align: center; }

/* === 结算弹窗 === */
.result-mask {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.result-modal {
  width: 78%; max-width: 320px;
  padding: 28px 22px 22px;
  border-radius: 18px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  background: linear-gradient(160deg, rgba(40,10,10,0.96), rgba(20,4,4,0.96));
  border: 1px solid rgba(212,164,55,0.4);
  box-shadow: 0 20px 60px rgba(0,0,0,0.7);
}
.result-char {
  font-family: var(--font-display); font-size: 88px; font-weight: 700;
  line-height: 1;
}
.result-modal.win .result-char {
  color: var(--gold-light);
  text-shadow: 0 0 30px rgba(245,230,168,0.7), 0 0 60px rgba(212,164,55,0.4);
}
.result-modal.lose .result-char {
  color: var(--crimson-light);
  text-shadow: 0 0 30px rgba(192,57,43,0.7), 0 0 60px rgba(139,0,0,0.4);
}
.result-title {
  font-family: var(--font-display); font-size: 16px;
  color: var(--gold-light); letter-spacing: 2px;
}
.result-info {
  width: 100%; margin: 8px 0 4px;
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px; border-radius: 10px;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(212,164,55,0.15);
}
.ri-row { display: flex; align-items: center; justify-content: space-between; }
.ri-label { font-size: 12px; color: rgba(255,255,255,0.55); }
.ri-val { font-family: var(--font-num); font-size: 15px; font-weight: 700; }
.ri-val.win { color: #6BFF9E; }
.ri-val.lose { color: #FF6B6B; }
.result-btn { width: 100%; padding: 12px; border-radius: 10px; font-size: 15px; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .result-modal, .modal-leave-active .result-modal {
  transition: transform 0.3s cubic-bezier(.2,.8,.2,1);
}
.modal-enter-from .result-modal, .modal-leave-to .result-modal {
  transform: scale(0.85);
}
</style>
