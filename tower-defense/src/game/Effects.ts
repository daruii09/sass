// 特效系统：粒子、伤害数字、震屏、建造尘、命中爆点、死亡消散
import Phaser from 'phaser'
import { audio } from './audio'

export class Effects {
  scene: Phaser.Scene
  constructor(scene: Phaser.Scene) { this.scene = scene }

  // 命中粒子爆点
  hitBurst(x: number, y: number, color = 0xffcc44) {
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.circle(x, y, 3, color, 1).setDepth(9999)
      const ang = (Math.PI * 2 * i) / 6 + Math.random()
      const dist = 12 + Math.random() * 10
      this.scene.tweens.add({
        targets: p, x: x + Math.cos(ang) * dist, y: y + Math.sin(ang) * dist,
        alpha: 0, scale: 0.2, duration: 220, ease: 'Quad.out',
        onComplete: () => p.destroy(),
      })
    }
    const flash = this.scene.add.circle(x, y, 8, 0xffffff, 0.8).setDepth(9999)
    this.scene.tweens.add({ targets: flash, scale: 3, alpha: 0, duration: 160, onComplete: () => flash.destroy() })
  }

  // 浮动伤害数字
  damageNumber(x: number, y: number, dmg: number, crit = false) {
    const txt = this.scene.add.text(x, y, Math.round(dmg).toString(), {
      fontFamily: 'Cinzel', fontSize: crit ? '20px' : '15px',
      color: crit ? '#FF4444' : '#FFDD66', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10000)
    this.scene.tweens.add({
      targets: txt, y: y - 28, alpha: 0, scale: crit ? 1.4 : 1,
      duration: 600, ease: 'Back.out',
      onComplete: () => txt.destroy(),
    })
  }

  // 浮动文字（战利品/提示）
  floatText(x: number, y: number, text: string, color = '#FFDD66', size = '14px') {
    const txt = this.scene.add.text(x, y, text, {
      fontFamily: 'ZCOOL XiaoWei', fontSize: size, color,
      stroke: '#000000', strokeThickness: 3, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10001)
    this.scene.tweens.add({
      targets: txt, y: y - 40, alpha: 0, scale: 1.2,
      duration: 1100, ease: 'Back.out',
      onComplete: () => txt.destroy(),
    })
  }

  // 死亡消散粒子
  deathBurst(x: number, y: number, color = 0x8B0000) {
    for (let i = 0; i < 14; i++) {
      const p = this.scene.add.circle(x, y - 20, 3 + Math.random() * 3, color, 0.9).setDepth(9999)
      const ang = Math.random() * Math.PI * 2
      const dist = 20 + Math.random() * 30
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(ang) * dist, y: y - 20 + Math.sin(ang) * dist - 20,
        alpha: 0, scale: 0, duration: 480 + Math.random() * 200, ease: 'Quad.out',
        onComplete: () => p.destroy(),
      })
    }
    audio.kill()
  }

  // 建造尘土
  buildPuff(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const p = this.scene.add.circle(x + (Math.random() - 0.5) * 30, y, 4, 0xc8a868, 0.6).setDepth(9999)
      this.scene.tweens.add({
        targets: p, y: y - 20 - Math.random() * 20, x: x + (Math.random() - 0.5) * 50,
        alpha: 0, scale: 0.3, duration: 500, onComplete: () => p.destroy(),
      })
    }
    audio.build()
  }

  // 部署光环
  deployRing(x: number, y: number) {
    const ring = this.scene.add.circle(x, y, 6, 0xd4a437, 0.6).setStrokeStyle(3, 0xF5E6A8, 0.9).setDepth(9999)
    this.scene.tweens.add({ targets: ring, scale: 6, alpha: 0, duration: 500, onComplete: () => ring.destroy() })
  }

  // 屏幕震动
  shake(intensity = 0.01, duration = 120) {
    this.scene.cameras.main.shake(duration, intensity)
  }

  // 技能释放光效
  skillFlash(color = 0xd4a437) {
    const flash = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, color, 0.3).setOrigin(0).setDepth(9998)
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() })
  }

  // 火矢齐射：全屏火箭雨
  fireRain() {
    const w = this.scene.scale.width
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w
      const arrow = this.scene.add.triangle(x, -20, 0, -8, 4, 8, -4, 8, 0xff6600).setDepth(9999)
      this.scene.tweens.add({
        targets: arrow, y: this.scene.scale.height + 20, angle: 180,
        duration: 600 + Math.random() * 300, delay: i * 30,
        onComplete: () => arrow.destroy(),
      })
    }
  }
}
