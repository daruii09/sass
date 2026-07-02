<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import { WORLD_MAP, WorldRegion } from '../data/world'

const store = useGameStore()

const selectedRegion = ref<WorldRegion | null>(null)
const plundering = ref(false)
const plunderProgress = ref(0)
const plunderTarget = ref<string | null>(null)
let plunderTimer: ReturnType<typeof setInterval> | null = null

const MAP_W = 500
const MAP_H = 700

// 玩家拥有的区域
const playerRegion = computed(() =>
  WORLD_MAP.find(r => r.owner === store.user?.name) || null
)

// 玩家拥有的所有区域
const ownedRegions = computed(() =>
  WORLD_MAP.filter(r => r.owner === store.user?.name)
)

// 总防御力
const totalDefense = computed(() =>
  ownedRegions.value.reduce((s, r) => s + r.defense, 0)
)

// 唯一连线（避免重复）
const uniqueEdges = computed(() => {
  const edges: { from: WorldRegion; to: WorldRegion }[] = []
  const seen = new Set<string>()
  for (const region of WORLD_MAP) {
    for (const toId of region.connectedTo) {
      const key = [region.id, toId].sort().join('-')
      if (seen.has(key)) continue
      seen.add(key)
      const to = WORLD_MAP.find(r => r.id === toId)
      if (to) edges.push({ from: region, to })
    }
  }
  return edges
})

// 判断区域是否与玩家区域相邻
function isAdjacentToPlayer(region: WorldRegion): boolean {
  if (!playerRegion.value) return false
  return playerRegion.value.connectedTo.includes(region.id)
}

// 判断 owner 是否为盟友（好友）
function isAlly(region: WorldRegion): boolean {
  if (!region.owner) return false
  return store.friends.some(f => f.name === region.owner)
}

// 获取区域节点颜色类型
function getRegionColor(region: WorldRegion): string {
  if (region.owner === store.user?.name) return 'gold'
  if (!region.owner) return 'npc'
  if (isAlly(region)) return 'ally'
  return 'enemy'
}

// 是否可以出兵攻占
function canAttack(region: WorldRegion): boolean {
  if (region.owner === store.user?.name) return false
  return isAdjacentToPlayer(region)
}

// 是否可以掠夺
function canPlunder(region: WorldRegion): boolean {
  if (region.owner === store.user?.name) return false
  if (!region.owner) return false // NPC 不能掠夺，只能攻占
  if (isAlly(region)) return false
  return isAdjacentToPlayer(region)
}

// 查看区域
function viewRegion(region: WorldRegion) {
  selectedRegion.value = region
}

// 出兵攻占
function attackRegion(region: WorldRegion) {
  if (!canAttack(region)) return
  region.owner = store.user?.name || null
  selectedRegion.value = { ...region }
}

// 掠夺
function startPlunder(region: WorldRegion) {
  if (!canPlunder(region) || plundering.value) return
  plundering.value = true
  plunderProgress.value = 0
  plunderTarget.value = region.id
  const totalTicks = region.plunderTime * 60 // 按秒计算
  let tick = 0
  plunderTimer = setInterval(() => {
    tick++
    plunderProgress.value = Math.min(100, Math.round((tick / totalTicks) * 100))
    if (tick >= totalTicks) {
      completePlunder(region)
    }
  }, 1000)
}

// 加速令：消耗1个加速令，立即完成掠夺
function useSpeedToken() {
  if (!plundering.value || !plunderTarget.value) return
  if (!store.useSpeedToken()) {
    // 没有加速令，提示购买
    if (store.buySpeedToken(1)) {
      store.useSpeedToken()
    } else {
      return
    }
  }
  const region = WORLD_MAP.find(r => r.id === plunderTarget.value)
  if (region) completePlunder(region)
}

// 购买加速令
function buyToken() {
  if (store.buySpeedToken(1)) {
    // 购买成功
  }
}

