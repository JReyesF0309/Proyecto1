import { GAME_CONFIG } from './game-config';

type SoundEffect = 'lightning' | 'impact' | 'physical' | 'magic' | 'heal';

const TEMPO = 140;
const STEP_SECONDS = 60 / TEMPO / 2;
const PHRYGIAN_NOTES = [0, 1, 3, 5, 7, 8, 10, 12, 13, 15, 17] as const;
const MELODY = [0, null, 3, 4, null, 5, 4, null, 0, null, 4, 6, 7, null, 5, null] as const;
const LYRE = [0, null, null, 4, null, null, 6, null, 0, null, null, 5, null, null, 4, null] as const;

export default class Soundscape {
  private readonly context = new AudioContext();
  private readonly master = this.context.createGain();
  private readonly musicGain = this.context.createGain();
  private readonly effectsGain = this.context.createGain();
  private readonly noiseBuffer: AudioBuffer;
  private scheduler?: number;
  private nextStepTime = 0;
  private step = 0;
  private started = false;
  private enabled = true;
  private musicStopped = false;

  constructor() {
    this.master.gain.value = GAME_CONFIG.audio.master;
    this.musicGain.gain.value = GAME_CONFIG.audio.music;
    this.effectsGain.gain.value = GAME_CONFIG.audio.effects;
    this.musicGain.connect(this.master);
    this.effectsGain.connect(this.master);
    this.master.connect(this.context.destination);

    this.noiseBuffer = this.context.createBuffer(1, this.context.sampleRate * 2, this.context.sampleRate);
    const samples = this.noiseBuffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  start(): void {
    if (!this.enabled || this.started) {
      void this.context.resume();
      return;
    }
    this.started = true;
    this.nextStepTime = this.context.currentTime + 0.05;
    this.scheduler = window.setInterval(() => this.scheduleMusic(), 25);
    void this.context.resume();
  }

  toggle(): void {
    this.enabled = !this.enabled;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(this.enabled ? GAME_CONFIG.audio.master : 0, now, 0.04);
    if (this.enabled) {
      this.start();
    }
  }

  play(effect: SoundEffect): void {
    this.start();
    if (!this.enabled) {
      return;
    }
    if (effect === 'lightning') {
      this.playLightning();
    } else if (effect === 'impact') {
      this.playImpact();
    } else if (effect === 'physical') {
      this.playPhysical();
    } else if (effect === 'magic') {
      this.playMagic();
    } else {
      this.playHeal();
    }
  }

  stopMusic(): void {
    this.musicStopped = true;
    if (this.scheduler !== undefined) {
      window.clearInterval(this.scheduler);
      this.scheduler = undefined;
    }
    const now = this.context.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setTargetAtTime(0, now, 0.18);
  }

  destroy(): void {
    if (this.scheduler !== undefined) {
      window.clearInterval(this.scheduler);
    }
    this.master.disconnect();
    void this.context.close();
  }

  private scheduleMusic(): void {
    if (!this.enabled || this.musicStopped) {
      return;
    }
    while (this.nextStepTime < this.context.currentTime + 0.12) {
      this.scheduleStep(this.step, this.nextStepTime);
      this.step += 1;
      this.nextStepTime += STEP_SECONDS;
    }
  }

  private scheduleStep(step: number, time: number): void {
    const position = step % 16;
    const bar = Math.floor(step / 16) % 4;
    const tonic = 146.83;
    const transposition = [0, 0, 3, 0][bar];

    const melodyIndex = MELODY[position];
    if (melodyIndex !== null) {
      const note = tonic * 2 ** (PHRYGIAN_NOTES[melodyIndex + transposition] / 12) * 2;
      this.playTrumpet(note, time, STEP_SECONDS * 0.65, 0.12);
    }
    const lyreIndex = LYRE[position];
    if (lyreIndex !== null) {
      const note = tonic * 2 ** (PHRYGIAN_NOTES[lyreIndex + transposition] / 12);
      this.playPiano(note, time, STEP_SECONDS * 1.1);
    }

    if (position === 0 || position === 8) {
      this.playDrum(time, false, position === 0 ? 0.19 : 0.14);
    } else if (position === 4 || position === 12) {
      this.playDrum(time, true, 0.065);
    }
    if ((position === 0 && bar === 0) || (position === 8 && bar === 2)) {
      this.playTrumpet(tonic * 2 ** (PHRYGIAN_NOTES[bar === 0 ? 4 : 0] / 12) * 4, time, 0.16, 0.08);
    }
    if (position === 12 && bar === 3) {
      this.playTrumpet(tonic * 2 ** (PHRYGIAN_NOTES[4] / 12) * 4, time, 0.16, 0.08);
    }
  }

  private playTrumpet(frequency: number, time: number, duration: number, volume: number): void {
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(volume, time + 0.025);
    envelope.gain.setValueAtTime(volume * 0.68, time + duration * 0.48);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.9);
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1900, time);
    filter.Q.value = 1.1;
    filter.connect(envelope);
    envelope.connect(this.musicGain);

