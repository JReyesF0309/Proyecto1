import arena from '../assets/backgrounds/escenario.png';
import hippoMark from '../assets/effects/hippo-mark.png';
import tigerMark from '../assets/effects/tiger-mark.png';
import cosmicEffect from '../assets/effects/cosmico.png';
import portalEffect from '../assets/effects/portal.png';
import meteorEffect from '../assets/effects/meteoro.png';
import dexiosDown from '../assets/dexios/dexios_abajo.png';
import dexiosUp from '../assets/dexios/dexios_arriba.png';
import dexiosAttack from '../assets/dexios/dexios_ataque.png';
import dexiosBase from '../assets/dexios/dexios_base.png';
import dexiosWhite from '../assets/dexios/dexios_blanco.png';
import dexiosRight from '../assets/dexios/dexios_derecha.png';
import dexiosHit from '../assets/dexios/dexios_herido.png';
import dexiosLeft from '../assets/dexios/dexios_izquierda.png';
import dexiosJump from '../assets/dexios/dexios_salto.png';
import dexiosRed from '../assets/dexios/dexios_rojo.png';
import furaiDown from '../assets/furai/furai_abajo.png';
import furaiUp from '../assets/furai/furai_arriba.png';
import furaiAttack from '../assets/furai/furai_ataque.png';
import furaiBase from '../assets/furai/furai_base.png';
import furaiRight from '../assets/furai/furai_derecha.png';
import furaiHit from '../assets/furai/furai_herido.png';
import furaiLeft from '../assets/furai/furai_izquierda.png';
import furaiJump from '../assets/furai/furai_salto.png';
import furaiBreak from '../assets/furai/furai_romper.png';
import furaiTiger from '../assets/furai/furai_tigre.png';
import iobrontesArmor from '../assets/iobrontes/iobrontes_armadura.png';
import iobrontesDown from '../assets/iobrontes/iobrontes_abajo.png';
import iobrontesUp from '../assets/iobrontes/iobrontes_arriba.png';
import iobrontesBase from '../assets/iobrontes/iobrontes_base.png';
import iobrontesRight from '../assets/iobrontes/iobrontes_derecha.png';
import iobrontesHit from '../assets/iobrontes/iobrontes_herido.png';
import iobrontesLeft from '../assets/iobrontes/iobrontes_izquierda.png';
import iobrontesWatchThunder from '../assets/iobrontes/iobrontes_wtt.png';
import kosmelysBase from '../assets/kosmelys/kosmelys_base.png';
import kosmelysRight from '../assets/kosmelys/kosmelys_derecha.png';
import kosmelysLeft from '../assets/kosmelys/kosmelys_izquierda.png';
import kosmelysUp from '../assets/kosmelys/kosmelys_arriba.png';
import kosmelysShield from '../assets/kosmelys/kosmelys_escudo.png';
import kosmelysMeteorRain from '../assets/kosmelys/kosmelys_mr.png';
import kosmelysHit from '../assets/kosmelys/kosmelys_herida.png';
import sahiraDown from '../assets/sahira/sahira_abajo.png';
import sahiraUp from '../assets/sahira/sahira_arriba.png';
import sahiraAttack from '../assets/sahira/sahira_ataque.png';
import sahiraBase from '../assets/sahira/sahira_base.png';
import sahiraRight from '../assets/sahira/sahira_derecha.png';
import sahiraHit from '../assets/sahira/sahira_herida.png';
import sahiraLeft from '../assets/sahira/sahira_izquierda.png';
import sahiraHeal from '../assets/sahira/sahira_cura.png';
import sahiraJump from '../assets/sahira/sahira_salto.png';

export type CharacterId = 'dexios' | 'furai' | 'sahira';
export type BossId = 'iobrontes' | 'kosmelys';
export type Direction = 'left' | 'right' | 'up' | 'down';

export const IMAGE_ASSETS = {
  arena,
  hippo_mark: hippoMark,
  tiger_mark: tigerMark,
  cosmic_effect: cosmicEffect,
  portal_effect: portalEffect,
  meteor_effect: meteorEffect,
  dexios_abajo: dexiosDown,
  dexios_arriba: dexiosUp,
  dexios_ataque: dexiosAttack,
  dexios_base: dexiosBase,
  dexios_blanco: dexiosWhite,
  dexios_derecha: dexiosRight,
  dexios_herido: dexiosHit,
  dexios_izquierda: dexiosLeft,
  dexios_salto: dexiosJump,
  dexios_rojo: dexiosRed,
  furai_abajo: furaiDown,
  furai_arriba: furaiUp,
  furai_ataque: furaiAttack,
  furai_base: furaiBase,
  furai_derecha: furaiRight,
  furai_herido: furaiHit,
  furai_izquierda: furaiLeft,
  furai_salto: furaiJump,
  furai_romper: furaiBreak,
  furai_tigre: furaiTiger,
  iobrontes_armadura: iobrontesArmor,
  iobrontes_abajo: iobrontesDown,
  iobrontes_arriba: iobrontesUp,
  iobrontes_base: iobrontesBase,
  iobrontes_derecha: iobrontesRight,
  iobrontes_herido: iobrontesHit,
  iobrontes_izquierda: iobrontesLeft,
  iobrontes_wtt: iobrontesWatchThunder,
  kosmelys_base: kosmelysBase,
  kosmelys_derecha: kosmelysRight,
  kosmelys_izquierda: kosmelysLeft,
  kosmelys_arriba: kosmelysUp,
  kosmelys_escudo: kosmelysShield,
  kosmelys_mr: kosmelysMeteorRain,
  kosmelys_herida: kosmelysHit,
  sahira_abajo: sahiraDown,
  sahira_arriba: sahiraUp,
  sahira_ataque: sahiraAttack,
  sahira_base: sahiraBase,
  sahira_derecha: sahiraRight,
  sahira_herida: sahiraHit,
  sahira_izquierda: sahiraLeft,
  sahira_cura: sahiraHeal,
  sahira_salto: sahiraJump,
} as const;

