import {
  BossId,
  BossPhase,
  CharacterId,
  Direction,
  GAME_CONFIG,
  HazelForm,
} from './game-config';

export type DefenseOutcome = 'perfect' | 'blocked' | 'failed';
export type CombatResult = 'victory' | 'defeat';
export type Resource = 'mana' | 'spirit' | 'chaos';

export interface CharacterStatus {
  health: number;
  mana: number;
  spirit: number;
  chaos: number;
  shieldHits: number;
}

export interface CombatState {
  party: Record<CharacterId, CharacterStatus>;
  bosses: Record<BossId, { health: number; armorBreak: boolean; phase: BossPhase }>;
  sahiraAbilityUses: {
    healing: number;
    shield: number;
  };
  hazelForm: HazelForm;
  kosmelysPortalShieldTurnsRemaining: number;
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
  hazel: GAME_CONFIG.characters.hazel.health,
};

export const MAX_MANA: Record<CharacterId, number> = {
  dexios: GAME_CONFIG.characters.dexios.mana,
  furai: 0,
  sahira: 0,
  hazel: 0,
};

export const MAX_SPIRIT = GAME_CONFIG.characters.furai.spirit;
export const SAHIRA_ABILITY_USE_LIMITS = { healing: 4, shield: 10 } as const;
export const MAX_CHAOS = 100;
export const MAX_IOBRONTES_HEALTH = GAME_CONFIG.bossPhases.iobrontes.normal.maxHealth;
export const MAX_KOSMELYS_HEALTH = GAME_CONFIG.bossPhases.kosmelys.normal.maxHealth;
export const MAX_BOSS_HEALTH: Record<BossId, number> = {
  iobrontes: MAX_IOBRONTES_HEALTH,
  kosmelys: MAX_KOSMELYS_HEALTH,
};
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
    dexios: { health: MAX_HEALTH.dexios, mana: MAX_MANA.dexios, spirit: 0, chaos: 0, shieldHits: 0 },
    furai: { health: MAX_HEALTH.furai, mana: 0, spirit: 0, chaos: 0, shieldHits: 0 },
    sahira: { health: MAX_HEALTH.sahira, mana: 0, spirit: 0, chaos: 0, shieldHits: 0 },
    hazel: { health: MAX_HEALTH.hazel, mana: 0, spirit: 0, chaos: 0, shieldHits: 0 },
  },
  bosses: {
    iobrontes: { health: MAX_IOBRONTES_HEALTH, armorBreak: false, phase: 'normal' },
    kosmelys: { health: MAX_KOSMELYS_HEALTH, armorBreak: false, phase: 'normal' },
  },
  sahiraAbilityUses: {
    healing: SAHIRA_ABILITY_USE_LIMITS.healing,
    shield: SAHIRA_ABILITY_USE_LIMITS.shield,
  },
  hazelForm: 'ignis',
  kosmelysPortalShieldTurnsRemaining: 0,
  divineRetributionTurnsRemaining: 0,
});

export const canUseAbility = (
  state: CombatState,
  character: CharacterId,
  ability: ResourceCost & { id: string },
): boolean => {
  if (!canAfford(state.party[character], ability)) {
    return false;
  }
  if (ability.id === 'hippopotamus-healing') {
    return state.sahiraAbilityUses.healing > 0;
  }
  if (ability.id === 'hippopotamus-shield') {
    return state.sahiraAbilityUses.shield > 0;
  }
  return true;
};

export const consumeSahiraAbilityUse = (
  state: CombatState,
  abilityId: 'hippopotamus-healing' | 'hippopotamus-shield',
): boolean => {
  const ability = abilityId === 'hippopotamus-healing' ? 'healing' : 'shield';
  if (state.sahiraAbilityUses[ability] <= 0) {
    return false;
  }
  state.sahiraAbilityUses[ability] -= 1;
  return true;
};

export const gainFuraiSpirit = (state: CombatState, amount: number): void => {
  state.party.furai.spirit = Math.min(MAX_SPIRIT, state.party.furai.spirit + amount);
};

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
  return damageBoss(state, 'iobrontes', amount);
};

export const damageBoss = (
  state: CombatState,
  boss: BossId,
  amount: number,
): number => {
  const bossState = state.bosses[boss];
  if (bossState.phase === 'defeated') {
    return 0;
  }
  const damage = Math.min(bossState.health, Math.max(0, amount));
  bossState.health -= damage;
  if (bossState.health <= 0 && bossState.phase === 'heir') {
    bossState.phase = 'defeated';
  }
  return damage;
};

export const damageBossWithArmorBreak = (
  state: CombatState,
  boss: BossId,
  amount: number,
): { damage: number; empowered: boolean } => {
  const empowered = state.bosses[boss].armorBreak && amount > 0;
  const damage = damageBoss(state, boss, amount * (empowered ? 2 : 1));
  if (empowered && damage > 0) {
    state.bosses[boss].armorBreak = false;
  }
  return { damage, empowered: empowered && damage > 0 };
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
  timingMultiplier = 1,
): DefenseOutcome => {
  if (
    responseDirection !== attackDirection
    || responseTimeMs === null
    || responseTimeMs < DEFENSE_WINDOW_START_MS * timingMultiplier
    || responseTimeMs > DEFENSE_WINDOW_END_MS * timingMultiplier
  ) {
    return 'failed';
  }
  return responseTimeMs < PERFECT_PARRY_WINDOW_START_MS * timingMultiplier ? 'blocked' : 'perfect';
};

export const damageForDefense = (
  character: CharacterId,
  outcome: DefenseOutcome,
  damageMultiplier = 1,
  sceneDamageMultiplier = 1,
): number => {
  if (outcome === 'perfect') {
    return 0;
  }
  if (outcome === 'blocked' && character === 'sahira') {
    return 0;
  }
  const baseDamage = outcome === 'blocked'
    ? character === 'hazel' ? ENEMY_ATTACK_DAMAGE : IMPERFECT_BLOCK_DAMAGE
    : ENEMY_ATTACK_DAMAGE;
  return Math.ceil(baseDamage * damageMultiplier * sceneDamageMultiplier);
};

export const getBattleResult = (state: CombatState): CombatResult | null => {
  if (Object.values(state.bosses).every((boss) => boss.phase === 'defeated')) {
    return 'victory';
  }
  if (Object.values(state.party).every((character) => character.health <= 0)) {
    return 'defeat';
  }
  return null;
};
