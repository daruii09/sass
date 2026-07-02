<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { audio } from '../game/audio'

const store = useGameStore()
const mode = ref<'login' | 'register'>('login')
const phone = ref('')
const pwd = ref('')
const nickname = ref('')
const agreed = ref(true)
const err = ref('')
const showPwd = ref(false)

const valid = computed(() => {
  if (mode.value === 'register' && nickname.value.trim().length < 2) return false
  if (!/^1\d{10}$/.test(phone.value)) return false
  return pwd.value.length >= 6
})

function tap() { audio.resume(); audio.uiClick() }
function switchMode(m: 'login' | 'register') { if (mode.value !== m) { mode.value = m; audio.uiClick() } }
function submit() {
  audio.resume()
  if (!valid.value) { err.value = '请检查手机号与密码(≥6位)'; audio.uiBack(); return }
  err.value = ''
  audio.login()
  store.login(nickname.value || `将士${phone.value.slice(-4)}`, false)
}
function guest() { audio.resume(); audio.login(); store.login('无名小卒', true) }
</script>

<template>
  <section class="screen auth">
    <!-- Q 版 CSS 场景背景：黄昏军营 -->
    <div class="scene">
      <div class="sky"></div>
      <div class="sun"></div>
      <div class="cloud c1"></div>
      <div class="cloud c2"></div>
      <div class="cloud c3"></div>
      <!-- 远山剪影 -->
      <svg class="mtn-far" viewBox="0 0 420 120" preserveAspectRatio="none">
        <path d="M0,120 L0,70 Q60,30 120,60 Q180,90 240,50 Q300,20 360,55 Q390,72 420,60 L420,120 Z" fill="#3a2540" opacity="0.8"/>
      </svg>
      <svg class="mtn-near" viewBox="0 0 420 120" preserveAspectRatio="none">
        <path d="M0,120 L0,95 Q80,55 160,85 Q230,110 300,70 Q360,45 420,80 L420,120 Z" fill="#241628"/>
      </svg>
      <!-- 营地灯火 -->
      <div class="campfire" v-for="i in 4" :key="i" :style="{ left: (15+i*22)+'%' }">
        <div class="flame"></div>
      </div>
      <!-- 城楼剪影 -->
      <div class="gate">
        <div class="gate-roof"></div>
        <div class="gate-body"></div>
        <div class="gate-flag">帥</div>
      </div>
    </div>
    <div class="bg-overlay"></div>

    <!-- 飘动令旗装饰 -->
    <div class="flags">
      <div class="flag" v-for="i in 5" :key="i" :style="{ left: (8+i*19)+'%', animationDelay: (i*0.7)+'s' }">令</div>
    </div>

    <!-- 女性古装人物：纯 CSS 绘制，透明背景，坐在登录卡片上方 -->
    <div class="heroine">
      <div class="h-glow"></div>
      <div class="h-figure">
        <!-- 飘动的长发 -->
        <div class="hair hair-back"></div>
        <div class="hair hair-back-2"></div>
        <!-- 头部 -->
        <div class="head">
          <!-- 发髻 + 金钗 -->
          <div class="bun"><div class="zhan"></div><div class="zhan z2"></div></div>
          <div class="hair-bang"></div>
          <div class="face">
            <div class="eye l"><i></i></div>
            <div class="eye r"><i></i></div>
            <div class="blush l"></div>
            <div class="blush r"></div>
            <div class="brow l"></div>
            <div class="brow r"></div>
            <div class="mouth"></div>
            <div class="forehead-mark"></div>
          </div>
          <!-- 耳坠 -->
          <div class="earring l"></div>
          <div class="earring r"></div>
        </div>
        <!-- 身体：汉服 -->
        <div class="body">
          <!-- 飘动的水袖 -->
          <div class="sleeve sleeve-l"></div>
          <div class="sleeve sleeve-r"></div>
          <!-- 衣襟 -->
          <div class="collar"></div>
          <div class="waist-band"></div>
          <div class="skirt"></div>
          <!-- 手持团扇 -->
          <div class="fan-arm">
            <div class="fan">
              <div class="fan-stick" v-for="i in 7" :key="i" :style="{ transform: `rotate(${-42 + i*14}deg)` }"></div>
              <div class="fan-paint"></div>
              <div class="fan-ribbon"></div>
            </div>
            <div class="hand"></div>
          </div>
          <div class="hand hand-l"></div>
        </div>
      </div>
      <!-- 飘落花瓣装饰 -->
      <div class="petal" v-for="i in 5" :key="i" :style="{ left: (10+i*18)+'%', animationDelay: (i*1.3)+'s', animationDuration: (7+i%3)+'s' }"></div>
    </div>

    <div class="panel">
      <div class="brand">
        <div class="seal"><span>帥</span></div>
        <h1>烽火主帅</h1>
        <p>投笔从戎 · 步步高升 · 招兵破敌</p>
      </div>

      <div class="tabs">
        <div :class="['tab', { on: mode==='login' }]" @click="switchMode('login')">登录</div>
        <div :class="['tab', { on: mode==='register' }]" @click="switchMode('register')">注册</div>
        <div class="tab-ind" :style="{ transform: mode==='login' ? 'translateX(0)' : 'translateX(100%)' }"></div>
      </div>

      <div class="field">
        <span class="ic ms">smartphone</span>
        <input v-model="phone" type="tel" maxlength="11" placeholder="手机号" @focus="tap" />
      </div>
      <div class="field" v-if="mode==='register'">
        <span class="ic ms">military_tech</span>
        <input v-model="nickname" type="text" placeholder="军中名号 (≥2字)" @focus="tap" />
      </div>
      <div class="field">
        <span class="ic ms">key</span>
        <input v-model="pwd" :type="showPwd ? 'text' : 'password'" placeholder="口令 (≥6位)" @focus="tap" @keyup.enter="submit" />
        <button class="pwd-toggle" type="button" @click="showPwd = !showPwd; tap()"><span class="ms">{{ showPwd ? 'visibility_off' : 'visibility' }}</span></button>
      </div>

      <p v-if="err" class="err"><span class="ms">error</span>{{ err }}</p>

      <label class="agree">
        <input type="checkbox" v-model="agreed" @change="tap" />
        <span>我已阅读《军令状》及《征战须知》</span>
      </label>

      <button class="submit btn btn-crimson" :disabled="!valid || !agreed" @click="submit">
        <span class="ms">login</span>{{ mode === 'login' ? '登 帐 点 兵' : '注 册 从 戎' }}
      </button>

      <div class="divider"><span>或</span></div>

      <button class="guest btn btn-ghost" @click="guest"><span class="ms">explore</span>游客试阵 · 仅体验不存档</button>
    </div>

    <p class="foot">登录即代表你将作为主帅从边防小兵开启征途</p>
  </section>