function completePlunder(region: WorldRegion) {
  if (plunderTimer) {
    clearInterval(plunderTimer)
    plunderTimer = null
  }
  // 掠夺奖励
  const reward = Math.floor(region.resourceBonus * 100 + Math.random() * 200)
  store.addGold(reward)
  plundering.value = false
  plunderProgress.value = 0
  plunderTarget.value = null
}

onUnmounted(() => {
  if (plunderTimer) clearInterval(plunderTimer)
})
</script>

<template>
  <section class="screen world grain">
    <!-- 背景装饰 -->
    <div class="bg-overlay"></div>

    <!-- 头部 -->
    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('main')">
        <span class="ms">arrow_back</span>
      </button>
      <h1>天下大势</h1>
      <div class="player-location" v-if="playerRegion">
        <span class="ms">location_on</span>
        <span>{{ playerRegion.name }}</span>
      </div>
      <span class="spacer" v-else></span>
    </header>

    <!-- 地图区域 -->
    <div class="map-scroll">
      <div class="map-inner">
        <!-- 地图背景 -->
        <div class="map-bg">
          <!-- 网格线 -->
          <svg class="grid-svg" :viewBox="`0 0 ${MAP_W} ${MAP_H}`" preserveAspectRatio="none">
            <line v-for="i in 10" :key="'gx'+i" :x1="i * 50" y1="0" :x2="i * 50" :y2="MAP_H" stroke="rgba(139,105,20,0.12)" stroke-width="0.5" />
            <line v-for="i in 14" :key="'gy'+i" :x1="0" :y1="i * 50" :x2="MAP_W" :y2="i * 50" stroke="rgba(139,105,20,0.12)" stroke-width="0.5" />
          </svg>
          <!-- 装饰性祥云 -->
          <div class="cloud c1"></div>
          <div class="cloud c2"></div>
          <div class="cloud c3"></div>
          <div class="cloud c4"></div>
        </div>

        <!-- 连接线 -->
        <svg class="connection-svg" :viewBox="`0 0 ${MAP_W} ${MAP_H}`">
          <line
            v-for="edge in uniqueEdges"
            :key="edge.from.id + '-' + edge.to.id"
            :x1="edge.from.x * (MAP_W / 100)"
            :y1="edge.from.y * (MAP_H / 100)"
            :x2="edge.to.x * (MAP_W / 100)"
            :y2="edge.to.y * (MAP_H / 100)"
            class="conn-line"
          />
        </svg>

        <!-- 区域节点 -->
        <div
          v-for="region in WORLD_MAP"
          :key="region.id"
          class="region-node"
          :class="[
            getRegionColor(region),
            {
              selected: selectedRegion?.id === region.id,
              'player-owned': region.owner === store.user?.name,
            }
          ]"
          :style="{ left: region.x + '%', top: region.y + '%' }"
          @click="viewRegion(region)"
        >
          <div class="node-dot">
            <div class="node-inner"></div>
            <div class="node-glow"></div>
          </div>
          <div class="node-label">{{ region.name }}</div>
          <div class="node-type-badge" v-if="region.type === 'capital'">京</div>
          <div class="node-type-badge fortress" v-else-if="region.type === 'fortress'">关</div>
        </div>
      </div>
    </div>

    <!-- 区域信息面板 -->
    <div class="info-panel" :class="{ open: selectedRegion }" v-if="selectedRegion">
      <div class="panel-handle" @click="selectedRegion = null">
        <div class="handle-bar"></div>
      </div>
      <div class="panel-content">
        <!-- 区域基本信息 -->
        <div class="panel-header">
          <div class="panel-name-row">
            <h2 class="panel-name">{{ selectedRegion.name }}</h2>
            <span class="type-badge" :class="selectedRegion.type">
              {{ selectedRegion.type === 'capital' ? '都城' : selectedRegion.type === 'city' ? '城池' : selectedRegion.type === 'fortress' ? '关隘' : '集镇' }}
            </span>
          </div>
          <div class="panel-owner" v-if="selectedRegion.owner">
            <span class="owner-label">领主：</span>
            <span class="owner-name" :class="{ ally: isAlly(selectedRegion), enemy: !isAlly(selectedRegion) && selectedRegion.owner !== store.user?.name }">
              {{ selectedRegion.owner }}
            </span>
          </div>
          <div class="panel-owner npc" v-else>
            <span class="owner-label">领主：</span>
            <span class="owner-name">无主之地</span>
          </div>
        </div>

        <!-- 属性 -->
        <div class="panel-stats">
          <div class="stat-row">
            <span class="stat-label">城防</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar" :style="{ width: selectedRegion.defense + '%' }"></div>
            </div>
            <span class="stat-val">{{ selectedRegion.defense }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">攻占耗时</span>
            <span class="stat-val">{{ selectedRegion.plunderTime }} 分钟</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">资源倍率</span>
            <span class="stat-val bonus">x{{ selectedRegion.resourceBonus.toFixed(1) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">相邻区域</span>
            <span class="stat-val adjacent">
              <span v-for="(id, i) in selectedRegion.connectedTo" :key="id">
                {{ WORLD_MAP.find(r => r.id === id)?.name || id }}<span v-if="i < selectedRegion.connectedTo.length - 1">、</span>
              </span>
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="panel-actions">
          <!-- 掠夺进度条 -->
          <div class="plunder-progress" v-if="plundering && plunderTarget === selectedRegion.id">
            <div class="progress-label">掠夺中...</div>
            <div class="progress-bar-wrap">
              <div class="progress-bar" :style="{ width: plunderProgress + '%' }"></div>
            </div>
            <div class="progress-row">
              <div class="progress-pct">{{ plunderProgress }}%</div>
              <button class="speed-btn" @click="useSpeedToken">
                <span class="ms">bolt</span>加速令({{ store.speedTokens }})
              </button>
            </div>
          </div>

          <button
            v-if="canAttack(selectedRegion)"
            class="action-btn attack-btn btn"
            @click="attackRegion(selectedRegion)"
            :disabled="plundering"
          >
            <span class="ms">military_tech</span>出兵攻占
          </button>
          <button
            v-if="canPlunder(selectedRegion)"
            class="action-btn plunder-btn btn"
            @click="startPlunder(selectedRegion)"
            :disabled="plundering"
          >
            <span class="ms">local_fire_department</span>掠夺
          </button>
          <div class="no-action" v-if="!canAttack(selectedRegion) && !canPlunder(selectedRegion) && !plundering">
            <span class="ms">{{ selectedRegion.owner === store.user?.name ? 'flag' : 'block' }}</span>
            <span v-if="selectedRegion.owner === store.user?.name">已占领</span>
            <span v-else-if="isAlly(selectedRegion)">盟友领地</span>
            <span v-else>无法出征</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部统计栏 -->
    <div class="stats-bar">
      <div class="stats-item">
        <span class="ms">flag</span>
        <span class="stats-label">领地</span>
        <span class="stats-value">{{ ownedRegions.length }}</span>
      </div>
      <div class="stats-item">
        <span class="ms">shield</span>
        <span class="stats-label">总城防</span>
        <span class="stats-value">{{ totalDefense }}</span>
      </div>
      <div class="stats-item">
        <span class="ms">military_tech</span>
        <span class="stats-label">已攻占</span>
        <span class="stats-value">{{ ownedRegions.length > 0 ? '是' : '否' }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.world {
  background: #1a140e;
}

.bg-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 40%, rgba(30,20,10,0.3) 0%, rgba(10,5,0,0.6) 100%);
  pointer-events: none; z-index: 0;
}

/* === 头部 === */
.hd {
  position: relative; z-index: 3;
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%);
}
.back {
  width: 36px; height: 36px; border-radius: 50%;
  font-size: 20px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hd h1 {
  font-family: var(--font-display); font-size: 20px;
  color: var(--gold); letter-spacing: 3px;
  flex: 1; text-align: center;
}
.player-location {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--gold-light);
  font-family: var(--font-display);
  flex-shrink: 0;
}
.player-location .ms { font-size: 16px; }
.spacer { width: 36px; flex-shrink: 0; }

/* === 地图滚动容器 === */
.map-scroll {
  position: relative; z-index: 2;
  flex: 1; overflow: auto;
  -webkit-overflow-scrolling: touch;
  cursor: grab;
}
.map-scroll:active { cursor: grabbing; }

.map-inner {
  width: 500px; height: 700px;
  position: relative;
  margin: 0 auto;
}

/* === 地图背景 === */
.map-bg {
  position: absolute; inset: 12px;
  background: linear-gradient(135deg, #d4c4a4 0%, #c8b890 25%, #d4c4a4 50%, #b8a080 75%, #c8b890 100%);
  border: 4px solid var(--gold-deep);
  border-radius: 8px;
  box-shadow: inset 0 0 40px rgba(139,105,20,0.3), 0 0 0 2px rgba(212,164,55,0.3), 0 0 0 6px rgba(139,105,20,0.2);
  overflow: hidden;
}
.map-bg::after {
  content: '';
  position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  opacity: 0.12; mix-blend-mode: multiply;
  pointer-events: none;
}

.grid-svg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}

/* 装饰祥云 */
.cloud {
  position: absolute; pointer-events: none;
  width: 50px; height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  box-shadow: 12px -4px 0 0 rgba(255,255,255,0.06), 24px 0 0 0 rgba(255,255,255,0.05);
}
.cloud.c1 { top: 8%; left: 10%; }
.cloud.c2 { top: 15%; right: 15%; }
.cloud.c3 { bottom: 20%; left: 8%; }
.cloud.c4 { bottom: 12%; right: 10%; }

/* === 连接线 SVG === */
.connection-svg {
  position: absolute; inset: 12px;
  width: calc(100% - 24px); height: calc(100% - 24px);
  pointer-events: none; z-index: 1;
}
.conn-line {
  stroke: rgba(212, 164, 55, 0.25);
  stroke-width: 1;
  stroke-dasharray: 4 3;
}

/* === 区域节点 === */
.region-node {
  position: absolute; z-index: 2;
  transform: translate(-50%, -50%);
  cursor: pointer;
  display: flex; flex-direction: column;
  align-items: center; gap: 2px;
  transition: transform .2s ease, filter .2s ease;
}
.region-node:hover { transform: translate(-50%, -50%) scale(1.2); }
.region-node:active { transform: translate(-50%, -50%) scale(0.95); }

.node-dot {
  width: 24px; height: 24px; border-radius: 50%;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid;
  transition: border-color .3s, box-shadow .3s;
}
.node-inner {
  width: 10px; height: 10px; border-radius: 50%;
  transition: background .3s;
}
.node-glow {
  position: absolute; inset: -6px; border-radius: 50%;
  opacity: 0; transition: opacity .3s;
}

/* NPC 灰色 */
.region-node.npc .node-dot {
  border-color: #8a8a7a;
  background: rgba(138, 138, 122, 0.2);
}
.region-node.npc .node-inner { background: #8a8a7a; }
.region-node.npc .node-glow { background: transparent; }

/* 玩家金色 */
.region-node.gold .node-dot {
  border-color: var(--gold);
  background: rgba(212, 164, 55, 0.25);
  box-shadow: 0 0 12px rgba(212, 164, 55, 0.5);
}
.region-node.gold .node-inner { background: var(--gold); }
.region-node.gold .node-glow {
  opacity: 0.6;
  background: radial-gradient(circle, rgba(212, 164, 55, 0.6), transparent 70%);
  animation: pulse-gold 2s ease-in-out infinite;
}

/* 盟友蓝色 */
.region-node.ally .node-dot {
  border-color: #4a90d9;
  background: rgba(74, 144, 217, 0.2);
  box-shadow: 0 0 10px rgba(74, 144, 217, 0.4);
}
.region-node.ally .node-inner { background: #4a90d9; }
.region-node.ally .node-glow {
  opacity: 0.4;
  background: radial-gradient(circle, rgba(74, 144, 217, 0.5), transparent 70%);
}

/* 敌人红色 */
.region-node.enemy .node-dot {
  border-color: var(--crimson-light);
  background: rgba(192, 57, 43, 0.2);
  box-shadow: 0 0 10px rgba(192, 57, 43, 0.4);
}
.region-node.enemy .node-inner { background: var(--crimson-light); }
.region-node.enemy .node-glow {
  opacity: 0.4;
  background: radial-gradient(circle, rgba(192, 57, 43, 0.5), transparent 70%);
}

/* 选中状态 */
.region-node.selected { z-index: 5; }
.region-node.selected .node-dot {
  animation: pulse-selected 1.2s ease-in-out infinite;
  transform: scale(1.15);
}

@keyframes pulse-gold {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.4); }
}
@keyframes pulse-selected {
  0%, 100% { box-shadow: 0 0 8px rgba(255,255,255,0.6); }
  50% { box-shadow: 0 0 20px rgba(255,255,255,0.9), 0 0 30px rgba(212,164,55,0.7); }
}

.node-label {
  font-family: var(--font-display);
  font-size: 11px; color: #3a2a10;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(255,255,255,0.5);
  font-weight: 700;
  letter-spacing: 1px;
}

.node-type-badge {
  position: absolute; top: -8px; right: -8px;
  font-size: 9px; width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--crimson);
  color: var(--gold-light);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  border: 1px solid var(--gold);
}
.node-type-badge.fortress {
  background: #5a3a1a;
  border-color: #8a6a3a;
}

