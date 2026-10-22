import Phaser from 'phaser';
import { CharacterId, Direction, GAME_CONFIG, IMAGE_ASSETS } from './game-config';
import Soundscape from './soundscape';
import {
  canAfford,
  CombatResult,
  CombatState,
  createCombatState,
  damageForDefense,
  damageIobrontes,
  damagePartyMember,
  DefenseOutcome,
  DEFENSE_WINDOW_END_MS,
  DEFENSE_WINDOW_START_MS,
  getBattleResult,
  healPartyMember,
  MAX_CHAOS,
  MAX_HEALTH,
  MAX_IOBRONTES_HEALTH,
  MAX_MANA,
  PERFECT_PARRY_DAMAGE,
  PERFECT_PARRY_WINDOW_START_MS,
  resolveDefense,
  spendCost,
  WIND_UP_MS,
  PROJECTILE_TRAVEL_MS,
} from './combat-rules';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const COLORS = {
  ink: 0x100e1b,
  panel: 0x171528,
  panelLight: 0x25213a,
  gold: 0xe6bd63,
  cream: 0xf5e9ce,
  purple: 0x9c55e8,
  violet: 0xd47cff,
  green: 0x68d391,
  blue: 0x63b9ed,
  red: 0xef6262,
  lightning: 0xdec4ff,
  yellow: 0xffd65c,
  teal: 0x65e5bd,
};

type CombatPhase = 'player' | 'action' | 'windup' | 'projectile' | 'resolving' | 'ended';
type Ability = (typeof GAME_CONFIG.abilities)[CharacterId][number];

interface PartyCard {
  container: Phaser.GameObjects.Container;
  name: Phaser.GameObjects.Text;
  turn: Phaser.GameObjects.Text;
  health: Phaser.GameObjects.Text;
  mana: Phaser.GameObjects.Text;
  selection: Phaser.GameObjects.Text;
  chaos?: Phaser.GameObjects.Text;
  healthBar: Phaser.GameObjects.Graphics;
  manaBar: Phaser.GameObjects.Graphics;
  chaosBar?: Phaser.GameObjects.Graphics;
}

interface LightningPath {
  start: Phaser.Math.Vector2;
  end: Phaser.Math.Vector2;
  rotation: number;
}

export default class CombatScene extends Phaser.Scene {
  private state: CombatState = createCombatState();
  private phase: CombatPhase = 'player';
  private result: CombatResult | null = null;
  private turnIndex = 0;
  private activeCharacter: CharacterId | null = null;
  private healingSelection = false;
  private actorSprites!: Record<CharacterId, Phaser.GameObjects.Sprite>;
  private breathingTweens!: Record<CharacterId, Phaser.Tweens.Tween>;
  private actorNames!: Record<CharacterId, Phaser.GameObjects.Text>;
  private missingLabels!: Record<CharacterId, Phaser.GameObjects.Text>;
  private frameGeneration: Record<CharacterId, number> = { dexios: 0, furai: 0, sahira: 0 };
  private boss!: Phaser.GameObjects.Sprite;
  private bossFrameGeneration = 0;
  private partyCards!: Record<CharacterId, PartyCard>;
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossHealthText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;
  private resultText!: Phaser.GameObjects.Text;
  private actionContent!: Phaser.GameObjects.Container;
  private timingRing!: Phaser.GameObjects.Graphics;
  private warning!: Phaser.GameObjects.Container;
  private warningArrow!: Phaser.GameObjects.Text;
  private armorBreakMark!: Phaser.GameObjects.Container;
  private soundscape!: Soundscape;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private audioText!: Phaser.GameObjects.Text;
  private activeBolt?: Phaser.GameObjects.Graphics;
  private attackDirection: Direction | null = null;
  private responseDirection: Direction | null = null;
  private responseTime: number | null = null;
  private defenseOutcome: DefenseOutcome | null = null;
  private projectileStartedAt = 0;
  private hasImpacted = false;
  private targetCharacter: CharacterId | null = null;
  private lightningIndex = 0;
  private perfectParries = 0;

  constructor() {
    super({ key: 'combat' });
  }

  preload(): void {
    this.load.image('arena', IMAGE_ASSETS.arena);
    Object.entries(IMAGE_ASSETS).forEach(([key, asset]) => {
      if (key !== 'arena') {
        this.load.image(key, asset);
      }
    });
  }

