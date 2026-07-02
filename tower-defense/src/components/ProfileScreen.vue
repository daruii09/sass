<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { audio } from '../game/audio'

const store = useGameStore()

const friendCode = ref('')
const friendName = ref('')
const showInvite = ref(false)
const showAddFriend = ref(false)

onMounted(() => {
  if (!store.myInviteCode) store.genInviteCode()
})

const userInitial = computed(() => {
  const name = store.user?.name
  return name ? name[0] : '帅'
})

const rankName = computed(() => store.rank?.name || '新兵')

function copyInviteCode() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(store.myInviteCode).catch(() => {})
  }
}

function shareInviteCode() {
  if (navigator.share) {
    navigator.share({ title: '烽火令 · 邀请码', text: `我的邀请码：${store.myInviteCode}` }).catch(() => {})
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(store.myInviteCode).catch(() => {})
  }
}

function addFriend() {
  if (!friendCode.value.trim() || !friendName.value.trim()) return
  store.addFriend(friendName.value.trim(), friendCode.value.trim())
  friendCode.value = ''
  friendName.value = ''
}

function formatDate(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <section class="screen profile grain">
    <!-- 背景装饰 -->
    <div class="scene">
      <div class="tent-bg"></div>
      <div class="tent-pillar l"></div>
      <div class="tent-pillar r"></div>
      <div class="lantern l"><div class="l-core"></div></div>
      <div class="lantern r"><div class="l-core"></div></div>
    </div>
    <div class="bg-overlay"></div>

    <!-- 头部 -->
    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('main')"><span class="ms">arrow_back</span></button>
      <h1>个人中心</h1>
      <span class="spacer"></span>
    </header>

    <div class="body">
      <!-- 个人信息卡 -->
      <div class="profile-card card">
        <div class="profile-row">
          <div class="avatar-wrap">
            <div class="avatar">
              <QAsset class="avatar-inner" variant="rank" :name="userInitial" :rounded="999" />
            </div>
            <div class="rank-badge">{{ rankName }}</div>
          </div>
          <div class="profile-info">
            <div class="profile-name">{{ store.user?.name || '主帅' }}</div>
            <div class="balance-row">
              <div class="chip gold-chip"><span class="dot g"></span>{{ store.gold.toLocaleString() }}</div>
              <div class="chip cash-chip"><span class="dot c"></span>¥{{ store.cash.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 音乐开关 -->
      <div class="music-card card">
        <div class="music-row">
          <span class="ms speaker-icon">{{ store.musicOn ? 'volume_up' : 'volume_off' }}</span>
          <span class="music-label">音乐</span>
          <label class="toggle-switch">
            <input type="checkbox" :checked="store.musicOn" @change="store.toggleMusic(); audio.setEnabled(store.musicOn)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- 邀请码卡片 -->
      <div class="invite-card card">
        <div class="invite-header">
          <span class="ms">share</span>
          <span>我的邀请码</span>
        </div>
        <div class="invite-code">{{ store.myInviteCode || '加载中...' }}</div>
        <div class="invite-actions">
          <button class="invite-btn btn-ghost btn" @click="copyInviteCode">
            <span class="ms">content_copy</span>复制
          </button>
          <button class="invite-btn btn-ghost btn" @click="shareInviteCode">
            <span class="ms">share</span>分享
          </button>
          <button class="invite-btn btn-invite btn" @click="showInvite = !showInvite">
            <span class="ms">person_add</span>邀请好友
          </button>
        </div>
        <div class="invite-detail" v-if="showInvite">
          <p>将邀请码分享给好友，一起征战沙场！</p>
        </div>
      </div>

      <!-- 添加战友 -->
      <div class="add-friend-card card">
        <div class="add-friend-header" @click="showAddFriend = !showAddFriend">
          <span class="ms">group_add</span>
          <span>添加战友</span>
          <span class="ms expand-icon">{{ showAddFriend ? 'expand_less' : 'expand_more' }}</span>
        </div>
        <div class="add-friend-form" v-if="showAddFriend">
          <div class="input-group">
            <span class="ms input-icon">badge</span>
            <input v-model="friendCode" placeholder="输入战友邀请码" />
          </div>
          <div class="input-group">
            <span class="ms input-icon">person</span>
            <input v-model="friendName" placeholder="输入战友昵称" />
          </div>
          <button class="add-btn btn btn-primary" @click="addFriend">
            <span class="ms">group_add</span>添加战友
          </button>
        </div>
      </div>

      <!-- 战友列表 -->
      <div class="friends-card card" v-if="store.friends.length">
        <div class="friends-header">
          <span class="ms">diversity_3</span>
          <span>战友列表</span>
          <span class="friends-count">{{ store.friends.length }}</span>
        </div>
        <div class="friends-list">
          <div class="friend-item" v-for="f in store.friends" :key="f.code">
            <div class="friend-avatar">
              <span class="friend-initial">{{ f.name[0] }}</span>
            </div>
            <div class="friend-info">
              <div class="friend-name">{{ f.name }}</div>
              <div class="friend-code">{{ f.code }}</div>
            </div>
            <div class="friend-date">{{ formatDate(f.addedAt) }}</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-friends card" v-else>
        <span class="ms">person_off</span>
        <p>暂无战友，邀请好友一起征战吧！</p>
      </div>

      <!-- 功能入口 -->
      <div class="nav-entries">
        <div class="nav-entry" @click="store.go('gacha')">
          <div class="nav-ico">
            <span class="ms">casino</span>
          </div>
          <div class="nav-info">
            <div class="nav-title">武将孵化池</div>
            <div class="nav-sub">抽取强力武将 · 单抽 {{ store.gachaCost }} 金</div>
          </div>
          <span class="ms nav-arrow">chevron_right</span>
        </div>
        <div class="nav-entry" @click="store.go('mine')">
          <div class="nav-ico">
            <span class="ms">precision_manufacturing</span>
          </div>
          <div class="nav-info">
            <div class="nav-title">挖矿工坊</div>
            <div class="nav-sub">搭建矿机赚金币 · 算力 {{ store.totalHashRate }}</div>
          </div>
          <span class="ms nav-arrow">chevron_right</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile { background: linear-gradient(180deg, #2a1a28 0%, #1a0e1a 100%); }

/* === 背景装饰 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.tent-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 30%, #3a1f2e 0%, #1a0e1a 100%); }
.tent-pillar { position: absolute; bottom: 0; width: 14px; height: 65%; background: linear-gradient(90deg, #5a3a1a, #3a2410, #5a3a1a); border-radius: 4px; box-shadow: 0 0 16px rgba(0,0,0,0.5); opacity: 0.6; }
.tent-pillar.l { left: 6%; }
.tent-pillar.r { right: 6%; }
.lantern { position: absolute; top: 10%; width: 30px; height: 38px; background: linear-gradient(180deg, var(--crimson), #5a0000); border: 2px solid var(--gold); border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%; animation: lanternSway 3.5s ease-in-out infinite; transform-origin: top center; box-shadow: 0 0 18px rgba(255,120,60,0.4); opacity: 0.7; }
.lantern.l { left: 10%; }
.lantern.r { right: 10%; animation-delay: -1.5s; }
.lantern::before { content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 2px; height: 6px; background: #3a2410; }
.lantern::after { content: ''; position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 12px; height: 6px; background: var(--gold); border-radius: 0 0 3px 3px; }
.l-core { position: absolute; inset: 5px; background: radial-gradient(circle, #fff3b0, #ff9a3c 70%); border-radius: 50%; filter: blur(2px); animation: flicker 1.2s ease-in-out infinite alternate; }
@keyframes lanternSway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes flicker { 0% { opacity: 0.85; } 100% { opacity: 1; } }

.bg-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,4,8,0.55) 0%, transparent 25%, transparent 70%, rgba(10,4,8,0.88) 100%); pointer-events: none; }

/* === 头部 === */
.hd { position: relative; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 22px; padding: 0; display: flex; align-items: center; justify-content: center; }
.hd h1 { font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.spacer { width: 38px; }

/* === 滚动区域 === */
.body { position: relative; z-index: 3; flex: 1; overflow-y: auto; padding: 0 16px 22px; display: flex; flex-direction: column; gap: 12px; }

/* === 个人信息卡 === */
.profile-card { padding: 18px; }
.profile-row { display: flex; align-items: center; gap: 16px; }
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar { width: 72px; height: 72px; border-radius: 50%; border: 3px solid var(--gold); overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
.avatar-inner { width: 100%; height: 100%; }
.rank-badge { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); padding: 2px 12px; border-radius: 10px; background: var(--crimson); color: var(--gold-light); font-family: var(--font-display); font-size: 11px; border: 1px solid var(--gold); white-space: nowrap; box-shadow: 0 3px 10px rgba(0,0,0,0.4); z-index: 2; }
.profile-info { flex: 1; min-width: 0; }
.profile-name { font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; margin-bottom: 8px; }
.balance-row { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 14px; font-family: var(--font-num); font-weight: 700; font-size: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(212,164,55,0.35); }
.gold-chip { color: var(--gold-light); }
.cash-chip { color: #6BFF9E; border-color: rgba(107,255,158,0.35); }
.dot { width: 7px; height: 7px; border-radius: 50%; }
.g { background: var(--gold); box-shadow: 0 0 6px var(--gold); }
.c { background: #4caf50; box-shadow: 0 0 6px #4caf50; }

/* === 音乐开关 === */
.music-card { padding: 14px 18px; }
.music-row { display: flex; align-items: center; gap: 12px; }
.speaker-icon { font-size: 24px; color: var(--gold-light); }
.music-label { flex: 1; font-family: var(--font-display); font-size: 15px; color: var(--gold-light); letter-spacing: 1px; }

/* 自定义金色滑动开关 */
.toggle-switch { position: relative; display: inline-block; width: 52px; height: 28px; cursor: pointer; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; border-radius: 28px; background: rgba(255,255,255,0.12); border: 1px solid rgba(212,164,55,0.3); transition: background .3s, border-color .3s; }
.toggle-slider::before { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, var(--gold-deep), var(--gold)); box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: transform .3s, background .3s; }
.toggle-switch input:checked + .toggle-slider { background: rgba(212,164,55,0.2); border-color: var(--gold); box-shadow: 0 0 10px rgba(212,164,55,0.25); }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(24px); background: linear-gradient(135deg, var(--gold), var(--gold-light)); box-shadow: 0 2px 8px rgba(212,164,55,0.5); }

/* === 邀请码卡片 === */
.invite-card { padding: 16px; }
.invite-header { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-size: 15px; color: var(--gold); margin-bottom: 10px; }
.invite-header .ms { font-size: 20px; }
.invite-code { font-family: var(--font-num); font-size: 24px; font-weight: 700; color: var(--gold-light); letter-spacing: 3px; text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px dashed rgba(212,164,55,0.4); margin-bottom: 12px; }
.invite-actions { display: flex; gap: 8px; }
.invite-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 8px 6px; border-radius: 10px; font-size: 12px; font-family: var(--font-body); }
.invite-btn .ms { font-size: 16px; }
.btn-invite { background: linear-gradient(135deg, var(--crimson), var(--crimson-light)); color: var(--gold-light); border: 1px solid var(--gold); box-shadow: 0 4px 12px rgba(139,0,0,0.35); font-family: var(--font-display); letter-spacing: 1px; }
.invite-detail { margin-top: 12px; padding: 10px; background: rgba(212,164,55,0.08); border-radius: 8px; border: 1px solid rgba(212,164,55,0.15); }
.invite-detail p { font-size: 12px; color: rgba(255,255,255,0.6); text-align: center; }

/* === 添加战友 === */
.add-friend-card { padding: 14px 16px; }
.add-friend-header { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-size: 15px; color: var(--gold); cursor: pointer; }
.add-friend-header .ms { font-size: 20px; }
.expand-icon { margin-left: auto; }
.add-friend-form { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
.input-group { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: rgba(0,0,0,0.3); border-radius: 10px; border: 1px solid rgba(212,164,55,0.25); }
.input-icon { font-size: 20px; color: var(--gold); }
.input-group input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-family: var(--font-body); font-size: 14px; }
.input-group input::placeholder { color: rgba(255,255,255,0.35); }
.add-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 12px; font-size: 15px; }

/* === 战友列表 === */
.friends-card { padding: 16px; }
.friends-header { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-size: 15px; color: var(--gold); margin-bottom: 12px; }
.friends-header .ms { font-size: 20px; }
.friends-count { margin-left: auto; font-family: var(--font-num); font-size: 12px; color: var(--gold-light); background: rgba(212,164,55,0.15); padding: 2px 8px; border-radius: 10px; }
.friends-list { display: flex; flex-direction: column; gap: 8px; }
.friend-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(212,164,55,0.12); border-radius: 12px; transition: background .2s, border-color .2s; }
.friend-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(212,164,55,0.25); }
.friend-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--crimson), #5a0000); display: flex; align-items: center; justify-content: center; border: 2px solid var(--gold); flex-shrink: 0; }
.friend-initial { font-family: var(--font-display); font-size: 16px; color: var(--gold-light); }
.friend-info { flex: 1; min-width: 0; }
.friend-name { font-size: 14px; font-weight: 700; color: var(--gold-light); }
.friend-code { font-family: var(--font-num); font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.friend-date { font-size: 11px; color: rgba(255,255,255,0.4); font-family: var(--font-num); flex-shrink: 0; }

/* === 空状态 === */
.empty-friends { padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.empty-friends .ms { font-size: 40px; color: rgba(255,255,255,0.2); }
.empty-friends p { font-size: 13px; color: rgba(255,255,255,0.4); text-align: center; }

/* === 功能入口 === */
.nav-entries { display: flex; flex-direction: column; gap: 8px; }
.nav-entry { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(212,164,55,0.2); border-radius: 14px; cursor: pointer; transition: transform .15s, background .2s; }
.nav-entry:active { transform: scale(0.97); background: rgba(212,164,55,0.12); }
.nav-ico { width: 44px; height: 44px; border-radius: 12px; background: rgba(212,164,55,0.16); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--gold-light); flex-shrink: 0; }
.nav-info { flex: 1; min-width: 0; }
.nav-title { font-family: var(--font-display); font-size: 15px; color: var(--gold-light); letter-spacing: 1px; }
.nav-sub { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.nav-arrow { font-size: 20px; color: rgba(255,255,255,0.3); flex-shrink: 0; }
</style>