/* === 信息面板 === */
.info-panel {
  position: absolute; bottom: 0; left: 0; right: 0;
  z-index: 10;
  background: rgba(20, 14, 10, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 2px solid rgba(212, 164, 55, 0.4);
  border-radius: 20px 20px 0 0;
  transform: translateY(0);
  transition: transform .35s cubic-bezier(.2,.8,.2,1);
  max-height: 55%;
  overflow-y: auto;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
}
.info-panel:not(.open) {
  transform: translateY(100%);
}

.panel-handle {
  display: flex; justify-content: center;
  padding: 8px 0;
  cursor: pointer;
}
.handle-bar {
  width: 40px; height: 4px;
  border-radius: 2px;
  background: rgba(212, 164, 55, 0.4);
}

.panel-content {
  padding: 0 18px 18px;
}

/* 面板头部 */
.panel-header {
  margin-bottom: 14px;
}
.panel-name-row {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 6px;
}
.panel-name {
  font-family: var(--font-display);
  font-size: 22px; color: var(--gold);
  letter-spacing: 2px;
}
.type-badge {
  font-size: 11px; padding: 3px 10px;
  border-radius: 10px;
  font-family: var(--font-display);
  letter-spacing: 1px;
  border: 1px solid;
}
.type-badge.capital {
  background: rgba(212, 164, 55, 0.15);
  color: var(--gold);
  border-color: var(--gold);
}
.type-badge.city {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.8);
  border-color: rgba(255,255,255,0.2);
}
.type-badge.fortress {
  background: rgba(139, 105, 20, 0.2);
  color: #c8a050;
  border-color: rgba(139, 105, 20, 0.4);
}
.type-badge.town {
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.6);
  border-color: rgba(255,255,255,0.12);
}

