import Phaser from 'phaser';
import { GAME_CONFIG, GAME_FONT_FAMILY } from './game-config';

export const PAUSE_SCENE_KEY = 'escena_pausa';

export default class PauseScene extends Phaser.Scene {
  private parentSceneKey = '';

  constructor() {
    super({ key: PAUSE_SCENE_KEY });
  }

  init(data: { parentSceneKey: string }): void {
    this.parentSceneKey = data.parentSceneKey;
  }

  create(): void {
    const width = GAME_CONFIG.canvas.width;
    const height = GAME_CONFIG.canvas.height;
    this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.35);
    this.add.text(width / 2, height / 2, 'GAME PAUSED', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#171326',
      strokeThickness: 10,
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 70, 'P · Resume', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#171326',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const resume = (): void => {
      this.scene.stop();
      this.scene.resume(this.parentSceneKey);
    };
    const restart = (): void => {
      const parent = this.parentSceneKey;
      this.scene.stop();
      this.scene.stop(parent);
      this.scene.start(parent);
    };
    this.input.keyboard?.on('keydown-P', resume);
    this.input.keyboard?.on('keydown-R', restart);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-P', resume);
      this.input.keyboard?.off('keydown-R', restart);
    });
  }
}
