<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { audio } from '../game/audio'
import { ITEMS, RARITY_COLOR, Rarity } from '../data/loot'

const store = useGameStore()
const tab = ref<'buy' | 'sell' | 'upload'>('buy')
const sellQty = ref<Record<string, number>>({})

// 上架表单
const upName = ref('')
const upPrice = ref(0)
const upIcon = ref('redeem')
const upDesc = ref('')
const uploadError = ref('')

const userProducts = computed(() => store.userProducts)

const iconOptions = [
  'redeem', 'star', 'diamond', 'favorite',
  'military_tech', 'auto_awesome', 'shield', 'workspace_premium',
]

function uploadProduct() {
  if (upName.value.trim().length < 2) {
    uploadError.value = '商品名称至少需要2个字符'
    return
  }
  if (upPrice.value < 1) {
    uploadError.value = '价格至少为1金币'
    return
  }
  store.addUserProduct(upName.value.trim(), upPrice.value, upIcon.value, upDesc.value.trim())
  audio.coin()
  upName.value = ''
  upPrice.value = 0
  upIcon.value = 'redeem'
  upDesc.value = ''
  uploadError.value = ''
}

function buyProduct(id: string) {
  const product = store.userProducts.find(p => p.id === id)
  if (!product) return
  if (store.gold < product.price) return
  store.addGold(-product.price)
  audio.coin()
}

function sellItem(id: string) {
  store.sellItem(id, sellQty.value[id] || 1)
  audio.coin()
}

function setSellQty(id: string, qty: number) {
  sellQty.value[id] = qty
}

function sellAll() {
  store.inventoryList.forEach(e => {
    store.sellItem(e.item.id, e.count)
  })
  audio.coin()
}
</script>

