import Phaser from 'phaser';
import {
  COVER_ASSETS,
  EB_GARAMOND_FONT_FAMILY,
  GAME_CONFIG,
  GAME_FONT_FAMILY,
} from './game-config';
import stripBlackMattes from './strip-black-matte';
import { installChapterOneHotkeys } from './chapter1-hotkeys';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const GOLD = 0xe7bd65;
const CREAM = '#fffaf0';

function createDarkBackground(scene: Phaser.Scene): void {
  scene.add.graphics()
    .fillGradientStyle(0x100e1b, 0x21182c, 0x100e1b, 0x171225)
    .fillRect(0, 0, WIDTH, HEIGHT);
  scene.add.graphics()
    .lineStyle(2, GOLD, 0.45)
    .strokeRoundedRect(48, 48, WIDTH - 96, HEIGHT - 96, 14);
}

function createCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  subtitle: string,
  enabled: boolean,
  onSelect: () => void,
  showText = true,
): void {
  const fill = enabled ? 0x211b2c : 0x17151c;
  const accent = enabled ? GOLD : 0x625b60;
  const color = enabled ? CREAM : '#77727a';
  const panel = scene.add.graphics().setDepth(1);
  panel.fillStyle(fill, 0.96).fillRoundedRect(x, y, width, height, 12);
  panel.lineStyle(3, accent, enabled ? 0.95 : 0.55)
    .strokeRoundedRect(x, y, width, height, 12);

  const heading = scene.add.text(x + width / 2, y + height * 0.38, title, {
    fontFamily: GAME_FONT_FAMILY,
    fontSize: width < 600 ? '27px' : '34px',
    fontStyle: 'bold',
    letterSpacing: 2,
    color,
    align: 'center',
    wordWrap: { width: width - 48 },
  }).setOrigin(0.5).setDepth(2).setVisible(showText);
  const detail = scene.add.text(x + width / 2, y + height * 0.68, subtitle, {
    fontFamily: EB_GARAMOND_FONT_FAMILY,
    fontSize: width < 600 ? '24px' : '28px',
    color,
    align: 'center',
    wordWrap: { width: width - 56 },
  }).setOrigin(0.5).setDepth(2).setVisible(showText);

  if (enabled) {
    const hitArea = scene.add.rectangle(
      x + width / 2,
      y + height / 2,
      width,
      height,
      0xffffff,
      0,
    ).setDepth(3).setInteractive({ useHandCursor: true });
    hitArea.on('pointerover', () => {
      panel.clear();
      panel.fillStyle(0x30253b, 1).fillRoundedRect(x, y, width, height, 12);
      panel.lineStyle(4, GOLD, 1).strokeRoundedRect(x, y, width, height, 12);
      heading.setScale(1.02);
      detail.setScale(1.02);
    });
    hitArea.on('pointerout', () => {
      panel.clear();
      panel.fillStyle(fill, 0.96).fillRoundedRect(x, y, width, height, 12);
      panel.lineStyle(3, accent, 0.95).strokeRoundedRect(x, y, width, height, 12);
      heading.setScale(1);
      detail.setScale(1);
    });
    hitArea.on('pointerdown', onSelect);
  }
}

