// 士兵实体：3D 风格精灵，行走/攻击/受击动画，带影子，集成特效与音效
import Phaser from 'phaser'
import { UnitDef } from '../data/units'
import { Enemy } from './Enemy'
import { Effects } from './Effects'
import { audio } from './audio'

export class Soldier {
  scene: Phaser.Scene
  def: UnitDef
  container: Phaser.GameObjects.Container
  img: Phaser.GameObjects.Image
  shadow: Phaser.GameObjects.Ellipse
  hpBar: Phaser.GameObjects.Graphics
  hp: number
  maxHp: number
  dead = false
  attackCd = 0
  target: Enemy | null = null
  rally: { x: number; y: number }
  x: number
  y: number
  effects: Effects
  key: string = ''

  constructor(scene: Phaser.Scene, def: UnitDef, x: number, y: number, rally: { x: number; y: number }, effects: Effects) {
    this.scene = scene
    this.def = def
    this.x = x; this.y = y
    this.rally = rally
    this.maxHp = def.hp
    this.hp = def.hp
    this.effects = effects
    this.img = scene.add.image(0, 0, def.id).setDisplaySize(48, 48).setOrigin(0.5, 0.85)
    this.shadow = scene.add.ellipse(x, y + 2, 28, 8, 0x000000, 0.3).setDepth(y + 5)
    this.container = scene.add.container(x, y, [this.img]).setDepth(y + 6)
    this.hpBar = scene.add.graphics()
    this.walkAnim()
  }

  spawnEffect() {
    this.container.setAlpha(0).setScale(0.3)
    this.scene.tweens.add({ targets: this.container, alpha: 1, scale: 1, duration: 400, ease: 'Back.out' })
    this.effects.deployRing(this.x, this.y)
  }

  // 走动动画：上下浮动 + 轻微倾斜 + 影子呼吸（模拟脚步）
  private walkAnim() {
    this.scene.tweens.add({
      targets: this.img, y: { from: -3, to: 3 },
      duration: 200 + Math.random() * 80, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    })
    this.scene.tweens.add({
      targets: this.img, angle: { from: -4, to: 4 },
      duration: 360 + Math.random() * 120, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    })
    this.scene.tweens.add({
      targets: this.shadow, scaleX: { from: 0.9, to: 1.1 }, alpha: { from: 0.25, to: 0.4 },
      duration: 200, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    })
  }

  update(dt: number, enemies: Enemy[]) {
    if (this.dead) return
    if (!this.target || this.target.dead) this.target = this.findEnemy(enemies)
    if (this.target) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, this.target.sprite.x, this.target.sprite.y)
      if (d <= this.def.range) {
        this.attackCd -= dt
        if (this.attackCd <= 0) {
          this.attackCd = this.def.atkSpeed
          this.attack(this.target)
        }
      } else {
        this.moveToward(this.target.sprite.x, this.target.sprite.y, dt)
      }
    } else {
      const dr = Phaser.Math.Distance.Between(this.x, this.y, this.rally.x, this.rally.y)
      if (dr > 6) this.moveToward(this.rally.x, this.rally.y, dt)
    }
    this.shadow.setPosition(this.x, this.y + 2).setDepth(this.y + 5)
    this.container.setDepth(this.y + 6)
    this.drawHpBar()
  }

  private moveToward(tx: number, ty: number, dt: number) {
    const ang = Math.atan2(ty - this.y, tx - this.x)
    const sp = this.def.speed * dt
    this.x += Math.cos(ang) * sp
    this.y += Math.sin(ang) * sp
    this.container.setPosition(this.x, this.y)
    this.img.setFlipX(tx < this.x)
  }

  private attack(e: Enemy) {
    // 攻击挥砍动画
    this.scene.tweens.add({ targets: this.img, angle: 22, duration: 70, yoyo: true })
    if (this.def.type === 'ranged' || this.def.type === 'siege') {
      const proj = this.scene.add.image(this.x, this.y - 20, '__arrow__').setDisplaySize(20, 6).setTint(0xd4a437).setDepth(9999)
      const tx = e.sprite.x, ty = e.sprite.y - 20
      const ang = Phaser.Math.Angle.Between(this.x, this.y - 20, tx, ty)
      proj.setRotation(ang)
      audio.shoot()
      this.scene.tweens.add({
        targets: proj, x: tx, y: ty, duration: 160,
        onComplete: () => {
          proj.destroy()
          e.damage(this.def.atk)
          this.effects.hitBurst(tx, ty)
          this.effects.damageNumber(tx, ty - 10, this.def.atk)
          audio.hit()
        },
      })
    } else {
      e.damage(this.def.atk)
      this.effects.hitBurst(e.sprite.x, e.sprite.y - 20)
      this.effects.damageNumber(e.sprite.x, e.sprite.y - 30, this.def.atk)
      audio.hit()
    }
  }

  private findEnemy(enemies: Enemy[]): Enemy | null {
    let best: Enemy | null = null
    let bestD = this.def.range + 40
    for (const e of enemies) {
      if (e.dead) continue
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.sprite.x, e.sprite.y)
      if (d < bestD) { bestD = d; best = e }
    }
    return best
  }

  takeDamage(amount: number) {
    if (this.dead) return
    this.hp -= amount
    this.img.setTint(0xff5555)
    this.scene.time.delayedCall(80, () => { if (!this.dead) this.img.clearTint() })
    if (this.hp <= 0) { this.hp = 0; this.die() }
  }

  private drawHpBar() {
    this.hpBar.clear()
    const w = 34, h = 3
    const bx = this.x - w / 2, by = this.y - 52
    this.hpBar.fillStyle(0x000000, 0.7).fillRect(bx - 1, by - 1, w + 2, h + 2)
    const ratio = this.hp / this.maxHp
    this.hpBar.fillStyle(ratio > 0.5 ? 0x4caf50 : 0xf44336, 1).fillRect(bx, by, w * ratio, h)
  }

  die() {
    if (this.dead) return
    this.dead = true
    this.effects.deathBurst(this.x, this.y, 0x2e7d5b)
    this.scene.tweens.add({
      targets: [this.container, this.shadow], alpha: 0, scale: 0.4, angle: 70,
      duration: 260, onComplete: () => { this.container.destroy(); this.hpBar.destroy(); this.shadow.destroy() },
    })
  }

  destroy() { this.container.destroy(); this.hpBar.destroy(); this.shadow.destroy() }
}
