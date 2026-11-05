export type OverworldFacing = 'up' | 'down' | 'left' | 'right';
export type Chapter1LaunchOrigin = 'explore' | 'combat_select';

export interface WorldPosition {
  x: number;
  y: number;
}

export interface ExploreSession {
  position: WorldPosition;
  lastSafePosition: WorldPosition;
  facing: OverworldFacing;
  hp: number;
  completedEncounters: Set<string>;
  activeEncounterId?: string;
  encounterOrigin?: WorldPosition;
  pendingBoss: boolean;
  chapterCompleted: boolean;
}

export const EXPLORE_SAVE_KEY = 'la_dexiada_ch1_explore_v1';
export const EXPLORE_SAVE_VERSION = 1;
export const EXPLORE_ENCOUNTER_IDS: readonly string[] = [
  'combat_01',
  'combat_02',
  'combat_03',
  'combat_04',
  'combat_05',
  'combat_06',
];

const STARTING_HP = 65;
const FACINGS: OverworldFacing[] = ['up', 'down', 'left', 'right'];

let session: ExploreSession | undefined;

function freshSession(spawn: WorldPosition): ExploreSession {
  return {
    position: { ...spawn },
    lastSafePosition: { ...spawn },
    facing: 'down',
    hp: STARTING_HP,
    completedEncounters: new Set<string>(),
    pendingBoss: false,
    chapterCompleted: false,
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function readSavedSession(spawn: WorldPosition): ExploreSession | undefined {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(EXPLORE_SAVE_KEY);
  } catch {
    return undefined;
  }
  if (!raw) {
    return undefined;
  }
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== EXPLORE_SAVE_VERSION || !data.player || typeof data.player !== 'object') {
      return undefined;
    }
    const player = data.player;
    const safe = isFiniteNumber(player.safeX) && isFiniteNumber(player.safeY)
      ? { x: player.safeX, y: player.safeY }
      : { ...spawn };
    const position = isFiniteNumber(player.x) && isFiniteNumber(player.y)
      ? { x: player.x, y: player.y }
      : { ...safe };
    const completed: string[] = Array.isArray(data.completedEncounters)
      ? data.completedEncounters.filter((id: unknown): id is string => (
        typeof id === 'string' && EXPLORE_ENCOUNTER_IDS.includes(id)
      ))
      : [];
    const hp = isFiniteNumber(player.hp) ? Math.min(STARTING_HP, Math.max(0, Math.round(player.hp))) : STARTING_HP;
    return {
      position,
      lastSafePosition: safe,
      facing: FACINGS.includes(player.facing) ? player.facing : 'down',
      hp: hp > 0 ? hp : STARTING_HP,
      completedEncounters: new Set(completed),
      pendingBoss: data.pendingBoss === true,
      chapterCompleted: data.chapterCompleted === true,
    };
  } catch {
    return undefined;
  }
}

// The in-memory session is authoritative; localStorage only seeds it and mirrors it.
export function ensureExploreSession(spawn: WorldPosition): ExploreSession {
  if (!session) {
    session = readSavedSession(spawn) ?? freshSession(spawn);
  }
  return session;
}

export function getExploreSession(): ExploreSession | undefined {
  return session;
}

export function saveExploreSession(): void {
  if (!session) {
    return;
  }
  const payload = {
    version: EXPLORE_SAVE_VERSION,
    player: {
      x: session.position.x,
      y: session.position.y,
      safeX: session.lastSafePosition.x,
      safeY: session.lastSafePosition.y,
      facing: session.facing,
      hp: session.hp,
    },
    completedEncounters: [...session.completedEncounters],
    pendingBoss: session.pendingBoss,
    chapterCompleted: session.chapterCompleted,
  };
  try {
    window.localStorage.setItem(EXPLORE_SAVE_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be blocked; the in-memory session keeps working.
  }
}

// Developer/testing operation only; never wired to R, Escape, or scene loading.
export function resetExplorationProgress(): void {
  session = undefined;
  try {
    window.localStorage.removeItem(EXPLORE_SAVE_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

export function completeActiveExploreEncounter(): void {
  if (!session?.activeEncounterId) {
    return;
  }
  session.completedEncounters.add(session.activeEncounterId);
  session.activeEncounterId = undefined;
  if (session.encounterOrigin) {
    session.position = { ...session.encounterOrigin };
    session.lastSafePosition = { ...session.encounterOrigin };
    session.encounterOrigin = undefined;
  }
  saveExploreSession();
}

export function markBossPending(): void {
  if (!session) {
    return;
  }
  session.pendingBoss = true;
  saveExploreSession();
}

export function markChapterCompleted(): void {
  if (!session) {
    return;
  }
  session.chapterCompleted = true;
  session.pendingBoss = false;
  saveExploreSession();
}
