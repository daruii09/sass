<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { useGameStore } from '../stores/game'
import { levelById } from '../data/levels'
import { RANKS } from '../data/commander'
import { TOWERS, TowerKind } from '../data/towers'
import { UNITS } from '../data/units'
import { SKILLS } from '../data/commander'
import { createGame, BattleConfig, BattleCallbacks, BattleResult } from '../game/engine'
import type Phaser from 'phaser'

const store = useGameStore()
const level = levelById(store.currentLevelId)!
const rank = RANKS[store.rankIndex]

const phaserHost = ref<HTMLDivElement>()
let game: Phaser.Game | null = null

const hud = reactive({
  grain: rank.grainMax,
  grainMax: rank.grainMax,
  baseHp: level.baseHp,
  baseHpMax: level.baseHp,
  wave: 0, waveTotal: level.waves.length,
  cmd: 0, cmdMax: rank.cmd,
  speed: 1,
  selectedSlot: null as number | null,
  // 选中塔升级
  selTowerKind: null as TowerKind | null,
  selTowerTier: 0,
  selTowerCanUp: false,
  selTowerUpCost: 0,
  selTowerName: '',
  skills: SKILLS.map(s => ({ ...s, ready: true, cdLeft: 0, locked: store.rankIndex + 1 < s.unlockRank })),
})

const cfg: BattleConfig = {
  level,
  grainMax: rank.grainMax,
  morale: rank.morale,
  cmd: rank.cmd,
  rankIndex: store.rankIndex,
}

const cb: BattleCallbacks = {
  onGrain: (g) => { hud.grain = g },
  onBaseHp: (hp, max) => { hud.baseHp = hp; hud.baseHpMax = max },
  onWave: (c, t) => { hud.wave = c; hud.waveTotal = t },
  onCmd: (u, m) => { hud.cmd = u; hud.cmdMax = m },
  onSelectSlot: (i) => {
    hud.selectedSlot = i
    if (i !== null) { clearTowerSel() }
  },
  onSelectTower: (_idx, kind, tier, canUp, upCost) => {
    hud.selTowerKind = kind
    hud.selTowerTier = tier
    hud.selTowerCanUp = canUp
    hud.selTowerUpCost = upCost
    hud.selTowerName = kind ? TOWERS[kind].name : ''
    if (kind !== null) hud.selectedSlot = null
  },
  onSpeed: (m) => { hud.speed = m },
  onSkillReady: (id, ready, cd) => {
    const s = hud.skills.find(x => x.id === id); if (s) { s.ready = ready; s.cdLeft = cd }
  },
  onEnd: (r: BattleResult) => {
    setTimeout(() => {
      store.recordResult(r.win, level.id, r.gold)
      store.go('result')
    }, 1200)
  },
}

const availableTowers = Object.values(TOWERS).filter(t => store.rankIndex + 1 >= t.unlockRank)
const availableUnits = UNITS.filter(u => store.rankIndex + 1 >= u.unlockRank)

function build(kind: TowerKind) {
  const scene = game?.scene.getScene('battle') as any
  scene?.buildTower?.(kind)
}
function deploy(unitId: string) {
  const scene = game?.scene.getScene('battle') as any
  scene?.deployUnit?.(unitId)
}
function useSkill(id: string) {
  const scene = game?.scene.getScene('battle') as any
  scene?.useSkill?.(id)
}
function setSpeed(m: number) {
  const scene = game?.scene.getScene('battle') as any
  scene?.setSpeed?.(m)
}
function upgradeTower() {
  const scene = game?.scene.getScene('battle') as any
  scene?.upgradeTower?.()
}
function clearTowerSel() {
  hud.selTowerKind = null
  hud.selTowerTier = 0
  hud.selTowerCanUp = false
  hud.selTowerUpCost = 0
  hud.selTowerName = ''
}
function deselectAll() {
  const scene = game?.scene.getScene('battle') as any
  // 取消选中塔位与塔
  scene?.cb?.onSelectSlot(null)
  scene?.cb?.onSelectTower(null, null, 0, false, 0)
  clearTowerSel()
  hud.selectedSlot = null
}
function quit() {
  store.go('levels')
}

onMounted(() => {
  if (phaserHost.value) game = createGame(phaserHost.value, cfg, cb)
})
onUnmounted(() => { game?.destroy(true); game = null })

const hpRatio = () => hud.baseHp / hud.baseHpMax
const showTowerPanel = () => hud.selTowerKind !== null
</script>

