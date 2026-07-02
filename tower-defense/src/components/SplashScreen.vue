<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGameStore } from '../stores/game'
import { ASSETS } from '../data/assets'

const store = useGameStore()
const progress = ref(0)

onMounted(() => {
  // 进度条动画
  const iv = setInterval(() => {
    progress.value += 2 + Math.random() * 6
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(iv)
      setTimeout(() => store.go('auth'), 500)
    }
  }, 120)
})

function skip() { progress.value = 100; setTimeout(() => store.go('auth'), 200) }
</script>

<template>
  <section class="screen splash grain">
    <img class="bg" :src="ASSETS.bg.splash" alt="" />
    <div class="bg-overlay"></div>

    <!-- 飘动烽火粒子 -->
    <div class="embers">
      <span v-for="i in 24" :key="i" :style="{ left: (i*4)+'%', animationDelay: (i*0.3)+'s', animationDuration: (3+i%4)+'s' }"></span>
    </div>

    <div class="content">
      <!-- 旋转光圈 -->
      <div class="halo">
        <div class="halo-ring r1"></div>
        <div class="halo-ring r2"></div>
        <div class="halo-ring r3"></div>
        <div class="logo">
          <div class="logo-inner">烽</div>
        </div>
      </div>

      <h1 class="title">
        <span class="t1">烽</span><span class="t2">火</span><span class="t3">主</span><span class="t4">帅</span>
      </h1>
      <p class="subtitle">塔防闯关 · 招兵募将 · 兑换现金</p>

      <div class="bar-wrap">
        <div class="bar" :style="{ width: progress + '%' }"></div>
        <div class="bar-glow" :style="{ left: progress + '%' }"></div>
      </div>
      <div class="bar-text">
        <span>{{ progress < 30 ? '招募将士中…' : progress < 60 ? '部署防线…' : progress < 90 ? '校阅三军…' : '出征！' }}</span>
        <span class="pct">{{ Math.floor(progress) }}%</span>
      </div>

      <button class="skip btn-ghost btn" @click="skip">跳过</button>
      <div class="ver">v1.0 · 战火重燃</div>
    </div>
  </section>
</template>

<style scoped>
.splash {
  background: radial-gradient(ellipse at 50% 35%, #4a1200 0%, #2a0800 50%, #0a0200 100%);
  align-items: center; justify-content: center;
}
.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.32; filter: saturate(1.3) contrast(1.1); }
.bg-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 0%, rgba(10,2,0,0.85) 100%); }

.embers { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.embers span {
  position: absolute; bottom: -10px; width: 4px; height: 4px;
  background: #ffaa44; border-radius: 50%;
  box-shadow: 0 0 8px #ff7700, 0 0 14px #ff5500;
  animation: rise linear infinite;
  opacity: 0.7;
}
@keyframes rise {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.9; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-700px) translateX(40px); opacity: 0; }
}

.content { position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 14px; }

.halo { position: relative; width: 168px; height: 168px; display: flex; align-items: center; justify-content: center; }
.halo-ring { position: absolute; border-radius: 50%; border: 2px solid; }
.r1 { width: 168px; height: 168px; border-color: rgba(212,164,55,0.7); border-top-color: transparent; border-left-color: transparent; animation: spin 3s linear infinite; }
.r2 { width: 130px; height: 130px; border-color: rgba(212,164,55,0.5); border-bottom-color: transparent; border-right-color: transparent; animation: spin 2.2s linear infinite reverse; }
.r3 { width: 100px; height: 100px; border-color: rgba(245,230,168,0.4); border-style: dashed; animation: spin 5s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.logo {
  width: 88px; height: 88px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #F5E6A8, #D4A437 50%, #8B6914);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 30px rgba(212,164,55,0.7), inset 0 -8px 16px rgba(0,0,0,0.3);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { box-shadow: 0 0 30px rgba(212,164,55,0.7), inset 0 -8px 16px rgba(0,0,0,0.3); } 50% { box-shadow: 0 0 55px rgba(212,164,55,0.95), inset 0 -8px 16px rgba(0,0,0,0.3); } }
.logo-inner { font-family: var(--font-display); font-size: 48px; color: var(--ink); font-weight: 700; text-shadow: 0 2px 4px rgba(255,255,255,0.4); }

.title { font-family: var(--font-display); font-size: 40px; letter-spacing: 8px; display: flex; gap: 2px; }
.title span { display: inline-block; color: var(--gold); text-shadow: 0 0 18px rgba(212,164,55,0.6), 0 4px 8px rgba(0,0,0,0.6); animation: drop 0.7s cubic-bezier(.2,1.4,.4,1) backwards; }
.t1 { animation-delay: 0.1s; } .t2 { animation-delay: 0.25s; } .t3 { animation-delay: 0.4s; } .t4 { animation-delay: 0.55s; }
@keyframes drop { from { transform: translateY(-40px) rotate(-20deg); opacity: 0; } to { transform: translateY(0) rotate(0); opacity: 1; } }

.subtitle { font-size: 13px; color: rgba(245,230,168,0.7); letter-spacing: 4px; animation: fade 1s 0.8s backwards; }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }

.bar-wrap { width: 260px; height: 8px; background: rgba(255,255,255,0.12); border-radius: 4px; overflow: hidden; position: relative; margin-top: 8px; border: 1px solid rgba(212,164,55,0.3); }
.bar { height: 100%; background: linear-gradient(90deg, var(--gold-deep), var(--gold), var(--gold-light)); border-radius: 4px; transition: width 0.2s; box-shadow: 0 0 12px rgba(212,164,55,0.7); }
.bar-glow { position: absolute; top: -2px; width: 4px; height: 12px; background: #fff; box-shadow: 0 0 12px #fff; transition: left 0.2s; }
.bar-text { width: 260px; display: flex; justify-content: space-between; font-size: 12px; color: rgba(245,230,168,0.7); margin-top: 6px; }
.pct { font-family: var(--font-num); color: var(--gold); }

.skip { margin-top: 18px; padding: 6px 18px; font-size: 12px; border-radius: 14px; font-family: var(--font-body); }
.ver { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 4px; letter-spacing: 1px; }
</style>