export class ChapterSelectScene extends Phaser.Scene {
  private starting = false;
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat || this.starting) {
      return;
    }
    if (event.key === '1') {
      this.start('scene_ch1_welcome');
    } else if (event.key === '2') {
      this.start('escena_bienvenida');
    }
  };

  constructor() {
    super({ key: 'scene_chapter_select' });
  }

  preload(): void {
    this.load.image('iobrontes_portada', COVER_ASSETS.iobrontes);
    this.load.image('kosmelys_portada', COVER_ASSETS.kosmelys);
  }

  // Miniature of the Chapter XXIX welcome screen, drawn at 1920x1080 and scaled to fit the card.
  private createChapter29Preview(x: number, y: number, width: number, height: number): void {
    stripBlackMattes(this.textures, ['iobrontes_portada', 'kosmelys_portada']);
    const scale = Math.min(width / WIDTH, height / HEIGHT);
    const originX = x + (width - WIDTH * scale) / 2;
    const originY = y + (height - HEIGHT * scale) / 2;
    const container = this.add.container(originX, originY).setScale(scale).setDepth(2);
    const background = this.add.graphics()
      .fillGradientStyle(0x140b23, 0x760078, 0x190b29, 0x4c075e)
      .fillRect(0, 0, WIDTH, HEIGHT);
    const iobrontes = this.add.image(202.5, 560, 'iobrontes_portada').setDisplaySize(405, 1080);
    const kosmelys = this.add.image(WIDTH - 252, 560, 'kosmelys_portada').setDisplaySize(504, 1080);
    const style = (size: number): Phaser.Types.GameObjects.Text.TextStyle => ({
      fontFamily: GAME_FONT_FAMILY,
      fontSize: `${size}px`,
      fontStyle: 'bold',
      letterSpacing: 8,
      color: CREAM,
      align: 'center',
    });
    const title = this.add.text(WIDTH / 2, 380, 'CHAPTER XXIX', style(84)).setOrigin(0.5);
    const subtitle = this.add.text(WIDTH / 2, 540, 'COSMIC RAYS', style(66)).setOrigin(0.5);
    container.add([background, iobrontes, kosmelys, title, subtitle]);
    this.add.graphics().setDepth(3)
      .lineStyle(3, GOLD, 0.95)
      .strokeRoundedRect(x, y, width, height, 12);
  }

  create(): void {
    this.starting = false;
    createDarkBackground(this);
    this.add.text(WIDTH / 2, 145, 'THE DEXIAD', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '56px',
      fontStyle: 'bold',
      letterSpacing: 9,
      color: CREAM,
      align: 'center',
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 236, 'SELECT A CHAPTER', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '34px',
      letterSpacing: 5,
      color: '#f5d47d',
      align: 'center',
    }).setOrigin(0.5);

    createCard(
      this,
      230,
      365,
      690,
      390,
      'CHAPTER I',
      'TRAINING BEYOND THE WALLS',
      true,
      () => this.start('scene_ch1_welcome'),
    );
    createCard(
      this,
      1000,
      365,
      690,
      390,
      'CHAPTER XXIX',
      'COSMIC RAYS',
      true,
      () => this.start('escena_bienvenida'),
      false,
    );
    this.createChapter29Preview(1000, 365, 690, 390);
    this.add.text(WIDTH / 2, 872, 'Press 1 for Chapter I     ·     Press 2 for Chapter XXIX', {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '27px',
      color: CREAM,
      align: 'center',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown', this.onKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.onKeyDown, this);
    });
  }

  private start(sceneKey: string): void {
    if (this.starting) {
      return;
    }
    this.starting = true;
    this.scene.start(sceneKey);
  }
}

export class ChapterOneWelcomeScene extends Phaser.Scene {
  private starting = false;
  private readonly onEnter = (): void => this.start();

  constructor() {
    super({ key: 'scene_ch1_welcome' });
  }

  create(): void {
    this.starting = false;
    installChapterOneHotkeys(this, { backScene: 'scene_chapter_select' });
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x100e1b).setOrigin(0);
    this.add.graphics()
      .lineStyle(2, GOLD, 0.7)
      .strokeRoundedRect(80, 80, WIDTH - 160, HEIGHT - 160, 12);
    this.add.text(WIDTH / 2, 275, 'CHAPTER I', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '58px',
      fontStyle: 'bold',
      letterSpacing: 8,
      color: CREAM,
      align: 'center',
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 410, 'TRAINING BEYOND THE WALLS', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '42px',
      letterSpacing: 5,
      color: '#f5d47d',
      align: 'center',
      wordWrap: { width: 1400 },
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 910, 'PRESS ENTER OR CLICK TO CONTINUE', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '28px',
      fontStyle: 'bold',
      letterSpacing: 3,
      color: CREAM,
      align: 'center',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-ENTER', this.onEnter, this);
    this.input.on('pointerdown', this.onEnter, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ENTER', this.onEnter, this);
      this.input.off('pointerdown', this.onEnter, this);
    });
  }

  private start(): void {
    if (this.starting) {
      return;
    }
    this.starting = true;
    this.scene.start('scene_ch1_select');
  }
}

