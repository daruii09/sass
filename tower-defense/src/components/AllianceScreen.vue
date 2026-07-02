<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { audio } from '../game/audio'

const store = useGameStore()

const newAllianceName = ref('')
const inviteName = ref('')
const confirmLeave = ref(false)

const locked = computed(() => !store.allianceUnlock)
const canInvite = computed(() => !!store.myAlliance && store.myAlliance.members.length < 3)
const memberSlots = computed(() => [0, 1, 2])

function createAlliance() {
  const name = newAllianceName.value.trim()
  if (name.length < 2) return
  if (store.createAlliance(name)) {
    audio.coin()
    newAllianceName.value = ''
  }
}

function leaveAlliance() {
  store.leaveAlliance()
  audio.uiBack()
}

function invitePlayer() {
  const name = inviteName.value.trim()
  if (!name) return
  if (store.inviteToAlliance(name)) {
    audio.coin()
    inviteName.value = ''
  }
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
</script>

<template>
  <section class="screen alliance grain">
    <!-- 联盟大厅背景 -->
    <div class="scene">
      <div class="hall-bg"></div>
      <div class="banner b-left"></div>
      <div class="banner b-right"></div>
      <div class="crest-glow"></div>
      <div class="rune r1"></div>
      <div class="rune r2"></div>
      <div class="rune r3"></div>
    </div>
    <div class="bg-overlay"></div>

    <!-- 头部 -->
    <header class="hd">
      <button class="back btn btn-ghost" @click="store.go('main')">
        <span class="ms">arrow_back</span>
      </button>
      <h1>结盟系统</h1>
      <span class="spacer"></span>
    </header>

    <!-- 锁定遮罩 -->
    <div class="lock-overlay" v-if="locked">
      <span class="ms lock-icon">lock</span>
      <div class="lock-text">需军阶 4 级解锁结盟</div>
      <div class="lock-sub">提升主帅军阶后方可歃血为盟</div>
    </div>

    <!-- 主体 -->
    <div class="body" v-else>
      <!-- 无联盟：创建 -->
      <div class="create-card card" v-if="!store.myAlliance">
        <div class="crest">
          <div class="crest-shield"></div>
          <span class="ms crest-icon">handshake</span>
        </div>
        <div class="create-title">创建联盟</div>
        <div class="create-desc">结盟后双方/三方不可互相攻击，可共同防御外敌。最多三方结盟。</div>
        <input
          class="name-input"
          v-model="newAllianceName"
          maxlength="12"
          placeholder="输入联盟名称（≥2字）"
          @keyup.enter="createAlliance"
        />
        <button class="btn btn-crimson create-btn" @click="createAlliance">
          <span class="ms">military_tech</span>
          <span>歃血为盟</span>
        </button>
      </div>

      <!-- 已有联盟 -->
      <div v-else class="alliance-info">
        <!-- 联盟信息卡 -->
        <div class="info-card card">
          <div class="info-top">
            <div class="crest-sm">
              <span class="ms">handshake</span>
            </div>
            <div class="info-meta">
              <div class="alli-name">{{ store.myAlliance.name }}</div>
              <div class="alli-date">缔结于 {{ formatDate(store.myAlliance.createdAt) }}</div>
            </div>
            <div class="leader-badge" v-if="store.user?.name === store.myAlliance.leader">
              <span class="ms">crown</span>
              <span>盟主</span>
            </div>
          </div>
        </div>

        <!-- 成员席位 -->
        <div class="members">
          <div class="members-title">
            <span class="ms">groups</span>
            <span>盟友席位</span>
          </div>
          <div class="slots">
            <div
              v-for="slot in memberSlots"
              :key="slot"
              :class="['slot', { filled: !!store.myAlliance?.members[slot] }]"
            >
              <div class="slot-avatar" v-if="store.myAlliance?.members[slot]">
                {{ store.myAlliance.members[slot].charAt(0) }}
                <span
                  v-if="store.myAlliance.members[slot] === store.myAlliance.leader"
                  class="ms crown"
                >crown</span>
              </div>
              <div class="slot-empty" v-else>
                <span class="ms">add</span>
                <span class="empty-text">空位</span>
              </div>
              <div class="slot-name" v-if="store.myAlliance?.members[slot]">
                {{ store.myAlliance.members[slot] }}
              </div>
              <div class="slot-name placeholder" v-else>空位</div>
            </div>
          </div>
        </div>

        <!-- 邀请结盟 -->
        <div class="invite-card card" v-if="canInvite">
          <div class="invite-title">
            <span class="ms">person_add</span>
            <span>邀请结盟</span>
          </div>
          <input
            class="name-input"
            v-model="inviteName"
            maxlength="12"
            placeholder="输入玩家名称"
            @keyup.enter="invitePlayer"
          />
          <button class="btn btn-crimson invite-btn" @click="invitePlayer">
            <span class="ms">send</span>
            <span>邀请结盟</span>
          </button>
        </div>

        <!-- 结盟权益 -->
        <div class="benefits card">
          <div class="benefits-title">
            <span class="ms">verified</span>
            <span>结盟权益</span>
          </div>
          <ul class="benefits-list">
            <li><span class="ms check">check_circle</span>结盟成员不可互相攻击</li>
            <li><span class="ms check">check_circle</span>可共同防御城池</li>
            <li><span class="ms check">check_circle</span>可共享资源</li>
          </ul>
        </div>

        <!-- 退出联盟 -->
        <button class="btn btn-crimson leave-btn" @click="confirmLeave = true">
          <span class="ms">logout</span>
          <span>退出联盟</span>
        </button>
      </div>

      <!-- 规则说明 -->
      <div class="rules card">
        <div class="rules-title">
          <span class="ms">menu_book</span>
          <span>结盟与掠夺规则</span>
        </div>
        <div class="rule-row"><span class="rule-dot ally"></span>结盟状态：双方或三方，不可攻击</div>
        <div class="rule-row"><span class="rule-dot foe"></span>未结盟：可攻击和掠夺</div>
        <div class="rule-row"><span class="rule-dot gold"></span>攻下城池：可掠夺所有物品</div>
        <div class="rule-row"><span class="rule-dot gold"></span>掠夺时间：根据城池大小换算</div>
      </div>
    </div>

    <!-- 退出确认弹窗 -->
    <transition name="modal">
      <div class="confirm-mask" v-if="confirmLeave" @click.self="confirmLeave = false">
        <div class="confirm-modal">
          <div class="confirm-icon"><span class="ms">warning</span></div>
          <div class="confirm-title">退出联盟？</div>
          <div class="confirm-desc">退出后将与盟友解除结盟关系，城池将不再共同防御。</div>
          <div class="confirm-actions">
            <button class="btn btn-ghost ca-btn" @click="confirmLeave = false">再想想</button>
            <button
              class="btn btn-crimson ca-btn"
              @click="confirmLeave = false; leaveAlliance()"
            >退出联盟</button>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<style scoped>
.alliance { background: linear-gradient(180deg, #0d0a1a 0%, #1a0e2a 50%, #0d0a1a 100%); }

/* === 联盟大厅背景 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.hall-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% 18%, #2a1a4a 0%, transparent 55%),
    radial-gradient(ellipse at 20% 70%, #1a0e2a 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, #1a0e2a 0%, transparent 50%),
    linear-gradient(180deg, #0d0a1a 0%, #06040f 100%);
}

/* 悬挂金边旌旗 */
.banner {
  position: absolute; top: 0; width: 46px; height: 70%;
  background: linear-gradient(180deg, rgba(212,164,55,0.18) 0%, rgba(139,105,20,0.08) 60%, transparent 100%);
  border-left: 1px solid rgba(212,164,55,0.25);
  border-right: 1px solid rgba(212,164,55,0.25);
  opacity: 0.55;
  pointer-events: none;
}
.banner::before {
  content: ''; position: absolute; top: 0; left: -3px; right: -3px; height: 6px;
  background: linear-gradient(90deg, var(--gold-deep), var(--gold), var(--gold-deep));
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(212,164,55,0.4);
}
.banner::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 18px;
  background: linear-gradient(180deg, transparent, rgba(212,164,55,0.25));
  clip-path: polygon(0 0, 100% 0, 100% 40%, 50% 100%, 0 40%);
}
.b-left { left: 8%; }
.b-right { right: 8%; }

/* 中央徽记光晕 */
.crest-glow {
  position: absolute; top: 38%; left: 50%;
  width: 320px; height: 320px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(212,164,55,0.12) 0%, transparent 65%);
  animation: crestPulse 7s ease-in-out infinite;
  pointer-events: none;
}
@keyframes crestPulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.95); }
  50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.05); }
}

