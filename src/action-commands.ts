import Phaser from 'phaser';
import { UI_FONT_FAMILY } from './game-config';
import dexiosYellow from '../assets/cinematics/dexios_ataque_amarillo.png';
import dexiosWhite from '../assets/cinematics/dexios_ataque_blanco.png';
import dexiosRed from '../assets/cinematics/dexios_ataque_rojo.png';
import furaiBreak from '../assets/cinematics/furai_ataque_break.png';
import furaiSpear from '../assets/cinematics/furai_ataque_lanza.png';
import furaiFang from '../assets/cinematics/furai_ataque_tigre.png';
import hazelShift from '../assets/cinematics/hazel_ataque_cambio.png';
import hazelDance from '../assets/cinematics/hazel_fuego_ataque_dance.png';
import hazelShards from '../assets/cinematics/hazel_hielo_ataque_shards.png';
import sahiraJackal from '../assets/cinematics/sahira_ataque_chacal.png';
import sahiraHippo from '../assets/cinematics/sahira_ataque_hipo.png';

export const CINEMATIC_ASSETS = {
  dexios_ataque_amarillo: dexiosYellow,
  dexios_ataque_blanco: dexiosWhite,
  dexios_ataque_rojo: dexiosRed,
  furai_ataque_break: furaiBreak,
  furai_ataque_lanza: furaiSpear,
  furai_ataque_tigre: furaiFang,
  hazel_ataque_cambio: hazelShift,
  hazel_fuego_ataque_dance: hazelDance,
  hazel_hielo_ataque_shards: hazelShards,
  sahira_ataque_chacal: sahiraJackal,
  sahira_ataque_hipo: sahiraHippo,
} as const;

export type CinematicKey = keyof typeof CINEMATIC_ASSETS;
export const cinematicTextureKey = (key: CinematicKey): string => `cinematic_${key}`;

export type HitResult = 'fail' | 'normal' | 'perfect';

export const RESULT_MULTIPLIERS: Record<HitResult, number> = {
  fail: 0.5,
  normal: 1,
  perfect: 1.2,
};

// Única regla de redondeo para todas las habilidades.
export const applyResultMultiplier = (base: number, result: HitResult): number =>
  Math.round(base * RESULT_MULTIPLIERS[result]);

export interface CommandOutcome {
  results: HitResult[];
  success: boolean;
  charges: number;
}

export const NO_COMMAND_OUTCOME = (hits: number): CommandOutcome => ({
  results: Array.from({ length: Math.max(1, hits) }, () => 'normal' as HitResult),
  success: true,
  charges: 0,
});

export interface StripConfig {
  heightRatio: number;
  enterMs: number;
  holdMs: number;
  exitMs: number;
  borderPx: number;
  borderColor: number;
}

export const STRIP_CONFIG: StripConfig = {
  heightRatio: 0.4,
  enterMs: 260,
  holdMs: 1000,
  exitMs: 260,
  borderPx: 8,
  borderColor: 0xe6bd63,
};

export interface CircleTimingCommand {
  type: 'CIRCLE_TIMING';
  keys: string[];
  circleDurationMs: number;
  // Ventanas relativas al momento de impacto T.
  failStartMs: number;
  normalStartMs: number;
  perfectStartMs: number;
  endMs: number;
  gapMs: number;
}

export interface DirectionSequenceCommand {
  type: 'DIRECTION_SEQUENCE';
  random: boolean;
  keys: string[];
  count: number;
  totalTimeMs: number;
  perKeyTimeMs: number;
  perfectWithinMs: number;
  graded: boolean;
}

export interface HorizontalControlCommand {
  type: 'HORIZONTAL_CONTROL';
  leftKey: string;
  rightKey: string;
  durationMs: number;
  lengthPx: number;
  ballDiameterRatio: number;
  speedRatio: number;
}

export interface CircleOverlapCommand {
  type: 'CIRCLE_OVERLAP';
  key: string;
  stationaryRadiusPx: number;
  movingRadiusRatio: number;
  speedRatio: number;
  startOffsetPx: number;
  timeoutMs: number;
  normalOverlap: number;
  perfectCharges: number;
  normalCharges: number;
}