<template>
  <section class="screen battle">
    <!-- Phaser 游戏画布宿主 -->
    <div class="host" ref="phaserHost"></div>

    <!-- 顶部 HUD -->
    <div class="top-hud">
      <button class="quit" @click="quit"><span class="ms">close</span></button>
      <div class="wave-info">
        <span class="ms si">flag</span>
        <span class="wave-n">第 {{ hud.wave }}/{{ hud.waveTotal }} 波</span>
      </div>
      <div class="speeds">
        <button :class="['sp', { on: hud.speed===1 }]" @click="setSpeed(1)">1×</button>
        <button :class="['sp', { on: hud.speed===2 }]" @click="setSpeed(2)">2×</button>
      </div>
    </div>

    <!-- 基地血条 -->
    <div class="base-bar">
      <div class="bb-label"><span class="ms si">castle</span>城关</div>
      <div class="bb-track"><div class="bb-fill" :style="{ width: (hpRatio()*100)+'%', background: hpRatio()>0.5?'#4caf50':hpRatio()>0.25?'#ffc107':'#f44336' }"></div></div>
      <div class="bb-num">{{ hud.baseHp }}/{{ hud.baseHpMax }}</div>
    </div>

    <!-- 粮草 / 统帅 -->
    <div class="res">
      <div class="r-chip"><span class="ms si">grass</span>{{ hud.grain }}/{{ hud.grainMax }}</div>
      <div class="r-chip"><span class="ms si">military_tech</span>{{ hud.cmd }}/{{ hud.cmdMax }}</div>
    </div>

    <!-- 主帅技能栏 -->
    <div class="skills-bar">
      <button v-for="s in hud.skills" :key="s.id" :class="['sk', { ready: s.ready && !s.locked, locked: s.locked }]" :disabled="!s.ready || s.locked" @click="useSkill(s.id)">
        <div class="sk-ic"><span class="ms">{{ s.icon }}</span></div>
        <div class="sk-cd" v-if="!s.ready && !s.locked">{{ Math.ceil(s.cdLeft) }}</div>
        <div class="sk-lock" v-if="s.locked"><span class="ms">lock</span></div>
      </button>
    </div>

    <!-- 建造面板（选中塔位时显示） -->
    <div class="build-panel" v-if="hud.selectedSlot !== null && !showTowerPanel()">
      <div class="bp-title"><span class="ms si">add_location_alt</span>在此建造防御塔</div>
      <div class="bp-list">
        <div v-for="t in availableTowers" :key="t.kind" :class="['bp-item', { dis: hud.grain < t.tiers[0].cost }]" @click="build(t.kind)">
          <img :src="t.tiers[0].asset" alt="" />
          <div class="bp-nm">{{ t.name }}</div>
          <div class="bp-cost"><span class="ms si">grass</span>{{ t.tiers[0].cost }}</div>
        </div>
      </div>
    </div>

    <!-- 塔升级面板（选中已有塔时显示） -->
    <div class="build-panel tower-panel" v-if="showTowerPanel()">
      <div class="tp-head">
        <div class="tp-name"><span class="ms si">tower</span>{{ hud.selTowerName }}</div>
        <div class="tp-tier">
          <span v-for="i in 3" :key="i" :class="['tp-dot', { on: hud.selTowerTier >= i }]"></span>
          <span class="tp-tier-txt">Lv.{{ hud.selTowerTier }}</span>
        </div>
      </div>
      <div class="tp-actions">
        <button class="tp-btn up" :disabled="!hud.selTowerCanUp || hud.grain < hud.selTowerUpCost" @click="upgradeTower()">
          <span v-if="hud.selTowerCanUp"><span class="ms si">arrow_upward</span>升级至 Lv.{{ hud.selTowerTier + 1 }} · <span class="ms si">grass</span>{{ hud.selTowerUpCost }}</span>
          <span v-else><span class="ms si">star</span>已满级</span>
        </button>
        <button class="tp-btn cancel" @click="deselectAll"><span class="ms si">close</span>关闭</button>
      </div>
    </div>

    <!-- 底部部署栏（无导航栏，纯兵种部署） -->
    <div class="deploy-bar">
      <div class="deploy-list">
        <div v-for="u in availableUnits" :key="u.id" :class="['dp', { dis: hud.grain < u.cost || hud.cmd >= hud.cmdMax }]" @click="deploy(u.id)">
          <img :src="u.asset" alt="" />
          <div class="dp-nm">{{ u.name }}</div>
          <div class="dp-cost"><span class="ms si">grass</span>{{ u.cost }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.battle { background: #0a0a14; }
.host { position: absolute; inset: 0; }
.host :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }

.top-hud { position: absolute; top: 8px; left: 8px; right: 8px; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
.quit { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); color: #ff8888; border: 1px solid rgba(255,100,100,0.4); border-radius: 8px; font-size: 18px; cursor: pointer; }
.wave-info { display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.6); padding: 6px 14px; border-radius: 8px; border: 1px solid var(--gold); }
.wave-n { font-family: var(--font-display); color: var(--gold-light); font-size: 13px; }
.speeds { display: flex; gap: 4px; }
.sp { width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.15); font-size: 11px; cursor: pointer; }
.sp.on { background: var(--gold); color: var(--ink); }

