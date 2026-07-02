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
      <div :class="['t', { on: tab==='units' }]" @click="tab='units'">兵种</div>
      <div :class="['t', { on: tab==='towers' }]" @click="tab='towers'">防御塔</div>
      <div :class="['t', { on: tab==='enemies' }]" @click="tab='enemies'">敌军</div>
      <div :class="['t', { on: tab==='weapons' }]" @click="tab='weapons'">兵器</div>
    </div>

    <div class="list">
      <template v-if="tab==='units'">
        <div v-for="u in UNITS" :key="u.id" :class="['item', { lock: rankIdx + 1 < u.unlockRank }]">
          <QAsset class="im" variant="unit" :src="u.asset" :name="u.name" :icon="UNIT_ICONS[u.id] || 'person'" :rounded="12" />
          <div class="info">
            <div class="nm">{{ u.name }} <span class="tag">{{ u.type==='melee'?'近战':u.type==='ranged'?'远程':u.type==='cavalry'?'骑兵':'攻城' }}</span></div>
            <div class="ds">{{ u.desc }}</div>
            <div class="stats">
              <span><span class="ms si">favorite</span>{{ u.hp }}</span><span><span class="ms si">military_tech</span>{{ u.atk }}</span><span><span class="ms si">gps_fixed</span>{{ u.range }}</span><span><span class="ms si">grass</span>{{ u.cost }}</span>
            </div>
            <div class="lock-tip" v-if="rankIdx + 1 < u.unlockRank">需军阶 {{ u.unlockRank }} 解锁</div>
          </div>
        </div>
      </template>
      <template v-if="tab==='towers'">
        <div v-for="t in Object.values(TOWERS)" :key="t.kind" :class="['item', { lock: rankIdx + 1 < t.unlockRank }]">
          <QAsset class="im" variant="tower" :src="t.tiers[0].asset" :name="t.name" :icon="TOWER_ICONS[t.kind] || 'tower'" :tier="1" :rounded="12" />
          <div class="info">
            <div class="nm">{{ t.name }} <span class="tag tier">3级可升</span></div>
            <div class="ds">{{ t.desc }}</div>
            <div class="stats">
              <span v-if="t.tiers[0].range"><span class="ms si">gps_fixed</span>{{ t.tiers[0].range }}</span><span v-if="t.tiers[0].damage"><span class="ms si">military_tech</span>{{ t.tiers[0].damage }}</span><span><span class="ms si">grass</span>{{ t.tiers[0].cost }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-if="tab==='enemies'">
        <div v-for="e in Object.values(ENEMIES)" :key="e.id" class="item">
          <QAsset class="im" variant="enemy" :src="e.asset" :name="e.name" :icon="ENEMY_ICONS[e.id] || 'skull'" :rounded="12" />
          <div class="info">
            <div class="nm">{{ e.name }} <span class="tag red" v-if="e.boss">BOSS</span></div>
            <div class="ds">{{ e.desc }}</div>
            <div class="stats">
              <span><span class="ms si">favorite</span>{{ e.hp }}</span><span><span class="ms si">military_tech</span>{{ e.atk }}</span><span><span class="ms si">shield</span>{{ e.armor }}</span><span><span class="ms si">payments</span>{{ e.bounty }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-if="tab==='weapons'">
        <div v-for="w in weapons" :key="w.id" class="item">
          <QAsset class="im" variant="weapon" :name="w.name" :icon="w.icon" :rounded="12" />
          <div class="info">
            <div class="nm">{{ w.name }}</div>
            <div class="ds">{{ w.desc }}</div>
            <div class="stats"><span>{{ w.dmg }}</span></div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.codex { background: linear-gradient(180deg, #0d1b2a 0%, #1a1a2e 100%); }
.hd { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: rgba(0,0,0,0.4); }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 22px; padding: 0; display: flex; align-items: center; justify-content: center; }
.hd h1 { font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.spacer { width: 38px; }
.tabs { display: flex; gap: 6px; padding: 0 14px 12px; }
.t { flex: 1; text-align: center; padding: 9px; border-radius: 10px; font-size: 13px; font-weight: 600; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.45); cursor: pointer; border: 1px solid transparent; transition: all .2s; }
.t.on { background: rgba(212,164,55,0.15); color: var(--gold); border-color: var(--gold); }
.list { flex: 1; overflow-y: auto; padding: 0 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.item { display: flex; gap: 12px; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(212,164,55,0.18); border-radius: 14px; transition: transform .15s; }
.item:active { transform: scale(0.98); }
.item.lock { opacity: 0.45; }
.im { width: 76px; height: 76px; border-radius: 12px; object-fit: cover; border: 2px solid var(--gold); flex-shrink: 0; }
.im.enemy { border-color: var(--crimson-light); }
.info { flex: 1; }
.nm { font-family: var(--font-display); font-size: 16px; color: var(--gold-light); display: flex; align-items: center; gap: 6px; }
.tag { font-family: var(--font-body); font-size: 10px; padding: 1px 6px; border-radius: 6px; background: rgba(46,125,91,0.3); color: #6BFF9E; }
.tag.red { background: rgba(139,0,0,0.4); color: #ff8888; }
.tag.tier { background: rgba(212,164,55,0.2); color: var(--gold); }
.ds { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px; line-height: 1.4; }
.stats { display: flex; gap: 10px; margin-top: 8px; font-size: 11px; color: var(--gold-light); flex-wrap: wrap; align-items: center; }
.stats span { display: inline-flex; align-items: center; gap: 2px; }
.si { font-size: 14px; color: var(--gold); }
.lock-tip { font-size: 11px; color: #ff9966; margin-top: 6px; }
</style>
