import Phaser from 'phaser';
import {
  EB_GARAMOND_FONT_FAMILY,
  GAME_CONFIG,
  GAME_FONT_FAMILY,
} from './game-config';

export const TUTORIAL_POPUP_SCENE_KEY = 'tutorial-instruction-popup';

export const TUTORIAL_MESSAGES = {
  introduction: {
    title: 'WELCOME TO THE DEXIAD',
    paragraphs: [
      'Welcome to combat in The Dexiad!',
      'In this tutorial, the gods will deal less damage and take more time to perform their abilities, giving you a better opportunity to practice.',
      "You can also freely train each character's abilities in their dedicated practice section.",
    ],
    keys: [],
  },
  lightningChain: {
    title: 'LIGHTNING CHAIN',
    paragraphs: [
      'Iobrontes launches {count} consecutive lightning bolts from four possible directions.',
      'Defend yourself with the direction shown by the incoming attack, timing your input as the circle closes.',
    ],
    keys: ['W', 'A', 'S', 'D'],
  },
  watchTheThunder: {
    title: 'WATCH THE THUNDER',
    paragraphs: [
      'Iobrontes unleashes a powerful attack that strikes your entire party. In this phase, the attack sweeps {count}.',
      'Jump during each timing window to avoid each sweep.',
    ],
    keys: ['SPACE'],
  },
  divineRetribution: {
    title: 'DIVINE RETRIBUTION',
    paragraphs: [
      'Iobrontes surrounds his body with electricity, creating a temporary protective state.',
      'If you attack him while this effect is active, he will still receive damage, but your attacking character will suffer a powerful retaliation.',
    ],
    keys: [],
  },
  cosmicRays: {
    title: 'COSMIC RAYS',
    paragraphs: [
      'Kosmelys launches {count} consecutive cosmic attacks from four possible directions.',
      'Defend yourself in the incoming direction as the timing circle closes.',
      'Be careful! Each projectile changes direction halfway through its journey. You must defend against its final direction.',
    ],
    keys: ['W', 'A', 'S', 'D'],
  },
  meteorRain: {
    title: 'METEOR RAIN',
    paragraphs: [
      'Kosmelys unleashes a barrage of {count} meteors, randomly targeting members of your party.',
      'Press the defense key as the timing circle closes to defend against each incoming meteor and avoid damage.',
    ],
    keys: ['W'],
  },
  portalShield: {
    title: 'PORTAL SHIELD',
    paragraphs: [
      'Kosmelys protects herself with a spatial portal that remains active until an allied character performs an action.',
      'If she receives an attack while the portal is active, she redirects that attack toward a randomly selected member of your party.',
    ],
    keys: [],
  },
  tigerFang: {
    title: 'TIGER FANG',
    paragraphs: ['Press [A] or [D] when the circle shrinks completely.'],
    keys: [],
  },
  armorBreak: {
    title: 'ARMOR BREAK',
    paragraphs: ['With [A] or [D] keep the circle inside the box.'],
    keys: [],
  },
  electricArc: {
    title: 'ELECTRIC ARC',
    paragraphs: ['Hold [A] and [D] and release at the right time.'],
    keys: [],
  },
  chaoticLightning: {
    title: 'CHAOTIC LIGHTNING',
    paragraphs: ['Press the key shown on screen.'],
    keys: [],
  },
  hippopotamusShield: {
    title: 'HIPPOPOTAMUS SHIELD',
    paragraphs: ['Press [SPACE] when the small circle is inside the large one.'],
    keys: [],
  },
  flameDance: {
    title: 'FLAME DANCE',
    paragraphs: ['Press [W], [A], [S], [D] in order.'],
    keys: [],
  },
  figureShards: {
    title: 'FIGURE SHARDS',
    paragraphs: ['Press [S] 10 times.'],
    keys: [],
  },
} as const;

export type TutorialMessageId = keyof typeof TUTORIAL_MESSAGES;

export interface TutorialPopupData {
  parentSceneKey: string;
  title: string;
  paragraphs: string[];
  keys: string[];
}

export default class TutorialPopupScene extends Phaser.Scene {
  private parentSceneKey = '';
  private popupData?: TutorialPopupData;

  constructor() {
    super({ key: TUTORIAL_POPUP_SCENE_KEY });
  }

  init(data: TutorialPopupData): void {
    this.parentSceneKey = data.parentSceneKey;
    this.popupData = data;
  }

  create(): void {
    const data = this.popupData;
    if (!data) {
      throw new Error('Tutorial popup scene started without message data.');
    }
    const width = GAME_CONFIG.canvas.width;
    const height = GAME_CONFIG.canvas.height;
    const panelWidth = width * 0.6;
    const panelHeight = height * 0.6;
    const left = (width - panelWidth) / 2;
    const top = (height - panelHeight) / 2;
    const centerX = width / 2;
    const panel = this.add.graphics().setDepth(1);
    panel.fillStyle(0x000000, 0.58).fillRect(0, 0, width, height);
    panel.fillStyle(0x05040a, 1).fillRoundedRect(left, top, panelWidth, panelHeight, 8);
    panel.lineStyle(4, 0xe7bd65, 1).strokeRoundedRect(left, top, panelWidth, panelHeight, 8);
    panel.lineStyle(1, 0x8e6d32, 0.85)
      .strokeRoundedRect(left + 12, top + 12, panelWidth - 24, panelHeight - 24, 5);

    this.add.text(centerX, top + 58, data.title, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '38px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: '#f5d47d',
      align: 'center',
      wordWrap: { width: panelWidth - 100 },
    }).setOrigin(0.5).setDepth(2);

