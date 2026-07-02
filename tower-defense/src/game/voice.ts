// 语音系统：Web Speech API 中文 TTS，人物战斗语音
import { audio } from './audio'

class VoiceEngine {
  enabled = true
  voices: SpeechSynthesisVoice[] = []

  private load() {
    if (typeof speechSynthesis === 'undefined') return false
    this.voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('zh'))
    return true
  }

  setEnabled(on: boolean) { this.enabled = on }

  speak(text: string, opts: { rate?: number; pitch?: number; vol?: number } = {}) {
    if (!this.enabled || typeof speechSynthesis === 'undefined') return
    if (!this.voices.length) this.load()
    try {
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'zh-CN'
      u.rate = opts.rate ?? 1.1
      u.pitch = opts.pitch ?? 1.0
      u.volume = opts.vol ?? 0.8
      const v = this.voices.find(x => x.name.includes('Female') || x.name.includes('女')) || this.voices[0]
      if (v) u.voice = v
      speechSynthesis.speak(u)
    } catch {}
  }

  // 战斗语音短语
  deploy(type: string) {
    const map: Record<string, string[]> = {
      melee: ['出征！', '杀！', '随我冲锋！'],
      ranged: ['放箭！', '箭阵就位！'],
      siege: ['攻城器械就绪！', '装填！'],
      cavalry: ['铁骑冲锋！', '骑兵出击！'],
    }
    const arr = map[type] || map.melee
    this.speak(arr[Math.floor(Math.random() * arr.length)], { rate: 1.2 })
  }
  skill(name: string) { this.speak(name + '！', { rate: 1.15, pitch: 0.9 }) }
  wave() { this.speak('敌军来袭！', { rate: 1.2, pitch: 0.8 }) }
  kill() {
    if (Math.random() < 0.3) this.speak(['好！', '杀！', '干得漂亮'][Math.floor(Math.random() * 3)], { rate: 1.3, vol: 0.5 })
  }
  win() { this.speak('凯旋而归，将军威武！', { rate: 1.0 }) }
  lose() { this.speak('城关失守，整军再战...', { rate: 0.9, pitch: 0.7 }) }
}

export const voice = new VoiceEngine()

// 首次用户交互后初始化
if (typeof window !== 'undefined') {
  const init = () => { voice.load(); audio.resume() }
  window.addEventListener('pointerdown', init, { once: true })
  window.addEventListener('keydown', init, { once: true })
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.onvoiceschanged = () => voice.load()
  }
}
