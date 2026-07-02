// 弹道：从塔射向敌人的飞行物
import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { Effects } from './Effects'
import { audio } from './audio'

export class Projectile {
  scene: Phaser.Scene
  img: Phaser.GameObjects.Image
  target: Enemy
  damage: number
  splash: number
  dead = false
  effects: Effects

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, splash: number, keys: Record<string, string>, effects: Effects) {
    this.scene = scene
    this.target = target
    this.damage = damage
    this.splash = splash
    this.effects = effects
    const isArrow = damage <= 40 && splash === 0
    const isBolt = damage > 40 && splash === 0
    const w = splash > 0 ? 22 : isBolt ? 26 : 18
    const h = splash > 0 ? 22 : isBolt ? 5 : 4
    this.img = scene.add.image(x, y, isArrow ? '__arrow__' : (keys.proj || 'archer')).setDisplaySize(w, h).setDepth(9999)
    if (isArrow) this.img.setTint(0xd4a437)
    this.fly()
  }

  private fly() {
    const t = this.target
    const tx = t.sprite.x, ty = t.sprite.y - 20
    const dist = Phaser.Math.Distance.Between(this.img.x, this.img.y, tx, ty)
    const speed = this.splash > 0 ? 340 : 620
    const dur = Math.max(60, dist / speed * 1000)
    const ang = Phaser.Math.Angle.Between(this.img.x, this.img.y, tx, ty)
    this.img.setRotation(ang)
    this.scene.tweens.add({
      targets: this.img, x: tx, y: ty,
      duration: dur, ease: this.splash > 0 ? 'Quad.in' : 'Linear',
      onUpdate: () => {
        const a = Phaser.Math.Angle.Between(this.img.x, this.img.y, tx, ty)
        this.img.setRotation(a)
      },
      onComplete: () => this.hit(),
    })
  }

  private hit() {
    if (this.dead) return
    this.dead = true
    const hx = this.img.x, hy = this.img.y
    if (this.target && !this.target.dead) {
      this.target.damage(this.damage)
      this.effects.damageNumber(hx, hy - 10, this.damage, this.damage > 80)
      if (this.splash > 0) {
        const all = (this.scene as any).__ENEMIES__ as Enemy[]
        if (all) {
          for (const e of all) {
            if (e === this.target || e.dead) continue
            const d = Phaser.Math.Distance.Between(this.target.sprite.x, this.target.sprite.y, e.sprite.x, e.sprite.y)
            if (d <= this.splash) { e.damage(this.damage * 0.6, 'fire'); this.effects.damageNumber(e.sprite.x, e.sprite.y - 30, this.damage * 0.6) }
          }
        }
        this.effects.hitBurst(hx, hy, 0xff6600)
        this.effects.shake(0.006, 100)
      } else {
        this.effects.hitBurst(hx, hy)
      }
      audio.hit()
    }
    this.img.destroy()
  }
}