export interface RapidPressCommand {
  type: 'RAPID_PRESS';
  key: string;
  presses: number;
  durationMs: number;
}

export type ActionCommand =
  | { type: 'NONE' }
  | CircleTimingCommand
  | DirectionSequenceCommand
  | HorizontalControlCommand
  | CircleOverlapCommand
  | RapidPressCommand;

export interface AbilityCommandConfig {
  illustration: CinematicKey;
  command: ActionCommand;
}

const ARC_TIMING = {
  circleDurationMs: 1200,
  failStartMs: -1100,
  normalStartMs: -700,
  perfectStartMs: -300,
  endMs: 100,
  gapMs: 350,
} as const;

export const ABILITY_COMMANDS: Record<string, AbilityCommandConfig> = {
  'triple-lightning': { illustration: 'dexios_ataque_amarillo', command: { type: 'NONE' } },
  'electric-arc': {
    illustration: 'dexios_ataque_blanco',
    command: { type: 'CIRCLE_TIMING', keys: ['w', 'w', 'w'], ...ARC_TIMING },
  },
  'chaotic-lightning': {
    illustration: 'dexios_ataque_rojo',
    command: {
      type: 'DIRECTION_SEQUENCE',
      random: true,
      keys: ['w', 'a', 's', 'd'],
      count: 3,
      totalTimeMs: 0,
      perKeyTimeMs: 2000,
      perfectWithinMs: 1000,
      graded: true,
    },
  },
  'tiger-spear': { illustration: 'furai_ataque_lanza', command: { type: 'NONE' } },
  'tiger-fang': {
    illustration: 'furai_ataque_tigre',
    command: { type: 'CIRCLE_TIMING', keys: ['a', 'd'], ...ARC_TIMING },
  },
  'armor-break': {
    illustration: 'furai_ataque_break',
    command: {
      type: 'HORIZONTAL_CONTROL',
      leftKey: 'a',
      rightKey: 'd',
      durationMs: 3000,
      lengthPx: 100,
      ballDiameterRatio: 0.2,
      speedRatio: 0.4,
    },
  },
  'jackal-strike': { illustration: 'sahira_ataque_chacal', command: { type: 'NONE' } },
  'hippopotamus-healing': { illustration: 'sahira_ataque_hipo', command: { type: 'NONE' } },
  'hippopotamus-shield': {
    illustration: 'sahira_ataque_hipo',
    command: {
      type: 'CIRCLE_OVERLAP',
      key: ' ',
      stationaryRadiusPx: 100,
      movingRadiusRatio: 0.5,
      speedRatio: 0.4,
      startOffsetPx: -150,
      timeoutMs: 15000,
      normalOverlap: 0.5,
      perfectCharges: 2,
      normalCharges: 1,
    },
  },
  'flame-dance': {
    illustration: 'hazel_fuego_ataque_dance',
    command: {
      type: 'DIRECTION_SEQUENCE',
      random: false,
      keys: ['w', 'a', 's', 'd'],
      count: 4,
      totalTimeMs: 2000,
      perKeyTimeMs: 0,
      perfectWithinMs: 0,
      graded: false,
    },
  },
  'figure-shards': {
    illustration: 'hazel_hielo_ataque_shards',
    command: { type: 'RAPID_PRESS', key: 's', presses: 10, durationMs: 3000 },
  },
  'glacio-shift': { illustration: 'hazel_ataque_cambio', command: { type: 'NONE' } },
  'ignis-shift': { illustration: 'hazel_ataque_cambio', command: { type: 'NONE' } },
};

// Área de intersección de dos círculos (para el solape geométrico).
export const circleOverlapArea = (r1: number, r2: number, distance: number): number => {
  if (distance >= r1 + r2) {
    return 0;
  }
  if (distance <= Math.abs(r1 - r2)) {
    return Math.PI * Math.min(r1, r2) ** 2;
  }
  const part1 = r1 * r1 * Math.acos((distance * distance + r1 * r1 - r2 * r2) / (2 * distance * r1));
  const part2 = r2 * r2 * Math.acos((distance * distance + r2 * r2 - r1 * r1) / (2 * distance * r2));
  const part3 = 0.5 * Math.sqrt(
    (-distance + r1 + r2) * (distance + r1 - r2) * (distance - r1 + r2) * (distance + r1 + r2),
  );
  return part1 + part2 - part3;
};

