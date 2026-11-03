import Phaser from 'phaser';
import {
  EB_GARAMOND_FONT_FAMILY,
  GAME_CONFIG,
  GAME_FONT_FAMILY,
} from './game-config';
import { audioSettings, bindPhaserMusic } from './audio-settings';
import stripBlackMattes from './strip-black-matte';
import { installChapterOneHotkeys } from './chapter1-hotkeys';
import backgroundUrl from '../assets/backgrounds/ch1_combat1_background.png';
import boarAttackUrl from '../assets/Boar/boar_attack.png';
import boarBaseUrl from '../assets/Boar/boar_base.png';
import boarHurtUrl from '../assets/Boar/boar_hurt.png';
import boarPrepareUrl from '../assets/Boar/boar_prepare.png';
import victoryMusicUrl from '../assets/music/nike.mp3';
import boarAttackSfxUrl from '../assets/sfx/boar_attack.mp3';
import boarHurtSfxUrl from '../assets/sfx/boar_hurt.mp3';
import boarPrepareSfxUrl from '../assets/sfx/boar_prepare.mp3';
import battleMusicUrl from '../assets/music/ch1_battle.mp3';
import dexiosDownUrl from '../assets/dexios/dexios_abajo.png';
import dexiosUpUrl from '../assets/dexios/dexios_arriba.png';
import dexiosBaseUrl from '../assets/dexios/dexios_base.png';
import dexiosRightUrl from '../assets/dexios/dexios_derecha.png';
import dexiosHurtUrl from '../assets/dexios/dexios_herido.png';
import dexiosLeftUrl from '../assets/dexios/dexios_izquierda.png';
import dexiosIconUrl from '../assets/dexios/dexios_icono.png';
import dexiosTripleOneUrl from '../assets/dexios/dexios_triple1.png';
import dexiosTripleTwoUrl from '../assets/dexios/dexios_triple2.png';
import dexiosTripleThreeUrl from '../assets/dexios/dexios_triple3.png';
import dexiosSoundUrl from '../assets/sfx/dexios.mp3';
import perfectParrySoundUrl from '../assets/sfx/perfect_block.mp3';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const COLORS = {
  ink: 0x100e1b,
  panel: 0x171528,
  panelLight: 0x25213a,
  gold: 0xe6bd63,
  cream: '#f5e9ce',
  green: 0x68d391,
  red: 0xef6262,
  yellow: 0xffd65c,
};
const DEXIOS_START_X = 570;
const GROUND_Y = 955;
const DEXIOS_HEIGHT = 650;
const ATTACK_GAP = 570;
const BOAR_MAX_HP = 20;
const DEXIOS_MAX_HP = 65;
const PREPARATION_MS = 1000;
const LUNGE_MS = 2000;
const PARRY_GRACE_MS = 200;
const WILD_BITE_TOTAL_MS = PREPARATION_MS + LUNGE_MS + PARRY_GRACE_MS;
const TRIPLE_HIT_MS = 500;

export interface BoarSpawn {
  id: string;
  name: string;
  turnLabel: string;
  x: number;
  y: number;
  height: number;
  // Vertical offset while lunging, so a boar can pass in front of its neighbour.
  lungeY: number;
}

export interface Chapter1CombatConfig {
  sceneKey: string;
  turnSlots: number;
  introTutorials: boolean;
  nextSceneKey?: string;
  boars: BoarSpawn[];
}

export const CHAPTER1_COMBAT1: Chapter1CombatConfig = {
  sceneKey: 'scene_ch1_combat1',
  turnSlots: 4,
  introTutorials: true,
  nextSceneKey: 'scene_ch1_combat2',
  boars: [
    { id: 'boar_1', name: 'WILD BOAR', turnLabel: 'BOAR', x: 1400, y: 800, height: 370, lungeY: 0 },
  ],
};

export const CHAPTER1_COMBAT2: Chapter1CombatConfig = {
  sceneKey: 'scene_ch1_combat2',
  turnSlots: 4,
  introTutorials: false,
  boars: [
    { id: 'boar_1', name: 'WILD BOAR I', turnLabel: 'BOAR I', x: 1130, y: 800, height: 300, lungeY: 0 },
    { id: 'boar_2', name: 'WILD BOAR II', turnLabel: 'BOAR II', x: 1640, y: 800, height: 300, lungeY: 70 },
  ],
};

interface BoarState {
  spawn: BoarSpawn;
  health: number;
  alive: boolean;
  sprite: Phaser.GameObjects.Image;
  marker: Phaser.GameObjects.Graphics;
  keyLabel: Phaser.GameObjects.Text;
}

interface BoarHud {
  panel: Phaser.GameObjects.Graphics;
  hpBar: Phaser.GameObjects.Graphics;
  hpText: Phaser.GameObjects.Text;
  top: number;
  height: number;
}

type ChapterCombatPhase =
  | 'tutorial'
  | 'player'
  | 'target-select'
  | 'enemy-announcement'
  | 'enemy-prepare'
  | 'enemy-lunge'
  | 'resolving'
  | 'player-announcement'
  | 'player-approach'
  | 'player-attack'
  | 'player-return'
  | 'result';
type DefenseResult = 'failed' | 'blocked' | 'perfect';

interface TutorialMessage {
  title: string;
  text: string;
}

const ENEMY_TUTORIAL: TutorialMessage[] = [
  {
    title: 'WELCOME TO COMBAT',
    text: 'Combat in La Dexíada is turn-based. Characters act one at a time, following the turn order shown in the upper-left corner.',
  },
  {
    title: 'DEFENDING',
    text: 'Enemies can attack from different directions. Press the matching WASD key to defend. This Wild Boar attacks from above, so press W.',
  },
  {
    title: 'PERFECT PARRY',
    text: 'A normal block reduces damage, but a Perfect Parry prevents all damage and lets Dexios counterattack. Watch the enemy movement and time your defense!',
  },
];

