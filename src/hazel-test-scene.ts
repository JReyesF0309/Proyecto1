import Phaser from 'phaser';
import {
  BossId,
  Direction,
  GAME_CONFIG,
  GAME_FONT_FAMILY,
  ICON_ASSETS,
  IMAGE_ASSETS,
  NORMALIZED_SPRITE_KEYS,
  UI_FONT_FAMILY,
} from './game-config';
import type { HazelForm } from './game-config';
import Soundscape from './soundscape';
import { createCombatState, damageBossWithArmorBreak, CombatState } from './combat-rules';
import stripBlackMattes from './strip-black-matte';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const NORMALIZED_SPRITE_KEY_SET: ReadonlySet<string> = new Set(NORMALIZED_SPRITE_KEYS);
const BOSSES = ['iobrontes', 'kosmelys'] as const;
const HAZEL = GAME_CONFIG.characters.hazel;

type HazelAbility =
  | (typeof GAME_CONFIG.abilities.hazel.ignis)[number]
  | (typeof GAME_CONFIG.abilities.hazel.glacio)[number];
type TestPhase = 'idle' | 'target-boss' | 'action';

export default class HazelTestScene extends Phaser.Scene {
  private state: CombatState = createCombatState();
  private phase: TestPhase = 'idle';
  private pendingAbility: HazelAbility | null = null;
  private hazel!: Phaser.GameObjects.Sprite;
  private breathing!: Phaser.Tweens.Tween;
  private jumpTween?: Phaser.Tweens.Tween;
  private frameGeneration = 0;
  private bossSprites!: Record<BossId, Phaser.GameObjects.Sprite>;
  private bossFrameGeneration: Record<BossId, number> = { iobrontes: 0, kosmelys: 0 };
  private bossHealthText!: Record<BossId, Phaser.GameObjects.Text>;
  private armorBreakText!: Record<BossId, Phaser.GameObjects.Text>;
  private helpText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private soundscape!: Soundscape;

  constructor() {
    super({ key: 'escena_pruebahazel' });
  }

  preload(): void {
    Object.entries(IMAGE_ASSETS).forEach(([key, asset]) => {
      this.load.image(key, asset);
    });
    Object.entries(ICON_ASSETS).forEach(([id, asset]) => {
      this.load.image(`icon_${id}`, asset);
    });
  }

  create(): void {
    this.state = createCombatState();
    this.phase = 'idle';
    this.pendingAbility = null;
    this.frameGeneration = 0;
    this.bossFrameGeneration = { iobrontes: 0, kosmelys: 0 };
    this.soundscape = new Soundscape();
    stripBlackMattes(
      this.textures,
      Object.keys(IMAGE_ASSETS).filter((key) =>
        key !== 'arena' && !NORMALIZED_SPRITE_KEY_SET.has(key),
      ),
    );

    this.add.image(WIDTH / 2, HEIGHT / 2, 'arena').setDisplaySize(WIDTH, HEIGHT);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x171323, 0.14);
    this.createHazel();
    this.createBosses();
    this.createTexts();
    this.refresh();
    this.soundscape.start();

