<script setup lang="ts">
import { useGameStore } from '../stores/game'

const store = useGameStore()
const r = store.lastResult

function next() { store.go('levels') }
function retry() { store.go('battle') }
</script>

<template>
  <section class="screen result grain">
    <!-- Q 版 CSS 场景背景 -->
    <div class="scene" :class="{ win: r?.win, lose: !r?.win }">
      <div class="sky-bg"></div>
      <div class="rays" v-if="r?.win"></div>
      <div class="sparkle" v-for="i in 12" :key="i" :style="{ left: (10+i*7)+'%', top: (10+(i%5)*16)+'%', animationDelay: (i*0.2)+'s' }"></div>
    </div>

    <div class="content" v-if="r">
      <div class="banner">
        <div class="seal" :class="{ win: r.win }">{{ r.win ? '勝' : '敗' }}</div>
        <h1>{{ r.win ? '凯旋而归' : '兵败如山' }}</h1>
        <p>{{ r.win ? '将士用命，城关无虞' : '城关失守，整军再战' }}</p>
      </div>

      <div class="reward card" v-if="r.win">
        <div class="rw-row"><span>关卡奖励</span><span class="gold">+{{ r.gold }}</span></div>
        <div class="rw-row sub"><span>击杀敌军</span><span>{{ (r as any).kills ?? 0 }} 人</span></div>
        <div class="coin-anim"><span class="ms">paid</span></div>
      </div>
      <div class="reward card" v-else>
        <div class="rw-row"><span>抚恤金币</span><span class="gold">+{{ r.gold }}</span></div>
      </div>

      <div class="actions">
        <button class="btn btn-ghost retry" @click="retry">再战</button>
        <button class="btn btn-primary cont" @click="next">{{ r.win ? '下一关' : '返回关卡' }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.result { justify-content: center; }
/* === Q 版 CSS 场景背景 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.sky-bg { position: absolute; inset: 0; }
.scene.win .sky-bg { background: radial-gradient(ellipse at 50% 30%, #f5e6a8 0%, #d4a437 30%, #8b6914 60%, #1a1000 100%); }
.scene.lose .sky-bg { background: radial-gradient(ellipse at 50% 30%, #4a1a2a 0%, #2a0a0a 50%, #0a0202 100%); }
.rays { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120%; height: 60%; background: conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.08) 5deg, transparent 10deg, transparent 20deg, rgba(255,255,255,0.08) 25deg, transparent 30deg, transparent 40deg, rgba(255,255,255,0.08) 45deg, transparent 50deg, transparent 60deg, rgba(255,255,255,0.08) 65deg, transparent 70deg, transparent 80deg, rgba(255,255,255,0.08) 85deg, transparent 90deg, transparent 100deg, rgba(255,255,255,0.08) 105deg, transparent 110deg, transparent 120deg, rgba(255,255,255,0.08) 125deg, transparent 130deg, transparent 140deg, rgba(255,255,255,0.08) 145deg, transparent 150deg, transparent 160deg, rgba(255,255,255,0.08) 165deg, transparent 170deg, transparent 180deg, transparent 190deg, rgba(255,255,255,0.08) 195deg, transparent 200deg, transparent 220deg, rgba(255,255,255,0.08) 225deg, transparent 230deg, transparent 240deg, transparent 250deg, rgba(255,255,255,0.08) 255deg, transparent 260deg, transparent 280deg, rgba(255,255,255,0.08) 285deg, transparent 290deg, transparent 300deg, rgba(255,255,255,0.08) 305deg, transparent 310deg, transparent 320deg, transparent 330deg, rgba(255,255,255,0.08) 335deg, transparent 340deg, transparent 360deg); animation: spin 20s linear infinite; }
.sparkle { position: absolute; width: 4px; height: 4px; background: var(--gold-light); border-radius: 50%; animation: sparkle 1.5s ease-in-out infinite; box-shadow: 0 0 8px var(--gold); }
.scene.lose .sparkle { background: #ff444420; box-shadow: none; }
@keyframes sparkle { 0%,100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.2); } }

.content { position: relative; z-index: 3; width: 84%; display: flex; flex-direction: column; align-items: center; gap: 20px; }

.banner { text-align: center; animation: drop .6s cubic-bezier(.2,1.4,.4,1); }
@keyframes drop { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.seal { width: 90px; height: 90px; margin: 0 auto 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 44px; border: 4px solid var(--gold); box-shadow: 0 0 40px rgba(212,164,55,0.6); }
.seal.win { background: var(--crimson); color: var(--gold-light); }
.seal:not(.win) { background: #333; color: #aaa; border-color: #666; box-shadow: 0 0 30px rgba(100,100,100,0.4); }
.banner h1 { font-family: var(--font-display); font-size: 30px; color: var(--gold); letter-spacing: 6px; }
.banner p { font-size: 13px; color: rgba(245,230,168,0.7); margin-top: 6px; }

.reward { width: 100%; padding: 18px; position: relative; overflow: hidden; }
.rw-row { display: flex; justify-content: space-between; align-items: center; font-size: 15px; color: rgba(255,255,255,0.85); }
.rw-row.sub { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 8px; }
.gold { font-family: var(--font-num); color: var(--gold); font-size: 22px; font-weight: 700; }
.coin-anim { position: absolute; right: 14px; top: 10px; font-size: 40px; color: var(--gold); animation: spin 2s linear infinite; }
@keyframes spin { to { transform: rotateY(360deg); } }

.actions { width: 100%; display: flex; gap: 12px; }
.retry { flex: 1; padding: 14px; border-radius: 12px; font-size: 15px; }
.cont { flex: 1.4; padding: 14px; border-radius: 12px; font-size: 15px; }
</style>
