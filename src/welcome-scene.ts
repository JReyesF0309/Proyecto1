import Phaser from 'phaser';
import { COVER_ASSETS, GAME_CONFIG } from './game-config';
import stripBlackMattes from './strip-black-matte';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const WHITE = '#fffaf0';
const GOLD = 0xe7bd65;
const FONT = '"Palatino Linotype", "Book Antiqua", Georgia, serif';

export default class WelcomeScene extends Phaser.Scene {
  private readonly onEnter = (): void => {
    this.startCombat();
  };

  constructor() {
    super({ key: 'escena_bienvenida' });
  }

  preload(): void {
    this.load.image('iobrontes_portada', COVER_ASSETS.iobrontes);
    this.load.image('kosmelys_portada', COVER_ASSETS.kosmelys);
  }

  create(): void {
    stripBlackMattes(this.textures, ['iobrontes_portada', 'kosmelys_portada']);
    this.createBackground();
    this.createPortraits();
    this.createWelcomeText();
    this.createControls();
    this.createContinuePrompt();

    this.input.keyboard?.on('keydown-ENTER', this.onEnter, this);
    this.input.on('pointerdown', this.onEnter, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ENTER', this.onEnter, this);
      this.input.off('pointerdown', this.onEnter, this);
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

    this.add.graphics()
      .lineStyle(2, GOLD, 0.45)
      .lineBetween(480, 141, 1440, 141)
      .lineBetween(480, 951, 1440, 951);
  }

  private createPortraits(): void {
    const iobrontes = this.add.image(202.5, 560, 'iobrontes_portada')
      .setDisplaySize(405, 1080)
      .setAlpha(0.98);
    const kosmelys = this.add.image(WIDTH - 252, 560, 'kosmelys_portada')
      .setDisplaySize(504, 1080)
      .setAlpha(0.98);

    iobrontes.setDepth(1);
    kosmelys.setDepth(1);
  }

  private createWelcomeText(): void {
    this.add.text(WIDTH / 2, 48, 'LA DEXÍADA', {
      fontFamily: FONT,
      fontSize: '51px',
      fontStyle: 'bold',
      letterSpacing: 9,
      color: WHITE,
      align: 'center',
      stroke: '#25102d',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(2);

    this.add.text(WIDTH / 2, 103, 'CHAPTER XXIX  ·  THE COSMIC RAY', {
      fontFamily: FONT,
      fontSize: '25px',
      letterSpacing: 5,
      color: WHITE,
      align: 'center',
    }).setOrigin(0.5).setDepth(2);

    this.add.text(
      WIDTH / 2,
      164,
      'Welcome, warrior, to a turn-based RPG with real-time defense.\nRespond to each attack according to its direction.',
      {
        fontFamily: FONT,
        fontSize: '27px',
        color: WHITE,
        align: 'center',
        lineSpacing: 12,
        wordWrap: { width: 1080 },
      },
    ).setOrigin(0.5, 0).setDepth(2);

    this.add.text(WIDTH / 2, 293, 'DEFEND IN THE DIRECTION OF THE ATTACK', {
      fontFamily: FONT,
      fontSize: '20px',
      fontStyle: 'bold',
      letterSpacing: 3,
      color: WHITE,
      align: 'center',
    }).setOrigin(0.5).setDepth(2);

    this.add.text(
      WIDTH / 2 + 150,
      430,
      'Use it when an attack targets\nthe entire party.',
      {
        fontFamily: FONT,
        fontSize: '21px',
        color: WHITE,
        align: 'left',
        lineSpacing: 8,
      },
    ).setOrigin(0, 0.5).setDepth(2);

    this.add.text(
      WIDTH / 2,
      533,
      'A shrinking circle reveals the timing.\nBlock normally, or strike at the perfect moment.',
      {
        fontFamily: FONT,
        fontSize: '23px',
        color: WHITE,
        align: 'center',
        lineSpacing: 10,
        wordWrap: { width: 1080 },
      },
    ).setOrigin(0.5, 0).setDepth(2);

    this.add.text(
      WIDTH / 2,
      665,
      'Face two formidable bosses with four heroes.\nEach hero has a distinct strategy and mechanics',
      {
        fontFamily: FONT,
        fontSize: '23px',
        color: WHITE,
        align: 'center',
        lineSpacing: 10,
        wordWrap: { width: 1080 },
      },
    ).setOrigin(0.5, 0).setDepth(2);

    this.add.text(WIDTH / 2, 855, 'MAY THE GODS GUIDE YOU, WARRIOR', {
      fontFamily: FONT,
      fontSize: '21px',
      fontStyle: 'bold',
      letterSpacing: 4,
      color: WHITE,
      align: 'center',
    }).setOrigin(0.5).setDepth(2);
  }

  private createControls(): void {
    const keyWidth = 68;
    const keyHeight = 62;
    const centerX = WIDTH / 2;
    const keyY = 361;
    const keyGap = 18;
    const keySpacing = keyWidth + keyGap;
    ['W', 'A', 'S', 'D'].forEach((key, index) => {
      this.createKeycap(
        key,
        centerX + (index - 1.5) * keySpacing,
        keyY,
        keyWidth,
        keyHeight,
      );
    });

    const spaceY = 442;
    const spaceWidth = 220;
    const spaceHeight = 48;
    this.add.graphics()
      .fillStyle(0x16101c, 1)
      .fillRoundedRect(centerX - spaceWidth / 2 + 5, spaceY - spaceHeight / 2 + 6, spaceWidth, spaceHeight, 9)
      .fillStyle(0x352719, 1)
      .fillRoundedRect(centerX - spaceWidth / 2, spaceY - spaceHeight / 2, spaceWidth, spaceHeight, 9)
      .lineStyle(3, GOLD, 1)
      .strokeRoundedRect(centerX - spaceWidth / 2, spaceY - spaceHeight / 2, spaceWidth, spaceHeight, 9)
      .setDepth(2);
    this.add.text(centerX, spaceY, 'SPACE BAR', {
      fontFamily: FONT,
      fontSize: '19px',
      fontStyle: 'bold',
      letterSpacing: 5,
      color: '#f5d47d',
      align: 'center',
    }).setOrigin(0.5).setDepth(3);
  }

  private createKeycap(
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    this.add.graphics()
      .fillStyle(0x16101c, 1)
      .fillRoundedRect(x - width / 2 + 5, y - height / 2 + 6, width, height, 10)
      .fillStyle(0x352719, 1)
      .fillRoundedRect(x - width / 2, y - height / 2, width, height, 10)
      .lineStyle(3, GOLD, 1)
      .strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10)
      .setDepth(2);
    this.add.text(x, y, label, {
      fontFamily: FONT,
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#f5d47d',
      align: 'center',
    }).setOrigin(0.5).setDepth(3);
  }

  private createContinuePrompt(): void {
    this.add.text(WIDTH / 2, 1017, 'PRESS ENTER OR CLICK TO BEGIN', {
      fontFamily: FONT,
      fontSize: '18px',
      fontStyle: 'bold',
      letterSpacing: 4,
      color: WHITE,
      align: 'center',
    }).setOrigin(0.5).setDepth(2);
  }

  private startCombat(): void {
    this.scene.start('escena_combate_dificil');
  }
}
