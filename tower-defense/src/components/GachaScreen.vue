<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { audio } from '../game/audio'

const store = useGameStore()

const pulling = ref(false)
const pullResult = ref<any[] | null>(null)
const showResult = ref(false)
const pullCount = ref(1)

const totalCost = computed(() => pullCount.value * store.gachaCost)
const canPull = computed(() => store.gold >= totalCost.value && !pulling.value)

const rarityColor = (r: string) => {
  const map: Record<string, string> = {
    common: '#9e9e9e',
    rare: '#4fc3f7',
    epic: '#ba68c8',
    legendary: '#ffb300',
  }
  return map[r] || '#9e9e9e'
}

const rarityLabel = (r: string) => {
  const map: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  }
  return map[r] || r
}

const rarityBg = (r: string) => {
  const map: Record<string, string> = {
    common: 'linear-gradient(160deg, #3a3a3a, #1a1a1a)',
    rare: 'linear-gradient(160deg, #1a3a4a, #0a1a2a)',
    epic: 'linear-gradient(160deg, #2a1a3a, #1a0a2a)',
    legendary: 'linear-gradient(160deg, #3a2a0a, #1a1000)',
  }
  return map[r] || map.common
}

function pull() {
  if (!canPull.value) return
  pulling.value = true
  showResult.value = false
  audio.coin()

  setTimeout(() => {
    const results: any[] = []
    for (let i = 0; i < pullCount.value; i++) {
      const hero = store.gachaPull()
      if (hero) results.push(hero)
    }
    pullResult.value = results
    showResult.value = true
    pulling.value = false

    const hasRare = results.some(h => h.rarity !== 'common')
    if (hasRare) audio.loot()
  }, 1200)
}

function closeResult() {
  showResult.value = false
  pullResult.value = null
}
</script>

