// 士兵实体：玩家部署/兵营生产，阻挡并攻击敌人
import Phaser from 'phaser'
import { UnitDef } from '../data/units'
import { Enemy } from './Enemy'

export class Soldier {
  scene: Phaser.Scene
  def: UnitDef
  container: Phaser.GameObjects.Container
  img: Phaser.GameObjects.Image
  hpBar: Phaser.GameObjects.Graphics
  hp: number
  maxHp: number
  dead = false
  attackCd = 0
  target: Enemy | null = null
  rally: { x: number; y: number }
  x: number
  y: number
  moving = false
  key: string = ''

  constructor(scene: Phaser.Scene, def: UnitDef, x: number, y: number, rally: { x: number; y: number }) {
    this.scene = scene
    this.def = def
    this.x = x; this.y = y
    this.rally = rally
    this.maxHp = def.hp
    this.hp = def.hp
    this.img = scene.add.image(0, 0, def.id).setDisplaySize(46, 46).setOrigin(0.5, 0.85)
    this.container = scene.add.container(x, y, [this.img]).setDepth(y + 6)
    this.hpBar = scene.add.graphics()
    this.bobAnim()
  }

  spawnEffect() {
    this.container.setAlpha(0).setScale(0.3)
    this.scene.tweens.add({ targets: this.container, alpha: 1, scale: 1, duration: 400, ease: 'Back.out' })
  }

  private bobAnim() {
    this.scene.tweens.add({
      targets: this.img, y: { from: -2, to: 2 },
      duration: 220 + Math.random() * 100, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    })
  }

  update(dt: number, enemies: Enemy[], _projectiles: unknown) {
    if (this.dead) return
    // 寻敌
    if (!this.target || this.target.dead) {
      this.target = this.findEnemy(enemies)
    }
    if (this.target) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, this.target.sprite.x, this.target.sprite.y)
      if (d <= this.def.range) {
        this.attackCd -= dt
        if (this.attackCd <= 0) {
          this.attackCd = this.def.atkSpeed
          this.attack(this.target)
        }
      } else {
        // 向敌人移动
        this.moveToward(this.target.sprite.x, this.target.sprite.y, dt)
      }
    } else {
      // 回集结点
      const dr = Phaser.Math.Distance.Between(this.x, this.y, this.rally.x, this.rally.y)
      if (dr > 6) this.moveToward(this.rally.x, this.rally.y, dt)
    }
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
    this.scene.tweens.add({ targets: this.img, angle: 18, duration: 80, yoyo: true })
    if (this.def.type === 'ranged' || this.def.type === 'siege') {
      // 远程：发射箭矢（简化为直接伤害 + 视觉弹道）
      const proj = this.scene.add.image(this.x, this.y - 20, '__arrow__').setDisplaySize(18, 6).setTint(0xd4a437)
      this.scene.tweens.add({
        targets: proj, x: e.sprite.x, y: e.sprite.y - 20,
        duration: 180, onComplete: () => { proj.destroy(); e.damage(this.def.atk) },
      })
    } else {
      e.damage(this.def.atk)
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
    this.scene.tweens.add({
      targets: this.container, alpha: 0, scale: 0.4, angle: 70,
      duration: 240, onComplete: () => { this.container.destroy(); this.hpBar.destroy() },
    })
  }

  destroy() {
    this.container.destroy()
    this.hpBar.destroy()
  }
}
