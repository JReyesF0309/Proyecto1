import Phaser from 'phaser';
import {
  BossId,
  BossPhase,
  CharacterId,
  Direction,
  EB_GARAMOND_FONT_FAMILY,
  GAME_CONFIG,
  GAME_FONT_FAMILY,
  ICON_ASSETS,
  IMAGE_ASSETS,
  NORMALIZED_SPRITE_KEYS,
  PLAYABLE_CHARACTERS,
  UI_FONT_FAMILY,
} from './game-config';
import type { HazelForm } from './game-config';
import Soundscape from './soundscape';
import {
  canUseAbility,
  CombatResult,
  CombatState,
  consumeSahiraAbilityUse,
  createCombatState,
  damageBoss,
  damageBossWithArmorBreak,
  damageForDefense,
  damageIobrontes,
  damagePartyMember,
  consumeShieldHit,
  DefenseOutcome,
  DEFENSE_WINDOW_END_MS,
  DEFENSE_WINDOW_START_MS,
  getBattleResult,
  gainFuraiSpirit,
  healPartyMember,
  MAX_CHAOS,
  MAX_HEALTH,
  MAX_MANA,
  MAX_SPIRIT,
  PERFECT_PARRY_DAMAGE,
  PERFECT_PARRY_WINDOW_START_MS,
  resolveDefense,
  SAHIRA_ABILITY_USE_LIMITS,
  spendCost,
} from './combat-rules';
import stripBlackMattes from './strip-black-matte';
import {
  ActionCommandRunner,
  applyResultMultiplier,
  CINEMATIC_ASSETS,
  cinematicTextureKey,
  CommandOutcome,
  HitResult,
} from './action-commands';
import CharacterIntroduction, {
  createCharacterIntroductionTextures,
  preloadCharacterIntroductionAssets,
} from './character-introduction';
import {
  TUTORIAL_MESSAGES,
  TUTORIAL_POPUP_SCENE_KEY,
  TutorialMessageId,
} from './tutorial-popups';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const NORMALIZED_SPRITE_KEY_SET: ReadonlySet<string> = new Set(NORMALIZED_SPRITE_KEYS);
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

type CombatPhase =
  | 'player'
  | 'target-boss'
  | 'action'
  | 'announcing'
  | 'casting'
  | 'windup'
  | 'projectile'
  | 'cosmic-rays'
  | 'meteor-rain'
  | 'transforming'
  | 'jump-window'
  | 'resolving'
  | 'ended';
type Ability =
  | (typeof GAME_CONFIG.abilities)[Exclude<CharacterId, 'hazel'>][number]
  | (typeof GAME_CONFIG.abilities.hazel.ignis)[number]
  | (typeof GAME_CONFIG.abilities.hazel.glacio)[number];
type IobrontesPhaseConfig =
  | typeof GAME_CONFIG.bossPhases.iobrontes.normal
  | typeof GAME_CONFIG.bossPhases.iobrontes.heir;
type KosmelysPhaseConfig =
  | typeof GAME_CONFIG.bossPhases.kosmelys.normal
  | typeof GAME_CONFIG.bossPhases.kosmelys.heir;
type CombatMode = keyof typeof GAME_CONFIG.combatModes;
type CombatModeConfig = typeof GAME_CONFIG.combatModes[CombatMode];
const PARTY_UI_ORDER = ['dexios', 'furai', 'sahira', 'hazel'] as const;
const ALLY_TARGET_ORDER = ['furai', 'dexios', 'sahira', 'hazel'] as const;

interface ActorFrames {
  idle: string;
  attack: string;
  hit: string;
  jump: string;
  defense: Record<Direction, string>;
}

interface PartyCard {
  container: Phaser.GameObjects.Container;
  portrait: Phaser.GameObjects.Image;
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

interface TurnQueueSlot {
  container: Phaser.GameObjects.Container;
  portrait: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  background: Phaser.GameObjects.Graphics;
}

interface ShieldMark {
  container: Phaser.GameObjects.Container;
  counter: Phaser.GameObjects.Text;
}

interface LightningPath {
  start: Phaser.Math.Vector2;
  end: Phaser.Math.Vector2;
  rotation: number;
}

interface BossHud {
  healthBar: Phaser.GameObjects.Graphics;
  healthText: Phaser.GameObjects.Text;
  panel: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  subtitle: Phaser.GameObjects.Text;
  selected: Phaser.GameObjects.Text;
  accent: number;
  x: number;
  y: number;
}

interface MeteorEvent {
  id: number;
  attackId: number;
  target: CharacterId;
  startedAt: number;
  preparationMs: number;
  travelMs: number;
  defenseOpensAtMs: number;
  normalBlockEndsAtMs: number;
  defenseClosesAtMs: number;
  resolved: boolean;
  responseAt: number | null;
  responseOutcome: DefenseOutcome | null;
  fallSoundPlayed: boolean;
  sprite: Phaser.GameObjects.Image;
  warning: Phaser.GameObjects.Text;
  ring: Phaser.GameObjects.Graphics;
}

export default class CombatScene extends Phaser.Scene {
  private state: CombatState = createCombatState();
  private phase: CombatPhase = 'player';
  private result: CombatResult | null = null;
  private turnIndex = 0;
  private activeCharacter: CharacterId | null = null;
  private allyTargetingAbility: 'hippopotamus-healing' | 'hippopotamus-shield' | null = null;
  private targetingAbility: Ability | null = null;
  private selectedBoss: BossId | null = null;
  private abilityBoss: BossId = 'iobrontes';
  private portalRedirectTarget: CharacterId | null = null;
  private actorSprites!: Record<CharacterId, Phaser.GameObjects.Sprite>;
  private shieldMarks!: Record<CharacterId, ShieldMark>;
  private breathingTweens!: Record<CharacterId, Phaser.Tweens.Tween>;
  private actorNames!: Record<CharacterId, Phaser.GameObjects.Text>;
  private missingLabels!: Record<CharacterId, Phaser.GameObjects.Text>;
  private frameGeneration: Record<CharacterId, number> = { dexios: 0, furai: 0, sahira: 0, hazel: 0 };
  private boss!: Phaser.GameObjects.Sprite;
  private kosmelysBoss!: Phaser.GameObjects.Sprite;
  private bossFrameGeneration = 0;
  private kosmelysFrameGeneration = 0;
  private missingBossLabels!: Record<BossId, Phaser.GameObjects.Text>;
  private partyCards!: Record<CharacterId, PartyCard>;
  private turnQueueSlots!: TurnQueueSlot[];
  private bossHud!: Record<BossId, BossHud>;
  private turnText!: Phaser.GameObjects.Text;
  private attackAnnouncement!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;
  private resultText!: Phaser.GameObjects.Text;
  private actionContent!: Phaser.GameObjects.Container;
  private timingRing!: Phaser.GameObjects.Graphics;
  private warning!: Phaser.GameObjects.Container;
  private warningArrow!: Phaser.GameObjects.Text;
  private armorBreakMark!: Phaser.GameObjects.Container;
  private kosmelysArmorBreakMark!: Phaser.GameObjects.Container;
  private portalEffects: Phaser.GameObjects.Image[] = [];
  private soundscape!: Soundscape;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private overlayCamera!: Phaser.Cameras.Scene2D.Camera;
  private audioText!: Phaser.GameObjects.Text;
  private actionPanel!: Phaser.GameObjects.Graphics;
  private targetArrow!: Phaser.GameObjects.Text;
  private enemyTargetArrows!: Phaser.GameObjects.Graphics;
  private backButton!: Phaser.GameObjects.Container;
  private spaceKeyBadge!: Phaser.GameObjects.Container;
  private sahiraSpaceHint?: Phaser.GameObjects.Text;
  private cameraTransitioning = false;
  private previousTurnWasBoss = false;
  private readonly hazelEffectObjects: Phaser.GameObjects.Image[] = [];
  private lastTurnActor: CharacterId | BossId | null = null;
  private activeBolt?: Phaser.GameObjects.Graphics;
  private attackDirection: Direction | null = null;
  private responseDirection: Direction | null = null;
  private responseTime: number | null = null;
  private defenseOutcome: DefenseOutcome | null = null;
  private projectileStartedAt = 0;
  private jumpWindowStartedAt = 0;
  private hasImpacted = false;
  private targetCharacter: CharacterId | null = null;
  private lightningIndex = 0;
  private lightningStrikeCount = 3;
  private perfectParries = 0;
  private partyJumped = false;
  private watchThunderSweepIndex = 0;
  private watchThunderSweepCount = 1;
  private meteorEvents: MeteorEvent[] = [];
  private meteorSequence = 0;
  private meteorCountForAttack = 5;
  private meteorFuraiTargeted = false;
  private meteorFuraiAllPerfect = true;
  private cosmicDirection: Direction | null = null;
  private cosmicInitialDirection: Direction | null = null;
  private cosmicRevealed = false;
  private cosmicTravelDurationMs = 0;
  private cosmicMidpointMs = 0;
  private cosmicPerfectWindowStartsAtMs = 0;
  private previousCosmicInitialDirection: Direction | null = null;
  private cosmicProjectileIndex = 0;
  private cosmicProjectileCount = 2;
  private cosmicTargetCharacter: CharacterId | null = null;
  private cosmicFuraiPerfectParries = 0;
  private cosmicProjectile?: Phaser.GameObjects.Image;
  private commandRunner?: ActionCommandRunner;
  private hitResults: HitResult[] = [];
  private characterIntroduction?: CharacterIntroduction;
  private readonly tutorialMessagesSeen: Record<TutorialMessageId, boolean> = {
    introduction: false,
    lightningChain: false,
    watchTheThunder: false,
    divineRetribution: false,
    cosmicRays: false,
    meteorRain: false,
    portalShield: false,
  };

  private readonly practiceId: CharacterId | null;
  private readonly modeConfig: CombatModeConfig;
  private readonly combatTiming: Record<keyof typeof GAME_CONFIG.timing, number>;

  private get defenseWindowStartMs(): number {
    return DEFENSE_WINDOW_START_MS * this.modeConfig.combatTimingMultiplier;
  }

  private get perfectParryWindowStartMs(): number {
    return PERFECT_PARRY_WINDOW_START_MS * this.modeConfig.combatTimingMultiplier;
  }

  private get defenseWindowEndMs(): number {
    return DEFENSE_WINDOW_END_MS * this.modeConfig.combatTimingMultiplier;
  }

  private combatDuration(durationMs: number): number {
    return durationMs * this.modeConfig.combatTimingMultiplier;
  }

  private applyBossDamageModifier(damage: number): number {
    return Math.ceil(damage * this.modeConfig.bossDamageMultiplier);
  }

  // Con practiceId la escena funciona como escena de prueba de ese personaje.
  constructor(
    key = 'escena_combate_dificil',
    practiceId: CharacterId | null = null,
    combatMode: CombatMode = 'standard',
  ) {
    super({ key });
    this.practiceId = practiceId;
    this.modeConfig = GAME_CONFIG.combatModes[combatMode];
    const multiplier = this.modeConfig.combatTimingMultiplier;
    this.combatTiming = {
      ...GAME_CONFIG.timing,
      windUpMs: GAME_CONFIG.timing.windUpMs * multiplier,
      projectileTravelMs: GAME_CONFIG.timing.projectileTravelMs * multiplier,
      defenseOpensBeforeImpactMs: GAME_CONFIG.timing.defenseOpensBeforeImpactMs * multiplier,
      perfectParryStartsBeforeImpactMs: GAME_CONFIG.timing.perfectParryStartsBeforeImpactMs * multiplier,
      defenseClosesAfterImpactMs: GAME_CONFIG.timing.defenseClosesAfterImpactMs * multiplier,
      defenseHintLeadMs: GAME_CONFIG.timing.defenseHintLeadMs * multiplier,
      resultDurationMs: GAME_CONFIG.timing.resultDurationMs * multiplier,
      nextBoltDelayMs: GAME_CONFIG.timing.nextBoltDelayMs * multiplier,
      enemyAttackAnnouncementMs: GAME_CONFIG.timing.enemyAttackAnnouncementMs * multiplier,
      enemyTurnGapMs: GAME_CONFIG.timing.enemyTurnGapMs * multiplier,
      watchTheThunderCastMs: GAME_CONFIG.timing.watchTheThunderCastMs * multiplier,
      jumpWindowMs: GAME_CONFIG.timing.jumpWindowMs * multiplier,
      jumpPoseMs: GAME_CONFIG.timing.jumpPoseMs * multiplier,
      attackHitIntervalMs: GAME_CONFIG.timing.attackHitIntervalMs * multiplier,
      hazelAttackPoseMs: GAME_CONFIG.timing.hazelAttackPoseMs * multiplier,
      attackRecoveryMs: GAME_CONFIG.timing.attackRecoveryMs * multiplier,
      spritePoseMs: GAME_CONFIG.timing.spritePoseMs * multiplier,
      cosmicPerfectParryWindowMs: GAME_CONFIG.timing.cosmicPerfectParryWindowMs * multiplier,
      cosmicWindUpMs: GAME_CONFIG.timing.cosmicWindUpMs * multiplier,
      meteorPreparationMs: GAME_CONFIG.timing.meteorPreparationMs * multiplier,
      meteorTravelMs: GAME_CONFIG.timing.meteorTravelMs * multiplier,
      meteorFollowUpTravelMs: GAME_CONFIG.timing.meteorFollowUpTravelMs * multiplier,
      meteorDefenseOpensBeforeImpactMs: GAME_CONFIG.timing.meteorDefenseOpensBeforeImpactMs * multiplier,
      meteorNormalBlockWindowMs: GAME_CONFIG.timing.meteorNormalBlockWindowMs * multiplier,
      meteorPerfectBlockWindowMs: GAME_CONFIG.timing.meteorPerfectBlockWindowMs * multiplier,
      portalEffectDurationMs: GAME_CONFIG.timing.portalEffectDurationMs * multiplier,
    };
  }

  preload(): void {
    const loadImage = (key: string, asset: string): void => {
      if (!this.textures.exists(key)) {
        this.load.image(key, asset);
      }
    };
    loadImage('arena', IMAGE_ASSETS.arena);
    Object.entries(IMAGE_ASSETS).forEach(([key, asset]) => {
      if (key !== 'arena') {
        loadImage(key, asset);
      }
    });
    Object.entries(ICON_ASSETS).forEach(([id, asset]) => {
      loadImage(`icon_${id}`, asset);
    });
    (Object.keys(CINEMATIC_ASSETS) as Array<keyof typeof CINEMATIC_ASSETS>).forEach((key) => {
      loadImage(cinematicTextureKey(key), CINEMATIC_ASSETS[key]);
    });
    if (this.practiceId) {
      preloadCharacterIntroductionAssets(this);
    }
  }

  create(): void {
    this.state = createCombatState();
    Object.keys(this.tutorialMessagesSeen).forEach((id) => {
      this.tutorialMessagesSeen[id as TutorialMessageId] = false;
    });
    if (this.practiceId) {
      PLAYABLE_CHARACTERS.forEach((id) => {
        if (id !== this.practiceId) {
          this.state.party[id].health = 0;
        }
      });
    }
    this.phase = 'player';
    this.result = null;
    this.turnIndex = 0;
    this.activeCharacter = null;
    this.allyTargetingAbility = null;
    this.targetingAbility = null;
    if (this.selectedBoss) {
      this.getBossSprite(this.selectedBoss).clearTint();
      this.selectedBoss = null;
    }
    this.abilityBoss = 'iobrontes';
    this.portalRedirectTarget = null;
    this.targetCharacter = null;
    this.attackDirection = null;
    this.responseDirection = null;
    this.responseTime = null;
    this.defenseOutcome = null;
    this.lightningIndex = 0;
    this.lightningStrikeCount = 3;
    this.perfectParries = 0;
    this.watchThunderSweepIndex = 0;
    this.watchThunderSweepCount = 1;
    this.hasImpacted = false;
    this.meteorEvents = [];
    this.portalEffects = [];
    this.meteorSequence = 0;
    this.meteorFuraiTargeted = false;
    this.meteorFuraiAllPerfect = true;
    this.cosmicProjectile = undefined;
    this.cosmicProjectileIndex = 0;
    this.cosmicProjectileCount = 2;
    this.cosmicTargetCharacter = null;
    this.cosmicFuraiPerfectParries = 0;
    this.previousCosmicInitialDirection = null;
    this.cosmicRevealed = false;
    this.cameraTransitioning = false;
    this.previousTurnWasBoss = false;
    this.lastTurnActor = null;
    this.soundscape = new Soundscape();
    stripBlackMattes(
      this.textures,
      Object.keys(IMAGE_ASSETS).filter((key) =>
        key !== 'arena' && !NORMALIZED_SPRITE_KEY_SET.has(key),
      ),
    );
    if (this.practiceId) {
      createCharacterIntroductionTextures(this.textures);
    }
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
    this.overlayCamera = this.cameras.add(0, 0, WIDTH, HEIGHT);
    this.overlayCamera.ignore([...battlefieldObjects, ...hudObjects]);
    this.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, this.ignoreInOverlay, this);
    this.hitResults = [];
    this.commandRunner = new ActionCommandRunner(
      this,
      (object) => this.promoteToOverlay(object),
      () => this.soundscape.play('perfect_block'),
      WIDTH,
      HEIGHT,
      this.modeConfig.combatTimingMultiplier,
    );

