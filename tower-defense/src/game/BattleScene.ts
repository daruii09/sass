// Phaser 战斗场景：曲线塔防核心，集成音效/语音/特效/塔升级
import Phaser from 'phaser'
import { PathManager } from './PathManager'
import { SlotManager } from './SlotManager'
import { Enemy } from './Enemy'
import { Tower } from './Tower'
import { Soldier } from './Soldier'
import { Projectile } from './Projectile'
import { Effects } from './Effects'
import { audio } from './audio'
import { voice } from './voice'
import { ensureFallbackTexture, isTextureValid } from './fallback'
import { rollLoot } from '../data/loot'
import { LevelDef } from '../data/levels'
import { ENEMIES } from '../data/enemies'
import { TOWERS, TowerKind } from '../data/towers'
import { UNITS, unitById } from '../data/units'

export interface BattleConfig {
  level: LevelDef
  grainMax: number
  morale: number
  cmd: number
  rankIndex: number
}

export interface BattleResult {
  win: boolean
  gold: number
  kills: number
}

export interface BattleCallbacks {
  onGrain: (g: number) => void
  onBaseHp: (hp: number, max: number) => void
  onWave: (cur: number, total: number) => void
  onCmd: (used: number, max: number) => void
  onSelectSlot: (slotIdx: number | null) => void
  onSelectTower: (towerIdx: number | null, kind: TowerKind | null, tier: number, canUp: boolean, upCost: number) => void
  onSpeed: (mul: number) => void
  onSkillReady: (skillId: string, ready: boolean, cdLeft: number) => void
  onLoot: (item: { id: string; name: string; icon: string; rarity: string }, x: number, y: number) => void
  onEnd: (r: BattleResult) => void
}

export class BattleScene extends Phaser.Scene {
  cfg!: BattleConfig
  cb!: BattleCallbacks
  path!: PathManager
  slots!: SlotManager
  effects!: Effects
  enemies: Enemy[] = []
  towers: Tower[] = []
  projectiles: Projectile[] = []
  grain = 0
  baseHp = 0
  baseHpMax = 0
  waveIdx = 0
  spawnQueue: { enemy: string; at: number }[] = []
  spawnTimer = 0
  ended = false
  kills = 0
  selectedSlot = -1
  selectedTower = -1
  pendingTowerKind: TowerKind | null = null  // 自由放置：待建造的塔类型
  speedMul = 1
  skillCds: Record<string, number> = {}
  moraleBuff = 0
  projKeys: Record<string, string> = {}

  constructor() { super('battle') }

  init(_data: unknown) {
    this.cfg = (this as any).__pendingCfg
    this.cb = (this as any).__pendingCb
    this.grain = this.cfg.grainMax
    this.baseHp = this.cfg.level.baseHp
    this.baseHpMax = this.cfg.level.baseHp
    this.enemies = []
    this.towers = []
    this.projectiles = []
    this.ended = false
    this.kills = 0
    this.waveIdx = 0
    this.spawnQueue = []
    this.spawnTimer = 0
    this.selectedSlot = -1
    this.selectedTower = -1
    this.speedMul = 1
    this.skillCds = {}
    this.moraleBuff = 0
  }

