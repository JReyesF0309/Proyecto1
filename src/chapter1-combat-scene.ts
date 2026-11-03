import Phaser from 'phaser';
import {
  EB_GARAMOND_FONT_FAMILY,
  GAME_CONFIG,
  GAME_FONT_FAMILY,
} from './game-config';
import { audioSettings, bindPhaserMusic } from './audio-settings';
import stripBlackMattes from './strip-black-matte';
import { PAUSE_SCENE_KEY } from './pause-scene';
import { installChapterOneHotkeys } from './chapter1-hotkeys';
import backgroundUrl from '../assets/backgrounds/ch1_combat1_background.png';
import boarAttackUrl from '../assets/Boar/boar_attack.png';
import boarBaseUrl from '../assets/Boar/boar_base.png';
import boarHurtUrl from '../assets/Boar/boar_hurt.png';
import boarPrepareUrl from '../assets/Boar/boar_prepare.png';
import rageboarAttackUrl from '../assets/rageboar/rageboar_attack.png';
import rageboarBaseUrl from '../assets/rageboar/rageboar_base.png';
import rageboarHurtUrl from '../assets/rageboar/rageboar_hurt.png';
import rageboarPrepareUrl from '../assets/rageboar/rageboar_prepare.png';
import dexiosJumpUrl from '../assets/dexios/dexios_salto.png';
import wolfAttackLeftUrl from '../assets/wolf/wolf_attack_left.png';
import wolfAttackRightUrl from '../assets/wolf/wolf_attack_right.png';
import wolfBaseUrl from '../assets/wolf/wolf_base.png';
import wolfHurtUrl from '../assets/wolf/wolf_hurt.png';
import wolfPrepareLeftUrl from '../assets/wolf/wolf_prepare_left.png';
import wolfPrepareRightUrl from '../assets/wolf/wolf_prepare_right.png';
import wolfAttackSfxUrl from '../assets/sfx/wolf_attack.mp3';
import wolfHurtSfxUrl from '../assets/sfx/wolf_hurt.mp3';
import wolfPrepareSfxUrl from '../assets/sfx/wolf_prepare.mp3';
import victoryMusicUrl from '../assets/music/nike.mp3';
import loseMusicUrl from '../assets/music/lose.mp3';
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
import dexiosArcChargingUrl from '../assets/dexios/dexios_arc_charging.png';
import dexiosArcReleasingUrl from '../assets/dexios/dexios_arc_releasing.png';
import arcChargingSfxUrl from '../assets/sfx/electric_arc_charging.mp3';
import arcReleasingSfxUrl from '../assets/sfx/electric_arc_releasing.mp3';
import dexiosSoundUrl from '../assets/sfx/dexios.mp3';
import perfectParrySoundUrl from '../assets/sfx/perfect_block.mp3';
import flameSfxUrl from '../assets/sfx/flame.mp3';
import combat7BackgroundUrl from '../assets/backgrounds/ch1_combat7_background.png';
import beastBaseUrl from '../assets/beast/beast_base.png';
import beastHurtUrl from '../assets/beast/beast_hurt.png';
import beastPreparingUpUrl from '../assets/beast/beast_preparing_up.png';
import beastAttackUpUrl from '../assets/beast/beast_attack_up.png';
import beastPreparingLeftUrl from '../assets/beast/beast_preparing_left.png';
import beastAttackLeftUrl from '../assets/beast/beast_attack_left.png';
import beastPreparingRightUrl from '../assets/beast/beast_preparing_right.png';
import beastAttackRightUrl from '../assets/beast/beast_attack_right.png';
import beastPreparingDownUrl from '../assets/beast/beast_preparing_down.png';
import beastAttackDownUrl from '../assets/beast/beast_attack_down.png';
import beastPreparingFireUrl from '../assets/beast/beast_preparing_fire.png';
import beastAttackFireUrl from '../assets/beast/beast_attack_fire.png';
import beastFireUrl from '../assets/beast/fire.png';
import cinematic1Url from '../assets/cutscenes/cinematic1.png';
import cinematic2Url from '../assets/cutscenes/cinematic2.png';
import cinematic3Url from '../assets/cutscenes/cinematic3.png';
import cinematic4Url from '../assets/cutscenes/cinematic4.png';
import cinematic5Url from '../assets/cutscenes/cinematic5.png';
import cinematic6Url from '../assets/cutscenes/cinematic6.png';
import cinematic7Url from '../assets/cutscenes/cinematic7.png';
import cinematic8Url from '../assets/cutscenes/cinematic8.png';

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
const BOAR_LEAP_HEIGHT = 380;
const ATTACK_GAP = 570;
const DEXIOS_MAX_HP = 65;
const PREPARATION_MS = 1000;
const LUNGE_MS = 2000;
const PARRY_GRACE_MS = 200;
const WILD_BITE_TOTAL_MS = PREPARATION_MS + LUNGE_MS + PARRY_GRACE_MS;
const TRIPLE_HIT_MS = 500;

// Every value is in milliseconds from the start of the attack timeline.
interface AttackTiming {
  preparationMs: number;
  lungeMs: number;
  graceMs: number;
  // How long into the lunge a correct directional defence still counts as a normal block.
  blockMs: number;
  // First moment a jump dodge is accepted.
  jumpFromMs: number;
}

const DEFAULT_TIMING: AttackTiming = {
  preparationMs: PREPARATION_MS,
  lungeMs: LUNGE_MS,
  graceMs: PARRY_GRACE_MS,
  blockMs: 1000,
  jumpFromMs: PREPARATION_MS + LUNGE_MS - 1000,
};

type BossAttackKind = 'leap' | 'claw' | 'fire' | 'dig';

interface BossAttack {
  id: string;
  name: string;
  kind: BossAttackKind;
  side: DefenseSide;
  defense: 'directional' | 'jump';
  prepareSprite: string;
  attackSprite: string;
  prepareSfx?: string;
  attackSfx: string;
  prepareText: string;
  minPhase: 1 | 2;
  weight: number;
}

interface BossConfig {
  backgroundKey: string;
  timing: AttackTiming;
  attacks: BossAttack[];
  // The first attack of phase 2 is always this one, preceded by its tutorial.
  firstPhaseTwoAttack: string;
  // Replaces the normal victory title and plays the final cinematic before it.
  victoryTitle?: string;
}

interface CinematicFrame {
  dialogue?: string;
  // Frames with a duration advance on their own and take no input.
  autoMs?: number;
  sequence?: string[];
  shakeOnEntry?: boolean;
  shakeOnPress?: boolean;
}

const TARGET_LABELS = ['I', 'II', 'III', 'IV'];

const CINEMATIC = {
  shakeMs: 220,
  shakeIntensity: 0.008,
  finalApproachMs: 1600,
  advanceDelayMs: 200,
};

const CINEMATIC_FRAMES: CinematicFrame[] = [
  { dialogue: 'Wh-What??? I can´t lose…', autoMs: 5000 },
  {
    dialogue: 'I … should … not… DAAMNNN ITTT!!!',
    sequence: Array.from({ length: 10 }, () => 'w'),
    shakeOnPress: true,
  },
  { dialogue: 'Why won`t you dieeee!!!!', sequence: ['a'], shakeOnEntry: true },
  { sequence: ['d'], shakeOnEntry: true },
  { sequence: ['a'], shakeOnEntry: true },
  { sequence: ['d'], shakeOnEntry: true },
  { sequence: ['a'], shakeOnEntry: true },
  {
    sequence: Array.from({ length: 10 }, (_, index) => (index % 2 === 0 ? 'a' : 'd')),
    shakeOnEntry: true,
    shakeOnPress: true,
  },
];

export interface BoarSpawn {
  id: string;
  name: string;
  turnLabel: string;
  x: number;
  y: number;
  height: number;
  // Vertical offset while lunging, so a boar can pass in front of its neighbour.
  lungeY: number;
  // Overrides the encounter's kit so one fight can mix enemy types.
  kit?: EnemyKit;
}

type AttackSide = 'up' | 'left' | 'right';
type DefenseSide = AttackSide | 'down';

// Describes one enemy type: sprites, sounds, damage and how its attack is defended.
export interface EnemyKit {
  maxHp: number;
  base: string;
  hurt: string;
  prepare: Record<AttackSide, string>;
  attack: Record<AttackSide, string>;
  sfx: { prepare: string; attack: string; hurt: string };
  damage: { failed: number; blocked: number };
  counter: number;
  attackName: string;
  prepareText: string;
  // 'jump' enemies can only be avoided with Space and never allow a counterattack.
  defense?: 'directional' | 'jump';
  // Lateral enemies pick a flank before each attack; others always attack from above.
  lateral?: {
    flankX: { left: number; right: number };
    lungeOffset: number;
    flankMs: number;
    firstSides: AttackSide[];
  };
}

const BOAR_KIT: EnemyKit = {
  maxHp: 20,
  base: 'boar_base',
  hurt: 'boar_hurt',
  prepare: { up: 'boar_prepare', left: 'boar_prepare', right: 'boar_prepare' },
  attack: { up: 'boar_attack', left: 'boar_attack', right: 'boar_attack' },
  sfx: { prepare: 'boar_prepare_sfx', attack: 'boar_attack_sfx', hurt: 'boar_hurt_sfx' },
  damage: { failed: 6, blocked: 3 },
  counter: 5,
  attackName: 'WILD BITE',
  prepareText: 'THE BOAR PREPARES TO CHARGE',
};

const RAGEBOAR_KIT: EnemyKit = {
  maxHp: 25,
  base: 'rageboar_base',
  hurt: 'rageboar_hurt',
  prepare: { up: 'rageboar_prepare', left: 'rageboar_prepare', right: 'rageboar_prepare' },
  attack: { up: 'rageboar_attack', left: 'rageboar_attack', right: 'rageboar_attack' },
  // Rageboars deliberately share the Wild Boar sound effects.
  sfx: { prepare: 'boar_prepare_sfx', attack: 'boar_attack_sfx', hurt: 'boar_hurt_sfx' },
  damage: { failed: 15, blocked: 15 },
  counter: 0,
  attackName: 'RAGE CHARGE',
  prepareText: 'THE RAGEBOAR PREPARES TO CHARGE',
  defense: 'jump',
};

