import Phaser from 'phaser';
import dexiosArt from '../assets/characters/dexios.png';
import iobrontesArt from '../assets/characters/iobrontes.png';
import {
  ATTACKS,
  canUseAttack,
  createCombatState,
  damageDexios,
  damageIobrontes,
  DEFENSE_WINDOW_MS,
  DefenseOutcome,
  Direction,
  ENEMY_ATTACK_DAMAGE,
  IMPERFECT_BLOCK_DAMAGE,
  MAX_CHAOS,
  MAX_DEXIOS_HEALTH,
  MAX_IOBRONTES_HEALTH,
  MAX_MANA,
  PERFECT_PARRY_DAMAGE,
  PROJECTILE_TRAVEL_MS,
  resolveDefense,
  spendAttackCost,
  CombatResult,
  CombatState,
  AttackDefinition,
  WIND_UP_MS,
} from './combat-rules';

const WIDTH = 1920;
const HEIGHT = 1080;
const COLORS = {
  ink: 0x100e1b,
  panel: 0x171528,
  panelLight: 0x25213a,
  gold: 0xe6bd63,
  cream: 0xf5e9ce,
  purple: 0x9c55e8,
  violet: 0xd47cff,
  green: 0x68d391,
  blue: 0x63b9ed,
  red: 0xef6262,
  lightning: 0xdec4ff,
  yellow: 0xffd65c,
};

interface AttackButton {
  container: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
}

