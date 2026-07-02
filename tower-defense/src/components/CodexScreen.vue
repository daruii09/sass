<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { UNITS } from '../data/units'
import { TOWERS } from '../data/towers'
import { ENEMIES } from '../data/enemies'

const store = useGameStore()
const tab = ref<'units' | 'towers' | 'enemies' | 'weapons'>('units')
const rankIdx = store.rankIndex

// Q 版图标映射
const UNIT_ICONS: Record<string, string> = { shield: 'shield', spear: 'legend_toggle', archer: 'north_east', ballista: 'gps_fixed', catapult: 'rocket_launch', cavalry: 'directions_horse', guard: 'security' }
const TOWER_ICONS: Record<string, string> = { archer: 'north_east', ballista: 'gps_fixed', catapult: 'rocket_launch', barracks: 'domain' }
const ENEMY_ICONS: Record<string, string> = { bandit: 'skull', shield: 'sprint', archer: 'north_east', cavalry: 'directions_horse', heavy: 'fitness_center', eagle: 'raven', siege: 'precision_manufacturing', brute: 'person_raised_hand', boss: 'crown' }

const weapons = computed(() => ([
  { id: 'dagger', name: '短刀', icon: 'hardware', desc: '边军标配短兵，近战肉搏用。', dmg: '攻击 +8' },
  { id: 'shield', name: '圆盾', icon: 'shield', desc: '木盾铁钉，格挡减伤。', dmg: '防御 +20' },
  { id: 'spear', name: '长枪', icon: 'arrow_forward', desc: '红缨长枪，长柄刺击。', dmg: '攻击 +16' },
  { id: 'bow', name: '猎弓', icon: 'north_east', desc: '竹木轻弓，速射压制。', dmg: '远程 +14' },
  { id: 'ballista', name: '床弩', icon: 'gps_fixed', desc: '巨型弩机，破甲专精。', dmg: '远程 +55' },
  { id: 'catapult', name: '投石车', icon: 'rocket_launch', desc: '杠杆抛石，范围杀伤。', dmg: '攻城 +75' },
  { id: 'ironbow', name: '铁胎弓', icon: 'adjust', desc: '黑铁强弓，贯甲一矢。', dmg: '远程 +35' },
  { id: 'repeater', name: '连弩', icon: 'replay', desc: '诸葛连弩，十矢连发。', dmg: '远程 +20' },
  { id: 'dualblade', name: '双刀', icon: 'content_cut', desc: '连环双刃，禁军专用。', dmg: '攻击 +45' },
]))
</script>