.panel-owner {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px;
}
.owner-label { color: rgba(255,255,255,0.5); }
.owner-name {
  color: var(--gold-light);
  font-family: var(--font-display);
}
.owner-name.ally { color: #4a90d9; }
.owner-name.enemy { color: var(--crimson-light); }
.panel-owner.npc .owner-name { color: rgba(255,255,255,0.4); }

/* 属性 */
.panel-stats {
  display: flex; flex-direction: column; gap: 10px;
  margin-bottom: 16px;
}
.stat-row {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px;
}
.stat-label {
  width: 56px; flex-shrink: 0;
  color: rgba(255,255,255,0.5);
  font-size: 12px;
}
.stat-bar-wrap {
  flex: 1; height: 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}
.stat-bar {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, var(--gold-deep), var(--gold));
  transition: width .4s ease;
}
.stat-val {
  font-family: var(--font-num);
  color: var(--gold-light);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  min-width: 40px; text-align: right;
}
.stat-val.bonus { color: #6BFF9E; }
.stat-val.adjacent {
  flex: 1; min-width: 0;
  font-size: 11px; color: rgba(255,255,255,0.5);
  font-family: var(--font-body);
  text-align: left;
  white-space: normal;
}

/* 操作按钮 */
.panel-actions {
  display: flex; flex-direction: column; gap: 10px;
}
.action-btn {
  width: 100%; padding: 14px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  gap: 8px; font-size: 16px; font-family: var(--font-display);
  letter-spacing: 2px; transition: transform .12s, filter .2s, opacity .2s;
}
.action-btn:disabled { opacity: 0.4; pointer-events: none; }
.action-btn:active { transform: scale(0.96); }
.attack-btn {
  background: linear-gradient(135deg, var(--crimson), var(--crimson-light));
  color: var(--gold-light); border: 1px solid var(--gold);
  box-shadow: 0 6px 20px rgba(139,0,0,0.5);
}
.plunder-btn {
  background: linear-gradient(135deg, #5a3a1a, #8a5a2a);
  color: var(--gold-light); border: 1px solid rgba(212,164,55,0.5);
  box-shadow: 0 4px 16px rgba(90,58,26,0.5);
}
.no-action {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; padding: 12px; color: rgba(255,255,255,0.35);
  font-size: 13px; font-family: var(--font-display);
}
.no-action .ms { font-size: 18px; }

/* 掠夺进度条 */
.plunder-progress {
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px; background: rgba(0,0,0,0.3);
  border-radius: 12px; border: 1px solid rgba(212,164,55,0.2);
}
.progress-label {
  font-size: 12px; color: var(--gold-light);
  font-family: var(--font-display); letter-spacing: 1px;
}
.progress-bar-wrap {
  width: 100%; height: 10px; border-radius: 5px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}
.progress-bar {
  height: 100%; border-radius: 5px;
  background: linear-gradient(90deg, #8a5a2a, var(--gold), var(--gold-light));
  transition: width .3s linear;
  position: relative;
}
.progress-bar::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: progress-shine 1.5s linear infinite;
}
@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.progress-pct {
  font-family: var(--font-num); font-size: 14px;
  color: var(--gold); text-align: center; font-weight: 700;
}
.progress-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; }
.speed-btn { display: flex; align-items: center; gap: 4px; padding: 5px 10px; background: linear-gradient(135deg, #d4a437, #8b6914); color: var(--ink); border: 1px solid var(--gold-light); border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 0 8px rgba(212,164,55,0.5); animation: speedPulse 1.2s ease-in-out infinite alternate; }
.speed-btn .ms { font-size: 14px; }
@keyframes speedPulse { from { box-shadow: 0 0 8px rgba(212,164,55,0.5); } to { box-shadow: 0 0 16px rgba(212,164,55,0.9); } }

/* === 底部统计栏 === */
.stats-bar {
  position: relative; z-index: 3;
  display: flex; justify-content: space-around;
  padding: 10px 16px 14px;
  background: linear-gradient(180deg, transparent, rgba(0,0,0,0.6) 50%);
  border-top: 1px solid rgba(212,164,55,0.15);
}
.stats-item {
  display: flex; flex-direction: column; align-items: center;
  gap: 2px; min-width: 60px;
}
.stats-item .ms {
  font-size: 18px; color: var(--gold);
}
.stats-label {
  font-size: 10px; color: rgba(255,255,255,0.4);
}
.stats-value {
  font-family: var(--font-num); font-size: 16px;
  font-weight: 700; color: var(--gold-light);
}
</style>