// 程序化 Q 版（chibi）美术素材生成器
// 当 AI 图片加载失败时，用 Phaser Graphics 绘制可爱的 Q 版角色/塔/建筑作为回退
// 既修复"素材不显示"问题，又统一为 Q 版可爱风格
import Phaser from 'phaser'

const SKIN = 0xf2c9a0
const OUTLINE = 0x2a2030

interface Palette { body: number; trim: number; hair: number; accent: number }

// 绘制单个 Q 版小人（大头小身），返回 graphics 供 generateTexture 使用
function drawChibi(g: Phaser.GameObjects.Graphics, p: Palette, weapon: 'sword' | 'spear' | 'bow' | 'club' | 'axe' | 'none' = 'none', enemy = false) {
  const w = 64, h = 64
  // 影子
  g.fillStyle(0x000000, 0.25); g.fillEllipse(w / 2, h - 6, 30, 8)
  // 身体（圆角矩形，小身板）
  g.fillStyle(p.body); g.fillRoundedRect(w / 2 - 11, h / 2 - 2, 22, 20, 6)
  g.lineStyle(2, OUTLINE, 0.6); g.strokeRoundedRect(w / 2 - 11, h / 2 - 2, 22, 20, 6)
  // 腰带/点缀
  g.fillStyle(p.trim); g.fillRect(w / 2 - 11, h / 2 + 6, 22, 4)
  // 头（大圆，Q 版比例）
  g.fillStyle(SKIN); g.fillCircle(w / 2, h / 2 - 12, 13)
  g.lineStyle(2, OUTLINE, 0.5); g.strokeCircle(w / 2, h / 2 - 12, 13)
  // 头发/头盔
  g.fillStyle(p.hair); g.fillCircle(w / 2, h / 2 - 16, 13)
  g.fillRect(w / 2 - 13, h / 2 - 16, 26, 6) // 齐刘海
  // 眼睛
  g.fillStyle(enemy ? 0xc0392b : 0x222222)
  g.fillCircle(w / 2 - 5, h / 2 - 11, 2.2); g.fillCircle(w / 2 + 5, h / 2 - 11, 2.2)
  // 眼睛高光
  g.fillStyle(0xffffff); g.fillCircle(w / 2 - 4.5, h / 2 - 11.5, 0.8); g.fillCircle(w / 2 + 5.5, h / 2 - 11.5, 0.8)
  // 腮红（Q 版标志）
  g.fillStyle(enemy ? 0xff6666 : 0xff9999, 0.5)
  g.fillCircle(w / 2 - 8, h / 2 - 8, 2); g.fillCircle(w / 2 + 8, h / 2 - 8, 2)
  // 嘴
  g.lineStyle(1.5, enemy ? 0x8b0000 : 0x6b4423, 0.8)
  if (enemy) g.beginPath(); g.arc(w / 2, h / 2 - 7, 2.5, 0.2, Math.PI - 0.2); g.strokePath()
  // 武器
  g.lineStyle(3, 0x8b6914, 1)
  if (weapon === 'sword') { g.lineBetween(w / 2 + 14, h / 2 - 8, w / 2 + 18, h / 2 + 12); g.lineStyle(2, 0xd4a437); g.lineBetween(w / 2 + 12, h / 2 - 6, w / 2 + 16, h / 2 - 2) }
  else if (weapon === 'spear') { g.lineBetween(w / 2 + 14, h / 2 - 14, w / 2 + 16, h / 2 + 16); g.fillStyle(p.accent); g.fillTriangle(w / 2 + 14, h / 2 - 16, w / 2 + 18, h / 2 - 16, w / 2 + 16, h / 2 - 22) }
  else if (weapon === 'bow') { g.lineStyle(2, 0x8b6914); g.arc(w / 2 + 16, h / 2, 10, -1.2, 1.2, false); g.lineStyle(1, 0xffffff, 0.8); g.lineBetween(w / 2 + 16, h / 2 - 9, w / 2 + 16, h / 2 + 9) }
  else if (weapon === 'club') { g.fillStyle(0x6b4423); g.fillCircle(w / 2 + 17, h / 2 + 2, 5); g.lineStyle(3, 0x8b6914); g.lineBetween(w / 2 + 14, h / 2 + 6, w / 2 + 17, h / 2 + 2) }
  else if (weapon === 'axe') { g.fillStyle(0x999999); g.fillTriangle(w / 2 + 16, h / 2 - 4, w / 2 + 22, h / 2 - 2, w / 2 + 16, h / 2 + 4); g.lineStyle(3, 0x8b6914); g.lineBetween(w / 2 + 16, h / 2 - 8, w / 2 + 16, h / 2 + 14) }
}

