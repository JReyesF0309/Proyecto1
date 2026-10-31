import Phaser from 'phaser';
import { EB_GARAMOND_FONT_FAMILY, GAME_CONFIG, GAME_FONT_FAMILY } from './game-config';

export const NARRATIVE_PRESENTATION_SCENE_KEY = 'escena_presentacion_narrativa';

export interface NarrativeDialogueLine {
  speaker: string;
  portrait: string;
  text: string;
  holdMs?: number;
}

export type NarrativePresentationData =
  | {
    parentSceneKey: string;
    type: 'dialogue';
    lines: NarrativeDialogueLine[];
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
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.input.keyboard?.off('keydown-ENTER', this.advanceDialogue, this);
        this.input.keyboard?.off('keyup-ENTER', this.releaseEnter, this);
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

    this.children.getChildren()
      .filter((child) => child.getData('dialogue-dynamic') === true)
      .forEach((child) => child.destroy());

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

  private advanceDialogue(event: KeyboardEvent): void {
    if (event.repeat || this.enterHeld || !this.canAdvance) {
      return;
    }
    event.preventDefault();
    this.enterHeld = true;
    this.lineIndex += 1;
    this.showLine();
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