export const GAME_CONFIG = {
  canvas: { width: 1920, height: 1080 },
  camera: { targetZoom: 1.08, focusMs: 260, returnMs: 300 },
  timing: {
    windUpMs: 187,
    projectileTravelMs: 373,
    defenseOpensBeforeImpactMs: 500,
    perfectParryStartsBeforeImpactMs: 100,
    defenseClosesAfterImpactMs: 100,
    resultDurationMs: 1019,
    nextBoltDelayMs: 373,
    enemyAttackAnnouncementMs: 1000,
    watchTheThunderCastMs: 600,
    jumpWindowMs: 300,
    jumpPoseMs: 700,
    attackHitIntervalMs: 260,
    attackRecoveryMs: 500,
    spritePoseMs: 650,
    cosmicPerfectParryWindowMs: 100,
    cosmicWindUpMs: 187,
    meteorPreparationMs: 500,
    meteorTravelMs: 500,
    meteorFollowUpTravelMs: 700,
    meteorDefenseOpensBeforeImpactMs: 700,
    meteorNormalBlockWindowMs: 400,
    meteorPerfectBlockWindowMs: 400,
    portalShieldPlayerTurns: 1,
    portalEffectDurationMs: 620,
    kosmelysBreathingMs: 1750,
    kosmelysBreathingPixels: 4,
  },
  partyOrder: ['furai', 'iobrontes', 'kosmelys', 'dexios', 'iobrontes', 'kosmelys', 'sahira', 'iobrontes', 'kosmelys'] as const,
  characters: {
    furai: {
      name: 'Furai',
      x: 255,
      feetY: 855,
      displayHeight: 500,
      depth: 4,
      health: 80,
      mana: 150,
      chaos: 0,
      frames: {
        idle: 'furai_base',
        attack: 'furai_ataque',
        special: 'furai_tigre',
        break: 'furai_romper',
        hit: 'furai_herido',
        jump: 'furai_salto',
        defense: { left: 'furai_izquierda', right: 'furai_derecha', up: 'furai_arriba', down: 'furai_abajo' },
      },
    },
    dexios: {
      name: 'Dexios',
      x: 625,
      feetY: 900,
      displayHeight: 550,
      depth: 5,
      health: 100,
      mana: 100,
      chaos: 0,
      frames: {
        idle: 'dexios_base',
        attack: 'dexios_ataque',
        arc: 'dexios_blanco',
        chaos: 'dexios_rojo',
        hit: 'dexios_herido',
        jump: 'dexios_salto',
        defense: { left: 'dexios_izquierda', right: 'dexios_derecha', up: 'dexios_arriba', down: 'dexios_abajo' },
      },
    },
    sahira: {
      name: 'Sahira',
      x: 995,
      feetY: 935,
      displayHeight: 580,
      depth: 6,
      health: 125,
      mana: 80,
      chaos: 0,
      frames: {
        idle: 'sahira_base',
        attack: 'sahira_ataque',
        heal: 'sahira_cura',
        hit: 'sahira_herida',
        jump: 'sahira_salto',
        defense: { left: 'sahira_izquierda', right: 'sahira_derecha', up: 'sahira_arriba', down: 'sahira_abajo' },
      },
    },
    iobrontes: {
      name: 'Iobrontes',
      title: 'God of Thunder · Tenth Heir of Zeus',
      x: 1240,
      feetY: 785,
      displayHeight: 535,
      depth: 2,
      health: 550,
      frames: {
        idle: 'iobrontes_base',
        divineRetribution: 'iobrontes_armadura',
        hit: 'iobrontes_herido',
        attack: { left: 'iobrontes_izquierda', right: 'iobrontes_derecha', up: 'iobrontes_arriba', down: 'iobrontes_abajo' },
        watchThunder: 'iobrontes_wtt',
      },
    },
    kosmelys: {
      name: 'Kosmelys',
      title: 'Goddess of Space · Tenth Heir of Hera',
      x: 1710,
      feetY: 785,
      displayHeight: 535,
      shadowWidth: 290,
      shadowHeight: 34,
      depth: 3,
      health: 450,
      frames: {
        idle: 'kosmelys_base',
        hit: 'kosmelys_herida',
        shield: 'kosmelys_escudo',
        meteorRain: 'kosmelys_mr',
        attack: {
          left: 'kosmelys_izquierda',
          right: 'kosmelys_derecha',
          up: 'kosmelys_arriba',
          down: 'MISSING_KOSMELYS_ATTACK_DOWN',
        },
      },
    },
  },
  kosmelysAttacks: {
    cosmicRaysDamage: 15,
    cosmicBlockedDamage: 5,
    cosmicRaysProjectiles: 2,
    meteorRainDamage: 20,
    meteorBlockedDamage: 5,
    meteorCount: 5,
    meteorDexiosCounterDamage: 5,
    meteorFuraiCounterDamage: 20,
    cosmicFuraiCounterDamage: 20,
    cosmicProjectileScale: 0.24,
    cosmicSpeedRatio: 0.6,
    lightningReferenceDistance: 560,
    cosmicInitialDistance: 650,
    cosmicImpactDistance: 55,
    meteorScale: 0.18,
    meteorFallDistance: 600,
    meteorTravelDistance: 520,
    meteorLaneOffset: 38,
    meteorWarningOffset: 70,
    portalScale: 0.2,
    portalEffectFadeAlpha: 0.35,
    portalEffectScale: 1.4,
    portalEffectRotationDegrees: 360,
    cosmicRaysChancePercent: 50,
    portalShieldChancePercent: 30,
    meteorRainChancePercent: 20,
  },
  bossHud: {
    x: { iobrontes: 32, kosmelys: 1320 },
    width: 568,
    height: 94,
    y: { iobrontes: 108, kosmelys: 108 },
    labelX: 20,
    labelY: 6,
    titleFontSize: 21,
    subtitleX: 22,
    subtitleY: 31,
    subtitleFontSize: 13,
    barX: 20,
    barY: 70,
    barWidth: 420,
    barHeight: 11,
    healthTextX: 545,
    healthTextY: 66,
  },
  bossTargetUi: {
    firstButtonX: 18,
    buttonY: 48,
    buttonWidth: 284,
    buttonHeight: 92,
    buttonGap: 21,
  },
  enemyAttacks: {
    lightningChainChancePercent: 50,
    watchTheThunderChancePercent: 30,
    divineRetributionChancePercent: 20,
    divineRetributionDamage: 30,
    divineRetributionDurationPlayerTurns: 2,
    watchTheThunderDamage: 50,
  },
  abilities: {
    dexios: [
      { id: 'triple-lightning', name: 'Triple Lightning', detail: '3 impactos · 5 de daño', frame: 'dexios_ataque', damage: 5, hits: 3, resource: null, cost: 0, selfDamage: 0, color: 0xffd65c, sound: 'dexios' },
      { id: 'electric-arc', name: 'Electric Arc', detail: '30 de daño', frame: 'dexios_blanco', damage: 30, hits: 1, resource: 'mana', cost: 20, selfDamage: 0, color: 0xf3f6ff, sound: 'dexios' },
      { id: 'chaotic-lightning', name: 'Chaotic Lightning', detail: '70 de daño · 10 propio', frame: 'dexios_rojo', damage: 70, hits: 1, resource: 'chaos', cost: 50, selfDamage: 10, color: 0xff435b, sound: 'dexios' },
    ],
    furai: [
      { id: 'tiger-spear', name: 'Tiger Spear', detail: '15 de daño', frame: 'furai_ataque', damage: 15, hits: 1, resource: null, cost: 0, selfDamage: 0, color: 0xf3bf66, sound: 'furai' },
      { id: 'tiger-fang', name: 'Tiger Fang', detail: '2 impactos · 15 de daño', frame: 'furai_tigre', damage: 15, hits: 2, resource: 'mana', cost: 20, selfDamage: 0, color: 0xdca7ff, sound: 'tigre' },
      { id: 'armor-break', name: 'Armor Break', detail: 'Duplica el siguiente golpe', frame: 'furai_romper', damage: 0, hits: 0, resource: 'mana', cost: 20, selfDamage: 0, color: 0xc77cff, sound: 'tigre' },
    ],
    sahira: [
      { id: 'jackal-strike', name: 'Jackal Strike', detail: '15 de daño', frame: 'sahira_ataque', damage: 15, hits: 1, resource: null, cost: 0, selfDamage: 0, color: 0x65e5bd, sound: 'sahira' },
      { id: 'hippopotamus-healing', name: 'Hippopotamus Healing', detail: 'Restaura toda la salud', frame: 'sahira_cura', damage: 0, hits: 0, resource: 'mana', cost: 40, selfDamage: 0, color: 0x63f0c0, sound: 'cura' },
      { id: 'hippopotamus-shield', name: 'Hippopotamus Shield', detail: 'Protege de los siguientes 2 ataques', frame: 'sahira_cura', damage: 0, hits: 0, resource: null, cost: 0, selfDamage: 0, color: 0x68d391, sound: 'cura' },
    ],
  },
  audio: { master: 0.72, music: 0.36, effects: 0.58 },
} as const;

export type AbilityDefinition = typeof GAME_CONFIG.abilities[CharacterId][number];
