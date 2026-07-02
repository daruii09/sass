// 防御塔实体：远程射击或兵营产兵
import Phaser from 'phaser'
import { TowerDef } from '../data/towers'
import { UnitDef } from '../data/units'
import { Enemy } from './Enemy'
import { Projectile } from './Projectile'
import { Soldier } from './Soldier'

export class Tower {
  scene: Phaser.Scene
  def: TowerDef
  x: number
  y: number
  img: Phaser.GameObjects.Image
  rangeGfx: Phaser.GameObjects.Graphics
  cd = 0
  soldiers: Soldier[] = []
  rallyPoint: Phaser.Math.Vector2
  enemyKeys: { img: string; } // 用于产兵

  constructor(scene: Phaser.Scene, def: TowerDef, x: number, y: number, unitDef: UnitDef | undefined) {
    this.scene = scene
    this.def = def
    this.x = x
    this.y = y
    this.img = scene.add.image(x, y, def.kind).setDisplaySize(72, 72).setOrigin(0.5, 0.85).setDepth(y + 8)
    this.rangeGfx = scene.add.graphics()
    this.rallyPoint = new Phaser.Math.Vector2(x, y + 50)
    this.enemyKeys = { img: '' }
    // 建造弹跳动画
    this.img.setScale(0)
    scene.tweens.add({ targets: this.img, scaleY: 1, scaleX: 1, duration: 320, ease: 'Back.out' })
    if (def.kind === 'barracks' && unitDef) {
      for (let i = 0; i < (def.soldierMax || 3); i++) {
        const s = new Soldier(scene, unitDef, x + (i - 1) * 24, y + 40, this.rallyPoint)
        this.soldiers.push(s)
      }
    }
  }

  showRange(show: boolean) {
    this.rangeGfx.clear()
    if (show && this.def.range > 0) {
      this.rangeGfx.lineStyle(2, 0xd4a437, 0.7)
      this.rangeGfx.fillStyle(0xd4a437, 0.08)
      this.rangeGfx.strokeCircle(this.x, this.y - 20, this.def.range)
      this.rangeGfx.fillCircle(this.x, this.y - 20, this.def.range)
    }
  }

  update(dt: number, enemies: Enemy[], projectiles: Projectile[], unitKeys: Record<string, string>) {
    if (this.def.kind === 'barracks') {
      // 兵营：维持士兵数量
      this.soldiers = this.soldiers.filter(s => !s.dead)
      const max = this.def.soldierMax || 3
      if (this.soldiers.length < max) {
        // 复活士兵
        const unitDef = (window as any).__UNIT_LOOKUP__?.(this.def.soldierId)
        if (unitDef) {
          const s = new Soldier(this.scene, unitDef, this.x + (this.soldiers.length - 1) * 24, this.y + 40, this.rallyPoint)
          s.spawnEffect()
          this.soldiers.push(s)
        }
      }
      return
    }
    // 远程塔：寻找范围内最近敌人射击
    this.cd -= dt
    if (this.cd > 0) return
    let target: Enemy | null = null
    let bestT = -1
    for (const e of enemies) {
      if (e.dead) continue
      const d = Phaser.Math.Distance.Between(this.x, this.y - 20, e.sprite.x, e.sprite.y)
      if (d <= this.def.range) {
        // 优先攻击路径上靠前的敌人(进度大)
        if (e.t > bestT) { bestT = e.t; target = e }
      }
    }
    if (target) {
      this.cd = 1 / this.def.fireRate
      projectiles.push(new Projectile(this.scene, this.x, this.y - 30, target, this.def.damage, this.def.splash || 0, unitKeys))
      // 塔身反冲动画
      this.scene.tweens.add({ targets: this.img, scaleY: 0.92, duration: 60, yoyo: true })
    }
  }

  destroy() {
    this.img.destroy()
    this.rangeGfx.destroy()
    this.soldiers.forEach(s => s.destroy())
  }
}