  preload() {
    const loaders: { key: string; url: string }[] = []
    loaders.push({ key: 'bg', url: this.cfg.level.bg })
    loaders.push({ key: 'castle', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('3D rendered ancient Chinese blue brick fortress gatehouse, isometric, standalone') + '&image_size=portrait_4_3' })
    loaders.push({ key: 'camp', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('3D rendered barbarian wooden palisade camp, isometric') + '&image_size=portrait_4_3' })
    // 塔：3 级素材
    Object.values(TOWERS).forEach(t => {
      t.tiers.forEach((tier, i) => loaders.push({ key: `${t.kind}${i + 1}`, url: tier.asset }))
    })
    // 兵种
    UNITS.forEach(u => loaders.push({ key: u.id, url: u.asset }))
    // 敌人
    Object.values(ENEMIES).forEach(e => loaders.push({ key: e.id, url: e.asset }))
    // 箭矢占位纹理（用 graphics 生成）
    this.projKeys = { archer: 'shield', ballista: 'spear', catapult: 'catapult', proj: 'archer' }

    // 不设置 crossOrigin='anonymous'：该选项会强制 CORS 请求，
    // 若服务器未返回 CORS 头则图片加载全部失败。不设置时图片仍可正常显示。
    // 清除可能存在的无效（空/损坏）纹理，确保重新加载真实图片
    loaders.forEach(l => {
      if (this.textures.exists(l.key) && !isTextureValid(this, l.key)) {
        this.textures.remove(l.key)
      }
      if (!this.textures.exists(l.key)) this.load.image(l.key, l.url)
    })
    // 加载失败时立即生成 Q 版回退纹理（在 create() 之前完成，确保纹理始终可用）
    this.load.on('loaderror', (file: any) => {
      if (file && file.key) ensureFallbackTexture(this, file.key)
    })
    ;(window as any).__UNIT_LOOKUP__ = unitById
    // 塔选中回调
    ;(this as any).__SELECT_TOWER__ = (tower: Tower) => {
      const idx = this.towers.indexOf(tower)
      this.selectedTower = idx
      this.selectedSlot = -1
      this.cb.onSelectSlot(null)
      this.towers.forEach((t, i) => t.showRange(i === idx))
      this.cb.onSelectTower(idx, tower.def.kind, tower.tierIdx + 1, tower.canUpgrade(), tower.upgradeCost())
    }
  }

  create() {
    const w = this.scale.width, h = this.scale.height
    this.effects = new Effects(this)

    // 兜底：为所有加载失败/缺失的纹理生成 Q 版程序化素材
    const fbKeys: string[] = ['bg', 'castle', 'camp']
    Object.values(TOWERS).forEach(t => t.tiers.forEach((_, i) => fbKeys.push(`${t.kind}${i + 1}`)))
    UNITS.forEach(u => fbKeys.push(u.id))
    Object.values(ENEMIES).forEach(e => fbKeys.push(e.id))
    fbKeys.forEach(k => ensureFallbackTexture(this, k))
    // 箭矢纹理（士兵远程攻击用）
    if (!this.textures.exists('__arrow__')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false)
      g.fillStyle(0xd4a437); g.fillRect(0, 1, 16, 3)
      g.fillStyle(0x8b6914); g.fillTriangle(16, 0, 16, 6, 22, 3)
      g.generateTexture('__arrow__', 22, 6); g.destroy()
    }

    const bg = this.add.image(w / 2, h / 2, 'bg').setDisplaySize(w, h).setAlpha(0.92)
    // 暗角
    for (let i = 0; i < 6; i++) {
      this.add.ellipse(w / 2, h / 2, w * (1.4 + i * 0.1), h * (1.4 + i * 0.1), 0x000000, 0.05).setDepth(0)
    }

    this.path = new PathManager(this, w, h)

