// Phaser 战斗场景：曲线塔防核心
import Phaser from 'phaser'
import { PathManager } from './PathManager'
import { SlotManager } from './SlotManager'
import { Enemy } from './Enemy'
import { Tower } from './Tower'
import { Soldier } from './Soldier'
import { Projectile } from './Projectile'
import { LevelDef } from '../data/levels'
import { ENEMIES } from '../data/enemies'
import { TOWERS, TowerKind, TowerDef } from '../data/towers'
import { UNITS, UnitDef, unitById } from '../data/units'

export interface BattleConfig {
  level: LevelDef
  grainMax: number
  morale: number   // 攻击加成%
  cmd: number      // 部署上限
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
  onSpeed: (mul: number) => void
  onSkillReady: (skillId: string, ready: boolean, cdLeft: number) => void
  onEnd: (r: BattleResult) => void
}

interface DeployedSoldier extends Soldier { _cost: number }

export class BattleScene extends Phaser.Scene {
  cfg!: BattleConfig
  cb!: BattleCallbacks
  path!: PathManager
  slots!: SlotManager
  enemies: Enemy[] = []
  towers: Tower[] = []
  projectiles: Projectile[] = []
  deployed: DeployedSoldier[] = []
  grain = 0
  baseHp = 0
  baseHpMax = 0
  waveIdx = 0
  spawnQueue: { enemy: string; at: number }[] = []
  spawnTimer = 0
  ended = false
  kills = 0
  selectedSlot = -1
  speedMul = 1
  skillCds: Record<string, number> = {}
  moraleBuff = 0  // 战鼓擂剩余时间
  unitKeys: Record<string, string> = {}
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
    this.deployed = []
    this.ended = false
    this.kills = 0
    this.waveIdx = 0
    this.spawnQueue = []
    this.spawnTimer = 0
    this.selectedSlot = -1
    this.speedMul = 1
    this.skillCds = {}
    this.moraleBuff = 0
  }

  preload() {
    const loaders: { key: string; url: string }[] = []
    // 背景
    loaders.push({ key: 'bg', url: this.cfg.level.bg })
    // 建筑
    loaders.push({ key: 'castle', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('中国古代青砖城关要塞城门楼') + '&image_size=portrait_4_3' })
    loaders.push({ key: 'camp', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent('敌方蛮族木栅营寨') + '&image_size=portrait_4_3' })
    // 塔
    Object.values(TOWERS).forEach(t => loaders.push({ key: t.kind, url: t.asset }))
    // 兵种
    UNITS.forEach(u => {
      loaders.push({ key: u.id, url: u.asset })
      this.unitKeys[u.id] = u.id
    })
    // 敌人
    Object.values(ENEMIES).forEach(e => loaders.push({ key: e.id, url: e.asset }))
    // 弹道占位
    this.projKeys = { archer: 'shield', ballista: 'spear', catapult: 'catapult', proj: 'archer' }

    this.load.crossOrigin = 'anonymous'
    loaders.forEach(l => {
      if (!this.textures.exists(l.key)) this.load.image(l.key, l.url)
    })
    // 全局供 Tower/Soldier/Projectile 使用
    ;(window as any).__UNIT_LOOKUP__ = unitById
  }

  create() {
    const w = this.scale.width, h = this.scale.height
    // 背景
    const bg = this.add.image(w / 2, h / 2, 'bg').setDisplaySize(w, h)
    bg.setAlpha(0.92)
    // 暗角
    const vig = this.add.graphics()
    vig.fillStyle(0x000000, 0.35).fillRect(0, 0, w, h)
    vig.fillStyle(0x000000, 0).fillRect(0, 0, w, h)
    // 渐变暗角（用多层椭圆）
    for (let i = 0; i < 6; i++) {
      this.add.ellipse(w / 2, h / 2, w * (1.4 + i * 0.1), h * (1.4 + i * 0.1), 0x000000, 0.05).setDepth(0)
    }

    // 路径
    this.path = new PathManager(this, w, h)

    // 起点敌方营地
    const camp = this.add.image(this.path.start.x, this.path.start.y - 30, 'camp').setDisplaySize(90, 90).setOrigin(0.5, 0.85).setDepth(this.path.start.y)
    this.tweens.add({ targets: camp, alpha: { from: 0.6, to: 1 }, duration: 1200, yoyo: true, repeat: -1 })
    // 终点我方城堡
    const castle = this.add.image(this.path.end.x, this.path.end.y - 10, 'castle').setDisplaySize(110, 110).setOrigin(0.5, 0.85).setDepth(this.path.end.y)
    this.tweens.add({ targets: castle, scaleX: 1.02, scaleY: 1.02, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' })

    // 塔位
    this.slots = new SlotManager(this, this.path, w, h)
    this.slots.slots.forEach((s, i) => {
      const ring = this.add.circle(s.x, s.y, 22, 0xd4a437, 0.12).setStrokeStyle(2, 0xd4a437, 0.7).setDepth(s.y)
      const plus = this.add.text(s.x, s.y, '＋', { fontSize: '22px', color: '#F5E6A8' }).setOrigin(0.5).setDepth(s.y + 1)
      s.marker = this.add.container(0, 0, [ring, plus])
      ring.setInteractive({ useHandCursor: true })
      ring.on('pointerdown', () => this.selectSlot(i))
      this.tweens.add({ targets: [ring, plus], alpha: { from: 0.5, to: 1 }, duration: 900, yoyo: true, repeat: -1 })
    })

    // 全局引用供 Projectile 溅射访问
    ;(this as any).__ENEMIES__ = this.enemies

    // 构建出兵队列
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
  }

  private selectSlot(i: number) {
    this.selectedSlot = i
    this.cb.onSelectSlot(i)
  }

  // 由 Vue 调用：在选中塔位建造塔
  buildTower(kind: TowerKind): boolean {
    if (this.selectedSlot < 0) return false
    const slot = this.slots.slots[this.selectedSlot]
    if (!slot || slot.occupied) return false
    const def = TOWERS[kind]
    if (this.grain < def.cost) return false
    if (this.cfg.rankIndex + 1 < def.unlockRank) return false
    this.grain -= def.cost
    const unitDef = def.soldierId ? unitById(def.soldierId) : undefined
    const tower = new Tower(this, def, slot.x, slot.y, unitDef)
    this.towers.push(tower)
    slot.occupied = true
    if (slot.marker) slot.marker.destroy()
    this.selectedSlot = -1
    this.cb.onSelectSlot(null)
    this.cb.onGrain(this.grain)
    return true
  }

  // 由 Vue 调用：部署士兵到路径中段
  deployUnit(unitId: string): boolean {
    const def = unitById(unitId)
    if (!def) return false
    if (this.grain < def.cost) return false
    if (this.cfg.rankIndex + 1 < def.unlockRank) return false
    if (this.deployed.filter(s => !s.dead).length >= this.cfg.cmd) return false
    this.grain -= def.cost
    const p = this.path.getPoint(0.45)
    const s = new Soldier(this, def, p.x, p.y, { x: p.x, y: p.y }) as DeployedSoldier
    s.spawnEffect()
    this.deployed.push(s)
    this.cb.onGrain(this.grain)
    this.cb.onCmd(this.deployed.filter(x => !x.dead).length, this.cfg.cmd)
    return true
  }

  // 由 Vue 调用：释放主帅技能
  useSkill(skillId: string) {
    if (this.skillCds[skillId] > 0) return
    const cds: Record<string, number> = { drum: 25, heal: 30, fire: 40, reinforce: 50 }
    if (skillId === 'drum') {
      this.moraleBuff = 8
      this.showToast('战鼓擂！全军攻击提升')
    } else if (skillId === 'heal') {
      this.deployed.forEach(s => { if (!s.dead) s.hp = Math.min(s.maxHp, s.hp + s.maxHp * 0.4) })
      this.towers.forEach(t => t.soldiers.forEach(s => { if (!s.dead) s.hp = Math.min(s.maxHp, s.hp + s.maxHp * 0.4) }))
      this.showToast('急救令！士兵已治疗')
    } else if (skillId === 'fire') {
      this.enemies.forEach(e => { if (!e.dead) e.damage(150, 'fire') })
      this.showToast('火矢齐射！')
    } else if (skillId === 'reinforce') {
      const guard = unitById('guard')
      if (guard) {
        for (let i = 0; i < 4; i++) {
          const p = this.path.getPoint(0.5 + i * 0.02)
          const s = new Soldier(this, guard, p.x, p.y, { x: p.x, y: p.y }) as DeployedSoldier
          s.spawnEffect()
          this.deployed.push(s)
        }
      }
      this.showToast('天降神兵！')
    }
    this.skillCds[skillId] = cds[skillId]
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

    // 出兵
    this.spawnTimer += dt
    while (this.spawnQueue.length && this.spawnQueue[0].at <= this.spawnTimer) {
      const spec = this.spawnQueue.shift()!
      const def = ENEMIES[spec.enemy]
      if (def) {
        const e = new Enemy(this, def, this.path, def.id)
        this.enemies.push(e)
      }
    }
    ;(this as any).__ENEMIES__ = this.enemies

    // 敌人前进
    this.enemies.forEach(e => e.advance(dt))

    // 阻挡判定：敌人接近士兵时停下
    this.enemies.forEach(e => {
      if (e.dead || e.reached) return
      let blocked = false
      const allSoldiers = [...this.deployed, ...this.towers.flatMap(t => t.soldiers)]
      for (const s of allSoldiers) {
        if (s.dead) continue
        if (e.distanceTo(s.x, s.y) < 30) { blocked = true; break }
      }
      e.setTarget(blocked ? { x: e.sprite.x, y: e.sprite.y } : null)
    })

    // 士兵攻击敌人（被阻挡的敌人受士兵伤害）
    const allSoldiers = [...this.deployed, ...this.towers.flatMap(t => t.soldiers)]
    allSoldiers.forEach(s => s.update(dt, this.enemies, this.projectiles))

    // 被阻挡的敌人反击士兵
    this.enemies.forEach(e => {
      if (e.dead || e.reached || !e.target) return
      e.attackCd -= dt
      if (e.attackCd <= 0) {
        e.attackCd = 1.0
        // 找最近士兵攻击
        let best: Soldier | null = null
        let bd = 40
        for (const s of allSoldiers) {
          if (s.dead) continue
          const d = e.distanceTo(s.x, s.y)
          if (d < bd) { bd = d; best = s }
        }
        if (best) best.takeDamage(e.def.atk)
      }
    })

    // 塔射击
    this.towers.forEach(t => t.update(dt, this.enemies, this.projectiles, this.projKeys))

    // 战鼓buff衰减
    if (this.moraleBuff > 0) this.moraleBuff -= dt

    // 技能冷却
    let skillChanged = false
    for (const id of Object.keys(this.skillCds)) {
      if (this.skillCds[id] > 0) {
        this.skillCds[id] = Math.max(0, this.skillCds[id] - dt)
        skillChanged = true
      }
      this.cb.onSkillReady(id, this.skillCds[id] <= 0, this.skillCds[id])
    }

    // 波次进度
    const totalToSpawn = this.cfg.level.waves.reduce((s, w) => s + w.count, 0)
    const spawned = totalToSpawn - this.spawnQueue.length
    this.cb.onWave(Math.min(this.cfg.level.waves.length, Math.floor(spawned / Math.max(1, Math.ceil(totalToSpawn / this.cfg.level.waves.length))) + 1), this.cfg.level.waves.length)

    // 到达终点扣血
    this.enemies.forEach(e => {
      if (e.reached && !e.dead) {
        this.baseHp -= e.def.damage
        e.die()
        this.cb.onBaseHp(Math.max(0, this.baseHp), this.baseHpMax)
      }
    })

    // 清理死亡敌人，计金币
    const alive: Enemy[] = []
    this.enemies.forEach(e => {
      if (e.dead) {
        if (!e.reached) { this.kills++; this.grain += Math.floor(e.def.bounty * 0.5); this.cb.onGrain(this.grain) }
      } else alive.push(e)
    })
    this.enemies = alive
    ;(this as any).__ENEMIES__ = this.enemies

    // 部署士兵清理
    this.deployed = this.deployed.filter(s => !s.dead)
    this.cb.onCmd(this.deployed.length, this.cfg.cmd)

    // 胜负判定
    if (this.baseHp <= 0) { this.ended = true; this.cb.onEnd({ win: false, gold: Math.floor(this.cfg.level.reward / 5), kills: this.kills }) }
    else if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.ended = true
      this.cb.onEnd({ win: true, gold: this.cfg.level.reward + Math.floor(this.baseHp / this.baseHpMax * this.cfg.level.reward * 0.3), kills: this.kills })
    }
  }
}
