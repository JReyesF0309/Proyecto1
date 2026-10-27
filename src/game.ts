import Phaser from 'phaser';
import CombatScene from './combat-scene';
import { GAME_CONFIG } from './game-config';
import WelcomeScene from './welcome-scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.canvas.width,
  height: GAME_CONFIG.canvas.height,
  parent: 'juego',
  backgroundColor: '#11111c',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  scene: [WelcomeScene, CombatScene],
};

new Phaser.Game(config);