<template>
  <section class="screen gacha grain">
    <!-- 神秘夜空场景 -->
    <div class="scene">
      <div class="sky-bg"></div>
      <!-- 旋转星空 -->
      <div class="starfield">
        <div class="star s1"></div><div class="star s2"></div><div class="star s3"></div>
        <div class="star s4"></div><div class="star s5"></div><div class="star s6"></div>
        <div class="star s7"></div><div class="star s8"></div><div class="star s9"></div>
        <div class="star s10"></div><div class="star s11"></div><div class="star s12"></div>
        <div class="star s13"></div><div class="star s14"></div><div class="star s15"></div>
        <div class="star s16"></div><div class="star s17"></div><div class="star s18"></div>
        <div class="star s19"></div><div class="star s20"></div>
      </div>
      <!-- 浮动灯笼 -->
      <div class="lantern l1"><div class="l-core"></div></div>
      <div class="lantern l2"><div class="l-core"></div></div>
      <div class="lantern l3"><div class="l-core"></div></div>
      <!-- 金色粒子 -->
      <div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div>
      <div class="particle p4"></div><div class="particle p5"></div><div class="particle p6"></div>
      <div class="particle p7"></div><div class="particle p8"></div>
      <!-- 神社光辉 -->
      <div class="shrine-glow"></div>
      <div class="shrine-pillar pl"></div>
      <div class="shrine-pillar pr"></div>
    </div>
    <div class="bg-overlay"></div>

    <!-- 头部 -->
    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('profile')">
        <span class="ms">arrow_back</span>
      </button>
      <h1>武将孵化池</h1>
      <div class="gold-display">
        <span class="gold-dot"></span>
        <span class="gold-amount">{{ store.gold.toLocaleString() }}</span>
      </div>
    </header>

    <!-- 滚动区域 -->
    <div class="body">
      <!-- 中央神社孵化区 -->
      <div class="shrine-area">
        <!-- 传送门 -->
        <div class="portal-wrap" :class="{ active: pulling }">
          <div class="portal-ring r1"></div>
          <div class="portal-ring r2"></div>
          <div class="portal-core">
            <div class="portal-inner">
              <span class="ms yin-yang">auto_awesome</span>
            </div>
          </div>
          <!-- 拉动时粒子飞出 -->
          <div v-if="pulling" class="pull-sparks">
            <div class="spark sk1"></div><div class="spark sk2"></div><div class="spark sk3"></div>
            <div class="spark sk4"></div><div class="spark sk5"></div><div class="spark sk6"></div>
            <div class="spark sk7"></div><div class="spark sk8"></div>
          </div>
        </div>

        <!-- 孵化按钮 -->
        <button
          class="pull-btn btn"
          :class="{ pulling: pulling }"
          :disabled="!canPull"
          @click="pull"
        >
          <span v-if="pulling" class="pull-label">
            <span class="pulse-dot"></span>孵化中...
          </span>
          <span v-else class="pull-label">孵化武将</span>
        </button>

        <!-- 抽数选择 -->
        <div class="count-select">
          <button
            :class="['count-btn btn', { on: pullCount === 1 }]"
            @click="pullCount = 1"
          >
            单抽({{ store.gachaCost }}金)
          </button>
          <button
            :class="['count-btn btn', { on: pullCount === 10 }]"
            @click="pullCount = 10"
          >
            十连({{ store.gachaCost * 10 }}金)
          </button>
        </div>
      </div>

      <!-- 我的武将 -->
      <div class="owned-section">
        <div class="section-hd">
          <span class="section-title">我的武将</span>
          <span class="section-count">{{ store.ownedHeroes.length }}</span>
        </div>

        <div v-if="store.ownedHeroes.length" class="hero-grid">
          <div
            v-for="(h, i) in store.ownedHeroes"
            :key="h.id + '-' + i"
            class="hero-card"
            :style="{ background: rarityBg(h.rarity) }"
          >
            <div class="hero-card-border" :style="{ borderColor: rarityColor(h.rarity) }"></div>
            <div class="hero-icon">
              <span class="ms">{{ h.icon }}</span>
            </div>
            <div class="hero-name">{{ h.name }}</div>
            <div class="hero-rarity" :style="{ color: rarityColor(h.rarity) }">
              {{ rarityLabel(h.rarity) }}
            </div>
            <div class="hero-stats">
              <span class="stat">⚔{{ h.atk }}</span>
              <span class="stat">🛡{{ h.def }}</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-heroes">
          <span class="ms">person_off</span>
          <p>暂无武将，快去孵化吧！</p>
        </div>
      </div>
    </div>

    <!-- 结果弹窗遮罩 -->
    <div v-if="showResult && pullResult" class="result-overlay" @click.self="closeResult">
      <div class="result-card">
        <div class="result-header">
          <span class="result-title">孵化结果</span>
        </div>
        <div class="result-list">
          <div
            v-for="(h, i) in pullResult"
            :key="h.id + '-' + i"
            class="result-item"
            :style="{ borderColor: rarityColor(h.rarity), background: rarityBg(h.rarity) }"
          >
            <div class="ri-icon">
              <span class="ms">{{ h.icon }}</span>
            </div>
            <div class="ri-info">
              <div class="ri-name">{{ h.name }}</div>
              <div class="ri-rarity" :style="{ color: rarityColor(h.rarity) }">
                {{ rarityLabel(h.rarity) }}
              </div>
              <div class="ri-stats">
                <span class="stat">⚔ {{ h.atk }}</span>
                <span class="stat">🛡 {{ h.def }}</span>
              </div>
            </div>
          </div>
        </div>
        <button class="close-btn btn btn-primary" @click="closeResult">
          继续孵化
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gacha { background: #0d0a1a; }

/* === 场景背景 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.sky-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% 35%, #1a0e2a 0%, #0d0a1a 60%),
    radial-gradient(ellipse at 80% 20%, #1a1040 0%, transparent 40%),
    radial-gradient(ellipse at 20% 70%, #100a30 0%, transparent 40%);
}

/* === 旋转星空 === */
.starfield { position: absolute; inset: 0; animation: starRotate 120s linear infinite; }
.star {
  position: absolute; width: 2px; height: 2px;
  background: #fff; border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}
.s1 { top: 8%; left: 15%; animation-delay: 0s; }
.s2 { top: 12%; left: 35%; animation-delay: -0.5s; width: 3px; height: 3px; }
.s3 { top: 5%; left: 55%; animation-delay: -1.2s; }
.s4 { top: 18%; left: 72%; animation-delay: -0.8s; width: 3px; height: 3px; }
.s5 { top: 10%; left: 88%; animation-delay: -2s; }
.s6 { top: 25%; left: 8%; animation-delay: -1.5s; width: 3px; height: 3px; }
.s7 { top: 22%; left: 48%; animation-delay: -0.3s; }
.s8 { top: 30%; left: 66%; animation-delay: -2.2s; }
.s9 { top: 16%; left: 92%; animation-delay: -1.1s; width: 3px; height: 3px; }
.s10 { top: 38%; left: 22%; animation-delay: -0.6s; }
.s11 { top: 35%; left: 60%; animation-delay: -1.8s; width: 3px; height: 3px; }
.s12 { top: 42%; left: 80%; animation-delay: -2.5s; }
.s13 { top: 28%; left: 40%; animation-delay: -0.9s; }
.s14 { top: 48%; left: 10%; animation-delay: -1.4s; width: 3px; height: 3px; }
.s15 { top: 52%; left: 75%; animation-delay: -0.2s; }
.s16 { top: 58%; left: 30%; animation-delay: -2.1s; }
.s17 { top: 45%; left: 50%; animation-delay: -1.7s; width: 3px; height: 3px; }
.s18 { top: 62%; left: 55%; animation-delay: -0.7s; }
.s19 { top: 68%; left: 18%; animation-delay: -1.9s; }
.s20 { top: 72%; left: 85%; animation-delay: -0.4s; width: 3px; height: 3px; }
@keyframes starRotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

/* === 浮动灯笼 === */
.lantern {
  position: absolute; width: 26px; height: 34px;
  background: linear-gradient(180deg, var(--crimson), #5a0000);
  border: 2px solid var(--gold);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  animation: lanternFloat 6s ease-in-out infinite;
  box-shadow: 0 0 14px rgba(255,120,60,0.35);
  opacity: 0.6;
}
.lantern::before { content: ''; position: absolute; top: -5px; left: 50%; transform: translateX(-50%); width: 2px; height: 5px; background: #3a2410; }
.lantern::after { content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 10px; height: 5px; background: var(--gold); border-radius: 0 0 3px 3px; }
.l-core { position: absolute; inset: 4px; background: radial-gradient(circle, #fff3b0, #ff9a3c 70%); border-radius: 50%; filter: blur(2px); animation: flicker 1.2s ease-in-out infinite alternate; }
.l1 { top: 6%; left: 12%; animation-delay: 0s; }
.l2 { top: 14%; right: 10%; animation-delay: -2s; }
.l3 { top: 20%; left: 75%; animation-delay: -4s; }
@keyframes lanternFloat {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
}
@keyframes flicker { 0% { opacity: 0.8; } 100% { opacity: 1; } }

/* === 金色粒子 === */
.particle {
  position: absolute; width: 3px; height: 3px;
  background: var(--gold-light); border-radius: 50%;
  box-shadow: 0 0 6px var(--gold);
  animation: particleUp 4s ease-in-out infinite;
  pointer-events: none;
}
.p1 { top: 70%; left: 20%; animation-delay: 0s; }
.p2 { top: 75%; left: 40%; animation-delay: -1s; animation-duration: 3.5s; }
.p3 { top: 68%; left: 55%; animation-delay: -2s; }
.p4 { top: 80%; left: 30%; animation-delay: -0.5s; animation-duration: 4.5s; }
.p5 { top: 72%; left: 65%; animation-delay: -1.5s; }
.p6 { top: 78%; left: 50%; animation-delay: -2.5s; animation-duration: 3.8s; }
.p7 { top: 85%; left: 15%; animation-delay: -3s; }
.p8 { top: 82%; left: 75%; animation-delay: -0.8s; animation-duration: 4.2s; }
@keyframes particleUp {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
  50% { opacity: 0.8; transform: translateY(-30px) scale(1.2); }
}

/* === 神社光辉 === */
.shrine-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(212,164,55,0.12) 0%, rgba(212,164,55,0.04) 40%, transparent 70%);
  pointer-events: none;
}
.shrine-pillar {
  position: absolute; bottom: 0; width: 10px; height: 40%;
  background: linear-gradient(90deg, #5a3a1a, #3a2410, #5a3a1a);
  border-radius: 3px;
  box-shadow: 0 0 12px rgba(0,0,0,0.5);
  opacity: 0.5;
}
.shrine-pillar.pl { left: 15%; }
.shrine-pillar.pr { right: 15%; }

.bg-overlay {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(10,6,18,0.5) 0%, transparent 25%, transparent 70%, rgba(10,6,18,0.9) 100%);
}

/* === 头部 === */
.hd { position: relative; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 22px; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hd h1 { flex: 1; font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.gold-display { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(212,164,55,0.35); border-radius: 16px; }
.gold-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 6px var(--gold); }
.gold-amount { font-family: var(--font-num); font-size: 14px; font-weight: 700; color: var(--gold-light); }

/* === 滚动区域 === */
.body { position: relative; z-index: 3; flex: 1; overflow-y: auto; padding: 0 16px 22px; display: flex; flex-direction: column; gap: 16px; }

/* === 中央神社孵化区 === */
.shrine-area { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 10px 0; }

/* === 传送门 === */
.portal-wrap { position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; }
.portal-ring {
  position: absolute; border-radius: 50%;
  border: 2px solid rgba(212,164,55,0.3);
  pointer-events: none;
}
.portal-ring.r1 {
  inset: -16px;
  animation: ringPulse1 3s ease-in-out infinite;
}
.portal-ring.r2 {
  inset: -32px;
  border-color: rgba(212,164,55,0.15);
  animation: ringPulse2 3s ease-in-out infinite;
}
@keyframes ringPulse1 {
  0%, 100% { transform: scale(0.95); opacity: 0.4; }
  50% { transform: scale(1.08); opacity: 0.8; }
}
@keyframes ringPulse2 {
  0%, 100% { transform: scale(0.9); opacity: 0.25; }
  50% { transform: scale(1.12); opacity: 0.55; }
}

.portal-core {
  width: 140px; height: 140px; border-radius: 50%;
  background: conic-gradient(from 0deg, var(--gold-deep), var(--gold), var(--gold-light), var(--gold), var(--gold-deep));
  animation: portalSpin 4s linear infinite;
  display: flex; align-items: center; justify-content: center;
  box-shadow:
    0 0 30px rgba(212,164,55,0.5),
    0 0 60px rgba(212,164,55,0.25),
    0 0 100px rgba(139,105,20,0.15);
}
.portal-inner {
  width: 100px; height: 100px; border-radius: 50%;
  background: #0d0a1a;
  display: flex; align-items: center; justify-content: center;
  animation: portalInnerSpin 6s linear infinite reverse;
}
.yin-yang { font-size: 44px; color: var(--gold-light); filter: drop-shadow(0 0 8px rgba(212,164,55,0.5)); }

@keyframes portalSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes portalInnerSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* 传送门拉动动画 */
.portal-wrap.active .portal-core {
  animation: portalSpinFast 0.6s linear infinite;
  box-shadow:
    0 0 50px rgba(212,164,55,0.8),
    0 0 100px rgba(212,164,55,0.4),
    0 0 160px rgba(139,105,20,0.3);
}
.portal-wrap.active .portal-ring.r1 {
  animation: ringPulseFast 0.5s ease-in-out infinite;
}
.portal-wrap.active .portal-ring.r2 {
  animation: ringPulseFast 0.5s ease-in-out 0.25s infinite;
}
@keyframes portalSpinFast { 0% { transform: rotate(0deg); } 100% { transform: rotate(720deg); } }
@keyframes ringPulseFast {
  0%, 100% { transform: scale(0.9); opacity: 0.3; }
  50% { transform: scale(1.15); opacity: 0.9; }
}

/* 拉动时粒子 */
.pull-sparks { position: absolute; inset: -40px; pointer-events: none; }
.spark {
  position: absolute; width: 4px; height: 4px;
  background: var(--gold-light); border-radius: 50%;
  animation: sparkBurst 0.8s ease-out infinite;
  box-shadow: 0 0 8px var(--gold);
}
.sk1 { top: 30%; left: 10%; animation-delay: 0s; }
.sk2 { top: 10%; left: 50%; animation-delay: -0.1s; }
.sk3 { top: 30%; right: 10%; animation-delay: -0.2s; }
.sk4 { bottom: 30%; left: 15%; animation-delay: -0.3s; }
.sk5 { bottom: 40%; right: 12%; animation-delay: -0.15s; }
.sk6 { top: 50%; left: 0%; animation-delay: -0.25s; }
.sk7 { top: 50%; right: 0%; animation-delay: -0.35s; }
.sk8 { bottom: 10%; left: 50%; animation-delay: -0.05s; }
@keyframes sparkBurst {
  0% { transform: translate(0, 0) scale(0); opacity: 1; }
  100% { transform: translate(var(--tx, 20px), var(--ty, -30px)) scale(1.5); opacity: 0; }
}
.sk1 { --tx: -30px; --ty: -20px; }
.sk2 { --tx: 0px; --ty: -40px; }
.sk3 { --tx: 30px; --ty: -20px; }
.sk4 { --tx: -25px; --ty: 20px; }
.sk5 { --tx: 25px; --ty: 15px; }
.sk6 { --tx: -40px; --ty: -5px; }
.sk7 { --tx: 40px; --ty: -5px; }
.sk8 { --tx: 0px; --ty: 35px; }

/* === 孵化按钮 === */
.pull-btn {
  position: relative; width: 160px; height: 50px;
  border-radius: 25px; border: 2px solid var(--gold);
  background: linear-gradient(135deg, var(--gold-deep), var(--gold), var(--gold-deep));
  color: var(--ink); font-family: var(--font-display); font-size: 18px;
  font-weight: 700; letter-spacing: 3px;
  box-shadow: 0 6px 24px rgba(212,164,55,0.45);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  transition: transform .15s, box-shadow .2s;
}
.pull-btn::after {
  content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%);
  animation: btnShine 3s ease-in-out infinite;
}
@keyframes btnShine {
  0% { transform: translateX(-100%) translateY(-100%); }
  100% { transform: translateX(100%) translateY(100%); }
}
.pull-btn:active { transform: scale(0.94); }
.pull-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pull-btn:disabled::after { display: none; }

.pull-btn.pulling {
  background: linear-gradient(135deg, #5a3a1a, var(--gold-deep), #5a3a1a);
  animation: btnPulse 0.6s ease-in-out infinite;
}
@keyframes btnPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
.pull-label { display: flex; align-items: center; gap: 8px; position: relative; z-index: 1; }
.pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--crimson); animation: dotPulse 0.8s ease-in-out infinite; }
@keyframes dotPulse { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.3); } }

/* === 抽数选择 === */
.count-select { display: flex; gap: 10px; }
.count-btn {
  padding: 10px 18px; border-radius: 12px;
  font-family: var(--font-body); font-size: 13px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.6);
  border: 1px solid rgba(212,164,55,0.2);
  transition: background .2s, color .2s, border-color .2s, transform .12s;
}
.count-btn.on {
  background: rgba(212,164,55,0.15);
  color: var(--gold-light);
  border-color: var(--gold);
  box-shadow: 0 0 10px rgba(212,164,55,0.2);
}
.count-btn:active { transform: scale(0.95); }

