// 蜿蜒曲线路径管理器：敌人沿曲线行进，非直线
import Phaser from 'phaser'

export class PathManager {
  scene: Phaser.Scene
  curve: Phaser.Curves.Spline
  graphics: Phaser.GameObjects.Graphics
  pathLen: number
  points: Phaser.Math.Vector2[]

  constructor(scene: Phaser.Scene, w: number, h: number) {
    this.scene = scene
    // 蜿蜒路径关键点：从左上敌方营地曲折下行到右下我方城堡
    this.points = this.buildWinding(w, h)
    this.curve = new Phaser.Curves.Spline(this.points)
    this.graphics = scene.add.graphics()
    this.pathLen = this.curve.getLength()
    this.drawPath()
  }

  private buildWinding(w: number, h: number): Phaser.Math.Vector2[] {
    // 9 个控制点形成 S 型蜿蜒路径
    return [
      new Phaser.Math.Vector2(w * 0.05, h * 0.18),
      new Phaser.Math.Vector2(w * 0.28, h * 0.12),
      new Phaser.Math.Vector2(w * 0.42, h * 0.32),
      new Phaser.Math.Vector2(w * 0.22, h * 0.52),
      new Phaser.Math.Vector2(w * 0.55, h * 0.62),
      new Phaser.Math.Vector2(w * 0.78, h * 0.50),
      new Phaser.Math.Vector2(w * 0.70, h * 0.78),
      new Phaser.Math.Vector2(w * 0.92, h * 0.84),
    ]
  }

  private drawPath() {
    const g = this.graphics
    g.clear()
    // 路径阴影底（深色加宽）
    g.lineStyle(34, 0x3a2818, 0.55)
    this.curve.draw(g, 64)
    // 路径主体（泥土色）
    g.lineStyle(26, 0x8a6a3a, 0.95)
    this.curve.draw(g, 64)
    // 路径中线高光
    g.lineStyle(4, 0xc8a868, 0.5)
    this.curve.draw(g, 64)
  }

  // t: 0..1，返回路径上点
  getPoint(t: number, out?: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    return this.curve.getPoint(t, out)
  }

  // 起点与终点
  get start() { return this.points[0] }
  get end() { return this.points[this.points.length - 1] }
}
