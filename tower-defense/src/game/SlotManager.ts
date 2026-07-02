// 塔位：自由放置模式 - 玩家可在任意空地建造防御塔
import Phaser from 'phaser'

export interface TowerSlot {
  x: number
  y: number
  occupied: boolean
  marker?: Phaser.GameObjects.Container
  free?: boolean  // 自由放置的塔位
}

export class SlotManager {
  slots: TowerSlot[] = []
  scene: Phaser.Scene
  pathPoints: { x: number; y: number }[] = []
  minDistFromPath = 32  // 距离路径最小距离（像素）
  w: number
  h: number

  constructor(scene: Phaser.Scene, path: any, w: number, h: number) {
    this.scene = scene
    this.w = w
    this.h = h
    // 记录路径点，用于检测放置位置是否离路径太近
    if (path && path.points) {
      this.pathPoints = path.points
    }
  }

  // 检测某个位置是否可建造：不在路径上、不与现有塔重叠、在屏幕内
  canBuildAt(x: number, y: number): boolean {
    // 屏幕边界
    if (x < 24 || x > this.w - 24 || y < 80 || y > this.h - 100) return false
    // 距离路径太近
    for (const p of this.pathPoints) {
      const dx = p.x - x, dy = p.y - y
      if (dx * dx + dy * dy < this.minDistFromPath * this.minDistFromPath) return false
    }
    // 距离已有塔太近
    for (const s of this.slots) {
      if (!s.occupied) continue
      const dx = s.x - x, dy = s.y - y
      if (dx * dx + dy * dy < 36 * 36) return false
    }
    return true
  }

  // 自由放置：创建一个临时塔位
  createFreeSlot(x: number, y: number): TowerSlot | null {
    if (!this.canBuildAt(x, y)) return null
    const slot: TowerSlot = { x, y, occupied: false, free: true }
    this.slots.push(slot)
    return slot
  }

  // 标记塔位被占用
  occupy(slot: TowerSlot) {
    slot.occupied = true
    if (slot.marker) slot.marker.destroy()
  }
}
