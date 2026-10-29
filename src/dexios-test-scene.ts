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
import Soundscape from './soundscape';
import {
  canUseAbility,
  CombatState,
  createCombatState,
  damageBossWithArmorBreak,
  damagePartyMember,
  MAX_CHAOS,
  MAX_HEALTH,
  MAX_MANA,
  spendCost,
} from './combat-rules';
import stripBlackMattes from './strip-black-matte';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const NORMALIZED_SPRITE_KEY_SET: ReadonlySet<string> = new Set(NORMALIZED_SPRITE_KEYS);
const BOSSES = ['iobrontes', 'kosmelys'] as const;
const DEXIOS = GAME_CONFIG.characters.dexios;
const FRAMES = DEXIOS.frames;
const ABILITIES = GAME_CONFIG.abilities.dexios;
const TEST_DAMAGE = 20;

type DexiosAbility = (typeof ABILITIES)[number];
type TestPhase = 'idle' | 'target-boss' | 'action';

export default class DexiosTestScene extends Phaser.Scene {
  private state: CombatState = createCombatState();
  private phase: TestPhase = 'idle';
  private pendingAbility: DexiosAbility | null = null;
  private dexios!: Phaser.GameObjects.Sprite;
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
    super({ key: 'escena_dexios_prueba' });
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
    this.createDexios();
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