    let paragraphY = top + 132;
    data.paragraphs.forEach((paragraph) => {
      paragraphY += this.drawRichParagraph(paragraph, left + 64, paragraphY, panelWidth - 128) + 24;
    });

    if (data.keys.length > 0) {
      const keyWidth = data.keys.length === 1 ? 118 : 76;
      const keyGap = 14;
      const totalWidth = data.keys.length * keyWidth + (data.keys.length - 1) * keyGap;
      const keyTop = Math.min(paragraphY + 2, top + panelHeight - 178);
      let keyX = centerX - totalWidth / 2;
      data.keys.forEach((key) => {
        const label = key === 'SPACE' ? 'SPACE' : key;
        const badgeWidth = key === 'SPACE' ? 140 : 72;
        const badgeLeft = keyX + (keyWidth - badgeWidth) / 2;
        const badge = this.add.graphics().setDepth(2);
        badge.fillStyle(0x24152c, 1)
          .fillRoundedRect(badgeLeft, keyTop, badgeWidth, 54, 8)
          .lineStyle(3, 0xe7bd65, 1)
          .strokeRoundedRect(badgeLeft, keyTop, badgeWidth, 54, 8);
        this.add.text(badgeLeft + badgeWidth / 2, keyTop + 27, label, {
          fontFamily: GAME_FONT_FAMILY,
          fontSize: key === 'SPACE' ? '19px' : '25px',
          fontStyle: 'bold',
          color: '#f5d47d',
          align: 'center',
        }).setOrigin(0.5).setDepth(3);
        keyX += keyWidth + keyGap;
      });
    }

    const footerY = top + panelHeight - 58;
    const enterWidth = 142;
    const enterHeight = 48;
    const right = left + panelWidth - 64;
    const continueText = this.add.text(right, footerY, 'CONTINUE', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '25px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: '#fffaf0',
      align: 'center',
    }).setOrigin(1, 0.5).setDepth(3);
    const enterX = right - continueText.width - 20 - enterWidth;
    const enter = this.add.graphics().setDepth(2);
    enter.fillStyle(0x24152c, 1)
      .fillRoundedRect(enterX, footerY - enterHeight / 2, enterWidth, enterHeight, 8)
      .lineStyle(3, 0xe7bd65, 1)
      .strokeRoundedRect(enterX, footerY - enterHeight / 2, enterWidth, enterHeight, 8);
    this.add.text(enterX + enterWidth / 2, footerY, 'ENTER', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '23px',
      fontStyle: 'bold',
      color: '#f5d47d',
      align: 'center',
    }).setOrigin(0.5).setDepth(3);
    this.input.keyboard?.on('keydown-ENTER', this.closePopup, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ENTER', this.closePopup, this);
    });
  }

  // Lays out a paragraph word by word; [KEY] tokens become gold bordered key badges.
  private drawRichParagraph(paragraph: string, x: number, y: number, maxWidth: number): number {
    const lineHeight = 50;
    const gap = 11;
    let cursorX = x;
    let line = 0;
    paragraph.split(/(\[[^\]]+\])/).forEach((part) => {
      const isKey = part.startsWith('[') && part.endsWith(']');
      const pieces = isKey ? [part.slice(1, -1)] : part.split(/\s+/).filter(Boolean);
      pieces.forEach((piece) => {
        const centerY = y + line * lineHeight + lineHeight / 2;
        const label = this.add.text(0, centerY, piece, isKey
          ? {
            fontFamily: GAME_FONT_FAMILY,
            fontSize: piece.length > 1 ? '22px' : '26px',
            fontStyle: 'bold',
            color: '#f5d47d',
          }
          : {
            fontFamily: EB_GARAMOND_FONT_FAMILY,
            fontSize: '31px',
            color: '#f3eee4',
          }).setOrigin(0, 0.5).setDepth(3);
        const width = isKey ? Math.max(label.width + 28, 52) : label.width;
        if (cursorX + width > x + maxWidth && cursorX > x) {
          line += 1;
          cursorX = x;
          label.setY(y + line * lineHeight + lineHeight / 2);
        }
        const itemY = label.y;
        if (isKey) {
          const badge = this.add.graphics().setDepth(2);
          badge.fillStyle(0x24152c, 1)
            .fillRoundedRect(cursorX, itemY - 24, width, 48, 8)
            .lineStyle(3, 0xe7bd65, 1)
            .strokeRoundedRect(cursorX, itemY - 24, width, 48, 8);
          label.setX(cursorX + (width - label.width) / 2);
        } else {
          label.setX(cursorX);
        }
        cursorX += width + gap;
      });
    });
    return (line + 1) * lineHeight;
  }

  private closePopup(event: KeyboardEvent): void {
    if (event.repeat) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.scene.stop();
    this.scene.resume(this.parentSceneKey);
  }
}