/* 飘浮符文 */
.rune {
  position: absolute; width: 6px; height: 6px; border-radius: 50%;
  background: var(--gold-light);
  box-shadow: 0 0 8px var(--gold), 0 0 16px rgba(212,164,55,0.5);
  animation: runeFloat 6s ease-in-out infinite;
  opacity: 0.5;
}
.r1 { top: 30%; left: 22%; animation-delay: 0s; }
.r2 { top: 55%; right: 18%; animation-delay: -2s; animation-duration: 7s; }
.r3 { top: 70%; left: 60%; animation-delay: -4s; }
@keyframes runeFloat {
  0% { transform: translateY(0) scale(0.6); opacity: 0; }
  25% { opacity: 0.8; }
  100% { transform: translateY(-70px) scale(1.1); opacity: 0; }
}

.bg-overlay {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(8,5,18,0.55) 0%, transparent 18%, transparent 72%, rgba(8,5,18,0.95) 100%);
}

/* === 头部 === */
.hd { position: relative; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 22px; padding: 0; display: flex; align-items: center; justify-content: center; }
.hd h1 { font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.spacer { width: 38px; }

/* === 锁定遮罩 === */
.lock-overlay {
  position: relative; z-index: 3; flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 40px;
}
.lock-icon {
  font-size: 64px; color: var(--gold-deep);
  filter: drop-shadow(0 0 16px rgba(212,164,55,0.3));
}
.lock-text {
  font-family: var(--font-display); font-size: 20px;
  color: var(--gold-light); letter-spacing: 2px;
}
.lock-sub { font-size: 12px; color: rgba(255,255,255,0.45); text-align: center; }

/* === 主体 === */
.body {
  position: relative; z-index: 3; flex: 1; overflow-y: auto;
  padding: 0 16px 22px; display: flex; flex-direction: column; gap: 14px;
}

/* === 联盟徽记（CSS 盾形） === */
.crest {
  position: relative; width: 84px; height: 84px;
  margin: 0 auto 4px;
  display: flex; align-items: center; justify-content: center;
}
.crest-shield {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, rgba(212,164,55,0.25), rgba(139,105,20,0.08));
  border: 1.5px solid var(--gold);
  border-radius: 50% 50% 50% 50% / 38% 38% 62% 62%;
  box-shadow: 0 0 18px rgba(212,164,55,0.35), inset 0 1px 0 rgba(255,255,255,0.1);
}
.crest-icon { position: relative; font-size: 38px; color: var(--gold-light); text-shadow: 0 0 12px rgba(212,164,55,0.6); }

