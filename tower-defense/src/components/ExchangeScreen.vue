<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()
const amount = ref(10000)
const toast = ref('')

const RATE = 10000
const MIN = 10000

const canExchange = computed(() => amount.value >= MIN && amount.value <= store.gold)
const cashOut = computed(() => (amount.value / RATE).toFixed(2))

function setAmount(v: number) { amount.value = Math.min(store.gold, Math.max(0, v)) }
function doExchange() {
  if (!canExchange.value) { toast.value = amount.value < MIN ? `最低兑换 ${MIN.toLocaleString()} 金币` : '金币不足'; return }
  if (store.exchange(amount.value)) {
    toast.value = `兑换成功！获得 ¥${cashOut.value}`
    amount.value = MIN
  } else toast.value = '兑换失败'
  setTimeout(() => toast.value = '', 2500)
}
</script>

<template>
  <section class="screen exchange grain">
    <!-- Q 版 CSS 库房场景 -->
    <div class="scene">
      <div class="vault-bg"></div>
      <div class="coins" v-for="i in 8" :key="i" :style="{ left: (8+i*10)+'%', top: (10+i*6)+'%', animationDelay: (i*0.3)+'s' }"></div>
    </div>

    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('main')"><span class="ms">arrow_back</span></button>
      <h1>兑换现金</h1>
      <span class="spacer"></span>
    </header>

    <div class="body">
      <div class="balance-card card">
        <div class="bc-row">
          <div class="bc-item">
            <div class="bc-l">金币余额</div>
            <div class="bc-v gold">{{ store.gold.toLocaleString() }}</div>
          </div>
          <div class="bc-sep"></div>
          <div class="bc-item">
            <div class="bc-l">现金余额</div>
            <div class="bc-v cash">¥{{ store.cash.toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <div class="rate-bar">
        汇率：{{ RATE.toLocaleString() }} 金币 = ¥1.00 · 最低提现 ¥1.00
      </div>

      <div class="input-card card">
        <div class="ic-label">兑换金币数量</div>
        <div class="ic-input">
          <span class="ic-coin ms">paid</span>
          <input type="number" v-model.number="amount" :step="1000" :min="0" :max="store.gold" />
        </div>
        <div class="ic-quick">
          <button @click="setAmount(10000)">1万</button>
          <button @click="setAmount(50000)">5万</button>
          <button @click="setAmount(100000)">10万</button>
          <button @click="setAmount(store.gold)">全部</button>
        </div>
        <div class="ic-out">预计获得 <span class="cash">¥{{ cashOut }}</span></div>
      </div>

      <button class="ex-btn btn btn-primary" :disabled="!canExchange" @click="doExchange">确认兑换</button>

      <div class="notice card">
        <div class="nt-title">提现须知</div>
        <ul>
          <li>金币通过闯关、任务、签到获得</li>
          <li>兑换后金币扣除，现金到账</li>
          <li>现金可提现至微信/支付宝/银行卡</li>
          <li>提现需实名认证，1-3 个工作日到账</li>
        </ul>
      </div>

      <transition name="fade">
        <div class="toast" v-if="toast">{{ toast }}</div>
      </transition>
    </div>
  </section>
</template>

<style scoped>
.exchange { background: linear-gradient(180deg, #0d1f14 0%, #1a1a2e 100%); }
/* === Q 版 CSS 库房场景 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.vault-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 30%, #3a5a2a 0%, #1a2812 50%, #0a0f08 100%); }
.coins { position: absolute; width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-deep)); border: 2px solid rgba(255,255,255,0.3); animation: coinFloat 4s ease-in-out infinite; opacity: 0.3; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
@keyframes coinFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(180deg); } }
.hd { position: relative; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 22px; padding: 0; display: flex; align-items: center; justify-content: center; }
.hd h1 { font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.spacer { width: 38px; }

.body { position: relative; z-index: 3; flex: 1; overflow-y: auto; padding: 0 16px 20px; display: flex; flex-direction: column; gap: 14px; }

.balance-card { padding: 16px; }
.bc-row { display: flex; align-items: center; }
.bc-item { flex: 1; text-align: center; }
.bc-sep { width: 1px; height: 40px; background: rgba(255,255,255,0.15); }
.bc-l { font-size: 11px; color: rgba(255,255,255,0.5); }
.bc-v { font-family: var(--font-num); font-size: 24px; font-weight: 700; margin-top: 6px; }
.gold { color: var(--gold); }
.cash { color: #6BFF9E; }

.rate-bar { text-align: center; font-size: 11px; color: rgba(255,255,255,0.55); padding: 6px; background: rgba(212,164,55,0.08); border-radius: 8px; }

.input-card { padding: 16px; }
.ic-label { font-size: 12px; color: rgba(255,255,255,0.6); }
.ic-input { display: flex; align-items: center; gap: 8px; margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px solid rgba(212,164,55,0.3); }
.ic-coin { font-size: 22px; color: var(--gold); }
.ic-input input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-family: var(--font-num); font-size: 20px; }
.ic-quick { display: flex; gap: 6px; margin-top: 10px; }
.ic-quick button { flex: 1; padding: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(212,164,55,0.3); border-radius: 8px; color: var(--gold-light); font-size: 12px; cursor: pointer; }
.ic-quick button:active { transform: scale(0.92); }
.ic-out { margin-top: 12px; text-align: right; font-size: 13px; color: rgba(255,255,255,0.7); }
.cash { color: #6BFF9E; font-family: var(--font-num); font-weight: 700; }

.ex-btn { width: 100%; padding: 16px; border-radius: 12px; font-size: 17px; }
.ex-btn:disabled { opacity: 0.5; }

.notice { padding: 14px; }
.nt-title { font-family: var(--font-display); font-size: 14px; color: var(--gold); margin-bottom: 8px; }
.notice ul { padding-left: 16px; }
.notice li { font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.7; list-style: disc; }

.toast { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: var(--gold-light); padding: 10px 20px; border-radius: 20px; border: 1px solid var(--gold); font-size: 13px; z-index: 99; }
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
