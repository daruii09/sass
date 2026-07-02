<script setup lang="ts">
import { ref, computed } from 'vue'

// 通用 Q 版美术素材组件：优先加载真实图片，加载失败时回退到 Q 版 CSS 占位
// 解决 AI 图片 API 鉴权失败导致"素材不显示"的问题，同时统一 Q 版可爱风格
const props = withDefaults(defineProps<{
  src?: string
  name?: string
  icon?: string            // Material Symbols 图标名
  variant?: 'tower' | 'unit' | 'enemy' | 'weapon' | 'rank' | 'building' | 'item'
  tier?: number            // 塔等级 1-3
  rarity?: string          // 物品稀有度 common/rare/epic/legendary
  rounded?: number         // 圆角 px
}>(), {
  variant: 'unit',
  tier: 0,
  rounded: 8,
})

const failed = ref(false)

// 各类型 Q 版配色
const palette = computed(() => {
  switch (props.variant) {
    case 'tower':
      if (props.tier >= 3) return { bg: 'linear-gradient(160deg,#d4a437,#8b6914)', accent: '#fff3b0' }
      if (props.tier === 2) return { bg: 'linear-gradient(160deg,#c0392b,#6a1f1f)', accent: '#f5e6a8' }
      return { bg: 'linear-gradient(160deg,#6d8c5a,#3a4d2e)', accent: '#e8e0c0' }
    case 'enemy':
      return { bg: 'linear-gradient(160deg,#5a3a3a,#2a1818)', accent: '#ff8a7a' }
    case 'weapon':
      return { bg: 'linear-gradient(160deg,#4a5a6a,#222e38)', accent: '#cfd8dc' }
    case 'rank':
      return { bg: 'linear-gradient(160deg,#3a4d6a,#1a2538)', accent: '#d4a437' }
    case 'building':
      return { bg: 'linear-gradient(160deg,#7a5a3a,#3a2818)', accent: '#f5e6a8' }
    case 'item':
      return { bg: 'linear-gradient(160deg,#3a3a5a,#1a1a2e)', accent: '#ba68c8' }
    default: // unit
      return { bg: 'linear-gradient(160deg,#4a6b8a,#2a3f5a)', accent: '#ffe0c4' }
  }
})

// 稀有度边框色
const rarityColor = computed(() => {
  switch (props.rarity) {
    case 'legendary': return '#ffb300'
    case 'epic': return '#ba68c8'
    case 'rare': return '#4fc3f7'
    default: return 'rgba(212,164,55,0.5)'
  }
})
</script>

<template>
  <div class="qasset" :style="{ borderRadius: rounded + 'px', background: palette.bg, '--accent': palette.accent, boxShadow: rarity !== 'common' && rarity ? `0 0 8px ${rarityColor}88` : 'none', borderColor: rarity ? rarityColor : 'rgba(212,164,55,0.4)' }">
    <img v-if="src && !failed" :src="src" alt="" @error="failed = true" />
    <!-- Q 版回退占位 -->
    <div v-else class="fallback">
      <!-- Q 版小人头/塔身剪影 -->
      <div class="chibi" :data-v="variant">
        <span v-if="icon" class="ms ic">{{ icon }}</span>
        <div v-else class="dot"></div>
      </div>
      <span v-if="name" class="nm">{{ name }}</span>
      <span v-if="tier" class="tier">Lv.{{ tier }}</span>
    </div>
  </div>
</template>

<style scoped>
.qasset { position: relative; width: 100%; height: 100%; overflow: hidden; border: 2px solid; display: flex; align-items: center; justify-content: center; }
.qasset img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fallback { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 4px; }
.chibi { position: relative; width: 70%; aspect-ratio: 1; max-height: 70%; display: flex; align-items: center; justify-content: center; }
.chibi::before {
  content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 78%; height: 50%; background: rgba(0,0,0,0.22); border-radius: 50% 50% 24% 24%;
}
.ic { position: relative; z-index: 2; font-size: clamp(18px, 7vw, 30px); color: var(--accent, #ffe0c4); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); }
.dot { position: relative; z-index: 2; width: 40%; aspect-ratio: 1; border-radius: 50%; background: var(--accent, #ffe0c4); opacity: 0.7; }
.nm { position: relative; z-index: 2; font-size: 9px; color: rgba(255,255,255,0.9); font-family: var(--font-body); text-shadow: 0 1px 2px rgba(0,0,0,0.8); text-align: center; line-height: 1.1; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tier { position: absolute; top: 2px; right: 3px; z-index: 3; font-family: var(--font-num); font-size: 8px; color: #fff; background: rgba(0,0,0,0.6); padding: 0 4px; border-radius: 4px; }
</style>