interface EncounterOption {
  title: string;
  subtitle: string;
  enabled: boolean;
  sceneKey?: string;
}

const ENCOUNTERS: EncounterOption[] = [
  { title: 'COMBAT I — WILD BOAR', subtitle: 'AVAILABLE', enabled: true, sceneKey: 'scene_ch1_combat1' },
  { title: 'COMBAT II — TWO WILD BOARS', subtitle: 'AVAILABLE', enabled: true, sceneKey: 'scene_ch1_combat2' },
  { title: 'COMBAT III — WOLF', subtitle: 'AVAILABLE', enabled: true, sceneKey: 'scene_ch1_combat3' },
  { title: 'COMBAT IV — TWO WOLVES', subtitle: 'AVAILABLE', enabled: true, sceneKey: 'scene_ch1_combat4' },
  { title: 'COMBAT V — TWO FURIOUS BOARS', subtitle: 'AVAILABLE', enabled: true, sceneKey: 'scene_ch1_combat5' },
  { title: 'COMBAT VI — MIXED ENCOUNTER', subtitle: 'AVAILABLE', enabled: true, sceneKey: 'scene_ch1_combat6' },
  { title: 'COMBAT VII — THE BEAST', subtitle: 'AVAILABLE', enabled: true, sceneKey: 'scene_ch1_combat7' },
];

export class ChapterOneSelectScene extends Phaser.Scene {
  private starting = false;
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!event.repeat && ['1', '2', '3', '4', '5', '6', '7'].includes(event.key)) {
      this.startCombat(ENCOUNTERS[Number(event.key) - 1]);
    }
  };

  constructor() {
    super({ key: 'scene_ch1_select' });
  }

  create(): void {
    this.starting = false;
    installChapterOneHotkeys(this, { backScene: 'scene_ch1_welcome' });
    createDarkBackground(this);
    this.add.text(WIDTH / 2, 120, 'CHAPTER I · TRAINING BEYOND THE WALLS', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '39px',
      fontStyle: 'bold',
      letterSpacing: 3,
      color: CREAM,
      align: 'center',
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 192, 'SELECT AN ENCOUNTER', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '27px',
      letterSpacing: 4,
      color: '#f5d47d',
      align: 'center',
    }).setOrigin(0.5);

    const cardWidth = 540;
    const cardHeight = 170;
    const columns = [130, 690, 1250];
    const rows = [260, 455, 650];
    ENCOUNTERS.forEach((encounter, index) => {
      const row = Math.floor(index / columns.length);
      const column = index % columns.length;
      createCard(
        this,
        columns[column],
        rows[row],
        cardWidth,
        cardHeight,
        encounter.title,
        encounter.subtitle,
        encounter.enabled,
        () => this.startCombat(encounter),
      );
    });
    const back = this.add.text(WIDTH / 2, 925, 'RETURN TO CHAPTER SELECT', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '28px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: CREAM,
      backgroundColor: '#211b2c',
      padding: { x: 28, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor('#f5d47d'));
    back.on('pointerout', () => back.setColor(CREAM));
    back.on('pointerdown', () => this.start('scene_chapter_select'));

    this.input.keyboard?.on('keydown', this.onKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.onKeyDown, this);
    });
  }

  private startCombat(encounter: EncounterOption): void {
    if (encounter.enabled && encounter.sceneKey) {
      this.start(encounter.sceneKey);
    }
  }

  private start(sceneKey: string): void {
    if (this.starting) {
      return;
    }
    this.starting = true;
    this.scene.start(sceneKey);
  }
}
