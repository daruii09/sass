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

    <div class="panel">
      <!-- 女性古装人物：透明背景 PNG，坐在登录卡片左侧上方，全身自然晃动 -->
      <div class="heroine">
        <div class="h-glow"></div>
        <img src="/heroine/heroine.png" alt="古装女子" class="heroine-img" />
        <!-- 飘落花瓣点缀 -->
        <div class="petal" v-for="i in 5" :key="i" :style="{ left: (10+i*18)+'%', animationDelay: (i*1.3)+'s', animationDuration: (7+i%3)+'s' }"></div>
      </div>
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

/* === 女性古装人物（透明背景 PNG，坐在登录卡片左侧，全身自然晃动） === */
/* 放在 panel 内部，相对 panel 定位，确保人物"坐"在登录框左侧上沿 */
.heroine {
  position: absolute;
  top: -150px;            /* 人物顶部在 panel 上方 150px，让人物"坐"在框上 */
  left: -72px;            /* 偏左，人物右侧只覆盖 panel 左侧边缘，不挡文字 */
  width: 180px;
  height: 270px;
  z-index: 6;             /* 高于 panel 内容，无遮挡显示 */
  pointer-events: none;   /* 不阻挡登录卡片交互 */
}
.h-glow {
  position: absolute; inset: -10px -16px 24px;
  background: radial-gradient(ellipse at 50% 45%, rgba(255,200,220,0.22), transparent 65%);
  animation: aura 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes aura { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
/* 单张人物图片：以脚底为支点做复合自然晃动（轻微旋转 + 摆动 + 呼吸），不切割图片 */
.heroine-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
  /* 提升清晰度：高质量缩放 + 锐化滤镜 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35)) contrast(1.06) saturate(1.08);
  user-select: none;
  -webkit-user-drag: none;
  transform-origin: 50% 96%;   /* 支点在脚底，晃动时如坐姿摆腿带动全身 */
  animation: heroineSway 3.4s ease-in-out infinite;
}
/* 复合动画：以脚为支点的轻微左右摆动 + 扭转 + 呼吸缩放，模拟人物自然晃动（非图片切割移动） */
@keyframes heroineSway {
  0%   { transform: rotate(-1.2deg) skewX(-0.6deg) translateX(-1px)  scale(1); }
  25%  { transform: rotate(0.6deg)  skewX(0.3deg)  translateX(0.5px) scale(1.008); }
  50%  { transform: rotate(1.2deg)  skewX(0.6deg)  translateX(1px)   scale(1); }
  75%  { transform: rotate(0.4deg)  skewX(0.2deg)  translateX(0.5px) scale(1.008); }
  100% { transform: rotate(-1.2deg) skewX(-0.6deg) translateX(-1px)  scale(1); }
}

/* 飘落花瓣点缀 */
.petal {
  position: absolute; top: -20px;
  width: 8px; height: 8px;
  background: linear-gradient(135deg, #ffb3c1, #ff8aa2);
  border-radius: 50% 0 50% 0;
  opacity: 0.7;
  animation: petalFall linear infinite;
}
@keyframes petalFall { 0% { transform: translateY(-20px) rotate(0); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.6; } 100% { transform: translateY(320px) rotate(360deg); opacity: 0; } }

/* === 登录面板 === */
.panel { position: relative; z-index: 4; width: 86%; max-width: 340px; background: rgba(24,14,24,0.82); backdrop-filter: blur(16px); border: 2px solid rgba(212,164,55,0.4); border-radius: 24px; padding: 22px 20px 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 6px rgba(212,164,55,0.06); animation: panelIn .5s cubic-bezier(.2,1.4,.4,1) backwards; margin-top: 170px; overflow: visible; }
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