/* === 创建联盟卡 === */
.create-card {
  padding: 22px 18px; display: flex; flex-direction: column; align-items: center; gap: 12px;
  border-color: rgba(212,164,55,0.4);
  background: linear-gradient(160deg, rgba(40,28,70,0.6), rgba(20,12,38,0.6));
}
.create-title {
  font-family: var(--font-display); font-size: 18px;
  color: var(--gold-light); letter-spacing: 2px;
}
.create-desc {
  font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.6);
  text-align: center; padding: 0 4px;
}
.name-input {
  width: 100%; padding: 12px 14px; font-size: 14px;
  font-family: var(--font-body); color: var(--gold-light);
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(212,164,55,0.3);
  border-radius: 10px; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.name-input::placeholder { color: rgba(255,255,255,0.35); }
.name-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(212,164,55,0.18);
}
.create-btn, .invite-btn {
  width: 100%; padding: 13px; border-radius: 10px;
  font-size: 15px; letter-spacing: 2px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.create-btn .ms, .invite-btn .ms { font-size: 18px; }

/* === 联盟信息卡 === */
.alliance-info { display: flex; flex-direction: column; gap: 14px; }
.info-card {
  padding: 16px;
  border-color: rgba(212,164,55,0.4);
  background: linear-gradient(160deg, rgba(40,28,70,0.6), rgba(20,12,38,0.6));
  box-shadow: 0 0 18px rgba(212,164,55,0.1);
}
.info-top { display: flex; align-items: center; gap: 12px; }
.crest-sm {
  width: 46px; height: 46px; flex-shrink: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,164,55,0.3), rgba(139,105,20,0.1));
  border: 1px solid var(--gold);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 12px rgba(212,164,55,0.3);
}
.crest-sm .ms { font-size: 24px; color: var(--gold-light); }
.info-meta { flex: 1; min-width: 0; }
.alli-name {
  font-family: var(--font-display); font-size: 18px;
  color: var(--gold-light); letter-spacing: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  text-shadow: 0 0 10px rgba(212,164,55,0.3);
}
.alli-date { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.leader-badge {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 10px; border-radius: 20px;
  background: linear-gradient(135deg, var(--gold-deep), var(--gold));
  color: var(--ink); font-size: 11px; font-weight: 700;
  font-family: var(--font-display); letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(212,164,55,0.4);
  flex-shrink: 0;
}
.leader-badge .ms { font-size: 14px; }

/* === 成员席位 === */
.members { display: flex; flex-direction: column; gap: 10px; }
.members-title {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-display); font-size: 14px; color: var(--gold);
  letter-spacing: 1px; padding: 0 2px;
}
.members-title .ms { font-size: 18px; }
.slots {
  display: flex; justify-content: space-around; gap: 10px;
  padding: 16px 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(212,164,55,0.15);
  border-radius: 14px;
}
.slot {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  flex: 1;
}
.slot-avatar {
  position: relative; width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(212,164,55,0.25), rgba(60,40,90,0.4));
  border: 1.5px solid var(--gold);
  font-family: var(--font-display); font-size: 22px; font-weight: 700;
  color: var(--gold-light);
  box-shadow: 0 0 14px rgba(212,164,55,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
}
.slot-avatar .crown {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  font-size: 18px; color: var(--gold-light);
  text-shadow: 0 0 8px var(--gold), 0 0 14px rgba(212,164,55,0.7);
  animation: crownGlow 2.4s ease-in-out infinite;
}
@keyframes crownGlow {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-2px); }
}
.slot-empty {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 1.5px dashed rgba(212,164,55,0.3);
  background: rgba(0,0,0,0.2);
  color: rgba(255,255,255,0.3);
}
.slot-empty .ms { font-size: 18px; }
.empty-text { font-size: 9px; letter-spacing: 1px; }
.slot-name {
  font-size: 12px; color: rgba(255,255,255,0.75);
  max-width: 64px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.slot-name.placeholder { color: rgba(255,255,255,0.3); }

/* === 邀请卡 === */
.invite-card {
  padding: 16px; display: flex; flex-direction: column; gap: 10px;
  border-color: rgba(212,164,55,0.3);
}
.invite-title {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-display); font-size: 14px; color: var(--gold);
  letter-spacing: 1px;
}
.invite-title .ms { font-size: 18px; }

