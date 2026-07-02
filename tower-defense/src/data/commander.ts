// 主帅成长：8 阶段，从边防小兵到兵马大元帅
import { ASSETS } from './assets'

export interface RankDef {
  name: string
  exp: number           // 晋升所需累计通关数
  unlock: string        // 解锁内容
  cmd: number           // 统帅力(同时部署士兵上限+)
  morale: number        // 士气(全军攻击%+)
  grainMax: number      // 粮草上限
  asset: string
}

export const RANKS: RankDef[] = [
  { name: '边防小兵', exp: 0,  unlock: '刀盾兵·弓箭塔·兵营', cmd: 3,  morale: 0,  grainMax: 400,  asset: ASSETS.commander[0] },
  { name: '什长',     exp: 3,  unlock: '长枪兵·弓箭手',       cmd: 4,  morale: 5,  grainMax: 500,  asset: ASSETS.commander[1] },
  { name: '百夫长',   exp: 8,  unlock: '床弩手·床弩塔',       cmd: 5,  morale: 10, grainMax: 650,  asset: ASSETS.commander[2] },
  { name: '校尉',     exp: 15, unlock: '投石车',               cmd: 6,  morale: 15, grainMax: 800,  asset: ASSETS.commander[3] },
  { name: '都尉',     exp: 24, unlock: '投石塔·重装骑兵',     cmd: 8,  morale: 20, grainMax: 1000, asset: ASSETS.commander[4] },
  { name: '偏将',     exp: 36, unlock: '主帅技·战鼓擂',       cmd: 10, morale: 30, grainMax: 1200, asset: ASSETS.commander[5] },
  { name: '大将',     exp: 50, unlock: '精锐禁卫·急救令',     cmd: 12, morale: 40, grainMax: 1500, asset: ASSETS.commander[6] },
  { name: '兵马大元帅', exp: 70, unlock: '火矢齐射·天降神兵', cmd: 16, morale: 55, grainMax: 2000, asset: ASSETS.commander[7] },
]

export interface SkillDef {
  id: string
  name: string
  unlockRank: number   // 主帅阶(1-based)
  cd: number           // 冷却(秒)
  desc: string
  icon: string
}

export const SKILLS: SkillDef[] = [
  { id: 'drum',    name: '战鼓擂',     unlockRank: 6, cd: 25, icon: '🥁',
    desc: '擂鼓助威，全军攻击+40%，持续8秒。' },
  { id: 'heal',    name: '急救令',     unlockRank: 7, cd: 30, icon: '⚕',
    desc: '下达急救令，所有友军恢复40%生命。' },
  { id: 'fire',    name: '火矢齐射',   unlockRank: 8, cd: 40, icon: '🔥',
    desc: '天降火箭，对全屏敌人造成150点火焰伤害。' },
  { id: 'reinforce', name: '天降神兵', unlockRank: 8, cd: 50, icon: '⚔',
    desc: '空降4名精锐禁卫至路径中段。' },
]

export function rankByClears(clears: number): number {
  let r = 0
  for (let i = 0; i < RANKS.length; i++) if (clears >= RANKS[i].exp) r = i
  return r
}