// Jump dodge timings are measured from the start of the attack, like the Wild Bite window.
const JUMP_DODGE = {
  windowFromMs: PREPARATION_MS + LUNGE_MS - 1000,
  windowUntilMs: PREPARATION_MS + LUNGE_MS + PARRY_GRACE_MS,
  impactMs: PREPARATION_MS + LUNGE_MS,
  airMs: 640,
  height: 230,
  chargeEndOffset: 120,
};

const WOLF_KIT: EnemyKit = {
  maxHp: 35,
  base: 'wolf_base',
  hurt: 'wolf_hurt',
  prepare: { up: 'wolf_prepare_left', left: 'wolf_prepare_left', right: 'wolf_prepare_right' },
  attack: { up: 'wolf_attack_left', left: 'wolf_attack_left', right: 'wolf_attack_right' },
  sfx: { prepare: 'wolf_prepare_sfx', attack: 'wolf_attack_sfx', hurt: 'wolf_hurt_sfx' },
  damage: { failed: 10, blocked: 5 },
  counter: 5,
  attackName: 'WOLF LUNGE',
  prepareText: 'THE WOLF PREPARES TO LEAP',
  lateral: {
    flankX: { left: 160, right: 1230 },
    lungeOffset: 270,
    flankMs: 600,
    firstSides: ['left', 'right'],
  },
};

const BEAST_TIMING: AttackTiming = {
  preparationMs: 1000,
  lungeMs: 1600,
  graceMs: 100,
  blockMs: 800,
  jumpFromMs: 1800,
};

const BEAST_KIT: EnemyKit = {
  maxHp: 100,
  base: 'beast_base',
  hurt: 'beast_hurt',
  prepare: { up: 'beast_preparing_up', left: 'beast_preparing_left', right: 'beast_preparing_right' },
  attack: { up: 'beast_attack_up', left: 'beast_attack_left', right: 'beast_attack_right' },
  sfx: { prepare: 'boar_prepare_sfx', attack: 'boar_attack_sfx', hurt: 'boar_hurt_sfx' },
  damage: { failed: 10, blocked: 5 },
  counter: 5,
  attackName: 'SAVAGE JUMP',
  prepareText: 'THE BEAST PREPARES TO ATTACK',
  // Flank positions for Wild Claw; the other attacks ignore them.
  lateral: {
    flankX: { left: 70, right: 1250 },
    lungeOffset: 330,
    flankMs: 700,
    firstSides: [],
  },
};

const BEAST_ATTACKS: BossAttack[] = [
  {
    id: 'savage_jump',
    name: 'SAVAGE JUMP',
    kind: 'leap',
    side: 'up',
    defense: 'directional',
    prepareSprite: 'beast_preparing_up',
    attackSprite: 'beast_attack_up',
    prepareSfx: 'boar_prepare_sfx',
    attackSfx: 'boar_attack_sfx',
    prepareText: 'THE BEAST CROUCHES TO POUNCE',
    minPhase: 1,
    weight: 1,
  },
  {
    id: 'wild_claw_left',
    name: 'WILD CLAW',
    kind: 'claw',
    side: 'left',
    defense: 'directional',
    prepareSprite: 'beast_preparing_left',
    attackSprite: 'beast_attack_left',
    prepareSfx: 'wolf_prepare_sfx',
    attackSfx: 'wolf_attack_sfx',
    prepareText: 'THE BEAST PREPARES TO CLAW',
    minPhase: 1,
    weight: 0.5,
  },
  {
    id: 'wild_claw_right',
    name: 'WILD CLAW',
    kind: 'claw',
    side: 'right',
    defense: 'directional',
    prepareSprite: 'beast_preparing_right',
    attackSprite: 'beast_attack_right',
    prepareSfx: 'wolf_prepare_sfx',
    attackSfx: 'wolf_attack_sfx',
    prepareText: 'THE BEAST PREPARES TO CLAW',
    minPhase: 1,
    weight: 0.5,
  },
  {
    id: 'beast_fire',
    name: 'BEAST FIRE',
    kind: 'fire',
    side: 'up',
    defense: 'jump',
    prepareSprite: 'beast_preparing_fire',
    attackSprite: 'beast_attack_fire',
    attackSfx: 'flame_sfx',
    prepareText: 'THE BEAST GATHERS PURPLE FIRE',
    minPhase: 1,
    weight: 1,
  },
  {
    id: 'rampant_excavation',
    name: 'RAMPANT EXCAVATION',
    kind: 'dig',
    side: 'down',
    defense: 'directional',
    prepareSprite: 'beast_preparing_down',
    attackSprite: 'beast_attack_down',
    prepareSfx: 'boar_prepare_sfx',
    attackSfx: 'boar_attack_sfx',
    prepareText: 'THE BEAST DRIVES ITS TAIL UNDERGROUND',
    minPhase: 2,
    weight: 1,
  },
];

const BEAST_MOTION = {
  leapApex: 200,
  leapEndOffsetX: 380,
  leapEndOffsetY: 240,
  fireHeight: 170,
  fireOriginX: 0.33,
  fireOriginY: 0.17,
  fireTargetOffsetY: 110,
  digOffsetX: 220,
};

const SIDE_KEYS: Record<DefenseSide, { key: string; arrow: string; sprite: string; label: string }> = {
  up: { key: 'w', arrow: 'arrowup', sprite: 'dexios_arriba', label: 'W' },
  left: { key: 'a', arrow: 'arrowleft', sprite: 'dexios_izquierda', label: 'A' },
  right: { key: 'd', arrow: 'arrowright', sprite: 'dexios_derecha', label: 'D' },
  down: { key: 's', arrow: 'arrowdown', sprite: 'dexios_abajo', label: 'S' },
};

export interface Chapter1CombatConfig {
  sceneKey: string;
  turnSlots: number;
  introTutorials: boolean;
  nextSceneKey?: string;
  kit?: EnemyKit;
  sideTutorial?: boolean;
  // Enables the Mana HUD, the Electric Arc ability and its two tutorials.
  electricArc?: boolean;
  skipTargetTutorial?: boolean;
  skipArcTutorials?: boolean;
  jumpTutorial?: boolean;
  boss?: BossConfig;
  boars: BoarSpawn[];
}

// Electric Arc (Chapter 1 only): every timing value is measured from the moment both keys are held.
const ELECTRIC_ARC = {
  manaCost: 10,
  maxMana: 40,
  normalDamage: 35,
  perfectDamage: 40,
  chargeMs: 2000,
  normalFromMs: 500,
  perfectFromMs: 1500,
  perfectUntilMs: 2500,
  releaseHoldMs: 1000,
  approachMs: 400,
  approachGap: 520,
  spriteHeight: 720,
  releasingHeight: 712.8,
  zoom: 1.15,
  zoomCenterX: 800,
  zoomCenterY: 540,
  cameraMs: 500,
  origin: { x: 960, y: 760 },
  apex: { x: 960, y: 450 },
  halfSpan: 190,
};

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
  nextSceneKey: 'scene_ch1_combat3',
  boars: [
    { id: 'boar_1', name: 'WILD BOAR I', turnLabel: 'BOAR I', x: 1130, y: 800, height: 300, lungeY: 0 },
    { id: 'boar_2', name: 'WILD BOAR II', turnLabel: 'BOAR II', x: 1640, y: 800, height: 300, lungeY: 70 },
  ],
};

export const CHAPTER1_COMBAT3: Chapter1CombatConfig = {
  sceneKey: 'scene_ch1_combat3',
  turnSlots: 4,
  introTutorials: false,
  nextSceneKey: 'scene_ch1_combat4',
  kit: WOLF_KIT,
  sideTutorial: true,
  boars: [
    { id: 'wolf_1', name: 'WOLF', turnLabel: 'WOLF', x: 1400, y: 800, height: 330, lungeY: 0 },
  ],
};

export const CHAPTER1_COMBAT4: Chapter1CombatConfig = {
  sceneKey: 'scene_ch1_combat4',
  turnSlots: 4,
  introTutorials: false,
  nextSceneKey: 'scene_ch1_combat5',
  kit: {
    ...WOLF_KIT,
    lateral: {
      flankX: { left: 160, right: 1060 },
      lungeOffset: 270,
      flankMs: 600,
      firstSides: ['left', 'right'],
    },
  },
  electricArc: true,
  skipTargetTutorial: true,
  boars: [
    { id: 'wolf_1', name: 'WOLF 1', turnLabel: 'WOLF 1', x: 1290, y: 800, height: 290, lungeY: 0 },
    { id: 'wolf_2', name: 'WOLF 2', turnLabel: 'WOLF 2', x: 1710, y: 800, height: 290, lungeY: 0 },
  ],
};

export const CHAPTER1_COMBAT5: Chapter1CombatConfig = {
  sceneKey: 'scene_ch1_combat5',
  turnSlots: 4,
  introTutorials: false,
  nextSceneKey: 'scene_ch1_combat6',
  kit: RAGEBOAR_KIT,
  electricArc: true,
  skipArcTutorials: true,
  skipTargetTutorial: true,
  jumpTutorial: true,
  boars: [
    { id: 'rageboar_1', name: 'RAGEBOAR I', turnLabel: 'RAGE I', x: 1250, y: 800, height: 320, lungeY: 0 },
    { id: 'rageboar_2', name: 'RAGEBOAR II', turnLabel: 'RAGE II', x: 1700, y: 800, height: 320, lungeY: 70 },
  ],
};

export const CHAPTER1_COMBAT6: Chapter1CombatConfig = {
  sceneKey: 'scene_ch1_combat6',
  nextSceneKey: 'scene_ch1_combat7',
  turnSlots: 4,
  introTutorials: false,
  electricArc: true,
  skipArcTutorials: true,
  skipTargetTutorial: true,
  boars: [
    { id: 'boar_1', name: 'WILD BOAR', turnLabel: 'BOAR', x: 1010, y: 800, height: 270, lungeY: 0, kit: BOAR_KIT },
    { id: 'rageboar_1', name: 'RAGEBOAR', turnLabel: 'RAGEBOAR', x: 1390, y: 800, height: 300, lungeY: 70, kit: RAGEBOAR_KIT },
    {
      id: 'wolf_1',
      name: 'WOLF',
      turnLabel: 'WOLF',
      x: 1770,
      y: 800,
      height: 280,
      lungeY: 0,
      kit: {
        ...WOLF_KIT,
        lateral: {
          flankX: { left: 160, right: 1060 },
          lungeOffset: 270,
          flankMs: 600,
          firstSides: ['left', 'right'],
        },
      },
    },
  ],
};

