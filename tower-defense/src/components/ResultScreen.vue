<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { ASSETS } from '../data/assets'

const store = useGameStore()
const r = store.lastResult

function next() {
  if (r?.win) store.go('levels')
  else store.go('levels')
}
function retry() { store.go('battle') }
</script>

<template>
  <section class="screen result grain">
    <img class="bg" :src="r?.win ? ASSETS.bg.capital : ASSETS.bg.splash" alt="" />
    <div class="overlay" :class="{ win: r?.win, lose: !r?.win }"></div>

    <div class="content" v-if="r">
      <div class="banner">
        <div class="seal" :class="{ win: r.win }">{{ r.win ? '勝' : '敗' }}</div>
        <h1>{{ r.win ? '凯旋而归' : '兵败如山' }}</h1>
        <p>{{ r.win ? '将士用命，城关无虞' : '城关失守，整军再战' }}</p>
      </div>

      <div class="reward card" v-if="r.win">
        <div class="rw-row"><span>关卡奖励</span><span class="gold">+{{ r.gold }}</span></div>
        <div class="rw-row sub"><span>击杀敌军</span><span>{{ (r as any).kills ?? 0 }} 人</span></div>
        <div class="coin-anim">💰</div>
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
.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.4; }
.overlay { position: absolute; inset: 0; }
.overlay.win { background: radial-gradient(ellipse at center, rgba(212,164,55,0.25), rgba(10,4,0,0.9)); }
.overlay.lose { background: radial-gradient(ellipse at center, rgba(139,0,0,0.3), rgba(0,0,0,0.92)); }

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
.coin-anim { position: absolute; right: 14px; top: 10px; font-size: 36px; animation: spin 2s linear infinite; }
@keyframes spin { to { transform: rotateY(360deg); } }

.actions { width: 100%; display: flex; gap: 12px; }
.retry { flex: 1; padding: 14px; border-radius: 12px; font-size: 15px; }
.cont { flex: 1.4; padding: 14px; border-radius: 12px; font-size: 15px; }
</style>
