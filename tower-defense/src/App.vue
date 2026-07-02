<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from './stores/game'
import SplashScreen from './components/SplashScreen.vue'
import AuthScreen from './components/AuthScreen.vue'
import MainScreen from './components/MainScreen.vue'
import CommanderScreen from './components/CommanderScreen.vue'
import CodexScreen from './components/CodexScreen.vue'
import LevelSelectScreen from './components/LevelSelectScreen.vue'
import BattleScreen from './components/BattleScreen.vue'
import ResultScreen from './components/ResultScreen.vue'
import ExchangeScreen from './components/ExchangeScreen.vue'
import TradeScreen from './components/TradeScreen.vue'
import ProfileScreen from './components/ProfileScreen.vue'
import MineScreen from './components/MineScreen.vue'
import GachaScreen from './components/GachaScreen.vue'
import WorldScreen from './components/WorldScreen.vue'

const store = useGameStore()
const current = computed(() => store.screen)
</script>

<template>
  <div class="app-shell">
    <SplashScreen :class="{ active: current === 'splash' }" />
    <AuthScreen :class="{ active: current === 'auth' }" />
    <MainScreen :class="{ active: current === 'main' }" />
    <CommanderScreen :class="{ active: current === 'commander' }" />
    <CodexScreen :class="{ active: current === 'codex' }" />
    <LevelSelectScreen :class="{ active: current === 'levels' }" />
    <BattleScreen :class="{ active: current === 'battle' }" />
    <ResultScreen :class="{ active: current === 'result' }" />
    <ExchangeScreen :class="{ active: current === 'exchange' }" />
    <TradeScreen :class="{ active: current === 'trade' }" />
    <ProfileScreen :class="{ active: current === 'profile' }" />
    <MineScreen :class="{ active: current === 'mine' }" />
    <GachaScreen :class="{ active: current === 'gacha' }" />
    <WorldScreen :class="{ active: current === 'world' }" />
  </div>
</template>
