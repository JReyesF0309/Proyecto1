export type AttackId = 'triple-lightning' | 'electric-arc' | 'chaotic-lightning';
export type Direction = 'left' | 'right' | 'top' | 'bottom';
export type DefenseOutcome = 'perfect' | 'blocked' | 'failed';
export type CombatResult = 'victory' | 'defeat';

export interface CombatState {
  dexiosHealth: number;
  mana: number;
  chaos: number;
  iobrontesHealth: number;
}

export interface AttackDefinition {
  id: AttackId;
  name: string;
  cost: number;
  resource: 'mana' | 'chaos' | null;
  damage: number;
  hits: number;
  selfDamage: number;
}

export const MAX_DEXIOS_HEALTH = 100;
export const MAX_MANA = 100;
export const MAX_CHAOS = 100;
export const MAX_IOBRONTES_HEALTH = 200;
export const ENEMY_ATTACK_DAMAGE = 20;
export const IMPERFECT_BLOCK_DAMAGE = 5;
export const PERFECT_PARRY_DAMAGE = 5;
export const PERFECT_PARRY_WINDOW_MS = 600;
export const DEFENSE_WINDOW_MS = 1000;
export const WIND_UP_MS = 1000;
export const PROJECTILE_TRAVEL_MS = 2000;

export const ATTACKS: readonly AttackDefinition[] = [
  {
    id: 'triple-lightning',
    name: 'Triple Lightning',
    cost: 0,
    resource: null,
    damage: 5,
    hits: 3,
    selfDamage: 0,
  },
  {
    id: 'electric-arc',
    name: 'Electric Arc',
    cost: 10,
    resource: 'mana',
    damage: 30,
    hits: 1,
    selfDamage: 0,
  },
  {
    id: 'chaotic-lightning',
    name: 'Chaotic Lightning',
    cost: 50,
    resource: 'chaos',
    damage: 70,
    hits: 1,
    selfDamage: 20,
  },
];

export const createCombatState = (): CombatState => ({
  dexiosHealth: MAX_DEXIOS_HEALTH,
  mana: MAX_MANA,
  chaos: 0,
  iobrontesHealth: MAX_IOBRONTES_HEALTH,
});

export const canUseAttack = (state: CombatState, attack: AttackDefinition): boolean => {
  if (attack.resource === 'mana') {
    return state.mana >= attack.cost;
  }
  if (attack.resource === 'chaos') {
    return state.chaos >= attack.cost;
  }
  return true;
};

export const spendAttackCost = (state: CombatState, attack: AttackDefinition): void => {
  if (attack.resource === 'mana') {
    state.mana = Math.max(0, state.mana - attack.cost);
  } else if (attack.resource === 'chaos') {
    state.chaos = Math.max(0, state.chaos - attack.cost);
  }
};

export const damageIobrontes = (state: CombatState, amount: number): number => {
  const damage = Math.min(state.iobrontesHealth, Math.max(0, amount));
  state.iobrontesHealth -= damage;
  return damage;
};

export const damageDexios = (
  state: CombatState,
  amount: number,
  gainsChaos: boolean,
): number => {
  const damage = Math.min(state.dexiosHealth, Math.max(0, amount));
  state.dexiosHealth -= damage;
  if (gainsChaos && damage > 0) {
    state.chaos = Math.min(MAX_CHAOS, state.chaos + 10);
  }
  return damage;
};

export const resolveDefense = (
  attackDirection: Direction,
  responseDirection: Direction | null,
  responseTimeMs: number | null,
): DefenseOutcome => {
  if (responseDirection !== attackDirection || responseTimeMs === null) {
    return 'failed';
  }
  if (responseTimeMs <= PERFECT_PARRY_WINDOW_MS) {
    return 'perfect';
  }
  if (responseTimeMs <= DEFENSE_WINDOW_MS) {
    return 'blocked';
  }
  return 'failed';
};
