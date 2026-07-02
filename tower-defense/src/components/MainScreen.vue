<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { RANKS } from '../data/commander'

const store = useGameStore()
const rank = RANKS[store.rankIndex]

// 各军阶对应的 Q 版图标
const RANK_ICON = ['person', 'groups', 'military_tech', 'shield', 'star', 'flag', 'workspace_premium', 'verified']
const rankIcon = RANK_ICON[store.rankIndex] || 'person'
</script>

<template>
  <section class="screen main grain">
    <!-- 装饰：顶部金线 + 角花 -->
    <div class="deco-top"></div>

    <!-- 顶部栏：余额 -->
    <header class="top">
      <div class="balance">
        <div class="chip gold-chip"><span class="dot g"></span>{{ store.gold.toLocaleString() }}</div>
        <div class="chip cash-chip"><span class="dot c"></span>¥{{ store.cash.toFixed(2) }}</div>
      </div>
      <div class="top-actions">
        <button class="ic-btn" @click="store.go('profile')" title="个人中心"><span class="ms">person</span></button>
        <button class="ic-btn" @click="store.go('trade')" title="集市交易"><span class="ms">storefront</span></button>
        <button class="ic-btn" @click="store.go('exchange')" title="兑换现金"><span class="ms">payments</span></button>
      </div>
    </header>

    <!-- 主帅展示区：模型人物 + 信息卡左右布局 -->
    <div class="hero">
      <!-- 左：3D 模型人物（透明背景，站在出征按钮上方） -->
      <div class="portrait-wrap">
        <div class="aura"></div>
        <div class="pedestal"></div>
        <img src="/commander/commander.png" alt="主帅立绘" class="portrait" />
      </div>
      <!-- 右：主帅信息卡 -->
      <div class="hero-info">
        <div class="rank-row">
          <div class="rank-badge"><span class="ms ic">{{ rankIcon }}</span>{{ rank.name }}</div>
          <div class="rank-no">第 {{ store.rankIndex + 1 }}/8 阶</div>
        </div>
        <h2 class="name">{{ store.user?.name || '主帅' }}</h2>
        <div class="stats">
          <div class="stat"><div class="v">{{ rank.cmd }}</div><div class="l">统帅</div></div>
          <div class="stat"><div class="v">+{{ rank.morale }}%</div><div class="l">士气</div></div>
          <div class="stat"><div class="v">{{ store.totalClears }}</div><div class="l">胜场</div></div>
        </div>
        <div class="unlock">{{ rank.unlock }}</div>
      </div>
    </div>

    <!-- 出征按钮：人物站在其上方 -->
    <div class="cta">
      <button class="battle-btn btn btn-crimson" @click="store.go('levels')">
        <span class="bt-text">点 兵 出 征</span>
        <span class="bt-sub">塔防闯关赚金币</span>
      </button>
    </div>

    <!-- 功能入口：网格布局 -->
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
      <div class="entry" @click="store.go('trade')">
        <div class="e-ico"><span class="ms">storefront</span></div><div class="e-t">集市交易</div>
      </div>
      <div class="entry" @click="store.go('gacha')">
        <div class="e-ico"><span class="ms">auto_awesome</span></div><div class="e-t">武将孵化</div>
      </div>
      <div class="entry" @click="store.go('mine')">
        <div class="e-ico"><span class="ms">diamond</span></div><div class="e-t">挖矿工坊</div>
      </div>
      <div class="entry" @click="store.go('world')">
        <div class="e-ico"><span class="ms">public</span></div><div class="e-t">天下大势</div>
      </div>
      <div class="entry" @click="store.go('pvp')">
        <div class="e-ico"><span class="ms">sword_cross</span></div><div class="e-t">实时对战</div>
      </div>
      <div class="entry" @click="store.go('alliance')">
        <div class="e-ico"><span class="ms">handshake</span></div><div class="e-t">结盟系统</div>
      </div>
      <div class="entry" @click="store.go('profile')">
        <div class="e-ico"><span class="ms">group</span></div><div class="e-t">好友联盟</div>
      </div>
      <div class="entry" @click="store.toggleMusic()">
        <div class="e-ico"><span class="ms">{{ store.musicOn ? 'music_note' : 'music_off' }}</span></div><div class="e-t">{{ store.musicOn ? '音乐开' : '音乐关' }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.main { background: radial-gradient(ellipse at 50% 30%, #1f1228 0%, #0a0610 70%); }

/* 顶部金线装饰 */
.deco-top { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), var(--gold-light), var(--gold), transparent); z-index: 5; opacity: 0.7; }

.top { position: relative; z-index: 3; padding: 14px 16px 8px; display: flex; justify-content: space-between; align-items: center; }
.balance { display: flex; gap: 8px; }
.chip { display: flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 18px; font-family: var(--font-num); font-weight: 700; font-size: 13px; background: rgba(0,0,0,0.6); border: 1px solid rgba(212,164,55,0.4); backdrop-filter: blur(8px); }
.gold-chip { color: var(--gold-light); }
.cash-chip { color: #6BFF9E; border-color: rgba(107,255,158,0.4); }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.g { background: var(--gold); box-shadow: 0 0 8px var(--gold); }
.c { background: #4caf50; box-shadow: 0 0 8px #4caf50; }
.top-actions { display: flex; gap: 8px; }
.ic-btn { width: 38px; height: 38px; border-radius: 50%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); color: var(--gold-light); font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .12s, border-color .2s; backdrop-filter: blur(8px); }
.ic-btn:active { transform: scale(0.9); }
.ic-btn:hover { border-color: var(--gold); }

/* 主帅展示区：人物 + 信息卡左右布局 */
.hero { position: relative; z-index: 3; display: flex; align-items: center; gap: 8px; padding: 8px 16px 4px; }
.portrait-wrap { position: relative; width: 150px; height: 200px; flex-shrink: 0; display: flex; align-items: flex-end; justify-content: center; }
.aura { position: absolute; inset: -10px -20px -10px; border-radius: 50%; background: radial-gradient(circle at 50% 60%, rgba(212,164,55,0.32), transparent 65%); animation: aura 3.2s ease-in-out infinite; pointer-events: none; }
@keyframes aura { 0%,100% { transform: scale(0.95); opacity: 0.55; } 50% { transform: scale(1.08); opacity: 1; } }
.pedestal { position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 130px; height: 14px; background: radial-gradient(ellipse at center, rgba(212,164,55,0.5), transparent 70%); filter: blur(5px); }
.portrait {
  position: relative; z-index: 2;
  width: 100%; height: 100%;
  object-fit: contain; object-position: bottom center;
  image-rendering: -webkit-optimize-contrast;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)) contrast(1.05) saturate(1.08);
  animation: portraitFloat 4s ease-in-out infinite;
  transform-origin: 50% 100%;
}
/* 人物轻微浮动呼吸（非平移，以脚为支点） */
@keyframes portraitFloat { 0%,100% { transform: scale(1); } 50% { transform: scale(1.012); } }

