import Phaser from 'phaser';
import {
  COVER_ASSETS,
  EB_GARAMOND_FONT_FAMILY,
  GAME_CONFIG,
  GAME_FONT_FAMILY,
} from './game-config';
import stripBlackMattes from './strip-black-matte';
import { installChapterOneHotkeys } from './chapter1-hotkeys';
import { bindPhaserMusic } from './audio-settings';
import menuMusicUrl from '../assets/music/start.mp3';

const MENU_MUSIC_KEY = 'welcome-music';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const GOLD = 0xe7bd65;
const CREAM = '#fffaf0';
const CHAPTER_ONE_COVER_KEY = 'ch1_cover';
// Centre of the area to the right of Dexios' portrait on the Chapter 1 cover.
const TEXT_CENTER_X = 1230;

// Plays the Chapter XXIX welcome theme while a menu scene is active.
function playMenuMusic(scene: Phaser.Scene): void {
  const music = scene.sound.add(MENU_MUSIC_KEY, { loop: true, volume: GAME_CONFIG.audio.music });
  const unbind = bindPhaserMusic(music);
  music.play();
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    unbind();
    music.stop();
    music.destroy();
  });
}

function createDarkBackground(scene: Phaser.Scene, chapterOne = false): void {
  const background = scene.add.graphics();
  if (chapterOne) {
    background
      .fillGradientStyle(0x075994, 0x087b9b, 0x087d4d, 0x16833a)
      .fillRect(0, 0, WIDTH, HEIGHT);
    background
      .fillStyle(0x60d4b0, 0.08)
      .fillEllipse(WIDTH / 2, HEIGHT / 2, 1500, 900);
    background
      .lineStyle(2, GOLD, 0.55)
      .strokeRoundedRect(48, 48, WIDTH - 96, HEIGHT - 96, 14)
      .lineBetween(280, 218, WIDTH - 280, 218)
      .lineBetween(280, 875, WIDTH - 280, 875);
    return;
  }
  background
    .fillGradientStyle(0x100e1b, 0x21182c, 0x100e1b, 0x171225)
    .fillRect(0, 0, WIDTH, HEIGHT);
  scene.add.graphics()
    .lineStyle(2, GOLD, 0.45)
    .strokeRoundedRect(48, 48, WIDTH - 96, HEIGHT - 96, 14);
}

