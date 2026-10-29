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
  gainFuraiSpirit,
  MAX_HEALTH,
  MAX_SPIRIT,
  spendCost,
} from './combat-rules';
import stripBlackMattes from './strip-black-matte';

const WIDTH = GAME_CONFIG.canvas.width;
const HEIGHT = GAME_CONFIG.canvas.height;
const NORMALIZED_SPRITE_KEY_SET: ReadonlySet<string> = new Set(NORMALIZED_SPRITE_KEYS);
const BOSSES = ['iobrontes', 'kosmelys'] as const;
const FURAI = GAME_CONFIG.characters.furai;
const FRAMES = FURAI.frames;
const ABILITIES = GAME_CONFIG.abilities.furai;
const TEST_DAMAGE = 20;
const SPIRIT_GAIN = 30;

type FuraiAbility = (typeof ABILITIES)[number];
type TestPhase = 'idle' | 'target-boss' | 'action';

export default class FuraiTestScene extends Phaser.Scene {
  private state: CombatState = createCombatState();
  private phase: TestPhase = 'idle';
  private pendingAbility: FuraiAbility | null = null;
  private furai!: Phaser.GameObjects.Sprite;
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
    super({ key: 'escena_furai_prueba' });
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
    this.createFurai();
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

  private createFurai(): void {
    this.furai = this.add.sprite(FURAI.x, FURAI.feetY, FRAMES.idle)
      .setOrigin(0.5, 1)
      .setDepth(FURAI.depth);
    this.sizeSprite(this.furai, FRAMES.idle, FURAI.displayHeight);
    this.add.ellipse(FURAI.x, FURAI.feetY - 3, FURAI.displayHeight * 0.68, 38, 0x100d1b, 0.34)
      .setDepth(FURAI.depth - 1);
    this.add.text(FURAI.nameLabelX, FURAI.feetY + 4, FURAI.name.toUpperCase(), {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f2d9a1',
      stroke: '#171326',
      strokeThickness: 5,
    }).setOrigin(0.5, 0).setDepth(10);
    this.breathing = this.tweens.add({
      targets: this.furai,
      y: { from: FURAI.feetY, to: FURAI.feetY - 2 },
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
    const status = this.state.party.furai;
    const abilityLines = ABILITIES.map((ability, index) => {
      const cost = ability.resource ? `  [${ability.cost} ${ability.resource}]` : '';
      return `${index + 1}  ${ability.name} — ${ability.detail}${cost}`;
    });
    this.helpText.setText([
      `ESCENA DE PRUEBA · FURAI   VIDA ${status.health} / ${MAX_HEALTH.furai}`,
      `ESPÍRITU ${status.spirit} / ${MAX_SPIRIT}`,
      ...abilityLines,
      'W A S D  Esquivar (libre)',
      'ESPACIO  Salto',
      `G  Ganar ${SPIRIT_GAIN} de espíritu (como al defender)`,
      `K  Recibir ${TEST_DAMAGE} de daño`,
      'B  Alternar Armor Break en ambos jefes',
      'R  Reiniciar vida y espíritu',
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
    if (key === 'g') {
      gainFuraiSpirit(this.state, SPIRIT_GAIN);
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
    if (ability && canUseAbility(this.state, 'furai', ability)) {
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
    this.setFuraiFrame(FRAMES.defense[direction], GAME_CONFIG.timing.spritePoseMs);
  }

  private jump(): void {
    this.cancelJump();
    this.setFuraiFrame(FRAMES.jump, GAME_CONFIG.timing.jumpPoseMs);
    const scale = GAME_CONFIG.sprite.frameScale[FRAMES.jump] ?? 1;
    const { startLift, peakLift } = GAME_CONFIG.sprite.jump;
    const height = FURAI.displayHeight * scale;
    const half = GAME_CONFIG.timing.jumpPoseMs / 2;
    this.furai.setY(FURAI.feetY - height * startLift);
    this.jumpTween = this.tweens.add({
      targets: this.furai,
      y: FURAI.feetY - height * peakLift,
      duration: half,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.jumpTween = this.tweens.add({
          targets: this.furai,
          y: FURAI.feetY,
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
      this.furai.setY(FURAI.feetY);
    }
  }

  private takeDamage(): void {
    const status = this.state.party.furai;
    if (status.health <= 1) {
      return;
    }
    const damage = damagePartyMember(
      this.state,
      'furai',
      Math.min(TEST_DAMAGE, status.health - 1),
    );
    this.setFuraiFrame(FRAMES.hit, 550);
    this.showFloatingText(`-${damage}`, FURAI.x, FURAI.feetY - FURAI.displayHeight - 5, '#ff9c9c');
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
    spendCost(this.state.party.furai, ability);
    this.soundscape.play(ability.sound);
    this.refresh();
    if (ability.id === 'armor-break') {
      this.performArmorBreak(boss, ability);
      return;
    }
    this.performHit(boss, ability, 0);
  }

  private performArmorBreak(boss: BossId, ability: FuraiAbility): void {
    this.setFuraiFrame(ability.frame);
    this.tweens.add({
      targets: this.furai,
      x: FURAI.x + 55,
      duration: 150,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.state.bosses[boss].armorBreak = true;
        const target = GAME_CONFIG.characters[boss];
        this.createImpact(target.x, target.feetY - target.displayHeight * 0.6, ability.color, 1);
        this.refresh();
        this.finishAbility();
      },
    });
  }

  private performHit(boss: BossId, ability: FuraiAbility, hitIndex: number): void {
    this.setFuraiFrame(ability.frame);
    this.tweens.add({
      targets: this.furai,
      x: FURAI.x + 55,
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
        this.finishAbility();
      },
    });
  }

  private finishAbility(): void {
    this.time.delayedCall(GAME_CONFIG.timing.attackRecoveryMs, () => {
      BOSSES.forEach((boss) => {
        if (this.state.bosses[boss].health <= 0) {
          this.state.bosses[boss].health = createCombatState().bosses[boss].health;
        }
      });
      this.setFuraiFrame(FRAMES.idle);
      this.phase = 'idle';
      this.refresh();
    });
  }

  private setFuraiFrame(frame: string, durationMs = 0): void {
    const generation = ++this.frameGeneration;
    this.breathing.stop();
    this.furai.setY(FURAI.feetY);
    if (frame === FRAMES.idle) {
      this.breathing.restart();
    }
    this.furai.setTexture(frame);
    this.sizeSprite(this.furai, frame, FURAI.displayHeight);
    if (durationMs > 0) {
      this.time.delayedCall(durationMs, () => {
        if (this.frameGeneration === generation && this.phase !== 'action') {
          this.setFuraiFrame(FRAMES.idle);
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
