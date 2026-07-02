<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { CHAPTERS, LEVELS, levelsOfChapter } from '../data/levels'

const store = useGameStore()
const ch = ref(0)

const list = computed(() => levelsOfChapter(ch.value))
const totalStars = computed(() => Object.values(store.levelStars).reduce((a, b) => a + b, 0))

function isUnlocked(levelId: number): boolean {
  if (levelId === 1) return true
  return !!store.levelStars[levelId - 1]
}

function enter(levelId: number) {
  if (!isUnlocked(levelId)) return
  store.currentLevelId = levelId
  store.go('battle')
}
</script>

<template>
  <section class="screen levels grain">
    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('main')">←</button>
      <h1>关卡征战</h1>
      <span class="spacer"></span>
    </header>

    <div class="chapters">
      <div v-for="(c, i) in CHAPTERS" :key="i" :class="['ch', { on: ch===i, lock: i > 0 && !LEVELS.find(l=>l.chapter===i && store.levelStars[l.id]) }]" @click="ch = i">
        <div class="ch-ic">{{ c.icon }}</div>
        <div class="ch-nm">{{ c.name }}</div>
      </div>
    </div>

    <div class="banner">
      <div>
        <div class="bn">{{ CHAPTERS[ch].name }}</div>
        <div class="be">主要敌军：{{ CHAPTERS[ch].enemy }}</div>
      </div>
      <div class="stars">⭐ {{ totalStars }}</div>
    </div>

    <div class="grid">
      <div v-for="lv in list" :key="lv.id" :class="['lv', { lock: !isUnlocked(lv.id), boss: lv.boss }]" @click="enter(lv.id)">
        <div class="lv-id">{{ lv.id }}</div>
        <div class="lv-stars">
          <span v-for="s in 3" :key="s" :class="['st', { on: (store.levelStars[lv.id] || 0) >= s }]">★</span>
        </div>
        <div class="lv-rw">💰{{ lv.reward }}</div>
        <div class="lv-boss" v-if="lv.boss">BOSS</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.levels { background: linear-gradient(180deg, #1a1a2e 0%, #2a1818 100%); }
.hd { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: rgba(0,0,0,0.4); }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 18px; padding: 0; }
.hd h1 { font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.spacer { width: 38px; }

.chapters { display: flex; gap: 8px; padding: 12px 14px; overflow-x: auto; }
.chapters::-webkit-scrollbar { display: none; }
.ch { flex-shrink: 0; width: 64px; padding: 10px 4px; background: rgba(255,255,255,0.05); border: 1px solid rgba(212,164,55,0.2); border-radius: 12px; text-align: center; cursor: pointer; transition: all .2s; }
.ch.on { background: rgba(212,164,55,0.18); border-color: var(--gold); }
.ch.lock { opacity: 0.4; }
.ch-ic { font-family: var(--font-display); font-size: 22px; color: var(--gold); }
.ch-nm { font-size: 10px; color: var(--gold-light); margin-top: 2px; }

.banner { display: flex; justify-content: space-between; align-items: center; margin: 0 14px 12px; padding: 12px 16px; background: rgba(139,0,0,0.25); border: 1px solid var(--gold); border-radius: 12px; }
.bn { font-family: var(--font-display); font-size: 17px; color: var(--gold-light); }
.be { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px; }
.stars { font-family: var(--font-num); color: var(--gold); font-size: 16px; }

.grid { flex: 1; overflow-y: auto; padding: 0 14px 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; align-content: start; }
.lv { position: relative; aspect-ratio: 1; background: rgba(255,255,255,0.06); border: 2px solid var(--gold); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform .15s, background .2s; }
.lv:active { transform: scale(0.93); }
.lv.lock { opacity: 0.45; border-color: rgba(255,255,255,0.2); }
.lv.boss { border-color: var(--crimson); background: rgba(139,0,0,0.2); }
.lv-id { font-family: var(--font-num); font-size: 26px; font-weight: 700; color: var(--gold-light); }
.lv-stars { display: flex; gap: 2px; margin-top: 4px; }
.st { font-size: 12px; color: rgba(255,255,255,0.2); }
.st.on { color: var(--gold); text-shadow: 0 0 6px var(--gold); }
.lv-rw { font-size: 10px; color: var(--gold-light); margin-top: 4px; }
.lv-boss { position: absolute; top: 4px; right: 4px; font-size: 9px; padding: 1px 5px; background: var(--crimson); color: #fff; border-radius: 4px; }
</style>