/* 信息卡 */
.hero-info { flex: 1; min-width: 0; }
.rank-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.rank-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 10px; background: linear-gradient(135deg, var(--crimson), #5a0000); color: var(--gold-light); font-family: var(--font-display); font-size: 12px; border: 1px solid var(--gold); box-shadow: 0 2px 8px rgba(139,0,0,0.4); }
.rank-badge .ic { font-size: 14px; }
.rank-no { font-size: 10px; color: rgba(245,230,168,0.55); letter-spacing: 1px; }
.name { font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; margin-bottom: 8px; text-shadow: 0 2px 6px rgba(0,0,0,0.6); }
.stats { display: flex; gap: 14px; margin-bottom: 8px; }
.stat { text-align: center; padding: 4px 6px; background: rgba(0,0,0,0.35); border-radius: 8px; border: 1px solid rgba(212,164,55,0.18); min-width: 50px; }
.v { font-family: var(--font-num); font-size: 16px; font-weight: 700; color: var(--gold-light); }
.l { font-size: 9px; color: rgba(255,255,255,0.5); margin-top: 1px; }
.unlock { font-size: 10px; color: rgba(245,230,168,0.6); line-height: 1.5; padding: 5px 8px; background: rgba(212,164,55,0.08); border-left: 2px solid var(--gold); border-radius: 0 6px 6px 0; }

/* 出征按钮 */
.cta { position: relative; z-index: 3; padding: 8px 16px 10px; }
.battle-btn { width: 100%; padding: 16px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 2px; position: relative; overflow: hidden; }
.battle-btn::after { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); animation: shine 3.5s infinite; }
@keyframes shine { 0% { left: -100%; } 60%,100% { left: 120%; } }
.bt-text { font-size: 22px; letter-spacing: 6px; }
.bt-sub { font-size: 11px; opacity: 0.8; letter-spacing: 2px; }

/* 功能入口：网格 */
.entries { position: relative; z-index: 3; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 8px 16px 20px; }
.entry { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 10px 4px; background: rgba(255,255,255,0.05); border: 1px solid rgba(212,164,55,0.18); border-radius: 14px; cursor: pointer; transition: transform .15s, background .2s, border-color .2s; backdrop-filter: blur(6px); }
.entry:active { transform: scale(0.92); background: rgba(212,164,55,0.14); }
.entry:hover { border-color: rgba(212,164,55,0.4); }
.e-ico { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, rgba(212,164,55,0.2), rgba(139,105,20,0.1)); display: flex; align-items: center; justify-content: center; font-size: 21px; color: var(--gold-light); border: 1px solid rgba(212,164,55,0.15); }
.e-t { font-size: 10px; color: rgba(245,230,168,0.85); letter-spacing: 0.5px; }
</style>