/* === 结盟权益 === */
.benefits { padding: 16px; }
.benefits-title {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-display); font-size: 14px; color: var(--gold);
  letter-spacing: 1px; padding-bottom: 10px;
  border-bottom: 1px solid rgba(212,164,55,0.15);
}
.benefits-title .ms { font-size: 18px; }
.benefits-list {
  list-style: none; padding: 0; margin: 10px 0 0;
  display: flex; flex-direction: column; gap: 8px;
}
.benefits-list li {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: rgba(255,255,255,0.78);
}
.benefits-list .check { font-size: 16px; color: var(--gold); }

/* === 退出联盟按钮 === */
.leave-btn {
  width: 100%; padding: 13px; border-radius: 10px;
  font-size: 15px; letter-spacing: 2px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.leave-btn .ms { font-size: 18px; }

/* === 规则说明 === */
.rules { padding: 16px; }
.rules-title {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-display); font-size: 14px; color: var(--gold);
  letter-spacing: 1px; padding-bottom: 10px;
  border-bottom: 1px solid rgba(212,164,55,0.15);
}
.rules-title .ms { font-size: 18px; }
.rule-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: rgba(255,255,255,0.7);
  padding: 7px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.06);
}
.rule-row:last-child { border-bottom: none; }
.rule-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  box-shadow: 0 0 6px currentColor;
}
.rule-dot.ally { background: #6BFF9E; color: #6BFF9E; }
.rule-dot.foe { background: #FF6B6B; color: #FF6B6B; }
.rule-dot.gold { background: var(--gold); color: var(--gold); }

/* === 退出确认弹窗 === */
.confirm-mask {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.confirm-modal {
  width: 78%; max-width: 320px;
  padding: 24px 22px 20px;
  border-radius: 18px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  background: linear-gradient(160deg, rgba(40,12,12,0.96), rgba(20,8,18,0.96));
  border: 1px solid rgba(212,164,55,0.4);
  box-shadow: 0 20px 60px rgba(0,0,0,0.7);
}
.confirm-icon .ms {
  font-size: 44px; color: var(--crimson-light);
  text-shadow: 0 0 18px rgba(192,57,43,0.6);
}
.confirm-title {
  font-family: var(--font-display); font-size: 18px;
  color: var(--gold-light); letter-spacing: 2px;
}
.confirm-desc {
  font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.6);
  text-align: center;
}
.confirm-actions {
  display: flex; gap: 10px; width: 100%; margin-top: 6px;
}
.ca-btn {
  flex: 1; padding: 11px; border-radius: 10px;
  font-size: 14px; letter-spacing: 1px;
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .confirm-modal, .modal-leave-active .confirm-modal {
  transition: transform 0.3s cubic-bezier(.2,.8,.2,1);
}
.modal-enter-from .confirm-modal, .modal-leave-to .confirm-modal {
  transform: scale(0.85);
}
</style>
