// 防御塔实体：3 级升级，远程射击或兵营产兵，带特效与音效
import Phaser from 'phaser'
import { TowerDef, TowerTier } from '../data/towers'
import { UnitDef } from '../data/units'
import { Enemy } from './Enemy'
import { Projectile } from './Projectile'
import { Soldier } from './Soldier'
import { Effects } from './Effects'
import { audio } from './audio'

export class Tower {
  scene: Phaser.Scene
  def: TowerDef
  tierIdx: number
  x: number
  y: number
  img: Phaser.GameObjects.Image
  shadow: Phaser.GameObjects.Ellipse
  rangeGfx: Phaser.GameObjects.Graphics
  cd = 0
  soldiers: Soldier[] = []
  rallyPoint: Phaser.Math.Vector2
  effects: Effects
  projKeys: Record<string, string>

  constructor(scene: Phaser.Scene, def: TowerDef, x: number, y: number, unitDef: UnitDef | undefined, effects: Effects, projKeys: Record<string, string>) {
    this.scene = scene
    this.def = def
    this.tierIdx = 0
    this.x = x
    this.y = y
    this.effects = effects
    this.projKeys = projKeys
    this.img = scene.add.image(x, y, this.assetKey()).setDisplaySize(this.tier().cost > 300 ? 84 : 72, this.tier().cost > 300 ? 84 : 72).setOrigin(0.5, 0.85).setDepth(y + 8)
    this.shadow = scene.add.ellipse(x, y + 4, 50, 14, 0x000000, 0.35).setDepth(y + 7)
    this.rangeGfx = scene.add.graphics()
    this.rallyPoint = new Phaser.Math.Vector2(x, y + 50)
    // 建造动画 + 尘土
    this.img.setScale(0)
    scene.tweens.add({ targets: this.img, scaleY: 1, scaleX: 1, duration: 360, ease: 'Back.out' })
    this.effects.buildPuff(x, y)
    if (def.kind === 'barracks' && unitDef) {
      for (let i = 0; i < (this.tier().soldierMax || 3); i++) {
        const s = new Soldier(scene, unitDef, x + (i - 1) * 24, y + 40, this.rallyPoint, effects)
        this.soldiers.push(s)
      }
    }
    // 设置可点击升级
    this.img.setInteractive({ useHandCursor: true })
    this.img.on('pointerdown', () => { (scene as any).__SELECT_TOWER__?.(this) })
  }

  tier(): TowerTier { return this.def.tiers[this.tierIdx] }
  assetKey(): string { return `${this.def.kind}${this.tierIdx + 1}` }

  canUpgrade(): boolean { return this.tierIdx < 2 }

  upgradeCost(): number { return this.canUpgrade() ? this.def.tiers[this.tierIdx + 1].cost : 0 }

  upgrade(unitDef: UnitDef | undefined): boolean {
    if (!this.canUpgrade()) return false
    this.tierIdx++
    this.img.setTexture(this.assetKey())
    this.img.setDisplaySize(this.tier().cost > 300 ? 84 : 72, this.tier().cost > 300 ? 84 : 72)
    this.scene.tweens.add({ targets: this.img, scaleY: 1.15, scaleX: 1.15, duration: 120, yoyo: true })
    this.effects.buildPuff(this.x, this.y)
    audio.build()
    // 兵营：补满士兵到新上限
    if (this.def.kind === 'barracks' && unitDef) {
      const max = this.tier().soldierMax || 3
      while (this.soldiers.length < max) {
        const s = new Soldier(this.scene, unitDef, this.x + (this.soldiers.length - 1) * 24, this.y + 40, this.rallyPoint, this.effects)
        s.spawnEffect()
        this.soldiers.push(s)
      }
    }
    return true
  }

  showRange(show: boolean) {
    this.rangeGfx.clear()
    if (show && this.tier().range > 0) {
      this.rangeGfx.lineStyle(2, 0xd4a437, 0.7)
      this.rangeGfx.fillStyle(0xd4a437, 0.08)
      this.rangeGfx.strokeCircle(this.x, this.y - 20, this.tier().range)
      this.rangeGfx.fillCircle(this.x, this.y - 20, this.tier().range)
    }
  }

  update(dt: number, enemies: Enemy[], projectiles: Projectile[], unitDef: UnitDef | undefined) {
    if (this.def.kind === 'barracks') {
      this.soldiers = this.soldiers.filter(s => !s.dead)
      const max = this.tier().soldierMax || 3
      if (this.soldiers.length < max && unitDef) {
        const s = new Soldier(this.scene, unitDef, this.x + (this.soldiers.length - 1) * 24, this.y + 40, this.rallyPoint, this.effects)
        s.spawnEffect()
        this.soldiers.push(s)
      }
      return
    }
    const tier = this.tier()
    this.cd -= dt
    if (this.cd > 0) return
    let target: Enemy | null = null
    let bestT = -1
    for (const e of enemies) {
      if (e.dead) continue
      const d = Phaser.Math.Distance.Between(this.x, this.y - 20, e.sprite.x, e.sprite.y)
      if (d <= tier.range) {
        if (e.t > bestT) { bestT = e.t; target = e }
      }
    }
    if (target) {
      this.cd = 1 / tier.fireRate
      projectiles.push(new Projectile(this.scene, this.x, this.y - 30, target, tier.damage, tier.splash || 0, this.projKeys, this.effects))
      // 音效
      if (this.def.kind === 'archer') audio.shoot()
      else if (this.def.kind === 'ballista') audio.bolt()
      else audio.catapult()
      // 塔身反冲
      this.scene.tweens.add({ targets: this.img, scaleY: 0.92, duration: 60, yoyo: true })
    }
  }

  destroy() {
    this.img.destroy(); this.shadow.destroy(); this.rangeGfx.destroy()
    this.soldiers.forEach(s => s.destroy())
  }
}