// 绘制 Q 版防御塔
function drawTower(g: Phaser.GameObjects.Graphics, kind: string, tier: number) {
  const w = 64, h = 64
  const tierColors = [
    { base: 0x8b6914, roof: 0xc0392b, flag: 0xd4a437 },
    { base: 0x6b5b34, roof: 0xa93226, flag: 0xf5e6a8 },
    { base: 0x4a3b2a, roof: 0x8b0000, flag: 0xffd700 },
  ][tier] || { base: 0x8b6914, roof: 0xc0392b, flag: 0xd4a437 }
  // 影子
  g.fillStyle(0x000000, 0.25); g.fillEllipse(w / 2, h - 5, 38, 9)
  // 塔基（石座）
  g.fillStyle(0x6b6b6b); g.fillRoundedRect(w / 2 - 18, h - 18, 36, 14, 4)
  g.lineStyle(2, OUTLINE, 0.5); g.strokeRoundedRect(w / 2 - 18, h - 18, 36, 14, 4)
  // 塔身（随等级变高变宽）
  const tw = 22 + tier * 4
  const th = 26 + tier * 6
  g.fillStyle(tierColors.base); g.fillRoundedRect(w / 2 - tw / 2, h - 18 - th, tw, th, 5)
  g.lineStyle(2, OUTLINE, 0.5); g.strokeRoundedRect(w / 2 - tw / 2, h - 18 - th, tw, th, 5)
  // 窗/箭孔
  g.fillStyle(0x1a1a2e)
  for (let i = 0; i < tier + 1; i++) g.fillRect(w / 2 - 3, h - 22 - th + 6 + i * 7, 6, 4)
  // 屋顶（翘檐）
  g.fillStyle(tierColors.roof)
  const ry = h - 18 - th
  g.beginPath()
  g.moveTo(w / 2 - tw / 2 - 6, ry)
  g.lineTo(w / 2, ry - 10 - tier * 3)
  g.lineTo(w / 2 + tw / 2 + 6, ry)
  g.closePath(); g.fillPath()
  g.lineStyle(2, OUTLINE, 0.5); g.strokePath()
  // 旗杆 + 旗
  g.lineStyle(2, 0x8b6914); g.lineBetween(w / 2, ry - 10 - tier * 3, w / 2, ry - 22 - tier * 3)
  g.fillStyle(tierColors.flag)
  g.fillTriangle(w / 2, ry - 20 - tier * 3, w / 2 + 12, ry - 17 - tier * 3, w / 2, ry - 14 - tier * 3)
  // 特定武器标识
  g.fillStyle(0xd4a437)
  if (kind === 'ballista') { g.fillRect(w / 2 - 2, h - 30, 4, 14); g.fillRect(w / 2 - 10, h - 26, 20, 3) }
  else if (kind === 'catapult') { g.fillCircle(w / 2, h - 26, 5); g.lineStyle(2, 0x8b6914); g.lineBetween(w / 2, h - 26, w / 2 + 12, h - 38) }
  else if (kind === 'barracks') { /* 旗已够 */ }
}

// 绘制建筑（城堡/营地）
function drawBuilding(g: Phaser.GameObjects.Graphics, kind: 'castle' | 'camp') {
  const w = 80, h = 80
  g.fillStyle(0x000000, 0.25); g.fillEllipse(w / 2, h - 6, 56, 10)
  if (kind === 'castle') {
    g.fillStyle(0x5a6b8b); g.fillRoundedRect(w / 2 - 28, h - 50, 56, 44, 4)
    g.lineStyle(2, OUTLINE, 0.4); g.strokeRoundedRect(w / 2 - 28, h - 50, 56, 44, 4)
    // 城垛
    g.fillStyle(0x5a6b8b)
    for (let i = -2; i <= 2; i++) g.fillRect(w / 2 + i * 12 - 4, h - 56, 8, 8)
    // 城门
    g.fillStyle(0x3a2a1a); g.fillRoundedRect(w / 2 - 8, h - 28, 16, 22, 8)
    // 旗帜
    g.lineStyle(2, 0x8b6914); g.lineBetween(w / 2, h - 56, w / 2, h - 70)
    g.fillStyle(0xd4a437); g.fillTriangle(w / 2, h - 68, w / 2 + 14, h - 64, w / 2, h - 60)
  } else {
    // 营地：木栅栏 + 帐篷
    g.fillStyle(0x6b4423); g.fillRoundedRect(w / 2 - 26, h - 44, 52, 38, 6)
    g.fillStyle(0x8b0000); g.fillTriangle(w / 2 - 24, h - 44, w / 2, h - 64, w / 2 + 24, h - 44)
    g.lineStyle(2, OUTLINE, 0.4); g.strokeTriangle(w / 2 - 24, h - 44, w / 2, h - 64, w / 2 + 24, h - 44)
    // 骷髅旗
    g.lineStyle(2, 0x4a4a4a); g.lineBetween(w / 2, h - 64, w / 2, h - 76)
    g.fillStyle(0xdddddd); g.fillCircle(w / 2, h - 74, 4)
  }
}

