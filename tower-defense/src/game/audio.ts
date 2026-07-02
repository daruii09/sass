// 音效系统：Web Audio API 合成，无需外部音频文件
// 全程程序化生成，覆盖射击/命中/击杀/建造/部署/技能/UI/波次/胜负

class AudioEngine {
  ctx: AudioContext | null = null
  master: GainNode | null = null
  enabled = true
  musicGain: GainNode | null = null
  musicNodes: OscillatorNode[] = []

  private ensure() {
    if (!this.ctx) {
      const AC = (window.AudioContext || (window as any).webkitAudioContext)
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.35
      this.master.connect(this.ctx.destination)
      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.value = 0.12
      this.musicGain.connect(this.master)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  resume() { try { this.ensure() } catch {} }

  setEnabled(on: boolean) {
    this.enabled = on
    if (this.master) this.master.gain.value = on ? 0.35 : 0
  }

  // 基础合成：振荡器 + 包络
  private tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 1, slideTo?: number) {
    if (!this.enabled) return
    const ctx = this.ensure()
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(this.master!)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  // 噪声合成（用于箭矢/击中）
  private noise(dur: number, vol = 1, filterFreq = 1000, type: BiquadFilterType = 'lowpass') {
    if (!this.enabled) return
    const ctx = this.ensure()
    const t = ctx.currentTime
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = filterFreq
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(filter).connect(g).connect(this.master!)
    src.start(t)
    src.stop(t + dur)
  }

  // === 游戏音效 ===
  shoot() { this.noise(0.12, 0.4, 2200, 'bandpass'); this.tone(880, 0.1, 'triangle', 0.18, 440) }
  bolt() { this.tone(180, 0.18, 'sawtooth', 0.4, 90); this.noise(0.15, 0.3, 800) }   // 床弩
  catapult() { this.tone(120, 0.35, 'sawtooth', 0.45, 60); this.noise(0.3, 0.2, 500) } // 投石
  hit() { this.tone(140, 0.08, 'square', 0.3, 80); this.noise(0.06, 0.25, 1500) }
  kill() {
    this.tone(220, 0.12, 'sawtooth', 0.35, 110)
    this.noise(0.2, 0.3, 600)
    setTimeout(() => this.tone(110, 0.2, 'triangle', 0.25, 55), 60)
  }
  build() {
    [330, 440, 550, 660].forEach((f, i) => setTimeout(() => this.tone(f, 0.1, 'square', 0.2), i * 60))
  }
  deploy() {
    // 号角
    [261, 329, 392].forEach((f, i) => setTimeout(() => this.tone(f, 0.35, 'sawtooth', 0.25), i * 90))
  }
  skill() {
    this.tone(523, 0.15, 'sine', 0.3, 1046)
    setTimeout(() => this.tone(784, 0.2, 'sine', 0.25, 1568), 80)
    setTimeout(() => this.noise(0.3, 0.15, 4000, 'highpass'), 100)
  }
  uiClick() { this.tone(660, 0.05, 'sine', 0.15) }
  uiBack() { this.tone(330, 0.06, 'sine', 0.15, 220) }
  waveStart() {
    // 战鼓
    for (let i = 0; i < 4; i++) setTimeout(() => this.tone(80, 0.18, 'sine', 0.5, 50), i * 220)
  }
  win() {
    [392, 523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.25, 'triangle', 0.3), i * 130))
  }
  lose() {
    [440, 392, 330, 261, 196].forEach((f, i) => setTimeout(() => this.tone(f, 0.35, 'sawtooth', 0.3, f * 0.7), i * 180))
  }
  baseHit() { this.tone(90, 0.25, 'sawtooth', 0.5, 40); this.noise(0.2, 0.4, 300) }

  // 简易背景循环音乐（五声音阶）
  startMusic() {
    if (!this.enabled || this.musicNodes.length) return
    const ctx = this.ensure()
    const scale = [261, 294, 329, 392, 440, 523, 587, 659]
    const playNote = () => {
      if (!this.musicGain) return
      const f = scale[Math.floor(Math.random() * scale.length)]
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f / 2
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.08, t + 0.3)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
      osc.connect(g).connect(this.musicGain!)
      osc.start(t)
      osc.stop(t + 1.8)
    }
    const interval = setInterval(playNote, 900)
    ;(interval as any).__music = true
  }
  stopMusic() {
    this.musicNodes.forEach(n => { try { n.stop() } catch {} })
    this.musicNodes = []
  }
}

export const audio = new AudioEngine()