<template>
  <section class="screen codex grain">
    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('main')"><span class="ms">arrow_back</span></button>
      <h1>军备图鉴</h1>
      <span class="spacer"></span>
    </header>

    <div class="tabs">
      <div :class="['t', { on: tab === 'units' }]" @click="tab = 'units'">兵种</div>
      <div :class="['t', { on: tab === 'towers' }]" @click="tab = 'towers'">防御塔</div>
      <div :class="['t', { on: tab === 'enemies' }]" @click="tab = 'enemies'">敌军</div>
      <div :class="['t', { on: tab === 'weapons' }]" @click="tab = 'weapons'">兵器</div>
    </div>

    <div class="grid">
      <!-- 兵种 -->
      <template v-if="tab === 'units'">
        <div v-for="u in UNITS" :key="u.id" :class="['card', { lock: rankIdx + 1 < u.unlockRank }]">
          <div class="card-img">
            <QAsset variant="unit" :src="u.asset" :name="u.name" :icon="UNIT_ICONS[u.id] || 'person'" :rounded="14" transparent />
            <div v-if="rankIdx + 1 < u.unlockRank" class="lock-overlay"><span class="ms">lock</span></div>
          </div>
          <div class="card-name">{{ u.name }}</div>
          <div class="card-tags">
            <span class="badge">{{ u.type === 'melee' ? '近战' : u.type === 'ranged' ? '远程' : u.type === 'cavalry' ? '骑兵' : '攻城' }}</span>
          </div>
          <div class="card-stats">
            <span class="stat"><span class="ms si">favorite</span>{{ u.hp }}</span>
            <span class="stat"><span class="ms si">military_tech</span>{{ u.atk }}</span>
            <span class="stat"><span class="ms si">gps_fixed</span>{{ u.range }}</span>
            <span class="stat"><span class="ms si">grass</span>{{ u.cost }}</span>
          </div>
          <div v-if="rankIdx + 1 < u.unlockRank" class="lock-tip">需军阶 {{ u.unlockRank }} 解锁</div>
        </div>
      </template>

      <!-- 防御塔 -->
      <template v-if="tab === 'towers'">
        <div v-for="t in Object.values(TOWERS)" :key="t.kind" :class="['card', { lock: rankIdx + 1 < t.unlockRank }]">
          <div class="card-img">
            <QAsset variant="tower" :src="t.tiers[0].asset" :name="t.name" :icon="TOWER_ICONS[t.kind] || 'tower'" :tier="1" :rounded="14" transparent />
            <div v-if="rankIdx + 1 < t.unlockRank" class="lock-overlay"><span class="ms">lock</span></div>
          </div>
          <div class="card-name">{{ t.name }}</div>
          <div class="card-tags">
            <span class="badge tier">Lv.1-3</span>
          </div>
          <div class="card-stats">
            <span v-if="t.tiers[0].range" class="stat"><span class="ms si">gps_fixed</span>{{ t.tiers[0].range }}</span>
            <span v-if="t.tiers[0].damage" class="stat"><span class="ms si">military_tech</span>{{ t.tiers[0].damage }}</span>
            <span class="stat"><span class="ms si">grass</span>{{ t.tiers[0].cost }}</span>
          </div>
          <div v-if="rankIdx + 1 < t.unlockRank" class="lock-tip">需军阶 {{ t.unlockRank }} 解锁</div>
        </div>
      </template>

      <!-- 敌军 -->
      <template v-if="tab === 'enemies'">
        <div v-for="e in Object.values(ENEMIES)" :key="e.id" class="card">
          <div class="card-img">
            <QAsset variant="enemy" :src="e.asset" :name="e.name" :icon="ENEMY_ICONS[e.id] || 'skull'" :rounded="14" transparent />
          </div>
          <div class="card-name">{{ e.name }}</div>
          <div class="card-tags">
            <span v-if="e.boss" class="badge boss">BOSS</span>
          </div>
          <div class="card-stats">
            <span class="stat"><span class="ms si">favorite</span>{{ e.hp }}</span>
            <span class="stat"><span class="ms si">military_tech</span>{{ e.atk }}</span>
            <span class="stat"><span class="ms si">shield</span>{{ e.armor }}</span>
            <span class="stat"><span class="ms si">payments</span>{{ e.bounty }}</span>
          </div>
        </div>
      </template>

      <!-- 兵器 -->
      <template v-if="tab === 'weapons'">
        <div v-for="w in weapons" :key="w.id" class="card">
          <div class="card-img">
            <QAsset variant="weapon" :name="w.name" :icon="w.icon" :rounded="14" transparent />
          </div>
          <div class="card-name">{{ w.name }}</div>
          <div class="card-desc">{{ w.desc }}</div>
          <div class="card-stats">
            <span class="stat">{{ w.dmg }}</span>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.codex {
  background: linear-gradient(180deg, #0a0e1a 0%, #12182a 50%, #0a0e1a 100%);
}

.hd {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.45);
  border-bottom: 1px solid rgba(212, 164, 55, 0.08);
}

.back {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 22px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hd h1 {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--gold);
  letter-spacing: 2px;
}

.spacer {
  width: 38px;
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
}

.t {
  flex: 1;
  text-align: center;
  padding: 9px 4px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  border: 1px solid transparent;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  font-family: var(--font-body);
}

.t.on {
  background: rgba(212, 164, 55, 0.12);
  color: var(--gold);
  border-color: rgba(212, 164, 55, 0.25);
  border-bottom-color: var(--gold);
}

/* ── Grid ── */
.grid {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  align-content: start;
}

/* ── Card ── */
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px 8px;
  background: transparent;
  border: none;
  border-radius: 14px;
  transition: transform 0.15s;
}

.card:active {
  transform: scale(0.97);
}

.card.lock {
  opacity: 0.45;
}

/* ── Card Image ── */
.card-img {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 6px;
}

.card-img :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.lock-overlay .ms {
  font-size: 28px;
  color: rgba(212, 164, 55, 0.5);
}

/* ── Card Name ── */
.card-name {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--gold-light);
  text-align: center;
  margin-bottom: 4px;
  line-height: 1.2;
}

/* ── Card Tags ── */
.card-tags {
  margin-bottom: 6px;
  min-height: 18px;
  display: flex;
  justify-content: center;
}

.badge {
  font-family: var(--font-body);
  font-size: 10px;
  padding: 1px 7px;
  border-radius: 6px;
  background: rgba(46, 125, 91, 0.25);
  color: #6bff9e;
}

.badge.boss {
  background: rgba(139, 0, 0, 0.4);
  color: #ff8888;
}

.badge.tier {
  background: rgba(212, 164, 55, 0.15);
  color: var(--gold);
}

/* ── Card Desc ── */
.card-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  margin-bottom: 6px;
  line-height: 1.35;
}

/* ── Card Stats ── */
.card-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  font-size: 11px;
  color: var(--gold-light);
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  color: var(--gold);
}

.si {
  font-size: 13px;
  color: var(--gold);
}

/* ── Lock Tip ── */
.lock-tip {
  font-size: 10px;
  color: #ff9966;
  margin-top: 5px;
  text-align: center;
}
</style>