    const camp = this.add.image(this.path.start.x, this.path.start.y - 30, 'camp').setDisplaySize(90, 90).setOrigin(0.5, 0.85).setDepth(this.path.start.y)
    this.tweens.add({ targets: camp, alpha: { from: 0.6, to: 1 }, duration: 1200, yoyo: true, repeat: -1 })
    const castle = this.add.image(this.path.end.x, this.path.end.y - 10, 'castle').setDisplaySize(110, 110).setOrigin(0.5, 0.85).setDepth(this.path.end.y)
    this.tweens.add({ targets: castle, scaleX: 1.02, scaleY: 1.02, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' })

    this.slots = new SlotManager(this, this.path, w, h)

    // 自由放置模式：监听整个游戏区域的点击，玩家可在任意空地放置防御塔
    // 当处于"建造模式"（pendingTowerKind 不为空）时，点击地图即在该位置建造
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.pendingTowerKind) return
      // 仅在游戏区域内（非 UI）
      if (pointer.y < 80 || pointer.y > h - 100) return
      const slot = this.slots.createFreeSlot(pointer.x, pointer.y)
      if (!slot) {
        // 不可建造：红色提示
        this.effects.floatText(pointer.x, pointer.y, '此处不可建造', '#FF6666', '13px')
        audio.uiBack()
        return
      }
      // 在该位置显示建造预览圈
      const preview = this.add.circle(slot.x, slot.y, 22, 0xd4a437, 0.2).setStrokeStyle(2, 0xd4a437, 0.9).setDepth(slot.y)
      this.tweens.add({ targets: preview, alpha: 0, duration: 400, onComplete: () => preview.destroy() })
      // 选中该自由塔位
      this.selectedSlot = this.slots.slots.indexOf(slot)
      this.cb.onSelectSlot(this.selectedSlot)
      // 立即尝试建造
      this.buildTower(this.pendingTowerKind)
      this.pendingTowerKind = null
      this.cb.onSelectSlot(null)
    })

    ;(this as any).__ENEMIES__ = this.enemies

    this.cfg.level.waves.forEach(wv => {
      for (let i = 0; i < wv.count; i++) {
        this.spawnQueue.push({ enemy: wv.enemy, at: (this.spawnQueue.length === 0 ? 2 : 0) + i * wv.gap })
      }
    })

    this.cb.onGrain(this.grain)
    this.cb.onBaseHp(this.baseHp, this.baseHpMax)
    this.cb.onWave(0, this.cfg.level.waves.length)
    this.cb.onCmd(0, this.cfg.cmd)
    ;['drum', 'heal', 'fire', 'reinforce'].forEach(id => this.cb.onSkillReady(id, true, 0))

    audio.resume()
    audio.startMusic()
    voice.wave()
  }

  private selectSlot(i: number) {
    this.selectedSlot = i
    this.selectedTower = -1
    this.towers.forEach(t => t.showRange(false))
    this.cb.onSelectTower(null, null, 0, false, 0)
    this.cb.onSelectSlot(i)
    audio.uiClick()
  }

  // 自由放置：进入建造模式，等待玩家点击地图选择位置
  startPlacement(kind: TowerKind): boolean {
    const def = TOWERS[kind]
    const cost = def.tiers[0].cost
    if (this.grain < cost) return false
    if (this.cfg.rankIndex + 1 < def.unlockRank) return false
    this.pendingTowerKind = kind
    return true
  }

  buildTower(kind: TowerKind): boolean {
    if (this.selectedSlot < 0) return false
    const slot = this.slots.slots[this.selectedSlot]
    if (!slot || slot.occupied) return false
    const def = TOWERS[kind]
    const cost = def.tiers[0].cost
    if (this.grain < cost) return false
    if (this.cfg.rankIndex + 1 < def.unlockRank) return false
    this.grain -= cost
    const unitDef = def.soldierId ? unitById(def.soldierId) : undefined
    const tower = new Tower(this, def, slot.x, slot.y, unitDef, this.effects, this.projKeys)
    this.towers.push(tower)
    this.slots.occupy(slot)
    this.selectedSlot = -1
    this.cb.onSelectSlot(null)
    this.cb.onGrain(this.grain)
    return true
  }

  upgradeTower(): boolean {
    if (this.selectedTower < 0) return false
    const tower = this.towers[this.selectedTower]
    if (!tower || !tower.canUpgrade()) return false
    const cost = tower.upgradeCost()
    if (this.grain < cost) return false
    this.grain -= cost
    const unitDef = tower.def.soldierId ? unitById(tower.def.soldierId) : undefined
    tower.upgrade(unitDef)
    this.cb.onGrain(this.grain)
    this.cb.onSelectTower(this.selectedTower, tower.def.kind, tower.tierIdx + 1, tower.canUpgrade(), tower.upgradeCost())
    return true
  }

  deployUnit(unitId: string): boolean {
    const def = unitById(unitId)
    if (!def) return false
    if (this.grain < def.cost) return false
    if (this.cfg.rankIndex + 1 < def.unlockRank) return false
    if (this.deployedCount() >= this.cfg.cmd) return false
    this.grain -= def.cost
    const p = this.path.getPoint(0.45)
    const s = new Soldier(this, def, p.x, p.y, { x: p.x, y: p.y }, this.effects)
    s.spawnEffect()
    audio.deploy()
    voice.deploy(def.type)
    this.cb.onGrain(this.grain)
    this.cb.onCmd(this.deployedCount(), this.cfg.cmd)
    return true
  }

  private deployedCount(): number {
    return this.deployedSoldiers().length
  }
  private deployedSoldiers(): Soldier[] {
    // 从场景中收集所有未被塔持有的士兵（部署的）
    return (this as any).__DEPLOYED__ || []
  }

  useSkill(skillId: string) {
    if (this.skillCds[skillId] > 0) return
    const cds: Record<string, number> = { drum: 25, heal: 30, fire: 40, reinforce: 50 }
    if (skillId === 'drum') {
      this.moraleBuff = 8
      this.effects.skillFlash()
      this.effects.shake(0.008, 200)
      this.showToast('战鼓擂！全军攻击提升')
    } else if (skillId === 'heal') {
      this.allSoldiers().forEach(s => { if (!s.dead) s.hp = Math.min(s.maxHp, s.hp + s.maxHp * 0.4) })
      this.effects.skillFlash(0x4caf50)
      this.showToast('急救令！士兵已治疗')
    } else if (skillId === 'fire') {
      this.effects.fireRain()
      this.effects.skillFlash(0xff6600)
      this.effects.shake(0.01, 300)
      this.enemies.forEach(e => { if (!e.dead) e.damage(150, 'fire') })
      this.showToast('火矢齐射！')
    } else if (skillId === 'reinforce') {
      const guard = unitById('guard')
      if (guard) {
        for (let i = 0; i < 4; i++) {
          const p = this.path.getPoint(0.5 + i * 0.02)
          const s = new Soldier(this, guard, p.x, p.y, { x: p.x, y: p.y }, this.effects)
          s.spawnEffect()
          ;(this as any).__DEPLOYED__ = (this as any).__DEPLOYED__ || []
          ;(this as any).__DEPLOYED__.push(s)
        }
      }
      this.effects.skillFlash()
      this.showToast('天降神兵！')
    }
    this.skillCds[skillId] = cds[skillId]
    audio.skill()
    voice.skill(skillId === 'drum' ? '战鼓擂' : skillId === 'heal' ? '急救令' : skillId === 'fire' ? '火矢齐射' : '天降神兵')
  }

  private allSoldiers(): Soldier[] {
    const arr: Soldier[] = []
    this.towers.forEach(t => t.soldiers.forEach(s => arr.push(s)))
    if ((this as any).__DEPLOYED__) (this as any).__DEPLOYED__.forEach((s: Soldier) => arr.push(s))
    return arr
  }

  setSpeed(mul: number) { this.speedMul = mul; this.cb.onSpeed(mul) }

  private showToast(msg: string) {
    const t = this.add.text(this.scale.width / 2, 70, msg, {
      fontFamily: 'ZCOOL XiaoWei', fontSize: '20px', color: '#F5E6A8',
      backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(10000)
    this.tweens.add({ targets: t, y: 50, alpha: 0, duration: 1400, onComplete: () => t.destroy() })
  }

  update(_time: number, deltaMs: number) {
    if (this.ended) return
    const dt = (deltaMs / 1000) * this.speedMul

    this.spawnTimer += dt
    while (this.spawnQueue.length && this.spawnQueue[0].at <= this.spawnTimer) {
      const spec = this.spawnQueue.shift()!
      const def = ENEMIES[spec.enemy]
      if (def) this.enemies.push(new Enemy(this, def, this.path, def.id, this.effects))
    }
    ;(this as any).__ENEMIES__ = this.enemies

    this.enemies.forEach(e => e.advance(dt))

    // 阻挡判定
    this.enemies.forEach(e => {
      if (e.dead || e.reached) return
      let blocked = false
      for (const s of this.allSoldiers()) {
        if (s.dead) continue
        if (e.distanceTo(s.x, s.y) < 30) { blocked = true; break }
      }
      e.setTarget(blocked ? { x: e.sprite.x, y: e.sprite.y } : null)
    })

    this.allSoldiers().forEach(s => s.update(dt, this.enemies))

    // 敌人反击士兵
    this.enemies.forEach(e => {
      if (e.dead || e.reached || !e.target) return
      e.attackCd -= dt
      if (e.attackCd <= 0) {
        e.attackCd = 1.0
        let best: Soldier | null = null
        let bd = 40
        for (const s of this.allSoldiers()) {
          if (s.dead) continue
          const d = e.distanceTo(s.x, s.y)
          if (d < bd) { bd = d; best = s }
        }
        if (best) best.takeDamage(e.def.atk)
      }
    })

    this.towers.forEach(t => t.update(dt, this.enemies, this.projectiles, t.def.soldierId ? unitById(t.def.soldierId) : undefined))

    if (this.moraleBuff > 0) this.moraleBuff -= dt

    for (const id of Object.keys(this.skillCds)) {
      if (this.skillCds[id] > 0) this.skillCds[id] = Math.max(0, this.skillCds[id] - dt)
      this.cb.onSkillReady(id, this.skillCds[id] <= 0, this.skillCds[id])
    }

    const totalToSpawn = this.cfg.level.waves.reduce((s, w) => s + w.count, 0)
    const spawned = totalToSpawn - this.spawnQueue.length
    this.cb.onWave(Math.min(this.cfg.level.waves.length, Math.floor(spawned / Math.max(1, Math.ceil(totalToSpawn / this.cfg.level.waves.length))) + 1), this.cfg.level.waves.length)

    this.enemies.forEach(e => {
      if (e.reached && !e.dead) {
        this.baseHp -= e.def.damage
        e.die()
        audio.baseHit()
        this.effects.shake(0.012, 150)
        this.cb.onBaseHp(Math.max(0, this.baseHp), this.baseHpMax)
      }
    })

    const alive: Enemy[] = []
    this.enemies.forEach(e => {
      if (e.dead) {
        if (!e.reached) {
          this.kills++
          this.grain += Math.floor(e.def.bounty * 0.5)
          this.cb.onGrain(this.grain)
          voice.kill()
          // 战利品掉落
          const drops = rollLoot(e.def.id)
          drops.forEach(it => {
            const col = it.rarity === 'legendary' ? '#ffb300' : it.rarity === 'epic' ? '#ba68c8' : it.rarity === 'rare' ? '#4fc3f7' : '#9e9e9e'
            this.effects.floatText(e.sprite.x, e.sprite.y - 36, `[${it.name}]`, col, it.rarity === 'legendary' ? '20px' : '15px')
            this.effects.hitBurst(e.sprite.x, e.sprite.y, it.rarity === 'legendary' ? 0xffb300 : 0xd4a437)
            this.cb.onLoot({ id: it.id, name: it.name, icon: it.icon, rarity: it.rarity }, e.sprite.x, e.sprite.y)
          })
        }
      } else alive.push(e)
    })
    this.enemies = alive
    ;(this as any).__ENEMIES__ = this.enemies

    if ((this as any).__DEPLOYED__) {
      const arr = (this as any).__DEPLOYED__ as Soldier[]
      const kept = arr.filter(s => !s.dead)
      ;(this as any).__DEPLOYED__ = kept
      this.cb.onCmd(kept.length, this.cfg.cmd)
    }

    if (this.baseHp <= 0) {
      this.ended = true
      audio.lose(); voice.lose()
      this.cb.onEnd({ win: false, gold: Math.floor(this.cfg.level.reward / 5), kills: this.kills })
    } else if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.ended = true
      audio.win(); voice.win()
      this.cb.onEnd({ win: true, gold: this.cfg.level.reward + Math.floor(this.baseHp / this.baseHpMax * this.cfg.level.reward * 0.3), kills: this.kills })
    }
  }
}