export const CHAPTER1_COMBAT7: Chapter1CombatConfig = {
  sceneKey: 'scene_ch1_combat7',
  turnSlots: 4,
  introTutorials: false,
  kit: BEAST_KIT,
  electricArc: true,
  skipArcTutorials: true,
  skipTargetTutorial: true,
  boss: {
    backgroundKey: 'ch1_combat7_background',
    timing: BEAST_TIMING,
    attacks: BEAST_ATTACKS,
    firstPhaseTwoAttack: 'rampant_excavation',
    victoryTitle: '… Victory?',
  },
  boars: [
    { id: 'beast_1', name: 'THE BEAST', turnLabel: 'BEAST', x: 1300, y: 830, height: 600, lungeY: 0 },
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
  | 'combat-start'
  | 'phase-transition'
  | 'cinematic'
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
  | 'arc-wait'
  | 'arc-charge'
  | 'arc-release'
  | 'result';
type DefenseResult = 'failed' | 'blocked' | 'perfect' | 'dodged';

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

const SIDE_TUTORIAL: TutorialMessage[] = [
  {
    title: 'SIDE ATTACKS',
    text: "Some enemies attack from the sides instead of above. Watch where the enemy moves before striking. Press A to defend against attacks from Dexios's left, or D to defend against attacks from his right.",
  },
  {
    title: 'TIMING YOUR DEFENSE',
    text: "Press the correct key early during the enemy's approach to block and reduce damage. Wait until the enemy gets closer for a Perfect Parry, which prevents all damage and lets Dexios counterattack!",
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

const MANA_TUTORIAL: TutorialMessage[] = [
  {
    title: 'MANA',
    text: "Some abilities consume Mana, shown by the blue bar below Dexios's Health. Electric Arc costs 10 Mana, while Triple Lightning is free. Choose your abilities carefully!",
  },
];

const ACTION_COMMAND_TUTORIAL: TutorialMessage[] = [
  {
    title: 'ACTION COMMANDS',
    text: 'Some abilities require precise timing to succeed. For Electric Arc, hold A and D to charge both sides of the attack, then release as the two bars meet. Better timing means greater damage!',
  },
];

const JUMP_TUTORIAL: TutorialMessage[] = [
  {
    title: 'JUMPING TO DODGE',
    text: 'Not every attack can be blocked! Rageboars charge with powerful attacks that Dexios must jump over. Press SPACE as the enemy approaches to avoid taking damage.',
  },
  {
    title: 'WATCH YOUR TIMING',
    text: 'Wait until the Rageboar gets close, then press SPACE to jump over its attack. A successful dodge prevents all damage, but unlike a Perfect Parry, it does not trigger a counterattack.',
  },
];

const DIG_TUTORIAL: TutorialMessage[] = [
  {
    title: 'DEFENDING FROM BELOW',
    text: 'The Beast can now attack from beneath the ground! Watch the underground movement approaching Dexios and press S to defend. A normal block reduces the damage, while a Perfect Parry prevents all damage and lets Dexios counterattack!',
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
  private combatStartShown = false;
  private playerTutorialShown = false;
  private wildBiteStartedAt = 0;
  private attackSide: DefenseSide = 'up';
  private currentAttack?: BossAttack;
  private bossPhase: 1 | 2 = 1;
  private phaseDepleted = false;
  private digTutorialShown = false;
  private digUsed = false;
  private phaseText?: Phaser.GameObjects.Text;
  private fireProjectile?: Phaser.GameObjects.Image;
  private digGraphics?: Phaser.GameObjects.Graphics;
  private finalTriggered = false;
  private cineIndex = 0;
  private cineCount = 0;
  private cineLocked = false;
  private cineObjects: Phaser.GameObjects.GameObject[] = [];
  private cinePrompt?: Phaser.GameObjects.Container;
  private cinePromptLetter?: Phaser.GameObjects.Text;
  private cinePromptCounter?: Phaser.GameObjects.Text;
  private attackCount = 0;
  private sideTutorialShown = false;
  private jumpTutorialShown = false;
  private jumpShadow?: Phaser.GameObjects.Ellipse;
  private jumpHint?: Phaser.GameObjects.Text;
  private jumpTimer?: Phaser.Time.TimerEvent;
  private manaTutorialShown = false;
  private actionTutorialShown = false;
  private pendingAbility: 'triple' | 'arc' = 'triple';
  private heldKeys = new Set<string>();
  private arcStartedAt = 0;
  private arcTarget?: BoarState;
  private arcChargeSound?: Phaser.Sound.BaseSound;
  private arcGraphics?: Phaser.GameObjects.Graphics;
  private arcTexts: Phaser.GameObjects.Text[] = [];
  private dexiosManaBar?: Phaser.GameObjects.Graphics;
  private arcButton?: {
    box: Phaser.GameObjects.Rectangle;
    texts: Phaser.GameObjects.Text[];
  };
  private defenseResult: DefenseResult | null = null;
  private dexiosOriginalX = DEXIOS_START_X;

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    if (key !== 'a' && key !== 'd') {
      return;
    }
    this.heldKeys.delete(key);
    if (this.phase === 'arc-charge') {
      this.releaseArc();
    }
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return;
    }
    const lower = event.key.toLowerCase();
    if (lower === 'p') {
      this.heldKeys.clear();
      this.scene.pause(this.scene.key);
      this.scene.launch(PAUSE_SCENE_KEY, { parentSceneKey: this.scene.key });
      this.scene.bringToTop(PAUSE_SCENE_KEY);
      return;
    }
    if (this.phase === 'cinematic') {
      this.onCinematicKey(lower);
      return;
    }
    if (lower === 'a' || lower === 'd') {
      this.heldKeys.add(lower);
    }
    if (this.phase === 'arc-wait') {
      this.tryBeginArcCharge();
      return;
    }
    if (this.phase === 'arc-charge' || this.phase === 'arc-release') {
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
      this.chooseAbility('triple');
      return;
    }
    if (this.phase === 'player' && event.key === '2' && this.config.electricArc) {
      this.chooseAbility('arc');
      return;
    }
    if (this.phase === 'target-select') {
      if (/^[1-9]$/.test(event.key) && Number(event.key) <= this.boars.length) {
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

  private get kit(): EnemyKit {
    return this.config.kit ?? BOAR_KIT;
  }

  private kitOf(boar: BoarState | BoarSpawn): EnemyKit {
    const spawn = 'spawn' in boar ? boar.spawn : boar;
    return spawn.kit ?? this.kit;
  }

  private get timing(): AttackTiming {
    return this.config.boss?.timing ?? DEFAULT_TIMING;
  }

  private isJumpAttack(): boolean {
    if (this.currentAttack) {
      return this.currentAttack.defense === 'jump';
    }
    return !!this.activeBoar && this.kitOf(this.activeBoar).defense === 'jump';
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
      ['wolf_base', wolfBaseUrl],
      ['rageboar_base', rageboarBaseUrl],
      ['rageboar_prepare', rageboarPrepareUrl],
      ['rageboar_attack', rageboarAttackUrl],
      ['rageboar_hurt', rageboarHurtUrl],
      ['dexios_salto', dexiosJumpUrl],
      ['wolf_prepare_left', wolfPrepareLeftUrl],
      ['wolf_prepare_right', wolfPrepareRightUrl],
      ['wolf_attack_left', wolfAttackLeftUrl],
      ['wolf_attack_right', wolfAttackRightUrl],
      ['wolf_hurt', wolfHurtUrl],
      ['dexios_arc_charging', dexiosArcChargingUrl],
      ['dexios_arc_releasing', dexiosArcReleasingUrl],
    ];
    if (this.config.boss) {
      images.push(
        [this.config.boss.backgroundKey, combat7BackgroundUrl],
        ['beast_base', beastBaseUrl],
        ['beast_hurt', beastHurtUrl],
        ['beast_preparing_up', beastPreparingUpUrl],
        ['beast_attack_up', beastAttackUpUrl],
        ['beast_preparing_left', beastPreparingLeftUrl],
        ['beast_attack_left', beastAttackLeftUrl],
        ['beast_preparing_right', beastPreparingRightUrl],
        ['beast_attack_right', beastAttackRightUrl],
        ['beast_preparing_down', beastPreparingDownUrl],
        ['beast_attack_down', beastAttackDownUrl],
        ['beast_preparing_fire', beastPreparingFireUrl],
        ['beast_attack_fire', beastAttackFireUrl],
        ['beast_fire', beastFireUrl],
        ['ch1_cine_1', cinematic1Url],
        ['ch1_cine_2', cinematic2Url],
        ['ch1_cine_3', cinematic3Url],
        ['ch1_cine_4', cinematic4Url],
        ['ch1_cine_5', cinematic5Url],
        ['ch1_cine_6', cinematic6Url],
        ['ch1_cine_7', cinematic7Url],
        ['ch1_cine_8', cinematic8Url],
      );
    }
    images.forEach(([key, url]) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, url);
      }
    });
    const audio: Array<[string, string]> = [
      ['ch1_battle_music', battleMusicUrl],
      ['ch1_victory_music', this.config.boss?.victoryTitle ? loseMusicUrl : victoryMusicUrl],
      ['boar_prepare_sfx', boarPrepareSfxUrl],
      ['boar_attack_sfx', boarAttackSfxUrl],
      ['boar_hurt_sfx', boarHurtSfxUrl],
      ['wolf_prepare_sfx', wolfPrepareSfxUrl],
      ['wolf_attack_sfx', wolfAttackSfxUrl],
      ['wolf_hurt_sfx', wolfHurtSfxUrl],
      ['electric_arc_charging', arcChargingSfxUrl],
      ['electric_arc_releasing', arcReleasingSfxUrl],
      ['dexios_sfx', dexiosSoundUrl],
      ['perfect_parry_sfx', perfectParrySoundUrl],
      ['flame_sfx', flameSfxUrl],
    ];
    audio.forEach(([key, url]) => {
      if (!this.cache.audio.exists(key)) {
        this.load.audio(key, url);
      }
    });
  }

  create(): void {
    this.phase = 'tutorial';
    this.combatStartShown = false;
    this.dexiosHealth = DEXIOS_MAX_HP;
    this.dexiosMana = 40;
    this.enemyTutorialShown = !this.config.introTutorials;
    this.playerTutorialShown = !this.config.introTutorials;
    this.resultEnter = undefined;
    this.targetTutorialShown = !!this.config.skipTargetTutorial;
    this.manaTutorialShown = !this.config.electricArc || !!this.config.skipArcTutorials;
    this.actionTutorialShown = !this.config.electricArc || !!this.config.skipArcTutorials;
    this.jumpTutorialShown = !this.config.jumpTutorial;
    this.jumpTimer = undefined;
    this.jumpShadow = undefined;
    this.jumpHint = undefined;
    this.pendingAbility = 'triple';
    this.heldKeys.clear();
    this.arcTarget = undefined;
    this.arcChargeSound = undefined;
    this.arcGraphics = undefined;
    this.arcTexts = [];
    this.arcButton = undefined;
    this.dexiosManaBar = undefined;
    this.resetCamera();
    this.sideTutorialShown = !this.config.sideTutorial;
    this.attackCount = 0;
    this.attackSide = 'up';
    this.currentAttack = undefined;
    this.bossPhase = 1;
    this.phaseDepleted = false;
    this.digTutorialShown = false;
    this.digUsed = false;
    this.phaseText = undefined;
    this.fireProjectile = undefined;
    this.digGraphics = undefined;
    this.finalTriggered = false;
    this.cineIndex = 0;
    this.cineCount = 0;
    this.cineLocked = false;
    this.cineObjects = [];
    this.cinePrompt = undefined;
    this.cinePromptLetter = undefined;
    this.cinePromptCounter = undefined;
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
      'wolf_base',
      'rageboar_base',
      'rageboar_prepare',
      'rageboar_attack',
      'rageboar_hurt',
      'dexios_salto',
      'wolf_prepare_left',
      'wolf_prepare_right',
      'wolf_attack_left',
      'wolf_attack_right',
      'wolf_hurt',
      'dexios_arc_charging',
      'dexios_arc_releasing',
      ...(this.config.boss
        ? [
          'beast_base',
          'beast_hurt',
          'beast_preparing_up',
          'beast_attack_up',
          'beast_preparing_left',
          'beast_attack_left',
          'beast_preparing_right',
          'beast_attack_right',
          'beast_preparing_down',
          'beast_attack_down',
          'beast_preparing_fire',
          'beast_attack_fire',
        ]
        : []),
    ]);
    this.createBattlefield();
    this.createCombatants();
    this.createTurnOrder();
    this.createHealthPanels();
    this.createAbilityMenu();
    this.createStatusText();
    this.add.text(WIDTH / 2, HEIGHT - 14, 'P: Pause    N: Music    M: SFX    R: Restart    Esc: Back', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '20px',
      color: '#e1d4e7',
      stroke: '#171326',
      strokeThickness: 4,
    }).setOrigin(0.5, 1).setDepth(60);
    this.createAnnouncements();
    this.timingRing = this.add.graphics().setDepth(20);

    this.battleMusic = this.sound.add('ch1_battle_music', {
      loop: true,
      volume: GAME_CONFIG.audio.music,
    });
    this.unbindMusic = bindPhaserMusic(this.battleMusic);
    this.battleMusic.play();

    this.input.keyboard?.on('keydown', this.onKeyDown, this);
    this.input.keyboard?.on('keyup', this.onKeyUp, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
    this.startEnemyTurn(0);
  }

  update(): void {
    if (this.phase === 'arc-wait' || this.phase === 'arc-charge') {
      this.drawArcChallenge();
      return;
    }
    if (this.phase !== 'enemy-lunge') {
      return;
    }
    const elapsed = this.time.now - this.wildBiteStartedAt;
    if (this.jumpHint?.visible) {
      this.jumpHint.setPosition(this.dexiosOriginalX, GROUND_Y - DEXIOS_HEIGHT - 40);
    }
    const { preparationMs, lungeMs, graceMs } = this.timing;
    if (elapsed < preparationMs || elapsed > preparationMs + lungeMs + graceMs) {
      this.timingRing.clear();
      return;
    }
    const activeElapsed = elapsed - preparationMs;
    const progress = Phaser.Math.Clamp(activeElapsed / (lungeMs + graceMs), 0, 1);
    const color = this.defenseResult === 'perfect'
      || (this.defenseResult === null && elapsed >= preparationMs + lungeMs)
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
    this.background = this.add.image(WIDTH / 2, HEIGHT / 2, this.config.boss?.backgroundKey ?? 'ch1_combat1_background');
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
      .setDepth(12);
    this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
    this.boars = this.config.boars.map((spawn, index) => {
      const kit = this.kitOf(spawn);
      const sprite = this.add.image(spawn.x, spawn.y, kit.base)
        .setOrigin(0.5, 1)
        .setDepth(4);
      this.setSpriteFrame(sprite, kit.base, spawn.height);
      const marker = this.add.graphics().setDepth(6);
      const keyLabel = this.add.text(spawn.x, spawn.y - spawn.height - 78, TARGET_LABELS[index] ?? String(index + 1), {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#fff2c6',
        stroke: '#17121b',
        strokeThickness: 6,
      }).setOrigin(0.5).setDepth(7).setVisible(false);
      const boar: BoarState = {
        spawn,
        health: kit.maxHp,
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
        fontSize: '17px',
        fontStyle: 'bold',
        color: COLORS.cream,
        stroke: '#17121b',
        strokeThickness: 3,
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
      portrait.setTexture(boar ? this.kitOf(boar).base : 'dexios_icono');
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
      const portrait = this.add.image(1290, top + panelHeight / 2, this.kitOf(boar).base).setDepth(51);
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
      const hpText = this.add.text(1800, top + (multiple ? 12 : 18), '20 / 20', {
        fontFamily: EB_GARAMOND_FONT_FAMILY,
        fontSize: '26px',
        fontStyle: 'bold',
        color: COLORS.cream,
        stroke: '#17121b',
        strokeThickness: 3,
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
      fontSize: '24px',
      fontStyle: 'bold',
      color: COLORS.cream,
      stroke: '#17121b',
      strokeThickness: 3,
      align: 'right',
    }).setOrigin(1, 0).setName('dexios-hp-text').setDepth(51);
    if (this.config.electricArc) {
      this.createManaHud();
    }
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
    container.add([panel, heading]);
    if (!this.config.electricArc) {
      this.addAbilityButton(container, 946, 92, 'TRIPLE LIGHTNING', '3 hits  ·  5 damage each  ·  No Mana cost', 31, 24, '', () => this.chooseAbility('triple'));
    } else {
      this.addAbilityButton(container, 915, 66, 'TRIPLE LIGHTNING', '3 hits  ·  5 damage each  ·  No Mana cost', 25, 20, '1', () => this.chooseAbility('triple'));
      this.arcButton = this.addAbilityButton(container, 990, 66, 'ELECTRIC ARC', 'Timing attack  ·  35 / 40 damage  ·  10 Mana', 25, 20, '2', () => this.chooseAbility('arc'));
    }
    this.abilityMenu = container;
  }

  private addAbilityButton(
    container: Phaser.GameObjects.Container,
    y: number,
    height: number,
    name: string,
    description: string,
    nameSize: number,
    detailSize: number,
    keyHint: string,
    action: () => void,
  ): { box: Phaser.GameObjects.Rectangle; texts: Phaser.GameObjects.Text[] } {
    const button = this.add.rectangle(335, y, 520, height, COLORS.panelLight, 1)
      .setStrokeStyle(2, COLORS.gold, 0.9)
      .setInteractive({ useHandCursor: true });
    const compact = keyHint !== '';
    const ability = this.add.text(335, y - (compact ? 12 : 14), name, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: `${nameSize}px`,
      fontStyle: 'bold',
      letterSpacing: 1,
      color: COLORS.cream,
      align: 'center',
    }).setOrigin(0.5);
    const detail = this.add.text(335, y + (compact ? 17 : 26), description, {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: `${detailSize}px`,
      color: '#c4b8db',
      align: 'center',
    }).setOrigin(0.5);
    const texts = [ability, detail];
    if (compact) {
      texts.push(this.add.text(95, y, keyHint, {
        fontFamily: EB_GARAMOND_FONT_FAMILY,
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#f5d47d',
      }).setOrigin(0.5));
    }
    button.on('pointerover', () => button.setFillStyle(0x352c46, 1));
    button.on('pointerout', () => button.setFillStyle(COLORS.panelLight, 1));
    button.on('pointerdown', action);
    container.add([button, ...texts]);
    return { box: button, texts };
  }

  private refreshAbilityMenu(): void {
    if (!this.arcButton) {
      return;
    }
    const enabled = this.dexiosMana >= ELECTRIC_ARC.manaCost;
    this.arcButton.box.setAlpha(enabled ? 1 : 0.4);
    this.arcButton.texts.forEach((text) => text.setAlpha(enabled ? 1 : 0.4));
    this.arcButton.texts[1]?.setText(enabled
      ? 'Timing attack  ·  35 / 40 damage  ·  10 Mana'
      : 'Not enough Mana');
  }

  private createManaHud(): void {
    this.add.text(1650, 952, 'MANA', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#8cc4ff',
    }).setDepth(51);
    this.dexiosManaBar = this.add.graphics().setDepth(51);
    this.add.text(1848, 952, '40 / 40', {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '24px',
      fontStyle: 'bold',
      color: COLORS.cream,
      stroke: '#17121b',
      strokeThickness: 3,
      align: 'right',
    }).setOrigin(1, 0).setName('dexios-mana-text').setDepth(51);
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

  private showCombatStart(done: () => void): void {
    const popup = this.add.text(WIDTH / 2, HEIGHT / 2 - 120, 'COMBAT START', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '110px',
      fontStyle: 'bold',
      letterSpacing: 8,
      color: '#e01b1b',
      stroke: '#17121b',
      strokeThickness: 10,
    }).setOrigin(0.5).setDepth(300);
    this.time.delayedCall(1500, () => {
      popup.destroy();
      done();
    });
  }

  private createAnnouncements(): void {
    const container = this.add.container(0, 0).setDepth(100).setVisible(false);
    const panel = this.add.graphics();
    panel.fillStyle(0x08070b, 0.94).fillRect(0, 476, WIDTH, 128);
    panel.lineStyle(3, COLORS.gold, 0.95).lineBetween(0, 476, WIDTH, 476);
    panel.lineStyle(3, COLORS.gold, 0.95).lineBetween(0, 604, WIDTH, 604);
    const text = this.add.text(WIDTH / 2, 540, '', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '64px',
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
    this.attackSide = 'up';
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
    const kit = this.kitOf(boar);
    if (kit.defense === 'jump' && !this.jumpTutorialShown) {
      this.showTutorial(JUMP_TUTORIAL, () => {
        this.jumpTutorialShown = true;
        this.startEnemyTurn(fromIndex);
      });
      return;
    }
    if (kit.lateral && !this.sideTutorialShown) {
      this.showTutorial(SIDE_TUTORIAL, () => {
        this.sideTutorialShown = true;
        this.startEnemyTurn(fromIndex);
      });
      return;
    }
    if (!this.combatStartShown) {
      this.combatStartShown = true;
      this.phase = 'combat-start';
      this.showCombatStart(() => this.startEnemyTurn(fromIndex));
      return;
    }
    if (this.config.boss && !this.currentAttack) {
      this.currentAttack = this.chooseBossAttack();
    }
    const attack = this.currentAttack;
    if (attack) {
      this.attackSide = attack.side;
      if (attack.kind === 'dig' && !this.digTutorialShown) {
        this.showTutorial(DIG_TUTORIAL, () => {
          this.digTutorialShown = true;
          this.startEnemyTurn(fromIndex);
        });
        return;
      }
    }
    if (kit.lateral && (!attack || attack.kind === 'claw')) {
      this.beginFlank(boar);
      return;
    }
    this.announce(attack?.name ?? kit.attackName, () => this.beginWildBite());
  }

  private chooseBossAttack(): BossAttack {
    const boss = this.config.boss;
    if (!boss) {
      throw new Error('Boss attack requested outside a boss encounter.');
    }
    const available = boss.attacks.filter((attack) => attack.minPhase <= this.bossPhase);
    if (this.bossPhase === 2 && !this.digUsed) {
      const first = available.find((attack) => attack.id === boss.firstPhaseTwoAttack);
      if (first) {
        this.digUsed = true;
        return first;
      }
    }
    const total = available.reduce((sum, attack) => sum + attack.weight, 0);
    let roll = Math.random() * total;
    for (const attack of available) {
      roll -= attack.weight;
      if (roll < 0) {
        return attack;
      }
    }
    return available[available.length - 1];
  }

  private chooseAttackSide(boar: BoarState): AttackSide {
    if (this.currentAttack) {
      return this.currentAttack.side as AttackSide;
    }
    const lateral = this.kitOf(boar).lateral;
    if (!lateral) {
      return 'up';
    }
    const scripted = lateral.firstSides[this.attackCount];
    this.attackCount += 1;
    return scripted ?? (Math.random() < 0.5 ? 'left' : 'right');
  }

  private beginFlank(boar: BoarState): void {
    const lateral = this.kitOf(boar).lateral;
    if (!lateral) {
      return;
    }
    if (!this.sideTutorialShown) {
      this.showTutorial(SIDE_TUTORIAL, () => {
        this.sideTutorialShown = true;
        this.phase = 'enemy-announcement';
        this.beginFlank(boar);
      });
      return;
    }
    this.attackSide = this.chooseAttackSide(boar);
    boar.sprite.setDepth(8);
    this.setStatus(`${this.boars.length > 1 ? '' : 'THE '}${boar.spawn.name} CIRCLES TO DEXIOS'S ${this.attackSide.toUpperCase()}`);
    this.tweens.add({
      targets: boar.sprite,
      x: lateral.flankX[this.attackSide as 'left' | 'right'],
      y: boar.spawn.y,
      duration: lateral.flankMs,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (this.phase === 'enemy-announcement') {
          this.announce(this.currentAttack?.name ?? this.kitOf(boar).attackName, () => this.beginWildBite());
        }
      },
    });
  }

  private beginWildBite(): void {
    const boar = this.activeBoar;
    if (this.phase !== 'enemy-announcement' || !boar) {
      return;
    }
    const kit = this.kitOf(boar);
    this.phase = 'enemy-prepare';
    this.defenseResult = null;
    this.wildBiteStartedAt = this.time.now;
    boar.sprite.setDepth(8);
    const attack = this.currentAttack;
    if (attack) {
      this.setSpriteFrame(boar.sprite, attack.prepareSprite, boar.spawn.height);
      if (attack.prepareSfx) {
        this.playEffect(attack.prepareSfx);
      }
      this.setStatus(attack.prepareText);
    } else {
      this.setSpriteFrame(boar.sprite, kit.prepare[this.attackSide as AttackSide], boar.spawn.height);
      this.playEffect(kit.sfx.prepare);
      this.setStatus(this.boars.length > 1
        ? `${boar.spawn.name} PREPARES TO CHARGE`
        : kit.prepareText);
    }
    const lateral = kit.lateral;
    const nudge = this.attackSide === 'left' ? 40 : -40;
    let prepX = lateral ? boar.sprite.x + nudge : boar.spawn.x - 40;
    if (attack) {
      prepX = attack.kind === 'leap'
        ? boar.spawn.x - 40
        : attack.kind === 'claw' ? boar.sprite.x + nudge : boar.sprite.x;
    }
    this.tweens.add({
      targets: boar.sprite,
      x: prepX,
      duration: this.timing.preparationMs,
      ease: 'Sine.easeOut',
      onComplete: () => this.beginBoarLunge(),
    });
  }

  private beginBoarLunge(): void {
    const boar = this.activeBoar;
    if (this.phase !== 'enemy-prepare' || !boar) {
      return;
    }
    const kit = this.kitOf(boar);
    const jump = this.isJumpAttack();
    const timing = this.timing;
    this.phase = 'enemy-lunge';
    if (this.currentAttack) {
      this.beginBossMotion(boar, this.currentAttack);
      return;
    }
    this.setSpriteFrame(boar.sprite, kit.attack[this.attackSide as AttackSide], boar.spawn.height);
    this.playEffect(kit.sfx.attack);
    const lateral = kit.lateral;
    const targetX = jump
      ? this.dexiosOriginalX + JUMP_DODGE.chargeEndOffset
      : !lateral
        ? this.dexiosOriginalX + 250
        : this.dexiosOriginalX + (this.attackSide === 'left' ? -lateral.lungeOffset : lateral.lungeOffset);
    this.setStatus(jump
      ? `${kit.attackName} · PRESS SPACE TO JUMP`
      : `${kit.attackName} · BLOCK WITH ${SIDE_KEYS[this.attackSide].label}, THEN PARRY`);
    this.showJumpHint(jump);
    // Plain boars leap up into Dexios's face instead of charging along the ground.
    const leapsAtFace = !jump && !lateral;
    this.tweens.add({
      targets: boar.sprite,
      x: targetX,
      y: boar.spawn.y + boar.spawn.lungeY - (leapsAtFace ? BOAR_LEAP_HEIGHT : 0),
      duration: timing.lungeMs,
      ease: leapsAtFace ? 'Sine.easeOut' : 'Linear',
    });
    this.scheduleImpact(jump);
  }

  private scheduleImpact(jump: boolean, onImpact?: () => void): void {
    const { lungeMs, graceMs } = this.timing;
    this.time.delayedCall(lungeMs, () => {
      if (this.phase !== 'enemy-lunge') {
        return;
      }
      this.cameras.main.shake(100, 0.0012);
      onImpact?.();
      this.setStatus(jump ? 'IMPACT · JUMP NOW!' : 'IMPACT · PERFECT PARRY STILL AVAILABLE');
    });
    this.time.delayedCall(lungeMs + graceMs, () => this.resolveWildBite());
  }

  private beginBossMotion(boar: BoarState, attack: BossAttack): void {
    const { lungeMs } = this.timing;
    const jump = attack.defense === 'jump';
    const lateral = this.kitOf(boar).lateral;
    this.setSpriteFrame(
      boar.sprite,
      attack.attackSprite,
      attack.kind === 'dig' ? boar.spawn.height * 0.5 : boar.spawn.height,
    );
    this.playEffect(attack.attackSfx);
    this.setStatus(jump
      ? `${attack.name} · PRESS SPACE TO JUMP`
      : `${attack.name} · BLOCK WITH ${SIDE_KEYS[this.attackSide].label}, THEN PARRY`);
    this.showJumpHint(jump);
    const dexiosX = this.dexiosOriginalX;
    let onImpact: (() => void) | undefined;
    if (attack.kind === 'leap') {
      const startX = boar.sprite.x;
      const startY = boar.sprite.y;
      const endX = dexiosX + BEAST_MOTION.leapEndOffsetX;
      const endY = boar.spawn.y - BEAST_MOTION.leapEndOffsetY;
      boar.sprite.setDepth(14);
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: lungeMs,
        onUpdate: (tween) => {
          const t = tween.getValue() ?? 0;
          boar.sprite.setPosition(
            Phaser.Math.Linear(startX, endX, t),
            Phaser.Math.Linear(startY, endY, t) - 4 * BEAST_MOTION.leapApex * t * (1 - t),
          );
        },
      });
    } else if (attack.kind === 'claw' && lateral) {
      boar.sprite.setDepth(8);
      this.tweens.add({
        targets: boar.sprite,
        x: dexiosX + (this.attackSide === 'left' ? -lateral.lungeOffset : lateral.lungeOffset),
        duration: lungeMs,
        ease: 'Linear',
      });
    } else if (attack.kind === 'fire') {
      this.launchFire(boar);
    } else if (attack.kind === 'dig') {
      onImpact = this.startDig(boar);
    }
    this.scheduleImpact(jump, onImpact);
  }

  private launchFire(boar: BoarState): void {
    const sprite = boar.sprite;
    const mouthX = sprite.x - sprite.displayWidth * (sprite.originX - BEAST_MOTION.fireOriginX);
    const mouthY = sprite.y - sprite.displayHeight * (sprite.originY - BEAST_MOTION.fireOriginY);
    const fire = this.add.image(mouthX, mouthY, 'beast_fire').setBlendMode(Phaser.BlendModes.ADD).setDepth(15);
    fire.setScale(BEAST_MOTION.fireHeight / fire.height);
    this.fireProjectile = fire;
    const targetX = this.dexiosOriginalX;
    const targetY = GROUND_Y - BEAST_MOTION.fireTargetOffsetY;
    const travel = this.timing.lungeMs;
    this.tweens.add({
      targets: fire,
      x: mouthX + (targetX - mouthX) * 1.25,
      y: mouthY + (targetY - mouthY) * 1.25,
      duration: travel * 1.25,
      ease: 'Linear',
    });
  }

  // Returns the impact callback that makes the spikes erupt under Dexios.
  private startDig(boar: BoarState): () => void {
    const gfx = this.add.graphics().setDepth(5);
    this.digGraphics = gfx;
    boar.sprite.setDepth(8);
    this.tweens.add({
      targets: boar.sprite,
      x: this.dexiosOriginalX + 330,
      duration: this.timing.lungeMs,
      ease: 'Linear',
    });
    const startX = boar.sprite.x;
    const endX = this.dexiosOriginalX + BEAST_MOTION.digOffsetX;
    const y = GROUND_Y - 10;
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: this.timing.lungeMs,
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        const x = Phaser.Math.Linear(startX, endX, t);
        gfx.clear();
        gfx.lineStyle(4, 0x2a1038, 0.9);
        gfx.beginPath();
        gfx.moveTo(startX, y);
        gfx.lineTo(x, y);
        gfx.strokePath();
        gfx.fillStyle(0x6b3a86, 0.9).fillEllipse(x, y - 14, 120, 40);
        gfx.fillStyle(0x3a2048, 0.9).fillEllipse(x, y - 4, 150, 24);
      },
    });
    return () => {
      gfx.clear();
      const dx = this.dexios.x;
      for (let i = -2; i <= 2; i += 1) {
        const h = 150 - Math.abs(i) * 28;
        gfx.fillStyle(0xb04cff, 0.95).fillTriangle(
          dx + i * 46 - 22, GROUND_Y, dx + i * 46 + 22, GROUND_Y, dx + i * 46, GROUND_Y - h,
        );
      }
      gfx.setDepth(11);
    };
  }

  private endInVictory(): void {
    if (this.config.boss?.victoryTitle) {
      this.beginFinalSequence();
      return;
    }
    this.finishBattle('victory');
  }

  private beginFinalSequence(): void {
    const boar = this.boars[0];
    if (this.finalTriggered || !boar) {
      return;
    }
    this.finalTriggered = true;
    this.phase = 'cinematic';
    this.heldKeys.clear();
    this.abilityMenu?.setVisible(false);
    this.timingRing.clear();
    this.clearBossEffects();
    this.jumpHint?.setVisible(false);
    this.jumpShadow?.setVisible(false);
    this.dexios.setPosition(this.dexiosOriginalX, GROUND_Y);
    this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
    boar.sprite.setAlpha(1).setDepth(8);
    this.setSpriteFrame(boar.sprite, this.kitOf(boar).base, boar.spawn.height);
    this.tweens.add({
      targets: boar.sprite,
      x: boar.spawn.x,
      y: boar.spawn.y,
      duration: 360,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.setSpriteFrame(boar.sprite, 'beast_preparing_up', boar.spawn.height);
        this.playEffect('boar_prepare_sfx');
        this.setStatus('');
        this.tweens.add({
          targets: boar.sprite,
          x: boar.spawn.x - 40,
          duration: this.timing.preparationMs,
          ease: 'Sine.easeOut',
          onComplete: () => this.finalLeap(boar),
        });
      },
    });
  }

  private finalLeap(boar: BoarState): void {
    this.setSpriteFrame(boar.sprite, 'beast_attack_up', boar.spawn.height);
    this.playEffect('boar_attack_sfx');
    boar.sprite.setDepth(14);
    const startX = boar.sprite.x;
    const startY = boar.sprite.y;
    const endX = this.dexiosOriginalX + BEAST_MOTION.leapEndOffsetX;
    const endY = boar.spawn.y - BEAST_MOTION.leapEndOffsetY;
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: CINEMATIC.finalApproachMs,
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        boar.sprite.setPosition(
          Phaser.Math.Linear(startX, endX, t),
          Phaser.Math.Linear(startY, endY, t) - 4 * BEAST_MOTION.leapApex * t * (1 - t),
        );
      },
      onComplete: () => this.showCinematicFrame(0),
    });
  }

  private showCinematicFrame(index: number): void {
    if (this.phase !== 'cinematic') {
      return;
    }
    const frame = CINEMATIC_FRAMES[index];
    this.cineIndex = index;
    this.cineCount = 0;
    this.cineLocked = false;
    this.clearCinematicFrame();
    const key = `ch1_cine_${index + 1}`;
    const bg = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH * 1.2, HEIGHT * 1.2, 0x000000, 1).setDepth(1000);
    const image = this.add.image(WIDTH / 2, HEIGHT / 2, key).setDepth(1001);
    const source = image.texture.getSourceImage() as HTMLImageElement;
    image.setScale(Math.min(WIDTH / source.width, HEIGHT / source.height));
    const legend = this.add.text(WIDTH / 2, HEIGHT - 14, 'P: Pause    N: Music    M: SFX    R: Restart    Esc: Back', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '20px',
      color: '#e1d4e7',
      stroke: '#171326',
      strokeThickness: 4,
    }).setOrigin(0.5, 1).setDepth(1004);
    this.cineObjects.push(bg, image, legend);
    if (frame.dialogue) {
      const panel = this.add.graphics().setDepth(1002);
      panel.fillStyle(0x000000, 0.9).fillRoundedRect(120, 880, WIDTH - 240, 140, 10);
      panel.lineStyle(3, COLORS.gold, 1).strokeRoundedRect(120, 880, WIDTH - 240, 140, 10);
      const text = this.add.text(WIDTH / 2, 950, frame.dialogue, {
        fontFamily: EB_GARAMOND_FONT_FAMILY,
        fontSize: '48px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: WIDTH - 340 },
      }).setOrigin(0.5).setDepth(1003);
      this.cineObjects.push(panel, text);
    }
    if (frame.shakeOnEntry) {
      this.shakeCinematic();
    }
    if (frame.autoMs) {
      this.cineLocked = true;
      this.time.delayedCall(frame.autoMs, () => this.advanceCinematic());
      return;
    }
    if (frame.sequence) {
      this.createCinematicPrompt(frame);
    }
  }

  private createCinematicPrompt(frame: CinematicFrame): void {
    const sequence = frame.sequence ?? [];
    const y = frame.dialogue ? 760 : 900;
    const box = this.add.graphics();
    box.fillStyle(0x17121b, 0.92).fillRoundedRect(-75, -75, 150, 150, 16);
    box.lineStyle(5, COLORS.gold, 1).strokeRoundedRect(-75, -75, 150, 150, 16);
    const letter = this.add.text(0, -4, sequence[0].toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '104px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const items: Phaser.GameObjects.GameObject[] = [box, letter];
    if (sequence.length > 1) {
      const counter = this.add.text(0, 112, `0/${sequence.length}`, {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#17121b',
        strokeThickness: 6,
      }).setOrigin(0.5);
      this.cinePromptCounter = counter;
      items.push(counter);
    }
    this.cinePrompt = this.add.container(WIDTH / 2, y, items).setDepth(1005);
    this.cinePromptLetter = letter;
  }

  private onCinematicKey(key: string): void {
    const frame = CINEMATIC_FRAMES[this.cineIndex];
    const sequence = frame?.sequence;
    if (!sequence || this.cineLocked || key !== sequence[this.cineCount]) {
      return;
    }
    this.cineCount += 1;
    if (frame.shakeOnPress) {
      this.shakeCinematic();
    }
    if (this.cinePrompt) {
      this.tweens.add({
        targets: this.cinePrompt,
        scale: 1.25,
        duration: 90,
        yoyo: true,
      });
    }
    this.cinePromptCounter?.setText(`${this.cineCount}/${sequence.length}`);
    if (this.cineCount < sequence.length) {
      this.cinePromptLetter?.setText(sequence[this.cineCount].toUpperCase());
      return;
    }
    this.cineLocked = true;
    this.time.delayedCall(CINEMATIC.advanceDelayMs, () => {
      this.cinePrompt?.setVisible(false);
      this.advanceCinematic();
    });
  }

  private advanceCinematic(): void {
    if (this.phase !== 'cinematic') {
      return;
    }
    if (this.cineIndex + 1 < CINEMATIC_FRAMES.length) {
      this.showCinematicFrame(this.cineIndex + 1);
      return;
    }
    this.clearCinematicFrame();
    this.cameras.main.resetFX();
    this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
    this.finishBattle('victory');
  }

  private shakeCinematic(): void {
    this.cameras.main.shake(CINEMATIC.shakeMs, CINEMATIC.shakeIntensity);
  }

  private clearCinematicFrame(): void {
    this.cineObjects.forEach((object) => object.destroy());
    this.cineObjects = [];
    if (this.cinePrompt) {
      this.tweens.killTweensOf(this.cinePrompt);
      this.cinePrompt.destroy();
    }
    this.cinePrompt = undefined;
    this.cinePromptLetter = undefined;
    this.cinePromptCounter = undefined;
  }

  private clearBossEffects(): void {
    this.fireProjectile?.destroy();
    this.fireProjectile = undefined;
    this.digGraphics?.destroy();
    this.digGraphics = undefined;
  }

  private beginPhaseTransition(): void {
    const boar = this.boars[0];
    this.phase = 'phase-transition';
    this.phaseDepleted = false;
    this.clearBossEffects();
    this.cameras.main.flash(500, 176, 76, 255);
    this.cameras.main.shake(400, 0.004);
    this.setStatus('THE BEAST ENRAGES');
    this.time.delayedCall(1500, () => {
      if (this.phase !== 'phase-transition') {
        return;
      }
      this.bossPhase = 2;
      boar.health = this.kitOf(boar).maxHp;
      boar.alive = true;
      boar.sprite.setAlpha(1);
      this.setSpriteFrame(boar.sprite, this.kitOf(boar).base, boar.spawn.height);
      this.phaseText?.setText('PHASE 2');
      this.updateHealthBars();
      this.startEnemyTurn(0);
    });
  }

  private showJumpHint(visible: boolean): void {
    if (!this.jumpHint) {
      this.jumpHint = this.add.text(0, 0, 'SPACE', {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '34px',
        fontStyle: 'bold',
        letterSpacing: 4,
        color: '#ffd65c',
        stroke: '#17121b',
        strokeThickness: 6,
      }).setOrigin(0.5).setDepth(21);
    }
    this.jumpHint.setVisible(visible);
  }

  private registerJumpInput(key: string): void {
    if (this.defenseResult !== null || key !== ' ') {
      return;
    }
    const elapsed = this.time.now - this.wildBiteStartedAt;
    if (elapsed < this.timing.jumpFromMs || elapsed > this.timing.preparationMs + this.timing.lungeMs + this.timing.graceMs) {
      return;
    }
    this.defenseResult = 'dodged';
    this.setStatus('DODGE');
    // Time the take-off so Dexios is at the top of the jump when the charge passes under him.
    const peakAt = this.timing.preparationMs + this.timing.lungeMs;
    const startAt = Math.max(elapsed, peakAt - JUMP_DODGE.airMs / 2);
    this.jumpTimer = this.time.delayedCall(startAt - elapsed, () => this.performJump());
  }

  private performJump(): void {
    this.setSpriteFrame(this.dexios, 'dexios_salto', DEXIOS_HEIGHT);
    if (!this.jumpShadow) {
      this.jumpShadow = this.add.ellipse(0, GROUND_Y - 6, 260, 34, 0x000000, 0.4).setDepth(11);
    }
    this.jumpShadow.setPosition(this.dexios.x, GROUND_Y - 6).setVisible(true);
    this.tweens.add({
      targets: this.dexios,
      y: GROUND_Y - JUMP_DODGE.height,
      duration: JUMP_DODGE.airMs / 2,
      ease: 'Sine.easeOut',
      yoyo: true,
      onComplete: () => {
        this.dexios.setY(GROUND_Y);
        this.jumpShadow?.setVisible(false);
      },
    });
  }

  private registerWildBiteInput(key: string): void {
    if (this.defenseResult !== null) {
      return;
    }
    if (this.isJumpAttack()) {
      this.registerJumpInput(key);
      return;
    }
    const direction = key.toLowerCase();
    if (!['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(direction)) {
      return;
    }
    const elapsed = this.time.now - this.wildBiteStartedAt;
    const { preparationMs, lungeMs, graceMs, blockMs } = this.timing;
    if (elapsed < preparationMs || elapsed > preparationMs + lungeMs + graceMs) {
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
    const correct = SIDE_KEYS[this.attackSide];
    this.defenseResult = direction === correct.key || direction === correct.arrow
      ? elapsed < preparationMs + blockMs ? 'blocked' : 'perfect'
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
    const defendSprite = SIDE_KEYS[this.attackSide].sprite;
    const attackerKit = this.activeBoar ? this.kitOf(this.activeBoar) : this.kit;
    const { failed, blocked } = attackerKit.damage;
    if (result === 'dodged') {
      this.setStatus('DODGE · NO DAMAGE');
    } else if (result === 'failed') {
      this.dexiosHealth = Math.max(0, this.dexiosHealth - failed);
      this.setSpriteFrame(this.dexios, 'dexios_herido', DEXIOS_HEIGHT);
      this.setStatus(`FAIL · DEXIOS TAKES ${failed} DAMAGE`);
    } else if (result === 'blocked') {
      this.dexiosHealth = Math.max(0, this.dexiosHealth - blocked);
      this.setSpriteFrame(this.dexios, defendSprite, DEXIOS_HEIGHT);
      this.setStatus(`BLOCK · DEXIOS TAKES ${blocked} DAMAGE`);
    } else {
      this.setSpriteFrame(this.dexios, defendSprite, DEXIOS_HEIGHT);
      this.playEffect('perfect_parry_sfx');
      const attacker = this.activeBoar;
      if (attacker?.alive) {
        this.damageBoar(attacker, attackerKit.counter);
        this.playEffect(attackerKit.sfx.hurt);
        this.setStatus(`PERFECT PARRY · COUNTERATTACK FOR ${attackerKit.counter}`);
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
        this.endInVictory();
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
      this.setSpriteFrame(attacker.sprite, this.kitOf(attacker).base, attacker.spawn.height);
    } else {
      this.markDefeated(attacker);
    }
    this.jumpTimer?.remove(false);
    this.jumpTimer = undefined;
    this.jumpHint?.setVisible(false);
    this.jumpShadow?.setVisible(false);
    this.dexios.setY(GROUND_Y);
    this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
    this.clearBossEffects();
    this.currentAttack = undefined;
    if (this.phaseDepleted) {
      this.beginPhaseTransition();
      return;
    }
    this.startEnemyTurn(this.boars.indexOf(attacker) + 1);
  }

  private markDefeated(boar: BoarState): void {
    this.setSpriteFrame(boar.sprite, this.kitOf(boar).hurt, boar.spawn.height);
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
    } else if (!this.manaTutorialShown) {
      this.showTutorial(MANA_TUTORIAL, () => {
        this.manaTutorialShown = true;
        this.phase = 'player';
        this.showAbilityMenu();
      });
    } else {
      this.showAbilityMenu();
    }
  }

  private showAbilityMenu(): void {
    if (this.phase === 'player') {
      this.refreshAbilityMenu();
      this.abilityMenu?.setVisible(true);
    }
  }

  private chooseAbility(ability: 'triple' | 'arc'): void {
    if (this.phase !== 'player') {
      return;
    }
    if (ability === 'arc' && this.dexiosMana < ELECTRIC_ARC.manaCost) {
      this.setStatus('NOT ENOUGH MANA');
      return;
    }
    this.pendingAbility = ability;
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
    this.setStatus(this.boars.length > 2 ? 'CHOOSE A TARGET · PRESS 1, 2 OR 3' : 'CHOOSE A TARGET · PRESS 1 OR 2');
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
    if (this.pendingAbility === 'arc') {
      this.dexiosMana = Math.max(0, this.dexiosMana - ELECTRIC_ARC.manaCost);
      this.updateHealthBars();
      this.announce('ELECTRIC ARC', () => {
        if (this.phase !== 'player-announcement') {
          return;
        }
        if (this.actionTutorialShown) {
          this.beginArcWait(target);
          return;
        }
        this.showTutorial(ACTION_COMMAND_TUTORIAL, () => {
          this.actionTutorialShown = true;
          this.beginArcWait(target);
        });
      });
      return;
    }
    this.announce('TRIPLE LIGHTNING', () => this.beginTripleLightning(target));
  }

  private beginArcWait(target: BoarState): void {
    this.arcTarget = target;
    this.phase = 'arc-wait';
    this.setStatus('HOLD A + D');
    this.arcUiVisible(true);
    this.tryBeginArcCharge();
  }

  private tryBeginArcCharge(): void {
    if (this.phase !== 'arc-wait' || !this.heldKeys.has('a') || !this.heldKeys.has('d')) {
      return;
    }
    this.phase = 'arc-charge';
    this.arcStartedAt = this.time.now;
    this.setSpriteFrame(this.dexios, 'dexios_arc_charging', ELECTRIC_ARC.spriteHeight);
    this.setStatus('RELEASE AT THE INTERSECTION!');
    this.stopArcChargeSound();
    this.arcChargeSound = this.sound.add('electric_arc_charging', {
      volume: audioSettings.effectsMuted ? 0 : GAME_CONFIG.audio.effects,
    });
    this.arcChargeSound.play();
    const camera = this.cameras.main;
    camera.zoomTo(ELECTRIC_ARC.zoom, ELECTRIC_ARC.cameraMs);
    camera.pan(ELECTRIC_ARC.zoomCenterX, ELECTRIC_ARC.zoomCenterY, ELECTRIC_ARC.cameraMs);
  }

  private releaseArc(): void {
    if (this.phase !== 'arc-charge') {
      return;
    }
    const elapsed = this.time.now - this.arcStartedAt;
    const target = this.arcTarget;
    this.phase = 'arc-release';
    this.stopArcChargeSound();
    this.arcUiVisible(false);
    this.resetCamera(true);
    let damage = 0;
    let label = 'FAIL';
    if (elapsed >= ELECTRIC_ARC.perfectFromMs && elapsed <= ELECTRIC_ARC.perfectUntilMs) {
      damage = ELECTRIC_ARC.perfectDamage;
      label = 'PERFECT';
    } else if (elapsed >= ELECTRIC_ARC.normalFromMs && elapsed < ELECTRIC_ARC.perfectFromMs) {
      damage = ELECTRIC_ARC.normalDamage;
      label = 'NORMAL';
    }
    this.setStatus(label);
    if (!target || damage === 0) {
      this.announce('FAIL', () => this.finishArcFail());
      return;
    }
    this.announce(label, () => this.performArcRelease(target, damage));
  }

  private finishArcFail(): void {
    if (this.phase !== 'arc-release') {
      return;
    }
    this.heldKeys.clear();
    this.selectedBoar = undefined;
    this.arcTarget = undefined;
    this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
    this.startEnemyTurn(0);
  }

  private performArcRelease(target: BoarState, damage: number): void {
    if (this.phase !== 'arc-release') {
      return;
    }
    this.heldKeys.clear();
    this.setSpriteFrame(this.dexios, 'dexios_arc_releasing', ELECTRIC_ARC.releasingHeight);
    this.tweens.add({
      targets: this.dexios,
      x: target.spawn.x - ELECTRIC_ARC.approachGap,
      duration: ELECTRIC_ARC.approachMs,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (this.phase !== 'arc-release') {
          return;
        }
        this.playEffect('electric_arc_releasing');
        this.damageBoar(target, damage);
        this.playEffect(this.kitOf(target).sfx.hurt);
        this.cameras.main.shake(160, 0.004);
        this.cameras.main.flash(120, 255, 255, 255);
        this.time.delayedCall(ELECTRIC_ARC.releaseHoldMs, () => {
          if (this.phase !== 'arc-release') {
            return;
          }
          this.arcTarget = undefined;
          this.setSpriteFrame(this.dexios, 'dexios_base', DEXIOS_HEIGHT);
          this.returnDexiosToPosition(target);
        });
      },
    });
  }

  private stopArcChargeSound(): void {
    this.arcChargeSound?.stop();
    this.arcChargeSound?.destroy();
    this.arcChargeSound = undefined;
  }

  private resetCamera(smooth = false): void {
    const camera = this.cameras.main;
    if (smooth) {
      camera.zoomTo(1, ELECTRIC_ARC.cameraMs);
      camera.pan(WIDTH / 2, HEIGHT / 2, ELECTRIC_ARC.cameraMs);
      return;
    }
    camera.zoomEffect.reset();
    camera.panEffect.reset();
    camera.setZoom(1);
    camera.centerOn(WIDTH / 2, HEIGHT / 2);
  }

  private arcUiVisible(visible: boolean): void {
    if (!visible) {
      this.arcGraphics?.clear();
      this.arcGraphics?.setVisible(false);
      this.arcTexts.forEach((text) => text.setVisible(false));
      return;
    }
    if (!this.arcGraphics) {
      this.arcGraphics = this.add.graphics().setDepth(70);
      const style = {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#f5d47d',
        stroke: '#000000',
        strokeThickness: 5,
      };
      const { origin, apex } = ELECTRIC_ARC;
      this.arcTexts = [
        this.add.text(apex.x, apex.y - 90, '', { ...style, fontSize: '34px' }).setOrigin(0.5).setDepth(71),
        this.add.text(origin.x - 380, origin.y + 26, 'A', style).setOrigin(0.5).setDepth(71),
        this.add.text(origin.x + 380, origin.y + 26, 'D', style).setOrigin(0.5).setDepth(71),
      ];
    }
    this.arcGraphics.setVisible(true);
    this.arcTexts.forEach((text) => text.setVisible(true));
  }

  private drawArcChallenge(): void {
    const graphics = this.arcGraphics;
    if (!graphics) {
      return;
    }
    const charging = this.phase === 'arc-charge';
    const elapsed = charging ? this.time.now - this.arcStartedAt : 0;
    if (charging && elapsed > ELECTRIC_ARC.perfectUntilMs) {
      this.releaseArc();
      return;
    }
    const { origin, apex } = ELECTRIC_ARC;
    const progress = Math.min(1, elapsed / ELECTRIC_ARC.chargeMs);
    const hot = charging && elapsed >= ELECTRIC_ARC.perfectFromMs;
    const color = hot ? 0xffffff : 0xf5d47d;
    graphics.clear();
    this.arcTexts[0]?.setText(charging ? 'RELEASE AT THE INTERSECTION!' : 'HOLD A + D');
    [-380, 380].forEach((offset) => {
      const startX = origin.x + offset;
      graphics.lineStyle(6, 0x5a4d7a, 0.7).lineBetween(startX, origin.y, apex.x, apex.y);
      if (charging) {
        const x = startX + (apex.x - startX) * progress;
        const y = origin.y + (apex.y - origin.y) * progress;
        graphics.lineStyle(10, color, 1).lineBetween(startX, origin.y, x, y);
      }
    });
    graphics.lineStyle(5, color, 1).strokeCircle(apex.x, apex.y, 26);
    if (charging && elapsed >= ELECTRIC_ARC.chargeMs) {
      graphics.fillStyle(0xffffff, 0.5).fillCircle(apex.x, apex.y, 40);
    }
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
      this.playEffect(this.kitOf(target).sfx.hurt);
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
        if (this.phaseDepleted) {
          this.beginPhaseTransition();
          return;
        }
        if (!this.boars.some((boar) => boar.alive)) {
          this.endInVictory();
          return;
        }
        this.boars.forEach((boar) => {
          if (boar.alive) {
            this.setSpriteFrame(boar.sprite, this.kitOf(boar).base, boar.spawn.height);
          } else if (boar === target) {
            this.markDefeated(boar);
          }
        });
        this.startEnemyTurn(0);
      },
    });
  }

  private damageBoar(boar: BoarState, damage: number): void {
    if (!boar.alive || this.phaseDepleted) {
      return;
    }
    boar.health = Math.max(0, boar.health - damage);
    boar.alive = boar.health > 0;
    if (!boar.alive && this.config.boss && this.bossPhase === 1) {
      boar.alive = true;
      this.phaseDepleted = true;
    }
    this.updateHealthBars();
    this.setSpriteFrame(boar.sprite, this.kitOf(boar).hurt, boar.spawn.height);
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
      this.drawHealthBar(hud.hpBar, 1350, hud.top + (hud.height < 110 ? 66 : 63), 500, boar.health, this.kitOf(boar).maxHp, this.config.boss ? 0xb04cff : undefined);
      hud.hpText.setText(`${boar.health} / ${this.kitOf(boar).maxHp}`);
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
    if (this.dexiosManaBar) {
      const mana = Phaser.Math.Clamp(this.dexiosMana, 0, ELECTRIC_ARC.maxMana);
      this.dexiosManaBar.clear();
      this.dexiosManaBar.fillStyle(0x383242, 1).fillRoundedRect(1650, 982, 190, 18, 8);
      if (mana > 0) {
        this.dexiosManaBar.fillStyle(0x4aa3ff, 1)
          .fillRoundedRect(1650, 982, 190 * (mana / ELECTRIC_ARC.maxMana), 18, 8);
      }
      this.dexiosManaBar.lineStyle(1, 0xffffff, 0.25).strokeRoundedRect(1650, 982, 190, 18, 8);
      const manaText = this.children.getByName('dexios-mana-text') as Phaser.GameObjects.Text | null;
      manaText?.setText(`${mana} / ${ELECTRIC_ARC.maxMana}`);
    }
  }

  private drawHealthBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    current: number,
    maximum: number,
    fill?: number,
  ): void {
    graphics.clear();
    graphics.fillStyle(0x383242, 1).fillRoundedRect(x, y, width, 18, 8);
    const ratio = Phaser.Math.Clamp(current / maximum, 0, 1);
    if (current > 0) {
      graphics.fillStyle(fill ?? (ratio > 0.25 ? COLORS.green : COLORS.red), 1)
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
    this.clearBossEffects();
    this.stopArcChargeSound();
    this.arcUiVisible(false);
    this.battleMusic?.stop();
    if (result === 'victory') {
      try {
        this.victoryMusic = this.sound.add('ch1_victory_music', { volume: GAME_CONFIG.audio.music });
        this.unbindVictoryMusic = bindPhaserMusic(this.victoryMusic);
        this.victoryMusic.play();
      } catch {
        // A music failure must never block the victory popup.
      }
    }
    const finalTitle = result === 'victory' ? this.config.boss?.victoryTitle : undefined;
    if (finalTitle) {
      const backdrop = this.add.image(WIDTH / 2, HEIGHT / 2, 'ch1_cine_8').setDepth(149);
      const source = backdrop.texture.getSourceImage() as HTMLImageElement;
      backdrop.setScale(Math.max(WIDTH / source.width, HEIGHT / source.height));
    }
    const overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, finalTitle ? 0.2 : 0.72)
      .setOrigin(0)
      .setDepth(150)
      .setInteractive();
    const panel = this.add.graphics().setDepth(151);
    panel.fillStyle(COLORS.panel, 0.98).fillRoundedRect(500, 300, 920, 480, 14);
    panel.lineStyle(4, COLORS.gold, 1).strokeRoundedRect(500, 300, 920, 480, 14);
    this.add.text(WIDTH / 2, 400, result === 'victory' ? finalTitle ?? 'VICTORY' : 'DEFEAT', {
      fontFamily: finalTitle ? EB_GARAMOND_FONT_FAMILY : GAME_FONT_FAMILY,
      fontSize: finalTitle ? '96px' : '68px',
      fontStyle: 'bold',
      letterSpacing: finalTitle ? 2 : 6,
      color: result === 'victory' ? '#f5d47d' : '#ff8585',
      stroke: '#17121b',
      strokeThickness: finalTitle ? 8 : 0,
      align: 'center',
    }).setOrigin(0.5).setDepth(152);
    const next = result === 'victory' ? this.config.nextSceneKey : undefined;
    const primary = result === 'victory'
      ? next
        ? { label: 'NEXT COMBAT', action: () => this.goToScene(next) }
        : this.config.boss ? { label: 'RETRY', action: () => this.restart() } : undefined
      : { label: 'RETRY', action: () => this.restart() };
    this.resultEnter = primary?.action;
    this.createResultButton(primary ? 780 : 960, 565, 'COMBAT SELECT', 'ESCAPE', () => this.returnToSelector());
    if (primary) {
      this.createResultButton(1150, 565, primary.label, 'ENTER', primary.action);
    }
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
    const text = this.add.text(x, y + 16, label, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '23px',
      fontStyle: 'bold',
      letterSpacing: 1,
      color: COLORS.cream,
      align: 'center',
      wordWrap: { width: 290 },
    }).setOrigin(0.5).setDepth(153);
    const keyLabel = this.add.text(x, y - 22, key, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '22px',
      fontStyle: 'bold',
      letterSpacing: 3,
      color: '#f5d47d',
    }).setOrigin(0.5).setDepth(153);
    keyLabel.setInteractive({ useHandCursor: true }).on('pointerdown', action);
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
    this.input.keyboard?.off('keyup', this.onKeyUp, this);
    this.stopArcChargeSound();
    this.clearBossEffects();
    this.jumpTimer?.remove(false);
    this.jumpTimer = undefined;
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