export default class CombatScene extends Phaser.Scene {
  private state: CombatState = createCombatState();
  private phase: 'player' | 'player-action' | 'windup' | 'projectile' | 'result' = 'player';
  private result: CombatResult | null = null;
  private turn = 1;
  private dexios!: Phaser.GameObjects.Image;
  private iobrontes!: Phaser.GameObjects.Image;
  private statusText!: Phaser.GameObjects.Text;
  private defenseText!: Phaser.GameObjects.Text;
  private warningFill!: Phaser.GameObjects.Graphics;
  private healthBars!: Record<'dexios' | 'mana' | 'chaos' | 'iobrontes', Phaser.GameObjects.Graphics>;
  private resourceTexts!: Record<'dexios' | 'mana' | 'chaos' | 'iobrontes', Phaser.GameObjects.Text>;
  private attackButtons!: Map<string, AttackButton>;
  private defenseStartedAt = 0;
  private attackDirection: Direction | null = null;
  private responseDirection: Direction | null = null;
  private responseTime: number | null = null;
  private defenseOutcome: DefenseOutcome | null = null;
  private attackSequence: Direction[] = [];
  private activeBolt?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'combat' });
  }

  preload(): void {
    this.load.image('dexios', dexiosArt);
    this.load.image('iobrontes', iobrontesArt);
  }

  create(): void {
    this.state = createCombatState();
    this.phase = 'player';
    this.result = null;
    this.turn = 1;
    this.attackSequence = [];
    this.drawArena();
    this.createCharacters();
    this.createHud();
    this.input.keyboard?.on('keydown', this.onKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.onKeyDown, this);
    });
    this.setStatus('TU TURNO', 'Elige un ataque · 1 / 2 / 3');
    this.refreshHud();
  }

  update(): void {
    if (this.phase !== 'windup' || !this.attackDirection) {
      return;
    }
    const remaining = Math.max(0, 1 - (this.time.now - this.defenseStartedAt) / DEFENSE_WINDOW_MS);
    this.warningFill.clear();
    this.warningFill.fillStyle(COLORS.violet, 1);
    this.warningFill.fillRoundedRect(786, 227, 348 * remaining, 8, 4);
    this.defenseText.setText(`RESPONDE: ${this.directionControl(this.attackDirection)}   ·   ${Math.max(0, remaining).toFixed(1)} s`);
  }

  private drawArena(): void {
    const art = this.add.graphics();
    art.fillStyle(0x111725, 1);
    art.fillRect(0, 0, WIDTH, HEIGHT);

    art.fillStyle(0x293145, 1);
    art.fillEllipse(960, 294, 1240, 710);
    art.fillStyle(0x192234, 1);
    art.fillEllipse(960, 290, 1080, 640);
    art.fillStyle(0x20283a, 1);
    art.fillRect(482, 170, 956, 620);

    for (let index = 0; index < 9; index += 1) {
      const cloudX = 540 + index * 112;
      const cloudY = 202 + (index % 3) * 27;
      art.fillStyle(index % 2 === 0 ? 0x31364a : 0x3b394e, 0.74);
      art.fillEllipse(cloudX, cloudY, 220, 78);
      art.fillEllipse(cloudX + 36, cloudY - 24, 160, 72);
    }
    art.fillStyle(0x777387, 0.14);
    art.fillRect(482, 430, 956, 360);

    this.drawTempleColumn(130, 150, 1050);
    this.drawTempleColumn(1685, 150, 1050);
    this.drawPediment(960, 162);
    this.drawGodStatue(960, 475);
    this.drawBanner(382, 330);
    this.drawBanner(1538, 330);
    this.drawFloor(880);

    art.lineStyle(2, COLORS.gold, 0.56);
    art.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);
    art.lineStyle(1, 0xb7a9d0, 0.32);
    art.strokeRect(33, 33, WIDTH - 66, HEIGHT - 66);

    const title = this.add.text(WIDTH / 2, 35, 'LA DEXÍADA', {
      fontFamily: 'Georgia, serif',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#f1d99e',
      stroke: '#171326',
      strokeThickness: 5,
    }).setOrigin(0.5, 0);
    title.setShadow(0, 3, '#000000', 8, false, true);
    this.add.text(WIDTH / 2, 78, 'TEMPLO DE IOBRONTES   ·   XANTARCHÍA', {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      letterSpacing: 3,
      color: '#c6b6d8',
    }).setOrigin(0.5, 0);
  }

  private drawTempleColumn(x: number, y: number, height: number): void {
    const art = this.add.graphics();
    art.fillStyle(0x343347, 1);
    art.fillRect(x, y, 146, height);
    art.fillStyle(0x555065, 1);
    art.fillRect(x + 20, y, 106, height);
    art.fillStyle(0x82758a, 0.7);
    art.fillRect(x + 30, y, 8, height);
    art.fillRect(x + 119, y, 7, height);
    art.fillStyle(0x262538, 1);
    art.fillRect(x - 13, y - 30, 172, 34);
    art.fillRect(x - 22, y + height - 4, 190, 36);
    art.fillStyle(0xa28a83, 0.5);
    art.fillRect(x - 10, y - 25, 166, 5);
    for (let mark = 0; mark < 7; mark += 1) {
      art.lineStyle(1, 0xb2a0a8, 0.18);
      art.lineBetween(x + 12, y + 100 + mark * 110, x + 134, y + 100 + mark * 110);
    }
  }

  private drawPediment(centerX: number, topY: number): void {
    const art = this.add.graphics();
    art.fillStyle(0x3b3549, 1);
    art.fillTriangle(centerX, topY, centerX - 420, topY + 180, centerX + 420, topY + 180);
    art.lineStyle(8, COLORS.gold, 0.62);
    art.lineBetween(centerX, topY + 9, centerX - 397, topY + 176);
    art.lineBetween(centerX, topY + 9, centerX + 397, topY + 176);
    art.lineStyle(3, 0xb6a5b7, 0.52);
    art.lineBetween(centerX - 390, topY + 184, centerX + 390, topY + 184);
    for (let ray = 0; ray < 7; ray += 1) {
      const x = centerX - 220 + ray * 73;
      art.lineStyle(2, COLORS.violet, 0.34);
      art.lineBetween(x, topY + 91, x + (ray % 2 === 0 ? 30 : -30), topY + 154);
    }
  }

  private drawGodStatue(centerX: number, centerY: number): void {
    const art = this.add.graphics();
    art.fillStyle(0x95889a, 0.18);
    art.fillCircle(centerX, centerY - 110, 58);
    art.fillStyle(0x95889a, 0.16);
    art.fillRoundedRect(centerX - 83, centerY - 46, 166, 244, 54);
    art.fillTriangle(centerX - 100, centerY + 178, centerX + 100, centerY + 178, centerX, centerY + 322);
    art.lineStyle(5, 0xd6bdec, 0.2);
    art.strokeCircle(centerX, centerY - 110, 72);
    art.lineStyle(3, 0xd6bdec, 0.25);
    art.lineBetween(centerX, centerY - 204, centerX, centerY - 182);
    art.lineBetween(centerX - 69, centerY - 158, centerX - 57, centerY - 143);
    art.lineBetween(centerX + 69, centerY - 158, centerX + 57, centerY - 143);
  }

  private drawBanner(x: number, y: number): void {
    const art = this.add.graphics();
    art.fillStyle(0x302344, 0.94);
    art.fillPoints([
      new Phaser.Math.Vector2(x, y),
      new Phaser.Math.Vector2(x + 118, y),
      new Phaser.Math.Vector2(x + 112, y + 206),
      new Phaser.Math.Vector2(x + 58, y + 178),
      new Phaser.Math.Vector2(x + 8, y + 207),
    ], true);
    art.lineStyle(4, COLORS.gold, 0.72);
    art.lineBetween(x, y, x + 118, y);
    art.lineBetween(x + 10, y + 5, x + 18, y + 186);
    art.lineBetween(x + 108, y + 5, x + 103, y + 186);
    art.lineStyle(5, COLORS.violet, 0.85);
    art.lineBetween(x + 57, y + 44, x + 76, y + 92);
    art.lineBetween(x + 76, y + 92, x + 49, y + 125);
    art.lineBetween(x + 49, y + 125, x + 66, y + 154);
  }

  private drawFloor(y: number): void {
    const art = this.add.graphics();
    art.fillStyle(0x242231, 1);
    art.fillRect(0, y, WIDTH, HEIGHT - y);
    art.fillStyle(0x393348, 1);
    art.fillRect(0, y, WIDTH, 26);
    art.lineStyle(3, COLORS.gold, 0.35);
    art.lineBetween(0, y + 28, WIDTH, y + 28);
    for (let tile = -3; tile < 13; tile += 1) {
      const x = tile * 190;
      art.lineStyle(2, 0x938496, 0.22);
      art.lineBetween(x, y + 31, x + 142, HEIGHT);
      art.lineBetween(x + 142, y + 31, x, HEIGHT);
      art.lineBetween(x, y + 125, x + 142, y + 125);
    }
    art.fillStyle(0x130f1c, 0.18);
    art.fillEllipse(570, y + 18, 460, 68);
    art.fillEllipse(1250, y + 18, 520, 75);
  }

  private createCharacters(): void {
    this.dexios = this.add.image(570, 899, 'dexios')
      .setOrigin(0.5, 1)
      .setCrop(600, 40, 1150, 3790)
      .setDisplaySize(330, 730)
      .setDepth(4);
    this.iobrontes = this.add.image(1250, 900, 'iobrontes')
      .setOrigin(0.5, 1)
      .setCrop(500, 40, 1350, 3910)
      .setDisplaySize(350, 740)
      .setDepth(3);
    this.tweens.add({
      targets: this.dexios,
      y: 889,
      duration: 1350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: this.iobrontes,
      y: 893,
      duration: 1900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.add.text(570, 917, 'DEXIOS', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f2d9a1',
      stroke: '#171326',
      strokeThickness: 4,
    }).setOrigin(0.5, 0);
    this.add.text(1250, 917, 'IOBRONTES', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#d5a9ff',
      stroke: '#171326',
      strokeThickness: 4,
    }).setOrigin(0.5, 0);
  }

  private createHud(): void {
    const art = this.add.graphics().setDepth(20);
    art.fillStyle(COLORS.panel, 0.96);
    art.fillRoundedRect(1298, 116, 584, 82, 14);
    art.lineStyle(2, COLORS.purple, 0.82);
    art.strokeRoundedRect(1298, 116, 584, 82, 14);
    this.add.text(1322, 126, 'IOBRONTES', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#f2e5ff',
    }).setDepth(21);
    this.add.text(1324, 158, 'God of Thunder · Twelfth Heir of Zeus', {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#c7afd8',
    }).setDepth(21);

    this.statusText = this.add.text(WIDTH / 2, 152, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '25px',
      fontStyle: 'bold',
      color: '#f4dfae',
      stroke: '#171326',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5, 0).setDepth(21);
    this.defenseText = this.add.text(WIDTH / 2, 193, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#eadcf5',
      stroke: '#171326',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5, 0).setDepth(21);
    this.warningFill = this.add.graphics().setDepth(22);

    const panel = this.add.graphics().setDepth(20);
    panel.fillStyle(COLORS.panel, 0.97);
    panel.fillRoundedRect(1454, 704, 428, 352, 16);
    panel.lineStyle(2, COLORS.gold, 0.8);
    panel.strokeRoundedRect(1454, 704, 428, 352, 16);
    panel.lineStyle(1, 0xf3dfae, 0.2);
    panel.strokeRoundedRect(1462, 712, 412, 336, 12);

    this.add.text(1480, 716, 'DEXIOS', {
      fontFamily: 'Georgia, serif',
      fontSize: '21px',
      fontStyle: 'bold',
      color: '#f3e3c0',
    }).setDepth(21);
    this.add.text(1848, 722, 'TURNO', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#b9adc4',
      letterSpacing: 1,
    }).setOrigin(1, 0).setDepth(21);

    this.healthBars = {
      dexios: this.add.graphics().setDepth(22),
      mana: this.add.graphics().setDepth(22),
      chaos: this.add.graphics().setDepth(22),
      iobrontes: this.add.graphics().setDepth(22),
    };
    this.resourceTexts = {
      dexios: this.add.text(1848, 746, '', this.resourceStyle('#a9efbd')).setOrigin(1, 0).setDepth(22),
      mana: this.add.text(1848, 791, '', this.resourceStyle('#a4ddff')).setOrigin(1, 0).setDepth(22),
      chaos: this.add.text(1848, 836, '', this.resourceStyle('#ffb1b1')).setOrigin(1, 0).setDepth(22),
      iobrontes: this.add.text(1850, 125, '', this.resourceStyle('#e2c1ff')).setOrigin(1, 0).setDepth(22),
    };

    this.attackButtons = new Map();
    ATTACKS.forEach((attack, index) => this.createAttackButton(attack, index));

    this.add.text(42, 986, 'DEFENSA', {
      fontFamily: 'Georgia, serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f1d99e',
    }).setDepth(20);
    this.add.text(42, 1013, 'W  Alta   ·   A  Izquierda   ·   D  Derecha   ·   S  Salto', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ebe1ef',
    }).setDepth(20);
    this.add.text(42, 1041, 'Pulsa en los ataques o usa 1 / 2 / 3.  ·  R reinicia el combate.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#b9adc4',
    }).setDepth(20);
  }

  private resourceStyle(color: string): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color,
      stroke: '#171326',
      strokeThickness: 3,
    };
  }

  private createAttackButton(attack: AttackDefinition, index: number): void {
    const x = 1473;
    const y = 897 + index * 48;
    const background = this.add.graphics();
    background.fillStyle(COLORS.panelLight, 1);
    background.fillRoundedRect(0, 0, 390, 40, 8);
    background.lineStyle(1, index === 2 ? COLORS.red : COLORS.gold, 0.48);
    background.strokeRoundedRect(0, 0, 390, 40, 8);
    const label = this.add.text(15, 10, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f2e9d7',
    });
    const container = this.add.container(x, y, [background, label])
      .setDepth(23)
      .setSize(390, 40)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, 390, 40), Phaser.Geom.Rectangle.Contains);
    container.on('pointerover', () => {
      if (this.phase === 'player' && canUseAttack(this.state, attack)) {
        background.clear();
        background.fillStyle(0x40344f, 1);
        background.fillRoundedRect(0, 0, 390, 40, 8);
        background.lineStyle(2, COLORS.gold, 0.95);
        background.strokeRoundedRect(0, 0, 390, 40, 8);
      }
    });
    container.on('pointerout', () => {
      background.clear();
      background.fillStyle(COLORS.panelLight, 1);
      background.fillRoundedRect(0, 0, 390, 40, 8);
      background.lineStyle(1, index === 2 ? COLORS.red : COLORS.gold, 0.48);
      background.strokeRoundedRect(0, 0, 390, 40, 8);
    });
    container.on('pointerdown', () => this.performAttack(attack));
    this.attackButtons.set(attack.id, { container, label });
  }

  private refreshHud(): void {
    this.updateBar(this.healthBars.dexios, 1478, 767, 350, 13, this.state.dexiosHealth, MAX_DEXIOS_HEALTH, COLORS.green);
    this.updateBar(this.healthBars.mana, 1478, 812, 350, 13, this.state.mana, MAX_MANA, COLORS.blue);
    this.updateBar(this.healthBars.chaos, 1478, 857, 350, 13, this.state.chaos, MAX_CHAOS, COLORS.red);
    this.updateBar(this.healthBars.iobrontes, 1321, 181, 537, 10, this.state.iobrontesHealth, MAX_IOBRONTES_HEALTH, COLORS.purple);
    this.resourceTexts.dexios.setText(`VIDA  ${this.state.dexiosHealth} / ${MAX_DEXIOS_HEALTH}`);
    this.resourceTexts.mana.setText(`MANÁ  ${this.state.mana} / ${MAX_MANA}`);
    this.resourceTexts.chaos.setText(`CAOS  ${this.state.chaos} / ${MAX_CHAOS}`);
    this.resourceTexts.iobrontes.setText(`${this.state.iobrontesHealth} / ${MAX_IOBRONTES_HEALTH}`);
    this.attackButtons.forEach((button, attackId) => {
      const attack = ATTACKS.find((entry) => entry.id === attackId);
      if (!attack) {
        return;
      }
      const available = this.phase === 'player' && canUseAttack(this.state, attack);
      button.container.setAlpha(available ? 1 : 0.46);
      const cost = attack.resource === 'mana'
        ? `−${attack.cost} MANÁ`
        : attack.resource === 'chaos'
          ? `−${attack.cost} CAOS`
          : 'GRATIS';
      const prefix = `${ATTACKS.indexOf(attack) + 1}  ·  `;
      const suffix = attack.hits > 1 ? `  ·  ${attack.damage * attack.hits} DAÑO` : `  ·  ${attack.damage} DAÑO`;
      button.label.setText(`${prefix}${attack.name.toUpperCase()}  ·  ${cost}${suffix}`);
    });
  }

  private updateBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    maximum: number,
    color: number,
  ): void {
    graphics.clear();
    graphics.fillStyle(0x090811, 0.95);
    graphics.fillRoundedRect(x, y, width, height, height / 2);
    const ratio = Phaser.Math.Clamp(value / maximum, 0, 1);
    if (ratio > 0) {
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(x, y, Math.max(height, width * ratio), height, height / 2);
    }
    graphics.lineStyle(1, 0xffffff, 0.28);
    graphics.strokeRoundedRect(x, y, width, height, height / 2);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.repeat) {
      return;
    }
    const key = event.key.toLowerCase();
    if (key === 'r' && this.phase === 'result') {
      this.scene.restart();
      return;
    }
    if (this.phase === 'player') {
      const attackIndex = Number(key) - 1;
      if (attackIndex >= 0 && attackIndex < ATTACKS.length) {
        this.performAttack(ATTACKS[attackIndex]);
      }
      return;
    }
    if (this.phase === 'windup') {
      const direction = this.directionForKey(key);
      if (direction) {
        this.registerDefense(direction);
      }
    }
  }

  private directionForKey(key: string): Direction | null {
    switch (key) {
      case 'a': return 'left';
      case 'd': return 'right';
      case 'w': return 'top';
      case 's': return 'bottom';
      default: return null;
    }
  }

  private directionControl(direction: Direction): string {
    switch (direction) {
      case 'left': return 'A · IZQUIERDA';
      case 'right': return 'D · DERECHA';
      case 'top': return 'W · ALTA';
      case 'bottom': return 'S · SALTO';
    }
  }

  private directionLabel(direction: Direction): string {
    switch (direction) {
      case 'left': return '← DESDE LA IZQUIERDA';
      case 'right': return '→ DESDE LA DERECHA';
      case 'top': return '↓ DESDE ARRIBA';
      case 'bottom': return '↑ DESDE ABAJO';
    }
  }

  private performAttack(attack: AttackDefinition): void {
    if (this.phase !== 'player' || !canUseAttack(this.state, attack)) {
      return;
    }
    this.phase = 'player-action';
    spendAttackCost(this.state, attack);
    this.refreshHud();
    this.setStatus('DEXIOS ATACA', attack.name);

    if (attack.id === 'triple-lightning') {
      this.performTripleLightning(attack, 0);
    } else if (attack.id === 'electric-arc') {
      this.performElectricArc(attack);
    } else {
      this.performChaoticLightning(attack);
    }
  }

  private performTripleLightning(attack: AttackDefinition, hit: number): void {
    if (this.phase !== 'player-action') {
      return;
    }
    this.animateDexiosStrike(() => {
      if (this.phase !== 'player-action') {
        return;
      }
      this.createImpact(this.iobrontes.x - 115 + hit * 45, this.iobrontes.y - 350, COLORS.yellow, 1.05);
      damageIobrontes(this.state, attack.damage);
      this.refreshHud();
      if (this.checkBattleEnd()) {
        return;
      }
      if (hit + 1 < attack.hits) {
        this.time.delayedCall(270, () => this.performTripleLightning(attack, hit + 1));
      } else {
        this.time.delayedCall(430, () => this.finishPlayerTurn());
      }
    });
  }

  private performElectricArc(attack: AttackDefinition): void {
    this.stopIdleMotion(this.dexios);
    this.tweens.add({
      targets: this.dexios,
      y: 877,
      duration: 300,
      yoyo: true,
      onYoyo: () => this.drawElectricArc(),
      onComplete: () => {
        this.createImpact(this.iobrontes.x, this.iobrontes.y - 360, COLORS.lightning, 1.5);
        damageIobrontes(this.state, attack.damage);
        this.refreshHud();
        if (!this.checkBattleEnd()) {
          this.finishPlayerTurn();
        }
      },
    });
    this.drawElectricArc();
  }

  private drawElectricArc(): void {
    const arc = this.add.graphics().setDepth(9);
    arc.lineStyle(20, COLORS.lightning, 0.22);
    arc.lineBetween(720, 575, 1165, 465);
    arc.lineStyle(8, 0xf5fbff, 0.98);
    const points = [
      [718, 575], [805, 516], [850, 540], [911, 442], [964, 486],
      [1025, 411], [1068, 458], [1164, 464],
    ];
    for (let point = 1; point < points.length; point += 1) {
      const from = points[point - 1];
      const to = points[point];
      arc.lineBetween(from[0], from[1], to[0], to[1]);
    }
    this.tweens.add({
      targets: arc,
      alpha: 0,
      duration: 520,
      onComplete: () => arc.destroy(),
    });
  }

  private performChaoticLightning(attack: AttackDefinition): void {
    this.stopIdleMotion(this.dexios);
    this.cameras.main.shake(180, 0.006);
    const aura = this.add.circle(this.dexios.x, this.dexios.y - 360, 190, COLORS.red, 0.18).setDepth(2);
    this.tweens.add({
      targets: aura,
      scale: 1.6,
      alpha: 0,
      duration: 760,
      onComplete: () => aura.destroy(),
    });
    this.tweens.add({
      targets: this.dexios,
      x: 720,
      duration: 300,
      yoyo: true,
      onYoyo: () => this.createImpact(this.iobrontes.x - 105, this.iobrontes.y - 360, COLORS.red, 1.8),
      onComplete: () => {
        damageIobrontes(this.state, attack.damage);
        damageDexios(this.state, attack.selfDamage, false);
        this.createImpact(this.dexios.x + 45, this.dexios.y - 340, COLORS.red, 1.2);
        this.refreshHud();
        if (!this.checkBattleEnd()) {
          this.finishPlayerTurn();
        }
      },
    });
  }

  private animateDexiosStrike(onComplete: () => void): void {
    this.stopIdleMotion(this.dexios);
    this.tweens.add({
      targets: this.dexios,
      x: 625,
      duration: 155,
      yoyo: true,
      onComplete,
    });
  }

  private stopIdleMotion(character: Phaser.GameObjects.Image): void {
    this.tweens.killTweensOf(character);
    if (character === this.dexios) {
      character.setPosition(570, 899);
    } else {
      character.setPosition(1250, 900);
    }
  }

  private finishPlayerTurn(): void {
    if (this.phase !== 'player-action' || this.result) {
      return;
    }
    this.startEnemyTurn();
  }

  private startEnemyTurn(): void {
    this.phase = 'windup';
    if (this.attackSequence.length === 0) {
      this.attackSequence = Phaser.Utils.Array.Shuffle(['left', 'right', 'top', 'bottom']);
    }
    this.attackDirection = this.attackSequence.pop() ?? 'left';
    this.responseDirection = null;
    this.responseTime = null;
    this.defenseOutcome = null;
    this.defenseStartedAt = this.time.now;
    this.warningFill.clear();
    this.warningFill.fillStyle(COLORS.red, 0.8);
    this.warningFill.fillRoundedRect(786, 227, 348, 8, 4);
    this.setStatus('IOBRONTES PREPARA UN GOLPE', this.directionLabel(this.attackDirection));
    this.drawDirectionWarning(this.attackDirection);
    this.animateBossAttack();
    this.time.delayedCall(WIND_UP_MS, () => this.launchEnemyLightning());
    this.refreshHud();
  }

  private drawDirectionWarning(direction: Direction): void {
    const x = 960;
    const y = 292;
    const color = COLORS.violet;
    const warning = this.add.graphics().setDepth(15);
    warning.lineStyle(4, color, 0.9);
    warning.strokeRoundedRect(x - 54, y - 48, 108, 90, 15);
    warning.fillStyle(0x251533, 0.9);
    warning.fillRoundedRect(x - 51, y - 45, 102, 84, 13);
    const arrows: Record<Direction, string> = { left: '←', right: '→', top: '↓', bottom: '↑' };
    const arrow = this.add.text(x, y - 5, arrows[direction], {
      fontFamily: 'Arial, sans-serif',
      fontSize: '58px',
      fontStyle: 'bold',
      color: '#e8c7ff',
    }).setOrigin(0.5).setDepth(16);
    this.tweens.add({
      targets: [warning, arrow],
      alpha: 0.35,
      duration: 330,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        warning.destroy();
        arrow.destroy();
      },
    });
  }

  private animateBossAttack(): void {
    this.stopIdleMotion(this.iobrontes);
    this.tweens.add({
      targets: this.iobrontes,
      scaleX: this.iobrontes.scaleX * 1.035,
      scaleY: this.iobrontes.scaleY * 1.035,
      duration: 420,
      yoyo: true,
      repeat: 1,
    });
  }

  private registerDefense(direction: Direction): void {
    if (this.phase !== 'windup' || this.responseDirection !== null || !this.attackDirection) {
      return;
    }
    const elapsed = this.time.now - this.defenseStartedAt;
    if (elapsed > DEFENSE_WINDOW_MS) {
      return;
    }
    this.responseDirection = direction;
    this.responseTime = elapsed;
    this.defenseOutcome = resolveDefense(this.attackDirection, direction, elapsed);
    if (this.defenseOutcome === 'perfect') {
      this.setStatus('¡PARADA PERFECTA!', 'Contraataque listo');
      this.createImpact(this.dexios.x + 60, this.dexios.y - 390, COLORS.yellow, 0.78);
      this.playDefenseMotion(direction, true);
    } else if (this.defenseOutcome === 'blocked') {
      this.setStatus('¡BLOQUEO!', 'Buen reflejo: daño reducido');
      this.playDefenseMotion(direction, false);
    } else {
      this.setStatus('DEFENSA EQUIVOCADA', 'La descarga sigue su curso');
      this.tweens.add({ targets: this.dexios, x: 550, duration: 90, yoyo: true, repeat: 3 });
    }
  }

  private playDefenseMotion(direction: Direction, perfect: boolean): void {
    const destination: Record<Direction, { x: number; y: number }> = {
      left: { x: 606, y: 899 },
      right: { x: 532, y: 899 },
      top: { x: 570, y: 918 },
      bottom: { x: 570, y: 855 },
    };
    const target = destination[direction];
    this.stopIdleMotion(this.dexios);
    this.tweens.add({
      targets: this.dexios,
      x: target.x,
      y: target.y,
      duration: perfect ? 105 : 210,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
    if (perfect) {
      this.cameras.main.flash(100, 190, 145, 255, false);
    }
  }

  private launchEnemyLightning(): void {
    if (this.phase !== 'windup' || !this.attackDirection || this.result) {
      return;
    }
    this.phase = 'projectile';
    this.setStatus('¡DESCARGA INMINENTE!', this.directionLabel(this.attackDirection));
    const { start, end, rotation } = this.lightningPath(this.attackDirection);
    const bolt = this.createBolt();
    this.activeBolt = bolt;
    bolt.setPosition(start.x, start.y).setRotation(rotation).setDepth(13);
    this.tweens.add({
      targets: bolt,
      x: end.x,
      y: end.y,
      duration: PROJECTILE_TRAVEL_MS,
      ease: 'Linear',
      onComplete: () => {
        bolt.destroy();
        this.activeBolt = undefined;
        this.resolveEnemyAttack();
      },
    });
    this.refreshHud();
  }

  private lightningPath(direction: Direction): {
    start: Phaser.Math.Vector2;
    end: Phaser.Math.Vector2;
    rotation: number;
  } {
    switch (direction) {
      case 'left':
        return {
          start: new Phaser.Math.Vector2(50, 585),
          end: new Phaser.Math.Vector2(465, 585),
          rotation: 0,
        };
      case 'right':
        return {
          start: new Phaser.Math.Vector2(1430, 565),
          end: new Phaser.Math.Vector2(680, 565),
          rotation: Math.PI,
        };
      case 'top':
        return {
          start: new Phaser.Math.Vector2(570, 270),
          end: new Phaser.Math.Vector2(570, 510),
          rotation: Math.PI / 2,
        };
      case 'bottom':
        return {
          start: new Phaser.Math.Vector2(570, 890),
          end: new Phaser.Math.Vector2(570, 685),
          rotation: -Math.PI / 2,
        };
    }
  }

  private createBolt(): Phaser.GameObjects.Graphics {
    const bolt = this.add.graphics();
    const segments = 11;
    const length = 250;
    const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
    for (let point = 1; point < segments; point += 1) {
      points.push({
        x: (length / segments) * point,
        y: Phaser.Math.Between(-29, 29),
      });
    }
    points.push({ x: length, y: 0 });
    bolt.lineStyle(27, COLORS.purple, 0.23);
    this.strokePolyline(bolt, points);
    bolt.lineStyle(13, COLORS.purple, 0.78);
    this.strokePolyline(bolt, points);
    bolt.lineStyle(5, 0xf5e9ff, 1);
    this.strokePolyline(bolt, points);
    return bolt;
  }

  private strokePolyline(
    graphics: Phaser.GameObjects.Graphics,
    points: Array<{ x: number; y: number }>,
  ): void {
    for (let point = 1; point < points.length; point += 1) {
      graphics.lineBetween(
        points[point - 1].x,
        points[point - 1].y,
        points[point].x,
        points[point].y,
      );
    }
  }

  private resolveEnemyAttack(): void {
    if (this.phase !== 'projectile' || this.result || !this.attackDirection) {
      return;
    }
    const outcome = this.defenseOutcome ?? 'failed';
    if (outcome === 'perfect') {
      damageIobrontes(this.state, PERFECT_PARRY_DAMAGE);
      this.createImpact(this.iobrontes.x - 40, this.iobrontes.y - 420, COLORS.yellow, 0.9);
      this.setStatus('¡PARADA PERFECTA!', 'Daño evitado · contraataque de 5');
    } else {
      const damage = outcome === 'blocked' ? IMPERFECT_BLOCK_DAMAGE : ENEMY_ATTACK_DAMAGE;
      damageDexios(this.state, damage, true);
      this.createImpact(this.dexios.x, this.dexios.y - 350, COLORS.purple, outcome === 'blocked' ? 0.7 : 1.15);
      this.tweens.add({ targets: this.dexios, x: 540, duration: 80, yoyo: true, repeat: 4 });
      this.setStatus(
        outcome === 'blocked' ? 'BLOQUEO IMPERFECTO' : '¡IMPACTO!',
        outcome === 'blocked' ? 'Recibes 5 de daño · +10 Caos' : 'Recibes 20 de daño · +10 Caos',
      );
    }
    this.refreshHud();
    if (this.checkBattleEnd()) {
      return;
    }
    this.time.delayedCall(1050, () => {
      if (this.phase === 'projectile' && !this.result) {
        this.turn += 1;
        this.phase = 'player';
        this.attackDirection = null;
        this.defenseOutcome = null;
        this.defenseText.setText('');
        this.warningFill.clear();
        this.setStatus(`TU TURNO · ${this.turn}`, 'Elige tu siguiente ataque · 1 / 2 / 3');
        this.refreshHud();
      }
    });
  }

  private createImpact(x: number, y: number, color: number, scale: number): void {
    const glow = this.add.circle(x, y, 38 * scale, color, 0.25).setDepth(14);
    const flash = this.add.graphics().setDepth(15);
    flash.lineStyle(7, color, 1);
    for (let ray = 0; ray < 8; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 8;
      const inner = 12 * scale;
      const outer = (38 + (ray % 3) * 12) * scale;
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

  private checkBattleEnd(): boolean {
    if (this.state.dexiosHealth <= 0) {
      this.finishBattle('defeat');
      return true;
    }
    if (this.state.iobrontesHealth <= 0) {
      this.finishBattle('victory');
      return true;
    }
    return false;
  }

  private finishBattle(result: CombatResult): void {
    if (this.result) {
      return;
    }
    this.result = result;
    this.phase = 'result';
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.activeBolt?.destroy();
    this.activeBolt = undefined;
    this.defenseText.setText('');
    this.warningFill.clear();
    this.refreshHud();

    if (result === 'victory') {
      this.setStatus('IOBRONTES HA CAÍDO', 'La tormenta se disipa sobre el templo');
      this.tweens.add({
        targets: this.iobrontes,
        y: 940,
        alpha: 0.28,
        angle: 10,
        duration: 900,
      });
      this.tweens.add({
        targets: this.dexios,
        y: 865,
        duration: 400,
        yoyo: true,
        repeat: 1,
      });
      this.cameras.main.flash(500, 210, 180, 255);
    } else {
      this.setStatus('DEXIOS HA CAÍDO', 'La tormenta reclama el templo');
      this.tweens.add({
        targets: this.dexios,
        y: 950,
        angle: 78,
        alpha: 0.48,
        duration: 800,
      });
    }
    this.showResultCard(result);
  }

  private showResultCard(result: CombatResult): void {
    const card = this.add.graphics().setDepth(40);
    card.fillStyle(0x0d0b16, 0.94);
    card.fillRoundedRect(620, 386, 680, 270, 20);
    card.lineStyle(2, result === 'victory' ? COLORS.gold : COLORS.red, 0.92);
    card.strokeRoundedRect(620, 386, 680, 270, 20);
    const title = result === 'victory' ? 'VICTORIA' : 'DERROTA';
    this.add.text(WIDTH / 2, 426, title, {
      fontFamily: 'Georgia, serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: result === 'victory' ? '#f3d58e' : '#ff9a9a',
    }).setOrigin(0.5, 0).setDepth(41);
    this.add.text(WIDTH / 2, 493, result === 'victory'
      ? 'El heredero del trueno ha sido vencido.'
      : 'Dexios ya no puede continuar.',
    {
      fontFamily: 'Georgia, serif',
      fontSize: '21px',
      color: '#e5d9eb',
    }).setOrigin(0.5, 0).setDepth(41);
    this.add.text(WIDTH / 2, 536, 'Pulsa R o el botón para volver a combatir', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#bdb0c9',
    }).setOrigin(0.5, 0).setDepth(41);

    const restart = this.add.container(WIDTH / 2 - 125, 580).setDepth(42);
    const button = this.add.graphics();
    button.fillStyle(0x38304b, 1);
    button.fillRoundedRect(0, 0, 250, 48, 10);
    button.lineStyle(2, COLORS.gold, 0.8);
    button.strokeRoundedRect(0, 0, 250, 48, 10);
    const label = this.add.text(125, 14, 'REINTENTAR', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f4e4c4',
    }).setOrigin(0.5, 0);
    restart.add([button, label]);
    restart.setSize(250, 48);
    restart.setInteractive(new Phaser.Geom.Rectangle(0, 0, 250, 48), Phaser.Geom.Rectangle.Contains);
    restart.on('pointerdown', () => this.scene.restart());
  }

  private setStatus(title: string, subtitle: string): void {
    this.statusText.setText(title);
    this.defenseText.setText(subtitle);
  }
}