// 为场景生成回退纹理：只在纹理不存在时生成
export function ensureFallbackTexture(scene: Phaser.Scene, key: string) {
  if (scene.textures.exists(key)) return
  const g = scene.make.graphics({ x: 0, y: 0 }, false)
  // 解析 key 决定画什么
  // 塔：archer1~3 / ballista1~3 / catapult1~3 / barracks1~3
  const towerMatch = key.match(/^(archer|ballista|catapult|barracks)([123])$/)
  // 兵种
  const soldierMap: Record<string, { p: Palette; w: any }> = {
    shield: { p: { body: 0x4a7c59, trim: 0xd4a437, hair: 0x6b4423, accent: 0xc0392b }, w: 'sword' },
    spear: { p: { body: 0x5a6b8b, trim: 0xc0392b, hair: 0x2a2030, accent: 0xd4a437 }, w: 'spear' },
    archer: { p: { body: 0x2e7d5b, trim: 0x8b6914, hair: 0x3a2a1a, accent: 0xd4a437 }, w: 'bow' },
    ballista: { p: { body: 0x6b4a8b, trim: 0xd4a437, hair: 0x2a2030, accent: 0xd4a437 }, w: 'bow' },
    catapult: { p: { body: 0x8b6914, trim: 0x4a3b2a, hair: 0x3a2a1a, accent: 0xc0392b }, w: 'none' },
    cavalry: { p: { body: 0xc0392b, trim: 0xd4a437, hair: 0x2a2030, accent: 0xd4a437 }, w: 'spear' },
    guard: { p: { body: 0xd4a437, trim: 0x8b0000, hair: 0x2a2030, accent: 0xc0392b }, w: 'sword' },
  }
  // 敌人
  const enemyMap: Record<string, { p: Palette; w: any }> = {
    bandit: { p: { body: 0x6b4423, trim: 0x3a2a1a, hair: 0x1a1a2e, accent: 0x8b6914 }, w: 'club' },
    archer: { p: { body: 0x4a5a3a, trim: 0x2a3a1a, hair: 0x1a1a2e, accent: 0x8b6914 }, w: 'bow' },
    cavalry: { p: { body: 0x5a3a2a, trim: 0x2a1a0a, hair: 0x1a1a2e, accent: 0xc0392b }, w: 'sword' },
    heavy: { p: { body: 0x4a4a5a, trim: 0x2a2a3a, hair: 0x1a1a2e, accent: 0x999999 }, w: 'axe' },
    eagle: { p: { body: 0x8b6914, trim: 0xc0392b, hair: 0x2a2030, accent: 0xd4a437 }, w: 'bow' },
    siege: { p: { body: 0x6b4423, trim: 0x3a2a1a, hair: 0x1a1a2e, accent: 0x999999 }, w: 'none' },
    brute: { p: { body: 0x8b3a2a, trim: 0x4a1a0a, hair: 0x1a1a2e, accent: 0x999999 }, w: 'club' },
    boss: { p: { body: 0x8b0000, trim: 0xd4a437, hair: 0x1a1a2e, accent: 0xffd700 }, w: 'axe' },
  }

  if (towerMatch) {
    drawTower(g, towerMatch[1], parseInt(towerMatch[2]) - 1)
    g.generateTexture(key, 64, 64)
  } else if (key === 'castle') {
    drawBuilding(g, 'castle'); g.generateTexture(key, 80, 80)
  } else if (key === 'camp') {
    drawBuilding(g, 'camp'); g.generateTexture(key, 80, 80)
  } else if (soldierMap[key]) {
    const s = soldierMap[key]; drawChibi(g, s.p, s.w, false); g.generateTexture(key, 64, 64)
  } else if (enemyMap[key]) {
    const e = enemyMap[key]; drawChibi(g, e.p, e.w, true); g.generateTexture(key, 64, 64)
  } else if (key === 'bg') {
    // 背景渐变
    g.fillStyle(0x2a3a2a, 1); g.fillRect(0, 0, 64, 64)
    g.fillStyle(0x3a4a3a, 0.5); g.fillCircle(20, 20, 12)
    g.fillStyle(0x4a5a3a, 0.5); g.fillCircle(48, 30, 10)
    g.generateTexture(key, 64, 64)
  } else {
    // 通用占位：金色问号方块
    g.fillStyle(0x2a2030, 1); g.fillRoundedRect(0, 0, 64, 64, 8)
    g.fillStyle(0xd4a437, 1); g.fillRect(28, 16, 8, 24); g.fillCircle(32, 48, 5)
    g.generateTexture(key, 64, 64)
  }
  g.destroy()
}

// 预生成所有回退纹理（在 create 阶段调用，确保即使图片加载失败也有得用）
export function generateAllFallbacks(scene: Phaser.Scene, keys: string[]) {
  keys.forEach(k => ensureFallbackTexture(scene, k))
}