    this.input.keyboard?.on('keydown', this.onKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.onKeyDown, this);
      this.soundscape.destroy();
    });
  }

  private get form(): HazelForm {
    return this.state.hazelForm;
  }

  private get frames() {
    return GAME_CONFIG.characters.hazel.forms[this.form];
  }

  private get abilities(): readonly HazelAbility[] {
    return GAME_CONFIG.abilities.hazel[this.form];
  }

  private sizeSprite(sprite: Phaser.GameObjects.Sprite, frame: string, height: number): void {
    if (!this.textures.exists(frame)) {
      throw new Error(`No se pudo cargar el fotograma ${frame}`);
    }
    const normalization = GAME_CONFIG.sprite;
    const scale = height * (normalization.frameScale[frame] ?? 1) / normalization.referenceVisibleHeight;
    sprite
      .setOrigin(0.5, normalization.groundBaselineY / normalization.canvasSize)
      .setDisplaySize(normalization.canvasSize * scale, normalization.canvasSize * scale);
  }

  private createHazel(): void {
    this.hazel = this.add.sprite(HAZEL.x, HAZEL.feetY, this.frames.idle)
      .setOrigin(0.5, 1)
      .setDepth(HAZEL.depth);
    this.sizeSprite(this.hazel, this.frames.idle, HAZEL.displayHeight);
    this.add.ellipse(HAZEL.x, HAZEL.feetY - 3, HAZEL.displayHeight * 0.68, 38, 0x100d1b, 0.34)
      .setDepth(HAZEL.depth - 1);
    this.add.text(HAZEL.nameLabelX, HAZEL.feetY + 4, HAZEL.name.toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f2d9a1',
      stroke: '#171326',
      strokeThickness: 5,
    }).setOrigin(0.5, 0).setDepth(10);
    this.breathing = this.tweens.add({
      targets: this.hazel,
      y: { from: HAZEL.feetY, to: HAZEL.feetY - 2 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createBosses(): void {
    const sprites: Partial<Record<BossId, Phaser.GameObjects.Sprite>> = {};
    const healthTexts: Partial<Record<BossId, Phaser.GameObjects.Text>> = {};
    const armorTexts: Partial<Record<BossId, Phaser.GameObjects.Text>> = {};
    BOSSES.forEach((id) => {
      const config = GAME_CONFIG.characters[id];
      const sprite = this.add.sprite(config.x, config.feetY, config.frames.idle)
        .setOrigin(0.5, 1)
        .setDepth(config.depth);
      this.sizeSprite(sprite, config.frames.idle, config.displayHeight);
      sprites[id] = sprite;
      healthTexts[id] = this.add.text(config.x, 60, '', {
        fontFamily: UI_FONT_FAMILY,
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#171326',
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(20);
      armorTexts[id] = this.add.text(config.x, 95, 'ARMOR BREAK', {
        fontFamily: UI_FONT_FAMILY,
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#e1a8ff',
        stroke: '#171326',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(20).setVisible(false);
    });
    this.bossSprites = sprites as Record<BossId, Phaser.GameObjects.Sprite>;
    this.bossHealthText = healthTexts as Record<BossId, Phaser.GameObjects.Text>;
    this.armorBreakText = armorTexts as Record<BossId, Phaser.GameObjects.Text>;
  }

  private createTexts(): void {
    const style = {
      fontFamily: UI_FONT_FAMILY,
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f5e9ce',
      stroke: '#171326',
      strokeThickness: 5,
      lineSpacing: 6,
    };
    this.helpText = this.add.text(30, 20, '', style).setDepth(20);
    this.statusText = this.add.text(WIDTH / 2, HEIGHT - 40, '', {
      ...style,
      fontSize: '28px',
    }).setOrigin(0.5).setDepth(20);
  }

  private refresh(): void {
    const abilityLines = this.abilities.map(
      (ability, index) => `${index + 1}  ${ability.name} — ${ability.detail}`,
    );
    this.helpText.setText([
      `ESCENA DE PRUEBA · HAZEL (${this.form === 'ignis' ? 'IGNIS' : 'GLACIO'})`,
      ...abilityLines,
      'W A S D  Esquivar (libre)',
      'ESPACIO  Salto',
      'B  Alternar Armor Break en ambos jefes',
      'ESC  Volver a la bienvenida',
    ]);
    BOSSES.forEach((id) => {
      const config = GAME_CONFIG.characters[id];
      this.bossHealthText[id].setText(`${config.name}  ${this.state.bosses[id].health}`);
      this.armorBreakText[id].setVisible(this.state.bosses[id].armorBreak);
    });
    this.statusText.setText(
      this.phase === 'target-boss'
        ? 'ELIGE JEFE:  1 Iobrontes  ·  2 Kosmelys  ·  ESC cancelar'
        : '',
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.repeat) {
      return;
    }
    this.soundscape.start();
    const key = event.key.toLowerCase();
    if (key === 'm') {
      this.soundscape.toggle();
      return;
    }
    if (this.phase === 'target-boss') {
      if (key === 'escape') {
        this.pendingAbility = null;
        this.phase = 'idle';
        this.refresh();
      } else if (key === '1' || key === '2') {
        this.confirmTarget(key === '1' ? 'iobrontes' : 'kosmelys');
      }
      return;
    }
    if (key === 'escape' && this.phase === 'idle') {
      this.scene.start('escena_bienvenida');
      return;
    }
    if (this.phase !== 'idle') {
      return;
    }
    if (key === 'b') {
      const enable = !BOSSES.every((id) => this.state.bosses[id].armorBreak);
      BOSSES.forEach((id) => {
        this.state.bosses[id].armorBreak = enable;
      });
      this.refresh();
      return;
    }
    if (event.code === 'Space') {
      event.preventDefault();
      this.jump();
      return;
    }
    const direction = this.directionForKey(key);
    if (direction) {
      this.dodge(direction);
      return;
    }
    const ability = this.abilities[Number(key) - 1];
    if (ability) {
      this.performAbility(ability);
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

  private dodge(direction: Direction): void {
    this.cancelJump();
    this.setHazelFrame(this.frames.defense[direction], GAME_CONFIG.timing.spritePoseMs);
  }

  private jump(): void {
    this.cancelJump();
    this.setHazelFrame(this.frames.jump, GAME_CONFIG.timing.jumpPoseMs);
    const scale = GAME_CONFIG.sprite.frameScale[this.frames.jump] ?? 1;
    const { startLift, peakLift } = GAME_CONFIG.sprite.jump;
    const height = HAZEL.displayHeight * scale;
    const half = GAME_CONFIG.timing.jumpPoseMs / 2;
    this.hazel.setY(HAZEL.feetY - height * startLift);
    this.jumpTween = this.tweens.add({
      targets: this.hazel,
      y: HAZEL.feetY - height * peakLift,
      duration: half,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.jumpTween = this.tweens.add({
          targets: this.hazel,
          y: HAZEL.feetY,
          duration: half,
          ease: 'Sine.easeIn',
          onComplete: () => {
            this.jumpTween = undefined;
          },
        });
      },
    });
  }

  private cancelJump(): void {
    if (this.jumpTween) {
      this.jumpTween.stop();
      this.jumpTween = undefined;
      this.hazel.setY(HAZEL.feetY);
    }
  }

  private performAbility(ability: HazelAbility): void {
    if (ability.id === 'flame-dance' || ability.id === 'ignis-shift') {
      this.phase = 'action';
      this.refresh();
      this.executeAreaAbility(ability);
      return;
    }
    this.pendingAbility = ability;
    this.phase = 'target-boss';
    this.refresh();
  }

  private confirmTarget(boss: BossId): void {
    const ability = this.pendingAbility;
    if (!ability) {
      return;
    }
    this.pendingAbility = null;
    this.phase = 'action';
    this.refresh();
    this.executeTargetedAbility(boss, ability);
  }

  private executeTargetedAbility(boss: BossId, ability: HazelAbility): void {
    this.cancelJump();
    if (ability.id === 'glacio-shift') {
      this.soundscape.play('shift');
      this.setHazelFrame('hazel_cambio');
      this.time.delayedCall(GAME_CONFIG.timing.spritePoseMs, () => {
        this.changeForm('glacio');
        this.soundscape.play('shard');
        this.launchProjectile('hielo_debil', boss, () => {
          this.resolveHit(boss, ability.damage, 'hielo_debil');
          this.finishAbility();
        });
      });
      return;
    }
    this.soundscape.play('shard');
    this.setHazelFrame(ability.frame);
    this.time.delayedCall(GAME_CONFIG.timing.attackHitIntervalMs, () => {
      this.resolveHit(boss, ability.damage, 'hielo');
      this.finishAbility();
    });
  }

  private executeAreaAbility(ability: HazelAbility): void {
    this.cancelJump();
    if (ability.id === 'ignis-shift') {
      this.soundscape.play('shift');
      this.setHazelFrame('hazel_cambio');
      this.time.delayedCall(GAME_CONFIG.timing.spritePoseMs, () => {
        this.changeForm('ignis');
        this.releaseAreaAttack(ability);
      });
      return;
    }
    this.setHazelFrame(ability.frame);
    this.releaseAreaAttack(ability);
  }

  private releaseAreaAttack(ability: HazelAbility): void {
    const weakFire = ability.id === 'ignis-shift';
    const effect = weakFire ? 'fuego_debil' : 'fuego';
    this.soundscape.play('flame');
    const living = BOSSES.filter((boss) => this.state.bosses[boss].health > 0);
    if (weakFire) {
      let pending = living.length;
      if (pending === 0) {
        this.finishAbility();
        return;
      }
      living.forEach((boss) => {
        this.launchProjectile(effect, boss, () => {
          this.resolveHit(boss, ability.damage, effect);
          pending -= 1;
          if (pending === 0) {
            this.finishAbility();
          }
        });
      });
      return;
    }
    living.forEach((boss) => this.resolveHit(boss, ability.damage, effect));
    this.finishAbility();
  }

  private resolveHit(boss: BossId, baseDamage: number, effect: string): void {
    if (this.state.bosses[boss].health <= 0) {
      return;
    }
    const result = damageBossWithArmorBreak(this.state, boss, baseDamage);
    const target = GAME_CONFIG.characters[boss];
    this.showImpact(effect, boss);
    this.setBossFrame(boss, target.frames.hit, GAME_CONFIG.timing.spritePoseMs);
    this.showFloatingText(
      `-${result.damage}`,
      target.x,
      target.feetY - target.displayHeight * 0.7,
      result.empowered ? '#fff0a5' : '#ffffff',
    );
    this.refresh();
  }

  private finishAbility(): void {
    BOSSES.forEach((boss) => {
      if (this.state.bosses[boss].health <= 0) {
        this.state.bosses[boss].health = boss === 'iobrontes'
          ? createCombatState().bosses.iobrontes.health
          : createCombatState().bosses.kosmelys.health;
      }
    });
    this.refresh();
    const attackFrame = this.frames.attack;
    const heldFrame = this.hazel.texture.key;
    const delay = heldFrame === attackFrame ? GAME_CONFIG.timing.hazelAttackPoseMs : 0;
    this.time.delayedCall(delay, () => {
      this.setHazelFrame(this.frames.idle);
      this.phase = 'idle';
      this.refresh();
    });
  }

  private changeForm(form: HazelForm): void {
    this.state.hazelForm = form;
    this.setHazelFrame(GAME_CONFIG.characters.hazel.forms[form].idle);
    this.refresh();
  }

  private setHazelFrame(frame: string, durationMs = 0): void {
    const generation = ++this.frameGeneration;
    const isIdle = frame === this.frames.idle;
    this.breathing.stop();
    this.hazel.setY(HAZEL.feetY);
    if (isIdle) {
      this.breathing.restart();
    }
    this.hazel.setTexture(frame);
    this.sizeSprite(this.hazel, frame, HAZEL.displayHeight);
    if (durationMs > 0) {
      this.time.delayedCall(durationMs, () => {
        if (this.frameGeneration === generation && this.phase !== 'action') {
          this.setHazelFrame(this.frames.idle);
        }
      });
    }
  }

  private setBossFrame(boss: BossId, frame: string, durationMs: number): void {
    const config = GAME_CONFIG.characters[boss];
    const generation = ++this.bossFrameGeneration[boss];
    const sprite = this.bossSprites[boss];
    sprite.setTexture(frame);
    this.sizeSprite(sprite, frame, config.displayHeight);
    this.time.delayedCall(durationMs, () => {
      if (this.bossFrameGeneration[boss] === generation) {
        sprite.setTexture(config.frames.idle);
        this.sizeSprite(sprite, config.frames.idle, config.displayHeight);
      }
    });
  }

  private launchProjectile(effect: string, boss: BossId, onImpact: () => void): void {
    const source = this.textures.get(effect).getSourceImage();
    const scale = 92 / Math.max(source.width, source.height);
    const sprite = this.add.image(HAZEL.x, HAZEL.feetY - HAZEL.displayHeight * 0.55, effect)
      .setDisplaySize(source.width * scale, source.height * scale)
      .setDepth(16);
    const target = GAME_CONFIG.characters[boss];
    this.tweens.add({
      targets: sprite,
      x: target.x,
      y: target.feetY - target.displayHeight * 0.55,
      duration: GAME_CONFIG.timing.attackHitIntervalMs,
      ease: 'Sine.easeIn',
      onComplete: () => {
        sprite.destroy();
        onImpact();
      },
    });
  }

  private showImpact(effect: string, boss: BossId): void {
    const config = GAME_CONFIG.characters[boss];
    const source = this.textures.get(effect).getSourceImage();
    const scale = 190 / Math.max(source.width, source.height);
    const sprite = this.add.image(config.x, config.feetY - config.displayHeight * 0.55, effect)
      .setDisplaySize(source.width * scale, source.height * scale)
      .setDepth(16);
    this.tweens.add({
      targets: sprite,
      alpha: 0,
      scale: 1.35,
      duration: 450,
      onComplete: () => sprite.destroy(),
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
    this.tweens.add({
      targets: label,
      y: y - 55,
      alpha: 0,
      duration: 950,
      onComplete: () => label.destroy(),
    });
  }
}
