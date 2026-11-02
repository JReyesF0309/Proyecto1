type Listener = () => void;

const listeners = new Set<Listener>();
const state = { musicMuted: false, effectsMuted: false };

export const audioSettings = {
  get musicMuted(): boolean {
    return state.musicMuted;
  },
  get effectsMuted(): boolean {
    return state.effectsMuted;
  },
  toggleMusic(): void {
    state.musicMuted = !state.musicMuted;
    listeners.forEach((listener) => listener());
  },
  toggleEffects(): void {
    state.effectsMuted = !state.effectsMuted;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// Keeps a Phaser sound in sync with the global music mute flag.
export function bindPhaserMusic(sound: Phaser.Sound.BaseSound): () => void {
  const apply = (): void => {
    (sound as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setMute(audioSettings.musicMuted);
  };
  apply();
  return audioSettings.subscribe(apply);
}