  create(): void {
    this.state = createCombatState();
    this.phase = 'player';
    this.result = null;
    this.turnIndex = 0;
    this.activeCharacter = null;
    this.healingSelection = false;
    this.targetCharacter = null;
    this.attackDirection = null;
    this.responseDirection = null;
    this.responseTime = null;
    this.defenseOutcome = null;
    this.lightningIndex = 0;
    this.perfectParries = 0;
    this.hasImpacted = false;
    this.soundscape = new Soundscape();
    this.stripCharacterMattes();
    this.createArena();
    this.createCharacters();
    this.createIndicators();
    const battlefieldObjects = [...this.children.getChildren()];
    this.createHud();
    const hudObjects = this.children.getChildren().filter(
      (object) => !battlefieldObjects.includes(object),
    );
    this.uiCamera = this.cameras.add(0, 0, WIDTH, HEIGHT);
    this.cameras.main.ignore(hudObjects);
    this.uiCamera.ignore(battlefieldObjects);

    this.input.keyboard?.on('keydown', this.onKeyDown, this);
    this.input.on('pointerdown', this.startAudio, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.onKeyDown, this);
      this.input.off('pointerdown', this.startAudio, this);
      this.soundscape.destroy();
    });

    this.refreshHud();
    this.startTurn();
  }

  update(): void {
    if (this.phase === 'windup' && this.attackDirection) {
      this.targetText.setText(
        `${this.directionControl(this.attackDirection)}  ·  PREPÁRATE`,
      );
      return;
    }
    if (this.phase !== 'projectile' || !this.targetCharacter) {
      return;
    }

    const elapsed = this.time.now - this.projectileStartedAt;
    const progress = Phaser.Math.Clamp(elapsed / PROJECTILE_TRAVEL_MS, 0, 1);
    const inDefenseWindow = elapsed >= DEFENSE_WINDOW_START_MS && elapsed <= DEFENSE_WINDOW_END_MS;
    const isPerfectWindow =
      elapsed >= PERFECT_PARRY_WINDOW_START_MS && elapsed <= DEFENSE_WINDOW_END_MS;
    const ringColor = isPerfectWindow ? 0xffffff : inDefenseWindow ? COLORS.yellow : 0xbdb6cf;
    const target = GAME_CONFIG.characters[this.targetCharacter];
    const width = Phaser.Math.Linear(target.displayHeight * 0.78, 118, progress);
    const height = Phaser.Math.Linear(target.displayHeight * 1.02, 175, progress);
    this.timingRing.clear();
    this.timingRing.lineStyle(isPerfectWindow ? 8 : 5, ringColor, isPerfectWindow ? 1 : 0.8);
    this.timingRing.strokeEllipse(
      target.x,
      target.feetY - target.displayHeight * 0.53,
      width,
      height,
    );
    this.timingRing.setAlpha(isPerfectWindow ? 0.8 + Math.sin(this.time.now / 45) * 0.2 : 1);

    if (!this.responseDirection) {
      const timingLabel = isPerfectWindow
        ? '¡AHORA: PARADA PERFECTA!'
        : inDefenseWindow
          ? `¡BLOQUEA: ${this.directionControl(this.attackDirection!)}!`
          : 'ESPERA AL MOMENTO DEL IMPACTO';
      this.targetText.setText(timingLabel);
    }
    if (elapsed >= PROJECTILE_TRAVEL_MS && !this.hasImpacted) {
      this.hasImpacted = true;
      this.createImpact(target.x, target.feetY - target.displayHeight * 0.52, COLORS.purple, 1.1);
      this.showFloatingText('IMPACTO', target.x, target.feetY - target.displayHeight - 20, '#ead8ff');
    }
  }

  private stripCharacterMattes(): void {
    Object.keys(IMAGE_ASSETS)
      .filter((key) => key !== 'arena')
      .forEach((key) => {
        const texture = this.textures.get(key);
        const source = texture.getSourceImage();
        if (!(source instanceof HTMLImageElement) && !(source instanceof HTMLCanvasElement)) {
          throw new Error(`No se pudo procesar el fotograma ${key}`);
        }
        const canvas = document.createElement('canvas');
        canvas.width = source.width;
        canvas.height = source.height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          throw new Error(`No se pudo preparar el fotograma ${key}`);
        }
        context.drawImage(source, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixelCount = canvas.width * canvas.height;
        const queue = new Uint32Array(pixelCount);
        let queueStart = 0;
        let queueEnd = 0;
        const enqueueMattePixel = (index: number): void => {
          const offset = index * 4;
          if (
            pixels.data[offset + 3] === 0
            || pixels.data[offset] > 24
            || pixels.data[offset + 1] > 24
            || pixels.data[offset + 2] > 24
          ) {
            return;
          }
          pixels.data[offset + 3] = 0;
          queue[queueEnd] = index;
          queueEnd += 1;
        };

        for (let x = 0; x < canvas.width; x += 1) {
          enqueueMattePixel(x);
          enqueueMattePixel((canvas.height - 1) * canvas.width + x);
        }
        for (let y = 0; y < canvas.height; y += 1) {
          enqueueMattePixel(y * canvas.width);
          enqueueMattePixel(y * canvas.width + canvas.width - 1);
        }
        while (queueStart < queueEnd) {
          const index = queue[queueStart];
          queueStart += 1;
          const x = index % canvas.width;
          const y = Math.floor(index / canvas.width);
          if (x > 0) enqueueMattePixel(index - 1);
          if (x + 1 < canvas.width) enqueueMattePixel(index + 1);
          if (y > 0) enqueueMattePixel(index - canvas.width);
          if (y + 1 < canvas.height) enqueueMattePixel(index + canvas.width);
        }
        context.putImageData(pixels, 0, 0);
        this.textures.remove(key);
        this.textures.addCanvas(key, canvas);
      });
  }

  private createArena(): void {
    this.add.image(WIDTH / 2, HEIGHT / 2, 'arena').setDisplaySize(WIDTH, HEIGHT);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x171323, 0.14);
    this.add.text(WIDTH / 2, 25, 'LA DEXÍADA', {
      fontFamily: 'Georgia, serif',
      fontSize: '35px',
      fontStyle: 'bold',
      color: '#f1d99e',
      stroke: '#171326',
      strokeThickness: 5,
    }).setOrigin(0.5, 0);
    this.add.text(WIDTH / 2, 69, 'TEMPLO DE IOBRONTES  ·  XANTARCHÍA', {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      letterSpacing: 3,
      color: '#e1d4e7',
      stroke: '#171326',
      strokeThickness: 3,
    }).setOrigin(0.5, 0);
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(WIDTH / 2, HEIGHT / 2);
  }

  private createCharacters(): void {
    this.actorSprites = {
      furai: this.createPartySprite('furai'),
      dexios: this.createPartySprite('dexios'),
      sahira: this.createPartySprite('sahira'),
    };
    this.breathingTweens = {
      furai: this.createBreathingTween('furai'),
      dexios: this.createBreathingTween('dexios'),
      sahira: this.createBreathingTween('sahira'),
    };
    this.actorNames = {
      furai: this.createNameLabel('furai'),
      dexios: this.createNameLabel('dexios'),
      sahira: this.createNameLabel('sahira'),
    };
    this.missingLabels = {
      furai: this.createMissingLabel('furai'),
      dexios: this.createMissingLabel('dexios'),
      sahira: this.createMissingLabel('sahira'),
    };

    const boss = GAME_CONFIG.characters.iobrontes;
    this.boss = this.add.sprite(boss.x, boss.feetY, 'iobrontes_base')
      .setOrigin(0.5, 1)
      .setDepth(boss.depth);
    this.sizeSprite(this.boss, 'iobrontes_base', boss.displayHeight);
    const bossShadow = this.add.ellipse(boss.x, boss.feetY - 4, 500, 42, 0x100d1b, 0.38)
      .setDepth(boss.depth - 1);
    this.tweens.add({
      targets: [this.boss, bossShadow],
      y: `-=4`,
      duration: 1450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.armorBreakMark = this.createArmorBreakMark();
    this.armorBreakMark.setVisible(false);
  }

  private createPartySprite(id: CharacterId): Phaser.GameObjects.Sprite {
    const character = GAME_CONFIG.characters[id];
    const sprite = this.add.sprite(character.x, character.feetY, character.frames.idle)
      .setOrigin(0.5, 1)
      .setDepth(character.depth);
    this.sizeSprite(sprite, character.frames.idle, character.displayHeight);
    this.add.ellipse(character.x, character.feetY - 3, character.displayHeight * 0.68, 38, 0x100d1b, 0.34)
      .setDepth(character.depth - 1);
    return sprite;
  }

  private createBreathingTween(id: CharacterId): Phaser.Tweens.Tween {
    const character = GAME_CONFIG.characters[id];
    return this.tweens.add({
      targets: this.actorSprites[id],
      y: { from: character.feetY, to: character.feetY - 2 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createNameLabel(id: CharacterId): Phaser.GameObjects.Text {
    const character = GAME_CONFIG.characters[id];
    const label = this.add.text(character.x, character.feetY + 4, character.name.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f2d9a1',
      stroke: '#171326',
      strokeThickness: 5,
    }).setOrigin(0.5, 0).setDepth(10);
    return label;
  }

  private createMissingLabel(id: CharacterId): Phaser.GameObjects.Text {
    const character = GAME_CONFIG.characters[id];
    return this.add.text(character.x, character.feetY - character.displayHeight - 18, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fff1c1',
      backgroundColor: '#211a30',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5, 1).setDepth(15).setVisible(false);
  }

  private sizeSprite(
    sprite: Phaser.GameObjects.Sprite,
    frame: string,
    height: number,
  ): void {
    if (!this.textures.exists(frame)) {
      return;
    }
    const source = this.textures.get(frame).getSourceImage();
    sprite.setDisplaySize(source.width * (height / source.height), height);
  }

  private createHud(): void {
    this.turnText = this.add.text(38, 116, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '27px',
      fontStyle: 'bold',
      color: '#f3e3c0',
      stroke: '#171326',
      strokeThickness: 5,
    }).setDepth(21);
    this.promptText = this.add.text(38, 153, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      color: '#e9dff1',
      stroke: '#171326',
      strokeThickness: 4,
    }).setDepth(21);

    const bossPanel = this.add.graphics().setDepth(20);
    bossPanel.fillStyle(COLORS.panel, 0.94);
    bossPanel.fillRoundedRect(1320, 114, 568, 95, 14);
    bossPanel.lineStyle(2, COLORS.purple, 0.84);
    bossPanel.strokeRoundedRect(1320, 114, 568, 95, 14);
    this.add.text(1340, 120, 'IOBRONTES', {
      fontFamily: 'Georgia, serif',
      fontSize: '23px',
      fontStyle: 'bold',
      color: '#f2e5ff',
    }).setDepth(21);
    this.add.text(1342, 148, 'God of Thunder · Twelfth Heir of Zeus', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c7afd8',
    }).setDepth(21);
    this.bossHealthBar = this.add.graphics().setDepth(22);
    this.bossHealthText = this.add.text(1865, 174, '', this.resourceStyle('#e2c1ff'))
      .setOrigin(1, 0).setDepth(22);

    this.partyCards = {
      furai: this.createPartyCard('furai', 26),
      dexios: this.createPartyCard('dexios', 428),
      sahira: this.createPartyCard('sahira', 830),
    };

    const actionPanel = this.add.graphics().setDepth(20);
    actionPanel.fillStyle(COLORS.panel, 0.97);
    actionPanel.fillRoundedRect(1234, 704, 654, 352, 16);
    actionPanel.lineStyle(2, COLORS.gold, 0.8);
    actionPanel.strokeRoundedRect(1234, 704, 654, 352, 16);
    this.targetText = this.add.text(1561, 668, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fff4d2',
      stroke: '#171326',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5, 0.5).setDepth(22);
    this.actionContent = this.add.container(1250, 724).setDepth(23);

    this.add.text(28, 789, 'DEFENSA: W arriba  ·  A izquierda  ·  S abajo  ·  D derecha', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f1d99e',
      stroke: '#171326',
      strokeThickness: 4,
    }).setDepth(20);
    this.add.text(28, 1056, '1–3: habilidades  ·  M: audio  ·  R: volver a empezar', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#e1d4e7',
      stroke: '#171326',
      strokeThickness: 3,
    }).setDepth(20);
    this.audioText = this.add.text(1876, 1062, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f1d99e',
      backgroundColor: '#171528',
      padding: { x: 8, y: 5 },
    }).setOrigin(1, 1).setDepth(21).setInteractive({ useHandCursor: true });
    this.audioText.on('pointerdown', () => {
      this.soundscape.toggle();
      this.updateAudioLabel();
    });
    this.updateAudioLabel();

    this.resultText = this.add.text(WIDTH / 2, 500, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '45px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#171326',
      strokeThickness: 7,
      align: 'center',
    }).setOrigin(0.5).setDepth(35).setVisible(false);
  }

  private createPartyCard(id: CharacterId, x: number): PartyCard {
    const container = this.add.container(x, 864).setDepth(20);
    const background = this.add.graphics();
    background.fillStyle(COLORS.panel, 0.97);
    background.fillRoundedRect(0, 0, 384, 180, 14);
    background.lineStyle(2, COLORS.gold, 0.52);
    background.strokeRoundedRect(0, 0, 384, 180, 14);
    const name = this.add.text(17, 8, GAME_CONFIG.characters[id].name.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#f3e3c0',
    });
    const turn = this.add.text(366, 11, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffe187',
    }).setOrigin(1, 0);
    const health = this.add.text(17, 34, '', this.resourceStyle('#a9efbd'));
    const healthBar = this.add.graphics();
    const mana = this.add.text(17, 74, '', this.resourceStyle('#a4ddff'));
    const manaBar = this.add.graphics();
    const chaos = id === 'dexios'
      ? this.add.text(17, 114, '', this.resourceStyle('#ffb1b1'))
      : undefined;
    const chaosBar = id === 'dexios' ? this.add.graphics() : undefined;
    const selection = this.add.text(17, 164, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#d1c4dc',
    }).setPosition(17, 160);
    container.add(
      [background, name, turn, health, healthBar, mana, manaBar, selection]
        .concat(chaos ? [chaos, chaosBar!] : []),
    );
    container.setSize(384, 180);
    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 384, 180),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on('pointerdown', () => {
      if (this.healingSelection) {
        this.healCharacter(id);
      }
    });
    return {
      container,
      name,
      turn,
      health,
      mana,
      selection,
      chaos,
      healthBar,
      manaBar,
      chaosBar,
    };
  }

  private createIndicators(): void {
    this.timingRing = this.add.graphics().setDepth(9);
    this.warning = this.add.container(0, 0).setDepth(16).setVisible(false);
    const badge = this.add.graphics();
    badge.fillStyle(0x251533, 0.94);
    badge.fillRoundedRect(-66, -43, 132, 86, 15);
    badge.lineStyle(4, COLORS.violet, 0.95);
    badge.strokeRoundedRect(-66, -43, 132, 86, 15);
    this.warningArrow = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '57px',
      fontStyle: 'bold',
      color: '#f1d9ff',
    }).setOrigin(0.5);
    this.warning.add([badge, this.warningArrow]);

  }

  private createActionButton(ability: Ability, index: number): void {
    const y = 20 + index * 71;
    const background = this.add.graphics();
    const color = ability.color;
    background.fillStyle(COLORS.panelLight, 1);
    background.fillRoundedRect(0, 0, 620, 59, 9);
    background.lineStyle(2, color, 0.52);
    background.strokeRoundedRect(0, 0, 620, 59, 9);
    const name = this.add.text(16, 8, `${index + 1}  ·  ${ability.name.toUpperCase()}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f3e9d6',
    });
    const costLabel = ability.resource === 'mana'
      ? `${ability.cost} MANÁ`
      : ability.resource === 'chaos'
        ? `${ability.cost} CAOS`
        : 'GRATIS';
    const detail = this.add.text(16, 34, `${ability.detail}  ·  ${costLabel}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#d0c2dc',
    });
    const available = this.activeCharacter !== null
      && canAfford(this.state.party[this.activeCharacter], ability);
    const button = this.add.container(0, y, [background, name, detail])
      .setSize(620, 59)
      .setAlpha(available && this.phase === 'player' ? 1 : 0.42);
    button.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 620, 59),
      Phaser.Geom.Rectangle.Contains,
    );
    button.on('pointerover', () => {
      if (available && this.phase === 'player' && !this.healingSelection) {
        background.clear();
        background.fillStyle(0x40344f, 1);
        background.fillRoundedRect(0, 0, 620, 59, 9);
        background.lineStyle(2, color, 0.95);
        background.strokeRoundedRect(0, 0, 620, 59, 9);
      }
    });
    button.on('pointerout', () => {
      background.clear();
      background.fillStyle(COLORS.panelLight, 1);
      background.fillRoundedRect(0, 0, 620, 59, 9);
      background.lineStyle(2, color, 0.52);
      background.strokeRoundedRect(0, 0, 620, 59, 9);
    });
    button.on('pointerdown', () => this.performAbility(ability));
    this.actionContent.add(button);
  }

  private updateActionMenu(): void {
    this.actionContent.removeAll(true);
    if (this.phase === 'ended') {
      return;
    }
    if (this.healingSelection) {
      this.actionContent.add(this.add.text(12, 0, 'ELIGE UN ALIADO CON VIDA PARA RESTAURARLO', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#c8ffe9',
      }));
      (['dexios', 'furai', 'sahira'] as const).forEach((id, index) => {
        const health = this.state.party[id].health;
        this.createTargetButton(id, index, health > 0);
      });
      return;
    }
    if (this.phase === 'player' && this.activeCharacter) {
      GAME_CONFIG.abilities[this.activeCharacter].forEach((ability, index) => {
        this.createActionButton(ability, index);
      });
      return;
    }
    this.actionContent.add(this.add.text(12, 12, 'ESPERANDO...', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#d4c5e4',
    }));
  }

  private createTargetButton(id: CharacterId, index: number, available: boolean): void {
    const x = 4 + index * 203;
    const background = this.add.graphics();
    background.fillStyle(COLORS.panelLight, 1);
    background.fillRoundedRect(x, 51, 194, 84, 10);
    background.lineStyle(2, available ? COLORS.teal : COLORS.red, 0.7);
    background.strokeRoundedRect(x, 51, 194, 84, 10);
    const label = this.add.text(x + 97, 70, `${index + 1}  ${GAME_CONFIG.characters[id].name.toUpperCase()}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: available ? '#e7fff7' : '#918698',
      align: 'center',
      wordWrap: { width: 178 },
    }).setOrigin(0.5, 0);
    const button = this.add.container(0, 0, [background, label])
      .setSize(194, 140)
      .setAlpha(available ? 1 : 0.45);
    button.setInteractive(
      new Phaser.Geom.Rectangle(x, 51, 194, 84),
      Phaser.Geom.Rectangle.Contains,
    );
    button.on('pointerdown', () => {
      if (available) {
        this.healCharacter(id);
      }
    });
    this.actionContent.add(button);
  }

  private refreshHud(): void {
    (['furai', 'dexios', 'sahira'] as const).forEach((id) => {
      const status = this.state.party[id];
      const card = this.partyCards[id];
      const maximumHealth = MAX_HEALTH[id];
      const maximumMana = MAX_MANA[id];
      const incapacitated = status.health <= 0;
      card.name.setColor(incapacitated ? '#938a98' : '#f3e3c0');
      card.turn.setText(
        this.activeCharacter === id && this.phase === 'player'
          ? 'TU TURNO'
          : this.targetCharacter === id && this.phase !== 'player'
            ? 'OBJETIVO'
          : incapacitated
            ? 'INCAPACITADO'
            : '',
      );
      card.container.setAlpha(incapacitated ? 0.5 : 1);
      this.updateBar(card.healthBar, 17, 58, 350, 13, status.health, maximumHealth, COLORS.green);
      this.updateBar(card.manaBar, 17, 98, 350, 13, status.mana, maximumMana, COLORS.blue);
      card.health.setText(`VIDA  ${status.health} / ${maximumHealth}`);
      card.mana.setText(`MANÁ  ${status.mana} / ${maximumMana}`);
      if (id === 'dexios' && card.chaos && card.chaosBar) {
        this.updateBar(card.chaosBar, 17, 138, 350, 13, status.chaos, MAX_CHAOS, COLORS.red);
        card.chaos.setText(`CAOS  ${status.chaos} / ${MAX_CHAOS}`);
      }
      const targetLabel = this.healingSelection
        ? status.health > 0
          ? `Pulsa el panel o la tecla ${(['dexios', 'furai', 'sahira'] as const).indexOf(id) + 1} para elegir`
          : 'No se puede reanimar'
        : '';
      card.selection.setText(targetLabel);
      const bg = card.container.getAt(0) as Phaser.GameObjects.Graphics;
      bg.clear();
      bg.fillStyle(COLORS.panel, 0.97);
      bg.fillRoundedRect(0, 0, 384, 180, 14);
      bg.lineStyle(
        this.activeCharacter === id && this.phase === 'player' ? 3 : 2,
        this.activeCharacter === id && this.phase === 'player' ? COLORS.yellow : COLORS.gold,
        this.activeCharacter === id && this.phase === 'player' ? 0.98 : 0.52,
      );
      bg.strokeRoundedRect(0, 0, 384, 180, 14);
    });
    this.updateBar(
      this.bossHealthBar,
      1340,
      183,
      520,
      11,
      this.state.iobrontesHealth,
      MAX_IOBRONTES_HEALTH,
      COLORS.purple,
    );
    this.bossHealthText.setText(`${this.state.iobrontesHealth} / ${MAX_IOBRONTES_HEALTH}`);
    this.armorBreakMark.setVisible(this.state.armorBreak);
    this.updateActionMenu();
  }



  private resourceStyle(color: string): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color,
      stroke: '#171326',
      strokeThickness: 3,
    };
  }

  private startTurn(): void {
    if (this.finishIfBattleEnded()) {
      return;
    }
    for (let attempt = 0; attempt < GAME_CONFIG.partyOrder.length; attempt += 1) {
      const turn = GAME_CONFIG.partyOrder[this.turnIndex];
      if (turn === 'iobrontes') {
        this.activeCharacter = null;
        this.healingSelection = false;
        this.phase = 'windup';
        this.turnText.setText('IOBRONTES · TURNO');
        this.promptText.setText('El dios del trueno inicia una cadena de tres rayos.');
        this.targetText.setText('');
        this.refreshHud();
        this.startEnemyChain();
        return;
      }
      if (this.state.party[turn].health <= 0) {
        this.turnIndex = (this.turnIndex + 1) % GAME_CONFIG.partyOrder.length;
        continue;
      }
      this.activeCharacter = turn;
      this.healingSelection = false;
      this.phase = 'player';
      this.turnText.setText(`${GAME_CONFIG.characters[turn].name.toUpperCase()} · TU TURNO`);
      this.promptText.setText('Elige una habilidad para continuar la batalla.');
      this.targetText.setText('');
      this.setActorFrame(turn, GAME_CONFIG.characters[turn].frames.idle);
      this.refreshHud();
      return;
    }
    this.finishBattle('defeat');
  }

  private advanceTurn(): void {
    if (this.result) {
      return;
    }
    this.healingSelection = false;
    this.activeCharacter = null;
    this.turnIndex = (this.turnIndex + 1) % GAME_CONFIG.partyOrder.length;
    this.phase = 'player';
    this.refreshHud();
    this.startTurn();
  }

  private startEnemyChain(): void {
    const eligible = (['furai', 'dexios', 'sahira'] as const)
      .filter((id) => this.state.party[id].health > 0);
    if (eligible.length === 0) {
      this.finishBattle('defeat');
      return;
    }
    this.targetCharacter = Phaser.Utils.Array.GetRandom(eligible);
    this.perfectParries = 0;
    this.lightningIndex = 0;
    this.focusCamera(this.targetCharacter);
    this.partyCards[this.targetCharacter].turn.setText('OBJETIVO');
    this.actorNames[this.targetCharacter].setColor('#ffe187');
    this.promptText.setText(`${GAME_CONFIG.characters[this.targetCharacter].name} es el objetivo.`);
    this.refreshHud();
    this.time.delayedCall(GAME_CONFIG.camera.focusMs, () => this.beginLightningBolt());
  }

  private beginLightningBolt(): void {
    if (!this.targetCharacter || this.result) {
      return;
    }
    if (this.state.party[this.targetCharacter].health <= 0) {
      this.finishEnemyChain();
      return;
    }
    this.phase = 'windup';
    this.attackDirection = Phaser.Utils.Array.GetRandom(['up', 'down', 'left', 'right'] as const);
    this.responseDirection = null;
    this.responseTime = null;
    this.defenseOutcome = null;
    this.hasImpacted = false;
    this.warning.setPosition(...this.warningPosition(this.targetCharacter, this.attackDirection));
    this.warningArrow.setText(this.directionArrow(this.attackDirection));
    this.warning.setVisible(true).setAlpha(1);
    this.tweens.add({
      targets: this.warning,
      alpha: 0.45,
      duration: 280,
      yoyo: true,
      repeat: 2,
    });
    const bossFrame = GAME_CONFIG.characters.iobrontes.frames.attack[this.attackDirection];
    this.setBossFrame(bossFrame, WIND_UP_MS + PROJECTILE_TRAVEL_MS + 400);
    this.targetText.setText(
      `${this.directionControl(this.attackDirection)}  ·  GOLPE ${this.lightningIndex + 1} / 3`,
    );
    this.time.delayedCall(WIND_UP_MS, () => this.launchEnemyLightning());
  }

  private launchEnemyLightning(): void {
    if (this.phase !== 'windup' || !this.attackDirection || !this.targetCharacter || this.result) {
      return;
    }
    this.phase = 'projectile';
    this.projectileStartedAt = this.time.now;
    this.warning.setVisible(false);
    this.timingRing.clear();
    this.targetText.setText('¡DESCARGA EN CAMINO!');
    this.soundscape.play('iobrontes');
    const path = this.lightningPath(this.targetCharacter, this.attackDirection);
    const bolt = this.createBolt();
    this.activeBolt = bolt;
    bolt.setPosition(path.start.x, path.start.y).setRotation(path.rotation).setDepth(8);
    this.tweens.add({
      targets: bolt,
      x: path.end.x,
      y: path.end.y,
      duration: PROJECTILE_TRAVEL_MS,
      ease: 'Linear',
      onComplete: () => {
        bolt.destroy();
        if (this.activeBolt === bolt) {
          this.activeBolt = undefined;
        }
      },
    });
    this.time.delayedCall(DEFENSE_WINDOW_END_MS, () => this.resolveEnemyAttack());
  }

  private lightningPath(targetId: CharacterId, direction: Direction): LightningPath {
    const target = GAME_CONFIG.characters[targetId];
    const impactY = target.feetY - target.displayHeight * 0.52;
    switch (direction) {
      case 'left':
        return {
          start: new Phaser.Math.Vector2(target.x - 620, impactY),
          end: new Phaser.Math.Vector2(target.x - 60, impactY),
          rotation: 0,
        };
      case 'right':
        return {
          start: new Phaser.Math.Vector2(target.x + 620, impactY),
          end: new Phaser.Math.Vector2(target.x + 60, impactY),
          rotation: Math.PI,
        };
      case 'up':
        return {
          start: new Phaser.Math.Vector2(target.x, impactY - 620),
          end: new Phaser.Math.Vector2(target.x, impactY - 80),
          rotation: Math.PI / 2,
        };
      case 'down':
        return {
          start: new Phaser.Math.Vector2(target.x, impactY + 220),
          end: new Phaser.Math.Vector2(target.x, impactY + 80),
          rotation: -Math.PI / 2,
        };
    }
  }

  private createBolt(): Phaser.GameObjects.Graphics {
    const bolt = this.add.graphics();
    const length = 600;
    const segments = 14;
    const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
    for (let point = 1; point < segments; point += 1) {
      points.push({
        x: (length / segments) * point,
        y: Phaser.Math.Between(-34, 34),
      });
    }
    points.push({ x: length, y: 0 });
    bolt.lineStyle(34, COLORS.purple, 0.25);
    this.strokePolyline(bolt, points);
    bolt.lineStyle(16, COLORS.purple, 0.82);
    this.strokePolyline(bolt, points);
    bolt.lineStyle(6, 0xf8edff, 1);
    this.strokePolyline(bolt, points);
    return bolt;
  }

  private strokePolyline(
    graphics: Phaser.GameObjects.Graphics,
    points: Array<{ x: number; y: number }>,
  ): void {
    for (let point = 1; point < points.length; point += 1) {
      graphics.lineBetween(
        points[point - 1].x,
        points[point - 1].y,
        points[point].x,
        points[point].y,
      );
    }
  }

  private resolveEnemyAttack(): void {
    if (
      this.phase !== 'projectile'
      || !this.attackDirection
      || !this.targetCharacter
      || this.result
    ) {
      return;
    }
    this.phase = 'resolving';
    const outcome = this.defenseOutcome ?? 'failed';
    const targetId = this.targetCharacter;
    const damage = damageForDefense(targetId, outcome);
    const actualDamage = damagePartyMember(this.state, targetId, damage);
    this.timingRing.clear();
    this.warning.setVisible(false);
    this.soundscape.play(outcome === 'perfect' ? 'perfect_block' : 'impact');

    if (outcome === 'perfect') {
      this.perfectParries += 1;
      this.showFloatingText('PERFECT', GAME_CONFIG.characters[targetId].x, this.actorSprites[targetId].y - GAME_CONFIG.characters[targetId].displayHeight, '#ffffff');
      this.createImpact(
        GAME_CONFIG.characters[targetId].x,
        GAME_CONFIG.characters[targetId].feetY - GAME_CONFIG.characters[targetId].displayHeight * 0.54,
        0xffffff,
        1.16,
      );
      this.cameras.main.flash(100, 190, 145, 255, false);
      this.setActorFrame(targetId, GAME_CONFIG.characters[targetId].frames.defense[this.attackDirection]);
      if (targetId === 'dexios') {
        damageIobrontes(this.state, PERFECT_PARRY_DAMAGE);
        this.createImpact(
          GAME_CONFIG.characters.iobrontes.x,
          GAME_CONFIG.characters.iobrontes.feetY - 310,
          COLORS.yellow,
          0.8,
        );
        this.setBossFrame('iobrontes_herido', 450);
        this.showFloatingText('-5', GAME_CONFIG.characters.iobrontes.x, GAME_CONFIG.characters.iobrontes.feetY - 360, '#fff0a5');
      }
      this.promptText.setText('Parada perfecta: daño evitado.');
    } else if (outcome === 'blocked') {
      this.showFloatingText('BLOCK', GAME_CONFIG.characters[targetId].x, this.actorSprites[targetId].y - GAME_CONFIG.characters[targetId].displayHeight, '#ffd65c');
      this.setActorFrame(targetId, GAME_CONFIG.characters[targetId].frames.defense[this.attackDirection]);
      this.createImpact(
        GAME_CONFIG.characters[targetId].x,
        GAME_CONFIG.characters[targetId].feetY - GAME_CONFIG.characters[targetId].displayHeight * 0.52,
        COLORS.yellow,
        0.75,
      );
      this.promptText.setText(
        targetId === 'sahira'
          ? 'Bloqueo: Sahira no recibe daño.'
          : `Bloqueo imperfecto: ${actualDamage} de daño.`,
      );
    } else {
      this.showFloatingText('FAIL', GAME_CONFIG.characters[targetId].x, this.actorSprites[targetId].y - GAME_CONFIG.characters[targetId].displayHeight, '#ff8d8d');
      this.setActorFrame(targetId, GAME_CONFIG.characters[targetId].frames.hit, 650);
      this.createImpact(
        GAME_CONFIG.characters[targetId].x,
        GAME_CONFIG.characters[targetId].feetY - GAME_CONFIG.characters[targetId].displayHeight * 0.52,
        COLORS.purple,
        1.1,
      );
      this.promptText.setText(`Impacto: ${actualDamage} de daño.`);
    }
    if (actualDamage > 0) {
      this.showFloatingText(
        `-${actualDamage}`,
        GAME_CONFIG.characters[targetId].x + 70,
        GAME_CONFIG.characters[targetId].feetY - GAME_CONFIG.characters[targetId].displayHeight * 0.6,
        '#ffb7a9',
      );
    }
    this.refreshHud();
    if (this.finishIfBattleEnded()) {
      return;
    }
    this.time.delayedCall(GAME_CONFIG.timing.resultDurationMs, () => {
      if (this.phase !== 'resolving' || this.result) {
        return;
      }
      this.setActorFrame(targetId, GAME_CONFIG.characters[targetId].frames.idle);
      this.lightningIndex += 1;
      if (this.state.party[targetId].health <= 0 || this.lightningIndex >= 3) {
        this.finishEnemyChain();
      } else {
        this.time.delayedCall(GAME_CONFIG.timing.nextBoltDelayMs, () => this.beginLightningBolt());
      }
    });
  }

  private finishEnemyChain(): void {
    if (!this.targetCharacter || this.result) {
      return;
    }
    const target = this.targetCharacter;
    if (target === 'furai' && this.perfectParries === 3 && this.state.party.furai.health > 0) {
      this.phase = 'action';
      this.promptText.setText('Parry perfecto · Tiger Parry: Furai contraataca tras tres paradas perfectas.');
      this.turnText.setText('TIGER PARRY');
      this.showFloatingText('TIGER PARRY', GAME_CONFIG.characters.furai.x, GAME_CONFIG.characters.furai.feetY - 520, '#ffe187');
      this.setActorFrame('furai', GAME_CONFIG.characters.furai.frames.attack);
      this.soundscape.play('furai');
      this.time.delayedCall(300, () => {
        if (this.phase === 'ended' || this.result) {
          return;
        }
        damageIobrontes(this.state, 20);
        this.createImpact(
          GAME_CONFIG.characters.iobrontes.x,
          GAME_CONFIG.characters.iobrontes.feetY - 320,
          COLORS.yellow,
          1.05,
        );
        this.setBossFrame('iobrontes_herido', 500);
        this.refreshHud();
        if (this.finishIfBattleEnded()) {
          return;
        }
        this.returnCameraAndAdvance();
      });
      return;
    }
    this.returnCameraAndAdvance();
  }

  private returnCameraAndAdvance(): void {
    this.warning.setVisible(false);
    this.timingRing.clear();
    this.targetText.setText('');
    if (this.targetCharacter) {
      this.actorNames[this.targetCharacter].setColor('#f2d9a1');
      this.setActorFrame(
        this.targetCharacter,
        GAME_CONFIG.characters[this.targetCharacter].frames.idle,
      );
    }
    this.targetCharacter = null;
    this.attackDirection = null;
    this.phase = 'resolving';
    this.cameras.main.pan(WIDTH / 2, HEIGHT / 2, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
    this.time.delayedCall(GAME_CONFIG.camera.returnMs, () => this.advanceTurn());
  }

  private performAbility(ability: Ability): void {
    const character = this.activeCharacter;
    if (
      this.phase !== 'player'
      || !character
      || this.state.party[character].health <= 0
      || !canAfford(this.state.party[character], ability)
    ) {
      return;
    }
    if (ability.id === 'hippopotamus-healing') {
      this.healingSelection = true;
      this.promptText.setText('Elige un aliado consciente para restaurar toda su salud.');
      this.targetText.setText('ELIGE UN ALIADO');
      this.refreshHud();
      return;
    }

    this.phase = 'action';
    spendCost(this.state.party[character], ability);
    this.healingSelection = false;
    if (ability.id === 'armor-break') {
      this.state.armorBreak = true;
      this.armorBreakMark.setVisible(true);
      this.setActorFrame(character, 'furai_romper', GAME_CONFIG.timing.spritePoseMs);
      this.soundscape.play('magic');
      this.createImpact(
        GAME_CONFIG.characters.iobrontes.x,
        GAME_CONFIG.characters.iobrontes.feetY - GAME_CONFIG.characters.iobrontes.displayHeight - 50,
        COLORS.violet,
        0.95,
      );
      this.promptText.setText('Armor Break activo: el siguiente ataque elegido duplica su primer impacto.');
      this.refreshHud();
      this.time.delayedCall(GAME_CONFIG.timing.attackRecoveryMs, () => this.finishPlayerAction());
      return;
    }

    const empowered = this.state.armorBreak;
    if (empowered && ability.damage > 0) {
      this.state.armorBreak = false;
      this.armorBreakMark.setVisible(false);
    }
    this.promptText.setText(
      empowered && ability.damage > 0
        ? `${ability.name}: ¡el primer impacto recibe el doble de daño!`
        : `${ability.name} en curso.`,
    );
    this.soundscape.play(ability.sound);
    this.refreshHud();
    this.performAbilityHit(character, ability, 0, empowered);
  }

  private performAbilityHit(
    character: CharacterId,
    ability: Ability,
    hitIndex: number,
    empowered: boolean,
  ): void {
    if (this.phase !== 'action' || this.result) {
      return;
    }
    const actor = this.actorSprites[character];
    const actorConfig = GAME_CONFIG.characters[character];
    const frame = ability.frame;
    this.setActorFrame(character, frame);
    this.tweens.add({
      targets: actor,
      x: actorConfig.x + 55,
      duration: 150,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.phase !== 'action' || this.result) {
          return;
        }
        const multiplier = empowered && hitIndex === 0 ? 2 : 1;
        const damage = ability.damage * multiplier;
        damageIobrontes(this.state, damage);
        this.setBossFrame('iobrontes_herido', 400);
        this.createImpact(
          GAME_CONFIG.characters.iobrontes.x - 70 + hitIndex * 44,
          GAME_CONFIG.characters.iobrontes.feetY - 320,
          ability.color,
          multiplier === 2 ? 1.12 : 0.84,
        );
        this.showFloatingText(
          `-${damage}`,
          GAME_CONFIG.characters.iobrontes.x - 50,
          GAME_CONFIG.characters.iobrontes.feetY - 370 - hitIndex * 32,
          multiplier === 2 ? '#fff0a5' : '#ffffff',
        );
        this.refreshHud();
        if (this.finishIfBattleEnded()) {
          return;
        }
        if (hitIndex + 1 < ability.hits) {
          this.time.delayedCall(GAME_CONFIG.timing.attackHitIntervalMs, () => {
            this.performAbilityHit(character, ability, hitIndex + 1, empowered);
          });
          return;
        }
        this.finishAbility(character, ability);
      },
    });
  }

  private finishAbility(character: CharacterId, ability: Ability): void {
    if (ability.selfDamage > 0) {
      const damage = damagePartyMember(this.state, character, ability.selfDamage, false);
      this.setActorFrame(character, GAME_CONFIG.characters[character].frames.hit, 550);
      this.showFloatingText(
        `-${damage}`,
        GAME_CONFIG.characters[character].x,
        GAME_CONFIG.characters[character].feetY - GAME_CONFIG.characters[character].displayHeight - 5,
        '#ff9c9c',
      );
    }
    this.refreshHud();
    if (this.finishIfBattleEnded()) {
      return;
    }
    this.time.delayedCall(GAME_CONFIG.timing.attackRecoveryMs, () => this.finishPlayerAction());
  }

  private healCharacter(target: CharacterId): void {
    if (
      !this.healingSelection
      || this.phase !== 'player'
      || this.activeCharacter !== 'sahira'
      || this.state.party[target].health <= 0
    ) {
      return;
    }
    const ability = GAME_CONFIG.abilities.sahira.find(
      (entry) => entry.id === 'hippopotamus-healing',
    );
    if (!ability || !canAfford(this.state.party.sahira, ability)) {
      return;
    }
    this.phase = 'action';
    this.healingSelection = false;
    spendCost(this.state.party.sahira, ability);
    this.setActorFrame('sahira', 'sahira_cura', 850);
    const restored = healPartyMember(this.state, target);
    this.soundscape.play('heal');
    this.createImpact(
      GAME_CONFIG.characters[target].x,
      GAME_CONFIG.characters[target].feetY - GAME_CONFIG.characters[target].displayHeight * 0.6,
      COLORS.teal,
      1.35,
    );
    this.showFloatingText(
      `+${restored} VIDA`,
      GAME_CONFIG.characters[target].x,
      GAME_CONFIG.characters[target].feetY - GAME_CONFIG.characters[target].displayHeight - 12,
      '#a8ffdc',
    );
    this.promptText.setText(`${GAME_CONFIG.characters[target].name} recupera toda su salud.`);
    this.refreshHud();
    this.time.delayedCall(GAME_CONFIG.timing.attackRecoveryMs, () => this.finishPlayerAction());
  }

  private finishPlayerAction(): void {
    if (this.phase !== 'action' || this.result) {
      return;
    }
    if (this.activeCharacter) {
      this.setActorFrame(
        this.activeCharacter,
        GAME_CONFIG.characters[this.activeCharacter].frames.idle,
      );
    }
    this.advanceTurn();
  }

  private registerDefense(direction: Direction): void {
    if (
      this.phase !== 'projectile'
      || this.responseDirection !== null
      || !this.attackDirection
      || !this.targetCharacter
    ) {
      return;
    }
    const elapsed = this.time.now - this.projectileStartedAt;
    if (elapsed < DEFENSE_WINDOW_START_MS || elapsed > DEFENSE_WINDOW_END_MS) {
      return;
    }
    this.responseDirection = direction;
    this.responseTime = elapsed;
    this.defenseOutcome = resolveDefense(this.attackDirection, direction, elapsed);
    const targetConfig = GAME_CONFIG.characters[this.targetCharacter];
    if (this.defenseOutcome === 'perfect') {
      this.targetText.setText('¡PARADA PERFECTA!');
      this.setActorFrame(
        this.targetCharacter,
        targetConfig.frames.defense[direction],
        GAME_CONFIG.timing.spritePoseMs,
      );
      this.createImpact(
        targetConfig.x,
        targetConfig.feetY - targetConfig.displayHeight * 0.55,
        0xffffff,
        0.85,
      );
    } else if (this.defenseOutcome === 'blocked') {
      this.targetText.setText(
        this.targetCharacter === 'sahira' ? '¡BLOQUEO!' : '¡BLOQUEO IMPERFECTO!',
      );
      this.setActorFrame(
        this.targetCharacter,
        targetConfig.frames.defense[direction],
        GAME_CONFIG.timing.spritePoseMs,
      );
    } else {
      this.targetText.setText('DIRECCIÓN EQUIVOCADA');
      this.setActorFrame(this.targetCharacter, targetConfig.frames.hit, 550);
      this.cameras.main.shake(110, 0.004);
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.repeat) {
      return;
    }
    this.soundscape.start();
    const key = event.key.toLowerCase();
    if (key === 'm') {
      this.soundscape.toggle();
      this.updateAudioLabel();
      return;
    }
    if (key === 'r' && this.phase === 'ended') {
      this.scene.restart();
      return;
    }
    if (key === 'escape' && this.healingSelection) {
      this.healingSelection = false;
      this.promptText.setText('Elige una habilidad para continuar la batalla.');
      this.targetText.setText('');
      this.refreshHud();
      return;
    }
    if (this.healingSelection) {
      const target = (['dexios', 'furai', 'sahira'] as const)[Number(key) - 1];
      if (target) {
        this.healCharacter(target);
      }
      return;
    }
    if (this.phase === 'player') {
      const abilityIndex = Number(key) - 1;
      if (abilityIndex >= 0 && this.activeCharacter) {
        const ability = GAME_CONFIG.abilities[this.activeCharacter][abilityIndex];
        if (ability) {
          this.performAbility(ability);
        }
      }
      return;
    }
    const direction = this.directionForKey(key);
    if (direction) {
      this.registerDefense(direction);
    }
  }

  private directionForKey(key: string): Direction | null {
    switch (key) {
      case 'a': return 'left';
      case 'd': return 'right';
      case 'w': return 'up';
      case 's': return 'down';
      default: return null;
    }
  }

  private directionControl(direction: Direction): string {
    switch (direction) {
      case 'left': return 'A · IZQUIERDA';
      case 'right': return 'D · DERECHA';
      case 'up': return 'W · ARRIBA';
      case 'down': return 'S · ABAJO';
    }
  }

  private directionArrow(direction: Direction): string {
    switch (direction) {
      case 'left': return '←';
      case 'right': return '→';
      case 'up': return '↑';
      case 'down': return '↓';
    }
  }

  private warningPosition(
    id: CharacterId,
    direction: Direction,
  ): [number, number] {
    const character = GAME_CONFIG.characters[id];
    const centerY = character.feetY - character.displayHeight * 0.55;
    switch (direction) {
      case 'left': return [character.x - 180, centerY];
      case 'right': return [character.x + 180, centerY];
      case 'up': return [character.x, centerY - character.displayHeight * 0.55];
      case 'down': return [character.x, centerY + character.displayHeight * 0.45];
    }
  }

  private setActorFrame(id: CharacterId, frame: string, durationMs = 0): void {
    const sprite = this.actorSprites[id];
    const config = GAME_CONFIG.characters[id];
    const generation = ++this.frameGeneration[id];
    if (frame === config.frames.idle && this.state.party[id].health > 0) {
      this.breathingTweens[id].stop();
      sprite.setY(config.feetY);
      this.breathingTweens[id].restart();
    } else {
      this.breathingTweens[id].stop();
      sprite.setY(config.feetY);
    }
    if (this.textures.exists(frame)) {
      sprite.setTexture(frame).setAlpha(this.state.party[id].health > 0 ? 1 : 0.32);
      this.sizeSprite(sprite, frame, config.displayHeight);
      this.missingLabels[id].setVisible(false);
    } else {
      this.missingLabels[id]
        .setText(`FALTA EL FOTOGRAMA: ${frame}`)
        .setPosition(config.x, config.feetY - config.displayHeight - 18)
        .setVisible(true);
    }
    if (durationMs > 0) {
      this.time.delayedCall(durationMs, () => {
        if (this.frameGeneration[id] === generation && this.state.party[id].health > 0) {
          this.setActorFrame(id, config.frames.idle);
        }
      });
    }
  }

  private setBossFrame(frame: string, durationMs = 0): void {
    const config = GAME_CONFIG.characters.iobrontes;
    const generation = ++this.bossFrameGeneration;
    if (this.textures.exists(frame)) {
      this.boss.setTexture(frame);
      this.sizeSprite(this.boss, frame, config.displayHeight);
    }
    if (durationMs > 0) {
      this.time.delayedCall(durationMs, () => {
        if (this.bossFrameGeneration === generation && !this.result) {
          this.setBossFrame(config.frames.idle);
        }
      });
    }
  }

  private focusCamera(id: CharacterId): void {
    const target = GAME_CONFIG.characters[id];
    const centerX = Phaser.Math.Clamp(
      target.x + 360,
      WIDTH / (2 * GAME_CONFIG.camera.targetZoom),
      WIDTH - WIDTH / (2 * GAME_CONFIG.camera.targetZoom),
    );
    const centerY = Phaser.Math.Clamp(
      target.feetY - target.displayHeight * 0.5,
      HEIGHT / (2 * GAME_CONFIG.camera.targetZoom),
      HEIGHT - HEIGHT / (2 * GAME_CONFIG.camera.targetZoom),
    );
    this.cameras.main.pan(
      centerX,
      centerY,
      GAME_CONFIG.camera.focusMs,
      'Sine.easeInOut',
    );
    this.cameras.main.zoomTo(
      GAME_CONFIG.camera.targetZoom,
      GAME_CONFIG.camera.focusMs,
      'Sine.easeInOut',
    );
    this.actorSprites[id].setTint(0xfff1c4);
    this.time.delayedCall(GAME_CONFIG.camera.focusMs, () => {
      if (this.actorSprites[id].active) {
        this.actorSprites[id].clearTint();
      }
    });
  }

  private createImpact(x: number, y: number, color: number, scale: number): void {
    const glow = this.add.circle(x, y, 40 * scale, color, 0.27).setDepth(15);
    const flash = this.add.graphics().setDepth(16);
    this.uiCamera.ignore([glow, flash]);
    flash.lineStyle(7, color, 1);
    for (let ray = 0; ray < 9; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 9;
      const inner = 12 * scale;
      const outer = (40 + (ray % 3) * 14) * scale;
      flash.lineBetween(
        x + Math.cos(angle) * inner,
        y + Math.sin(angle) * inner,
        x + Math.cos(angle) * outer,
        y + Math.sin(angle) * outer,
      );
    }
    this.tweens.add({
      targets: [glow, flash],
      alpha: 0,
      scale: 1.7,
      duration: 420,
      onComplete: () => {
        glow.destroy();
        flash.destroy();
      },
    });
  }

  private showFloatingText(text: string, x: number, y: number, color: string): void {
    const label = this.add.text(x, y, text, {
      fontFamily: 'Georgia, serif',
      fontSize: '25px',
      fontStyle: 'bold',
      color,
      stroke: '#171326',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(18);
    this.uiCamera.ignore(label);
    this.tweens.add({
      targets: label,
      y: y - 55,
      alpha: 0,
      duration: 950,
      onComplete: () => label.destroy(),
    });
  }

  private createArmorBreakMark(): Phaser.GameObjects.Container {
    const boss = GAME_CONFIG.characters.iobrontes;
    const mark = this.add.container(boss.x, boss.feetY - boss.displayHeight - 35).setDepth(13);
    const emblem = this.add.graphics();
    emblem.fillStyle(0x541b80, 0.92);
    emblem.fillPoints([
      new Phaser.Math.Vector2(-43, -20),
      new Phaser.Math.Vector2(-20, -42),
      new Phaser.Math.Vector2(0, -28),
      new Phaser.Math.Vector2(20, -42),
      new Phaser.Math.Vector2(43, -20),
      new Phaser.Math.Vector2(34, 17),
      new Phaser.Math.Vector2(0, 40),
      new Phaser.Math.Vector2(-34, 17),
    ], true);
    emblem.lineStyle(4, 0xe1a4ff, 0.95);
    emblem.strokePoints([
      new Phaser.Math.Vector2(-43, -20),
      new Phaser.Math.Vector2(-20, -42),
      new Phaser.Math.Vector2(0, -28),
      new Phaser.Math.Vector2(20, -42),
      new Phaser.Math.Vector2(43, -20),
      new Phaser.Math.Vector2(34, 17),
      new Phaser.Math.Vector2(0, 40),
      new Phaser.Math.Vector2(-34, 17),
    ], true);
    emblem.fillStyle(0xffe7ff, 1);
    emblem.fillCircle(-13, -3, 4);
    emblem.fillCircle(13, -3, 4);
    emblem.lineStyle(4, 0xe1a4ff, 1);
    emblem.lineBetween(-10, 13, 0, 20);
    emblem.lineBetween(0, 20, 10, 13);
    emblem.lineBetween(-24, -5, -16, 5);
    emblem.lineBetween(24, -5, 16, 5);
    const label = this.add.text(0, 48, 'ARMOR BREAK', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f0d3ff',
      stroke: '#171326',
      strokeThickness: 4,
    }).setOrigin(0.5, 0);
    mark.add([emblem, label]);
    return mark;
  }

  private updateAudioLabel(): void {
    this.audioText?.setText(this.soundscape.isEnabled ? '♫ AUDIO · M' : '♫ SILENCIO · M');
  }

  private startAudio(): void {
    this.soundscape.start();
    this.updateAudioLabel();
  }

  private finishIfBattleEnded(): boolean {
    const result = getBattleResult(this.state);
    if (!result) {
      return false;
    }
    this.finishBattle(result);
    return true;
  }

  private finishBattle(result: CombatResult): void {
    if (this.result) {
      return;
    }
    this.result = result;
    this.phase = 'ended';
    this.activeCharacter = null;
    this.healingSelection = false;
    if (result === 'victory') {
      this.soundscape.playMusic('victory');
    } else {
      this.soundscape.stopMusic();
    }
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.activeBolt?.destroy();
    this.activeBolt = undefined;
    this.warning.setVisible(false);
    this.timingRing.clear();
    this.targetText.setText('');
    this.refreshHud();
    this.cameras.main.pan(WIDTH / 2, HEIGHT / 2, 280, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1, 280, 'Sine.easeInOut');
    if (result === 'victory') {
      this.turnText.setText('VICTORIA');
      this.promptText.setText('La tormenta se disipa sobre el templo.');
      this.setBossFrame('iobrontes_herido');
      this.cameras.main.flash(450, 205, 168, 255, false);
    } else {
      this.turnText.setText('DERROTA');
      this.promptText.setText('Todo el grupo ha quedado incapacitado.');
      (['furai', 'dexios', 'sahira'] as const).forEach((id) => {
        this.actorSprites[id].setAlpha(0.25);
      });
    }
    this.showResultCard(result);
    this.refreshHud();
  }

  private showResultCard(result: CombatResult): void {
    const existingObjects = [...this.children.getChildren()];
    const card = this.add.graphics().setDepth(40);
    card.fillStyle(0x0d0b16, 0.94);
    card.fillRoundedRect(620, 385, 680, 282, 20);
    card.lineStyle(2, result === 'victory' ? COLORS.gold : COLORS.red, 0.92);
    card.strokeRoundedRect(620, 385, 680, 282, 20);
    this.add.text(WIDTH / 2, 422, result === 'victory' ? 'VICTORIA' : 'DERROTA', {
      fontFamily: 'Georgia, serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: result === 'victory' ? '#f3d58e' : '#ff9a9a',
    }).setOrigin(0.5, 0).setDepth(41);
    this.add.text(
      WIDTH / 2,
      493,
      result === 'victory'
        ? 'El heredero del trueno ha sido vencido.'
        : 'El grupo ya no puede continuar.',
      {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#e5d9eb',
      },
    ).setOrigin(0.5, 0).setDepth(41);
    this.add.text(WIDTH / 2, 532, 'Pulsa R o el botón para volver a combatir', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#bdb0c9',
    }).setOrigin(0.5, 0).setDepth(41);
    const button = this.add.container(WIDTH / 2 - 125, 580).setDepth(42);
    const background = this.add.graphics();
    background.fillStyle(0x38304b, 1);
    background.fillRoundedRect(0, 0, 250, 48, 10);
    background.lineStyle(2, COLORS.gold, 0.8);
    background.strokeRoundedRect(0, 0, 250, 48, 10);
    const label = this.add.text(125, 14, 'REINTENTAR', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f4e4c4',
    }).setOrigin(0.5, 0);
    button.add([background, label]);
    button.setSize(250, 48);
    button.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 250, 48),
      Phaser.Geom.Rectangle.Contains,
    );
    button.on('pointerdown', () => this.scene.restart());
    const resultObjects = this.children.getChildren().filter(
      (object) => !existingObjects.includes(object),
    );
    this.cameras.main.ignore(resultObjects);
  }

  private updateBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    maximum: number,
    color: number,
  ): void {
    graphics.clear();
    graphics.fillStyle(0x090811, 0.95);
    graphics.fillRoundedRect(x, y, width, height, height / 2);
    const ratio = Phaser.Math.Clamp(value / maximum, 0, 1);
    if (ratio > 0) {
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(x, y, Math.max(height, width * ratio), height, height / 2);
    }
    graphics.lineStyle(1, 0xffffff, 0.28);
    graphics.strokeRoundedRect(x, y, width, height, height / 2);
  }
}
