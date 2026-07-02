// 敌人实体：沿曲线移动的 3D 风格精灵，行走/受击/死亡动画，带影子
import Phaser from 'phaser'
import { EnemyDef } from '../data/enemies'
import { PathManager } from './PathManager'
import { Effects } from './Effects'
import { audio } from './audio'

export class Enemy {
  scene: Phaser.Scene
  def: EnemyDef
  sprite: Phaser.GameObjects.Container
  img: Phaser.GameObjects.Image
  shadow: Phaser.GameObjects.Ellipse
  hpBar: Phaser.GameObjects.Graphics
  path: PathManager
  t = 0
  hp: number
  maxHp: number
  dead = false
  reached = false
  attackCd = 0
  target: { x: number; y: number } | null = null
  slow = 1
  burn = 0
  effects: Effects
  key: string

  constructor(scene: Phaser.Scene, def: EnemyDef, path: PathManager, key: string, effects: Effects) {
    this.scene = scene
    this.def = def
    this.path = path
    this.key = key
    this.effects = effects
    this.maxHp = def.hp
    this.hp = def.hp
    const p = path.start
    this.img = scene.add.image(0, 0, key).setDisplaySize(def.boss ? 68 : 50, def.boss ? 68 : 50).setOrigin(0.5, 0.85)
    this.img.setFlipX(true) // 敌人朝右行进
    this.shadow = scene.add.ellipse(p.x, p.y + 2, def.boss ? 40 : 30, def.boss ? 12 : 9, 0x000000, 0.32).setDepth(p.y + 4)
    this.sprite = scene.add.container(p.x, p.y, [this.img]).setDepth(p.y + 5)
    this.hpBar = scene.add.graphics()
    this.walkAnim()
    if (def.boss) audio.waveStart()
  }

  private walkAnim() {
    this.scene.tweens.add({
      targets: this.img, y: { from: -3, to: 3 },
      duration: 220 + Math.random() * 100, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    })
    this.scene.tweens.add({
      targets: this.img, angle: { from: -3, to: 3 },
      duration: 560 + Math.random() * 200, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    })
    this.scene.tweens.add({
      targets: this.shadow, scaleX: { from: 0.9, to: 1.1 }, alpha: { from: 0.25, to: 0.4 },
      duration: 220, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    })
  }

  advance(dt: number) {
    if (this.dead || this.reached) return
    if (this.target) { this.attackCd -= dt; return }
    const dist = this.def.speed * this.slow * dt
    this.t += dist / this.path.pathLen
    if (this.t >= 1) { this.t = 1; this.reached = true; this.die(); return }
    const p = this.path.getPoint(this.t)
    this.sprite.setPosition(p.x, p.y)
    this.shadow.setPosition(p.x, p.y + 2).setDepth(p.y + 4)
    this.sprite.setDepth(p.y + 5)
    this.drawHpBar(p.x, p.y)
    if (this.burn > 0) { this.burn -= dt; this.damage(8 * dt, 'fire') }
  }

  setTarget(t: { x: number; y: number } | null) { this.target = t }

  damage(amount: number, kind?: string) {
    if (this.dead) return
    const dmg = Math.max(1, amount - this.def.armor * (kind === 'fire' ? 0.3 : 1))
    this.hp -= dmg
    this.img.setTint(0xff5555)
    this.scene.time.delayedCall(80, () => { if (!this.dead) this.img.clearTint() })
    if (this.hp <= 0) { this.hp = 0; this.die() }
  }

  private drawHpBar(x: number, y: number) {
    this.hpBar.clear()
    const w = this.def.boss ? 64 : 40
    const h = 4
    const bx = x - w / 2
    const by = y - (this.def.boss ? 74 : 58)
    this.hpBar.fillStyle(0x000000, 0.7).fillRect(bx - 1, by - 1, w + 2, h + 2)
    const ratio = this.hp / this.maxHp
    const color = ratio > 0.5 ? 0x4caf50 : ratio > 0.25 ? 0xffc107 : 0xf44336
    this.hpBar.fillStyle(color, 1).fillRect(bx, by, w * ratio, h)
  }

  die() {
    if (this.dead) return
    this.dead = true
    this.effects.deathBurst(this.sprite.x, this.sprite.y, 0x8B0000)
    this.scene.tweens.add({
      targets: [this.sprite, this.shadow], alpha: 0, scale: 0.3, angle: 90,
      duration: 300, onComplete: () => { this.sprite.destroy(); this.hpBar.destroy(); this.shadow.destroy() },
    })
  }

  distanceTo(x: number, y: number): number {
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y)
  }
}