.base-bar { position: absolute; top: 48px; left: 12px; right: 12px; display: flex; align-items: center; gap: 6px; z-index: 10; }
.bb-label { display: flex; align-items: center; gap: 2px; font-size: 11px; color: var(--gold-light); font-family: var(--font-display); }
.bb-track { flex: 1; height: 12px; background: rgba(0,0,0,0.7); border-radius: 6px; overflow: hidden; border: 1px solid rgba(212,164,55,0.4); }
.bb-fill { height: 100%; transition: width .3s, background .3s; }
.bb-num { font-family: var(--font-num); font-size: 11px; color: var(--gold-light); }

.res { position: absolute; top: 68px; left: 12px; display: flex; gap: 6px; z-index: 10; }
.r-chip { display: flex; align-items: center; gap: 3px; padding: 4px 10px; background: rgba(0,0,0,0.65); border-radius: 8px; border: 1px solid rgba(212,164,55,0.35); font-size: 11px; color: var(--gold-light); font-family: var(--font-num); }

.skills-bar { position: absolute; top: 68px; right: 12px; display: flex; gap: 6px; z-index: 10; }
.sk { position: relative; width: 42px; height: 42px; border-radius: 10px; background: rgba(0,0,0,0.65); border: 1px solid rgba(212,164,55,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.sk.ready { box-shadow: 0 0 10px rgba(212,164,55,0.6); }
.sk.ready:active { transform: scale(0.9); }
.sk.locked { opacity: 0.35; }
.sk:disabled { cursor: not-allowed; }
.sk-ic { font-size: 22px; color: var(--gold-light); }
.sk-cd { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.85); color: #fff; font-size: 11px; border-radius: 0 0 10px 10px; text-align: center; }
.sk-lock { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); border-radius: 10px; font-size: 16px; }

.si { font-size: 14px; color: var(--gold); }

.build-panel { position: absolute; left: 12px; right: 12px; bottom: 88px; background: rgba(15,8,20,0.94); backdrop-filter: blur(8px); border: 1px solid var(--gold); border-radius: 14px; padding: 10px; z-index: 12; animation: slideUp .25s ease; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.bp-title { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 12px; color: var(--gold-light); margin-bottom: 8px; }
.bp-list { display: flex; gap: 8px; justify-content: center; }
.bp-item { width: 72px; text-align: center; padding: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(212,164,55,0.3); border-radius: 10px; cursor: pointer; }
.bp-item:active { transform: scale(0.92); }
.bp-item.dis { opacity: 0.4; }
.bp-item img { width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid var(--gold); }
.bp-nm { font-size: 11px; color: var(--gold-light); margin-top: 4px; }
.bp-cost { display: flex; align-items: center; justify-content: center; gap: 1px; font-size: 10px; color: var(--gold); }

/* 塔升级面板 */
.tower-panel { padding: 12px; }
.tp-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.tp-name { display: flex; align-items: center; gap: 4px; font-family: var(--font-display); font-size: 15px; color: var(--gold-light); }
.tp-tier { display: flex; align-items: center; gap: 4px; }
.tp-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1px solid rgba(212,164,55,0.4); }
.tp-dot.on { background: var(--gold); box-shadow: 0 0 6px var(--gold); }
.tp-tier-txt { font-family: var(--font-num); font-size: 12px; color: var(--gold); margin-left: 4px; }
.tp-actions { display: flex; gap: 8px; }
.tp-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 10px; border-radius: 10px; border: none; font-size: 13px; cursor: pointer; font-family: var(--font-body); }
.tp-btn.up { background: linear-gradient(135deg, var(--gold-deep), var(--gold)); color: var(--ink); font-weight: 700; }
.tp-btn.up:disabled { opacity: 0.45; filter: grayscale(0.4); cursor: not-allowed; }
.tp-btn.up:not(:disabled):active { transform: scale(0.96); }
.tp-btn.cancel { flex: 0 0 64px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.15); }
.tp-btn .si { font-size: 16px; color: inherit; }

.deploy-bar { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(0deg, rgba(10,4,10,0.96), rgba(10,4,10,0.7)); backdrop-filter: blur(6px); padding: 8px 10px 14px; z-index: 11; border-top: 1px solid rgba(212,164,55,0.3); }
.deploy-list { display: flex; gap: 8px; overflow-x: auto; }
.deploy-list::-webkit-scrollbar { display: none; }
.dp { flex-shrink: 0; width: 64px; text-align: center; padding: 6px 4px; background: rgba(255,255,255,0.06); border: 1px solid rgba(212,164,55,0.3); border-radius: 10px; cursor: pointer; }
.dp:active { transform: scale(0.92); }
.dp.dis { opacity: 0.4; }
.dp img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid var(--gold); }
.dp-nm { font-size: 10px; color: var(--gold-light); margin-top: 3px; }
.dp-cost { display: flex; align-items: center; justify-content: center; gap: 1px; font-size: 9px; color: var(--gold); }
</style>
