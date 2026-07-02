// 敌人实体：沿曲线移动的精灵，带行走/受击动画
import Phaser from 'phaser'
import { EnemyDef } from '../data/enemies'
import { PathManager } from './PathManager'

export class Enemy {
  scene: Phaser.Scene
  def: EnemyDef
  sprite: Phaser.GameObjects.Container
  img: Phaser.GameObjects.Image
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
  key: string

  constructor(scene: Phaser.Scene, def: EnemyDef, path: PathManager, key: string) {
    this.scene = scene
    this.def = def
    this.path = path
    this.key = key
    this.maxHp = def.hp
    this.hp = def.hp
    const p = path.start
    this.img = scene.add.image(0, 0, key).setDisplaySize(def.boss ? 64 : 48, def.boss ? 64 : 48)
    this.img.setOrigin(0.5, 0.85)
    this.sprite = scene.add.container(p.x, p.y, [this.img])
    this.sprite.setDepth(p.y)
    this.hpBar = scene.add.graphics()
    this.bobAnim()
  }

  private bobAnim() {
    // 行走呼吸动画（贴图上下浮动 + 轻微旋转）
    this.scene.tweens.add({
      targets: this.img,
      y: { from: -2, to: 2 },
      duration: 240 + Math.random() * 120,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    })
    this.scene.tweens.add({
      targets: this.img,
      angle: { from: -3, to: 3 },
      duration: 600 + Math.random() * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    })
  }

  // 沿路径前进 dt 秒，speedMul 全军速度倍率
  advance(dt: number) {
    if (this.dead || this.reached) return
    if (this.target) {
      // 被士兵阻挡，原地攻击
      this.attackCd -= dt
      if (this.attackCd <= 0) {
        this.attackCd = 1.0
        // 攻击目标由外部设置（士兵）
      }
      return
    }
    const dist = this.def.speed * this.slow * dt
    this.t += dist / this.path.pathLen
    if (this.t >= 1) { this.t = 1; this.reached = true; this.die(); return }
    const p = this.path.getPoint(this.t)
    this.sprite.setPosition(p.x, p.y)
    this.sprite.setDepth(p.y + 5)
    this.drawHpBar(p.x, p.y)
    if (this.burn > 0) {
      this.burn -= dt
      this.damage(8 * dt, 'fire')
    }
  }

  setTarget(t: { x: number; y: number } | null) { this.target = t }

  damage(amount: number, kind?: string) {
    if (this.dead) return
    const dmg = Math.max(1, amount - this.def.armor * (kind === 'fire' ? 0.3 : 1))
    this.hp -= dmg
    // 受击红闪
    this.img.setTint(0xff5555)
    this.scene.time.delayedCall(80, () => { if (!this.dead) this.img.clearTint() })
    if (this.hp <= 0) { this.hp = 0; this.die() }
  }

  private drawHpBar(x: number, y: number) {
    this.hpBar.clear()
    const w = this.def.boss ? 60 : 38
    const h = 4
    const bx = x - w / 2
    const by = y - (this.def.boss ? 70 : 54)
    this.hpBar.fillStyle(0x000000, 0.7).fillRect(bx - 1, by - 1, w + 2, h + 2)
    const ratio = this.hp / this.maxHp
    const color = ratio > 0.5 ? 0x4caf50 : ratio > 0.25 ? 0xffc107 : 0xf44336
    this.hpBar.fillStyle(color, 1).fillRect(bx, by, w * ratio, h)
  }

  die() {
    if (this.dead) return
    this.dead = true
    // 死亡淡出 + 缩放
    this.scene.tweens.add({
      targets: this.sprite, alpha: 0, scale: 0.3, angle: 90,
      duration: 280, onComplete: () => { this.sprite.destroy(); this.hpBar.destroy() },
    })
  }

  distanceTo(x: number, y: number): number {
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y)
  }
}
