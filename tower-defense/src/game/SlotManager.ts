// 塔位：散布在路径两侧的可建造点
import Phaser from 'phaser'
import { PathManager } from './PathManager'

export interface TowerSlot {
  x: number
  y: number
  occupied: boolean
  marker?: Phaser.GameObjects.Container
}

export class SlotManager {
  slots: TowerSlot[] = []

  constructor(scene: Phaser.Scene, path: PathManager, w: number, h: number) {
    // 路径两侧预设塔位
    const raw: [number, number][] = [
      [0.18, 0.30], [0.34, 0.22], [0.50, 0.22],
      [0.14, 0.45], [0.36, 0.42], [0.62, 0.40],
      [0.30, 0.65], [0.48, 0.74], [0.66, 0.66],
      [0.82, 0.62], [0.78, 0.86], [0.60, 0.88],
    ]
    raw.forEach(([rx, ry]) => {
      this.slots.push({ x: w * rx, y: h * ry, occupied: false })
    })
  }
}
