import Phaser from 'phaser';
import CombatScene from './combat-scene';
import SelectScene from './select-scene';
import HazelTestScene from './hazel-test-scene';
import SahiraTestScene from './sahira-test-scene';
import DexiosTestScene from './dexios-test-scene';
import FuraiTestScene from './furai-test-scene';
import TutorialCombatScene from './tutorial-combat-scene';
import TutorialPopupScene from './tutorial-popups';
import NarrativePresentationScene from './narrative-presentation';
import { EB_GARAMOND_FONT_FAMILY, GAME_CONFIG, GAME_FONT_FAMILY } from './game-config';
import WelcomeScene from './welcome-scene';
import PauseScene from './pause-scene';
import { audioSettings } from './audio-settings';
import ChapterOneCombatScene, {
  CHAPTER1_COMBAT1,
  CHAPTER1_COMBAT2,
} from './chapter1-combat-scene';
import {
  ChapterOneSelectScene,
  ChapterOneWelcomeScene,
  ChapterSelectScene,
} from './chapter1-scenes';

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
  scene: [
    ChapterSelectScene,
    ChapterOneWelcomeScene,
    ChapterOneSelectScene,
    new ChapterOneCombatScene(CHAPTER1_COMBAT1),
    new ChapterOneCombatScene(CHAPTER1_COMBAT2),
    WelcomeScene,
    SelectScene,
    CombatScene,
    new CombatScene('escena_narrativa', null, 'standard', true),
    NarrativePresentationScene,
    TutorialCombatScene,
    TutorialPopupScene,
    HazelTestScene,
    SahiraTestScene,
    DexiosTestScene,
    FuraiTestScene,
    PauseScene,
  ],
};

await document.fonts.load(`16px "${GAME_FONT_FAMILY}"`);
if (!document.fonts.check(`16px "${GAME_FONT_FAMILY}"`)) {
  throw new Error(`No se pudo cargar la fuente ${GAME_FONT_FAMILY}`);
}
await document.fonts.load(`16px "${EB_GARAMOND_FONT_FAMILY}"`);
if (!document.fonts.check(`16px "${EB_GARAMOND_FONT_FAMILY}"`)) {
  throw new Error(`No se pudo cargar la fuente ${EB_GARAMOND_FONT_FAMILY}`);
}
const game = new Phaser.Game(config);

window.addEventListener('keydown', (event) => {
  if (event.repeat) {
    return;
  }
  const key = event.key.toLowerCase();
  if (key === 'n') {
    audioSettings.toggleMusic();
  } else if (key === 'm') {
    audioSettings.toggleEffects();
  } else if (event.code === 'Escape') {
    const running = game.scene.getScenes(false)
      .filter((scene) => scene.sys.isActive() || scene.sys.isPaused())
      .map((scene) => scene.scene.key);
    if (running.includes('escena_bienvenida')
      || running.some((sceneKey) => sceneKey.startsWith('scene_ch'))) {
      // Chapter selection and Chapter 1 handle Escape in chapter1-hotkeys.ts.
      return;
    }
    const target = running.includes('escena_select') ? 'escena_bienvenida' : 'escena_select';
    running.forEach((sceneKey) => game.scene.stop(sceneKey));
    game.scene.start(target);
  }
});
