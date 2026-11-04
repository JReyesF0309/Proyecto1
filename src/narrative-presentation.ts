import Phaser from 'phaser';
import { EB_GARAMOND_FONT_FAMILY, GAME_CONFIG, GAME_FONT_FAMILY } from './game-config';

export const NARRATIVE_PRESENTATION_SCENE_KEY = 'escena_presentacion_narrativa';

export interface NarrativeDialogueLine {
  speaker: string;
  portrait: string;
  text: string;
  holdMs?: number;
  afterDismiss?: {
    type: 'camera-shake';
    durationMs: number;
    amplitude: number;
  };
}

export type NarrativePresentationData =
  | {
    parentSceneKey: string;
    type: 'dialogue';
    lines: NarrativeDialogueLine[];
    style?: 'chapter1';
    onRestart?: () => void;
    onBack?: () => void;
  }
  | {
    parentSceneKey: string;
    type: 'cinematic';
    texture: string;
    durationMs: number;
    cameraShake?: number;
  };

export default class NarrativePresentationScene extends Phaser.Scene {
  private presentation?: NarrativePresentationData;
  private lineIndex = 0;
  private enterHeld = false;
  private canAdvance = true;
  private chapterOnePanel?: Phaser.GameObjects.Container;
  private chapterOneLine?: Phaser.GameObjects.Container;
  private shakeCamera?: Phaser.Cameras.Scene2D.Camera;
  private shakeOrigin?: Phaser.Math.Vector2;

  constructor() {
    super({ key: NARRATIVE_PRESENTATION_SCENE_KEY });
  }

  init(data: NarrativePresentationData): void {
    this.presentation = data;
    this.lineIndex = 0;
    this.enterHeld = false;
    this.canAdvance = true;
  }

