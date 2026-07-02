// Phaser 游戏实例工厂
import Phaser from 'phaser'
import { BattleScene, BattleConfig, BattleCallbacks } from './BattleScene'

export function createGame(parent: HTMLElement, cfg: BattleConfig, cb: BattleCallbacks): Phaser.Game {
  const scene = new BattleScene()
  // 直接挂载配置，init 时读取
  ;(scene as any).__pendingCfg = cfg
  ;(scene as any).__pendingCb = cb
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 420,
    height: 640,
    backgroundColor: '#1a1a2e',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, pixelArt: false },
    scene: [scene],
  })
}

export type { BattleConfig, BattleCallbacks, BattleResult } from './BattleScene'
