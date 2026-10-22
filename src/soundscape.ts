import { GAME_CONFIG } from './game-config';
import battleMusicUrl from '../assets/music/watch_the_thunder.mp3';
import victoryMusicUrl from '../assets/music/nike.mp3';
import curaSoundUrl from '../assets/sfx/cura.mp3';
import dexiosSoundUrl from '../assets/sfx/dexios.mp3';
import furaiSoundUrl from '../assets/sfx/furai.mp3';
import iobrontesSoundUrl from '../assets/sfx/iobrontes.mp3';
import perfectBlockSoundUrl from '../assets/sfx/perfect_block.mp3';
import sahiraSoundUrl from '../assets/sfx/sahira.mp3';
import tigerSoundUrl from '../assets/sfx/tigre.mp3';

type AssetSoundEffect = 'dexios' | 'iobrontes' | 'furai' | 'tigre' | 'sahira' | 'cura' | 'perfect_block';
type SoundEffect = 'lightning' | 'impact' | 'physical' | 'magic' | 'heal' | AssetSoundEffect;
type MusicTrack = 'battle' | 'victory';

export default class Soundscape {
  private readonly context = new AudioContext();
  private readonly master = this.context.createGain();
  private readonly musicGain = this.context.createGain();
  private readonly effectsGain = this.context.createGain();
  private readonly noiseBuffer: AudioBuffer;
  private readonly musicTracks: Record<MusicTrack, HTMLAudioElement>;
  private readonly soundEffects: Record<AssetSoundEffect, HTMLAudioElement>;
  private activeTrack: MusicTrack | null = 'battle';
  private enabled = true;

  constructor() {
    this.master.gain.value = GAME_CONFIG.audio.master;
    this.musicGain.gain.value = GAME_CONFIG.audio.music;
    this.effectsGain.gain.value = GAME_CONFIG.audio.effects;
    this.musicGain.connect(this.master);
    this.effectsGain.connect(this.master);
    this.master.connect(this.context.destination);

    this.musicTracks = {
      battle: new Audio(battleMusicUrl),
      victory: new Audio(victoryMusicUrl),
    };
    Object.values(this.musicTracks).forEach((track) => {
      track.loop = true;
      track.preload = 'auto';
      this.context.createMediaElementSource(track).connect(this.musicGain);
    });
    this.soundEffects = {
      dexios: new Audio(dexiosSoundUrl),
      iobrontes: new Audio(iobrontesSoundUrl),
      furai: new Audio(furaiSoundUrl),
      tigre: new Audio(tigerSoundUrl),
      sahira: new Audio(sahiraSoundUrl),
      cura: new Audio(curaSoundUrl),
      perfect_block: new Audio(perfectBlockSoundUrl),
    };
    Object.values(this.soundEffects).forEach((effect) => {
      effect.preload = 'auto';
      this.context.createMediaElementSource(effect).connect(this.effectsGain);
    });

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
    if (this.context.state !== 'running') {
      void this.context.resume().catch((error: unknown) => {
        console.error('No se pudo activar el audio:', error);
      });
    }
    this.resumeMusic();
  }

  toggle(): void {
    this.enabled = !this.enabled;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(this.enabled ? GAME_CONFIG.audio.master : 0, now, 0.04);
    if (this.enabled) {
      this.start();
    } else if (this.activeTrack) {
      this.musicTracks[this.activeTrack].pause();
    }
  }

  playMusic(track: MusicTrack): void {
    if (track !== this.activeTrack) {
      if (this.activeTrack) {
        const previousTrack = this.musicTracks[this.activeTrack];
        previousTrack.pause();
        previousTrack.currentTime = 0;
      }
      this.musicTracks[track].currentTime = 0;
      this.activeTrack = track;
      const now = this.context.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(GAME_CONFIG.audio.music, now, 0.04);
    }
    this.start();
  }

  play(effect: SoundEffect): void {
    this.start();
    if (!this.enabled) {
      return;
    }
    if (
      effect === 'dexios'
      || effect === 'iobrontes'
      || effect === 'furai'
      || effect === 'tigre'
      || effect === 'sahira'
      || effect === 'cura'
      || effect === 'perfect_block'
    ) {
      this.playAssetSound(effect);
    } else if (effect === 'lightning') {
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
    if (this.activeTrack) {
      const track = this.musicTracks[this.activeTrack];
      track.pause();
      track.currentTime = 0;
      this.activeTrack = null;
    }
    const now = this.context.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setTargetAtTime(0, now, 0.18);
  }

  destroy(): void {
    Object.values(this.musicTracks).forEach((track) => track.pause());
    Object.values(this.soundEffects).forEach((effect) => effect.pause());
    this.master.disconnect();
    void this.context.close();
  }

  private playAssetSound(effect: AssetSoundEffect): void {
    const audio = this.soundEffects[effect];
    const play = (): void => {
      if (!this.enabled) {
        return;
      }
      audio.currentTime = 0;
      void audio.play().catch((error: unknown) => {
        console.error(`No se pudo reproducir el efecto ${effect}:`, error);
      });
    };
    if (this.context.state === 'running') {
      play();
      return;
    }
    void this.context.resume().then(play).catch((error: unknown) => {
      console.error(`No se pudo activar el audio para el efecto ${effect}:`, error);
    });
  }

  private resumeMusic(): void {
    if (!this.enabled || !this.activeTrack) {
      return;
    }
    const track = this.musicTracks[this.activeTrack];
    if (track.paused) {
      const trackName = this.activeTrack;
      void track.play().catch((error: unknown) => {
        console.error(`No se pudo reproducir la pista ${trackName}:`, error);
      });
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