  create(): void {
    if (!this.presentation) {
      throw new Error('Narrative presentation scene requires presentation data.');
    }

    if (this.presentation.type === 'dialogue') {
      this.createDialogue();
      this.input.keyboard?.on('keydown-ENTER', this.advanceDialogue, this);
      this.input.keyboard?.on('keyup-ENTER', this.releaseEnter, this);
      if (this.presentation.style === 'chapter1') {
        this.input.keyboard?.on('keydown', this.handleChapterOneShortcuts, this);
      }
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.input.keyboard?.off('keydown-ENTER', this.advanceDialogue, this);
        this.input.keyboard?.off('keyup-ENTER', this.releaseEnter, this);
        this.input.keyboard?.off('keydown', this.handleChapterOneShortcuts, this);
        this.restoreParentCamera();
      });
      return;
    }

    this.createCinematic();
  }

  private createDialogue(): void {
    const presentation = this.presentation;
    if (!presentation || presentation.type !== 'dialogue') {
      return;
    }

    if (presentation.style === 'chapter1') {
      this.createChapterOneDialogue();
      return;
    }

    this.add.rectangle(
      WIDTH / 2,
      HEIGHT / 2,
      WIDTH,
      HEIGHT,
      0x05040a,
      0.58,
    ).setDepth(1);
    this.add.rectangle(WIDTH / 2, 886, 1570, 306, 0x0b0913, 0.94)
      .setStrokeStyle(3, 0xd8b66c, 0.9)
      .setDepth(5);

    const badgeH = 34;
    const badgeY = 996;
    const hint = this.add.text(1720, badgeY, 'to continue', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '19px',
      color: '#e7d4a9',
    }).setOrigin(1, 0.5).setDepth(7);
    const key = this.add.text(0, badgeY, 'ENTER', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#f5d47d',
    }).setOrigin(0.5).setDepth(8);
    const badgeW = key.width + 28;
    const badgeX = hint.x - hint.width - 16 - badgeW / 2;
    key.setX(badgeX);
    this.add.graphics()
      .fillStyle(0x24152c, 0.95)
      .fillRoundedRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 7)
      .lineStyle(2, 0xe7bd65, 1)
      .strokeRoundedRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 7)
      .setDepth(7);
    this.showLine();
  }

  private createChapterOneDialogue(): void {
    const panel = this.add.container(0, 0).setDepth(5);
    panel.add(this.add.rectangle(WIDTH / 2, 900, 1650, 280, 0x000000, 0.8)
      .setStrokeStyle(2, 0xd8b66c, 1));

    const badgeY = 1000;
    const hint = this.add.text(1710, badgeY, 'to continue', {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(1, 0.5);
    const key = this.add.text(0, badgeY, 'ENTER', {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#f5d47d',
    }).setOrigin(0.5);
    const keyWidth = key.width + 28;
    const keyX = hint.x - hint.width - 18 - keyWidth / 2;
    key.setX(keyX);
    const keyFrame = this.add.graphics()
      .fillStyle(0x17121b, 1)
      .fillRoundedRect(keyX - keyWidth / 2, badgeY - 19, keyWidth, 38, 4)
      .lineStyle(2, 0xd8b66c, 1)
      .strokeRoundedRect(keyX - keyWidth / 2, badgeY - 19, keyWidth, 38, 4);
    panel.add([keyFrame, hint, key]);
    this.chapterOnePanel = panel;
    this.showLine();
  }

  private showLine(): void {
    const presentation = this.presentation;
    if (!presentation || presentation.type !== 'dialogue') {
      return;
    }
    const line = presentation.lines[this.lineIndex];
    if (!line) {
      this.finish();
      return;
    }

    this.chapterOneLine?.destroy();
    this.chapterOneLine = undefined;
    this.children.getChildren()
      .filter((child) => child.getData('dialogue-dynamic') === true)
      .forEach((child) => child.destroy());

    if (presentation.style === 'chapter1') {
      this.showChapterOneLine(line);
      return;
    }
    const isBoss = line.speaker === 'Iobrontes' || line.speaker === 'Kosmelys';
    const portrait = this.add.image(isBoss ? 0 : 375, 0, line.portrait).setDepth(3);
    const boost = line.portrait === 'hazel_dialogo_feliz' ? 1.2
      : line.portrait === 'kosmelys_dialogo_feliz' ? 1.35 : 1;
    const scale = Math.min(600 / portrait.width, 690 / portrait.height) * boost;
    portrait.setScale(scale).setData('dialogue-dynamic', true);
    if (isBoss) {
      portrait.setX(1710 - portrait.displayWidth / 2);
    }
    portrait.setY(745 - portrait.displayHeight / 2);
    const name = this.add.text(220, 820, line.speaker.toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '35px',
      fontStyle: 'bold',
      color: '#f1d78f',
      stroke: '#17101d',
      strokeThickness: 4,
    }).setDepth(6).setData('dialogue-dynamic', true);
    const text = this.add.text(220, 880, line.text, {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '33px',
      color: '#fffaf1',
      lineSpacing: 4,
      wordWrap: { width: 1480, useAdvancedWrap: true },
    }).setDepth(6).setData('dialogue-dynamic', true);
    if (text.height > 142) {
      text.setFontSize('29px');
    }

    this.canAdvance = !line.holdMs;
    if (line.holdMs) {
      this.time.delayedCall(line.holdMs, () => {
        this.canAdvance = true;
      });
    }
    name.setY(Math.min(820, 975 - name.height - text.height));
    text.setY(name.y + name.height + 10);
  }

  private showChapterOneLine(line: NarrativeDialogueLine): void {
    const confidentPortrait = line.portrait === 'dexios_dialogue_confident'
      || line.portrait === 'dexios_dialogue_ready';
    const portrait = this.add.image(confidentPortrait ? 350 : 360, 760, line.portrait);
    const portraitScale = Math.min(420 / portrait.width, 620 / portrait.height);
    portrait.setScale(portraitScale * (confidentPortrait ? 1.45 : 1));
    if (confidentPortrait) {
      const dreaming = this.textures.get('dexios_dialogue_dreaming').getSourceImage();
      const dreamingHeight = Math.min(420 / dreaming.width, 620 / dreaming.height) * dreaming.height;
      portrait.setY(760 - dreamingHeight / 2 + portrait.displayHeight / 2);
    }

    const textX = confidentPortrait ? 710 : 590;
    const name = this.add.text(textX, 790, line.speaker.toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '34px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: '#f1d78f',
      stroke: '#17101d',
      strokeThickness: 4,
    });
    const text = this.add.text(textX, 846, line.text, {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '38px',
      color: '#ffffff',
      lineSpacing: 4,
      wordWrap: { width: confidentPortrait ? 1000 : 1110, useAdvancedWrap: true },
    });
    if (text.height > 112) {
      text.setFontSize('32px');
    }
    this.chapterOneLine = this.add.container(0, 0, [portrait, name, text]).setDepth(6);
    this.chapterOneLine.setVisible(true);
    this.chapterOnePanel?.setVisible(true);
    this.canAdvance = !line.holdMs;
    if (line.holdMs) {
      this.time.delayedCall(line.holdMs, () => {
        this.canAdvance = true;
      });
    }
  }

  private advanceDialogue(event: KeyboardEvent): void {
    if (event.repeat || this.enterHeld || !this.canAdvance) {
      return;
    }
    event.preventDefault();
    this.enterHeld = true;
    const presentation = this.presentation;
    const line = presentation?.type === 'dialogue' ? presentation.lines[this.lineIndex] : undefined;
    if (presentation?.type === 'dialogue' && presentation.style === 'chapter1' && line?.afterDismiss) {
      this.runAfterDismiss(line.afterDismiss);
      return;
    }
    this.lineIndex += 1;
    this.showLine();
  }

  private runAfterDismiss(event: NonNullable<NarrativeDialogueLine['afterDismiss']>): void {
    const presentation = this.presentation;
    if (!presentation || presentation.type !== 'dialogue') {
      return;
    }
    this.canAdvance = false;
    this.chapterOnePanel?.setVisible(false);
    this.chapterOneLine?.setVisible(false);

    if (event.type === 'camera-shake') {
      const parent = this.scene.get(presentation.parentSceneKey);
      this.shakeCamera = parent.cameras.main;
      this.shakeOrigin = new Phaser.Math.Vector2(this.shakeCamera.scrollX, this.shakeCamera.scrollY);
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: event.durationMs,
        onUpdate: (tween) => {
          const progress = tween.getValue() ?? 0;
          const fade = 1 - progress;
          const phase = progress * Math.PI * 14;
          const offsetX = Math.sin(phase) * event.amplitude * fade;
          const offsetY = Math.cos(phase * 0.83) * event.amplitude * fade * 0.65;
          this.shakeCamera?.setScroll(
            (this.shakeOrigin?.x ?? 0) + offsetX,
            (this.shakeOrigin?.y ?? 0) + offsetY,
          );
        },
        onComplete: () => {
          this.restoreParentCamera();
          this.lineIndex += 1;
          this.showLine();
        },
      });
    }
  }

  private handleChapterOneShortcuts(event: KeyboardEvent): void {
    const presentation = this.presentation;
    if (
      event.repeat
      || event.ctrlKey
      || event.metaKey
      || event.altKey
      || presentation?.type !== 'dialogue'
      || presentation.style !== 'chapter1'
    ) {
      return;
    }
    if (event.code === 'KeyR') {
      event.preventDefault();
      this.scene.stop();
      presentation.onRestart?.();
    } else if (event.code === 'Escape') {
      event.preventDefault();
      this.scene.stop();
      presentation.onBack?.();
    }
  }

  private restoreParentCamera(): void {
    if (this.shakeCamera && this.shakeOrigin) {
      this.shakeCamera.setScroll(this.shakeOrigin.x, this.shakeOrigin.y);
    }
    this.shakeCamera = undefined;
    this.shakeOrigin = undefined;
  }

  private releaseEnter(): void {
    this.enterHeld = false;
  }

  private createCinematic(): void {
    const presentation = this.presentation;
    if (!presentation || presentation.type !== 'cinematic') {
      return;
    }

    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x05040a, 0.7)
      .setDepth(1);
    const image = this.add.image(WIDTH / 2, HEIGHT / 2, presentation.texture)
      .setDepth(2);
    image.setScale(Math.min((WIDTH * 0.9) / image.width, (HEIGHT * 0.9) / image.height));
    if (presentation.cameraShake) {
      this.cameras.main.shake(420, presentation.cameraShake);
    }
    this.time.delayedCall(presentation.durationMs, () => this.finish());
  }

  private finish(): void {
    const parentSceneKey = this.presentation?.parentSceneKey;
    if (!parentSceneKey) {
      throw new Error('Narrative presentation cannot resume without a parent scene.');
    }
    this.scene.stop();
    this.scene.resume(parentSceneKey);
  }
}

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
