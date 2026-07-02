<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { ASSETS } from '../data/assets'

const store = useGameStore()
const mode = ref<'login' | 'register'>('login')
const phone = ref('')
const pwd = ref('')
const nickname = ref('')
const agreed = ref(true)
const err = ref('')

const valid = computed(() => {
  if (mode.value === 'register' && nickname.value.trim().length < 2) return false
  if (!/^1\d{10}$/.test(phone.value)) return false
  return pwd.value.length >= 6
})

function submit() {
  if (!valid.value) { err.value = '请检查手机号与密码(≥6位)'; return }
  err.value = ''
  store.login(nickname.value || `将士${phone.value.slice(-4)}`, false)
}
function guest() { store.login('无名小卒', true) }
</script>

<template>
  <section class="screen auth grain">
    <img class="bg" :src="ASSETS.bg.hall" alt="" />
    <div class="bg-overlay"></div>

    <!-- 飘动令旗装饰 -->
    <div class="flags">
      <div class="flag" v-for="i in 5" :key="i" :style="{ left: (10+i*18)+'%', animationDelay: (i*0.5)+'s' }">令</div>
    </div>

    <div class="panel">
      <div class="brand">
        <div class="seal">帥</div>
        <h1>烽火主帅</h1>
        <p>投笔从戎 · 步步高升 · 招兵破敌</p>
      </div>

      <div class="tabs">
        <div :class="['tab', { on: mode==='login' }]" @click="mode='login'">登录</div>
        <div :class="['tab', { on: mode==='register' }]" @click="mode='register'">注册</div>
        <div class="tab-ind" :style="{ transform: mode==='login' ? 'translateX(0)' : 'translateX(100%)' }"></div>
      </div>

      <div class="field">
        <span class="ic">📱</span>
        <input v-model="phone" type="tel" maxlength="11" placeholder="手机号" />
      </div>
      <template v-if="mode==='register'">
        <div class="field">
          <span class="ic">🪖</span>
          <input v-model="nickname" type="text" placeholder="军中名号 (≥2字)" />
        </div>
      </template>
      <div class="field">
        <span class="ic">🔑</span>
        <input v-model="pwd" :type="'password'" placeholder="口令 (≥6位)" @keyup.enter="submit" />
      </div>

      <p v-if="err" class="err">{{ err }}</p>

      <label class="agree">
        <input type="checkbox" v-model="agreed" />
        <span>我已阅读《军令状》及《征战须知》</span>
      </label>

      <button class="submit btn btn-crimson" :disabled="!valid || !agreed" @click="submit">
        {{ mode === 'login' ? '登 帐 点 兵' : '注 册 从 戎' }}
      </button>

      <div class="divider"><span>或</span></div>

      <button class="guest btn btn-ghost" @click="guest">游客试阵 · 仅体验不存档</button>
    </div>

    <p class="foot">登录即代表你将作为主帅从边防小兵开启征途</p>
  </section>
</template>

<style scoped>
.auth { background: linear-gradient(180deg, #1a1024 0%, #2a1428 50%, #1a0e1a 100%); justify-content: center; }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.28; filter: blur(1px) saturate(1.2); }
.bg-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, transparent 0%, rgba(10,4,10,0.85) 100%); }

.flags { position: absolute; inset: 0; pointer-events: none; }
.flag {
  position: absolute; top: -40px; width: 26px; height: 34px;
  background: linear-gradient(135deg, var(--crimson), #6a0000);
  color: var(--gold-light); font-family: var(--font-display); font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  clip-path: polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%);
  animation: flagFall 8s linear infinite; opacity: 0.5;
}
@keyframes flagFall { 0% { transform: translateY(-40px) rotate(-10deg); opacity: 0; } 10% { opacity: 0.6; } 100% { transform: translateY(720px) rotate(20deg); opacity: 0; } }

.panel { position: relative; z-index: 3; width: 86%; max-width: 340px; background: rgba(20,12,20,0.78); backdrop-filter: blur(14px); border: 1px solid rgba(212,164,55,0.35); border-radius: 20px; padding: 22px 20px 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06); }

.brand { text-align: center; margin-bottom: 16px; }
.seal { width: 56px; height: 56px; margin: 0 auto 8px; border-radius: 12px; background: linear-gradient(135deg, var(--crimson), #5a0000); border: 2px solid var(--gold); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 28px; color: var(--gold-light); box-shadow: 0 0 24px rgba(139,0,0,0.6); transform: rotate(-6deg); animation: sealPop 0.6s cubic-bezier(.2,1.6,.4,1) backwards; }
@keyframes sealPop { from { transform: rotate(-30deg) scale(0); } to { transform: rotate(-6deg) scale(1); } }
.brand h1 { font-family: var(--font-display); font-size: 24px; color: var(--gold); letter-spacing: 4px; }
.brand p { font-size: 11px; color: rgba(245,230,168,0.55); margin-top: 4px; letter-spacing: 1px; }

.tabs { position: relative; display: flex; background: rgba(255,255,255,0.06); border-radius: 10px; padding: 4px; margin-bottom: 16px; }
.tab { flex: 1; text-align: center; padding: 10px; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.5); cursor: pointer; z-index: 2; transition: color .25s; }
.tab.on { color: var(--ink); }
.tab-ind { position: absolute; top: 4px; left: 4px; width: calc(50% - 4px); height: calc(100% - 8px); background: linear-gradient(135deg, var(--gold), var(--gold-light)); border-radius: 8px; transition: transform .3s cubic-bezier(.4,1.4,.5,1); }

.field { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.07); border: 1px solid rgba(212,164,55,0.25); border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; transition: border .2s, background .2s; }
.field:focus-within { border-color: var(--gold); background: rgba(255,255,255,0.11); }
.ic { font-size: 16px; opacity: 0.7; }
.field input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-size: 15px; font-family: var(--font-body); }
.field input::placeholder { color: rgba(255,255,255,0.35); }

.err { color: #ff7766; font-size: 12px; margin: -4px 0 8px; }

.agree { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 14px; }
.agree input { accent-color: var(--gold); }

.submit { width: 100%; padding: 14px; border-radius: 12px; font-size: 16px; }
.submit:disabled { opacity: 0.5; filter: grayscale(0.5); }

.divider { display: flex; align-items: center; gap: 10px; margin: 14px 0 10px; color: rgba(255,255,255,0.3); font-size: 11px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.12); }

.guest { width: 100%; padding: 11px; border-radius: 12px; font-size: 13px; font-family: var(--font-body); }

.foot { position: absolute; bottom: 18px; width: 100%; text-align: center; font-size: 10px; color: rgba(255,255,255,0.3); z-index: 3; }
</style>