    [0, 4, 7].forEach((cents, index) => {
      const oscillator = this.context.createOscillator();
      oscillator.type = index === 0 ? 'sawtooth' : 'square';
      oscillator.frequency.setValueAtTime(frequency, time);
      oscillator.detune.value = cents;
      oscillator.connect(filter);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.015);
    });
  }

  private playPiano(frequency: number, time: number, duration: number): void {
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(0.12, time + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    const tone = this.context.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.setValueAtTime(3000, time);
    tone.frequency.exponentialRampToValueAtTime(950, time + duration);
    tone.connect(envelope);
    envelope.connect(this.musicGain);
    [1, 2.01, 3.02, 4.1].forEach((harmonic, index) => {
      const oscillator = this.context.createOscillator();
      oscillator.type = index === 0 ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency * harmonic, time);
      oscillator.connect(tone);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.01);
    });
  }

  private playDrum(time: number, snare: boolean, volume: number): void {
    const source = this.context.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.context.createBiquadFilter();
    filter.type = snare ? 'bandpass' : 'lowpass';
    filter.frequency.setValueAtTime(snare ? 1500 : 180, time);
    if (!snare) {
      filter.frequency.exponentialRampToValueAtTime(48, time + 0.19);
    }
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(volume, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + (snare ? 0.12 : 0.24));
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.musicGain);
    source.start(time);
    source.stop(time + 0.26);
    if (!snare) {
      this.playTone(72, time, 0.18, volume * 0.7, 'sine', this.musicGain, 42);
    }
  }

  private playLightning(): void {
    const now = this.context.currentTime;
    this.playTone(1550, now, 0.085, 0.2, 'sawtooth', this.effectsGain, 260);
    this.playNoise(now, 0.055, 0.3, 4300, 1100);
    [0.022, 0.061, 0.094].forEach((offset, index) => {
      const burstTime = now + offset;
      const frequency = 1150 + Math.random() * 1400;
      this.playTone(
        frequency,
        burstTime,
        0.018 + Math.random() * 0.025,
        0.12 - index * 0.025,
        'triangle',
        this.effectsGain,
        420 + Math.random() * 350,
      );
      this.playNoise(burstTime, 0.018 + Math.random() * 0.025, 0.15, 3600, 850);
    });
  }

  private playImpact(): void {
    const now = this.context.currentTime;
    this.playTone(190, now, 0.18, 0.3, 'triangle', this.effectsGain, 55);
    this.playNoise(now, 0.11, 0.18, 1300, 380);
  }

  private playPhysical(): void {
    const now = this.context.currentTime;
    this.playTone(115, now, 0.11, 0.22, 'triangle', this.effectsGain, 58);
    this.playNoise(now, 0.055, 0.12, 1050, 280);
  }

  private playMagic(): void {
    const now = this.context.currentTime;
    this.playTone(920, now, 0.14, 0.16, 'sine', this.effectsGain, 1450);
    this.playTone(1380, now + 0.035, 0.17, 0.12, 'triangle', this.effectsGain, 1750);
  }

  private playHeal(): void {
    const now = this.context.currentTime;
    [659.25, 830.61, 987.77].forEach((frequency, index) => {
      this.playTone(
        frequency,
        now + index * 0.045,
        0.34,
        0.12,
        'sine',
        this.effectsGain,
        frequency * 1.12,
      );
    });
  }

  private playTone(
    frequency: number,
    time: number,
    duration: number,
    volume: number,
    type: OscillatorType,
    destination: AudioNode,
    endFrequency: number,
  ): void {
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
    envelope.gain.setValueAtTime(volume, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope);
    envelope.connect(destination);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.01);
  }

  private playNoise(
    time: number,
    duration: number,
    volume: number,
    startFrequency: number,
    endFrequency: number,
  ): void {
    const source = this.context.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(startFrequency, time);
    filter.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
    filter.Q.value = 0.75;
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(volume, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.effectsGain);
    source.start(time);
    source.stop(time + duration + 0.01);
  }
}
