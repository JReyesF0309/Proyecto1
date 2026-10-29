import Phaser from 'phaser';
import { GAME_CONFIG, GAME_FONT_FAMILY } from './game-config';
import welcomeMusicUrl from '../assets/music/start.mp3';
import godsImage from '../assets/select/iobrontes_kosmelys.png';
import furaiImage from '../assets/select/furai.png';
import dexiosImage from '../assets/select/dexios.png';
import sahiraImage from '../assets/select/sahira.png';
import hazelImage from '../assets/select/hazel_fuego.png';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const GOLD = 0xe7bd65;
const WHITE = '#fffaf0';
const KEY_COLOR = '#f5d47d';

interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectOption {
  id: string;
  image: string;
  crop: Crop;
  label: string;
  key: string;
  keyEvent: string;
  scene: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const PORTRAIT = { width: 270, height: 330, y: 690 };
const COLUMNS = [300, 740, 1180, 1620];

const OPTIONS: SelectOption[] = [
  {
    id: 'combat',
    image: 'select_gods',
    crop: { x: 0, y: 10, width: 768, height: 395 },
    label: 'COMBAT START',
    key: 'ENTER',
    keyEvent: 'keydown-ENTER',
    scene: 'escena_combate_dificil',
    color: WHITE,
    x: WIDTH / 2,
    y: 225,
    width: 700,
    height: 360,
  },
  {
    id: 'furai',
    image: 'select_furai',
    crop: { x: 220, y: 30, width: 330, height: 403 },
    label: 'FURAI TUTORIAL',
    key: 'F',
    keyEvent: 'keydown-F',
    scene: 'escena_furai_prueba',
    color: '#b48cff',
    x: COLUMNS[0],
    ...PORTRAIT,
  },
  {
    id: 'dexios',
    image: 'select_dexios',
    crop: { x: 190, y: 20, width: 330, height: 403 },
    label: 'DEXIOS TUTORIAL',
    key: 'D',
    keyEvent: 'keydown-D',
    scene: 'escena_dexios_prueba',
    color: '#ff7a86',
    x: COLUMNS[1],
    ...PORTRAIT,
  },
  {
    id: 'sahira',
    image: 'select_sahira',
    crop: { x: 245, y: 30, width: 300, height: 366 },
    label: 'SAHIRA TUTORIAL',
    key: 'S',
    keyEvent: 'keydown-S',
    scene: 'escena_sahira_prueba',
    color: '#6fdc8c',
    x: COLUMNS[2],
    ...PORTRAIT,
  },
  {
    id: 'hazel',
    image: 'select_hazel',
    crop: { x: 120, y: 0, width: 520, height: 635 },
    label: 'HAZEL TUTORIAL',
    key: 'H',
    keyEvent: 'keydown-H',
    scene: 'escena_pruebahazel',
    color: '#ffb04d',
    x: COLUMNS[3],
    ...PORTRAIT,
  },
];

export default class SelectScene extends Phaser.Scene {
  private music?: Phaser.Sound.BaseSound;
  private readonly handlers: Array<{ event: string; callback: () => void }> = [];
  private starting = false;

  constructor() {
    super({ key: 'escena_select' });
  }

  preload(): void {
    const images: Array<[string, string]> = [
      ['select_gods', godsImage],
      ['select_furai', furaiImage],
      ['select_dexios', dexiosImage],
      ['select_sahira', sahiraImage],
      ['select_hazel', hazelImage],
    ];
    images.forEach(([key, asset]) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, asset);
      }
    });
    if (!this.cache.audio.exists('welcome-music')) {
      this.load.audio('welcome-music', welcomeMusicUrl);
    }
  }

  create(): void {
    this.starting = false;
    this.handlers.length = 0;
    this.music = this.sound.add('welcome-music', {
      loop: true,
      volume: GAME_CONFIG.audio.music,
    });
    this.music.play();
    this.createBackground();
    OPTIONS.forEach((option) => this.createOption(option));

    this.handlers.forEach(({ event, callback }) => {
      this.input.keyboard?.on(event, callback, this);
    });
    const back = (): void => {
      this.scene.start('escena_bienvenida');
    };
    this.input.keyboard?.on('keydown-ESC', back, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.handlers.forEach(({ event, callback }) => {
        this.input.keyboard?.off(event, callback, this);
      });
      this.input.keyboard?.off('keydown-ESC', back, this);
      this.music?.stop();
    });
  }

  private createBackground(): void {
    this.add.graphics()
      .fillGradientStyle(0x140b23, 0x760078, 0x190b29, 0x4c075e)
      .fillRect(0, 0, WIDTH, HEIGHT);
    const glow = this.add.graphics();
    glow.fillStyle(0x8c1685, 0.08);
    glow.fillEllipse(WIDTH / 2, HEIGHT / 2, 1280, 1000);
    glow.fillStyle(0xb72aa0, 0.035);
    glow.fillEllipse(WIDTH / 2, HEIGHT / 2, 980, 820);
  }

  private createOption(option: SelectOption): void {
    const textureKey = `${option.image}_oval`;
    if (!this.textures.exists(textureKey)) {
      this.createOvalTexture(textureKey, option);
    }
    const portrait = this.add.image(option.x, option.y, textureKey).setDepth(2);
    const border = this.add.graphics().setDepth(3);
    border.lineStyle(4, GOLD, 0.9);
    border.strokeEllipse(option.x, option.y, option.width, option.height);

    const labelY = option.y + option.height / 2 + 38;
    this.add.text(option.x, labelY, option.label, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: option.id === 'combat' ? '40px' : '27px',
      fontStyle: 'bold',
      letterSpacing: 4,
      color: option.color,
      stroke: '#25102d',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5).setDepth(3);
    this.createKeyBadge(option.x, labelY + (option.id === 'combat' ? 62 : 58), option.key);

    portrait.setInteractive({ useHandCursor: true });
    portrait.on('pointerover', () => portrait.setScale(1.04));
    portrait.on('pointerout', () => portrait.setScale(1));
    portrait.on('pointerdown', () => this.start(option.scene));
    this.handlers.push({ event: option.keyEvent, callback: () => this.start(option.scene) });
  }

  // Recorta la ilustración dentro de un óvalo para ocultar los nombres dibujados en ella.
  private createOvalTexture(key: string, option: SelectOption): void {
    const source = this.textures.get(option.image).getSourceImage() as CanvasImageSource;
    const texture = this.textures.createCanvas(key, option.width, option.height);
    if (!texture) {
      return;
    }
    const context = texture.getContext();
    context.save();
    context.beginPath();
    context.ellipse(
      option.width / 2,
      option.height / 2,
      option.width / 2,
      option.height / 2,
      0,
      0,
      Math.PI * 2,
    );
    context.clip();
    context.fillStyle = '#050313';
    context.fillRect(0, 0, option.width, option.height);
    const { crop } = option;
    context.drawImage(
      source,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      option.width,
      option.height,
    );
    context.restore();
    texture.refresh();
  }

  private createKeyBadge(x: number, y: number, label: string): void {
    const width = label.length > 1 ? 150 : 64;
    const height = 56;
    this.add.graphics()
      .fillStyle(0x24152c, 0.95)
      .fillRoundedRect(x - width / 2, y - height / 2, width, height, 10)
      .lineStyle(3, GOLD, 1)
      .strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10)
      .setDepth(3);
    this.add.text(x, y, label, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '27px',
      fontStyle: 'bold',
      color: KEY_COLOR,
      align: 'center',
    }).setOrigin(0.5).setDepth(4);
  }

  private start(scene: string): void {
    if (this.starting) {
      return;
    }
    this.starting = true;
    this.scene.start(scene);
  }
}
