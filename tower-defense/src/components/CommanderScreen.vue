<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { RANKS, SKILLS } from '../data/commander'

const store = useGameStore()
const idx = store.rankIndex
</script>

<template>
  <section class="screen commander grain">
    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('main')">←</button>
      <h1>主帅成长</h1>
      <span class="spacer"></span>
    </header>

    <div class="body">
      <!-- 当前阶段卡 -->
      <div class="cur card">
        <div class="cur-row">
          <img class="p" :src="RANKS[idx].asset" alt="" />
          <div class="info">
            <div class="rn">{{ RANKS[idx].name }}</div>
            <div class="ep">经验：{{ store.totalClears }} 通关</div>
            <div class="bar"><div class="fill" :style="{ width: (RANKS[idx+1] ? Math.min(100, (store.totalClears - RANKS[idx].exp) / (RANKS[idx+1].exp - RANKS[idx].exp) * 100) : 100) + '%' }"></div></div>
            <div class="next" v-if="RANKS[idx+1]">距 {{ RANKS[idx+1].name }} 还需 {{ RANKS[idx+1].exp - store.totalClears }} 胜</div>
            <div class="next" v-else>已达最高军阶</div>
          </div>
        </div>
        <div class="grid">
          <div class="box"><div class="v">{{ RANKS[idx].cmd }}</div><div class="l">统帅力</div></div>
          <div class="box"><div class="v">+{{ RANKS[idx].morale }}%</div><div class="l">士气加成</div></div>
          <div class="box"><div class="v">{{ RANKS[idx].grainMax }}</div><div class="l">粮草上限</div></div>
          <div class="box"><div class="v">{{ idx + 1 }}/8</div><div class="l">当前军阶</div></div>
        </div>
        <div class="unlock">已解锁：{{ RANKS[idx].unlock }}</div>
      </div>

      <!-- 主帅技能 -->
      <h2 class="sec">主帅技能</h2>
      <div class="skills">
        <div v-for="s in SKILLS" :key="s.id" :class="['skill', { lock: idx + 1 < s.unlockRank }]">
          <div class="sk-ico">{{ s.icon }}</div>
          <div class="sk-info">
            <div class="sk-name">{{ s.name }} <span class="cd">CD {{ s.cd }}s</span></div>
            <div class="sk-desc">{{ s.desc }}</div>
            <div class="sk-cond" v-if="idx + 1 < s.unlockRank">需晋升至 {{ RANKS[s.unlockRank - 1].name }}</div>
          </div>
        </div>
      </div>

      <!-- 晋升路线 -->
      <h2 class="sec">晋升之路</h2>
      <div class="track">
        <div v-for="(r, i) in RANKS" :key="i" :class="['step', { now: i === idx, passed: i < idx, lock: i > idx }]">
          <div class="num">{{ i + 1 }}</div>
          <div class="meta">
            <div class="nm">{{ r.name }}</div>
            <div class="un">{{ r.unlock }}</div>
            <div class="exp">需 {{ r.exp }} 胜 · 统帅 {{ r.cmd }} · 士气 +{{ r.morale }}%</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.commander { background: linear-gradient(180deg, #1a1024 0%, #2a1a10 100%); }
.hd { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: rgba(0,0,0,0.4); }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 18px; padding: 0; }
.hd h1 { font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.spacer { width: 38px; }
.body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }

.cur { padding: 16px; }
.cur-row { display: flex; gap: 14px; }
.p { width: 90px; height: 108px; border-radius: 12px; object-fit: cover; object-position: top; border: 2px solid var(--gold); }
.info { flex: 1; }
.rn { font-family: var(--font-display); font-size: 19px; color: var(--gold); }
.ep { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px; }
.bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 8px; overflow: hidden; }
.fill { height: 100%; background: linear-gradient(90deg, var(--gold-deep), var(--gold), var(--gold-light)); transition: width .5s; }
.next { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px; }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; margin-top: 14px; }
.box { padding: 8px 4px; background: rgba(0,0,0,0.3); border-radius: 8px; text-align: center; }
.v { font-family: var(--font-num); font-size: 16px; font-weight: 700; color: var(--gold-light); }
.l { font-size: 9px; color: rgba(255,255,255,0.5); }
.unlock { margin-top: 12px; padding: 8px 12px; background: rgba(212,164,55,0.12); border-left: 3px solid var(--gold); border-radius: 4px; font-size: 12px; color: var(--gold-light); }

.sec { font-family: var(--font-display); font-size: 16px; color: var(--gold); letter-spacing: 2px; margin-top: 4px; }

.skills { display: flex; flex-direction: column; gap: 8px; }
.skill { display: flex; gap: 10px; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(212,164,55,0.2); border-radius: 12px; }
.skill.lock { opacity: 0.45; }
.sk-ico { width: 42px; height: 42px; border-radius: 10px; background: var(--crimson); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.sk-info { flex: 1; }
.sk-name { font-size: 14px; font-weight: 700; color: var(--gold-light); display: flex; align-items: center; gap: 8px; }
.cd { font-size: 10px; color: rgba(255,255,255,0.5); font-weight: 400; }
.sk-desc { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px; }
.sk-cond { font-size: 11px; color: #ff9966; margin-top: 2px; }

.track { display: flex; flex-direction: column; gap: 6px; }
.step { display: flex; gap: 10px; padding: 10px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid transparent; }
.step.now { background: rgba(212,164,55,0.15); border-color: var(--gold); }
.step.passed { opacity: 0.55; }
.step.lock { opacity: 0.4; }
.num { width: 28px; height: 28px; border-radius: 50%; background: var(--crimson); color: var(--gold-light); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
.passed .num { background: var(--jade); }
.nm { font-size: 14px; font-weight: 700; color: var(--gold-light); }
.un { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px; }
.exp { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 2px; }
</style>