interface CardPresentation {
  chapterOne?: boolean;
  coverTexture?: string;
  onHover?: (over: boolean) => void;
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
  presentation: CardPresentation = {},
): void {
  const fill = presentation.coverTexture
    ? 0x07121a
    : presentation.chapterOne
      ? enabled ? 0x104858 : 0x18323b
      : enabled ? 0x211b2c : 0x17151c;
  const accent = enabled ? GOLD : 0x625b60;
  const color = enabled ? CREAM : '#77727a';
  if (presentation.coverTexture) {
    const cover = scene.add.image(x + width / 2, y + height / 2, presentation.coverTexture);
    const scale = Math.max(width / cover.width, height / cover.height);
    const cropWidth = width / scale;
    const cropHeight = height / scale;
    cover.setCrop(
      (cover.width - cropWidth) / 2,
      (cover.height - cropHeight) / 2,
      cropWidth,
      cropHeight,
    ).setScale(scale).setDepth(0);
  }
  const panel = scene.add.graphics().setDepth(1);
  panel.fillStyle(fill, presentation.coverTexture ? 0.38 : 0.96).fillRoundedRect(x, y, width, height, 12);
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
      panel.fillStyle(
        presentation.coverTexture ? 0x07585a : presentation.chapterOne ? 0x17606a : 0x30253b,
        presentation.coverTexture ? 0.55 : 1,
      ).fillRoundedRect(x, y, width, height, 12);
      panel.lineStyle(4, GOLD, 1).strokeRoundedRect(x, y, width, height, 12);
      heading.setScale(1.02);
      detail.setScale(1.02);
      presentation.onHover?.(true);
    });
    hitArea.on('pointerout', () => {
      panel.clear();
      panel.fillStyle(fill, presentation.coverTexture ? 0.38 : 0.96).fillRoundedRect(x, y, width, height, 12);
      panel.lineStyle(3, accent, 0.95).strokeRoundedRect(x, y, width, height, 12);
      heading.setScale(1);
      detail.setScale(1);
      presentation.onHover?.(false);
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
    if (!this.textures.exists(CHAPTER_ONE_COVER_KEY)) {
      this.load.image(CHAPTER_ONE_COVER_KEY, COVER_ASSETS.chapter1);
    }
    this.load.image('iobrontes_portada', COVER_ASSETS.iobrontes);
    this.load.image('kosmelys_portada', COVER_ASSETS.kosmelys);
    this.load.audio(MENU_MUSIC_KEY, menuMusicUrl);
  }

  private createGlow(x: number, y: number, width: number, height: number): Phaser.GameObjects.Graphics {
    const glow = this.add.graphics().setDepth(4).setVisible(false);
    for (let i = 1; i <= 6; i += 1) {
      glow.lineStyle(3 + i * 3, 0xffffff, 0.5 / i)
        .strokeRoundedRect(x - i * 2, y - i * 2, width + i * 4, height + i * 4, 12 + i * 2);
    }
    glow.lineStyle(4, 0xffffff, 1).strokeRoundedRect(x, y, width, height, 12);
    return glow;
  }

  // Miniature of the Chapter I welcome screen, drawn at 1920x1080 and scaled to fit the card.
  private createChapter1Preview(x: number, y: number, width: number, height: number): void {
    const scale = Math.min(width / WIDTH, height / HEIGHT);
    const originX = x + (width - WIDTH * scale) / 2;
    const originY = y + (height - HEIGHT * scale) / 2;
    const container = this.add.container(originX, originY).setScale(scale).setDepth(2);
    const cover = this.add.image(WIDTH / 2, HEIGHT / 2, CHAPTER_ONE_COVER_KEY);
    cover.setScale(Math.max(WIDTH / cover.width, HEIGHT / cover.height));
    const style = (size: number): Phaser.Types.GameObjects.Text.TextStyle => ({
      fontFamily: GAME_FONT_FAMILY,
      fontSize: `${size}px`,
      fontStyle: 'bold',
      letterSpacing: 8,
      color: CREAM,
      align: 'center',
      stroke: '#064052',
      strokeThickness: 10,
    });
    const title = this.add.text(TEXT_CENTER_X, 380, 'CHAPTER I', style(84)).setOrigin(0.5);
    const subtitle = this.add.text(TEXT_CENTER_X, 540, 'TRAINING BEYOND\nTHE WALLS', {
      ...style(66),
      lineSpacing: 12,
    }).setOrigin(0.5);
    container.add([cover, title, subtitle]);
    this.add.graphics().setDepth(3)
      .lineStyle(3, GOLD, 0.95)
      .strokeRoundedRect(x, y, width, height, 12);
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
    playMenuMusic(this);
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

    const chapterOneGlow = this.createGlow(230, 365, 690, 390);
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
      false,
      { onHover: (over) => chapterOneGlow.setVisible(over) },
    );
    this.createChapter1Preview(230, 365, 690, 390);
    const chapter29Glow = this.createGlow(1000, 365, 690, 390);
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
      { onHover: (over) => chapter29Glow.setVisible(over) },
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

  preload(): void {
    if (!this.textures.exists(CHAPTER_ONE_COVER_KEY)) {
      this.load.image(CHAPTER_ONE_COVER_KEY, COVER_ASSETS.chapter1);
    }
    this.load.audio(MENU_MUSIC_KEY, menuMusicUrl);
  }

  create(): void {
    this.starting = false;
    installChapterOneHotkeys(this, { backScene: 'scene_chapter_select' });
    playMenuMusic(this);
    const cover = this.add.image(WIDTH / 2, HEIGHT / 2, CHAPTER_ONE_COVER_KEY);
    cover.setScale(Math.max(WIDTH / cover.width, HEIGHT / cover.height));
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x061d25, 0.12);
    this.add.text(TEXT_CENTER_X, 78, 'CHAPTER I: TRAINING BEYOND THE WALLS', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '40px',
      fontStyle: 'bold',
      letterSpacing: 4,
      color: '#fff5d5',
      align: 'center',
      wordWrap: { width: 1250 },
      stroke: '#064052',
      strokeThickness: 7,
      shadow: { offsetX: 2, offsetY: 3, color: '#03242d', blur: 8, fill: true },
    }).setOrigin(0.5);
    this.add.text(
      TEXT_CENTER_X,
      540,
      'Join Dexios as he ventures beyond the borders of his homeland, Xantharchía. With 17 days left until the Xanthan Games, he faces a trial he considers necessary to become a Myrmidon.',
      {
        fontFamily: EB_GARAMOND_FONT_FAMILY,
        fontSize: '40px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12,
        wordWrap: { width: 960, useAdvancedWrap: true },
        stroke: '#064052',
        strokeThickness: 5,
        shadow: { offsetX: 2, offsetY: 3, color: '#03242d', blur: 8, fill: true },
      },
    ).setOrigin(0.5);
    this.add.text(WIDTH / 2, 978, 'MAY THE AETHER GUIDE YOU', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '30px',
      fontStyle: 'bold',
      letterSpacing: 5,
      color: '#fff5d5',
      align: 'center',
      stroke: '#064052',
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 1026, 'PRESS ENTER OR CLICK TO CONTINUE', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '24px',
      fontStyle: 'bold',
      letterSpacing: 3,
      color: '#ffffff',
      align: 'center',
      stroke: '#064052',
      strokeThickness: 6,
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
    playMenuMusic(this);
    createDarkBackground(this, true);
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
        true,
        { chapterOne: true },
      );
    });
    const back = this.add.text(WIDTH / 2, 925, 'RETURN TO CHAPTER SELECT', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '28px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: CREAM,
      backgroundColor: '#104858',
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
