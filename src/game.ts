import Phaser from 'phaser';
import CombatScene from './combat-scene';
import { GAME_CONFIG, GAME_FONT_FAMILY } from './game-config';
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

await document.fonts.load(`16px "${GAME_FONT_FAMILY}"`);
if (!document.fonts.check(`16px "${GAME_FONT_FAMILY}"`)) {
  throw new Error(`No se pudo cargar la fuente ${GAME_FONT_FAMILY}`);
}
new Phaser.Game(config);