const PLAYER_TUTORIAL: TutorialMessage[] = [
  {
    title: 'YOUR TURN',
    text: "Now it's Dexios's turn! Select an ability to attack your enemy. Each chosen ability uses one turn.",
  },
  {
    title: 'TRIPLE LIGHTNING',
    text: 'Triple Lightning strikes the enemy three times. Each hit deals 5 damage, for a total of 15. This basic ability costs no Mana.',
  },
];

const TARGET_TUTORIAL: TutorialMessage[] = [
  {
    title: 'CHOOSING A TARGET',
    text: 'Some battles have more than one enemy. After selecting an ability, choose which enemy to attack. Press 1 for the Wild Boar on the left or 2 for the one on the right. You can also click an enemy to select it.',
  },
];

export default class ChapterOneCombatScene extends Phaser.Scene {
  private readonly config: Chapter1CombatConfig;
  private phase: ChapterCombatPhase = 'tutorial';
  private dexiosHealth = DEXIOS_MAX_HP;
  private dexiosMana = 40;
  private dexios!: Phaser.GameObjects.Image;
  private boars: BoarState[] = [];
  private boarHud: BoarHud[] = [];
  private activeBoar?: BoarState;
  private selectedBoar?: BoarState;
  private hoveredBoar?: BoarState;
  private targetTutorialShown = false;
  private resultEnter?: () => void;
  private background!: Phaser.GameObjects.Image;
  private dexiosHpBar!: Phaser.GameObjects.Graphics;
  private turnSlots: Phaser.GameObjects.Graphics[] = [];
  private turnPortraits: Phaser.GameObjects.Image[] = [];
  private turnLabels: Phaser.GameObjects.Text[] = [];
  private abilityMenu?: Phaser.GameObjects.Container;
  private announcement?: Phaser.GameObjects.Container;
  private tutorialOverlay?: Phaser.GameObjects.Container;
  private tutorialMessages: TutorialMessage[] = [];
  private tutorialIndex = 0;
  private afterTutorial?: () => void;
  private timingRing!: Phaser.GameObjects.Graphics;
  private battleMusic?: Phaser.Sound.BaseSound;
  private unbindMusic?: () => void;
  private victoryMusic?: Phaser.Sound.BaseSound;
  private unbindVictoryMusic?: () => void;
  private starting = false;
  private enemyTutorialShown = false;
  private playerTutorialShown = false;
  private wildBiteStartedAt = 0;
  private defenseResult: DefenseResult | null = null;
  private dexiosOriginalX = DEXIOS_START_X;

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return;
    }
    if (this.phase === 'tutorial') {
      if (event.key === 'Enter' || event.key === ' ') {
        this.advanceTutorial();
      }
      return;
    }
    if (this.phase === 'enemy-lunge') {
      this.registerWildBiteInput(event.key);
      return;
    }
    if (this.phase === 'player' && (event.key === '1' || event.key === 'Enter')) {
      this.startTripleLightning();
      return;
    }
    if (this.phase === 'target-select') {
      if (event.key === '1' || event.key === '2') {
        this.selectTarget(this.boars[Number(event.key) - 1]);
      }
      return;
    }
    if (this.phase === 'result' && event.key === 'Enter') {
      this.resultEnter?.();
    }
  };

  constructor(config: Chapter1CombatConfig = CHAPTER1_COMBAT1) {
    super({ key: config.sceneKey });
    this.config = config;
  }

  preload(): void {
    const images: Array<[string, string]> = [
      ['ch1_combat1_background', backgroundUrl],
      ['dexios_base', dexiosBaseUrl],
      ['dexios_derecha', dexiosRightUrl],
      ['dexios_izquierda', dexiosLeftUrl],
      ['dexios_arriba', dexiosUpUrl],
      ['dexios_abajo', dexiosDownUrl],
      ['dexios_herido', dexiosHurtUrl],
      ['dexios_icono', dexiosIconUrl],
      ['dexios_triple1', dexiosTripleOneUrl],
      ['dexios_triple2', dexiosTripleTwoUrl],
      ['dexios_triple3', dexiosTripleThreeUrl],
      ['boar_base', boarBaseUrl],
      ['boar_prepare', boarPrepareUrl],
      ['boar_attack', boarAttackUrl],
      ['boar_hurt', boarHurtUrl],
    ];
    images.forEach(([key, url]) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, url);
      }
    });
    const audio: Array<[string, string]> = [
      ['ch1_battle_music', battleMusicUrl],
      ['ch1_victory_music', victoryMusicUrl],
      ['boar_prepare_sfx', boarPrepareSfxUrl],
      ['boar_attack_sfx', boarAttackSfxUrl],
      ['boar_hurt_sfx', boarHurtSfxUrl],
      ['dexios_sfx', dexiosSoundUrl],
      ['perfect_parry_sfx', perfectParrySoundUrl],
    ];
    audio.forEach(([key, url]) => {
      if (!this.cache.audio.exists(key)) {
        this.load.audio(key, url);
      }
    });
  }

  create(): void {
    this.phase = 'tutorial';
    this.dexiosHealth = DEXIOS_MAX_HP;
    this.dexiosMana = 40;
    this.enemyTutorialShown = !this.config.introTutorials;
    this.playerTutorialShown = !this.config.introTutorials;
    this.resultEnter = undefined;
    this.targetTutorialShown = false;
    this.activeBoar = undefined;
    this.selectedBoar = undefined;
    this.hoveredBoar = undefined;
    this.dexiosOriginalX = DEXIOS_START_X;
    this.defenseResult = null;
    this.starting = false;
    installChapterOneHotkeys(this, {
      backScene: 'scene_ch1_select',
      onRestart: () => this.restart(),
    });

    stripBlackMattes(this.textures, [
      'dexios_base',
      'dexios_derecha',
      'dexios_izquierda',
      'dexios_arriba',
      'dexios_abajo',
      'dexios_herido',
      'dexios_triple1',
      'dexios_triple2',
      'dexios_triple3',
      'boar_base',
      'boar_prepare',
      'boar_attack',
      'boar_hurt',
    ]);
    this.createBattlefield();
    this.createCombatants();
    this.createTurnOrder();
    this.createHealthPanels();
    this.createAbilityMenu();
    this.createStatusText();
    this.createAnnouncements();
    this.timingRing = this.add.graphics().setDepth(20);

    this.battleMusic = this.sound.add('ch1_battle_music', {
      loop: true,
      volume: GAME_CONFIG.audio.music,
    });
    this.unbindMusic = bindPhaserMusic(this.battleMusic);
    this.battleMusic.play();

    this.input.keyboard?.on('keydown', this.onKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
    this.startEnemyTurn(0);
  }

  update(): void {
    if (this.phase !== 'enemy-lunge') {
      return;
    }
    const elapsed = this.time.now - this.wildBiteStartedAt;
    if (elapsed < PREPARATION_MS || elapsed > WILD_BITE_TOTAL_MS) {
      this.timingRing.clear();
      return;
    }
    const activeElapsed = elapsed - PREPARATION_MS;
    const progress = Phaser.Math.Clamp(activeElapsed / (LUNGE_MS + PARRY_GRACE_MS), 0, 1);
    const color = this.defenseResult === 'perfect'
      || (this.defenseResult === null && elapsed >= PREPARATION_MS + LUNGE_MS)
      ? 0xffffff
      : COLORS.yellow;
    const centerX = this.dexios.x;
    const centerY = GROUND_Y - DEXIOS_HEIGHT * 0.62;
    this.timingRing.clear();
    this.timingRing.lineStyle(5, 0x40394a, 0.8).strokeCircle(centerX, centerY, 82);
    this.timingRing.lineStyle(8, color, 0.95);
    const arcPoints: Phaser.Math.Vector2[] = [];
    const segments = Math.max(2, Math.ceil(progress * 56));
    for (let index = 0; index <= segments; index += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * progress * index) / segments;
      arcPoints.push(new Phaser.Math.Vector2(
        centerX + Math.cos(angle) * 82,
        centerY + Math.sin(angle) * 82,
      ));
    }
    this.timingRing.strokePoints(arcPoints);
  }

  private createBattlefield(): void {
    this.background = this.add.image(WIDTH / 2, HEIGHT / 2, 'ch1_combat1_background');
    const source = this.background.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(WIDTH / source.width, HEIGHT / source.height);
    this.background.setScale(scale).setDepth(-20);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x0b0910, 0.1)
      .setOrigin(0)
      .setDepth(-19);
    this.add.graphics()
      .fillGradientStyle(0x100e1b, 0x100e1b, 0x100e1b, 0x100e1b, 0.3, 0.15, 0.3, 0.45)
      .fillRect(0, 0, WIDTH, HEIGHT)
      .setDepth(-18);
  }

  private createCombatants(): void {
    this.dexios = this.add.image(this.dexiosOriginalX, GROUND_Y, 'dexios_base')
      .setOrigin(0.5, 1)
      .setDepth(5);
    this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
    this.boars = this.config.boars.map((spawn, index) => {
      const sprite = this.add.image(spawn.x, spawn.y, 'boar_base')
        .setOrigin(0.5, 1)
        .setDepth(4);
      this.setSpriteFrame(sprite, 'boar_base', spawn.height);
      const marker = this.add.graphics().setDepth(6);
      const keyLabel = this.add.text(spawn.x, spawn.y - spawn.height - 78, String(index + 1), {
        fontFamily: EB_GARAMOND_FONT_FAMILY,
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#fff2c6',
        stroke: '#17121b',
        strokeThickness: 6,
      }).setOrigin(0.5).setDepth(7).setVisible(false);
      const boar: BoarState = {
        spawn,
        health: BOAR_MAX_HP,
        alive: true,
        sprite,
        marker,
        keyLabel,
      };
      const zone = this.add.zone(spawn.x, spawn.y - spawn.height / 2, spawn.height * 1.3, spawn.height)
        .setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => this.hoverTarget(boar));
      zone.on('pointerout', () => this.hoverTarget(undefined));
      zone.on('pointerdown', () => this.selectTarget(boar));
      return boar;
    });
  }

  private createTurnOrder(): void {
    const panel = this.add.graphics().setDepth(50);
    panel.fillStyle(COLORS.panel, 0.94).fillRoundedRect(28, 24, 440, 142, 12);
    panel.lineStyle(2, COLORS.gold, 0.86).strokeRoundedRect(28, 24, 440, 142, 12);
    this.add.text(52, 35, 'TURN ORDER', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '22px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: '#f5d47d',
    }).setDepth(51);
    this.turnSlots = [];
    this.turnPortraits = [];
    this.turnLabels = [];
    for (let index = 0; index < this.config.turnSlots; index += 1) {
      const x = 56 + index * 98;
      this.turnSlots.push(this.add.graphics().setDepth(51));
      this.turnPortraits.push(this.add.image(x + 32, 99, 'dexios_icono').setDepth(52));
      this.turnLabels.push(this.add.text(x + 32, 136, '', {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: COLORS.cream,
        align: 'center',
      }).setOrigin(0.5).setDepth(52));
    }
    this.highlightTurn(this.config.boars[0].id);
  }

  private highlightTurn(actorId: string): void {
    const actors = [
      ...this.boars.filter((boar) => boar.alive).map((boar) => boar.spawn.id),
      'dexios',
    ];
    const start = Math.max(0, actors.indexOf(actorId));
    this.turnPortraits.forEach((portrait, index) => {
      const who = actors[(start + index) % actors.length];
      const boar = this.boars.find((candidate) => candidate.spawn.id === who);
      portrait.setTexture(boar ? 'boar_base' : 'dexios_icono');
      const max = boar ? 43 : 47;
      const source = portrait.texture.getSourceImage() as HTMLImageElement;
      portrait.setDisplaySize(source.width * max / source.height, max);
      this.turnLabels[index].setText(boar ? boar.spawn.turnLabel : 'DEXIOS');
    });
    this.turnSlots.forEach((slot, index) => {
      const current = index === 0;
      const x = 48 + index * 98;
      slot.clear();
      slot.lineStyle(current ? 3 : 1, current ? COLORS.gold : 0x736b78, current ? 1 : 0.5)
        .strokeRoundedRect(x, 58, 80, 92, 8);
    });
  }

  private createHealthPanels(): void {
    const multiple = this.boars.length > 1;
    const panelHeight = multiple ? 104 : 118;
    const portraitSize = multiple ? 66 : 78;
    this.boarHud = this.boars.map((boar, index) => {
      const top = 28 + index * 116;
      const panel = this.add.graphics().setDepth(50);
      const portrait = this.add.image(1290, top + panelHeight / 2, 'boar_base').setDepth(51);
      const boarImage = portrait.texture.getSourceImage() as HTMLImageElement;
      portrait.setDisplaySize(portraitSize * boarImage.width / boarImage.height, portraitSize);
      this.add.text(1350, top + (multiple ? 10 : 15), boar.spawn.name, {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '28px',
        fontStyle: 'bold',
        letterSpacing: 2,
        color: COLORS.cream,
      }).setDepth(51);
      const hpBar = this.add.graphics().setDepth(51);
      const hpText = this.add.text(1800, top + (multiple ? 14 : 20), '20 / 20', {
        fontFamily: EB_GARAMOND_FONT_FAMILY,
        fontSize: '22px',
        color: COLORS.cream,
        align: 'right',
      }).setOrigin(1, 0).setDepth(51);
      const hit = this.add.zone(1555, top + panelHeight / 2, 650, panelHeight)
        .setDepth(52)
        .setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => this.hoverTarget(boar));
      hit.on('pointerout', () => this.hoverTarget(undefined));
      hit.on('pointerdown', () => this.selectTarget(boar));
      return { panel, hpBar, hpText, top, height: panelHeight };
    });

    const dexiosPanel = this.add.graphics().setDepth(50);
    dexiosPanel.fillStyle(COLORS.panel, 0.96).fillRoundedRect(1500, 824, 380, 206, 12);
    dexiosPanel.lineStyle(2, COLORS.gold, 0.9).strokeRoundedRect(1500, 824, 380, 206, 12);
    const portrait = this.add.image(1573, 915, 'dexios_icono').setDepth(51);
    portrait.setDisplaySize(112, 112);
    this.add.text(1650, 845, 'DEXIOS', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '30px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: COLORS.cream,
    }).setDepth(51);
    this.add.text(1650, 891, 'HP', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f5d47d',
    }).setDepth(51);
    this.dexiosHpBar = this.add.graphics().setDepth(51);
    this.add.text(1848, 891, '65 / 65', {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '20px',
      color: COLORS.cream,
      align: 'right',
    }).setOrigin(1, 0).setName('dexios-hp-text').setDepth(51);
    this.updateHealthBars();
  }

  private createAbilityMenu(): void {
    const container = this.add.container(0, 0).setDepth(60).setVisible(false);
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 0.97).fillRoundedRect(40, 824, 590, 206, 12);
    panel.lineStyle(2, COLORS.gold, 0.9).strokeRoundedRect(40, 824, 590, 206, 12);
    const heading = this.add.text(70, 848, 'DEXIOS · CHOOSE AN ABILITY', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '22px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: '#f5d47d',
    });
    const button = this.add.rectangle(335, 946, 520, 92, COLORS.panelLight, 1)
      .setStrokeStyle(2, COLORS.gold, 0.9)
      .setInteractive({ useHandCursor: true });
    const ability = this.add.text(335, 932, 'TRIPLE LIGHTNING', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '31px',
      fontStyle: 'bold',
      letterSpacing: 1,
      color: COLORS.cream,
      align: 'center',
    }).setOrigin(0.5);
    const detail = this.add.text(335, 972, '3 hits  ·  5 damage each  ·  No Mana cost', {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '24px',
      color: '#c4b8db',
      align: 'center',
    }).setOrigin(0.5);
    button.on('pointerover', () => button.setFillStyle(0x352c46, 1));
    button.on('pointerout', () => button.setFillStyle(COLORS.panelLight, 1));
    button.on('pointerdown', () => this.startTripleLightning());
    container.add([panel, heading, button, ability, detail]);
    this.abilityMenu = container;
  }

  private createStatusText(): void {
    this.add.text(WIDTH / 2, 112, '', {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '36px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: COLORS.cream,
      align: 'center',
      stroke: '#17121b',
      strokeThickness: 5,
    }).setOrigin(0.5).setName('combat-status').setDepth(55);
  }

  private createAnnouncements(): void {
    const container = this.add.container(0, 0).setDepth(100).setVisible(false);
    const panel = this.add.graphics();
    panel.fillStyle(0x08070b, 0.94).fillRect(0, 476, WIDTH, 128);
    panel.lineStyle(3, COLORS.gold, 0.95).lineBetween(0, 476, WIDTH, 476);
    panel.lineStyle(3, COLORS.gold, 0.95).lineBetween(0, 604, WIDTH, 604);
    const text = this.add.text(WIDTH / 2, 540, '', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '44px',
      fontStyle: 'bold',
      letterSpacing: 5,
      color: '#fff8e7',
      align: 'center',
    }).setOrigin(0.5).setName('announcement-text');
    container.add([panel, text]);
    this.announcement = container;
  }

  private startEnemyTurn(fromIndex: number): void {
    if (this.phase === 'result' || this.dexiosHealth <= 0) {
      return;
    }
    const boar = this.boars.find((candidate, index) => index >= fromIndex && candidate.alive);
    if (!boar) {
      if (this.boars.some((candidate) => candidate.alive)) {
        this.beginDexiosTurn();
      }
      return;
    }
    this.activeBoar = boar;
    this.phase = 'enemy-announcement';
    this.abilityMenu?.setVisible(false);
    this.highlightTurn(boar.spawn.id);
    this.updateHealthBars();
    if (!this.enemyTutorialShown) {
      this.showTutorial(ENEMY_TUTORIAL, () => {
        this.enemyTutorialShown = true;
        this.startEnemyTurn(fromIndex);
      });
      return;
    }
    this.announce('WILD BITE', () => this.beginWildBite());
  }

  private beginWildBite(): void {
    const boar = this.activeBoar;
    if (this.phase !== 'enemy-announcement' || !boar) {
      return;
    }
    this.phase = 'enemy-prepare';
    this.defenseResult = null;
    this.wildBiteStartedAt = this.time.now;
    boar.sprite.setDepth(8);
    this.setSpriteFrame(boar.sprite, 'boar_prepare', boar.spawn.height);
    this.playEffect('boar_prepare_sfx');
    this.setStatus(this.boars.length > 1
      ? `${boar.spawn.name} PREPARES TO CHARGE`
      : 'THE BOAR PREPARES TO CHARGE');
    this.tweens.add({
      targets: boar.sprite,
      x: boar.spawn.x - 40,
      duration: PREPARATION_MS,
      ease: 'Sine.easeOut',
      onComplete: () => this.beginBoarLunge(),
    });
  }

  private beginBoarLunge(): void {
    const boar = this.activeBoar;
    if (this.phase !== 'enemy-prepare' || !boar) {
      return;
    }
    this.phase = 'enemy-lunge';
    this.setSpriteFrame(boar.sprite, 'boar_attack', boar.spawn.height);
    this.playEffect('boar_attack_sfx');
    this.setStatus('WILD BITE · BLOCK WITH W, THEN PARRY');
    this.tweens.add({
      targets: boar.sprite,
      x: this.dexiosOriginalX + 250,
      y: boar.spawn.y + boar.spawn.lungeY,
      duration: LUNGE_MS,
      ease: 'Linear',
    });
    this.time.delayedCall(LUNGE_MS, () => {
      if (this.phase !== 'enemy-lunge') {
        return;
      }
      this.cameras.main.shake(100, 0.0012);
      this.setStatus('IMPACT · PERFECT PARRY STILL AVAILABLE');
    });
    this.time.delayedCall(LUNGE_MS + PARRY_GRACE_MS, () => this.resolveWildBite());
  }

  private registerWildBiteInput(key: string): void {
    if (this.defenseResult !== null) {
      return;
    }
    const direction = key.toLowerCase();
    if (!['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(direction)) {
      return;
    }
    const elapsed = this.time.now - this.wildBiteStartedAt;
    if (elapsed < PREPARATION_MS || elapsed > WILD_BITE_TOTAL_MS) {
      return;
    }
    const pressedSprites: Record<string, string> = {
      w: 'dexios_arriba',
      arrowup: 'dexios_arriba',
      a: 'dexios_izquierda',
      arrowleft: 'dexios_izquierda',
      s: 'dexios_abajo',
      arrowdown: 'dexios_abajo',
      d: 'dexios_derecha',
      arrowright: 'dexios_derecha',
    };
    this.setSpriteFrame(this.dexios, pressedSprites[direction], DEXIOS_HEIGHT);
    this.defenseResult = direction === 'w'
      ? elapsed < PREPARATION_MS + 1000 ? 'blocked' : 'perfect'
      : 'failed';
    if (this.defenseResult === 'blocked') {
      this.setStatus('BLOCK');
    } else if (this.defenseResult === 'perfect') {
      this.setStatus('PERFECT');
    } else {
      this.setStatus('FAIL');
    }
  }

  private resolveWildBite(): void {
    if (this.phase !== 'enemy-lunge') {
      return;
    }
    this.phase = 'resolving';
    this.timingRing.clear();
    const result = this.defenseResult ?? 'failed';
    if (result === 'failed') {
      this.dexiosHealth = Math.max(0, this.dexiosHealth - 6);
      this.setSpriteFrame(this.dexios, 'dexios_herido', DEXIOS_HEIGHT);
      this.setStatus('FAIL · DEXIOS TAKES 6 DAMAGE');
    } else if (result === 'blocked') {
      this.dexiosHealth = Math.max(0, this.dexiosHealth - 3);
      this.setSpriteFrame(this.dexios, 'dexios_arriba', DEXIOS_HEIGHT);
      this.setStatus('BLOCK · DEXIOS TAKES 3 DAMAGE');
    } else {
      this.setSpriteFrame(this.dexios, 'dexios_arriba', DEXIOS_HEIGHT);
      this.playEffect('perfect_parry_sfx');
      const attacker = this.activeBoar;
      if (attacker?.alive) {
        this.damageBoar(attacker, 5);
        this.playEffect('boar_hurt_sfx');
        this.setStatus('PERFECT PARRY · COUNTERATTACK FOR 5');
      } else {
        this.setStatus('PERFECT PARRY');
      }
    }
    this.updateHealthBars();
    this.time.delayedCall(400, () => {
      const attacker = this.activeBoar;
      if (this.phase !== 'resolving' || !attacker) {
        return;
      }
      if (this.dexiosHealth <= 0) {
        this.finishBattle('defeat');
        return;
      }
      if (!this.boars.some((boar) => boar.alive)) {
        this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
        this.finishBattle('victory');
        return;
      }
      this.tweens.add({
        targets: attacker.sprite,
        x: attacker.spawn.x,
        y: attacker.spawn.y,
        duration: 360,
        ease: 'Sine.easeInOut',
        onComplete: () => this.finishWildBoarTurn(),
      });
    });
  }

  private finishWildBoarTurn(): void {
    const attacker = this.activeBoar;
    if (this.phase !== 'resolving' || !attacker) {
      return;
    }
    attacker.sprite.setDepth(4);
    if (attacker.alive) {
      this.setSpriteFrame(attacker.sprite, 'boar_base', attacker.spawn.height);
    } else {
      this.markDefeated(attacker);
    }
    this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
    this.startEnemyTurn(this.boars.indexOf(attacker) + 1);
  }

  private markDefeated(boar: BoarState): void {
    this.setSpriteFrame(boar.sprite, 'boar_hurt', boar.spawn.height);
    boar.sprite.setAlpha(0.4);
  }

  private beginDexiosTurn(): void {
    if (this.dexiosHealth <= 0) {
      this.finishBattle('defeat');
      return;
    }
    this.activeBoar = undefined;
    this.phase = 'player';
    this.highlightTurn('dexios');
    this.updateHealthBars();
    this.setStatus('DEXIOS TURN');
    if (!this.playerTutorialShown) {
      this.showTutorial(PLAYER_TUTORIAL, () => {
        this.playerTutorialShown = true;
        this.phase = 'player';
        this.showAbilityMenu();
      });
    } else {
      this.showAbilityMenu();
    }
  }

  private showAbilityMenu(): void {
    if (this.phase === 'player') {
      this.abilityMenu?.setVisible(true);
    }
  }

  private startTripleLightning(): void {
    if (this.phase !== 'player') {
      return;
    }
    const living = this.boars.filter((boar) => boar.alive);
    if (living.length === 0) {
      return;
    }
    this.abilityMenu?.setVisible(false);
    if (living.length === 1) {
      this.beginTargetedAttack(living[0]);
      return;
    }
    if (!this.targetTutorialShown) {
      this.showTutorial(TARGET_TUTORIAL, () => {
        this.targetTutorialShown = true;
        this.openTargetSelection();
      });
      return;
    }
    this.openTargetSelection();
  }

  private openTargetSelection(): void {
    this.phase = 'target-select';
    this.hoveredBoar = undefined;
    this.setStatus('CHOOSE A TARGET · PRESS 1 OR 2');
    this.drawTargetMarkers();
  }

  private hoverTarget(boar: BoarState | undefined): void {
    if (this.phase !== 'target-select') {
      return;
    }
    this.hoveredBoar = boar?.alive ? boar : undefined;
    this.drawTargetMarkers();
  }

  private drawTargetMarkers(): void {
    const selecting = this.phase === 'target-select';
    this.boars.forEach((boar) => {
      boar.marker.clear();
      const visible = selecting && boar.alive;
      boar.keyLabel.setVisible(visible);
      if (!visible) {
        return;
      }
      const hovered = this.hoveredBoar === boar;
      const color = hovered ? 0xfff2a8 : COLORS.gold;
      const { x, y, height } = boar.spawn;
      const tip = y - height - 14;
      boar.marker.lineStyle(hovered ? 8 : 5, color, 1).strokeEllipse(x, y - 4, 360, 50);
      boar.marker.fillStyle(color, 1).fillTriangle(x - 28, tip - 42, x + 28, tip - 42, x, tip);
    });
    this.updateHealthBars();
  }

  private selectTarget(boar: BoarState | undefined): void {
    if (this.phase !== 'target-select' || !boar?.alive) {
      return;
    }
    this.beginTargetedAttack(boar);
  }

  private beginTargetedAttack(target: BoarState): void {
    this.selectedBoar = target;
    this.phase = 'player-announcement';
    this.hoveredBoar = undefined;
    this.drawTargetMarkers();
    this.announce('TRIPLE LIGHTNING', () => this.beginTripleLightning(target));
  }

  private beginTripleLightning(target: BoarState): void {
    if (this.phase !== 'player-announcement') {
      return;
    }
    this.phase = 'player-approach';
    this.setStatus('DEXIOS APPROACHES');
    this.tweens.add({
      targets: this.dexios,
      x: target.spawn.x - ATTACK_GAP,
      duration: 420,
      ease: 'Sine.easeInOut',
      onComplete: () => this.performTripleHit(0, target),
    });
  }

  private performTripleHit(index: number, target: BoarState): void {
    if (this.phase === 'result') {
      return;
    }
    this.phase = 'player-attack';
    const frames = ['dexios_triple1', 'dexios_triple2', 'dexios_triple3'] as const;
    this.setSpriteFrame(this.dexios, frames[index], DEXIOS_HEIGHT);
    this.setStatus(`TRIPLE LIGHTNING · HIT ${index + 1} / 3`);
    if (target.alive) {
      this.damageBoar(target, 5);
      this.playEffect('dexios_sfx');
      this.playEffect('boar_hurt_sfx');
    } else {
      this.playEffect('dexios_sfx');
    }
    this.cameras.main.shake(100, 0.0012);
    this.time.delayedCall(TRIPLE_HIT_MS, () => {
      if (index < frames.length - 1) {
        this.performTripleHit(index + 1, target);
      } else {
        this.returnDexiosToPosition(target);
      }
    });
  }

  private returnDexiosToPosition(target: BoarState): void {
    if (this.phase === 'result') {
      return;
    }
    this.phase = 'player-return';
    this.tweens.add({
      targets: this.dexios,
      x: this.dexiosOriginalX,
      duration: 420,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
        this.selectedBoar = undefined;
        if (!this.boars.some((boar) => boar.alive)) {
          this.finishBattle('victory');
          return;
        }
        this.boars.forEach((boar) => {
          if (boar.alive) {
            this.setSpriteFrame(boar.sprite, 'boar_base', boar.spawn.height);
          } else if (boar === target) {
            this.markDefeated(boar);
          }
        });
        this.startEnemyTurn(0);
      },
    });
  }

  private damageBoar(boar: BoarState, damage: number): void {
    if (!boar.alive) {
      return;
    }
    boar.health = Math.max(0, boar.health - damage);
    boar.alive = boar.health > 0;
    this.updateHealthBars();
    this.setSpriteFrame(boar.sprite, 'boar_hurt', boar.spawn.height);
  }

  private showTutorial(messages: TutorialMessage[], after: () => void): void {
    this.phase = 'tutorial';
    this.abilityMenu?.setVisible(false);
    this.tutorialMessages = messages;
    this.tutorialIndex = 0;
    this.afterTutorial = after;
    this.renderTutorialMessage();
  }

  private renderTutorialMessage(): void {
    this.tutorialOverlay?.destroy(true);
    const message = this.tutorialMessages[this.tutorialIndex];
    if (!message) {
      this.phase = 'tutorial';
      this.tutorialOverlay = undefined;
      const after = this.afterTutorial;
      this.afterTutorial = undefined;
      this.time.delayedCall(80, () => after?.());
      return;
    }
    const container = this.add.container(0, 0).setDepth(200);
    const overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.58)
      .setOrigin(0)
      .setInteractive();
    const panel = this.add.graphics();
    panel.fillStyle(0x05040a, 0.96).fillRoundedRect(360, 250, 1200, 580, 10);
    panel.lineStyle(4, COLORS.gold, 1).strokeRoundedRect(360, 250, 1200, 580, 10);
    panel.lineStyle(1, 0x8e6d32, 0.85)
      .strokeRoundedRect(374, 264, 1172, 552, 6);
    const title = this.add.text(WIDTH / 2, 345, message.title, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '42px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: '#f5d47d',
      align: 'center',
      wordWrap: { width: 1040 },
    }).setOrigin(0.5);
    const text = this.add.text(WIDTH / 2, 450, message.text, {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '34px',
      color: COLORS.cream,
      align: 'center',
      lineSpacing: 12,
      wordWrap: { width: 980 },
    }).setOrigin(0.5, 0);
    const prompt = this.add.text(WIDTH / 2, 748, 'PRESS ENTER OR CLICK TO CONTINUE', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '23px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: COLORS.cream,
      align: 'center',
    }).setOrigin(0.5);
    overlay.on('pointerdown', () => this.advanceTutorial());
    prompt.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.advanceTutorial());
    container.add([overlay, panel, title, text, prompt]);
    this.tutorialOverlay = container;
  }

  private advanceTutorial(): void {
    if (this.phase !== 'tutorial' || !this.afterTutorial) {
      return;
    }
    this.tutorialIndex += 1;
    this.renderTutorialMessage();
  }

  private announce(text: string, complete: () => void): void {
    if (!this.announcement) {
      return;
    }
    const label = this.announcement.getByName('announcement-text') as Phaser.GameObjects.Text;
    label.setText(text);
    this.announcement.setVisible(true);
    this.time.delayedCall(1000, () => {
      this.announcement?.setVisible(false);
      complete();
    });
  }

  private setStatus(text: string): void {
    const status = this.children.getByName('combat-status') as Phaser.GameObjects.Text | null;
    status?.setText(text);
  }

  private updateHealthBars(): void {
    this.drawHealthBar(this.dexiosHpBar, 1650, 922, 190, this.dexiosHealth, DEXIOS_MAX_HP);
    this.boars.forEach((boar, index) => {
      const hud = this.boarHud[index];
      if (!hud) {
        return;
      }
      this.drawHealthBar(hud.hpBar, 1350, hud.top + (hud.height < 110 ? 66 : 63), 500, boar.health, BOAR_MAX_HP);
      hud.hpText.setText(`${boar.health} / ${BOAR_MAX_HP}`);
      hud.hpText.setAlpha(boar.alive ? 1 : 0.55);
      const selected = this.selectedBoar === boar;
      const active = this.activeBoar === boar || this.hoveredBoar === boar;
      const border = selected ? COLORS.green : COLORS.gold;
      hud.panel.clear();
      hud.panel.fillStyle(active || selected ? 0x2a2440 : COLORS.panel, boar.alive ? 0.94 : 0.7)
        .fillRoundedRect(1230, hud.top, 650, hud.height, 12);
      hud.panel.lineStyle(active || selected ? 4 : 2, border, boar.alive ? 0.95 : 0.4)
        .strokeRoundedRect(1230, hud.top, 650, hud.height, 12);
    });
    const dexiosText = this.children.getByName('dexios-hp-text') as Phaser.GameObjects.Text | null;
    dexiosText?.setText(`${this.dexiosHealth} / ${DEXIOS_MAX_HP}`);
  }

  private drawHealthBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    current: number,
    maximum: number,
  ): void {
    graphics.clear();
    graphics.fillStyle(0x383242, 1).fillRoundedRect(x, y, width, 18, 8);
    const ratio = Phaser.Math.Clamp(current / maximum, 0, 1);
    if (current > 0) {
      graphics.fillStyle(ratio > 0.25 ? COLORS.green : COLORS.red, 1)
        .fillRoundedRect(x, y, width * ratio, 18, 8);
    }
    graphics.lineStyle(1, 0xffffff, 0.25).strokeRoundedRect(x, y, width, 18, 8);
  }

  private setSpriteFrame(
    sprite: Phaser.GameObjects.Image,
    texture: string,
    height: number,
  ): void {
    sprite.setTexture(texture);
    const source = sprite.texture.getSourceImage() as HTMLImageElement;
    sprite.setDisplaySize(source.width * height / source.height, height);
  }

  private playEffect(key: string): void {
    this.sound.play(key, {
      volume: audioSettings.effectsMuted ? 0 : GAME_CONFIG.audio.effects,
    });
  }

  private finishBattle(result: 'victory' | 'defeat'): void {
    if (this.phase === 'result') {
      return;
    }
    this.phase = 'result';
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.abilityMenu?.setVisible(false);
    this.tutorialOverlay?.destroy(true);
    this.announcement?.setVisible(false);
    this.timingRing.clear();
    this.battleMusic?.stop();
    if (result === 'victory') {
      this.victoryMusic = this.sound.add('ch1_victory_music', { volume: GAME_CONFIG.audio.music });
      this.unbindVictoryMusic = bindPhaserMusic(this.victoryMusic);
      this.victoryMusic.play();
    }
    const overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.72)
      .setOrigin(0)
      .setDepth(150)
      .setInteractive();
    const panel = this.add.graphics().setDepth(151);
    panel.fillStyle(COLORS.panel, 0.98).fillRoundedRect(500, 300, 920, 480, 14);
    panel.lineStyle(4, COLORS.gold, 1).strokeRoundedRect(500, 300, 920, 480, 14);
    this.add.text(WIDTH / 2, 400, result === 'victory' ? 'VICTORY' : 'DEFEAT', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '68px',
      fontStyle: 'bold',
      letterSpacing: 6,
      color: result === 'victory' ? '#f5d47d' : '#ff8585',
      align: 'center',
    }).setOrigin(0.5).setDepth(152);
    const next = result === 'victory' ? this.config.nextSceneKey : undefined;
    const primary = result === 'victory'
      ? next ? { label: 'NEXT COMBAT', action: () => this.goToScene(next) } : undefined
      : { label: 'RETRY', action: () => this.restart() };
    this.resultEnter = primary?.action;
    if (primary) {
      this.createResultButton(780, 565, primary.label, 'ENTER', primary.action);
    }
    this.createResultButton(primary ? 1150 : 960, 565, 'COMBAT SELECT', 'ESC', () => this.returnToSelector());
    const hint = primary
      ? `Press Enter for ${primary.label.toLowerCase()} or Escape for combat select.`
      : 'Press Escape to return to combat select.';
    this.add.text(WIDTH / 2, 700, hint, {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '28px',
      color: COLORS.cream,
      align: 'center',
    }).setOrigin(0.5).setDepth(152);
    overlay.on('pointerdown', () => undefined);
  }

  private createResultButton(
    x: number,
    y: number,
    label: string,
    key: string,
    action: () => void,
  ): void {
    const button = this.add.rectangle(x, y, 320, 86, COLORS.panelLight, 1)
      .setStrokeStyle(3, COLORS.gold, 0.95)
      .setInteractive({ useHandCursor: true })
      .setDepth(152);
    const text = this.add.text(x, y, `${label}  [${key}]`, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '23px',
      fontStyle: 'bold',
      letterSpacing: 1,
      color: COLORS.cream,
      align: 'center',
      wordWrap: { width: 290 },
    }).setOrigin(0.5).setDepth(153);
    button.on('pointerover', () => button.setFillStyle(0x352c46, 1));
    button.on('pointerout', () => button.setFillStyle(COLORS.panelLight, 1));
    button.on('pointerdown', action);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', action);
  }

  private restart(): void {
    if (this.starting) {
      return;
    }
    this.starting = true;
    this.scene.restart();
  }

  private returnToSelector(): void {
    this.goToScene('scene_ch1_select');
  }

  private goToScene(sceneKey: string): void {
    if (this.starting) {
      return;
    }
    this.starting = true;
    this.scene.start(sceneKey);
  }

  private onShutdown(): void {
    this.input.keyboard?.off('keydown', this.onKeyDown, this);
    this.unbindMusic?.();
    this.unbindMusic = undefined;
    this.battleMusic?.stop();
    this.battleMusic?.destroy();
    this.battleMusic = undefined;
    this.unbindVictoryMusic?.();
    this.unbindVictoryMusic = undefined;
    this.victoryMusic?.stop();
    this.victoryMusic?.destroy();
    this.victoryMusic = undefined;
  }
}