</template>

<style scoped>
.auth { background: linear-gradient(180deg, #2a1838 0%, #3a1f2e 50%, #1a0e1a 100%); justify-content: center; align-items: center; }

/* === Q 版 CSS 场景背景 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.sky { position: absolute; inset: 0; background: linear-gradient(180deg, #ff9a6b 0%, #d96b8a 35%, #6e3a6e 70%, #2a1838 100%); }
.sun { position: absolute; top: 16%; left: 50%; transform: translateX(-50%); width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle, #fff3b0 0%, #ffd166 45%, #ff9a6b 100%); box-shadow: 0 0 60px rgba(255,180,120,0.8), 0 0 120px rgba(255,140,90,0.4); animation: sunGlow 4s ease-in-out infinite; }
@keyframes sunGlow { 50% { box-shadow: 0 0 80px rgba(255,180,120,1), 0 0 160px rgba(255,140,90,0.6); } }
.cloud { position: absolute; width: 70px; height: 26px; background: rgba(255,225,210,0.55); border-radius: 30px; filter: blur(2px); animation: drift 30s linear infinite; }
.cloud::before, .cloud::after { content: ''; position: absolute; background: inherit; border-radius: 50%; }
.cloud::before { width: 34px; height: 34px; top: -14px; left: 10px; }
.cloud::after { width: 26px; height: 26px; top: -10px; left: 36px; }
.c1 { top: 22%; animation-duration: 38s; }
.c2 { top: 30%; width: 90px; animation-duration: 52s; animation-delay: -12s; opacity: 0.7; }
.c3 { top: 14%; width: 55px; animation-duration: 44s; animation-delay: -22s; opacity: 0.6; }
@keyframes drift { from { left: -90px; } to { left: 110%; } }

.mtn-far { position: absolute; bottom: 30%; left: 0; width: 100%; height: 120px; }
.mtn-near { position: absolute; bottom: 25%; left: 0; width: 100%; height: 120px; }

.campfire { position: absolute; bottom: 26%; width: 14px; height: 14px; }
.flame { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 10px; height: 16px; background: radial-gradient(circle at 50% 80%, #fff3b0, #ff8c2e 50%, #ff3b1f 100%); border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; animation: flicker 0.5s ease-in-out infinite alternate; filter: blur(0.5px); box-shadow: 0 0 14px rgba(255,140,60,0.8); }
@keyframes flicker { 0% { transform: translateX(-50%) scaleY(1); } 100% { transform: translateX(-50%) scaleY(1.25) scaleX(0.85); } }

.gate { position: absolute; bottom: 24%; left: 50%; transform: translateX(-50%); width: 96px; }
.gate-roof { width: 110px; height: 26px; margin-left: -7px; background: linear-gradient(180deg, #6a1f1f, #3a0e0e); clip-path: polygon(8% 100%, 0 60%, 50% 0, 100% 60%, 92% 100%); border-bottom: 3px solid var(--gold); }
.gate-body { width: 96px; height: 50px; background: linear-gradient(180deg, #3a2520, #1a0e0c); border: 2px solid rgba(212,164,55,0.5); border-top: none; border-radius: 0 0 6px 6px; position: relative; }
.gate-body::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 22px; height: 30px; background: #120806; border-radius: 12px 12px 0 0; border: 2px solid var(--gold-deep); border-bottom: none; }
.gate-flag { position: absolute; top: -2px; right: -16px; width: 18px; height: 22px; background: var(--crimson); color: var(--gold-light); font-family: var(--font-display); font-size: 12px; display: flex; align-items: center; justify-content: center; clip-path: polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%); animation: flagWave 2s ease-in-out infinite; transform-origin: left center; }
@keyframes flagWave { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(6deg); } }

.bg-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 45%, transparent 0%, rgba(10,4,10,0.55) 100%); }

/* === 飘动令旗 === */
.flags { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
.flag {
  position: absolute; top: -40px; width: 24px; height: 32px;
  background: linear-gradient(135deg, var(--crimson), #6a0000);
  color: var(--gold-light); font-family: var(--font-display); font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  clip-path: polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%);
  animation: flagFall 9s linear infinite; opacity: 0.55;
}
@keyframes flagFall { 0% { transform: translateY(-40px) rotate(-10deg); opacity: 0; } 10% { opacity: 0.6; } 100% { transform: translateY(720px) rotate(20deg); opacity: 0; } }

/* === 女性古装人物（透明背景，坐在登录卡片上，各部位独立动画） === */
/* 整体定位：水平居中，垂直方向与登录卡片上沿重叠，让人物"坐"在卡片上 */
.heroine {
  position: absolute;
  top: 16%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 260px;
  z-index: 5;                 /* 高于 panel，确保无遮挡显示 */
  pointer-events: none;       /* 不阻挡登录卡片交互 */
}
.h-glow {
  position: absolute; inset: -10px -20px 30px;
  background: radial-gradient(ellipse at 50% 40%, rgba(255,200,220,0.18), transparent 65%);
  animation: aura 4s ease-in-out infinite;
}
@keyframes aura { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }

/* 人物整体：呼吸（轻微缩放，非上下移动） */
.h-figure {
  position: absolute; left: 50%; top: 0; transform: translateX(-50%);
  width: 200px; height: 260px;
  animation: breathe 4s ease-in-out infinite;
  transform-origin: 50% 100%;
}
@keyframes breathe { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.012); } }

/* 长发后摆：飘动 */
.hair {
  position: absolute; left: 50%; top: 18px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #1a0e1a, #2a1626 60%, #3a1f30);
  border-radius: 30px 30px 50% 50% / 30px 30px 60% 60%;
}
.hair-back { width: 90px; height: 130px; transform-origin: 50% 0%; animation: hairSwayL 3.2s ease-in-out infinite; }
.hair-back-2 { width: 70px; height: 110px; transform-origin: 50% 0%; animation: hairSwayR 3.6s ease-in-out infinite; opacity: 0.85; z-index: 0; }
@keyframes hairSwayL { 0%,100% { transform: translateX(-50%) rotate(-3deg) skewX(-2deg); } 50% { transform: translateX(-50%) rotate(3deg) skewX(2deg); } }
@keyframes hairSwayR { 0%,100% { transform: translateX(-50%) rotate(2deg) skewX(1deg); } 50% { transform: translateX(-50%) rotate(-2deg) skewX(-1deg); } }

/* 头部 */
.head {
  position: absolute; left: 50%; top: 8px;
  transform: translateX(-50%);
  width: 70px; height: 80px;
  z-index: 3;
  animation: headTilt 6s ease-in-out infinite;
  transform-origin: 50% 100%;
}
@keyframes headTilt { 0%,100% { transform: translateX(-50%) rotate(-3deg); } 50% { transform: translateX(-50%) rotate(3deg); } }

/* 发髻 */
.bun {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  width: 38px; height: 28px;
  background: linear-gradient(180deg, #1a0e1a, #2a1626);
  border-radius: 50% 50% 40% 40% / 70% 70% 30% 30%;
  border: 2px solid #0a0508;
  z-index: 4;
}
.bun::before { content: ''; position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 26px; height: 8px; background: linear-gradient(180deg, #d4a437, #8b6914); border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.5); }
/* 金钗步摇 */
.zhan { position: absolute; top: 4px; left: -8px; width: 14px; height: 2px; background: linear-gradient(90deg, #d4a437, transparent); transform-origin: right center; animation: zhanSwing 2s ease-in-out infinite; }
.zhan::after { content: ''; position: absolute; left: -2px; top: -3px; width: 6px; height: 6px; background: radial-gradient(circle, #fff3b0, #d4a437); border-radius: 50%; box-shadow: 0 0 4px rgba(255,200,80,0.8); }
.zhan.z2 { left: auto; right: -8px; transform: scaleX(-1); animation-delay: -1s; }
@keyframes zhanSwing { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
.zhan.z2 { animation-name: zhanSwingR; }
@keyframes zhanSwingR { 0%,100% { transform: scaleX(-1) rotate(-8deg); } 50% { transform: scaleX(-1) rotate(8deg); } }

/* 刘海 */
.hair-bang {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  width: 64px; height: 22px;
  background: linear-gradient(180deg, #1a0e1a, #2a1626);
  border-radius: 40px 40px 30% 30% / 24px 24px 70% 70%;
  z-index: 4;
  clip-path: polygon(0 0, 100% 0, 100% 60%, 88% 100%, 75% 60%, 62% 100%, 50% 60%, 38% 100%, 25% 60%, 12% 100%, 0 60%);
}

/* 脸 */
.face {
  position: absolute; top: 22px; left: 50%; transform: translateX(-50%);
  width: 56px; height: 60px;
  background: linear-gradient(180deg, #ffe8d4, #ffd9c0);
  border-radius: 50% 50% 45% 45% / 55% 55% 45% 45%;
  z-index: 3;
  box-shadow: inset -2px -3px 6px rgba(200,120,100,0.15);
}
.forehead-mark { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: radial-gradient(circle, #c0392b 30%, #8b0000); border-radius: 50%; box-shadow: 0 0 4px rgba(192,57,43,0.6); }
.brow { position: absolute; top: 20px; width: 14px; height: 3px; background: #2a1626; border-radius: 3px; }
.brow.l { left: 8px; transform: rotate(-6deg); }
.brow.r { right: 8px; transform: rotate(6deg); }
.eye { position: absolute; top: 26px; width: 8px; height: 10px; background: #1a0e1a; border-radius: 50%; overflow: hidden; }
.eye.l { left: 11px; }
.eye.r { right: 11px; }
.eye i { position: absolute; top: 1px; left: 1px; width: 3px; height: 3px; background: #fff; border-radius: 50%; }
.eye::after { content: ''; position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: #ffe8d4; transform: scaleY(0); transform-origin: top; animation: blink 4.5s infinite; }
.eye.r::after { animation-delay: 0.02s; }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(0); } 95%, 97% { transform: scaleY(1); } }
.blush { position: absolute; top: 40px; width: 12px; height: 7px; background: radial-gradient(circle, rgba(255,140,150,0.65), transparent 70%); border-radius: 50%; }
.blush.l { left: 4px; }
.blush.r { right: 4px; }
.mouth { position: absolute; top: 44px; left: 50%; transform: translateX(-50%); width: 10px; height: 5px; background: #c0392b; border-radius: 0 0 50% 50%; box-shadow: inset 0 -1px 2px rgba(139,0,0,0.5); }

/* 耳坠 */
.earring { position: absolute; top: 36px; width: 3px; height: 14px; }
.earring.l { left: -2px; }
.earring.r { right: -2px; }
.earring::before { content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 5px; background: #d4a437; border-radius: 50%; }
.earring::after { content: ''; position: absolute; top: 6px; left: 1px; width: 4px; height: 8px; background: radial-gradient(circle, #fff3b0, #d4a437); border-radius: 50%; animation: earringSwing 2.4s ease-in-out infinite; transform-origin: top center; }
.earring.r::after { animation-delay: -1.2s; }
@keyframes earringSwing { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }

/* 身体：汉服 */
.body {
  position: absolute; left: 50%; top: 80px;
  transform: translateX(-50%);
  width: 110px; height: 170px;
  z-index: 2;
}
/* 衣襟（交领） */
.collar {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 70px; height: 36px;
  background: linear-gradient(180deg, #b02a3a, #8b1f2e);
  clip-path: polygon(15% 0, 85% 0, 60% 100%, 50% 80%, 40% 100%);
  border-radius: 8px 8px 4px 4px;
  z-index: 3;
}
.collar::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.2)); clip-path: inherit; }
/* 裙摆 */
.skirt {
  position: absolute; top: 30px; left: 50%; transform: translateX(-50%);
  width: 100px; height: 140px;
  background: linear-gradient(180deg, #c0392b 0%, #8b1f2e 50%, #5a121f 100%);
  clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
  z-index: 1;
}
.skirt::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 2px; height: 100%; background: linear-gradient(180deg, rgba(255,220,180,0.4), transparent); }
.skirt::after { content: ''; position: absolute; top: 20px; left: 10%; width: 80%; height: 60%; background: repeating-linear-gradient(180deg, transparent 0, transparent 14px, rgba(212,164,55,0.15) 14px, rgba(212,164,55,0.15) 16px); }
/* 腰带 */
.waist-band {
  position: absolute; top: 30px; left: 50%; transform: translateX(-50%);
  width: 92px; height: 12px;
  background: linear-gradient(180deg, #f5e6a8, #d4a437 60%, #8b6914);
  border-radius: 3px;
  z-index: 3;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.waist-band::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 16px; height: 24px; background: linear-gradient(180deg, #d4a437, #8b6914); clip-path: polygon(0 0, 100% 0, 80% 100%, 50% 70%, 20% 100%); animation: ribbonSway 2.8s ease-in-out infinite; transform-origin: top center; }
@keyframes ribbonSway { 0%,100% { transform: translateX(-50%) rotate(-4deg); } 50% { transform: translateX(-50%) rotate(4deg); } }

/* 水袖：飘动 */
.sleeve {
  position: absolute; top: 6px;
  width: 50px; height: 80px;
  background: linear-gradient(180deg, #c0392b, #8b1f2e);
  z-index: 2;
}
.sleeve-l { left: -28px; transform-origin: 100% 0%; animation: sleeveL 3.4s ease-in-out infinite; clip-path: polygon(0 0, 100% 0, 80% 100%, 20% 80%); }
.sleeve-r { right: -28px; transform-origin: 0% 0%; animation: sleeveR 3.4s ease-in-out infinite; clip-path: polygon(0 0, 100% 0, 80% 80%, 20% 100%); }
@keyframes sleeveL { 0%,100% { transform: rotate(-8deg) translateY(0); } 50% { transform: rotate(4deg) translateY(-4px); } }
@keyframes sleeveR { 0%,100% { transform: rotate(8deg) translateY(0); } 50% { transform: rotate(-4deg) translateY(-4px); } }
.sleeve::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 12px; background: linear-gradient(180deg, #f5e6a8, #d4a437); }

/* 双手 */
.hand { position: absolute; width: 14px; height: 14px; background: linear-gradient(180deg, #ffe8d4, #ffd9c0); border-radius: 50%; z-index: 4; }
.hand-l { top: 24px; left: 18px; }

/* 持扇的手臂 */
.fan-arm {
  position: absolute; top: 24px; right: 18px;
  z-index: 5;
  animation: fanArm 3.6s ease-in-out infinite;
  transform-origin: 0% 100%;
}
@keyframes fanArm { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(4deg); } }
.fan-arm .hand { position: absolute; top: 0; left: 0; }
/* 团扇 */
.fan {
  position: absolute; top: -34px; left: -8px;
  width: 48px; height: 48px;
  animation: fanWave 4s ease-in-out infinite;
  transform-origin: 50% 100%;
}
@keyframes fanWave { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(8deg); } }
.fan-stick {
  position: absolute; bottom: 0; left: 50%;
  width: 1.5px; height: 46px;
  background: linear-gradient(180deg, #8b6914, #4a3b2a);
  transform-origin: 50% 100%;
}
.fan-paint {
  position: absolute; top: -2px; left: 50%; transform: translateX(-50%);
  width: 50px; height: 30px;
  background: radial-gradient(ellipse at 50% 100%, #fff3b0 0%, #ffd9c0 40%, #f0c0d0 100%);
  border-radius: 50% 50% 0 0;
  border: 1.5px solid #8b6914;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
}
.fan-paint::before { content: ''; position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: radial-gradient(circle, #c0392b, transparent 70%); border-radius: 50%; }
.fan-paint::after { content: ''; position: absolute; top: 14px; left: 12px; width: 4px; height: 4px; background: #d4a437; border-radius: 50%; box-shadow: 16px 0 0 #d4a437, 8px -2px 0 #d4a437; }
.fan-ribbon { position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 4px; height: 12px; background: linear-gradient(180deg, #c0392b, #8b1f2e); animation: ribbonSway 2s ease-in-out infinite; transform-origin: top center; }

/* 飘落花瓣 */
.petal {
  position: absolute; top: -20px;
  width: 8px; height: 8px;
  background: linear-gradient(135deg, #ffb3c1, #ff8aa2);
  border-radius: 50% 0 50% 0;
  opacity: 0.7;
  animation: petalFall linear infinite;
}
@keyframes petalFall { 0% { transform: translateY(-20px) rotate(0); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.6; } 100% { transform: translateY(280px) rotate(360deg); opacity: 0; } }

/* === 登录面板 === */
.panel { position: relative; z-index: 4; width: 86%; max-width: 340px; background: rgba(24,14,24,0.82); backdrop-filter: blur(16px); border: 2px solid rgba(212,164,55,0.4); border-radius: 24px; padding: 22px 20px 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 6px rgba(212,164,55,0.06); animation: panelIn .5s cubic-bezier(.2,1.4,.4,1) backwards; margin-top: 60px; }
@keyframes panelIn { from { transform: translateY(30px) scale(0.92); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

.brand { text-align: center; margin-bottom: 18px; }
.seal { width: 60px; height: 60px; margin: 0 auto 8px; border-radius: 14px; background: linear-gradient(135deg, var(--crimson), #5a0000); border: 3px solid var(--gold); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 30px; color: var(--gold-light); box-shadow: 0 0 24px rgba(139,0,0,0.6), inset 0 -3px 0 rgba(0,0,0,0.3); transform: rotate(-6deg); animation: sealPop 0.6s cubic-bezier(.2,1.6,.4,1) backwards; }
.seal span { display: block; transform: rotate(6deg); }
@keyframes sealPop { from { transform: rotate(-30deg) scale(0); } to { transform: rotate(-6deg) scale(1); } }
.brand h1 { font-family: var(--font-display); font-size: 25px; color: var(--gold); letter-spacing: 4px; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
.brand p { font-size: 11px; color: rgba(245,230,168,0.6); margin-top: 4px; letter-spacing: 1px; }

.tabs { position: relative; display: flex; background: rgba(255,255,255,0.07); border: 1px solid rgba(212,164,55,0.2); border-radius: 14px; padding: 4px; margin-bottom: 16px; }
.tab { flex: 1; text-align: center; padding: 10px; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.5); cursor: pointer; z-index: 2; transition: color .25s; }
.tab.on { color: var(--ink); }
.tab-ind { position: absolute; top: 4px; left: 4px; width: calc(50% - 4px); height: calc(100% - 8px); background: linear-gradient(135deg, var(--gold), var(--gold-light)); border-radius: 10px; transition: transform .3s cubic-bezier(.4,1.4,.5,1); box-shadow: 0 2px 8px rgba(212,164,55,0.4); }

.field { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.08); border: 2px solid rgba(212,164,55,0.25); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px; transition: border .2s, background .2s, transform .15s; }
.field:focus-within { border-color: var(--gold); background: rgba(255,255,255,0.13); transform: scale(1.01); box-shadow: 0 0 0 3px rgba(212,164,55,0.15); }
.ic { font-size: 20px; opacity: 0.85; color: var(--gold); }
.field input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: #fff; font-size: 15px; font-family: var(--font-body); }
.field input::placeholder { color: rgba(255,255,255,0.38); }
.pwd-toggle { background: none; border: none; cursor: pointer; padding: 2px; color: rgba(255,255,255,0.5); display: flex; }
.pwd-toggle .ms { font-size: 20px; }

.err { display: flex; align-items: center; gap: 4px; color: #ff8a7a; font-size: 12px; margin: -2px 0 8px; }
.err .ms { font-size: 14px; }

.agree { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.55); margin-bottom: 14px; cursor: pointer; }
.agree input { accent-color: var(--gold); width: 14px; height: 14px; }

.submit { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 14px; border-radius: 14px; font-size: 16px; transition: transform .12s, filter .2s, box-shadow .2s; box-shadow: 0 6px 18px rgba(139,0,0,0.4); }
.submit:not(:disabled) { box-shadow: 0 6px 18px rgba(139,0,0,0.4), 0 0 0 0 rgba(212,164,55,0.5); animation: submitPulse 2s ease-in-out infinite; }
.submit .ms { font-size: 18px; }
.submit:disabled { opacity: 0.5; filter: grayscale(0.5); cursor: not-allowed; animation: none; }
@keyframes submitPulse { 50% { box-shadow: 0 6px 18px rgba(139,0,0,0.4), 0 0 0 8px rgba(212,164,55,0); } }

.divider { display: flex; align-items: center; gap: 10px; margin: 14px 0 10px; color: rgba(255,255,255,0.35); font-size: 11px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.14); }

.guest { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 11px; border-radius: 14px; font-size: 13px; font-family: var(--font-body); }
.guest .ms { font-size: 16px; }

.foot { position: absolute; bottom: 18px; width: 100%; text-align: center; font-size: 10px; color: rgba(255,255,255,0.35); z-index: 4; }
</style>
