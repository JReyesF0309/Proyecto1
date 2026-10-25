import { CharacterId, Direction, GAME_CONFIG } from './game-config';

export type DefenseOutcome = 'perfect' | 'blocked' | 'failed';
export type CombatResult = 'victory' | 'defeat';
export type Resource = 'mana' | 'chaos';

export interface CharacterStatus {
  health: number;
  mana: number;
  chaos: number;
  shieldHits: number;
}

export interface CombatState {
  party: Record<CharacterId, CharacterStatus>;
  iobrontesHealth: number;
  armorBreak: boolean;
  divineRetributionTurnsRemaining: number;
}

export interface ResourceCost {
  resource: Resource | null;
  cost: number;
}

export const MAX_HEALTH: Record<CharacterId, number> = {
  dexios: GAME_CONFIG.characters.dexios.health,
  furai: GAME_CONFIG.characters.furai.health,
  sahira: GAME_CONFIG.characters.sahira.health,
};

export const MAX_MANA: Record<CharacterId, number> = {
  dexios: GAME_CONFIG.characters.dexios.mana,
  furai: GAME_CONFIG.characters.furai.mana,
  sahira: GAME_CONFIG.characters.sahira.mana,
};

export const MAX_CHAOS = 100;
export const MAX_IOBRONTES_HEALTH = GAME_CONFIG.characters.iobrontes.health;
export const ENEMY_ATTACK_DAMAGE = 10;
export const IMPERFECT_BLOCK_DAMAGE = 5;
export const PERFECT_PARRY_DAMAGE = 5;
export const CHAOS_PER_DAMAGE = 20;
export const WIND_UP_MS = GAME_CONFIG.timing.windUpMs;
export const PROJECTILE_TRAVEL_MS = GAME_CONFIG.timing.projectileTravelMs;
export const DEFENSE_WINDOW_START_MS =
  PROJECTILE_TRAVEL_MS - GAME_CONFIG.timing.defenseOpensBeforeImpactMs;
export const PERFECT_PARRY_WINDOW_START_MS =
  PROJECTILE_TRAVEL_MS - GAME_CONFIG.timing.perfectParryStartsBeforeImpactMs;
export const DEFENSE_WINDOW_END_MS =
  PROJECTILE_TRAVEL_MS + GAME_CONFIG.timing.defenseClosesAfterImpactMs;

export const createCombatState = (): CombatState => ({
  party: {
    dexios: { health: MAX_HEALTH.dexios, mana: MAX_MANA.dexios, chaos: 0, shieldHits: 0 },
    furai: { health: MAX_HEALTH.furai, mana: MAX_MANA.furai, chaos: 0, shieldHits: 0 },
    sahira: { health: MAX_HEALTH.sahira, mana: MAX_MANA.sahira, chaos: 0, shieldHits: 0 },
  },
  iobrontesHealth: MAX_IOBRONTES_HEALTH,
  armorBreak: false,
  divineRetributionTurnsRemaining: 0,
});

export const canAfford = (status: CharacterStatus, action: ResourceCost): boolean => {
  if (!action.resource) {
    return true;
  }
  return status[action.resource] >= action.cost;
};

export const spendCost = (status: CharacterStatus, action: ResourceCost): void => {
  if (action.resource) {
    status[action.resource] = Math.max(0, status[action.resource] - action.cost);
  }
};

export const damageIobrontes = (state: CombatState, amount: number): number => {
  const damage = Math.min(state.iobrontesHealth, Math.max(0, amount));
  state.iobrontesHealth -= damage;
  return damage;
};

export const damagePartyMember = (
  state: CombatState,
  character: CharacterId,
  amount: number,
  causedByEnemy = true,
): number => {
  const status = state.party[character];
  const damage = Math.min(status.health, Math.max(0, amount));
  status.health -= damage;
  if (character === 'dexios' && causedByEnemy && damage > 0) {
    status.chaos = Math.min(MAX_CHAOS, status.chaos + CHAOS_PER_DAMAGE);
  }
  return damage;
};

export const consumeShieldHit = (
  state: CombatState,
  character: CharacterId,
): boolean => {
  const status = state.party[character];
  if (status.shieldHits <= 0) {
    return false;
  }
  status.shieldHits -= 1;
  return true;
};

export const healPartyMember = (
  state: CombatState,
  character: CharacterId,
): number => {
  const status = state.party[character];
  if (status.health <= 0) {
    return 0;
  }
  const restored = MAX_HEALTH[character] - status.health;
  status.health = MAX_HEALTH[character];
  return restored;
};

export const resolveDefense = (
  attackDirection: Direction,
  responseDirection: Direction | null,
  responseTimeMs: number | null,
): DefenseOutcome => {
  if (
    responseDirection !== attackDirection
    || responseTimeMs === null
    || responseTimeMs < DEFENSE_WINDOW_START_MS
    || responseTimeMs > DEFENSE_WINDOW_END_MS
  ) {
    return 'failed';
  }
  return responseTimeMs < PERFECT_PARRY_WINDOW_START_MS ? 'blocked' : 'perfect';
};

export const damageForDefense = (
  character: CharacterId,
  outcome: DefenseOutcome,
): number => {
  if (outcome === 'perfect') {
    return 0;
  }
  if (outcome === 'blocked') {
    return character === 'sahira' ? 0 : IMPERFECT_BLOCK_DAMAGE;
  }
  return ENEMY_ATTACK_DAMAGE;
};

export const getBattleResult = (state: CombatState): CombatResult | null => {
  if (state.iobrontesHealth <= 0) {
    return 'victory';
  }
  if (Object.values(state.party).every((character) => character.health <= 0)) {
    return 'defeat';
  }
  return null;
};