const RESULT_STYLE: Record<HitResult, { text: string; color: string }> = {
  fail: { text: 'FAIL', color: '#ff7b7b' },
  normal: { text: 'NORMAL', color: '#fff0a5' },
  perfect: { text: 'PERFECT', color: '#8dffb0' },
};

type Promote = <T extends Phaser.GameObjects.GameObject>(object: T) => T;

const KEY_LABELS: Record<string, string> = { ' ': 'ESPACIO' };
const keyLabel = (key: string): string => KEY_LABELS[key] ?? key.toUpperCase();

export class ActionCommandRunner {
  private active = false;
  private token = 0;
  private objects: Phaser.GameObjects.GameObject[] = [];
  private timers: Phaser.Time.TimerEvent[] = [];
  private frame: (() => void) | null = null;
  private keyHandler: ((key: string, now: number) => void) | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly promote: Promote,
    private readonly playPerfect: () => void,
    private readonly width: number,
    private readonly height: number,
  ) {
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
  }

  isActive(): boolean {
    return this.active;
  }

  destroy(): void {
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
    this.cancel();
  }

  cancel(): void {
    this.token += 1;
    this.active = false;
    this.frame = null;
    this.keyHandler = null;
    this.timers.forEach((timer) => timer.remove(false));
    this.timers = [];
    this.scene.tweens.killTweensOf(this.objects);
    this.objects.forEach((object) => object.destroy());
    this.objects = [];
  }

  // Muestra la franja y después ejecuta el comando; el resultado llega a done.
  run(
    abilityId: string,
    anchor: { x: number; y: number },
    done: (outcome: CommandOutcome) => void,
    hits = 1,
  ): void {
    const config = ABILITY_COMMANDS[abilityId];
    this.cancel();
    this.active = true;
    const token = this.token;
    const finish = (outcome: CommandOutcome): void => {
      if (token !== this.token) {
        return;
      }
      this.clearCommandObjects();
      this.active = false;
      done(outcome);
    };
    if (!config) {
      finish(NO_COMMAND_OUTCOME(hits));
      return;
    }
    this.playStrip(config.illustration, () => {
      if (token !== this.token) {
        return;
      }
      this.startCommand(config.command, anchor, hits, token, finish);
    });
  }

  handleKey(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();
    }
    if (event.repeat || !this.keyHandler) {
      return;
    }
    this.keyHandler(event.key.toLowerCase(), performance.now());
  }

  private onUpdate(): void {
    this.frame?.();
  }

  private track<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.promote(object);
    this.objects.push(object);
    return object;
  }

  private delay(ms: number, callback: () => void): void {
    const token = this.token;
    const timer = this.scene.time.delayedCall(ms, () => {
      if (token === this.token) {
        callback();
      }
    });
    this.timers.push(timer);
  }

  private clearCommandObjects(): void {
    this.frame = null;
    this.keyHandler = null;
    this.objects.forEach((object) => object.destroy());
    this.objects = [];
  }

  private playStrip(key: CinematicKey, next: () => void): void {
    const cfg = STRIP_CONFIG;
    const W = this.width;
    const H = this.height * cfg.heightRatio;
    const cy = this.height / 2;
    const top = cy - H / 2;
    const items: Array<Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject> = [];
    const bases: number[] = [];
    const add = (object: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image): void => {
      this.track(object).setDepth(3000);
      items.push(object);
      bases.push(object.x);
    };
    add(this.scene.add.rectangle(W / 2, cy, W, H, 0x000000, 1));
    add(this.scene.add.rectangle(W / 2, top + cfg.borderPx / 2, W, cfg.borderPx, cfg.borderColor, 1));
    add(this.scene.add.rectangle(W / 2, top + H - cfg.borderPx / 2, W, cfg.borderPx, cfg.borderColor, 1));
    const textureKey = cinematicTextureKey(key);
    if (this.scene.textures.exists(textureKey)) {
      const source = this.scene.textures.get(textureKey).getSourceImage();
      const scale = Math.min(
        (H - cfg.borderPx * 2) / source.height,
        W / source.width,
      );
      const image = this.scene.add.image(W / 2, cy, textureKey)
        .setDisplaySize(source.width * scale, source.height * scale);
      add(image);
    } else {
      console.error(`Falta la ilustración de ataque: ${textureKey}`);
    }
    const progress = { t: 0 };
    const place = (): void => {
      items.forEach((item, index) => {
        item.x = bases[index] + (progress.t - 1) * W;
      });
    };
    place();
    const token = this.token;
    this.scene.tweens.add({
      targets: progress,
      t: 1,
      duration: cfg.enterMs,
      ease: 'Cubic.easeOut',
      onUpdate: place,
      onComplete: () => {
        if (token !== this.token) {
          return;
        }
        this.delay(cfg.holdMs, () => {
          this.scene.tweens.add({
            targets: progress,
            t: 2,
            duration: cfg.exitMs,
            ease: 'Cubic.easeIn',
            onUpdate: place,
            onComplete: () => {
              if (token !== this.token) {
                return;
              }
              items.forEach((item) => (item as Phaser.GameObjects.GameObject).destroy());
              this.objects = this.objects.filter(
                (object) => !(items as Phaser.GameObjects.GameObject[]).includes(object),
              );
              next();
            },
          });
        });
      },
    });
  }

  private startCommand(
    command: ActionCommand,
    anchor: { x: number; y: number },
    hits: number,
    token: number,
    finish: (outcome: CommandOutcome) => void,
  ): void {
    const margin = 250;
    const at = {
      x: Phaser.Math.Clamp(anchor.x, margin, this.width - margin),
      y: Phaser.Math.Clamp(anchor.y, margin, this.height - margin),
    };
    switch (command.type) {
      case 'NONE':
        finish(NO_COMMAND_OUTCOME(hits));
        break;
      case 'CIRCLE_TIMING':
        this.runCircleTiming(command, at, finish);
        break;
      case 'DIRECTION_SEQUENCE':
        this.runDirectionSequence(command, at, finish);
        break;
      case 'HORIZONTAL_CONTROL':
        this.runHorizontalControl(command, at, finish);
        break;
      case 'CIRCLE_OVERLAP':
        this.runCircleOverlap(command, at, finish);
        break;
      case 'RAPID_PRESS':
        this.runRapidPress(command, at, finish);
        break;
    }
    void token;
  }

  private makeText(x: number, y: number, text: string, size: number, color: string): Phaser.GameObjects.Text {
    const label = this.scene.add.text(x, y, text, {
      fontFamily: UI_FONT_FAMILY,
      fontSize: `${size}px`,
      fontStyle: 'bold',
      color,
      stroke: '#171326',
      strokeThickness: Math.max(4, Math.round(size / 6)),
    }).setOrigin(0.5).setDepth(3100);
    return this.track(label);
  }

  private showResult(result: HitResult, x: number, y: number, label?: string): void {
    const style = RESULT_STYLE[result];
    if (result === 'perfect') {
      this.playPerfect();
    }
    const text = this.makeText(x, y, label ?? style.text, 46, style.color);
    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 900,
      onComplete: () => {
        text.destroy();
        this.objects = this.objects.filter((object) => object !== text);
      },
    });
  }

  private runCircleTiming(
    cfg: CircleTimingCommand,
    at: { x: number; y: number },
    finish: (outcome: CommandOutcome) => void,
  ): void {
    const graphics = this.track(this.scene.add.graphics().setDepth(3050));
    const keyText = this.makeText(at.x, at.y, '', 64, '#ffffff');
    const counter = this.makeText(at.x, at.y + 150, '', 24, '#e6e6e6');
    const results: HitResult[] = [];
    const targetRadius = 62;
    const startRadius = 190;
    let index = 0;
    let impactAt = 0;
    let waiting = false;
    const startCircle = (): void => {
      impactAt = performance.now() + cfg.circleDurationMs;
      waiting = false;
      keyText.setText(keyLabel(cfg.keys[index])).setVisible(true);
      counter.setText(`GOLPE ${index + 1} / ${cfg.keys.length}`);
    };
    const resolve = (result: HitResult): void => {
      if (waiting) {
        return;
      }
      waiting = true;
      results.push(result);
      graphics.clear();
      keyText.setVisible(false);
      this.showResult(result, at.x, at.y);
      index += 1;
      if (index < cfg.keys.length) {
        this.delay(cfg.gapMs, startCircle);
      } else {
        this.delay(500, () => {
          finish({ results, success: results.every((r) => r !== 'fail'), charges: 0 });
        });
      }
    };
    this.keyHandler = (key, now) => {
      if (waiting || key !== cfg.keys[index]) {
        return;
      }
      const relative = now - impactAt;
      if (relative < cfg.failStartMs) {
        return;
      }
      resolve(
        relative < cfg.normalStartMs ? 'fail'
          : relative < cfg.perfectStartMs ? 'normal' : 'perfect',
      );
    };
    this.frame = () => {
      if (waiting) {
        return;
      }
      const relative = performance.now() - impactAt;
      if (relative > cfg.endMs) {
        resolve('fail');
        return;
      }
      const progress = Phaser.Math.Clamp((relative + cfg.circleDurationMs) / cfg.circleDurationMs, 0, 1);
      const radius = targetRadius + (startRadius - targetRadius) * (1 - progress);
      const color = relative >= cfg.perfectStartMs ? 0x8dffb0
        : relative >= cfg.normalStartMs ? 0xfff0a5 : 0xff7b7b;
      graphics.clear();
      graphics.lineStyle(6, 0xffffff, 0.9).strokeCircle(at.x, at.y, targetRadius);
      graphics.lineStyle(9, color, 1).strokeCircle(at.x, at.y, radius);
    };
    startCircle();
  }

  private runDirectionSequence(
    cfg: DirectionSequenceCommand,
    at: { x: number; y: number },
    finish: (outcome: CommandOutcome) => void,
  ): void {
    const graphics = this.track(this.scene.add.graphics().setDepth(3050));
    const sequence = cfg.random
      ? Array.from({ length: cfg.count }, () => Phaser.Utils.Array.GetRandom(cfg.keys))
      : [...cfg.keys];
    const results: HitResult[] = [];
    const keyText = this.makeText(at.x, at.y - 10, '', cfg.random ? 120 : 70, '#ffffff');
    const subText = this.makeText(at.x, at.y + 95, '', 24, '#e6e6e6');
    let index = 0;
    let startedAt = performance.now();
    let sequenceStartedAt = startedAt;
    let ended = false;
    const duration = (): number => (cfg.random ? cfg.perKeyTimeMs : cfg.totalTimeMs);
    const origin = (): number => (cfg.random ? startedAt : sequenceStartedAt);
    const render = (): void => {
      keyText.setText(
        cfg.random
          ? keyLabel(sequence[index])
          : sequence.map((key, i) => (i < index ? '✓' : keyLabel(key))).join(' → '),
      );
      subText.setText(cfg.random ? `TECLA ${index + 1} / ${sequence.length}` : '');
    };
    const conclude = (outcomeResult: HitResult | 'success' | 'failure'): void => {
      if (ended) {
        return;
      }
      ended = true;
      graphics.clear();
      keyText.setVisible(false);
      subText.setVisible(false);
      if (cfg.graded) {
        const overall: HitResult = outcomeResult === 'failure' ? 'fail'
          : results.every((r) => r === 'perfect') ? 'perfect' : 'normal';
        this.showResult(overall, at.x, at.y);
        this.delay(550, () => finish({ results: [overall], success: overall !== 'fail', charges: 0 }));
        return;
      }
      const success = outcomeResult === 'success';
      this.showResult(success ? 'normal' : 'fail', at.x, at.y, success ? 'SUCCESS' : 'FAIL');
      this.delay(550, () => finish({
        results: [success ? 'normal' : 'fail'],
        success,
        charges: 0,
      }));
    };
    this.keyHandler = (key, now) => {
      if (ended) {
        return;
      }
      if (key !== sequence[index]) {
        if (['w', 'a', 's', 'd'].includes(key)) {
          conclude('failure');
        }
        return;
      }
      if (cfg.graded) {
        const result: HitResult = now - startedAt <= cfg.perfectWithinMs ? 'perfect' : 'normal';
        results.push(result);
        if (result === 'perfect') {
          this.playPerfect();
        }
      }
      index += 1;
      if (index >= sequence.length) {
        conclude('success');
        return;
      }
      startedAt = now;
      render();
    };
    this.frame = () => {
      if (ended) {
        return;
      }
      const elapsed = performance.now() - origin();
      if (elapsed >= duration()) {
        conclude('failure');
        return;
      }
      const ratio = 1 - elapsed / duration();
      graphics.clear();
      graphics.fillStyle(0x000000, 0.6).fillRect(at.x - 160, at.y + 130, 320, 18);
      graphics.fillStyle(ratio > 0.4 ? 0x8dffb0 : 0xff7b7b, 1)
        .fillRect(at.x - 158, at.y + 132, 316 * ratio, 14);
    };
    startedAt = performance.now();
    sequenceStartedAt = startedAt;
    render();
  }

  private runHorizontalControl(
    cfg: HorizontalControlCommand,
    at: { x: number; y: number },
    finish: (outcome: CommandOutcome) => void,
  ): void {
    const graphics = this.track(this.scene.add.graphics().setDepth(3050));
    const timerText = this.makeText(at.x, at.y - cfg.lengthPx - 40, '', 28, '#ffffff');
    this.makeText(at.x, at.y + cfg.lengthPx + 36, `${keyLabel(cfg.leftKey)} ← →  ${keyLabel(cfg.rightKey)}`, 26, '#e6e6e6');
    const radius = (cfg.lengthPx * cfg.ballDiameterRatio) / 2;
    const speed = cfg.lengthPx * cfg.speedRatio;
    let offset = 0;
    let direction = Math.random() < 0.5 ? -1 : 1;
    const startedAt = performance.now();
    let last = startedAt;
    let ended = false;
    const conclude = (success: boolean): void => {
      ended = true;
      graphics.clear();
      timerText.setVisible(false);
      this.showResult(success ? 'normal' : 'fail', at.x, at.y, success ? 'SUCCESS' : 'FAIL');
      this.delay(550, () => finish({
        results: [success ? 'normal' : 'fail'],
        success,
        charges: 0,
      }));
    };
    this.keyHandler = (key) => {
      if (key === cfg.leftKey) {
        direction = -1;
      } else if (key === cfg.rightKey) {
        direction = 1;
      }
    };
    this.frame = () => {
      if (ended) {
        return;
      }
      const now = performance.now();
      offset += direction * speed * ((now - last) / 1000);
      last = now;
      const elapsed = now - startedAt;
      if (Math.abs(offset) + radius > cfg.lengthPx / 2) {
        conclude(false);
        return;
      }
      if (elapsed >= cfg.durationMs) {
        conclude(true);
        return;
      }
      timerText.setText(((cfg.durationMs - elapsed) / 1000).toFixed(1));
      graphics.clear();
      graphics.fillStyle(0x000000, 0.55)
        .fillRect(at.x - cfg.lengthPx / 2, at.y - cfg.lengthPx, cfg.lengthPx, cfg.lengthPx * 2);
      graphics.lineStyle(5, 0xd47cff, 1)
        .strokeRect(at.x - cfg.lengthPx / 2, at.y - cfg.lengthPx, cfg.lengthPx, cfg.lengthPx * 2);
      graphics.fillStyle(0xfff0a5, 1).fillCircle(at.x + offset, at.y, radius);
      graphics.lineStyle(3, 0xffffff, 1).strokeCircle(at.x + offset, at.y, radius);
    };
  }

  private runCircleOverlap(
    cfg: CircleOverlapCommand,
    at: { x: number; y: number },
    finish: (outcome: CommandOutcome) => void,
  ): void {
    const graphics = this.track(this.scene.add.graphics().setDepth(3050));
    this.makeText(at.x, at.y - cfg.stationaryRadiusPx - 46, `${keyLabel(cfg.key)} cuando el círculo esté dentro`, 26, '#e6e6e6');
    const R = cfg.stationaryRadiusPx;
    const r = R * cfg.movingRadiusRatio;
    const speed = R * cfg.speedRatio;
    const startedAt = performance.now();
    let ended = false;
    const offsetAt = (now: number): number => cfg.startOffsetPx + speed * ((now - startedAt) / 1000);
    const conclude = (result: HitResult): void => {
      ended = true;
      graphics.clear();
      const charges = result === 'perfect' ? cfg.perfectCharges
        : result === 'normal' ? cfg.normalCharges : 0;
      this.showResult(result, at.x, at.y);
      this.delay(550, () => finish({ results: [result], success: charges > 0, charges }));
    };
    this.keyHandler = (key, now) => {
      if (ended || key !== cfg.key) {
        return;
      }
      const distance = Math.abs(offsetAt(now));
      const ratio = circleOverlapArea(R, r, distance) / (Math.PI * r * r);
      if (distance + r < R) {
        conclude('perfect');
      } else if (ratio >= cfg.normalOverlap) {
        conclude('normal');
      } else {
        conclude('fail');
      }
    };
    this.frame = () => {
      if (ended) {
        return;
      }
      const now = performance.now();
      const offset = offsetAt(now);
      if (offset - r > R || now - startedAt >= cfg.timeoutMs) {
        conclude('fail');
        return;
      }
      graphics.clear();
      graphics.fillStyle(0x68d391, 0.18).fillCircle(at.x, at.y, R);
      graphics.lineStyle(6, 0xffffff, 1).strokeCircle(at.x, at.y, R);
      graphics.fillStyle(0x8dd7ff, 0.5).fillCircle(at.x + offset, at.y, r);
      graphics.lineStyle(5, 0x8dd7ff, 1).strokeCircle(at.x + offset, at.y, r);
    };
  }

  private runRapidPress(
    cfg: RapidPressCommand,
    at: { x: number; y: number },
    finish: (outcome: CommandOutcome) => void,
  ): void {
    const graphics = this.track(this.scene.add.graphics().setDepth(3050));
    const counter = this.makeText(at.x, at.y - 10, String(cfg.presses), 130, '#ffffff');
    this.makeText(at.x, at.y + 90, `¡PULSA ${keyLabel(cfg.key)}!`, 32, '#e6e6e6');
    const startedAt = performance.now();
    let remaining = cfg.presses;
    let ended = false;
    const conclude = (success: boolean): void => {
      ended = true;
      graphics.clear();
      counter.setVisible(false);
      this.showResult(success ? 'normal' : 'fail', at.x, at.y, success ? 'SUCCESS' : 'FAIL');
      this.delay(550, () => finish({
        results: [success ? 'normal' : 'fail'],
        success,
        charges: 0,
      }));
    };
    this.keyHandler = (key) => {
      if (ended || key !== cfg.key) {
        return;
      }
      remaining -= 1;
      counter.setText(String(remaining));
      if (remaining <= 0) {
        conclude(true);
      }
    };
    this.frame = () => {
      if (ended) {
        return;
      }
      const elapsed = performance.now() - startedAt;
      if (elapsed >= cfg.durationMs) {
        conclude(false);
        return;
      }
      const ratio = 1 - elapsed / cfg.durationMs;
      graphics.clear();
      graphics.fillStyle(0x000000, 0.6).fillRect(at.x - 160, at.y + 130, 320, 18);
      graphics.fillStyle(ratio > 0.4 ? 0x8dd7ff : 0xff7b7b, 1)
        .fillRect(at.x - 158, at.y + 132, 316 * ratio, 14);
    };
  }
}