<template>
  <section class="screen trade grain">
    <!-- Q 版 CSS 集市场景 -->
    <div class="scene">
      <div class="market-bg"></div>
      <div class="stall" v-for="i in 3" :key="i" :style="{ left: (8+i*28)+'%', bottom: '10%', transform: `scaleX(${i%2 ? 1 : -1})` }"><div class="stall-roof"></div><div class="stall-body"></div></div>
      <div class="lanterns" v-for="i in 5" :key="'l'+i" :style="{ left: (5+i*19)+'%', top: '8%', animationDelay: (i*0.4)+'s' }"></div>
    </div>

    <header class="hd">
      <button class="back btn-ghost btn" @click="store.go('main')"><span class="ms">arrow_back</span></button>
      <h1>集市交易</h1>
      <div class="gold-chip"><span class="ms si">payments</span>{{ store.gold.toLocaleString() }}</div>
    </header>

    <div class="tabs">
      <div :class="['t', { on: tab==='buy' }]" @click="tab='buy'"><span class="ms si">storefront</span>市场收购</div>
      <div :class="['t', { on: tab==='sell' }]" @click="tab='sell'"><span class="ms si">backpack</span>出售物品</div>
      <div :class="['t', { on: tab==='upload' }]" @click="tab='upload'"><span class="ms si">add_business</span>上架商品</div>
    </div>

    <div class="list">
      <!-- 标签 1：市场收购 -->
      <template v-if="tab==='buy'">
        <!-- 用户上架商品 -->
        <div v-if="userProducts.length" class="section-label">玩家商品</div>
        <div v-for="p in userProducts" :key="p.id" class="card">
          <div class="ic"><span class="ms">{{ p.icon }}</span></div>
          <div class="info">
            <div class="nm">{{ p.name }}</div>
            <div class="ds">{{ p.desc }}</div>
            <div class="seller">卖家：{{ p.seller }}</div>
          </div>
          <div class="price-col">
            <span class="pr">{{ p.price }}</span>
            <button class="btn btn-crimson buy-btn" :disabled="store.gold < p.price" @click="buyProduct(p.id)">购买</button>
          </div>
        </div>
        <div v-if="!userProducts.length" class="empty">
          <span class="ms">storefront</span>
          <p>暂无商品上架，去上架商品吧</p>
        </div>

        <!-- 官方物品 -->
        <div class="section-label">官方物品</div>
        <div v-for="it in Object.values(ITEMS)" :key="it.id" :class="['card', it.rarity]">
          <div class="ic" :style="{ color: RARITY_COLOR[it.rarity as Rarity] }"><span class="ms">{{ it.icon }}</span></div>
          <div class="info">
            <div class="nm">{{ it.name }} <span class="rt" :style="{ color: RARITY_COLOR[it.rarity as Rarity] }">{{ it.rarity }}</span></div>
            <div class="ds">{{ it.desc }}</div>
          </div>
          <div class="price-col">
            <span class="pr">{{ Math.ceil(it.price * 1.3) }}</span>
            <button class="btn btn-crimson buy-btn" :disabled="store.gold < Math.ceil(it.price * 1.3)" @click="store.buyItem(it.id, 1)">购买</button>
          </div>
        </div>
      </template>

      <!-- 标签 2：出售物品 -->
      <template v-if="tab==='sell'">
        <div v-if="!store.inventoryList.length" class="empty">
          <span class="ms">backpack</span>
          <p>背包空空，去战场杀敌获取战利品吧</p>
        </div>
        <div v-for="e in store.inventoryList" :key="e.item.id" :class="['card', e.item.rarity]">
          <div class="ic" :style="{ color: RARITY_COLOR[e.item.rarity as Rarity] }"><span class="ms">{{ e.item.icon }}</span></div>
          <div class="info">
            <div class="nm">{{ e.item.name }} <span class="rt" :style="{ color: RARITY_COLOR[e.item.rarity as Rarity] }">{{ e.item.rarity }}</span> <span class="cnt">×{{ e.count }}</span></div>
            <div class="ds">单价 {{ e.item.price }} 金币</div>
          </div>
          <div class="qty-ctrl">
            <button class="qty-btn" @click="setSellQty(e.item.id, Math.max(1, (sellQty[e.item.id]||1) - 1))">−</button>
            <span class="qty-num">{{ sellQty[e.item.id] || 1 }}</span>
            <button class="qty-btn" @click="setSellQty(e.item.id, Math.min(e.count, (sellQty[e.item.id]||1) + 1))">+</button>
            <button class="qty-btn max" @click="setSellQty(e.item.id, e.count)">最大</button>
          </div>
          <button class="btn btn-ghost sell-btn" @click="sellItem(e.item.id)">出售</button>
        </div>
        <button v-if="store.inventoryList.length" class="sell-all btn btn-crimson" @click="sellAll"><span class="ms">sell</span>一键售空</button>
      </template>

      <!-- 标签 3：上架商品 -->
      <template v-if="tab==='upload'">
        <div class="upload-form">
          <div class="form-group">
            <label>商品名称</label>
            <input v-model="upName" type="text" placeholder="输入商品名称（至少2个字符）" maxlength="20" />
          </div>
          <div class="form-group">
            <label>价格（金币）</label>
            <input v-model.number="upPrice" type="number" placeholder="输入价格" min="1" />
          </div>
          <div class="form-group">
            <label>选择图标</label>
            <div class="icon-picker">
              <div
                v-for="ico in iconOptions"
                :key="ico"
                :class="['icon-opt', { sel: upIcon === ico }]"
                @click="upIcon = ico"
              >
                <span class="ms">{{ ico }}</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>商品描述</label>
            <textarea v-model="upDesc" placeholder="描述你的商品..." rows="3" maxlength="100"></textarea>
          </div>
          <div v-if="uploadError" class="upload-error">{{ uploadError }}</div>
          <button class="btn btn-crimson upload-submit" @click="uploadProduct">
            <span class="ms">publish</span>上架出售
          </button>

          <!-- 预览卡片 -->
          <div v-if="upName.trim().length >= 2" class="preview-label">预览效果</div>
          <div v-if="upName.trim().length >= 2" class="card preview-card">
            <div class="ic"><span class="ms">{{ upIcon }}</span></div>
            <div class="info">
              <div class="nm">{{ upName || '商品名称' }}</div>
              <div class="ds">{{ upDesc || '商品描述...' }}</div>
            </div>
            <div class="price-col">
              <span class="pr">{{ upPrice || 0 }}</span>
              <span class="preview-badge">上架中</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.trade { background: linear-gradient(180deg, #1a1410 0%, #2a1f14 100%); }

/* === Q 版 CSS 集市场景 === */
.scene { position: absolute; inset: 0; overflow: hidden; }
.market-bg { position: absolute; inset: 0; background: linear-gradient(180deg, #3a2a18 0%, #d4944a 20%, #e8c888 35%, #6a4a2a 70%, #1a0e04 100%); }
.stall { position: absolute; width: 60px; }
.stall-roof { width: 70px; height: 24px; margin-left: -5px; background: linear-gradient(180deg, var(--crimson), #5a0000); clip-path: polygon(10% 100%, 0 50%, 50% 0, 100% 50%, 90% 100%); border-bottom: 2px solid var(--gold); }
.stall-body { width: 60px; height: 28px; background: linear-gradient(180deg, #5a3a1a, #2a1808); border-radius: 0 0 4px 4px; border: 1px solid rgba(212,164,55,0.3); border-top: none; }
.lanterns { position: absolute; width: 14px; height: 18px; background: var(--crimson); border: 1px solid var(--gold); border-radius: 50%; animation: lanternSway 3s ease-in-out infinite; transform-origin: top center; box-shadow: 0 0 10px rgba(255,140,60,0.5); }
.lanterns::before { content: ''; position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 1px; height: 4px; background: #3a2410; }
@keyframes lanternSway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }

/* === 头部 === */
.hd { position: relative; z-index: 3; display: flex; align-items: center; gap: 10px; padding: 14px 16px; }
.back { width: 38px; height: 38px; border-radius: 50%; font-size: 22px; padding: 0; display: flex; align-items: center; justify-content: center; }
.hd h1 { flex: 1; font-family: var(--font-display); font-size: 20px; color: var(--gold); letter-spacing: 2px; }
.gold-chip { display: flex; align-items: center; gap: 3px; padding: 6px 12px; border-radius: 14px; background: rgba(0,0,0,0.55); border: 1px solid rgba(212,164,55,0.4); color: var(--gold-light); font-family: var(--font-num); font-size: 13px; font-weight: 700; }
.si { font-size: 16px; color: var(--gold); }

/* === 标签栏 === */
.tabs { position: relative; z-index: 3; display: flex; gap: 4px; padding: 0 14px 10px; }
.t { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; text-align: center; padding: 9px 4px; border-radius: 10px; font-size: 12px; font-weight: 600; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.45); cursor: pointer; border: 1px solid transparent; transition: all .2s; }
.t.on { background: rgba(212,164,55,0.15); color: var(--gold); border-color: var(--gold); box-shadow: inset 0 -2px 0 var(--gold); }

/* === 列表滚动区 === */
.list { position: relative; z-index: 3; flex: 1; overflow-y: auto; padding: 0 14px 20px; display: flex; flex-direction: column; gap: 8px; }

/* === 区段标签 === */
.section-label { font-family: var(--font-display); font-size: 13px; color: var(--gold); letter-spacing: 1px; padding: 4px 0 2px; border-bottom: 1px solid rgba(212,164,55,0.2); margin-bottom: 2px; }

/* === 空状态 === */
.empty { text-align: center; color: rgba(255,255,255,0.4); padding: 40px 0; }
.empty .ms { font-size: 48px; color: rgba(212,164,55,0.3); }
.empty p { font-size: 13px; margin-top: 8px; }

/* === 卡片 === */
.card { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(212,164,55,0.2); border-radius: 12px; border-left-width: 3px; }
.card.common { border-left-color: #9e9e9e; }
.card.rare { border-left-color: #4fc3f7; }
.card.epic { border-left-color: #ba68c8; }
.card.legendary { border-left-color: #ffb300; box-shadow: 0 0 12px rgba(255,179,0,0.2); }
.ic { width: 44px; height: 44px; border-radius: 10px; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.info { flex: 1; min-width: 0; }
.nm { font-size: 14px; font-weight: 700; color: var(--gold-light); display: flex; align-items: center; gap: 6px; }
.rt { font-size: 9px; text-transform: uppercase; opacity: 0.8; }
.cnt { font-family: var(--font-num); font-size: 12px; color: var(--gold); }
.ds { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 2px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.seller { font-size: 10px; color: rgba(255,255,255,0.35); margin-top: 2px; }
.price-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
.pr { font-family: var(--font-num); font-size: 14px; font-weight: 700; color: var(--gold-light); }
.buy-btn { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; font-family: var(--font-body); }
.buy-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* === 出售数量控制 === */
.qty-ctrl { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.qty-btn { width: 26px; height: 26px; border-radius: 6px; border: 1px solid rgba(212,164,55,0.3); background: rgba(255,255,255,0.06); color: var(--gold-light); font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: var(--font-body); line-height: 1; }
.qty-btn.max { width: auto; padding: 0 8px; font-size: 10px; }
.qty-btn:active { transform: scale(0.92); }
.qty-num { width: 28px; text-align: center; font-family: var(--font-num); font-size: 13px; color: var(--gold-light); }
.sell-btn { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.sell-all { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 12px; font-size: 14px; font-family: var(--font-display); letter-spacing: 1px; margin-top: 4px; }

/* === 上架表单 === */
.upload-form { display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--gold); letter-spacing: 1px; }
.form-group input,
.form-group textarea {
  padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(212,164,55,0.3);
  background: rgba(0,0,0,0.35); color: var(--gold-light); font-size: 13px;
  font-family: var(--font-body); outline: none; transition: border-color .2s;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--gold); }
.form-group input::placeholder,
.form-group textarea::placeholder { color: rgba(255,255,255,0.25); }
.form-group textarea { resize: none; }

/* 图标选择器 */
.icon-picker { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.icon-opt {
  width: 100%; aspect-ratio: 1; border-radius: 12px;
  background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color .2s, background .2s;
  font-size: 28px; color: var(--gold-light);
}
.icon-opt:hover { background: rgba(212,164,55,0.1); }
.icon-opt.sel { border-color: var(--gold); background: rgba(212,164,55,0.15); box-shadow: 0 0 10px rgba(212,164,55,0.3); }
.icon-opt:active { transform: scale(0.93); }

.upload-error { color: var(--crimson-light); font-size: 12px; padding: 8px 12px; background: rgba(192,57,43,0.12); border-radius: 8px; border: 1px solid rgba(192,57,43,0.3); }
.upload-submit { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 12px; font-size: 15px; font-family: var(--font-display); letter-spacing: 2px; }

.preview-label { font-family: var(--font-display); font-size: 12px; color: var(--gold); letter-spacing: 1px; margin-top: 4px; }
.preview-card { opacity: 0.85; }
.preview-badge { font-size: 10px; color: var(--gold); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(212,164,55,0.4); background: rgba(212,164,55,0.1); }
</style>