  private createDexios(): void {
    this.dexios = this.add.sprite(DEXIOS.x, DEXIOS.feetY, FRAMES.idle)
      .setOrigin(0.5, 1)
      .setDepth(DEXIOS.depth);
    this.sizeSprite(this.dexios, FRAMES.idle, DEXIOS.displayHeight);
    this.add.ellipse(DEXIOS.x, DEXIOS.feetY - 3, DEXIOS.displayHeight * 0.68, 38, 0x100d1b, 0.34)
      .setDepth(DEXIOS.depth - 1);
    this.add.text(DEXIOS.nameLabelX, DEXIOS.feetY + 4, DEXIOS.name.toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f2d9a1',
      stroke: '#171326',
      strokeThickness: 5,
    }).setOrigin(0.5, 0).setDepth(10);
    this.breathing = this.tweens.add({
      targets: this.dexios,
      y: { from: DEXIOS.feetY, to: DEXIOS.feetY - 2 },
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
    const status = this.state.party.dexios;
    const abilityLines = ABILITIES.map((ability, index) => {
      const cost = ability.resource ? `  [${ability.cost} ${ability.resource}]` : '';
      return `${index + 1}  ${ability.name} — ${ability.detail}${cost}`;
    });
    this.helpText.setText([
      `ESCENA DE PRUEBA · DEXIOS   VIDA ${status.health} / ${MAX_HEALTH.dexios}`,
      `MANÁ ${status.mana} / ${MAX_MANA.dexios}   CAOS ${status.chaos} / ${MAX_CHAOS}`,
      ...abilityLines,
      'W A S D  Esquivar (libre)',
      'ESPACIO  Salto',
      'K  Recibir 20 de daño (genera caos)',
      'B  Alternar Armor Break en ambos jefes',
      'R  Reiniciar vida, maná y caos',
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
    if (key === 'r') {
      this.scene.restart();
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
    if (key === 'k') {
      this.takeDamage();
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
    const ability = ABILITIES[Number(key) - 1];
    if (ability && canUseAbility(this.state, 'dexios', ability)) {
      this.pendingAbility = ability;
      this.phase = 'target-boss';
      this.refresh();
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
    this.setDexiosFrame(FRAMES.defense[direction], GAME_CONFIG.timing.spritePoseMs);
  }

  private jump(): void {
    this.cancelJump();
    this.setDexiosFrame(FRAMES.jump, GAME_CONFIG.timing.jumpPoseMs);
    const scale = GAME_CONFIG.sprite.frameScale[FRAMES.jump] ?? 1;
    const { startLift, peakLift } = GAME_CONFIG.sprite.jump;
    const height = DEXIOS.displayHeight * scale;
    const half = GAME_CONFIG.timing.jumpPoseMs / 2;
    this.dexios.setY(DEXIOS.feetY - height * startLift);
    this.jumpTween = this.tweens.add({
      targets: this.dexios,
      y: DEXIOS.feetY - height * peakLift,
      duration: half,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.jumpTween = this.tweens.add({
          targets: this.dexios,
          y: DEXIOS.feetY,
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
      this.dexios.setY(DEXIOS.feetY);
    }
  }

  private takeDamage(): void {
    const status = this.state.party.dexios;
    if (status.health <= 1) {
      return;
    }
    const damage = damagePartyMember(
      this.state,
      'dexios',
      Math.min(TEST_DAMAGE, status.health - 1),
    );
    this.setDexiosFrame(FRAMES.hit, 550);
    this.showFloatingText(`-${damage}`, DEXIOS.x, DEXIOS.feetY - DEXIOS.displayHeight - 5, '#ff9c9c');
    this.refresh();
  }

  private confirmTarget(boss: BossId): void {
    const ability = this.pendingAbility;
    if (!ability) {
      return;
    }
    this.pendingAbility = null;
    this.phase = 'action';
    this.cancelJump();
    spendCost(this.state.party.dexios, ability);
    this.soundscape.play(ability.sound);
    this.refresh();
    this.performHit(boss, ability, 0);
  }

  private performHit(boss: BossId, ability: DexiosAbility, hitIndex: number): void {
    this.setDexiosFrame(ability.frame);
    this.tweens.add({
      targets: this.dexios,
      x: DEXIOS.x + 55,
      duration: 150,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.state.bosses[boss].health > 0) {
          const result = damageBossWithArmorBreak(this.state, boss, ability.damage);
          const target = GAME_CONFIG.characters[boss];
          this.setBossFrame(boss, target.frames.hit, GAME_CONFIG.timing.spritePoseMs);
          this.createImpact(
            target.x - 70 + hitIndex * 44,
            target.feetY - target.displayHeight * 0.6,
            ability.color,
            result.empowered ? 1.12 : 0.84,
          );
          this.showFloatingText(
            `-${result.damage}`,
            target.x - 50,
            target.feetY - target.displayHeight * 0.7 - hitIndex * 32,
            result.empowered ? '#fff0a5' : '#ffffff',
          );
          this.refresh();
        }
        if (hitIndex + 1 < ability.hits) {
          this.time.delayedCall(GAME_CONFIG.timing.attackHitIntervalMs, () => {
            this.performHit(boss, ability, hitIndex + 1);
          });
          return;
        }
        this.finishAbility(ability);
      },
    });
  }

  private finishAbility(ability: DexiosAbility): void {
    if (ability.selfDamage > 0) {
      const damage = damagePartyMember(
        this.state,
        'dexios',
        ability.selfDamage,
        false,
      );
      this.setDexiosFrame(FRAMES.hit, 550);
      this.showFloatingText(
        `-${damage}`,
        DEXIOS.x,
        DEXIOS.feetY - DEXIOS.displayHeight - 5,
        '#ff9c9c',
      );
    }
    this.refresh();
    this.time.delayedCall(GAME_CONFIG.timing.attackRecoveryMs, () => {
      BOSSES.forEach((boss) => {
        if (this.state.bosses[boss].health <= 0) {
          this.state.bosses[boss].health = createCombatState().bosses[boss].health;
        }
      });
      this.setDexiosFrame(FRAMES.idle);
      this.phase = 'idle';
      this.refresh();
    });
  }

  private setDexiosFrame(frame: string, durationMs = 0): void {
    const generation = ++this.frameGeneration;
    this.breathing.stop();
    this.dexios.setY(DEXIOS.feetY);
    if (frame === FRAMES.idle) {
      this.breathing.restart();
    }
    this.dexios.setTexture(frame);
    this.sizeSprite(this.dexios, frame, DEXIOS.displayHeight);
    if (durationMs > 0) {
      this.time.delayedCall(durationMs, () => {
        if (this.frameGeneration === generation && this.phase !== 'action') {
          this.setDexiosFrame(FRAMES.idle);
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

  private createImpact(x: number, y: number, color: number, scale: number): void {
    const glow = this.add.circle(x, y, 40 * scale, color, 0.27).setDepth(15);
    const flash = this.add.graphics().setDepth(16);
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
      duration: 420,
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
    this.tweens.add({
      targets: label,
      y: y - 55,
      alpha: 0,
      duration: 950,
      onComplete: () => label.destroy(),
    });
  }
}
