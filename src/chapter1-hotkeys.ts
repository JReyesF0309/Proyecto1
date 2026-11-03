import Phaser from 'phaser';

export interface ChapterOneHotkeyOptions {
  // Scene to open on Escape. Omit when there is no parent scene.
  backScene?: string;
  // Custom restart, used by combats that need to guard their own state.
  onRestart?: () => void;
  onBack?: () => void;
}

// Shared Chapter 1 shortcuts: R restarts the scene and Escape returns to the
// previous scene. N (music) and M (effects) are handled by the global handler
// in game.ts, which already persists their state in audioSettings.
export function installChapterOneHotkeys(
  scene: Phaser.Scene,
  options: ChapterOneHotkeyOptions,
): void {
  const keyboard = scene.input.keyboard;
  if (!keyboard) {
    return;
  }
  let handled = false;
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat || handled || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    if (event.code === 'KeyR') {
      handled = true;
      if (options.onRestart) {
        options.onRestart();
      } else {
        scene.scene.restart();
      }
    } else if (event.code === 'Escape' && options.backScene) {
      handled = true;
      options.onBack?.();
      scene.scene.start(options.backScene);
    }
  };
  keyboard.on('keydown', onKeyDown);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    keyboard.off('keydown', onKeyDown);
  });
}