    this.input.keyboard?.on('keydown', this.onKeyDown, this);
    this.input.on('pointerdown', this.startAudio, this);
    this.input.on('pointerdown', this.handleUiPointer, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.stop(TUTORIAL_POPUP_SCENE_KEY);
      this.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, this.ignoreInOverlay, this);
      this.input.keyboard?.off('keydown', this.onKeyDown, this);
      this.input.off('pointerdown', this.startAudio, this);
      this.input.off('pointerdown', this.handleUiPointer, this);
      this.characterIntroduction?.destroy();
      this.characterIntroduction = undefined;
      this.commandRunner?.destroy();
      this.commandRunner = undefined;
      this.soundscape.destroy();
    });

    this.refreshHud();
    this.startAudio();
    if (this.practiceId) {
      this.setupPractice(this.practiceId);
    } else if (this.modeConfig === GAME_CONFIG.combatModes.tutorial) {
      this.showTutorialPopup('introduction', () => this.startTurn());
    } else {
      this.startTurn();
    }
  }

  update(): void {
    this.updateEnemyTargetArrows();
    if (this.phase === 'target-boss') {
      this.positionBossTargetHud();
    }
    if (this.phase === 'cosmic-rays') {
      this.updateCosmicRays();
      return;
    }
    if (this.phase === 'meteor-rain') {
      this.updateMeteorEvents();
      return;
    }
    if (this.phase === 'windup' && this.attackDirection) {
      this.targetText.setText(
        `${this.directionControl(this.attackDirection)}  ·  PREPÁRATE`,
      );
      return;
    }
    if (this.phase === 'jump-window') {
      const elapsed = this.time.now - this.jumpWindowStartedAt;
      const progress = Phaser.Math.Clamp(elapsed / this.combatTiming.jumpWindowMs, 0, 1);
      this.timingRing.clear();
      PLAYABLE_CHARACTERS.forEach((id) => {
        if (this.state.party[id].health <= 0) {
          return;
        }
        this.drawTimingRing(this.timingRing, id, progress, false);
      });
      return;
    }
    if (this.phase !== 'projectile' || !this.targetCharacter) {
      return;
    }

    const elapsed = this.time.now - this.projectileStartedAt;
    const progress = Phaser.Math.Clamp(elapsed / this.combatTiming.projectileTravelMs, 0, 1);
    const inDefenseWindow = elapsed >= this.defenseWindowStartMs && elapsed <= this.defenseWindowEndMs;
    const isPerfectWindow =
      elapsed >= this.perfectParryWindowStartMs && elapsed <= this.defenseWindowEndMs;
    const target = GAME_CONFIG.characters[this.targetCharacter];
    this.drawTimingRing(this.timingRing, this.targetCharacter, progress);

    if (!this.responseDirection) {
      const timingLabel = isPerfectWindow
        ? '¡AHORA: PARADA PERFECTA!'
        : inDefenseWindow
          ? `¡BLOQUEA: ${this.directionControl(this.attackDirection!)}!`
          : 'ESPERA AL MOMENTO DEL IMPACTO';
      this.targetText.setText(timingLabel);
    }
    if (elapsed >= this.combatTiming.projectileTravelMs && !this.hasImpacted) {
      this.hasImpacted = true;
      this.createImpact(target.x, target.feetY - target.displayHeight * 0.52, COLORS.purple, 1.1);
      this.showFloatingText('IMPACTO', target.x, target.feetY - target.displayHeight - 20, '#ead8ff');
    }
  }

  private ignoreInOverlay(object: Phaser.GameObjects.GameObject): void {
    this.overlayCamera?.ignore(object);
  }

  // Muestra el objeto solo en la cámara superpuesta, por encima de la interfaz.
  private promoteToOverlay<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.cameras.main.ignore(object);
    this.uiCamera.ignore(object);
    object.cameraFilter &= ~this.overlayCamera.id;
    return object;
  }

  private updateEnemyTargetArrows(): void {
    const main = this.cameras.main;
    this.overlayCamera.setZoom(main.zoom).setScroll(main.scrollX, main.scrollY);
    const arrows = this.enemyTargetArrows;
    arrows.clear();
    const targets = new Set<CharacterId>();
    if (this.phase === 'meteor-rain') {
      this.meteorEvents.forEach((event) => {
        if (!event.resolved) {
          targets.add(event.target);
        }
      });
    } else if (
      this.targetCharacter
      && (this.phase === 'casting' || this.phase === 'windup'
        || this.phase === 'projectile' || this.phase === 'cosmic-rays')
    ) {
      targets.add(this.targetCharacter);
    }
    const bob = Math.sin(this.time.now / 140) * 8;
    targets.forEach((id) => {
      const character = GAME_CONFIG.characters[id];
      const x = character.x;
      const tipY = character.feetY - character.displayHeight - 8 + bob;
      arrows.fillStyle(0x9dffb0, 1);
      arrows.lineStyle(5, 0x171326, 1);
      arrows.beginPath();
      arrows.moveTo(x - 24, tipY - 40);
      arrows.lineTo(x + 24, tipY - 40);
      arrows.lineTo(x, tipY);
      arrows.closePath();
      arrows.fillPath();
      arrows.strokePath();
    });
  }

  private drawTimingRing(
    graphics: Phaser.GameObjects.Graphics,
    id: CharacterId,
    progress: number,
    clear = true,
  ): void {
    if (clear) {
      graphics.clear();
    }
    // Sahira siempre bloquea, así que solo necesita la dirección.
    if (id === 'sahira' || progress >= 1) {
      return;
    }
    const character = GAME_CONFIG.characters[id];
    const remaining = 1 - Math.max(0, progress);
    graphics.lineStyle(6, 0xffffff, 0.95);
    graphics.strokeEllipse(
      character.x,
      character.feetY - character.displayHeight * 0.53,
      character.displayHeight * 0.78 * remaining,
      character.displayHeight * 1.02 * remaining,
    );
  }

  private createArena(): void {
    this.add.image(WIDTH / 2, HEIGHT / 2, 'arena').setDisplaySize(WIDTH, HEIGHT);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x171323, 0.14);
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(WIDTH / 2, HEIGHT / 2);
  }

  private createCharacters(): void {
    this.actorSprites = {
      furai: this.createPartySprite('furai'),
      dexios: this.createPartySprite('dexios'),
      sahira: this.createPartySprite('sahira'),
      hazel: this.createPartySprite('hazel'),
    };
    this.shieldMarks = {
      furai: this.createShieldMark('furai'),
      dexios: this.createShieldMark('dexios'),
      sahira: this.createShieldMark('sahira'),
      hazel: this.createShieldMark('hazel'),
    };
    this.breathingTweens = {
      furai: this.createBreathingTween('furai'),
      dexios: this.createBreathingTween('dexios'),
      sahira: this.createBreathingTween('sahira'),
      hazel: this.createBreathingTween('hazel'),
    };
    this.actorNames = {
      furai: this.createNameLabel('furai'),
      dexios: this.createNameLabel('dexios'),
      sahira: this.createNameLabel('sahira'),
      hazel: this.createNameLabel('hazel'),
    };
    this.missingLabels = {
      furai: this.createMissingLabel('furai'),
      dexios: this.createMissingLabel('dexios'),
      sahira: this.createMissingLabel('sahira'),
      hazel: this.createMissingLabel('hazel'),
    };

    const boss = GAME_CONFIG.characters.iobrontes;
    this.boss = this.add.sprite(boss.x, boss.feetY, 'iobrontes_base')
      .setOrigin(0.5, 1)
      .setDepth(boss.depth);
    this.sizeSprite(this.boss, 'iobrontes_base', boss.displayHeight);
    const bossShadow = this.add.ellipse(boss.x, boss.feetY - 4, 500, 42, 0x100d1b, 0.38)
      .setDepth(boss.depth - 1);
    this.tweens.add({
      targets: this.boss,
      y: `-=4`,
      duration: 1450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    const kosmelys = GAME_CONFIG.characters.kosmelys;
    this.kosmelysBoss = this.add.sprite(kosmelys.x, kosmelys.feetY, kosmelys.frames.idle)
      .setOrigin(0.5, 1)
      .setDepth(kosmelys.depth);
    this.sizeSprite(this.kosmelysBoss, kosmelys.frames.idle, kosmelys.displayHeight);
    [this.boss, this.kosmelysBoss].forEach((sprite) => {
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerover', () => {
        const id = sprite === this.boss ? 'iobrontes' : 'kosmelys';
        if (this.phase === 'target-boss' && !this.cameraTransitioning) {
          this.highlightBossTarget(id);
        }
      });
      sprite.on('pointerout', () => {
        if (this.phase === 'target-boss' && this.selectedBoss !== null) {
          this.highlightBossTarget(this.selectedBoss);
        }
      });
      sprite.on('pointerdown', () => {
        const id = sprite === this.boss ? 'iobrontes' : 'kosmelys';
        this.confirmSelectedBossTarget(id);
      });
    });
    this.targetArrow = this.add.text(0, 0, '▼', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#f4d276',
      stroke: '#171326',
      strokeThickness: 6,
    }).setOrigin(0.5, 1).setDepth(18).setVisible(false);
    this.enemyTargetArrows = this.add.graphics().setDepth(19);
    this.missingBossLabels = {
      iobrontes: this.createMissingBossLabel('iobrontes'),
      kosmelys: this.createMissingBossLabel('kosmelys'),
    };
    const kosmelysShadow = this.add.ellipse(
      kosmelys.x,
      kosmelys.feetY - 4,
      kosmelys.shadowWidth,
      kosmelys.shadowHeight,
      0x100d1b,
      0.35,
    ).setDepth(kosmelys.depth - 1);
    this.tweens.add({
      targets: this.kosmelysBoss,
      y: `-=${GAME_CONFIG.timing.kosmelysBreathingPixels}`,
      duration: GAME_CONFIG.timing.kosmelysBreathingMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.armorBreakMark = this.createArmorBreakMark('iobrontes');
    this.armorBreakMark.setVisible(false);
    this.kosmelysArmorBreakMark = this.createArmorBreakMark('kosmelys');
    this.kosmelysArmorBreakMark.setVisible(false);
  }

  private createPartySprite(id: CharacterId): Phaser.GameObjects.Sprite {
    const character = GAME_CONFIG.characters[id];
    const sprite = this.add.sprite(character.x, character.feetY, character.frames.idle)
      .setOrigin(0.5, 1)
      .setDepth(character.depth);
    this.sizeSprite(sprite, character.frames.idle, character.displayHeight);
    if (!this.practiceId || this.practiceId === id) {
      this.add.ellipse(character.x, character.feetY - 3, character.displayHeight * 0.68, 38, 0x100d1b, 0.34)
        .setDepth(character.depth - 1);
    }
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
    const label = this.add.text(character.nameLabelX, character.feetY + 4, character.name.toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
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
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fff1c1',
      backgroundColor: '#211a30',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5, 1).setDepth(15).setVisible(false);
  }

  private createMissingBossLabel(id: BossId): Phaser.GameObjects.Text {
    const boss = GAME_CONFIG.characters[id];
    return this.add.text(
    boss.x,
    boss.feetY - boss.displayHeight - 16,
    '',
    {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fff1c1',
      backgroundColor: '#211a30',
      padding: { x: 8, y: 5 },
    },
    ).setOrigin(0.5, 1).setDepth(15).setVisible(false);
  }

  private sizeSprite(
    sprite: Phaser.GameObjects.Sprite,
    frame: string,
    height: number,
  ): void {
    if (!this.textures.exists(frame)) {
      throw new Error(`No se pudo cargar el fotograma ${frame}`);
    }
    const source = this.textures.get(frame).getSourceImage();
    if (!(source instanceof HTMLImageElement) && !(source instanceof HTMLCanvasElement)) {
      throw new Error(`No se pudo medir el fotograma ${frame}`);
    }
    const normalization = GAME_CONFIG.sprite;
    if (source.width !== normalization.canvasSize || source.height !== normalization.canvasSize) {
      throw new Error(`El fotograma ${frame} no está normalizado a ${normalization.canvasSize} × ${normalization.canvasSize}`);
    }
    const scale = height * (normalization.frameScale[frame] ?? 1) / normalization.referenceVisibleHeight;
    sprite
      .setOrigin(0.5, normalization.groundBaselineY / normalization.canvasSize)
      .setDisplaySize(normalization.canvasSize * scale, normalization.canvasSize * scale);
  }

  private createHud(): void {
    this.turnText = this.add.text(176, 112, '', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#f3e3c0',
      stroke: '#171326',
      strokeThickness: 5,
    }).setOrigin(0, 0).setDepth(21);
    this.attackAnnouncement = this.add.text(WIDTH / 2, HEIGHT / 2, '', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#9dffb0',
      stroke: '#171326',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5).setDepth(24).setVisible(false);
    this.promptText = this.add.text(176, 143, '', {
      fontFamily: UI_FONT_FAMILY,
      fontSize: '15px',
      color: '#e9dff1',
      stroke: '#171326',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0, 0).setDepth(21);

    this.bossHud = {
      iobrontes: this.createBossHud('iobrontes'),
      kosmelys: this.createBossHud('kosmelys'),
    };

    const queueLayout = GAME_CONFIG.turnQueueHud;
    this.turnQueueSlots = Array.from({ length: 6 }, (_, index) => {
      const container = this.add.container(queueLayout.x, queueLayout.y + index * (queueLayout.iconSize + queueLayout.gap))
        .setDepth(21);
      const background = this.add.graphics();
      const portrait = this.add.image(queueLayout.iconSize / 2 + 5, queueLayout.iconSize / 2, 'icon_furai')
        .setDisplaySize(queueLayout.iconSize - 8, queueLayout.iconSize - 8);
      const label = this.add.text(queueLayout.iconSize + 15, queueLayout.iconSize / 2, '', {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#e8deeb',
      }).setOrigin(0, 0.5);
      container.add([background, portrait, label]);
      return { container, portrait, label, background };
    });

    const partyLayout = GAME_CONFIG.partyHud;
    this.partyCards = {
      dexios: this.createPartyCard('dexios', partyLayout.x),
      furai: this.createPartyCard('furai', partyLayout.x),
      sahira: this.createPartyCard('sahira', partyLayout.x),
      hazel: this.createPartyCard('hazel', partyLayout.x),
    };
    PARTY_UI_ORDER.forEach((id, index) => {
      this.partyCards[id].container.setY(partyLayout.y + index * (partyLayout.height + partyLayout.gap));
    });

    const actionLayout = GAME_CONFIG.actionHud;
    this.actionPanel = this.add.graphics().setDepth(20);
    this.targetText = this.add.text(actionLayout.x + actionLayout.width / 2, actionLayout.y - 28, '', {
      fontFamily: UI_FONT_FAMILY,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fff4d2',
      stroke: '#171326',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5, 0.5).setDepth(22);
    const spaceKeyFrame = this.add.graphics();
    spaceKeyFrame.fillStyle(0x171326, 0.94);
    spaceKeyFrame.fillRoundedRect(0, 0, 154, 38, 7);
    spaceKeyFrame.lineStyle(2, 0xffffff, 0.86);
    spaceKeyFrame.strokeRoundedRect(0, 0, 154, 38, 7);
    this.spaceKeyBadge = this.add.container((WIDTH - 154) / 2, HEIGHT - 82, [
      spaceKeyFrame,
      this.add.text(77, 9, 'SPACE', {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      }).setOrigin(0.5, 0),
    ]).setDepth(24).setVisible(false);
    this.actionContent = this.add.container(actionLayout.x + 18, actionLayout.y + 42).setDepth(23);
    this.backButton = this.createBackButton(actionLayout);

    this.add.text(28, HEIGHT - 25, 'M · AUDIO    R · REINICIAR', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '11px',
      color: '#e1d4e7',
      stroke: '#171326',
      strokeThickness: 3,
    }).setDepth(20);
    this.audioText = this.add.text(1876, 1062, '', {
      fontFamily: GAME_FONT_FAMILY,
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
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '45px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#171326',
      strokeThickness: 7,
      align: 'center',
    }).setOrigin(0.5).setDepth(35).setVisible(false);
    if (this.practiceId) {
      this.createPracticeLegend(this.practiceId);
    }
  }

  private createPracticeLegend(id: CharacterId): void {
    const specialKey = id === 'sahira'
      ? 'T · Reiniciar los usos de habilidades'
      : id === 'dexios'
        ? 'T · Recibir daño (genera caos)'
        : id === 'furai'
          ? 'T · Ganar espíritu'
          : null;
    const lines = [
      `PRUEBA · ${GAME_CONFIG.characters[id].name.toUpperCase()}`,
      '1 / 2 / 3 · Habilidades (elige objetivo)',
      'I · Ataque aleatorio de Iobrontes',
      'K · Ataque aleatorio de Kosmelys',
      ...(specialKey ? [specialKey] : []),
      'R · Reiniciar',
      'ESC · Volver a la selección',
      'La vida de todos se recupera automáticamente',
    ];
    this.add.text(26, 20, lines.join('\n'), {
      fontFamily: UI_FONT_FAMILY,
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#b8ffbd',
      stroke: '#171326',
      strokeThickness: 4,
      lineSpacing: 5,
    }).setDepth(30);
  }

  private setupPractice(id: CharacterId): void {
    PLAYABLE_CHARACTERS.forEach((other) => {
      if (other === id) {
        return;
      }
      this.actorSprites[other].setVisible(false);
      this.actorNames[other].setVisible(false);
      this.missingLabels[other].setVisible(false);
      this.partyCards[other].container.setVisible(false);
    });
    this.turnQueueSlots.forEach((slot) => slot.container.setVisible(false));
    this.turnText.setPosition(700, 18).setOrigin(0.5, 0);
    this.promptText.setPosition(700, 50).setOrigin(0.5, 0);
    this.beginPracticeTurn(id);
    this.characterIntroduction = new CharacterIntroduction(
      this,
      id,
      this.uiCamera,
      this.overlayCamera,
      () => {
        this.characterIntroduction = undefined;
      },
    );
  }

  private beginPracticeTurn(id: CharacterId): void {
    this.activeCharacter = id;
    this.allyTargetingAbility = null;
    this.targetingAbility = null;
    this.phase = 'player';
    this.turnText.setText(`${GAME_CONFIG.characters[id].name.toUpperCase()} · TU TURNO`);
    this.promptText.setText('Elige una habilidad o pulsa I / K para recibir un ataque.');
    this.targetText.setText('');
    this.setActorFrame(id, this.getActorFrames(id).idle);
    this.refreshHud();
    this.focusPlayerSelectionCamera(id);
  }

  private startPracticeAttack(boss: BossId): void {
    if (!this.practiceId || this.phase !== 'player' || this.allyTargetingAbility) {
      return;
    }
    const id = this.practiceId;
    this.setActorFrame(id, this.getActorFrames(id).idle);
    this.actorSprites[id].clearTint();
    this.activeCharacter = null;
    this.phase = 'announcing';
    this.turnText.setText(`${GAME_CONFIG.characters[boss].name.toUpperCase()} · TURNO`);
    this.promptText.setText('Prepárate para defenderte.');
    this.targetText.setText('');
    this.refreshHud();
    this.cameraTransitioning = true;
    this.cameras.main.pan(WIDTH / 2, HEIGHT / 2, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
    this.time.delayedCall(GAME_CONFIG.camera.returnMs, () => {
      this.cameraTransitioning = false;
      if (this.phase !== 'announcing' || this.result) {
        return;
      }
      if (boss === 'iobrontes') {
        this.announceEnemyAttack();
      } else {
        this.announceKosmelysAttack();
      }
    });
  }

  private runPracticeSpecialAction(id: CharacterId): void {
    if (this.phase !== 'player' || this.allyTargetingAbility) {
      return;
    }
    const config = GAME_CONFIG.characters[id];
    const x = config.x;
    const y = config.feetY - config.displayHeight - 16;
    if (id === 'sahira') {
      this.state.sahiraAbilityUses.healing = SAHIRA_ABILITY_USE_LIMITS.healing;
      this.state.sahiraAbilityUses.shield = SAHIRA_ABILITY_USE_LIMITS.shield;
      this.showFloatingText('USOS REINICIADOS', x, y, '#b8ffbd');
    } else if (id === 'dexios') {
      damagePartyMember(this.state, 'dexios', 20);
      this.showFloatingText('-20 · CAOS', x, y, '#ff9d9d');
    } else if (id === 'furai') {
      gainFuraiSpirit(this.state, 30);
      this.showFloatingText('+30 ESPÍRITU', x, y, '#b8ffbd');
    } else {
      return;
    }
    this.refreshHud();
  }

  // Todos se recuperan en cuanto pierden su vida; así la prueba nunca termina.
  private restorePracticeHealth(): void {
    if (!this.practiceId) {
      return;
    }
    const id = this.practiceId;
    if (this.state.party[id].health <= 0) {
      this.state.party[id].health = MAX_HEALTH[id];
      this.actorSprites[id].setAlpha(1);
      const config = GAME_CONFIG.characters[id];
      this.showFloatingText('VIDA RESTAURADA', config.x, config.feetY - config.displayHeight - 16, '#b8ffbd');
    }
    (['iobrontes', 'kosmelys'] as const).forEach((boss) => {
      if (this.state.bosses[boss].health <= 0) {
        this.state.bosses[boss].health = this.getBossPhaseConfig(boss).maxHealth;
        this.getBossSprite(boss).setAlpha(1);
      }
    });
  }

  private createPartyCard(id: CharacterId, x: number): PartyCard {
    const layout = GAME_CONFIG.partyHud;
    const container = this.add.container(x, layout.y).setDepth(20);
    const background = this.add.graphics();
    background.fillStyle(COLORS.panel, 0.97);
    background.fillRoundedRect(0, 0, layout.width, layout.height, 12);
    background.lineStyle(2, COLORS.gold, 0.52);
    background.strokeRoundedRect(0, 0, layout.width, layout.height, 12);
    const portrait = this.add.image(layout.portraitSize / 2 + 10, layout.height / 2, `icon_${id}`);
    portrait.setDisplaySize(layout.portraitSize, layout.portraitSize);
    const name = this.add.text(layout.portraitSize + 26, 7, GAME_CONFIG.characters[id].name.toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f3e3c0',
    });
    const turn = this.add.text(layout.width - 12, 9, '', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffe187',
    }).setOrigin(1, 0);
    const textX = layout.portraitSize + 26;
    const barX = textX + (id === 'furai' ? 132 : id === 'hazel' ? 86 : 104);
    const barWidth = layout.width - barX - 18;
    const health = this.add.text(textX, 29, '', this.resourceStyle('#a9efbd'));
    const mana = this.add.text(textX, 49, '', this.resourceStyle(
      id === 'furai' ? '#ffffff' : id === 'hazel' ? '#ff9a4f' : '#a4ddff',
    ));
    if (id === 'furai' || id === 'hazel') {
      mana.setFontSize(11);
    }
    if (id === 'hazel') {
      mana
        .setPosition((textX + layout.width - 18) / 2, 62)
        .setOrigin(0.5)
        .setAlign('center')
        .setFontSize(18);
    }
    const healthBar = this.add.graphics();
    const manaBar = this.add.graphics();
    if (id === 'sahira' || id === 'hazel') {
      mana.setVisible(false);
      manaBar.setVisible(false);
    }
    if (id === 'hazel') {
      mana.setVisible(true);
    }
    const chaos = id === 'dexios'
      ? this.add.text(textX, 69, '', this.resourceStyle('#ffb1b1'))
      : undefined;
    const chaosBar = id === 'dexios' ? this.add.graphics() : undefined;
    const selection = this.add.text(17, 164, '', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#d1c4dc',
    }).setPosition(barX, layout.height - 13);
    container.add([background, portrait, name, turn, health, healthBar, mana, manaBar, selection]
      .concat(chaos ? [chaos, chaosBar!] : []));
    container.setSize(layout.width, layout.height);
    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, layout.width, layout.height),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on('pointerdown', () => {
      if (this.allyTargetingAbility) {
        this.selectAllyTarget(id);
      }
    });
    return {
      container,
      portrait,
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

  private getAbilities(id: CharacterId): readonly Ability[] {
    if (id === 'hazel') {
      return this.state.hazelForm === 'ignis'
        ? GAME_CONFIG.abilities.hazel.ignis
        : GAME_CONFIG.abilities.hazel.glacio;
    }
    return GAME_CONFIG.abilities[id];
  }

  private getActorFrames(id: CharacterId): ActorFrames {
    if (id === 'hazel') {
      return GAME_CONFIG.characters.hazel.forms[this.state.hazelForm];
    }
    return GAME_CONFIG.characters[id].frames;
  }

  private changeHazelForm(form: HazelForm): void {
    this.state.hazelForm = form;
    this.setActorFrame('hazel', this.getActorFrames('hazel').idle);
    this.refreshHud();
  }

  private createBossHud(id: BossId): BossHud {
    const layout = GAME_CONFIG.bossHud;
    const x = layout.x[id];
    const y = layout.y[id];
    const panel = this.add.graphics().setDepth(100);
    const accent = id === 'iobrontes' ? COLORS.purple : 0xe9a64e;
    panel.fillStyle(COLORS.panel, 0.94);
    panel.fillRoundedRect(x, y, layout.width, layout.height, 14);
    panel.lineStyle(2, accent, 0.84);
    panel.strokeRoundedRect(x, y, layout.width, layout.height, 14);
    const config = GAME_CONFIG.characters[id];
    const label = this.add.text(x + layout.labelX, y + layout.labelY, config.name.toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: `${layout.titleFontSize}px`,
      fontStyle: 'bold',
      color: '#f2e5ff',
    }).setDepth(101);
    const subtitle = this.add.text(x + layout.subtitleX, y + layout.subtitleY, config.title, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: `${layout.subtitleFontSize}px`,
      color: '#c7afd8',
    }).setDepth(101);
    const selected = this.add.text(x + layout.healthTextX, y + 9, '', {
      fontFamily: UI_FONT_FAMILY,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#fff0a5',
    }).setOrigin(1, 0).setDepth(102);
    const healthBar = this.add.graphics().setDepth(102);
    const healthText = this.add.text(x + layout.healthTextX, y + layout.healthTextY, '', this.resourceStyle('#e2c1ff'))
      .setOrigin(1, 0).setDepth(102);
    panel.setInteractive(
      new Phaser.Geom.Rectangle(x, y, layout.width, layout.height),
      Phaser.Geom.Rectangle.Contains,
    );
    panel.on('pointerdown', () => {
      if (this.phase === 'target-boss') {
        this.chooseBossTarget(id);
      }
    });
    return { panel, label, subtitle, selected, healthBar, healthText, accent, x, y };
  }

  private positionBossTargetHud(): void {
    const layout = GAME_CONFIG.bossHud;
    const camera = this.cameras.main;
    (['iobrontes', 'kosmelys'] as const).forEach((id) => {
      const character = GAME_CONFIG.characters[id];
      const screenX = (character.x - camera.worldView.x) * camera.zoom;
      const screenY = (character.feetY - character.displayHeight - camera.worldView.y) * camera.zoom;
      const x = Math.round(Phaser.Math.Clamp(
        screenX - layout.width / 2,
        16,
        WIDTH - layout.width - 16,
      ));
      const y = Math.round(Phaser.Math.Clamp(
        screenY - layout.height - 12,
        16,
        HEIGHT - layout.height - 16,
      ));
      const hud = this.bossHud[id];
      if (hud.x === x && hud.y === y) {
        return;
      }
      hud.x = x;
      hud.y = y;
      hud.panel.clear();
      hud.panel.fillStyle(COLORS.panel, 0.94);
      hud.panel.fillRoundedRect(x, y, layout.width, layout.height, 14);
      hud.panel.lineStyle(2, hud.accent, 0.84);
      hud.panel.strokeRoundedRect(x, y, layout.width, layout.height, 14);
      hud.panel.setInteractive(
        new Phaser.Geom.Rectangle(x, y, layout.width, layout.height),
        Phaser.Geom.Rectangle.Contains,
      );
      hud.label.setPosition(x + layout.labelX, y + layout.labelY);
      hud.subtitle.setPosition(x + layout.subtitleX, y + layout.subtitleY);
      hud.selected.setPosition(x + layout.healthTextX, y + 9);
      hud.healthText.setPosition(x + layout.healthTextX, y + layout.healthTextY);
      this.updateBar(
        hud.healthBar,
        x + layout.barX,
        y + layout.barY,
        layout.barWidth,
        layout.barHeight,
        this.state.bosses[id].health,
        this.getBossPhaseConfig(id).maxHealth,
        hud.accent,
      );
    });
  }

  private updateBossHudVisibility(): void {
    const visible = this.phase !== 'ended';
    (['iobrontes', 'kosmelys'] as const).forEach((id) => {
      const hud = this.bossHud[id];
      hud.panel.setVisible(visible);
      hud.label.setVisible(visible);
      hud.subtitle.setVisible(visible);
      hud.selected.setVisible(visible);
      hud.healthBar.setVisible(visible);
      hud.healthText.setVisible(visible);
    });
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
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#f1d9ff',
      align: 'center',
      lineSpacing: -8,
    }).setOrigin(0.5);
    this.warning.add([badge, this.warningArrow]);

  }

  private createActionButton(ability: Ability, index: number): void {
    const layout = GAME_CONFIG.actionHud;
    const width = layout.width - 36;
    const y = 12 + index * 86;
    const background = this.add.graphics();
    const color = ability.color;
    background.fillStyle(COLORS.panelLight, 1);
    background.fillRoundedRect(0, 0, width, 76, 8);
    background.lineStyle(2, color, 0.52);
    background.strokeRoundedRect(0, 0, width, 76, 8);
    const number = this.add.text(15, 10, `${index + 1}`, {
      fontFamily: UI_FONT_FAMILY,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f3e9d6',
    });
    const name = this.add.text(42, 10, ability.name.toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f3e9d6',
    });
    const costLabel = ability.resource === 'mana'
      ? `${ability.cost} MANÁ`
      : ability.resource === 'spirit'
        ? `${ability.cost} ESPÍRITU`
        : ability.resource === 'chaos'
          ? `${ability.cost} CAOS`
          : 'GRATIS';
    const usesLabel = ability.id === 'jackal-strike'
      ? '  ·  SIN LÍMITE'
      : ability.id === 'hippopotamus-healing'
        ? `  ·  USOS ${this.state.sahiraAbilityUses.healing}/${SAHIRA_ABILITY_USE_LIMITS.healing}`
        : ability.id === 'hippopotamus-shield'
          ? `  ·  USOS ${this.state.sahiraAbilityUses.shield}/${SAHIRA_ABILITY_USE_LIMITS.shield}`
          : '';
    const description = this.add.text(15, 42, ability.detail, {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '14px',
      color: '#d0c2dc',
    });
    const resourceDetail = this.add.text(
      description.x + description.width + 8,
      42,
      `${costLabel}${usesLabel}`,
      {
        fontFamily: UI_FONT_FAMILY,
        fontSize: '12px',
        color: '#d0c2dc',
      },
    );
    const available = this.activeCharacter !== null
      && canUseAbility(this.state, this.activeCharacter, ability)
      && !this.cameraTransitioning;
    const button = this.add.container(0, y, [background, number, name, description, resourceDetail])
      .setSize(width, 76)
      .setAlpha(available && this.phase === 'player' ? 1 : 0.42);
    button.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, 76),
      Phaser.Geom.Rectangle.Contains,
    );
    button.on('pointerover', () => {
      if (available && this.phase === 'player' && !this.allyTargetingAbility) {
        background.clear();
        background.fillStyle(0x40344f, 1);
        background.fillRoundedRect(0, 0, width, 76, 8);
        background.lineStyle(2, color, 0.95);
        background.strokeRoundedRect(0, 0, width, 76, 8);
      }
    });
    button.on('pointerout', () => {
      background.clear();
      background.fillStyle(COLORS.panelLight, 1);
      background.fillRoundedRect(0, 0, width, 76, 8);
      background.lineStyle(2, color, 0.52);
      background.strokeRoundedRect(0, 0, width, 76, 8);
    });
    button.on('pointerdown', () => {
      if (available) {
        this.performAbility(ability);
      }
    });
    this.actionContent.add(button);
  }

  private updateActionMenu(): void {
    const visible = !this.cameraTransitioning && (
      this.phase === 'player'
      || this.allyTargetingAbility !== null
    );
    const layout = GAME_CONFIG.actionHud;
    const targetMode = this.phase === 'target-boss';
    const panel = layout;
    this.actionPanel.clear();
    this.actionPanel.setVisible(visible);
    if (visible) {
      this.actionPanel.fillStyle(COLORS.ink, 0.82);
      this.actionPanel.fillRoundedRect(panel.x, panel.y, panel.width, panel.height, 12);
      this.actionPanel.lineStyle(1.5, COLORS.gold, 0.72);
      this.actionPanel.strokeRoundedRect(panel.x, panel.y, panel.width, panel.height, 12);
    }
    this.backButton.setVisible(targetMode && !this.cameraTransitioning);
    this.actionContent.removeAll(true);
    this.actionContent.setPosition(
      panel.x + 18,
      panel.y + 39,
    );
    this.targetText.setPosition(
      targetMode ? WIDTH / 2 : layout.x + layout.width / 2,
      targetMode ? 795 : layout.y - 28,
    );
    this.backButton.setPosition(
      targetMode ? WIDTH / 2 - 95 : panel.x + panel.width - 190,
      targetMode ? 835 : panel.y + 8,
    );
    if (this.phase === 'ended') {
      return;
    }
    if (this.phase === 'target-boss' && this.targetingAbility) {
      this.targetText
        .setFontFamily(UI_FONT_FAMILY)
        .setText('1 · IÓBRONTĒS     2 · KOSMELYS     ESC · BACK');
      return;
    }
    if (this.allyTargetingAbility) {
      const shieldTargeting = this.allyTargetingAbility === 'hippopotamus-shield';
      this.actionContent.add(this.add.text(
        0,
        0,
        shieldTargeting
          ? 'ELIGE UN ALIADO CON VIDA PARA PROTEGERLO'
          : 'ELIGE UN ALIADO CON VIDA PARA RESTAURARLO',
        {
          fontFamily: GAME_FONT_FAMILY,
          fontSize: '12px',
          fontStyle: 'bold',
          color: shieldTargeting ? '#baffcb' : '#c8ffe9',
        },
      ));
      ALLY_TARGET_ORDER.forEach((id, index) => {
        const health = this.state.party[id].health;
        this.createTargetButton(id, index, health > 0);
      });
      return;
    }

    if (this.phase === 'player' && this.activeCharacter) {
      this.getAbilities(this.activeCharacter).forEach((ability, index) => {
        this.createActionButton(ability, index);
      });
      return;
    }
    this.actionContent.add(this.add.text(12, 12, 'ESPERANDO...', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#d4c5e4',
    }));
  }

  private createBossTargetButton(id: BossId, index: number): void {
    const layout = GAME_CONFIG.bossTargetUi;
    const x = 4 + index * (layout.buttonWidth + layout.buttonGap);
    const y = 36;
    const alive = this.state.bosses[id].health > 0
      && this.state.bosses[id].phase !== 'defeated';
    const selected = this.selectedBoss === id;
    const background = this.add.graphics();
    background.fillStyle(selected ? 0x49376a : COLORS.panelLight, 1);
    background.fillRoundedRect(0, 0, layout.buttonWidth, layout.buttonHeight, 8);
    background.lineStyle(2, alive ? (selected ? COLORS.yellow : COLORS.purple) : COLORS.red, 0.85);
    background.strokeRoundedRect(0, 0, layout.buttonWidth, layout.buttonHeight, 8);
    const label = this.add.text(
      layout.buttonWidth / 2,
      11,
      `${index + 1}  ${GAME_CONFIG.characters[id].name.toUpperCase()}`,
      {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '17px',
      fontStyle: 'bold',
      color: alive ? '#f3e9d6' : '#918698',
      align: 'center',
      },
    ).setOrigin(0.5, 0);
    const health = this.add.text(
      layout.buttonWidth / 2,
      39,
      `${this.state.bosses[id].health} / ${this.getBossPhaseConfig(id).maxHealth} HP`,
      {
        fontFamily: UI_FONT_FAMILY,
        fontSize: '13px',
        color: '#d0c2dc',
        align: 'center',
      },
    ).setOrigin(0.5, 0);
    const button = this.add.container(x, y, [background, label, health])
      .setSize(layout.buttonWidth, layout.buttonHeight)
      .setAlpha(alive && !this.cameraTransitioning ? 1 : 0.42);
    button.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, layout.buttonWidth, layout.buttonHeight),
      Phaser.Geom.Rectangle.Contains,
    );
    button.on('pointerdown', () => this.confirmSelectedBossTarget(id));
    button.on('pointerover', () => {
      if (alive && !this.cameraTransitioning) {
        this.highlightBossTarget(id);
      }
    });
    this.actionContent.add(button);
  }

  private createTargetButton(id: CharacterId, index: number, available: boolean): void {
    const layout = GAME_CONFIG.actionHud;
    const count = ALLY_TARGET_ORDER.length;
    const gap = 8;
    const top = 34;
    const availableHeight = layout.height - top - 51;
    const height = Math.min(62, (availableHeight - gap * (count - 1)) / count);
    const width = layout.width - 36;
    const x = 0;
    const y = top + index * (height + gap);
    const background = this.add.graphics();
    background.fillStyle(COLORS.panelLight, 1);
    background.fillRoundedRect(0, 0, width, height, 8);
    background.lineStyle(2, available ? COLORS.teal : COLORS.red, 0.7);
    background.strokeRoundedRect(0, 0, width, height, 8);
    const label = this.add.text(width / 2, height / 2, `${index + 1}  ${GAME_CONFIG.characters[id].name.toUpperCase()}`, {
      fontFamily: UI_FONT_FAMILY,
      fontSize: '17px',
      fontStyle: 'bold',
      color: available ? '#e7fff7' : '#918698',
      align: 'center',
    }).setOrigin(0.5);
    const button = this.add.container(x, y, [background, label])
      .setSize(width, height)
      .setAlpha(available ? 1 : 0.45);
    button.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains,
    );
    button.on('pointerdown', () => {
      if (available) {
        this.selectAllyTarget(id);
      }
    });
    this.actionContent.add(button);
  }

  private refreshHud(): void {
    this.restorePracticeHealth();
    this.updateBossHudVisibility();
    const partyLayout = GAME_CONFIG.partyHud;
    PLAYABLE_CHARACTERS.forEach((id) => {
      const status = this.state.party[id];
      const card = this.partyCards[id];
      const barX = partyLayout.portraitSize + 26
        + (id === 'furai' ? 132 : id === 'hazel' ? 86 : 104);
      const barWidth = partyLayout.width - barX - 18;
      const maximumHealth = MAX_HEALTH[id];
      const incapacitated = status.health <= 0;
      card.name.setColor(incapacitated ? '#938a98' : '#f3e3c0');
      if (id === 'hazel') {
        const ignis = this.state.hazelForm === 'ignis';
        card.portrait.setTexture(ignis ? 'icon_hazel' : 'icon_hazel_glacio');
        card.mana.setText(ignis ? 'IGNIS' : 'GLACIO');
        card.mana.setColor(ignis ? '#ff9a4f' : '#8dd7ff');
      }
      card.turn.setText(this.activeCharacter === id && this.phase === 'player'
        ? 'TU TURNO'
        : this.targetCharacter === id && this.phase !== 'player'
          ? 'OBJETIVO'
          : incapacitated ? 'CAÍDO' : '');
      card.container.setAlpha(incapacitated ? 0.48 : 1);
      card.portrait.setAlpha(incapacitated ? 0.38 : 1);
      this.updateBar(card.healthBar, barX, 33, barWidth, 7, status.health, maximumHealth, COLORS.green);
      card.health.setText(`VIDA  ${status.health} / ${maximumHealth}`);
      if (id === 'dexios') {
        this.updateBar(card.manaBar, barX, 53, barWidth, 7, status.mana, MAX_MANA.dexios, COLORS.blue);
        card.mana.setText(`MANÁ  ${status.mana} / ${MAX_MANA.dexios}`);
      } else if (id === 'furai') {
        this.updateBar(card.manaBar, barX, 53, barWidth, 7, status.spirit, MAX_SPIRIT, 0xffffff);
        card.mana.setText(`ESPÍRITU  ${status.spirit} / ${MAX_SPIRIT}`);
      }
      if (id === 'dexios' && card.chaos && card.chaosBar) {
        this.updateBar(card.chaosBar, barX, 73, barWidth, 7, status.chaos, MAX_CHAOS, COLORS.red);
        card.chaos.setText(`CAOS  ${status.chaos} / ${MAX_CHAOS}`);
      }
      const targetLabel = this.allyTargetingAbility
        ? status.health > 0
          ? `Pulsa el panel o la tecla ${ALLY_TARGET_ORDER.indexOf(id) + 1} para elegir`
          : this.allyTargetingAbility === 'hippopotamus-shield'
            ? 'No se puede proteger'
            : 'No se puede reanimar'
        : '';
      card.selection.setText(targetLabel ? 'SELECCIONA EN ESTE PANEL' : '');
      this.shieldMarks[id].counter.setText(String(status.shieldHits));
      this.shieldMarks[id].container.setVisible(status.shieldHits > 0);
      const bg = card.container.getAt(0) as Phaser.GameObjects.Graphics;
      bg.clear();
      bg.fillStyle(COLORS.panel, 0.9);
      bg.fillRoundedRect(0, 0, partyLayout.width, partyLayout.height, 12);
      bg.lineStyle(
        this.activeCharacter === id && this.phase === 'player' ? 2.5 : 1,
        this.activeCharacter === id && this.phase === 'player' ? COLORS.yellow : COLORS.gold,
        this.activeCharacter === id && this.phase === 'player' ? 0.96 : 0.42,
      );
      bg.strokeRoundedRect(0, 0, partyLayout.width, partyLayout.height, 12);
    });
    if (this.phase === 'target-boss') {
      this.positionBossTargetHud();
    } else {
      (['iobrontes', 'kosmelys'] as const).forEach((id) => {
        const layout = GAME_CONFIG.bossHud;
        const hud = this.bossHud[id];
        const x = layout.x[id];
        const y = layout.y[id];
        hud.x = x;
        hud.y = y;
        hud.panel.clear();
        hud.panel.fillStyle(COLORS.panel, 0.94);
        hud.panel.fillRoundedRect(x, y, layout.width, layout.height, 14);
        hud.panel.lineStyle(2, hud.accent, 0.84);
        hud.panel.strokeRoundedRect(x, y, layout.width, layout.height, 14);
        hud.panel.setInteractive(
          new Phaser.Geom.Rectangle(x, y, layout.width, layout.height),
          Phaser.Geom.Rectangle.Contains,
        );
        hud.label.setPosition(x + layout.labelX, y + layout.labelY);
        hud.subtitle.setPosition(x + layout.subtitleX, y + layout.subtitleY);
        hud.selected.setPosition(x + layout.healthTextX, y + 9);
        hud.healthText.setPosition(x + layout.healthTextX, y + layout.healthTextY);
      });
    }
    (['iobrontes', 'kosmelys'] as const).forEach((id) => {
      const layout = GAME_CONFIG.bossHud;
      const x = this.bossHud[id].x;
      const y = this.bossHud[id].y;
      const health = this.state.bosses[id].health;
      const hud = this.bossHud[id];
      this.updateBar(
        hud.healthBar,
        x + layout.barX,
        y + layout.barY,
        layout.barWidth,
        layout.barHeight,
        health,
        this.getBossPhaseConfig(id).maxHealth,
        hud.accent,
      );
      hud.healthText.setText(`${health} / ${this.getBossPhaseConfig(id).maxHealth}`);
      hud.label.setColor(health > 0 ? '#f2e5ff' : '#938a98');
      hud.panel.setAlpha(health > 0 ? 1 : 0.56);
      this.getBossSprite(id).setAlpha(health > 0 ? 1 : 0.18);
      hud.selected.setText(
        this.phase === 'target-boss' && health > 0
          ? this.selectedBoss === id ? 'OBJETIVO ACTUAL' : 'DISPONIBLE'
          : this.state.bosses[id].phase === 'defeated'
            ? 'DERROTADO'
            : health <= 0 ? 'TRANSFORMANDO' : '',
      );
    });
    this.updateTurnQueue();
    this.updateTargetArrow();
    this.armorBreakMark.setVisible(this.state.bosses.iobrontes.armorBreak);
    this.kosmelysArmorBreakMark.setVisible(this.state.bosses.kosmelys.armorBreak);
    this.updateActionMenu();
  }

  private updateTurnQueue(): void {
    if (this.practiceId) {
      return;
    }
    const layout = GAME_CONFIG.turnQueueHud;
    const upcoming: Array<CharacterId | BossId> = [];
    let orderIndex = this.turnIndex;
    for (let attempt = 0; attempt < GAME_CONFIG.partyOrder.length * 3 && upcoming.length < 6; attempt += 1) {
      const actor = GAME_CONFIG.partyOrder[orderIndex];
      const active = actor === 'iobrontes' || actor === 'kosmelys'
        ? this.state.bosses[actor].health > 0
          && this.state.bosses[actor].phase !== 'defeated'
        : this.state.party[actor].health > 0;
      if (active) {
        upcoming.push(actor);
      }
      orderIndex = (orderIndex + 1) % GAME_CONFIG.partyOrder.length;
    }
    this.turnQueueSlots.forEach((slot, index) => {
      const actor = upcoming[index];
      slot.container.setVisible(actor !== undefined);
      if (!actor) {
        return;
      }
      slot.portrait.setTexture(
        actor === 'hazel' && this.state.hazelForm === 'glacio'
          ? 'icon_hazel_glacio'
          : actor === 'iobrontes' || actor === 'kosmelys'
            ? this.getBossIconTextureKey(actor)
            : `icon_${actor}`,
      );
      slot.portrait.setDisplaySize(index === 0 ? 56 : 50, index === 0 ? 56 : 50);
      slot.label.setText(actor.toUpperCase());
      slot.label.setColor(index === 0 ? '#fff0bd' : '#c5bacb');
      slot.container.setAlpha(index === 0 ? 1 : 0.62);
      slot.background.clear();
      slot.background.fillStyle(index === 0 ? 0x30253e : COLORS.ink, index === 0 ? 0.96 : 0.72);
      slot.background.fillRoundedRect(0, 0, 145, layout.iconSize, 8);
      slot.background.lineStyle(index === 0 ? 2 : 1, index === 0 ? COLORS.gold : 0xb7a6bf, index === 0 ? 0.9 : 0.28);
      slot.background.strokeRoundedRect(0, 0, 145, layout.iconSize, 8);
    });
  }

  private updateTargetArrow(): void {
    const visible = this.phase === 'target-boss' && this.selectedBoss !== null;
    this.targetArrow.setVisible(visible);
    if (!visible || !this.selectedBoss) {
      return;
    }
    const target = GAME_CONFIG.characters[this.selectedBoss];
    const left = this.selectedBoss === 'iobrontes';
    const offset = target.displayHeight * 0.3;
    this.targetArrow
      .setText(left ? '▶' : '◀')
      .setOrigin(0.5, 0.5)
      .setPosition(
        target.x + (left ? -offset : offset),
        target.feetY - target.displayHeight * 0.55,
      );
  }

  private createBackButton(layout: typeof GAME_CONFIG.actionHud): Phaser.GameObjects.Container {
    const width = 190;
    const height = 54;
    const background = this.add.graphics();
    background.fillStyle(0x171326, 0.96);
    background.fillRoundedRect(0, 0, width, height, 9);
    background.lineStyle(2, COLORS.gold, 0.78);
    background.strokeRoundedRect(0, 0, width, height, 9);
    const label = this.add.text(width / 2, 15, '←  BACK', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f3e9d6',
    }).setOrigin(0.5, 0);
    const button = this.add.container(layout.x + layout.width - width, layout.y + 8, [background, label])
      .setSize(width, height)
      .setDepth(24)
      .setVisible(false);
    button.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    button.on('pointerdown', () => this.cancelBossTargetSelection());
    return button;
  }

  private handleUiPointer(pointer: Phaser.Input.Pointer): void {
    if (this.characterIntroduction?.isBlockingInput) {
      return;
    }
    if (this.phase === 'target-boss' && !this.cameraTransitioning) {
      const backBounds = this.backButton.getBounds();
      if (backBounds.contains(pointer.x, pointer.y)) {
        this.cancelBossTargetSelection();
        return;
      }
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      (['iobrontes', 'kosmelys'] as const).forEach((boss) => {
        if (this.getBossSprite(boss).getBounds().contains(worldPoint.x, worldPoint.y)) {
          this.confirmSelectedBossTarget(boss);
        }
      });
      return;
    }
    if (this.phase === 'player' && this.activeCharacter && !this.cameraTransitioning) {
      const layout = GAME_CONFIG.actionHud;
      const width = layout.width - 36;
      const startX = layout.x + 18;
      const startY = layout.y + 39;
      const ability = this.getAbilities(this.activeCharacter).find((_, index) =>
        new Phaser.Geom.Rectangle(startX, startY + 12 + index * 86, width, 76)
          .contains(pointer.x, pointer.y),
      );
      if (ability) {
        this.performAbility(ability);
      }
      return;
    }
    if (this.phase === 'player' && this.allyTargetingAbility) {
      PLAYABLE_CHARACTERS.forEach((id) => {
        if (this.partyCards[id].container.getBounds().contains(pointer.x, pointer.y)) {
          this.selectAllyTarget(id);
        }
      });
    }
  }



  private resourceStyle(color: string): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: UI_FONT_FAMILY,
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
      if (turn === 'iobrontes' || turn === 'kosmelys') {
        if (this.state.bosses[turn].health <= 0) {
          this.turnIndex = (this.turnIndex + 1) % GAME_CONFIG.partyOrder.length;
          continue;
        }
        this.activeCharacter = null;
        this.allyTargetingAbility = null;
        this.phase = 'announcing';
        this.turnText.setText(`${GAME_CONFIG.characters[turn].name.toUpperCase()} · TURNO`);
        this.promptText.setText(
          turn === 'iobrontes'
            ? 'El dios del trueno prepara su siguiente ataque.'
            : 'La diosa del espacio prepara su siguiente ataque.',
        );
        this.targetText.setText('');
        this.refreshHud();
        const announce = (): void => {
          if (this.phase !== 'announcing' || this.result) {
            return;
          }
          if (turn === 'iobrontes') {
            this.announceEnemyAttack();
          } else {
            this.announceKosmelysAttack();
          }
        };
        const gap = this.previousTurnWasBoss ? this.combatTiming.enemyTurnGapMs : 0;
        this.previousTurnWasBoss = false;
        if (gap > 0) {
          this.time.delayedCall(gap, announce);
        } else {
          announce();
        }
        return;
      }
      if (this.state.party[turn].health <= 0) {
        this.advanceDivineRetributionTurn();
        this.turnIndex = (this.turnIndex + 1) % GAME_CONFIG.partyOrder.length;
        continue;
      }
      this.activeCharacter = turn;
      this.allyTargetingAbility = null;
      this.phase = 'player';
      this.turnText.setText(`${GAME_CONFIG.characters[turn].name.toUpperCase()} · TU TURNO`);
      this.promptText.setText('Elige una habilidad para continuar la batalla.');
      this.targetText.setText('');
      this.setActorFrame(turn, this.getActorFrames(turn).idle);
      this.refreshHud();
      this.focusPlayerSelectionCamera(turn);
      return;
    }
    this.finishBattle('defeat');
  }

  private advanceTurn(): void {
    if (this.result) {
      return;
    }
    const pendingTransforms = (['iobrontes', 'kosmelys'] as const)
      .filter((boss) =>
        this.state.bosses[boss].phase === 'normal'
        && this.state.bosses[boss].health <= 0);
    if (pendingTransforms.length > 0) {
      this.transformPendingBosses(pendingTransforms, 0, () => this.advanceTurnAfterTransform());
      return;
    }
    this.advanceTurnAfterTransform();
  }

  private advanceTurnAfterTransform(): void {
    if (this.result) {
      return;
    }
    if (this.activeCharacter) {
      this.advanceDivineRetributionTurn();
    }
    if (this.practiceId) {
      this.previousTurnWasBoss = false;
      this.selectedBoss = null;
      this.beginPracticeTurn(this.practiceId);
      return;
    }
    const finishedActor = GAME_CONFIG.partyOrder[this.turnIndex];
    this.previousTurnWasBoss = finishedActor === 'iobrontes' || finishedActor === 'kosmelys';
    this.allyTargetingAbility = null;
    this.targetingAbility = null;
    this.selectedBoss = null;
    this.activeCharacter = null;
    this.turnIndex = (this.turnIndex + 1) % GAME_CONFIG.partyOrder.length;
    this.phase = 'player';
    this.refreshHud();
    this.startTurn();
  }

  private showTutorialPopup(
    messageId: TutorialMessageId,
    onContinue: () => void,
  ): void {
    if (
      this.modeConfig !== GAME_CONFIG.combatModes.tutorial
      || this.tutorialMessagesSeen[messageId]
    ) {
      onContinue();
      return;
    }

    const message = TUTORIAL_MESSAGES[messageId];
    const count = this.tutorialMessageCount(messageId);
    this.events.once(Phaser.Scenes.Events.RESUME, () => {
      this.time.delayedCall(0, () => {
        this.input.enabled = true;
        this.tutorialMessagesSeen[messageId] = true;
        onContinue();
      });
    });
    this.input.enabled = false;
    this.scene.pause(this.scene.key);
    this.scene.launch(TUTORIAL_POPUP_SCENE_KEY, {
      parentSceneKey: this.scene.key,
      title: message.title,
      paragraphs: message.paragraphs.map((paragraph) =>
        paragraph.replace('{count}', count),
      ),
      keys: [...message.keys],
    });
  }

  private tutorialMessageCount(messageId: TutorialMessageId): string {
    switch (messageId) {
      case 'lightningChain':
        return String(this.getBossPhaseConfig('iobrontes').lightningStrikes);
      case 'watchTheThunder': {
        const sweeps = this.getBossPhaseConfig('iobrontes').watchThunderSweeps;
        return sweeps === 1 ? 'once' : 'twice';
      }
      case 'cosmicRays':
        return String(this.getBossPhaseConfig('kosmelys').cosmicRaysProjectiles);
      case 'meteorRain':
        return String(this.getBossPhaseConfig('kosmelys').meteorCount);
      case 'introduction':
      case 'divineRetribution':
      case 'portalShield':
        return '';
    }
  }

  private transformPendingBosses(
    bosses: BossId[],
    index: number,
    onComplete: () => void,
  ): void {
    if (this.result) {
      return;
    }
    const boss = bosses[index];
    if (!boss) {
      this.attackAnnouncement.setVisible(false);
      this.cameraTransitioning = false;
      this.phase = 'resolving';
      this.cameras.main.pan(WIDTH / 2, HEIGHT / 2, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
      this.cameras.main.zoomTo(1, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
      this.time.delayedCall(GAME_CONFIG.camera.returnMs, onComplete);
      return;
    }
    const bossState = this.state.bosses[boss];
    if (bossState.phase !== 'normal' || bossState.health > 0) {
      this.transformPendingBosses(bosses, index + 1, onComplete);
      return;
    }
    const config = GAME_CONFIG.characters[boss];
    this.phase = 'transforming';
    this.cameraTransitioning = true;
    this.attackAnnouncement.setVisible(false);
    this.cameras.main.pan(
      config.x,
      config.feetY - config.displayHeight * 0.53,
      GAME_CONFIG.camera.focusMs,
      'Sine.easeInOut',
    );
    this.cameras.main.zoomTo(1.2, GAME_CONFIG.camera.focusMs, 'Sine.easeInOut');
    this.time.delayedCall(GAME_CONFIG.camera.focusMs, () => {
      if (this.phase !== 'transforming' || this.result) {
        return;
      }
      this.attackAnnouncement.setText('MODO HEREDERO').setVisible(true);
      this.cameras.main.flash(260, 174, 76, 255, false);
      this.createImpact(
        config.x,
        config.feetY - config.displayHeight * 0.55,
        COLORS.violet,
        1.8,
      );
      this.showFloatingText(
        'MODO HEREDERO',
        config.x,
        config.feetY - config.displayHeight - 36,
        '#f0d1ff',
      );
      this.time.delayedCall(this.combatDuration(480), () => {
        if (this.phase !== 'transforming' || this.result) {
          return;
        }
        bossState.phase = 'heir';
        bossState.health = GAME_CONFIG.bossPhases[boss].heir.maxHealth;
        bossState.armorBreak = false;
        if (boss === 'iobrontes') {
          this.state.divineRetributionTurnsRemaining = 0;
          this.armorBreakMark.setVisible(false);
        } else {
          this.state.kosmelysPortalShieldTurnsRemaining = 0;
          this.kosmelysArmorBreakMark.setVisible(false);
          this.portalEffects.forEach((effect) => effect.destroy());
          this.portalEffects = [];
        }
        this.setBossFrame(this.getBossFrames(boss).idle, 0, boss);
        this.refreshHud();
        this.time.delayedCall(this.combatDuration(650), () => {
          if (this.phase !== 'transforming' || this.result) {
            return;
          }
          this.attackAnnouncement.setVisible(false);
          this.transformPendingBosses(bosses, index + 1, onComplete);
        });
      });
    });
  }

  private startEnemyChain(): void {
    const eligible = PLAYABLE_CHARACTERS
      .filter((id) => this.state.party[id].health > 0);
    if (eligible.length === 0) {
      this.finishBattle('defeat');
      return;
    }
    this.targetCharacter = Phaser.Utils.Array.GetRandom(eligible);
    this.perfectParries = 0;
    this.lightningIndex = 0;
    this.lightningStrikeCount = this.getBossPhaseConfig('iobrontes').lightningStrikes;
    this.focusCamera(this.targetCharacter);
    this.partyCards[this.targetCharacter].turn.setText('OBJETIVO');
    this.actorNames[this.targetCharacter].setColor('#ffe187');
    this.promptText.setText(`${GAME_CONFIG.characters[this.targetCharacter].name} es el objetivo.`);
    this.refreshHud();
    this.time.delayedCall(GAME_CONFIG.camera.focusMs, () => this.beginLightningBolt());
  }

  private announceEnemyAttack(): void {
    const attacks: Array<{
      name: string;
      tutorialMessage: TutorialMessageId;
      start: () => void;
    }> = [
      {
        name: 'LIGHTNING CHAIN',
        tutorialMessage: 'lightningChain',
        start: () => this.startEnemyChain(),
      },
      {
        name: 'WATCH THE THUNDER',
        tutorialMessage: 'watchTheThunder',
        start: () => this.startWatchTheThunder(),
      },
      {
        name: 'DIVINE RETRIBUTION',
        tutorialMessage: 'divineRetribution',
        start: () => this.startDivineRetribution(),
      },
    ];
    const { enemyAttacks } = GAME_CONFIG;
    const roll = Math.random() * 100;
    const attack = [
      {
        threshold: enemyAttacks.lightningChainChancePercent,
        attack: attacks[0],
      },
      {
        threshold:
          enemyAttacks.lightningChainChancePercent
          + enemyAttacks.watchTheThunderChancePercent,
        attack: attacks[1],
      },
      {
        threshold:
          enemyAttacks.lightningChainChancePercent
          + enemyAttacks.watchTheThunderChancePercent
          + enemyAttacks.divineRetributionChancePercent,
        attack: attacks[2],
      },
    ].find(({ threshold }) => roll < threshold)?.attack ?? attacks[2];
    this.showTutorialPopup(attack.tutorialMessage, () => {
      this.attackAnnouncement.setText(attack.name).setVisible(true);
      this.time.delayedCall(this.combatTiming.enemyAttackAnnouncementMs, () => {
        if (this.phase !== 'announcing' || this.result) {
          return;
        }
        this.attackAnnouncement.setVisible(false);
        attack.start();
      });
    });
  }

  private announceKosmelysAttack(): void {
    const weights = GAME_CONFIG.kosmelysAttacks;
    const allChoices: Array<{
      name: string;
      chance: number;
      tutorialMessage: TutorialMessageId;
      start: () => void;
    }> = [
      {
        name: 'COSMIC RAYS',
        chance: weights.cosmicRaysChancePercent,
        tutorialMessage: 'cosmicRays',
        start: () => this.startCosmicRays(),
      },
      {
        name: 'PORTAL SHIELD',
        chance: weights.portalShieldChancePercent,
        tutorialMessage: 'portalShield',
        start: () => this.startPortalShield(),
      },
      {
        name: 'METEOR RAIN',
        chance: weights.meteorRainChancePercent,
        tutorialMessage: 'meteorRain',
        start: () => this.startMeteorRain(),
      },
    ];
    const choices = allChoices.filter(({ name }) =>
      name !== 'PORTAL SHIELD' || this.state.kosmelysPortalShieldTurnsRemaining === 0);
    const totalChance = choices.reduce((total, choice) => total + choice.chance, 0);
    let roll = Math.random() * totalChance;
    const attack = choices.find(({ chance }) => {
      roll -= chance;
      return roll < 0;
    }) ?? choices[0];
    this.showTutorialPopup(attack.tutorialMessage, () => {
      this.attackAnnouncement.setText(attack.name).setVisible(true);
      this.time.delayedCall(this.combatTiming.enemyAttackAnnouncementMs, () => {
        if (this.phase !== 'announcing' || this.result || !attack) {
          return;
        }
        this.attackAnnouncement.setVisible(false);
        attack.start();
      });
    });
  }

  private startPortalShield(): void {
    if (this.state.kosmelysPortalShieldTurnsRemaining > 0) {
      this.advanceTurn();
      return;
    }
    this.phase = 'resolving';
    this.state.kosmelysPortalShieldTurnsRemaining =
      GAME_CONFIG.timing.portalShieldPlayerTurns;
    this.turnText.setText('PORTAL SHIELD');
    this.promptText.setText('Kosmelys prepara un portal que redirigirá la siguiente habilidad ofensiva.');
    this.targetText.setText('PORTAL SHIELD · 1 TURNO ALIADO');
    this.setKosmelysFrame(this.getBossFrames('kosmelys').shield);
    this.soundscape.play('abrir_portal');
    const config = GAME_CONFIG.characters.kosmelys;
    this.createImpact(
      config.x,
      config.feetY - config.displayHeight * 0.58,
      COLORS.violet,
      1.2,
    );
    this.time.delayedCall(this.combatTiming.resultDurationMs, () => {
      if (this.phase === 'resolving' && !this.result) {
        this.advanceTurn();
      }
    });
  }

  private startCosmicRays(): void {
    const eligible = PLAYABLE_CHARACTERS
      .filter((id) => this.state.party[id].health > 0);
    if (eligible.length === 0) {
      this.finishBattle('defeat');
      return;
    }
    this.phase = 'casting';
    this.cosmicProjectileIndex = 0;
    this.cosmicProjectileCount = this.getBossPhaseConfig('kosmelys').cosmicRaysProjectiles;
    this.previousCosmicInitialDirection = null;
    const targetId = Phaser.Utils.Array.GetRandom(eligible);
    this.cosmicTargetCharacter = targetId;
    this.cosmicFuraiPerfectParries = 0;
    this.targetCharacter = targetId;
    this.turnText.setText('COSMIC RAYS');
    this.promptText.setText(
      `${this.cosmicProjectileCount} rayos cósmicos cambiarán de dirección a mitad de su recorrido.`,
    );
    this.targetText.setText(`OBJETIVO: ${GAME_CONFIG.characters[targetId].name.toUpperCase()} · OBSERVA EL CAMBIO`);
    this.startCosmicProjectile();
  }

  private startCosmicProjectile(): void {
    const targetId = this.cosmicTargetCharacter;
    if (this.result || this.state.bosses.kosmelys.health <= 0) {
      return;
    }
    if (!targetId || this.state.party[targetId].health <= 0) {
      this.finishKosmelysAttack();
      return;
    }
    this.phase = 'casting';
    this.targetCharacter = targetId;
    this.cosmicDirection = null;
    this.cosmicInitialDirection = Phaser.Utils.Array.GetRandom(
      (['up', 'down', 'left', 'right'] as const)
        .filter((direction) => direction !== this.previousCosmicInitialDirection),
    );
    this.previousCosmicInitialDirection = this.cosmicInitialDirection;
    this.attackDirection = this.cosmicInitialDirection;
    this.responseDirection = null;
    this.responseTime = null;
    this.defenseOutcome = null;
    this.hasImpacted = false;
    this.warning.setPosition(...this.warningPosition(this.targetCharacter, this.cosmicInitialDirection));
    this.warningArrow.setText(this.directionPrompt(this.cosmicInitialDirection));
    this.warning.setVisible(true).setAlpha(1);
    this.setKosmelysFrame(
      this.getBossFrames('kosmelys').attack[this.cosmicInitialDirection],
    );
    this.turnText.setText(
      `COSMIC RAYS · ${this.cosmicProjectileIndex + 1} / ${this.cosmicProjectileCount}`,
    );
    this.targetText.setText(
      `${this.directionControl(this.cosmicInitialDirection)} · DIRECCIÓN INICIAL`,
    );
    this.time.delayedCall(
      this.combatTiming.cosmicWindUpMs + this.combatTiming.defenseHintLeadMs,
      () => {
      if (this.phase === 'casting' && !this.result) {
        this.launchCosmicProjectile();
      }
      },
    );
  }

  private launchCosmicProjectile(): void {
    if (!this.targetCharacter || !this.cosmicInitialDirection || this.result) {
      return;
    }
    this.phase = 'cosmic-rays';
    this.projectileStartedAt = this.time.now;
    this.warning.setVisible(false);
    this.cosmicRevealed = false;
    const directions = (['up', 'down', 'left', 'right'] as const)
      .filter((direction) => direction !== this.cosmicInitialDirection);
    this.cosmicDirection = Phaser.Utils.Array.GetRandom(directions);
    const start = this.cosmicPoint(
      this.targetCharacter,
      this.cosmicInitialDirection,
      GAME_CONFIG.kosmelysAttacks.cosmicInitialDistance,
    );
    const initialDistance = GAME_CONFIG.kosmelysAttacks.cosmicInitialDistance;
    const impactDistance = GAME_CONFIG.kosmelysAttacks.cosmicImpactDistance;
    const midpointDistance = this.areOppositeDirections(
      this.cosmicInitialDirection,
      this.cosmicDirection,
    )
      ? (initialDistance - impactDistance) / 2
      : (initialDistance ** 2 - impactDistance ** 2) / (2 * initialDistance);
    const midpoint = this.cosmicPoint(
      this.targetCharacter,
      this.cosmicInitialDirection,
      midpointDistance,
    );
    const endpoint = this.cosmicPoint(
      this.targetCharacter,
      this.cosmicDirection,
      impactDistance,
    );
    const totalDistance = start.distance(midpoint) + midpoint.distance(endpoint);
    const referenceSpeed =
      GAME_CONFIG.kosmelysAttacks.lightningReferenceDistance
      / this.combatTiming.projectileTravelMs
      * GAME_CONFIG.kosmelysAttacks.cosmicSpeedRatio;
    this.cosmicTravelDurationMs = Math.round(totalDistance / referenceSpeed);
    this.cosmicMidpointMs = this.cosmicTravelDurationMs / 2;
    this.cosmicPerfectWindowStartsAtMs = Math.max(
      this.cosmicMidpointMs,
      this.cosmicTravelDurationMs - this.combatTiming.cosmicPerfectParryWindowMs,
    );
    const source = this.textures.get('cosmic_effect').getSourceImage();
    this.cosmicProjectile = this.add.image(start.x, start.y, 'cosmic_effect')
      .setDisplaySize(
        source.width * GAME_CONFIG.kosmelysAttacks.cosmicProjectileScale,
        source.height * GAME_CONFIG.kosmelysAttacks.cosmicProjectileScale,
      )
      .setDepth(12);
    this.promoteToOverlay(this.cosmicProjectile);
    const initialVector = midpoint.clone().subtract(start);
    this.cosmicProjectile.setRotation(Math.atan2(initialVector.y, initialVector.x));
    const halfDuration = this.cosmicMidpointMs;
    this.tweens.add({
      targets: this.cosmicProjectile,
      x: midpoint.x,
      y: midpoint.y,
      duration: halfDuration,
      ease: 'Linear',
      onComplete: () => {
        if (
          this.phase !== 'cosmic-rays'
          || !this.cosmicProjectile
          || !this.targetCharacter
          || !this.cosmicDirection
          || this.result
        ) {
          return;
        }
        const finalDirection = this.cosmicDirection;
        this.cosmicRevealed = true;
        this.attackDirection = finalDirection;
        this.setKosmelysFrame(
          this.getBossFrames('kosmelys').attack[finalDirection],
        );
        const redirectedStart = this.cosmicPoint(
          this.targetCharacter,
          finalDirection,
          GAME_CONFIG.kosmelysAttacks.cosmicInitialDistance,
        );
        this.cosmicProjectile.setPosition(redirectedStart.x, redirectedStart.y);
        this.warning.setPosition(...this.warningPosition(this.targetCharacter, finalDirection));
        this.warningArrow.setText(this.directionPrompt(finalDirection));
        this.warning.setVisible(true).setAlpha(1);
        this.targetText.setText(
          `${this.directionControl(finalDirection)} · ¡CAMBIÓ! BLOQUEA ESTA DIRECCIÓN`,
        );
        const vector = this.cosmicPoint(this.targetCharacter, finalDirection, 1)
          .subtract(this.cosmicPoint(this.targetCharacter, finalDirection, 0));
        this.cosmicProjectile?.setRotation(Math.atan2(vector.y, vector.x));
        this.soundscape.play('ataque_cosmico');
        this.tweens.add({
          targets: this.cosmicProjectile,
          x: endpoint.x,
          y: endpoint.y,
          duration: halfDuration,
          ease: 'Linear',
          onComplete: () => {
            this.cosmicProjectile?.destroy();
            this.cosmicProjectile = undefined;
          },
        });
      },
    });
    this.soundscape.play('ataque_cosmico');
  }

  private cosmicPoint(
    targetId: CharacterId,
    direction: Direction,
    distance: number,
  ): Phaser.Math.Vector2 {
    const target = GAME_CONFIG.characters[targetId];
    const center = target.feetY - target.displayHeight * 0.52;
    switch (direction) {
      case 'left': return new Phaser.Math.Vector2(target.x - distance, center);
      case 'right': return new Phaser.Math.Vector2(target.x + distance, center);
      case 'up': return new Phaser.Math.Vector2(target.x, center - distance);
      case 'down': return new Phaser.Math.Vector2(target.x, center + distance);
    }
  }

  private areOppositeDirections(first: Direction, second: Direction): boolean {
    return (first === 'left' && second === 'right')
      || (first === 'right' && second === 'left')
      || (first === 'up' && second === 'down')
      || (first === 'down' && second === 'up');
  }

  private updateCosmicRays(): void {
    if (!this.targetCharacter || !this.attackDirection) {
      return;
    }
    const elapsed = this.time.now - this.projectileStartedAt;
    const target = GAME_CONFIG.characters[this.targetCharacter];
    const inWindow = this.cosmicRevealed && elapsed <= this.cosmicTravelDurationMs;
    const perfect = this.targetCharacter !== 'sahira'
      && this.cosmicRevealed
      && elapsed >= this.cosmicPerfectWindowStartsAtMs
      && elapsed <= this.cosmicTravelDurationMs;
    const progress = Phaser.Math.Clamp(
      elapsed / this.cosmicTravelDurationMs,
      0,
      1,
    );
    this.drawTimingRing(this.timingRing, this.targetCharacter, progress);
    if (this.responseDirection === null) {
      this.targetText.setText(
        perfect
          ? `¡PARADA PERFECTA! · ${this.directionControl(this.attackDirection)}`
          : inWindow
            ? `¡BLOQUEA ${this.directionControl(this.attackDirection)}!`
            : 'ESPERA A QUE CAMBIE LA DIRECCIÓN',
      );
    }
    if (elapsed >= this.cosmicTravelDurationMs && !this.hasImpacted) {
      this.hasImpacted = true;
      this.createImpact(
        target.x,
        target.feetY - target.displayHeight * 0.52,
        COLORS.violet,
        1.1,
      );
    }
    if (elapsed >= this.cosmicTravelDurationMs) {
      this.resolveCosmicProjectile();
    }
  }

  private resolveCosmicProjectile(): void {
    if (this.phase !== 'cosmic-rays' || !this.targetCharacter || !this.attackDirection) {
      return;
    }
    this.phase = 'resolving';
    const targetId = this.targetCharacter;
    const elapsed = this.responseTime;
    const inWindow = elapsed !== null
      && this.cosmicRevealed
      && elapsed >= this.cosmicMidpointMs
      && elapsed <= this.cosmicTravelDurationMs;
    const outcome: DefenseOutcome = !inWindow || this.responseDirection !== this.attackDirection
      ? 'failed'
      : targetId === 'sahira'
        ? 'blocked'
        : elapsed !== null && elapsed >= this.cosmicPerfectWindowStartsAtMs
          ? 'perfect'
          : 'blocked';
    const phaseConfig = this.getBossPhaseConfig('kosmelys');
    let damage = outcome === 'failed' || (outcome === 'blocked' && targetId === 'hazel')
      ? phaseConfig.cosmicRaysDamage
      : outcome === 'blocked' && targetId !== 'sahira'
        ? phaseConfig.cosmicBlockedDamage
        : 0;
    damage = this.applyBossDamageModifier(damage);
    const shielded = outcome !== 'perfect'
      && !(targetId === 'sahira' && outcome === 'blocked')
      && consumeShieldHit(this.state, targetId);
    if (shielded) {
      damage = 0;
    }
    const actualDamage = damagePartyMember(this.state, targetId, damage);
    const target = GAME_CONFIG.characters[targetId];
    if (outcome === 'perfect') {
      this.showFloatingText('PERFECT', target.x, target.feetY - target.displayHeight - 12, '#ffffff');
      if (targetId === 'dexios') {
        const counterDamage = damageBoss(this.state, 'kosmelys', PERFECT_PARRY_DAMAGE);
        this.setKosmelysFrame(
          this.getBossFrames('kosmelys').hit,
          GAME_CONFIG.timing.spritePoseMs,
        );
        this.showFloatingText(
          `-${counterDamage}`,
          GAME_CONFIG.characters.kosmelys.x,
          GAME_CONFIG.characters.kosmelys.feetY - GAME_CONFIG.characters.kosmelys.displayHeight - 12,
          '#fff0a5',
        );
      }
      if (targetId === 'furai') {
        this.cosmicFuraiPerfectParries += 1;
      }
      this.soundscape.play('perfect_block');
    } else if (outcome === 'blocked') {
      if (targetId === 'hazel') {
        this.setActorFrame(targetId, this.getActorFrames(targetId).hit, 550);
        this.showFloatingText(`-${actualDamage}`, target.x, target.feetY - target.displayHeight - 12, '#ffb7a9');
      } else {
        this.showFloatingText('BLOCK', target.x, target.feetY - target.displayHeight - 12, '#ffd65c');
      }
      this.soundscape.play('impact');
    } else {
      this.setActorFrame(targetId, this.getActorFrames(targetId).hit, 550);
      this.showFloatingText(`-${actualDamage}`, target.x, target.feetY - target.displayHeight - 12, '#ffb7a9');
      this.soundscape.play('impact');
    }
    if (shielded) {
      this.showFloatingText(
        'ESCUDO HIPOPÓTAMO',
        target.x,
        target.feetY - target.displayHeight * 0.7,
        '#a8ffbd',
      );
    }
    this.promptText.setText(
      outcome === 'perfect'
        ? 'Parada perfecta: el rayo cósmico queda desviado.'
        : outcome === 'blocked'
          ? targetId === 'hazel'
            ? `La defensa de Hazel no detiene el rayo: ${actualDamage} de daño.`
            : `Bloqueo: ${actualDamage} de daño.`
          : `El rayo cósmico impacta: ${actualDamage} de daño.`,
    );
    this.warning.setVisible(false);
    this.timingRing.clear();
    this.refreshHud();
    if (this.finishIfBattleEnded()) {
      return;
    }
    this.time.delayedCall(this.combatTiming.resultDurationMs, () => {
      if (this.phase !== 'resolving' || this.result) {
        return;
      }
      this.setActorFrame(targetId, this.getActorFrames(targetId).idle);
      this.cosmicProjectileIndex += 1;
      this.targetCharacter = null;
      if (this.state.bosses.kosmelys.health <= 0) {
        this.finishKosmelysAttack();
        return;
      }
      if (this.cosmicProjectileIndex < this.cosmicProjectileCount) {
        this.startCosmicProjectile();
      } else if (
        this.cosmicTargetCharacter === 'furai'
        && this.cosmicFuraiPerfectParries === this.cosmicProjectileCount
      ) {
        this.performFuraiKosmelysCounterattack(
          GAME_CONFIG.kosmelysAttacks.cosmicFuraiCounterDamage,
          () => this.finishKosmelysAttack(),
        );
      } else {
        this.finishKosmelysAttack();
      }
    });
  }

  private startMeteorRain(): void {
    this.phase = 'meteor-rain';
    this.meteorSequence += 1;
    this.meteorCountForAttack = this.getBossPhaseConfig('kosmelys').meteorCount;
    this.meteorEvents = [];
    this.meteorFuraiTargeted = false;
    this.meteorFuraiAllPerfect = true;
    this.turnText.setText('METEOR RAIN');
    this.promptText.setText(
      `${this.meteorCountForAttack} meteoros caen uno por uno; bloquea con W y busca la parada perfecta.`,
    );
    this.targetText.setText('W · BLOQUEO NORMAL / PARADA PERFECTA');
    this.setKosmelysFrame(this.getBossFrames('kosmelys').meteorRain);
    this.startMeteorEvent(1);
  }

  private startMeteorEvent(id: number, followUp = false): void {
    if (this.phase !== 'meteor-rain' || this.result) {
      return;
    }
    const timing = this.combatTiming;
    const preparationMs = followUp ? 0 : timing.meteorPreparationMs;
    const travelMs = followUp ? timing.meteorFollowUpTravelMs : timing.meteorTravelMs;
    const impactAtMs = preparationMs + travelMs;
    const defenseOpensAtMs = impactAtMs - timing.meteorDefenseOpensBeforeImpactMs;
    const eligible = PLAYABLE_CHARACTERS
      .filter((character) => this.state.party[character].health > 0);
    if (eligible.length === 0) {
      this.finishBattle('defeat');
      return;
    }
    const target = Phaser.Utils.Array.GetRandom(eligible);
    const config = GAME_CONFIG.characters[target];
    const sprite = this.add.image(config.x, config.feetY - config.displayHeight, 'meteor_effect');
    const source = this.textures.get('meteor_effect').getSourceImage();
    sprite.setDisplaySize(
      source.width * GAME_CONFIG.kosmelysAttacks.meteorScale,
      source.height * GAME_CONFIG.kosmelysAttacks.meteorScale,
    ).setDepth(12);
    const warning = this.add.text(
      config.x + (
        id % 2 === 0
          ? GAME_CONFIG.kosmelysAttacks.meteorWarningOffset
          : -GAME_CONFIG.kosmelysAttacks.meteorWarningOffset
      ),
      config.feetY - config.displayHeight - 36,
      `M${id} · W`,
      {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#fff0a5',
        backgroundColor: '#211a30',
        padding: { x: 6, y: 3 },
      },
    ).setOrigin(0.5).setDepth(17);
    const ring = this.add.graphics().setDepth(10);
    this.uiCamera.ignore([warning, ring]);
    this.promoteToOverlay(sprite);
    this.meteorEvents.push({
      id,
      attackId:
        (this.meteorSequence - 1) * this.meteorCountForAttack + id,
      target,
      startedAt: this.time.now,
      preparationMs,
      travelMs,
      defenseOpensAtMs,
      normalBlockEndsAtMs: defenseOpensAtMs + timing.meteorNormalBlockWindowMs,
      defenseClosesAtMs:
        defenseOpensAtMs
        + timing.meteorNormalBlockWindowMs
        + timing.meteorPerfectBlockWindowMs,
      resolved: false,
      responseAt: null,
      responseOutcome: null,
      fallSoundPlayed: false,
      sprite,
      warning,
      ring,
    });
  }

  private updateMeteorEvents(): void {
    this.meteorEvents.forEach((event) => {
      if (event.resolved) {
        return;
      }
      const target = GAME_CONFIG.characters[event.target];
      const elapsed = this.time.now - event.startedAt;
      const travelElapsed = Math.max(0, elapsed - event.preparationMs);
      const progress = Phaser.Math.Clamp(travelElapsed / event.travelMs, 0, 1);
      if (!event.fallSoundPlayed && elapsed >= event.preparationMs) {
        event.fallSoundPlayed = true;
        this.soundscape.play('meteor_fall');
      }
      const attacks = GAME_CONFIG.kosmelysAttacks;
      event.sprite.setPosition(
        target.x + ((event.id % 2 === 0) ? attacks.meteorLaneOffset : -attacks.meteorLaneOffset),
        target.feetY - target.displayHeight * 0.55
          - attacks.meteorFallDistance
          + progress * attacks.meteorTravelDistance,
      );
      event.warning.setPosition(
        target.x + (event.id % 2 === 0 ? attacks.meteorWarningOffset : -attacks.meteorWarningOffset),
        target.feetY - target.displayHeight - 36,
      );
      if (event.responseAt !== null) {
        event.warning.setText(
          event.responseOutcome === 'perfect'
            ? `M${event.id} · ¡PERFECTO!`
            : event.target === 'hazel'
              ? `M${event.id} · DAÑO COMPLETO`
              : `M${event.id} · ¡CUBIERTO!`,
        ).setColor(event.responseOutcome === 'perfect' ? '#ffffff' : '#a8ffbd');
      }
      const activeWindow = elapsed >= event.defenseOpensAtMs
        && elapsed <= event.defenseClosesAtMs;
      const perfectWindow = activeWindow
        && event.target !== 'sahira'
        && elapsed >= event.normalBlockEndsAtMs;
      event.ring.clear();
      if (activeWindow) {
        const ringProgress = (elapsed - event.defenseOpensAtMs)
          / (event.preparationMs + event.travelMs - event.defenseOpensAtMs);
        this.drawTimingRing(event.ring, event.target, ringProgress);
        this.targetText.setText(
          event.target === 'sahira'
            ? 'SAHIRA · W PARA CUBRIRSE'
            : event.target === 'hazel'
              ? perfectWindow ? 'HAZEL · SOLO LA PARADA PERFECTA EVITA EL DAÑO' : 'HAZEL · PREPARA UNA PARADA PERFECTA'
            : perfectWindow
              ? '¡PARADA PERFECTA! · W'
              : 'CUBRIR NORMAL · W',
        );
      }
      if (elapsed >= event.defenseClosesAtMs) {
        this.resolveMeteorEvent(event);
      }
    });
  }

  private registerMeteorDefense(): void {
    if (this.phase !== 'meteor-rain') {
      return;
    }
    const event = this.meteorEvents
      .filter((candidate) => !candidate.resolved && candidate.responseAt === null)
      .filter((candidate) => {
        const elapsed = this.time.now - candidate.startedAt;
        return elapsed >= candidate.defenseOpensAtMs
          && elapsed <= candidate.defenseClosesAtMs;
      })
      .sort((left, right) => left.startedAt - right.startedAt)[0];
    if (!event) {
      return;
    }
    event.responseAt = this.time.now;
    const elapsed = event.responseAt - event.startedAt;
    event.responseOutcome = event.target === 'sahira'
      ? 'blocked'
      : elapsed < event.normalBlockEndsAtMs
        ? 'blocked'
        : 'perfect';
    event.warning.setText(
      event.responseOutcome === 'perfect'
        ? `M${event.id} · ¡PERFECTO!`
        : `M${event.id} · ¡CUBIERTO!`,
    ).setColor(event.responseOutcome === 'perfect' ? '#ffffff' : '#a8ffbd');
  }

  private resolveMeteorEvent(event: MeteorEvent): void {
    if (event.resolved) {
      return;
    }
    event.resolved = true;
    const targetId = event.target;
    const target = GAME_CONFIG.characters[targetId];
    const outcome = event.responseOutcome ?? 'failed';
    const shielded = outcome !== 'perfect'
      && !(targetId === 'sahira' && outcome === 'blocked')
      && consumeShieldHit(this.state, targetId);
    const damage = shielded
      ? 0
      : outcome === 'failed'
        ? this.getBossPhaseConfig('kosmelys').meteorRainDamage
        : outcome === 'blocked' && targetId === 'hazel'
          ? this.getBossPhaseConfig('kosmelys').meteorRainDamage
          : outcome === 'blocked' && targetId !== 'sahira'
          ? this.getBossPhaseConfig('kosmelys').meteorBlockedDamage
          : 0;
    const adjustedDamage = this.applyBossDamageModifier(damage);
    const actualDamage = damagePartyMember(this.state, targetId, adjustedDamage);
    if (outcome === 'perfect' || outcome === 'blocked') {
      this.setActorFrame(
        targetId,
        this.getActorFrames(targetId).defense.up,
        GAME_CONFIG.timing.spritePoseMs,
      );
    }
    if (targetId === 'furai') {
      this.meteorFuraiTargeted = true;
      if (outcome !== 'perfect') {
        this.meteorFuraiAllPerfect = false;
      }
    }
    this.createImpact(
      target.x,
      target.feetY - target.displayHeight * 0.52,
      outcome === 'perfect' ? 0xffffff : outcome === 'blocked' ? COLORS.yellow : COLORS.violet,
      0.95,
    );
    if (actualDamage > 0) {
      this.showFloatingText(
        `M${event.id} · -${actualDamage}`,
        target.x,
        target.feetY - target.displayHeight * 0.72,
        '#ffb7a9',
      );
      this.setActorFrame(targetId, this.getActorFrames(targetId).hit, 550);
      this.soundscape.play('impact');
    } else if (outcome === 'perfect') {
      this.showFloatingText(
        'PERFECT',
        target.x,
        target.feetY - target.displayHeight * 0.72,
        '#ffffff',
      );
      this.soundscape.play('perfect_block');
      if (targetId === 'dexios' && this.state.bosses.kosmelys.health > 0) {
        const counterDamage = damageBoss(
          this.state,
          'kosmelys',
          GAME_CONFIG.kosmelysAttacks.meteorDexiosCounterDamage,
        );
        const boss = GAME_CONFIG.characters.kosmelys;
        this.setKosmelysFrame(this.getBossFrames('kosmelys').hit);
        this.time.delayedCall(this.combatTiming.spritePoseMs, () => {
          if (
            this.phase === 'meteor-rain'
            && !this.result
            && this.state.bosses.kosmelys.health > 0
          ) {
            this.setKosmelysFrame(this.getBossFrames('kosmelys').meteorRain);
          }
        });
        this.createImpact(
          boss.x,
          boss.feetY - boss.displayHeight * 0.55,
          COLORS.yellow,
          0.9,
        );
        this.showFloatingText(
          `-${counterDamage}`,
          boss.x,
          boss.feetY - boss.displayHeight - 12,
          '#fff0a5',
        );
      }
    } else if (outcome === 'blocked' || shielded) {
      this.showFloatingText(
        shielded
          ? 'ESCUDO HIPOPÓTAMO'
          : targetId === 'hazel' ? 'DEFENSA INEFICAZ' : 'BLOCK',
        target.x,
        target.feetY - target.displayHeight * 0.72,
        shielded ? '#a8ffbd' : '#ffd65c',
      );
    }
    event.sprite.destroy();
    event.warning.destroy();
    event.ring.destroy();
    this.refreshHud();
    if (this.finishIfBattleEnded()) {
      return;
    }
    if (this.state.bosses.kosmelys.health <= 0) {
      this.finishKosmelysAttack();
      return;
    }
    if (event.id < this.meteorCountForAttack) {
      this.startMeteorEvent(event.id + 1, true);
      return;
    }
    if (
      this.meteorFuraiTargeted
      && this.meteorFuraiAllPerfect
      && this.state.party.furai.health > 0
    ) {
      this.performFuraiKosmelysCounterattack(
        GAME_CONFIG.kosmelysAttacks.meteorFuraiCounterDamage,
        () => this.finishKosmelysAttack(),
      );
      return;
    }
    this.finishKosmelysAttack();
  }

  private performFuraiKosmelysCounterattack(
    damage: number,
    onComplete: () => void,
  ): void {
    if (
      this.result
      || this.state.party.furai.health <= 0
      || this.state.bosses.kosmelys.health <= 0
    ) {
      onComplete();
      return;
    }
    const furai = GAME_CONFIG.characters.furai;
    const kosmelys = GAME_CONFIG.characters.kosmelys;
    this.phase = 'action';
    this.turnText.setText('TIGER PARRY');
    this.promptText.setText('¡Furai devuelve el ataque con una parada perfecta!');
    this.showFloatingText(
      'TIGER PARRY',
      furai.x,
      furai.feetY - furai.displayHeight - 12,
      '#ffe187',
    );
    this.setActorFrame('furai', furai.frames.attack);
    this.soundscape.play('furai');
    this.time.delayedCall(this.combatDuration(300), () => {
      if (this.phase !== 'action' || this.result) {
        return;
      }
      const counterDamage = damageBoss(
        this.state,
        'kosmelys',
        damage,
      );
      if (counterDamage > 0) {
        gainFuraiSpirit(this.state, 30);
      }
      this.setKosmelysFrame(
        this.getBossFrames('kosmelys').hit,
        GAME_CONFIG.timing.spritePoseMs,
      );
      this.createImpact(
        kosmelys.x,
        kosmelys.feetY - kosmelys.displayHeight * 0.55,
        COLORS.yellow,
        1.05,
      );
      this.showFloatingText(
        `-${counterDamage}`,
        kosmelys.x,
        kosmelys.feetY - kosmelys.displayHeight - 12,
        '#fff0a5',
      );
      this.refreshHud();
      if (this.finishIfBattleEnded()) {
        return;
      }
      this.time.delayedCall(this.combatTiming.spritePoseMs, () => {
        if (this.result) {
          return;
        }
        this.setActorFrame('furai', furai.frames.idle);
        onComplete();
      });
    });
  }

  private finishKosmelysAttack(): void {
    if (this.result) {
      return;
    }
    this.phase = 'resolving';
    this.cosmicTargetCharacter = null;
    this.cosmicFuraiPerfectParries = 0;
    this.meteorFuraiTargeted = false;
    this.meteorFuraiAllPerfect = true;
    this.warning.setVisible(false);
    this.timingRing.clear();
    this.meteorEvents.forEach((event) => {
      if (!event.resolved) {
        event.sprite.destroy();
        event.warning.destroy();
        event.ring.destroy();
        event.resolved = true;
      }
    });
    if (this.state.bosses.kosmelys.health > 0) {
      this.setKosmelysFrame(
        this.state.kosmelysPortalShieldTurnsRemaining > 0
          ? this.getBossFrames('kosmelys').shield
          : this.getBossFrames('kosmelys').idle,
      );
    }
    this.time.delayedCall(this.combatTiming.resultDurationMs, () => {
      if (this.phase === 'resolving' && !this.result) {
        this.advanceTurn();
      }
    });
  }

  private startDivineRetribution(): void {
    this.phase = 'resolving';
    this.state.divineRetributionTurnsRemaining =
      GAME_CONFIG.enemyAttacks.divineRetributionDurationPlayerTurns;
    this.turnText.setText('DIVINE RETRIBUTION');
    this.promptText.setText('Iobrontes se cubre con una armadura eléctrica que devuelve el daño.');
    this.targetText.setText('ARMADURA ELÉCTRICA · 2 TURNOS');
    this.setBossFrame(this.getBossFrames('iobrontes').divineRetribution);
    this.soundscape.play('armadura');
    this.createImpact(
      GAME_CONFIG.characters.iobrontes.x,
      GAME_CONFIG.characters.iobrontes.feetY
        - GAME_CONFIG.characters.iobrontes.displayHeight * 0.55,
      COLORS.violet,
      1.2,
    );
    this.showFloatingText(
      'ARMADURA ELÉCTRICA',
      GAME_CONFIG.characters.iobrontes.x,
      GAME_CONFIG.characters.iobrontes.feetY
        - GAME_CONFIG.characters.iobrontes.displayHeight - 22,
      '#d8b2ff',
    );
    this.time.delayedCall(this.combatTiming.resultDurationMs, () => {
      if (this.phase === 'resolving' && !this.result) {
        this.advanceTurn();
      }
    });
  }

  private advanceDivineRetributionTurn(): void {
    if (this.state.divineRetributionTurnsRemaining <= 0) {
      return;
    }
    this.state.divineRetributionTurnsRemaining -= 1;
    if (this.state.divineRetributionTurnsRemaining === 0) {
      this.setBossFrame(this.getBossFrames('iobrontes').idle);
      this.showFloatingText(
        'ARMADURA DISIPADA',
        GAME_CONFIG.characters.iobrontes.x,
        GAME_CONFIG.characters.iobrontes.feetY
          - GAME_CONFIG.characters.iobrontes.displayHeight - 22,
        '#d8b2ff',
      );
    }
  }

  private resolveIobrontesDamage(
    amount: number,
    attacker: CharacterId,
    consumeArmorBreak = false,
  ): {
    damage: number;
    retaliationDamage: number;
    retaliationShielded: boolean;
    empowered: boolean;
  } {
    const result = consumeArmorBreak
      ? damageBossWithArmorBreak(this.state, 'iobrontes', amount)
      : { damage: damageIobrontes(this.state, amount), empowered: false };
    const { damage, empowered } = result;
    if (damage <= 0 || this.state.divineRetributionTurnsRemaining <= 0) {
      return { damage, retaliationDamage: 0, retaliationShielded: false, empowered };
    }
    this.state.divineRetributionTurnsRemaining = 0;
    const retaliationShielded = consumeShieldHit(this.state, attacker);
    const retaliationDamage = retaliationShielded
      ? 0
      : damagePartyMember(
        this.state,
        attacker,
        this.applyBossDamageModifier(
          this.getBossPhaseConfig('iobrontes').divineRetaliationDamage,
        ),
      );
    return { damage, retaliationDamage, retaliationShielded, empowered };
  }

  private showDivineRetaliation(
    attacker: CharacterId,
    damage: number,
    shielded = false,
  ): void {
    if (damage <= 0 && !shielded) {
      return;
    }
    const character = GAME_CONFIG.characters[attacker];
    if (shielded) {
      this.createImpact(
        character.x,
        character.feetY - character.displayHeight * 0.52,
        COLORS.green,
        1.1,
      );
      this.showFloatingText(
        'ESCUDO HIPOPÓTAMO',
        character.x,
        character.feetY - character.displayHeight * 0.7,
        '#a8ffbd',
      );
      this.promptText.setText(`${character.name} bloquea la represalia con el Escudo Hipopótamo.`);
      return;
    }
    this.setActorFrame(attacker, this.getActorFrames(attacker).hit, 650);
    this.createImpact(
      character.x,
      character.feetY - character.displayHeight * 0.52,
      COLORS.violet,
      1.1,
    );
    this.showFloatingText(
      `-${damage} · REPRESALIA`,
      character.x,
      character.feetY - character.displayHeight * 0.6,
      '#d8b2ff',
    );
    this.soundscape.play('lightning');
    this.promptText.setText(
      `Divine Retribution devuelve ${damage} de daño a ${character.name}.`,
    );
  }

  private startWatchTheThunder(): void {
    this.targetCharacter = null;
    this.watchThunderSweepIndex = 0;
    this.watchThunderSweepCount = this.getBossPhaseConfig('iobrontes').watchThunderSweeps;
    this.promptText.setText('Iobrontes concentra un rayo contra todo el equipo.');
    this.setBossFrame(this.getBossFrames('iobrontes').watchThunder);
    this.startWatchThunderSweep();
  }

  private startWatchThunderSweep(): void {
    this.phase = 'casting';
    this.partyJumped = false;
    this.turnText.setText(
      this.watchThunderSweepCount > 1
        ? `WATCH THE THUNDER · ${this.watchThunderSweepIndex + 1} / ${this.watchThunderSweepCount}`
        : 'WATCH THE THUNDER',
    );
    this.targetText.setText('PREPÁRATE PARA SALTAR');
    this.soundscape.play('trueno');
    this.time.delayedCall(this.combatTiming.watchTheThunderCastMs, () => {
      if (this.phase === 'casting' && !this.result) {
        this.beginJumpWindow();
      }
    });
  }

  private beginJumpWindow(): void {
    this.phase = 'jump-window';
    this.spaceKeyBadge.setVisible(true);
    if (this.state.party.sahira.health > 0) {
      const sahira = GAME_CONFIG.characters.sahira;
      this.sahiraSpaceHint = this.add.text(
        sahira.x,
        sahira.feetY - sahira.displayHeight - 20,
        'SPACE',
        {
          fontFamily: GAME_FONT_FAMILY,
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#f5d47d',
          backgroundColor: '#352719',
          padding: { x: 14, y: 8 },
        },
      ).setOrigin(0.5).setDepth(17);
      this.uiCamera.ignore(this.sahiraSpaceHint);
    }
    this.jumpWindowStartedAt = this.time.now;
    this.targetText.setText('PULSA [ SPACE ] · SALTO EN EQUIPO');
    const boss = GAME_CONFIG.characters.iobrontes;
    const party = PLAYABLE_CHARACTERS.map(
      (id) => GAME_CONFIG.characters[id],
    );
    const beamY = party.reduce(
      (total, character) => total + character.feetY - character.displayHeight * 0.53,
      0,
    ) / party.length;
    const beamStartX = boss.x - 80;
    const beamEndX = GAME_CONFIG.characters.furai.x - 150;
    const beam = this.createBolt(beamStartX - beamEndX)
      .setPosition(beamStartX, beamY)
      .setRotation(Math.PI)
      .setDepth(8);
    this.activeBolt = beam;
    this.uiCamera.ignore(beam);
    this.tweens.add({
      targets: beam,
      alpha: { from: 0.45, to: 1 },
      duration: this.combatDuration(120),
      yoyo: true,
      repeat: 1,
    });
    this.time.delayedCall(this.combatTiming.jumpWindowMs, () => {
      this.resolveWatchTheThunder();
    });
  }

  private jumpParty(): void {
    if (this.phase !== 'jump-window' || this.partyJumped) {
      return;
    }
    this.partyJumped = true;
    PLAYABLE_CHARACTERS.forEach((id) => {
      if (this.state.party[id].health > 0) {
        this.setActorFrame(
          id,
          this.getActorFrames(id).jump,
          GAME_CONFIG.timing.jumpPoseMs,
        );
        this.liftJump(id);
      }
    });
    this.targetText.setText('¡SALTO!');
  }

  private liftJump(id: CharacterId): void {
    const sprite = this.actorSprites[id];
    const config = GAME_CONFIG.characters[id];
    const scale = GAME_CONFIG.sprite.frameScale[this.getActorFrames(id).jump] ?? 1;
    const { startLift, peakLift } = GAME_CONFIG.sprite.jump;
    const height = config.displayHeight * scale;
    const half = this.combatTiming.jumpPoseMs / 2;
    sprite.setY(config.feetY - height * startLift);
    this.tweens.add({
      targets: sprite,
      y: config.feetY - height * peakLift,
      duration: half,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: sprite,
          y: config.feetY,
          duration: half,
          ease: 'Sine.easeIn',
        });
      },
    });
  }

  private resolveWatchTheThunder(): void {
    if (this.phase !== 'jump-window' || this.result) {
      return;
    }
    this.phase = 'resolving';
    this.spaceKeyBadge.setVisible(false);
    this.sahiraSpaceHint?.destroy();
    this.sahiraSpaceHint = undefined;
    this.timingRing.clear();
    this.targetText.setText('');
    if (this.activeBolt) {
      this.tweens.killTweensOf(this.activeBolt);
      this.activeBolt.destroy();
      this.activeBolt = undefined;
    }
    PLAYABLE_CHARACTERS.forEach((id) => {
      if (this.state.party[id].health <= 0) {
        return;
      }
      const character = GAME_CONFIG.characters[id];
      const y = character.feetY - character.displayHeight * 0.52;
      if (this.partyJumped) {
        this.showFloatingText('¡ESQUIVADO!', character.x, y - 20, '#ffffff');
        this.createImpact(character.x, y, 0xffffff, 0.8);
        return;
      }
      if (consumeShieldHit(this.state, id)) {
        this.showFloatingText('ESCUDO HIPOPÓTAMO', character.x, y - 20, '#a8ffbd');
        this.createImpact(character.x, y, COLORS.green, 1.1);
        return;
      }
      const damage = damagePartyMember(
        this.state,
        id,
        this.applyBossDamageModifier(
          this.getBossPhaseConfig('iobrontes').watchThunderDamage,
        ),
      );
      this.setActorFrame(id, this.getActorFrames(id).hit, 650);
      this.showFloatingText(`-${damage}`, character.x, y - 20, '#ffb7a9');
      this.createImpact(character.x, y, COLORS.purple, 1.1);
    });
    this.soundscape.play('impact');
    this.promptText.setText(
      this.partyJumped
        ? 'El equipo esquiva Watch the Thunder con un salto sincronizado.'
        : 'Watch the Thunder golpea a todos los personajes alcanzados.',
    );
    this.refreshHud();
    if (this.finishIfBattleEnded()) {
      return;
    }
    this.time.delayedCall(this.combatTiming.resultDurationMs, () => {
      if (this.phase !== 'resolving' || this.result) {
        return;
      }
      if (this.watchThunderSweepIndex + 1 < this.watchThunderSweepCount) {
        this.watchThunderSweepIndex += 1;
        this.startWatchThunderSweep();
        return;
      }
      PLAYABLE_CHARACTERS.forEach((id) => {
        if (this.state.party[id].health > 0) {
          this.setActorFrame(id, this.getActorFrames(id).idle);
        }
      });
      this.setBossFrame(
        this.state.divineRetributionTurnsRemaining > 0
          ? this.getBossFrames('iobrontes').divineRetribution
          : this.getBossFrames('iobrontes').idle,
      );
      this.advanceTurn();
    });
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
    this.warningArrow.setText(this.directionPrompt(this.attackDirection));
    this.warning.setVisible(true).setAlpha(1);
    this.tweens.add({
      targets: this.warning,
      alpha: 0.45,
      duration: this.combatDuration(280),
      yoyo: true,
      repeat: 2,
    });
    const bossFrame = this.getBossFrames('iobrontes').attack[this.attackDirection];
    this.setBossFrame(
      bossFrame,
      GAME_CONFIG.timing.windUpMs + GAME_CONFIG.timing.defenseHintLeadMs
        + GAME_CONFIG.timing.projectileTravelMs + 400,
    );
    this.targetText.setText(
      `${this.directionControl(this.attackDirection)}  ·  GOLPE ${this.lightningIndex + 1} / ${this.lightningStrikeCount}`,
    );
    this.time.delayedCall(
      this.combatTiming.windUpMs + this.combatTiming.defenseHintLeadMs,
      () => this.launchEnemyLightning(),
    );
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
      duration: this.combatTiming.projectileTravelMs,
      ease: 'Linear',
      onComplete: () => {
        bolt.destroy();
        if (this.activeBolt === bolt) {
          this.activeBolt = undefined;
        }
      },
    });
    this.time.delayedCall(this.defenseWindowEndMs, () => this.resolveEnemyAttack());
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

  private createBolt(length = 600): Phaser.GameObjects.Graphics {
    const bolt = this.add.graphics();
    const segments = Math.max(14, Math.ceil(length / 42));
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
    return this.promoteToOverlay(bolt);
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
    const damage = damageForDefense(
      targetId,
      outcome,
      this.getBossPhaseConfig('iobrontes').damageMultiplier,
      this.modeConfig.bossDamageMultiplier,
    );
    const shielded = outcome !== 'perfect'
      && !(targetId === 'sahira' && outcome === 'blocked')
      && consumeShieldHit(this.state, targetId);
    const actualDamage = shielded ? 0 : damagePartyMember(this.state, targetId, damage);
    this.timingRing.clear();
    this.warning.setVisible(false);
    this.soundscape.play(outcome === 'perfect' ? 'perfect_block' : 'impact');
    let retaliationDamage = 0;
    let retaliationShielded = false;

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
      this.setActorFrame(targetId, this.getActorFrames(targetId).defense[this.attackDirection]);
      if (targetId === 'dexios') {
        const bossDamage = this.resolveIobrontesDamage(PERFECT_PARRY_DAMAGE, targetId);
        retaliationDamage = bossDamage.retaliationDamage;
        retaliationShielded = bossDamage.retaliationShielded;
        this.createImpact(
          GAME_CONFIG.characters.iobrontes.x,
          GAME_CONFIG.characters.iobrontes.feetY - 310,
          COLORS.yellow,
          0.8,
        );
        this.setBossFrame(this.getBossFrames('iobrontes').hit, 450);
        this.showFloatingText(`-${bossDamage.damage}`, GAME_CONFIG.characters.iobrontes.x, GAME_CONFIG.characters.iobrontes.feetY - 360, '#fff0a5');
      }
      this.promptText.setText('Parada perfecta: daño evitado.');
    } else if (outcome === 'blocked') {
      this.showFloatingText(
        targetId === 'hazel' ? 'DEFENSA INEFICAZ' : 'BLOCK',
        GAME_CONFIG.characters[targetId].x,
        this.actorSprites[targetId].y - GAME_CONFIG.characters[targetId].displayHeight,
        targetId === 'hazel' ? '#ffb7a9' : '#ffd65c',
      );
      this.setActorFrame(
        targetId,
        targetId === 'hazel' && actualDamage > 0
          ? this.getActorFrames(targetId).hit
          : this.getActorFrames(targetId).defense[this.attackDirection],
        targetId === 'hazel' && actualDamage > 0 ? 650 : 0,
      );
      this.createImpact(
        GAME_CONFIG.characters[targetId].x,
        GAME_CONFIG.characters[targetId].feetY - GAME_CONFIG.characters[targetId].displayHeight * 0.52,
        COLORS.yellow,
        0.75,
      );
      this.promptText.setText(
        targetId === 'sahira'
          ? 'Bloqueo: Sahira no recibe daño.'
          : targetId === 'hazel'
            ? `La defensa de Hazel no detiene el rayo: ${actualDamage} de daño.`
            : `Bloqueo imperfecto: ${actualDamage} de daño.`,
      );
    } else if (!shielded) {
      this.showFloatingText('FAIL', GAME_CONFIG.characters[targetId].x, this.actorSprites[targetId].y - GAME_CONFIG.characters[targetId].displayHeight, '#ff8d8d');
      this.setActorFrame(targetId, this.getActorFrames(targetId).hit, 650);
      this.createImpact(
        GAME_CONFIG.characters[targetId].x,
        GAME_CONFIG.characters[targetId].feetY - GAME_CONFIG.characters[targetId].displayHeight * 0.52,
        COLORS.purple,
        1.1,
      );
      this.promptText.setText(`Impacto: ${actualDamage} de daño.`);
    }
    if (shielded) {
      const target = GAME_CONFIG.characters[targetId];
      this.promptText.setText(`Escudo Hipopótamo: ataque bloqueado (${this.state.party[targetId].shieldHits} restantes).`);
      this.showFloatingText(
        'ESCUDO HIPOPÓTAMO',
        target.x,
        target.feetY - target.displayHeight * 0.7,
        '#a8ffbd',
      );
      this.createImpact(
        target.x,
        target.feetY - target.displayHeight * 0.52,
        COLORS.green,
        1.1,
      );
    }
    if (actualDamage > 0) {
      this.showFloatingText(
        `-${actualDamage}`,
        GAME_CONFIG.characters[targetId].x + 70,
        GAME_CONFIG.characters[targetId].feetY - GAME_CONFIG.characters[targetId].displayHeight * 0.6,
        '#ffb7a9',
      );
    }
    this.showDivineRetaliation(targetId, retaliationDamage, retaliationShielded);
    this.refreshHud();
    if (this.finishIfBattleEnded()) {
      return;
    }
    this.time.delayedCall(this.combatTiming.resultDurationMs, () => {
      if (this.phase !== 'resolving' || this.result) {
        return;
      }
      this.setActorFrame(targetId, this.getActorFrames(targetId).idle);
      if (this.state.bosses.iobrontes.health <= 0) {
        this.finishEnemyChain();
        return;
      }
      this.lightningIndex += 1;
      if (
        this.state.party[targetId].health <= 0
        || this.lightningIndex >= this.lightningStrikeCount
      ) {
        this.finishEnemyChain();
      } else {
        this.time.delayedCall(this.combatTiming.nextBoltDelayMs, () => this.beginLightningBolt());
      }
    });
  }

  private finishEnemyChain(): void {
    if (!this.targetCharacter || this.result) {
      return;
    }
    const target = this.targetCharacter;
    if (
      this.state.bosses.iobrontes.health > 0
      && target === 'furai'
      && this.perfectParries === this.lightningStrikeCount
      && this.state.party.furai.health > 0
    ) {
      this.phase = 'action';
      this.promptText.setText(
        `Parry perfecto · Tiger Parry: Furai contraataca tras ${this.lightningStrikeCount} paradas perfectas.`,
      );
      this.turnText.setText('TIGER PARRY');
      this.showFloatingText('TIGER PARRY', GAME_CONFIG.characters.furai.x, GAME_CONFIG.characters.furai.feetY - 520, '#ffe187');
      this.setActorFrame('furai', GAME_CONFIG.characters.furai.frames.attack);
      this.soundscape.play('furai');
      this.time.delayedCall(this.combatDuration(300), () => {
        if (this.phase === 'ended' || this.result) {
          return;
        }
        const bossDamage = this.resolveIobrontesDamage(20, 'furai');
        if (bossDamage.damage > 0) {
          gainFuraiSpirit(this.state, 30);
        }
        this.createImpact(
          GAME_CONFIG.characters.iobrontes.x,
          GAME_CONFIG.characters.iobrontes.feetY - 320,
          COLORS.yellow,
          1.05,
        );
        this.setBossFrame(this.getBossFrames('iobrontes').hit, 500);
        this.showDivineRetaliation(
          'furai',
          bossDamage.retaliationDamage,
          bossDamage.retaliationShielded,
        );
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
        this.getActorFrames(this.targetCharacter).idle,
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
      || this.cameraTransitioning
      || !character
      || this.state.party[character].health <= 0
      || !canUseAbility(this.state, character, ability)
    ) {
      return;
    }
    if (ability.id === 'hippopotamus-healing' || ability.id === 'hippopotamus-shield') {
      this.allyTargetingAbility = ability.id;
      this.promptText.setText(
        ability.id === 'hippopotamus-shield'
          ? 'Elige un aliado consciente para proteger de sus dos próximos ataques.'
          : 'Elige un aliado consciente para restaurar toda su salud.',
      );
      this.targetText.setText('ELIGE UN ALIADO');
      this.refreshHud();
      return;
    }

    if (
      character === 'hazel'
      && (ability.id === 'flame-dance' || ability.id === 'ignis-shift')
    ) {
      this.targetingAbility = null;
      this.phase = 'action';
      this.returnCameraToArena(() => this.runCommand(
        ability,
        this.livingBossesAnchor(),
        (outcome) => this.executeHazelAreaAbility(ability, outcome),
      ));
      return;
    }

    this.targetingAbility = ability;
    this.selectedBoss = null;
    this.phase = 'target-boss';
    this.highlightBossTarget(
      this.state.bosses.iobrontes.health > 0 ? 'iobrontes' : 'kosmelys',
    );
    this.focusBossSelectionCamera();
    this.promptText.setText(`Elige a qué jefe dirigirá ${ability.name}.`);
    this.targetText.setText('SELECCIONA UN JEFE');
    this.refreshHud();
  }

  private highlightBossTarget(boss: BossId): void {
    if (
      this.phase !== 'target-boss'
      || this.cameraTransitioning
      || this.state.bosses[boss].health <= 0
    ) {
      return;
    }
    if (this.selectedBoss && this.selectedBoss !== boss) {
      this.getBossSprite(this.selectedBoss).clearTint();
    }
    this.selectedBoss = boss;
    this.getBossSprite(boss).setTint(0xfff1c4);
    this.updateTargetArrow();
    (['iobrontes', 'kosmelys'] as const).forEach((id) => {
      this.bossHud[id].selected.setText(id === boss ? 'OBJETIVO ACTUAL' : 'DISPONIBLE');
    });
  }

  private confirmSelectedBossTarget(boss: BossId): void {
    if (this.cameraTransitioning || this.phase !== 'target-boss') {
      return;
    }
    this.highlightBossTarget(boss);
    this.confirmBossTarget(boss);
  }

  private cancelBossTargetSelection(): void {
    if (this.phase !== 'target-boss' || !this.activeCharacter || this.cameraTransitioning) {
      return;
    }
    if (this.selectedBoss) {
      this.getBossSprite(this.selectedBoss).clearTint();
    }
    this.selectedBoss = null;
    this.targetingAbility = null;
    this.targetArrow.setVisible(false);
    this.phase = 'player';
    this.promptText.setText('Elige una habilidad para continuar la batalla.');
    this.targetText.setText('');
    this.focusPlayerSelectionCamera(this.activeCharacter);
    this.refreshHud();
  }

  private chooseBossTarget(boss: BossId): void {
    this.confirmSelectedBossTarget(boss);
  }

  private confirmBossTarget(boss: BossId): void {
    if (
      this.phase !== 'target-boss'
      || this.cameraTransitioning
      || this.selectedBoss !== boss
      || this.state.bosses[boss].health <= 0
      || !this.targetingAbility
      || !this.activeCharacter
    ) {
      return;
    }
    const ability = this.targetingAbility;
    const character = this.activeCharacter;
    this.targetingAbility = null;
    this.allyTargetingAbility = null;
    this.abilityBoss = boss;
    this.getBossSprite(boss).clearTint();
    this.selectedBoss = null;
    this.phase = 'action';
    this.returnCameraToArena(() => this.runCommand(
      ability,
      this.characterAnchor(boss),
      (outcome) => this.executeBossTargetedAbility(boss, ability, character, outcome),
    ));
  }

  private characterAnchor(id: CharacterId | BossId): { x: number; y: number } {
    const config = GAME_CONFIG.characters[id];
    return { x: config.x, y: config.feetY - config.displayHeight * 0.5 };
  }

  private livingBossesAnchor(): { x: number; y: number } {
    const living = (['iobrontes', 'kosmelys'] as const)
      .filter((boss) => this.state.bosses[boss].health > 0)
      .map((boss) => this.characterAnchor(boss));
    if (living.length === 0) {
      return { x: WIDTH / 2, y: HEIGHT / 2 };
    }
    return {
      x: living.reduce((sum, point) => sum + point.x, 0) / living.length,
      y: living.reduce((sum, point) => sum + point.y, 0) / living.length,
    };
  }

  // Franja cinemática + comando de acción; el efecto se ejecuta al terminar.
  private runCommand(
    ability: Ability,
    anchor: { x: number; y: number },
    onResult: (outcome: CommandOutcome) => void,
  ): void {
    if (!this.commandRunner) {
      onResult({ results: Array(Math.max(1, ability.hits)).fill('normal'), success: true, charges: 0 });
      return;
    }
    this.promptText.setText(`${ability.name}…`);
    this.commandRunner.run(ability.id, anchor, (outcome) => {
      if (this.phase !== 'action' || this.result) {
        return;
      }
      onResult(outcome);
    }, ability.hits);
  }

  private failChaoticLightning(character: CharacterId, ability: Ability): void {
    spendCost(this.state.party[character], ability);
    this.soundscape.play(ability.sound);
    this.showFloatingText(
      'FAIL · CHAOS DESCONTROLADO',
      WIDTH / 2,
      HEIGHT * 0.3,
      '#ff7b7b',
    );
    PLAYABLE_CHARACTERS
      .filter((id) => this.state.party[id].health > 0)
      .forEach((id) => {
        const damage = damagePartyMember(this.state, id, 30, false);
        const config = GAME_CONFIG.characters[id];
        this.createImpact(config.x, config.feetY - config.displayHeight * 0.55, COLORS.red, 1.2);
        this.setActorFrame(id, this.getActorFrames(id).hit, 550);
        this.showFloatingText(
          `-${damage}`,
          config.x,
          config.feetY - config.displayHeight * 0.7,
          '#ff9c9c',
        );
      });
    this.promptText.setText('Dexios pierde el control de su Chaos: todo el grupo recibe 30 de daño.');
    this.refreshHud();
    if (this.finishIfBattleEnded()) {
      return;
    }
    this.time.delayedCall(this.combatTiming.attackRecoveryMs, () => this.finishPlayerAction());
  }

  private executeBossTargetedAbility(
    boss: BossId,
    ability: Ability,
    character: CharacterId,
    outcome: CommandOutcome,
  ): void {
    if (character === 'hazel') {
      this.executeHazelTargetedAbility(boss, ability, outcome);
      return;
    }
    if (ability.id === 'chaotic-lightning' && !outcome.success) {
      this.failChaoticLightning(character, ability);
      return;
    }
    this.hitResults = outcome.results;
    spendCost(this.state.party[character], ability);
    this.portalRedirectTarget = null;
    if (ability.id === 'armor-break' && !outcome.success) {
      this.showFloatingText(
        'ARMOR BREAK FALLIDO',
        GAME_CONFIG.characters[boss].x,
        GAME_CONFIG.characters[boss].feetY - GAME_CONFIG.characters[boss].displayHeight - 20,
        '#ff7b7b',
      );
      this.setActorFrame(character, 'furai_romper', GAME_CONFIG.timing.spritePoseMs);
      this.promptText.setText('Armor Break falló: no se aplica la marca.');
      this.refreshHud();
      this.time.delayedCall(this.combatTiming.attackRecoveryMs, () => {
        this.finishPlayerAction();
      });
      return;
    }
    if (
      boss === 'kosmelys'
      && ability.damage > 0
      && this.state.kosmelysPortalShieldTurnsRemaining > 0
    ) {
      const eligible = PLAYABLE_CHARACTERS
        .filter((id) => this.state.party[id].health > 0);
      this.portalRedirectTarget = eligible.length > 0
        ? Phaser.Utils.Array.GetRandom(eligible)
        : null;
      if (this.portalRedirectTarget) {
        this.showPortalRedirection(this.portalRedirectTarget);
      }
    }
    if (ability.id === 'armor-break') {
      this.state.bosses[boss].armorBreak = true;
      this.setActorFrame(character, 'furai_romper', GAME_CONFIG.timing.spritePoseMs);
      this.soundscape.play(ability.sound);
      this.createImpact(
        GAME_CONFIG.characters[boss].x,
        GAME_CONFIG.characters[boss].feetY - GAME_CONFIG.characters[boss].displayHeight - 50,
        COLORS.violet,
        0.95,
      );
      this.promptText.setText(`Armor Break activo contra ${GAME_CONFIG.characters[boss].name}: su siguiente ataque recibe daño doble.`);
      this.refreshHud();
      this.time.delayedCall(this.combatTiming.attackRecoveryMs, () => {
        this.finishPlayerAction();
      });
      return;
    }

    const empowered = this.state.bosses[boss].armorBreak
      && ability.damage > 0
      && !this.portalRedirectTarget;
    this.promptText.setText(
      empowered && ability.damage > 0
        ? `${ability.name}: ¡el primer impacto recibe el doble de daño!`
        : `${ability.name} en curso.`,
    );
    this.soundscape.play(ability.sound);
    this.refreshHud();
    this.performAbilityHit(character, ability, 0);
  }

  private executeHazelTargetedAbility(
    boss: BossId,
    ability: Ability,
    outcome: CommandOutcome,
  ): void {
    spendCost(this.state.party.hazel, ability);
    this.portalRedirectTarget = null;
    this.phase = 'action';
    if (!outcome.success) {
      const target = GAME_CONFIG.characters[boss];
      this.showFloatingText(
        'FALLO · 0',
        target.x,
        target.feetY - target.displayHeight * 0.7,
        '#ff7b7b',
      );
      this.setActorFrame('hazel', this.getActorFrames('hazel').hit, 550);
      this.promptText.setText(`${ability.name} falló: no causa daño.`);
      this.time.delayedCall(this.combatTiming.attackHitIntervalMs, () => {
        if (this.phase !== 'action' || this.result) {
          return;
        }
        this.finishHazelAbility(ability);
      });
      return;
    }
    if (ability.id === 'glacio-shift') {
      this.soundscape.play('shift');
      this.setActorFrame('hazel', 'hazel_cambio');
      this.time.delayedCall(this.combatTiming.spritePoseMs, () => {
        if (this.phase !== 'action' || this.result) {
          return;
        }
        this.changeHazelForm('glacio');
        this.soundscape.play('shard');
        this.launchHazelProjectile('hielo_debil', boss, () => {
          this.resolveHazelHit(boss, ability.damage, 'hielo_debil');
          this.finishHazelAbility(ability);
        });
      });
      return;
    }

    this.soundscape.play('shard');
    this.setActorFrame('hazel', ability.frame);
    this.time.delayedCall(this.combatTiming.attackHitIntervalMs, () => {
      if (this.phase !== 'action' || this.result) {
        return;
      }
      this.resolveHazelHit(boss, ability.damage, 'hielo');
      this.finishHazelAbility(ability);
    });
  }

  private executeHazelAreaAbility(ability: Ability, outcome: CommandOutcome): void {
    if (this.phase !== 'action' || this.result) {
      return;
    }
    spendCost(this.state.party.hazel, ability);
    this.portalRedirectTarget = null;
    if (!outcome.success) {
      (['iobrontes', 'kosmelys'] as const)
        .filter((boss) => this.state.bosses[boss].health > 0)
        .forEach((boss) => {
          const target = GAME_CONFIG.characters[boss];
          this.showFloatingText(
            'FALLO · 0',
            target.x,
            target.feetY - target.displayHeight * 0.7,
            '#ff7b7b',
          );
        });
      this.setActorFrame('hazel', this.getActorFrames('hazel').hit, 550);
      this.promptText.setText(`${ability.name} falló: no causa daño.`);
      this.time.delayedCall(this.combatTiming.attackHitIntervalMs, () => {
        if (this.phase !== 'action' || this.result) {
          return;
        }
        this.finishHazelAbility(ability);
      });
      return;
    }
    if (ability.id === 'ignis-shift') {
      this.soundscape.play('shift');
      this.setActorFrame('hazel', 'hazel_cambio');
      this.time.delayedCall(this.combatTiming.spritePoseMs, () => {
        if (this.phase !== 'action' || this.result) {
          return;
        }
        this.changeHazelForm('ignis');
        this.releaseHazelAreaAttack(ability);
      });
      return;
    }
    this.setActorFrame('hazel', ability.frame);
    this.releaseHazelAreaAttack(ability);
  }

  private releaseHazelAreaAttack(ability: Ability): void {
    if (this.phase !== 'action' || this.result) {
      return;
    }
    const weakFire = ability.id === 'ignis-shift';
    const effect = weakFire ? 'fuego_debil' : 'fuego';
    this.soundscape.play('flame');
    const livingBosses = (['iobrontes', 'kosmelys'] as const)
      .filter((boss) => this.state.bosses[boss].health > 0);
    if (weakFire) {
      let pendingImpacts = livingBosses.length;
      if (pendingImpacts === 0) {
        this.finishHazelAbility(ability);
        return;
      }
      livingBosses.forEach((boss) => {
        this.launchHazelProjectile(effect, boss, () => {
          this.resolveHazelHit(boss, ability.damage, effect, true);
          pendingImpacts -= 1;
          if (pendingImpacts === 0) {
            this.finishHazelAbility(ability);
          }
        });
      });
      return;
    }
    livingBosses.forEach((boss) => {
      this.resolveHazelHit(boss, ability.damage, effect, true);
    });
    this.finishHazelAbility(ability);
  }

  private resolveHazelHit(
    boss: BossId,
    baseDamage: number,
    effect: string,
    areaPortion = false,
  ): void {
    if (this.state.bosses[boss].health <= 0) {
      return;
    }
    if (boss === 'kosmelys' && this.state.kosmelysPortalShieldTurnsRemaining > 0) {
      const eligible = PLAYABLE_CHARACTERS
        .filter((id) => this.state.party[id].health > 0);
      if (eligible.length === 0) {
        return;
      }
      this.portalRedirectTarget = Phaser.Utils.Array.GetRandom(eligible);
      this.showPortalRedirection(this.portalRedirectTarget, areaPortion);
      const shielded = consumeShieldHit(this.state, this.portalRedirectTarget);
      const damage = shielded
        ? 0
        : damagePartyMember(this.state, this.portalRedirectTarget, baseDamage);
      const redirected = GAME_CONFIG.characters[this.portalRedirectTarget];
      this.showHazelImpact(effect, this.portalRedirectTarget);
      if (shielded) {
        this.showFloatingText(
          'ESCUDO HIPOPÓTAMO',
          redirected.x,
          redirected.feetY - redirected.displayHeight * 0.62,
          '#a8ffbd',
        );
      } else {
        this.setActorFrame('hazel', this.getActorFrames('hazel').hit, 550);
        this.showFloatingText(
          `-${damage}`,
          redirected.x,
          redirected.feetY - redirected.displayHeight * 0.7,
          '#ffb7a9',
        );
      }
      return;
    }

    const result = boss === 'iobrontes'
      ? this.resolveIobrontesDamage(baseDamage, 'hazel', true)
      : {
        ...damageBossWithArmorBreak(this.state, boss, baseDamage),
        retaliationDamage: 0,
        retaliationShielded: false,
      };
    const empowered = result.empowered;
    const target = GAME_CONFIG.characters[boss];
    this.showHazelImpact(effect, boss);
    this.setBossFrame(this.getBossFrames(boss).hit, GAME_CONFIG.timing.spritePoseMs, boss);
    this.showFloatingText(
      `-${result.damage}`,
      target.x,
      target.feetY - target.displayHeight * 0.7,
      empowered ? '#fff0a5' : '#ffffff',
    );
    if (boss === 'iobrontes') {
      this.showDivineRetaliation('hazel', result.retaliationDamage, result.retaliationShielded);
    }
  }

  private finishHazelAbility(ability: Ability): void {
    this.refreshHud();
    if (this.finishIfBattleEnded()) {
      return;
    }
    const attackFrame = this.getActorFrames('hazel').attack;
    if (ability.frame !== attackFrame) {
      this.setActorFrame('hazel', this.getActorFrames('hazel').idle);
      this.finishAbility('hazel', ability);
      return;
    }
    this.time.delayedCall(this.combatTiming.hazelAttackPoseMs, () => {
      if (this.phase !== 'action' || this.result) {
        return;
      }
      this.setActorFrame('hazel', this.getActorFrames('hazel').idle);
      this.finishAbility('hazel', ability);
    });
  }

  private launchHazelProjectile(    effect: string,
    boss: BossId,
    onImpact: () => void,
  ): void {
    const key = effect;
    if (!this.textures.exists(key)) {
      console.error(`Falta el efecto de Hazel: ${key}`);
      onImpact();
      return;
    }
    const source = this.textures.get(key).getSourceImage();
    const scale = 92 / Math.max(source.width, source.height);
    const sprite = this.add.image(
      GAME_CONFIG.characters.hazel.x,
      GAME_CONFIG.characters.hazel.feetY - GAME_CONFIG.characters.hazel.displayHeight * 0.55,
      key,
    ).setDisplaySize(source.width * scale, source.height * scale).setDepth(16);
    this.uiCamera.ignore(sprite);
    this.hazelEffectObjects.push(sprite);
    const target = GAME_CONFIG.characters[boss];
    this.tweens.add({
      targets: sprite,
      x: target.x,
      y: target.feetY - target.displayHeight * 0.55,
      duration: this.combatTiming.attackHitIntervalMs,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.hazelEffectObjects.splice(this.hazelEffectObjects.indexOf(sprite), 1);
        sprite.destroy();
        onImpact();
      },
    });
  }

  private showHazelImpact(effect: string, target: BossId | CharacterId): void {
    if (!this.textures.exists(effect)) {
      console.error(`Falta el efecto de Hazel: ${effect}`);
      return;
    }
    const config = GAME_CONFIG.characters[target];
    const source = this.textures.get(effect).getSourceImage();
    const scale = 190 / Math.max(source.width, source.height);
    const sprite = this.add.image(
      config.x,
      config.feetY - config.displayHeight * 0.55,
      effect,
    ).setDisplaySize(source.width * scale, source.height * scale).setDepth(16);
    this.uiCamera.ignore(sprite);
    this.hazelEffectObjects.push(sprite);
    this.tweens.add({
      targets: sprite,
      alpha: 0,
      scale: 1.35,
      duration: this.combatDuration(450),
      onComplete: () => {
        this.hazelEffectObjects.splice(this.hazelEffectObjects.indexOf(sprite), 1);
        sprite.destroy();
      },
    });
  }

  private returnCameraToArena(onComplete: () => void): void {
    this.cameraTransitioning = true;
    this.refreshHud();
    this.cameras.main.pan(WIDTH / 2, HEIGHT / 2, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
    this.time.delayedCall(GAME_CONFIG.camera.returnMs, () => {
      this.cameraTransitioning = false;
      this.refreshHud();
      onComplete();
    });
  }

  private showPortalRedirection(target: CharacterId, areaPortion = false): void {
    this.soundscape.play('teleport_ataque');
    const config = GAME_CONFIG.characters[target];
    const source = this.textures.get('portal_effect').getSourceImage();
    const portal = this.add.image(
      config.x,
      config.feetY - config.displayHeight * 0.56,
      'portal_effect',
    ).setDisplaySize(
      source.width * GAME_CONFIG.kosmelysAttacks.portalScale,
      source.height * GAME_CONFIG.kosmelysAttacks.portalScale,
    ).setDepth(17).setAlpha(0.95);
    this.uiCamera.ignore(portal);
    this.tweens.add({
      targets: portal,
      angle: GAME_CONFIG.kosmelysAttacks.portalEffectRotationDegrees,
      alpha: GAME_CONFIG.kosmelysAttacks.portalEffectFadeAlpha,
      scale: GAME_CONFIG.kosmelysAttacks.portalEffectScale,
      duration: this.combatTiming.portalEffectDurationMs,
      onComplete: () => {
        this.portalEffects = this.portalEffects.filter((effect) => effect !== portal);
        portal.destroy();
      },
    });
    this.portalEffects.push(portal);
    this.showFloatingText(
      `PORTAL → ${config.name.toUpperCase()}`,
      config.x,
      config.feetY - config.displayHeight - 18,
      '#e6b4ff',
    );
    this.promptText.setText(
      areaPortion
        ? `Portal Shield redirige solo la parte dirigida a Kosmelys hacia ${config.name}.`
        : `Portal Shield redirige toda la habilidad hacia ${config.name}.`,
    );
  }

  private performAbilityHit(
    character: CharacterId,
    ability: Ability,
    hitIndex: number,
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
      duration: this.combatDuration(150),
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.phase !== 'action' || this.result) {
          return;
        }
        const boss = this.abilityBoss;
        const targetConfig = GAME_CONFIG.characters[boss];
        let resolvedDamage: number;
        let empowered = false;
        let retaliationDamage = 0;
        let retaliationShielded = false;
        let redirectedShielded = false;
        const hitResult = this.hitResults[hitIndex] ?? 'normal';
        const hitDamage = applyResultMultiplier(ability.damage, hitResult);
        if (this.portalRedirectTarget) {
          redirectedShielded = consumeShieldHit(this.state, this.portalRedirectTarget);
          resolvedDamage = redirectedShielded
            ? 0
            : damagePartyMember(this.state, this.portalRedirectTarget, hitDamage);
        } else if (boss === 'iobrontes') {
          const result = this.resolveIobrontesDamage(hitDamage, character, true);
          resolvedDamage = result.damage;
          empowered = result.empowered;
          retaliationDamage = result.retaliationDamage;
          retaliationShielded = result.retaliationShielded;
        } else {
          const result = damageBossWithArmorBreak(this.state, boss, hitDamage);
          resolvedDamage = result.damage;
          empowered = result.empowered;
        }
        if (hitResult === 'perfect') {
          this.showFloatingText(
            'GOLPE CRÍTICO',
            targetConfig.x,
            targetConfig.feetY - targetConfig.displayHeight * 0.85 - hitIndex * 32,
            '#8dffb0',
          );
        }
        const multiplier = empowered ? 2 : 1;
        if (ability.id === 'tiger-spear' && resolvedDamage > 0) {
          gainFuraiSpirit(this.state, 30);
        }
        if (!this.portalRedirectTarget) {
          this.setBossFrame(
            this.getBossFrames(boss).hit,
            GAME_CONFIG.timing.spritePoseMs,
            boss,
          );
        }
        const impactTarget = this.portalRedirectTarget
          ? GAME_CONFIG.characters[this.portalRedirectTarget]
          : targetConfig;
        this.createImpact(
          impactTarget.x - 70 + hitIndex * 44,
          impactTarget.feetY - impactTarget.displayHeight * 0.6,
          this.portalRedirectTarget && redirectedShielded ? COLORS.green : ability.color,
          multiplier === 2 ? 1.12 : 0.84,
        );
        this.showFloatingText(
          this.portalRedirectTarget
            ? redirectedShielded ? 'ESCUDO' : `-${resolvedDamage}`
            : `-${resolvedDamage}`,
          this.portalRedirectTarget
            ? GAME_CONFIG.characters[this.portalRedirectTarget].x
            : targetConfig.x - 50,
          this.portalRedirectTarget
            ? GAME_CONFIG.characters[this.portalRedirectTarget].feetY
              - GAME_CONFIG.characters[this.portalRedirectTarget].displayHeight * 0.7
            : targetConfig.feetY - targetConfig.displayHeight * 0.7 - hitIndex * 32,
          multiplier === 2 ? '#fff0a5' : '#ffffff',
        );
        if (this.portalRedirectTarget && redirectedShielded) {
          this.showFloatingText(
            'ESCUDO HIPOPÓTAMO',
            GAME_CONFIG.characters[this.portalRedirectTarget].x,
            GAME_CONFIG.characters[this.portalRedirectTarget].feetY
              - GAME_CONFIG.characters[this.portalRedirectTarget].displayHeight * 0.56,
            '#a8ffbd',
          );
        }
        this.showDivineRetaliation(character, retaliationDamage, retaliationShielded);
        this.refreshHud();
        if (this.finishIfBattleEnded()) {
          return;
        }
        if (this.state.party[character].health <= 0) {
          this.finishAbility(character, ability);
          return;
        }
        if (hitIndex + 1 < ability.hits) {
          this.time.delayedCall(this.combatTiming.attackHitIntervalMs, () => {
            this.performAbilityHit(character, ability, hitIndex + 1);
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
      this.setActorFrame(character, this.getActorFrames(character).hit, 550);
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
    if (this.portalRedirectTarget) {
      this.state.kosmelysPortalShieldTurnsRemaining = 0;
      this.portalRedirectTarget = null;
      this.setKosmelysFrame(this.getBossFrames('kosmelys').idle);
      this.showFloatingText(
        'PORTAL SHIELD AGOTADO',
        GAME_CONFIG.characters.kosmelys.x,
        GAME_CONFIG.characters.kosmelys.feetY - GAME_CONFIG.characters.kosmelys.displayHeight - 12,
        '#d8b2ff',
      );
    }
    this.time.delayedCall(this.combatTiming.attackRecoveryMs, () => this.finishPlayerAction());
  }

  private healCharacter(target: CharacterId): void {
    if (
      this.allyTargetingAbility !== 'hippopotamus-healing'
      || this.phase !== 'player'
      || this.activeCharacter !== 'sahira'
      || this.state.party[target].health <= 0
    ) {
      return;
    }
    const ability = GAME_CONFIG.abilities.sahira.find(
      (entry) => entry.id === 'hippopotamus-healing',
    );
    if (!ability || !canUseAbility(this.state, 'sahira', ability)) {
      return;
    }
    if (!consumeSahiraAbilityUse(this.state, 'hippopotamus-healing')) {
      return;
    }
    this.phase = 'action';
    this.allyTargetingAbility = null;
    spendCost(this.state.party.sahira, ability);
    this.returnCameraToArena(() => this.runCommand(ability, this.characterAnchor(target), () => {
      this.setActorFrame('sahira', 'sahira_cura', 850);
      const restored = healPartyMember(this.state, target);
      this.soundscape.play(ability.sound);
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
      this.time.delayedCall(this.combatTiming.attackRecoveryMs, () => this.finishPlayerAction());
    }));
  }

  private selectAllyTarget(target: CharacterId): void {
    if (this.allyTargetingAbility === 'hippopotamus-healing') {
      this.healCharacter(target);
    } else if (this.allyTargetingAbility === 'hippopotamus-shield') {
      this.shieldCharacter(target);
    }
  }

  private shieldCharacter(target: CharacterId): void {
    if (
      this.allyTargetingAbility !== 'hippopotamus-shield'
      || this.phase !== 'player'
      || this.activeCharacter !== 'sahira'
      || this.state.party[target].health <= 0
    ) {
      return;
    }
    const ability = GAME_CONFIG.abilities.sahira.find(
      (entry) => entry.id === 'hippopotamus-shield',
    );
    if (!ability || !canUseAbility(this.state, 'sahira', ability)) {
      return;
    }
    if (!consumeSahiraAbilityUse(this.state, 'hippopotamus-shield')) {
      return;
    }
    this.phase = 'action';
    this.allyTargetingAbility = null;
    spendCost(this.state.party.sahira, ability);
    this.returnCameraToArena(() => this.runCommand(ability, this.characterAnchor(target), (outcome) => {
      if (outcome.charges <= 0) {
        this.setActorFrame('sahira', this.getActorFrames('sahira').hit, 550);
        this.showFloatingText(
          'ESCUDO FALLIDO',
          GAME_CONFIG.characters[target].x,
          GAME_CONFIG.characters[target].feetY - GAME_CONFIG.characters[target].displayHeight * 0.7,
          '#ff7b7b',
        );
        this.promptText.setText('Hippopotamus Shield falló: no se aplica ningún escudo.');
        this.refreshHud();
        this.time.delayedCall(this.combatTiming.attackRecoveryMs, () => this.finishPlayerAction());
        return;
      }
      const charges = outcome.charges;
      this.state.party[target].shieldHits = charges;
      this.setActorFrame('sahira', 'sahira_cura', 850);
      this.soundscape.play(ability.sound);
      this.showFloatingText(
        `ESCUDO HIPOPÓTAMO · ${charges} ${charges === 1 ? 'GOLPE' : 'GOLPES'}`,
        GAME_CONFIG.characters[target].x,
        GAME_CONFIG.characters[target].feetY - GAME_CONFIG.characters[target].displayHeight * 0.7,
        '#a8ffbd',
      );
      this.promptText.setText(`${GAME_CONFIG.characters[target].name} queda protegido de sus ${charges === 1 ? 'próximo ataque' : 'dos próximos ataques'}.`);
      this.refreshHud();
      this.time.delayedCall(this.combatTiming.attackRecoveryMs, () => this.finishPlayerAction());
    }));
  }

  private finishPlayerAction(): void {
    if (this.phase !== 'action' || this.result) {
      return;
    }
    if (this.activeCharacter) {
      this.setActorFrame(
        this.activeCharacter,
        this.getActorFrames(this.activeCharacter).idle,
      );
    }
    if (this.state.kosmelysPortalShieldTurnsRemaining > 0) {
      this.state.kosmelysPortalShieldTurnsRemaining = 0;
      this.setKosmelysFrame(this.getBossFrames('kosmelys').idle);
      this.showFloatingText(
        'PORTAL SHIELD DISIPADO',
        GAME_CONFIG.characters.kosmelys.x,
        GAME_CONFIG.characters.kosmelys.feetY - GAME_CONFIG.characters.kosmelys.displayHeight - 12,
        '#d8b2ff',
      );
    }
    this.cameraTransitioning = true;
    this.refreshHud();
    this.cameras.main.pan(WIDTH / 2, HEIGHT / 2, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1, GAME_CONFIG.camera.returnMs, 'Sine.easeInOut');
    this.time.delayedCall(GAME_CONFIG.camera.returnMs, () => {
      this.cameraTransitioning = false;
      this.advanceTurn();
    });
  }

  private registerDefense(direction: Direction): void {
    if (
      (this.phase !== 'projectile' && this.phase !== 'cosmic-rays')
      || this.responseDirection !== null
      || !this.attackDirection
      || !this.targetCharacter
    ) {
      return;
    }
    const elapsed = this.time.now - this.projectileStartedAt;
    const cosmic = this.phase === 'cosmic-rays';
    if (cosmic && !this.cosmicRevealed) {
      return;
    }
    const windowStart = cosmic
      ? this.cosmicMidpointMs
      : this.defenseWindowStartMs;
    const windowEnd = cosmic
      ? this.cosmicTravelDurationMs
      : this.defenseWindowEndMs;
    if (elapsed < windowStart || elapsed > windowEnd) {
      return;
    }
    this.responseDirection = direction;
    this.responseTime = elapsed;
    if (cosmic) {
      this.defenseOutcome = direction !== this.attackDirection
        ? 'failed'
        : this.targetCharacter === 'sahira'
          ? 'blocked'
          : elapsed >= this.cosmicPerfectWindowStartsAtMs
            ? 'perfect'
            : 'blocked';
    } else {
      const outcome = resolveDefense(
        this.attackDirection,
        direction,
        elapsed,
        this.modeConfig.combatTimingMultiplier,
      );
      this.defenseOutcome = this.targetCharacter === 'sahira' && outcome === 'perfect'
        ? 'blocked'
        : outcome;
    }
    const targetConfig = GAME_CONFIG.characters[this.targetCharacter];
    if (this.defenseOutcome === 'perfect') {
      this.targetText.setText('¡PARADA PERFECTA!');
      this.setActorFrame(
        this.targetCharacter,
        this.getActorFrames(this.targetCharacter).defense[direction],
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
        this.getActorFrames(this.targetCharacter).defense[direction],
        GAME_CONFIG.timing.spritePoseMs,
      );
    } else {
      this.targetText.setText('DIRECCIÓN EQUIVOCADA');
      this.setActorFrame(
        this.targetCharacter,
        this.getActorFrames(this.targetCharacter).hit,
        550,
      );
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
    if (this.characterIntroduction?.isBlockingInput) {
      this.characterIntroduction.handleKeyDown(event);
      return;
    }
    if (this.practiceId) {
      if (key === 'escape' || event.code === 'Escape') {
        this.scene.start('escena_select');
        return;
      }
      if (key === 'r') {
        this.scene.restart();
        return;
      }
      if (this.phase === 'player' && !this.allyTargetingAbility) {
        if (key === 'i') {
          this.startPracticeAttack('iobrontes');
          return;
        }
        if (key === 'k') {
          this.startPracticeAttack('kosmelys');
          return;
        }
        if (key === 't') {
          this.runPracticeSpecialAction(this.practiceId);
          return;
        }
      }
    }
    if (this.commandRunner?.isActive()) {
      this.commandRunner.handleKey(event);
      return;
    }
    if (key === 'r' && this.phase === 'ended') {
      this.scene.restart();
      return;
    }
    if (event.code === 'Space' && this.phase === 'jump-window') {
      event.preventDefault();
      this.jumpParty();
      return;
    }
    if (this.phase === 'meteor-rain' && key === 'w') {
      this.registerMeteorDefense();
      return;
    }
    if (this.phase === 'target-boss') {
      if (key === 'escape') {
        this.cancelBossTargetSelection();
      } else if (key === '1') {
        this.confirmSelectedBossTarget('iobrontes');
      } else if (key === '2') {
        this.confirmSelectedBossTarget('kosmelys');
      }
      return;
    }
    if (key === 'escape' && this.allyTargetingAbility) {
      this.allyTargetingAbility = null;
      this.promptText.setText('Elige una habilidad para continuar la batalla.');
      this.targetText.setText('');
      this.refreshHud();
      return;
    }
    if (this.allyTargetingAbility) {
      const target = ALLY_TARGET_ORDER[Number(key) - 1];
      if (target) {
        this.selectAllyTarget(target);
      }
      return;
    }
    if (this.phase === 'player') {
      const abilityIndex = Number(key) - 1;
      if (abilityIndex >= 0 && this.activeCharacter) {
        const ability = this.getAbilities(this.activeCharacter)[abilityIndex];
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

  private getBossSprite(boss: BossId): Phaser.GameObjects.Sprite {
    return boss === 'iobrontes' ? this.boss : this.kosmelysBoss;
  }

  private getBossPhaseConfig(boss: 'iobrontes'): IobrontesPhaseConfig;
  private getBossPhaseConfig(boss: 'kosmelys'): KosmelysPhaseConfig;
  private getBossPhaseConfig(
    boss: BossId,
  ): IobrontesPhaseConfig | KosmelysPhaseConfig;
  private getBossPhaseConfig(
    boss: BossId,
  ): IobrontesPhaseConfig | KosmelysPhaseConfig {
    const phase: BossPhase = this.state.bosses[boss].phase === 'normal' ? 'normal' : 'heir';
    return GAME_CONFIG.bossPhases[boss][phase];
  }

  private getBossFrames(boss: 'iobrontes'): IobrontesPhaseConfig['frames'];
  private getBossFrames(boss: 'kosmelys'): KosmelysPhaseConfig['frames'];
  private getBossFrames(
    boss: BossId,
  ): IobrontesPhaseConfig['frames'] | KosmelysPhaseConfig['frames'];
  private getBossFrames(
    boss: BossId,
  ): IobrontesPhaseConfig['frames'] | KosmelysPhaseConfig['frames'] {
    return this.getBossPhaseConfig(boss).frames;
  }

  private getBossIconTextureKey(boss: BossId): string {
    return this.state.bosses[boss].phase === 'normal'
      ? `icon_${boss}`
      : `icon_${boss}_heir`;
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

  private directionPrompt(direction: Direction): string {
    return `${this.directionArrow(direction)}\n${this.directionControl(direction).split(' · ')[0]}`;
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
    durationMs = this.combatDuration(durationMs);
    const sprite = this.actorSprites[id];
    const config = GAME_CONFIG.characters[id];
    const idleFrame = this.getActorFrames(id).idle;
    const generation = ++this.frameGeneration[id];
    if (frame === idleFrame && this.state.party[id].health > 0) {
      this.breathingTweens[id].pause();
      sprite.setY(config.feetY);
      this.breathingTweens[id].resume();
    } else {
      this.breathingTweens[id].pause();
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
          this.setActorFrame(id, this.getActorFrames(id).idle);
        }
      });
    }
  }

  private setBossFrame(
    frame: string,
    durationMs = 0,
    bossId: BossId = 'iobrontes',
  ): void {
    durationMs = this.combatDuration(durationMs);
    const config = GAME_CONFIG.characters[bossId];
    const sprite = bossId === 'iobrontes' ? this.boss : this.kosmelysBoss;
    const generation = bossId === 'iobrontes'
      ? ++this.bossFrameGeneration
      : ++this.kosmelysFrameGeneration;
    if (this.textures.exists(frame)) {
      sprite.setTexture(frame);
      this.sizeSprite(sprite, frame, config.displayHeight);
      this.missingBossLabels[bossId].setVisible(false);
    } else {
      this.missingBossLabels[bossId]
        .setText(`FOTOGRAMA TEMPORAL: ${frame}`)
        .setPosition(config.x, config.feetY - config.displayHeight - 16)
        .setVisible(true);
    }
    if (durationMs > 0) {
      this.time.delayedCall(durationMs, () => {
        const currentGeneration = bossId === 'iobrontes'
          ? this.bossFrameGeneration
          : this.kosmelysFrameGeneration;
        if (
          currentGeneration === generation
          && !this.result
          && this.state.bosses[bossId].health > 0
        ) {
          const idleFrame = bossId === 'iobrontes'
            ? this.state.divineRetributionTurnsRemaining > 0
              ? this.getBossFrames('iobrontes').divineRetribution
                : this.getBossFrames('iobrontes').idle
            : this.state.kosmelysPortalShieldTurnsRemaining > 0
                ? this.getBossFrames('kosmelys').shield
                : this.getBossFrames('kosmelys').idle;
          this.setBossFrame(idleFrame, 0, bossId);
        }
      });
    }
  }

  private setKosmelysFrame(frame: string, durationMs = 0): void {
    this.setBossFrame(frame, durationMs, 'kosmelys');
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

  private focusPlayerSelectionCamera(id: CharacterId): void {
    const character = GAME_CONFIG.characters[id];
    const centerX = character.x;
    const centerY = character.feetY - character.displayHeight * 0.5;
    this.transitionCamera(centerX, centerY, GAME_CONFIG.camera.playerZoom);
    this.actorSprites[id].setTint(0xfff1c4);
  }

  private focusBossSelectionCamera(): void {
    const first = GAME_CONFIG.characters.iobrontes;
    const second = GAME_CONFIG.characters.kosmelys;
    const zoom = GAME_CONFIG.camera.bossTargetZoom;
    this.transitionCamera(
      (first.x + second.x) / 2,
      (first.feetY + second.feetY) / 2 - Math.max(first.displayHeight, second.displayHeight) * 0.36,
      zoom,
    );
  }

  private transitionCamera(centerX: number, centerY: number, zoom: number): void {
    this.cameraTransitioning = true;
    this.refreshHud();
    this.cameras.main.pan(centerX, centerY, GAME_CONFIG.camera.selectionMs, 'Sine.easeInOut');
    this.cameras.main.zoomTo(zoom, GAME_CONFIG.camera.selectionMs, 'Sine.easeInOut');
    this.time.delayedCall(GAME_CONFIG.camera.selectionMs, () => {
      this.cameraTransitioning = false;
      this.refreshHud();
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
      duration: this.combatDuration(420),
      onComplete: () => {
        glow.destroy();
        flash.destroy();
      },
    });
  }

  private showFloatingText(text: string, x: number, y: number, color: string): void {
    const label = this.add.text(x, y, text, {
      fontFamily: UI_FONT_FAMILY,
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
      duration: this.combatDuration(950),
      onComplete: () => label.destroy(),
    });
  }

  private createArmorBreakMark(bossId: BossId): Phaser.GameObjects.Container {
    const boss = GAME_CONFIG.characters[bossId];
    const mark = this.add.container(boss.x, boss.feetY - boss.displayHeight * 0.5).setDepth(13);
    const emblem = this.add.image(0, 0, 'tiger_mark').setDisplaySize(112, 112);
    const label = this.add.text(0, 48, 'ARMOR BREAK', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f0d3ff',
      stroke: '#171326',
      strokeThickness: 4,
    }).setOrigin(0.5, 0);
    mark.add([emblem, label]);
    return mark;
  }

  private createShieldMark(id: CharacterId): ShieldMark {
    const character = GAME_CONFIG.characters[id];
    const container = this.add.container(
      character.x,
      character.feetY - character.displayHeight * 0.52,
    ).setDepth(character.depth + 10);
    const emblem = this.add.image(0, 0, 'hippo_mark').setDisplaySize(96, 96);
    const counter = this.add.text(40, -42, '2', {
      fontFamily: UI_FONT_FAMILY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#145c38',
      padding: { x: 5, y: 2 },
      stroke: '#103c27',
      strokeThickness: 3,
    }).setOrigin(0.5);
    container.add([emblem, counter]);
    container.setVisible(false);
    return { container, counter };
  }

  private updateAudioLabel(): void {
    this.audioText?.setText(this.soundscape.isEnabled ? '♫ AUDIO · M' : '♫ SILENCIO · M');
  }

  private startAudio(): void {
    this.soundscape.start();
    this.updateAudioLabel();
  }

  private finishIfBattleEnded(): boolean {
    if (this.practiceId) {
      return false;
    }
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
    this.allyTargetingAbility = null;
    this.targetingAbility = null;
    if (this.selectedBoss) {
      this.getBossSprite(this.selectedBoss).clearTint();
    }
    this.selectedBoss = null;
    if (result === 'victory') {
      this.soundscape.playMusic('victory');
    } else {
      this.soundscape.stopMusic();
    }
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.activeBolt?.destroy();
    this.activeBolt = undefined;
    this.cosmicProjectile?.destroy();
    this.cosmicProjectile = undefined;
    this.meteorEvents.forEach((event) => {
      event.resolved = true;
      const { sprite, warning, ring } = event;
      sprite.destroy();
      warning.destroy();
      ring.destroy();
    });
    this.portalEffects.forEach((effect) => effect.destroy());
    this.portalEffects = [];
    this.hazelEffectObjects.forEach((effect) => effect.destroy());
    this.hazelEffectObjects.length = 0;
    this.warning.setVisible(false);
    this.timingRing.clear();
    this.targetText.setText('');
    this.refreshHud();
    this.cameras.main.pan(WIDTH / 2, HEIGHT / 2, 280, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1, 280, 'Sine.easeInOut');
    if (result === 'victory') {
      this.turnText.setText('VICTORIA');
      this.promptText.setText('La tormenta se disipa sobre el templo.');
      this.setBossFrame(this.getBossFrames('iobrontes').hit);
      this.cameras.main.flash(450, 205, 168, 255, false);
    } else {
      this.turnText.setText('DERROTA');
      this.promptText.setText('Todo el grupo ha quedado incapacitado.');
      PLAYABLE_CHARACTERS.forEach((id) => {
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
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '48px',
      fontStyle: 'bold',
      color: result === 'victory' ? '#f3d58e' : '#ff9a9a',
    }).setOrigin(0.5, 0).setDepth(41);
    this.add.text(
      WIDTH / 2,
      493,
      result === 'victory'
        ? 'Iobrontes y Kosmelys han sido vencidos.'
        : 'El grupo ya no puede continuar.',
      {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '20px',
        color: '#e5d9eb',
      },
    ).setOrigin(0.5, 0).setDepth(41);
    this.add.text(WIDTH / 2, 532, 'Pulsa R o el botón para volver a combatir', {
      fontFamily: GAME_FONT_FAMILY,
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
      fontFamily: GAME_FONT_FAMILY,
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
