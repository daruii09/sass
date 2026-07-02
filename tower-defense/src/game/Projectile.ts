// 弹道：从塔射向敌人的飞行物
import Phaser from 'phaser'
import { Enemy } from './Enemy'

export class Projectile {
  scene: Phaser.Scene
  img: Phaser.GameObjects.Image
  target: Enemy
  damage: number
  splash: number
  dead = false

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, splash: number, keys: Record<string, string>) {
    this.scene = scene
    this.target = target
    this.damage = damage
    this.splash = splash
    const kind = splash > 0 ? 'catapult' : damage > 50 ? 'ballista' : 'archer'
    this.img = scene.add.image(x, y, keys.proj || kind).setDisplaySize(splash > 0 ? 20 : damage > 50 ? 22 : 14, splash > 0 ? 20 : 4).setDepth(9999)
    this.fly()
  }

  private fly() {
    const t = this.target
    const tx = t.sprite.x, ty = t.sprite.y - 20
    const dist = Phaser.Math.Distance.Between(this.img.x, this.img.y, tx, ty)
    const speed = this.splash > 0 ? 320 : 560
    const dur = Math.max(60, dist / speed * 1000)
    this.scene.tweens.add({
      targets: this.img, x: tx, y: ty,
      duration: dur, ease: this.splash > 0 ? 'Quad.in' : 'Linear',
      onUpdate: () => {
        const ang = Phaser.Math.Angle.Between(this.img.x, this.img.y, tx, ty)
        this.img.setRotation(ang)
      },
      onComplete: () => this.hit(),
    })
  }

  private hit() {
    if (this.dead) return
    this.dead = true
    if (this.target && !this.target.dead) {
      this.target.damage(this.damage)
      if (this.splash > 0) {
        // 溅射
        const all = (this.scene as any).__ENEMIES__ as Enemy[]
        if (all) {
          for (const e of all) {
            if (e === this.target || e.dead) continue
            const d = Phaser.Math.Distance.Between(this.target.sprite.x, this.target.sprite.y, e.sprite.x, e.sprite.y)
            if (d <= this.splash) e.damage(this.damage * 0.6, 'fire')
          }
        }
        this.burst()
      }
    }
    this.img.destroy()
  }

  private burst() {
    const ring = this.scene.add.circle(this.img.x, this.img.y, 6, 0xff8800, 0.7).setDepth(9999)
    this.scene.tweens.add({ targets: ring, scale: 8, alpha: 0, duration: 280, onComplete: () => ring.destroy() })
  }
}
