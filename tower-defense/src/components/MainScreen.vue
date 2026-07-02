<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { ASSETS } from '../data/assets'
import { RANKS } from '../data/commander'

const store = useGameStore()
const rank = RANKS[store.rankIndex]
</script>

<template>
  <section class="screen main grain">
    <img class="bg" :src="ASSETS.bg.hall" alt="" />
    <div class="bg-overlay"></div>

    <!-- 顶部栏：余额 -->
    <header class="top">
      <div class="balance">
        <div class="chip gold-chip"><span class="dot g"></span>{{ store.gold.toLocaleString() }}</div>
        <div class="chip cash-chip"><span class="dot c"></span>¥{{ store.cash.toFixed(2) }}</div>
      </div>
      <div class="top-actions">
        <button class="ic-btn" @click="store.go('exchange')"><span class="ms">payments</span></button>
      </div>
    </header>

    <!-- 中部主帅立绘 -->
    <div class="hero">
      <div class="pedestal"></div>
      <div class="portrait-wrap">
        <div class="aura"></div>
        <img class="portrait" :src="rank.asset" alt="" />
        <div class="rank-badge">{{ rank.name }}</div>
      </div>
      <h2 class="name">{{ store.user?.name || '主帅' }}</h2>
      <div class="stats">
        <div class="stat"><div class="v">{{ rank.cmd }}</div><div class="l">统帅</div></div>
        <div class="stat"><div class="v">+{{ rank.morale }}%</div><div class="l">士气</div></div>
        <div class="stat"><div class="v">{{ store.totalClears }}</div><div class="l">胜场</div></div>
        <div class="stat"><div class="v">{{ store.rankIndex + 1 }}/8</div><div class="l">军阶</div></div>
      </div>
    </div>

    <!-- 出征按钮 -->
    <div class="cta">
      <button class="battle-btn btn btn-crimson" @click="store.go('levels')">
        <span class="bt-text">点 兵 出 征</span>
        <span class="bt-sub">塔防闯关赚金币</span>
      </button>
    </div>

    <!-- 功能入口（无底部导航栏，改为浮动入口） -->
    <div class="entries">
      <div class="entry" @click="store.go('commander')">
        <div class="e-ico"><span class="ms">school</span></div><div class="e-t">主帅成长</div>
      </div>
      <div class="entry" @click="store.go('codex')">
        <div class="e-ico"><span class="ms">menu_book</span></div><div class="e-t">兵种图鉴</div>
      </div>
      <div class="entry" @click="store.go('levels')">
        <div class="e-ico"><span class="ms">military_tech</span></div><div class="e-t">关卡征战</div>
      </div>
      <div class="entry" @click="store.go('exchange')">
        <div class="e-ico"><span class="ms">currency_exchange</span></div><div class="e-t">兑换现金</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.main { background: linear-gradient(180deg, #1a0e1a 0%, #2a1818 100%); }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.4; filter: saturate(1.1); }
.bg-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,4,8,0.6) 0%, transparent 30%, transparent 60%, rgba(10,4,8,0.85) 100%); }

.top { position: relative; z-index: 3; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
.balance { display: flex; gap: 8px; }
.chip { display: flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 18px; font-family: var(--font-num); font-weight: 700; font-size: 13px; background: rgba(0,0,0,0.55); border: 1px solid rgba(212,164,55,0.4); }
.gold-chip { color: var(--gold-light); }
.cash-chip { color: #6BFF9E; border-color: rgba(107,255,158,0.4); }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.g { background: var(--gold); box-shadow: 0 0 8px var(--gold); }
.c { background: #4caf50; box-shadow: 0 0 8px #4caf50; }
.ic-btn { width: 38px; height: 38px; border-radius: 50%; background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.15); color: var(--gold-light); font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.ic-btn:active { transform: scale(0.9); }

.hero { flex: 1; position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; }
.pedestal { position: absolute; bottom: 30px; width: 200px; height: 30px; background: radial-gradient(ellipse at center, rgba(212,164,55,0.4), transparent 70%); filter: blur(8px); }
.portrait-wrap { position: relative; width: 150px; height: 180px; }
.aura { position: absolute; inset: -16px; border-radius: 50%; background: radial-gradient(circle, rgba(212,164,55,0.35), transparent 65%); animation: aura 3s ease-in-out infinite; }
@keyframes aura { 0%,100% { transform: scale(0.95); opacity: 0.6; } 50% { transform: scale(1.08); opacity: 1; } }
.portrait { width: 150px; height: 180px; object-fit: cover; object-position: top; border-radius: 16px; border: 3px solid var(--gold); box-shadow: 0 12px 30px rgba(0,0,0,0.5); position: relative; z-index: 2; }
.rank-badge { position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); padding: 4px 16px; border-radius: 12px; background: var(--crimson); color: var(--gold-light); font-family: var(--font-display); font-size: 13px; border: 1px solid var(--gold); z-index: 3; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
.name { font-family: var(--font-display); font-size: 22px; color: var(--gold); margin-top: 16px; letter-spacing: 3px; }
.stats { display: flex; gap: 18px; margin-top: 10px; }
.stat { text-align: center; }
.v { font-family: var(--font-num); font-size: 18px; font-weight: 700; color: var(--gold-light); }
.l { font-size: 10px; color: rgba(255,255,255,0.5); }

.cta { position: relative; z-index: 3; padding: 0 24px 12px; }
.battle-btn { width: 100%; padding: 18px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 2px; position: relative; overflow: hidden; }
.battle-btn::after { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); animation: shine 3.5s infinite; }
@keyframes shine { 0% { left: -100%; } 60%,100% { left: 120%; } }
.bt-text { font-size: 22px; letter-spacing: 6px; }
.bt-sub { font-size: 11px; opacity: 0.8; letter-spacing: 2px; }

.entries { position: relative; z-index: 3; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 8px 16px 22px; }
.entry { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px; background: rgba(255,255,255,0.05); border: 1px solid rgba(212,164,55,0.2); border-radius: 12px; cursor: pointer; transition: transform .15s, background .2s; }
.entry:active { transform: scale(0.92); background: rgba(212,164,55,0.12); }
.e-ico { width: 42px; height: 42px; border-radius: 12px; background: rgba(212,164,55,0.15); display: flex; align-items: center; justify-content: center; font-size: 22px; color: var(--gold-light); }
.e-t { font-size: 11px; color: rgba(245,230,168,0.85); }
</style>
