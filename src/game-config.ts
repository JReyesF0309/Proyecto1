import arena from '../escenario.png';
import hippoMark from '../assets/effects/hippo-mark.png';
import tigerMark from '../assets/effects/tiger-mark.png';
import dexiosDown from '../assets/characters/dexios_abajo.png';
import dexiosUp from '../assets/characters/dexios_arriba.png';
import dexiosAttack from '../assets/characters/dexios_ataque.png';
import dexiosBase from '../assets/characters/dexios_base.png';
import dexiosWhite from '../assets/characters/dexios_blanco.png';
import dexiosRight from '../assets/characters/dexios_derecha.png';
import dexiosHit from '../assets/characters/dexios_herido.png';
import dexiosLeft from '../assets/characters/dexios_izquierda.png';
import dexiosJump from '../assets/characters/dexios_salto.png';
import dexiosRed from '../assets/characters/dexios_rojo.png';
import furaiDown from '../assets/characters/furai_abajo.png';
import furaiUp from '../assets/characters/furai_arriba.png';
import furaiAttack from '../assets/characters/furai_ataque.png';
import furaiBase from '../assets/characters/furai_base.png';
import furaiRight from '../assets/characters/furai_derecha.png';
import furaiHit from '../assets/characters/furai_herido.png';
import furaiLeft from '../assets/characters/furai_izquierda.png';
import furaiJump from '../assets/characters/furai_salto.png';
import furaiBreak from '../assets/characters/furai_romper.png';
import furaiTiger from '../assets/characters/furai_tigre.png';
import iobrontesArmor from '../assets/characters/iobrontes_armadura.png';
import iobrontesDown from '../assets/characters/iobrontes_abajo.png';
import iobrontesUp from '../assets/characters/iobrontes_arriba.png';
import iobrontesBase from '../assets/characters/iobrontes_base.png';
import iobrontesRight from '../assets/characters/iobrontes_derecha.png';
import iobrontesHit from '../assets/characters/iobrontes_herido.png';
import iobrontesLeft from '../assets/characters/iobrontes_izquierda.png';
import iobrontesWatchThunder from '../assets/characters/iobrontes_wtt.png';
import sahiraDown from '../assets/characters/sahira_abajo.png';
import sahiraUp from '../assets/characters/sahira_arriba.png';
import sahiraAttack from '../assets/characters/sahira_ataque.png';
import sahiraBase from '../assets/characters/sahira_base.png';
import sahiraRight from '../assets/characters/sahira_derecha.png';
import sahiraHit from '../assets/characters/sahira_herida.png';
import sahiraLeft from '../assets/characters/sahira_izquierda.png';
import sahiraHeal from '../assets/characters/sahira_cura.png';
import sahiraJump from '../assets/characters/sahira_salto.png';

export type CharacterId = 'dexios' | 'furai' | 'sahira';
export type Direction = 'left' | 'right' | 'up' | 'down';

export const IMAGE_ASSETS = {
  arena,
  hippo_mark: hippoMark,
  tiger_mark: tigerMark,
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
  },
  partyOrder: ['furai', 'iobrontes', 'dexios', 'iobrontes', 'sahira', 'iobrontes'] as const,
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
      x: 1450,
      feetY: 785,
      displayHeight: 535,
      depth: 2,
      health: 500,
      frames: {
        idle: 'iobrontes_base',
        divineRetribution: 'iobrontes_armadura',
        hit: 'iobrontes_herido',
        attack: { left: 'iobrontes_izquierda', right: 'iobrontes_derecha', up: 'iobrontes_arriba', down: 'iobrontes_abajo' },
        watchThunder: 'iobrontes_wtt',
      },
    },
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