/* === 我的武将 === */
.owned-section {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(212,164,55,0.15);
  border-radius: 16px;
  padding: 14px;
}
.section-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.section-title { font-family: var(--font-display); font-size: 16px; color: var(--gold); letter-spacing: 1px; }
.section-count {
  font-family: var(--font-num); font-size: 12px; color: var(--gold-light);
  background: rgba(212,164,55,0.15); padding: 2px 8px; border-radius: 10px;
}

/* 武将卡片网格 */
.hero-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.hero-card {
  position: relative; border-radius: 12px; overflow: hidden;
  padding: 10px 8px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  text-align: center;
}
.hero-card-border {
  position: absolute; inset: 0; border-radius: 12px;
  border: 1.5px solid; pointer-events: none;
}
.hero-icon {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; color: var(--gold-light);
}
.hero-name { font-family: var(--font-display); font-size: 12px; color: #fff; letter-spacing: 1px; }
.hero-rarity { font-family: var(--font-body); font-size: 10px; font-weight: 700; }
.hero-stats { display: flex; gap: 6px; }
.stat { font-family: var(--font-num); font-size: 10px; color: rgba(255,255,255,0.7); }

/* 空状态 */
.empty-heroes { padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.empty-heroes .ms { font-size: 40px; color: rgba(255,255,255,0.15); }
.empty-heroes p { font-size: 13px; color: rgba(255,255,255,0.4); text-align: center; }

/* === 结果弹窗 === */
.result-overlay {
  position: absolute; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.result-card {
  width: 100%; max-width: 320px; max-height: 70vh;
  background: linear-gradient(180deg, #1a1230, #0d0a1a);
  border: 1px solid rgba(212,164,55,0.35);
  border-radius: 20px;
  padding: 20px 16px 16px;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  animation: cardIn 0.35s ease-out;
}
@keyframes cardIn {
  0% { transform: scale(0.8) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.result-header { text-align: center; margin-bottom: 14px; }
.result-title { font-family: var(--font-display); font-size: 18px; color: var(--gold); letter-spacing: 2px; }
.result-list { display: flex; flex-direction: column; gap: 8px; max-height: 40vh; overflow-y: auto; padding-right: 4px; margin-bottom: 14px; }

.result-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border-radius: 12px; border: 1.5px solid;
  animation: itemIn 0.3s ease-out;
}
@keyframes itemIn {
  0% { transform: translateX(-10px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
.ri-icon {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; color: var(--gold-light); flex-shrink: 0;
}
.ri-info { flex: 1; min-width: 0; }
.ri-name { font-family: var(--font-display); font-size: 15px; color: #fff; letter-spacing: 1px; }
.ri-rarity { font-family: var(--font-body); font-size: 11px; font-weight: 700; margin-top: 2px; }
.ri-stats { display: flex; gap: 10px; margin-top: 4px; }

.close-btn {
  width: 100%; padding: 12px; border-radius: 14px;
  font-family: var(--font-display); font-size: 16px; letter-spacing: 2px;
}
</style>