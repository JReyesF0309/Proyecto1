import Phaser from 'phaser';
import { EB_GARAMOND_FONT_FAMILY, GAME_CONFIG, GAME_FONT_FAMILY } from './game-config';
import { installChapterOneHotkeys } from './chapter1-hotkeys';
import {
  ensureExploreSession,
  saveExploreSession,
  type ExploreSession,
  type OverworldFacing,
  type WorldPosition,
} from './chapter1-overworld-state';
import terrainUrl from '../assets/tilemap/Dexiada_Overworld_Ortogonal/ch1_terrain_orthogonal.png';
import treeUrl from '../assets/tilemap/Dexiada_Overworld_Ortogonal/olive_tree.png';
import mapUrl from '../assets/tilemap/Dexiada_Overworld_Ortogonal/ch1_overworld_orthogonal.tmj?url';
import idleDownUrl from '../assets/dexios/dexios_idle_down.png';
import idleUpUrl from '../assets/dexios/dexios_idle_up.png';
import idleLeftUrl from '../assets/dexios/dexios_idle_left.png';
import idleRightUrl from '../assets/dexios/dexios_idle_right.png';
import walkingDownUrl from '../assets/dexios/dexios_walking_down.png';
import walkingUpUrl from '../assets/dexios/dexios_walking_up.png';
import walkingLeftUrl from '../assets/dexios/dexios_walking_left.png';
import walkingRightUrl from '../assets/dexios/dexios_walkung_right.png';
import jumpingDownUrl from '../assets/dexios/dexios_jumping_down.png';
import jumpingUpUrl from '../assets/dexios/dexios_jumping_up.png';
import jumpingRightUrl from '../assets/dexios/dexios_jumping_right.png';
import boarUrl from '../assets/Boar/boar_overworld.png';
import wolfUrl from '../assets/wolf/wolf_overworld.png';
import rageboarUrl from '../assets/rageboar/rageboar_overworld.png';
import overworldMusicUrl from '../assets/music/overworld.mp3';
import { bindPhaserMusic } from './audio-settings';

const MAP_KEY = 'ch1_overworld_json';
const GROUND_SPEED = 220;
const PLAYER_BODY_WIDTH = 24;
const PLAYER_BODY_HEIGHT = 18;
const PLAYER_HEIGHT = 96;
const JUMP_DURATION_MS = 1050;
const JUMP_HEIGHT = 60;
const FALL_DAMAGE = 5;
const ENCOUNTER_RADIUS = 62;

const IDLE_KEYS: Record<OverworldFacing, string> = {
  up: 'ow_dexios_idle_up',
  down: 'ow_dexios_idle_down',
  left: 'ow_dexios_idle_left',
  right: 'ow_dexios_idle_right',
};

const WALK_KEYS: Record<OverworldFacing, string> = {
  up: 'ow_dexios_walk_up',
  down: 'ow_dexios_walk_down',
  left: 'ow_dexios_walk_left',
  right: 'ow_dexios_walk_right',
};

interface TiledObject {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  gid?: number;
  rotation?: number;
  visible?: boolean;
}

interface TiledLayer {
  name: string;
  type: string;
  objects?: TiledObject[];
}

interface TiledMapData {
  orientation: string;
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  tilesets: Array<Record<string, unknown> & { firstgid: number; source?: string }>;
  layers: TiledLayer[];
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EncounterDefinition {
  marker: string;
  sceneKey: string;
  enemies: Array<{ texture: string; dx: number; dy: number; width: number; height: number }>;
}

const ENCOUNTERS: EncounterDefinition[] = [
  { marker: 'combat_01', sceneKey: 'scene_ch1_combat1', enemies: [{ texture: 'ow_boar', dx: 0, dy: 0, width: 82, height: 82 }] },
  { marker: 'combat_02', sceneKey: 'scene_ch1_combat2', enemies: [
    { texture: 'ow_boar', dx: -37, dy: 0, width: 72, height: 72 },
    { texture: 'ow_boar', dx: 37, dy: 0, width: 72, height: 72 },
  ] },
  { marker: 'combat_03', sceneKey: 'scene_ch1_combat3', enemies: [{ texture: 'ow_wolf', dx: 0, dy: 0, width: 112, height: 72 }] },
  { marker: 'combat_04', sceneKey: 'scene_ch1_combat4', enemies: [
    { texture: 'ow_wolf', dx: -47, dy: 0, width: 92, height: 60 },
    { texture: 'ow_wolf', dx: 47, dy: 0, width: 92, height: 60 },
  ] },
  { marker: 'combat_05', sceneKey: 'scene_ch1_combat5', enemies: [
    { texture: 'ow_rageboar', dx: -40, dy: 0, width: 72, height: 72 },
    { texture: 'ow_rageboar', dx: 40, dy: 0, width: 72, height: 72 },
  ] },
  { marker: 'combat_06', sceneKey: 'scene_ch1_combat6', enemies: [
    { texture: 'ow_boar', dx: -48, dy: 0, width: 66, height: 66 },
    { texture: 'ow_rageboar', dx: 0, dy: -14, width: 70, height: 70 },
    { texture: 'ow_wolf', dx: 52, dy: 0, width: 100, height: 64 },
  ] },
];

export default class ChapterOneOverworldScene extends Phaser.Scene {
  private session!: ExploreSession;
  private mapData!: TiledMapData;
  private collisionRects: Rect[] = [];
  private hazardRects: Rect[] = [];
  private platformRects: Rect[] = [];
  private markers = new Map<string, WorldPosition>();
  private enemyGroups = new Map<string, Phaser.GameObjects.Image[]>();
  private completedTrees: Phaser.GameObjects.Image[] = [];
  private dexios!: Phaser.GameObjects.Sprite;
  private shadow!: Phaser.GameObjects.Ellipse;
  private cameraTarget!: Phaser.GameObjects.Zone;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private hpFill!: Phaser.GameObjects.Graphics;
  private hpLabel!: Phaser.GameObjects.Text;
  private defeatPanel?: Phaser.GameObjects.Container;
  private keys!: Record<'up' | 'down' | 'left' | 'right' | 'jump', Phaser.Input.Keyboard.Key>;
  private jumpStartedAt = 0;
  private jumping = false;
  private music?: Phaser.Sound.BaseSound;
  private unbindMusic?: () => void;
  private falling = false;
  private transitioning = false;
  private lastSaveAt = 0;
  private readonly onEnterKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'Enter' && this.session.pendingBoss && !this.session.chapterCompleted) {
      this.beginEncounterScene('scene_ch1_combat7');
    }
  };
  private facing: OverworldFacing = 'down';
  private controlsLocked = false;
  private readonly onJumpKeyDown = (event: KeyboardEvent): void => {
    if (!event.repeat && (event.code === 'Space' || event.key === ' ' || event.keyCode === 32)) {
      this.beginJump();
    }
  };

  constructor() {
    super({ key: 'scene_ch1_overworld' });
  }

  init(): void {
    // Scene instances are reused, so state from the previous run must be cleared.
    this.transitioning = false;
    this.controlsLocked = false;
    this.jumping = false;
    this.falling = false;
    this.defeatPanel = undefined;
    this.enemyGroups.clear();
    this.completedTrees = [];
    this.markers.clear();
  }

  preload(): void {
    this.load.json(MAP_KEY, mapUrl);
    this.load.image('ow_terrain', terrainUrl);
    this.load.image('ow_olive_tree', treeUrl);
    this.load.image('ow_dexios_idle_down', idleDownUrl);
    this.load.image('ow_dexios_idle_up', idleUpUrl);
    this.load.image('ow_dexios_idle_left', idleLeftUrl);
    this.load.image('ow_dexios_idle_right', idleRightUrl);
    this.load.spritesheet('ow_dexios_walk_down', walkingDownUrl, { frameWidth: 443, frameHeight: 443 });
    this.load.spritesheet('ow_dexios_walk_up', walkingUpUrl, { frameWidth: 443, frameHeight: 443 });
    this.load.spritesheet('ow_dexios_walk_left', walkingLeftUrl, { frameWidth: 443, frameHeight: 443 });
    this.load.spritesheet('ow_dexios_walk_right', walkingRightUrl, { frameWidth: 443, frameHeight: 443 });
    this.load.spritesheet('ow_dexios_jump_down', jumpingDownUrl, { frameWidth: 362, frameHeight: 543 });
    this.load.spritesheet('ow_dexios_jump_up', jumpingUpUrl, { frameWidth: 443, frameHeight: 443 });
    this.load.spritesheet('ow_dexios_jump_right', jumpingRightUrl, { frameWidth: 443, frameHeight: 443 });
    this.load.image('ow_boar', boarUrl);
    this.load.image('ow_wolf', wolfUrl);
    this.load.image('ow_rageboar', rageboarUrl);
    this.load.audio('ow_music', overworldMusicUrl);
  }

  create(): void {
    this.mapData = this.createEmbeddedMapData();
    const worldWidth = this.mapData.width * this.mapData.tilewidth;
    const worldHeight = this.mapData.height * this.mapData.tileheight;
    if (this.mapData.orientation !== 'orthogonal' || worldWidth !== 1920 || worldHeight !== 1280) {
      throw new Error('Chapter 1 overworld must be the supplied 1920 x 1280 orthogonal map.');
    }

    const resolvedMapKey = `${MAP_KEY}_resolved`;
    this.cache.tilemap.remove(resolvedMapKey);
    this.cache.tilemap.add(resolvedMapKey, {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data: this.mapData,
    });
    const tilemap = this.make.tilemap({ key: resolvedMapKey });
    const terrain = tilemap.addTilesetImage('ch1_terrain_orthogonal', 'ow_terrain');
    if (!terrain) {
      throw new Error('Could not register the Chapter 1 terrain tileset.');
    }
    const ground = tilemap.createLayer('Ground', terrain, 0, 0);
    if (!ground) {
      throw new Error('The supplied Chapter 1 map has no Ground tile layer.');
    }

    const spawn = this.getObjectLayer('Events').find((object) => object.name === 'dexios_spawn');
    if (!spawn) {
      throw new Error('The supplied Chapter 1 map is missing dexios_spawn.');
    }
    this.session = ensureExploreSession({ x: spawn.x, y: spawn.y });
    this.readObjectLayers();
    this.sanitizeSessionPosition({ x: spawn.x, y: spawn.y });
    this.facing = this.session.facing;
    this.createAnimations();
    this.createTrees();
    this.createEncounterGroups();

    this.shadow = this.add.ellipse(
      this.session.position.x,
      this.session.position.y - 5,
      42,
      16,
      0x09090d,
      0.48,
    ).setDepth(this.session.position.y - 1);
    this.dexios = this.add.sprite(
      this.session.position.x,
      this.session.position.y,
      IDLE_KEYS[this.facing],
    ).setOrigin(0.5, 0.92).setDisplaySize(PLAYER_HEIGHT, PLAYER_HEIGHT);
    this.dexios.setDepth(this.session.position.y);
    this.cameraTarget = this.add.zone(this.session.position.x, this.session.position.y, 1, 1);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(this.cameraTarget, true, 0.08, 0.08);

    const worldObjects = [...this.children.list];
    this.createHud();
    const hudObjects = this.children.list.filter((object) => !worldObjects.includes(object));
    this.cameras.main.ignore(hudObjects);
    this.uiCamera = this.cameras.add(
      0,
      0,
      GAME_CONFIG.canvas.width,
      GAME_CONFIG.canvas.height,
      false,
      'overworld-ui',
    );
    this.uiCamera.ignore(worldObjects);
    this.keys = this.input.keyboard!.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
      jump: 'SPACE',
    }) as typeof this.keys;
    this.input.keyboard?.on('keydown', this.onJumpKeyDown, this);
    this.input.keyboard?.on('keydown', this.onEnterKeyDown, this);
    installChapterOneHotkeys(this, {
      backScene: 'scene_ch1_select',
      onRestart: () => {
        this.scene.restart();
      },
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
    this.music = this.sound.add('ow_music', { loop: true, volume: GAME_CONFIG.audio.music });
    this.unbindMusic = bindPhaserMusic(this.music);
    this.music.play();
  }

  update(_time: number, deltaMs: number): void {
    if (this.transitioning || this.falling || this.controlsLocked || this.defeatPanel) {
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.jump)) {
      this.beginJump();
    }
    const delta = Math.min(deltaMs, 50) / 1000;
    const inputX = Number(this.keys.right.isDown) - Number(this.keys.left.isDown);
    const inputY = Number(this.keys.down.isDown) - Number(this.keys.up.isDown);
    const magnitude = Math.hypot(inputX, inputY);
    const moveX = magnitude ? inputX / magnitude * GROUND_SPEED * delta : 0;
    const moveY = magnitude ? inputY / magnitude * GROUND_SPEED * delta : 0;

    if (inputX || inputY) {
      this.facing = inputX < 0 ? 'left' : inputX > 0 ? 'right' : inputY < 0 ? 'up' : 'down';
      this.session.facing = this.facing;
    }
    this.moveOnAxis(moveX, 0);
    this.moveOnAxis(0, moveY);
    this.keepInBounds();

    const { x, y } = this.session.position;
    this.cameraTarget.setPosition(x, y);
    this.shadow.setPosition(x, y - 5).setDepth(y - 1);
    this.dexios.setDepth(y);
    if (this.jumping) {
      this.updateJump();
    } else {
      this.dexios.setPosition(x, y);
      if (this.isInHazard(x, y) && !this.isOnPlatform(x, y)) {
        this.beginFall();
        return;
      }
      if (magnitude > 0) {
        this.playWalking();
      } else {
        this.showIdle();
      }
      this.session.position = { x, y };
      this.session.lastSafePosition = { x, y };
      if (this.time.now - this.lastSaveAt > 2000) {
        this.lastSaveAt = this.time.now;
        saveExploreSession();
      }
    }
    this.updateEncounterTriggers();
    this.sortDepths();
  }

  private createEmbeddedMapData(): TiledMapData {
    const source = this.cache.json.get(MAP_KEY) as TiledMapData;
    if (!source || !Array.isArray(source.tilesets) || !Array.isArray(source.layers)) {
      throw new Error('The Chapter 1 Tiled JSON could not be loaded.');
    }
    const tilesets: TiledMapData['tilesets'] = [
      {
        firstgid: 1,
        name: 'ch1_terrain_orthogonal',
        tilewidth: 64,
        tileheight: 64,
        tilecount: 8,
        columns: 4,
        image: 'ch1_terrain_orthogonal.png',
        imagewidth: 256,
        imageheight: 128,
        spacing: 0,
        margin: 0,
      },
      {
        firstgid: 9,
        name: 'ch1_trees',
        tilewidth: 1254,
        tileheight: 1254,
        tilecount: 1,
        columns: 0,
        tiles: [{
          id: 0,
          image: 'olive_tree.png',
          imagewidth: 1254,
          imageheight: 1254,
        }],
      },
    ];
    return { ...source, tilesets, layers: source.layers };
  }

  private createAnimations(): void {
    const walking: Array<[string, number]> = [
      [WALK_KEYS.down, 7],
      [WALK_KEYS.up, 7],
      [WALK_KEYS.left, 7],
      [WALK_KEYS.right, 7],
    ];
    for (const [key, end] of walking) {
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end }),
          frameRate: 8,
          repeat: -1,
        });
      }
    }
    const jumps: Array<[string, number]> = [
      ['ow_dexios_jump_down', 7],
      ['ow_dexios_jump_up', 7],
      ['ow_dexios_jump_right', 7],
    ];
    for (const [key, end] of jumps) {
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end }),
          frameRate: 10,
          repeat: 0,
        });
      }
    }
  }

  private readObjectLayers(): void {
    this.collisionRects = this.getObjectLayer('Collision').map(this.toRect);
    this.hazardRects = this.getObjectLayer('Hazards').map(this.toRect);
    this.platformRects = this.getObjectLayer('Platforms').map(this.toRect);
    for (const object of this.getObjectLayer('Events')) {
      if (object.name.startsWith('combat_')) {
        this.markers.set(object.name, { x: object.x, y: object.y });
      }
    }
  }

  private createTrees(): void {
    for (const object of this.getObjectLayer('Decoration')) {
      if (object.gid !== undefined && (object.gid & 0x1fffffff) === 9) {
        const tree = this.add.image(object.x, object.y, 'ow_olive_tree')
          .setOrigin(0, 1)
          .setDisplaySize(object.width, object.height)
          .setDepth(object.y);
        this.completedTrees.push(tree);
      }
    }
    for (const object of this.getObjectLayer('Foreground')) {
      if (object.gid !== undefined && (object.gid & 0x1fffffff) === 9) {
        this.add.image(object.x, object.y, 'ow_olive_tree')
          .setOrigin(0, 1)
          .setDisplaySize(object.width, object.height)
          .setDepth(object.y + 0.5);
      }
    }
  }

  private createEncounterGroups(): void {
    for (const encounter of ENCOUNTERS) {
      const marker = this.markers.get(encounter.marker);
      if (!marker || this.session.completedEncounters.has(encounter.marker)) {
        continue;
      }
      const group = encounter.enemies.map((enemy) => this.add.image(
        marker.x + enemy.dx,
        marker.y + enemy.dy,
        enemy.texture,
      ).setOrigin(0.5, 1).setDisplaySize(enemy.width, enemy.height));
      this.enemyGroups.set(encounter.marker, group);
    }
  }

  private createHud(): void {
    const panel = this.add.graphics().setScrollFactor(0).setDepth(10000);
    panel.fillStyle(0x121019, 0.82).fillRoundedRect(28, 24, 270, 70, 10);
    panel.lineStyle(2, 0xe6bd63, 0.9).strokeRoundedRect(28, 24, 270, 70, 10);
    this.add.text(46, 34, 'DEXIOS', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '19px',
      fontStyle: 'bold',
      letterSpacing: 2,
      color: '#fffaf0',
    }).setScrollFactor(0).setDepth(10001);
    this.hpLabel = this.add.text(252, 36, `${this.session.hp}/65`, {
      fontFamily: EB_GARAMOND_FONT_FAMILY,
      fontSize: '19px',
      color: '#fffaf0',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10001);
    const barBg = this.add.graphics().setScrollFactor(0).setDepth(10001);
    barBg.fillStyle(0x39313c, 1).fillRoundedRect(46, 64, 226, 14, 6);
    this.hpFill = this.add.graphics().setScrollFactor(0).setDepth(10002);
    this.add.text(GAME_CONFIG.canvas.width - 34, 30, 'WASD — MOVE     SPACE — JUMP     ESC — BACK', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '17px',
      color: '#fffaf0',
      backgroundColor: '#121019b8',
      padding: { x: 14, y: 9 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10001);
    this.updateHpHud();
    if (this.session.pendingBoss && !this.session.chapterCompleted) {
      this.add.text(GAME_CONFIG.canvas.width / 2, GAME_CONFIG.canvas.height - 90, 'CONTINUE — THE BEAST  ·  PRESS ENTER', {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#f5d47d',
        backgroundColor: '#121019d0',
        padding: { x: 22, y: 12 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(10001);
    }
  }

  private moveOnAxis(dx: number, dy: number): void {
    if (!dx && !dy) {
      return;
    }
    const nextX = this.session.position.x + dx;
    const nextY = this.session.position.y + dy;
    if (!this.collisionRects.some((rect) => this.bodyIntersects(nextX, nextY, rect))) {
      this.session.position.x = nextX;
      this.session.position.y = nextY;
    }
  }

  private keepInBounds(): void {
    this.session.position.x = Phaser.Math.Clamp(
      this.session.position.x,
      PLAYER_BODY_WIDTH / 2,
      this.mapData.width * this.mapData.tilewidth - PLAYER_BODY_WIDTH / 2,
    );
    this.session.position.y = Phaser.Math.Clamp(
      this.session.position.y,
      PLAYER_BODY_HEIGHT,
      this.mapData.height * this.mapData.tileheight,
    );
  }

  private beginJump(): void {
    if (this.jumping || this.falling || this.transitioning || this.controlsLocked || this.defeatPanel) {
      return;
    }
    this.jumping = true;
    this.jumpStartedAt = this.time.now;
    this.shadow.setAlpha(0.75).setScale(1);
    const jumpKey = this.facing === 'up'
      ? 'ow_dexios_jump_up'
      : this.facing === 'down'
        ? 'ow_dexios_jump_down'
        : 'ow_dexios_jump_right';
    this.dexios.setFlipX(this.facing === 'left');
    this.dexios.play(jumpKey, true);
  }

  private updateJump(): void {
    const progress = Math.min(1, (this.time.now - this.jumpStartedAt) / JUMP_DURATION_MS);
    const jumpOffset = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
    this.dexios.setPosition(this.session.position.x, this.session.position.y - jumpOffset);
    // Jump sheets use different frame sizes, so the display size must follow each frame.
    this.dexios.setDisplaySize(
      this.dexios.texture.key === 'ow_dexios_jump_down' ? PLAYER_HEIGHT * 362 / 543 : PLAYER_HEIGHT,
      PLAYER_HEIGHT,
    );
    this.shadow.setScale(1 - 0.28 * Math.sin(progress * Math.PI));
    if (progress < 1) {
      return;
    }
    this.jumping = false;
    this.dexios.setFlipX(false);
    this.dexios.setPosition(this.session.position.x, this.session.position.y);
    this.shadow.setAlpha(0.48).setScale(1);
    if (this.isInHazard(this.session.position.x, this.session.position.y)
      && !this.isOnPlatform(this.session.position.x, this.session.position.y)) {
      this.beginFall();
      return;
    }
    this.session.lastSafePosition = { ...this.session.position };
    if (this.isMoving()) {
      this.playWalking();
    } else {
      this.showIdle();
    }
  }

  private beginFall(): void {
    if (this.falling) {
      return;
    }
    this.falling = true;
    this.jumping = false;
    this.dexios.anims.stop();
    this.tweens.add({
      targets: this.dexios,
      y: this.session.position.y + 56,
      alpha: 0,
      duration: 420,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.session.hp = Math.max(0, this.session.hp - FALL_DAMAGE);
        this.updateHpHud();
        this.session.position = { ...this.session.lastSafePosition };
        this.dexios.setPosition(this.session.position.x, this.session.position.y);
        this.dexios.setAlpha(1).setFlipX(false);
        this.shadow.setPosition(this.session.position.x, this.session.position.y - 5).setAlpha(0.48);
        this.falling = false;
        this.showIdle();
        if (this.session.hp === 0) {
          this.showDefeatPanel();
        }
      },
    });
  }

  private showDefeatPanel(): void {
    const overlay = this.add.rectangle(
      0,
      0,
      GAME_CONFIG.canvas.width,
      GAME_CONFIG.canvas.height,
      0x08070d,
      0.82,
    ).setOrigin(0).setScrollFactor(0).setDepth(11000);
    const title = this.add.text(
      GAME_CONFIG.canvas.width / 2,
      GAME_CONFIG.canvas.height / 2 - 60,
      'DEXIOS HAS FALLEN',
      {
        fontFamily: GAME_FONT_FAMILY,
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#fffaf0',
      },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(11001);
    const hint = this.add.text(
      GAME_CONFIG.canvas.width / 2,
      GAME_CONFIG.canvas.height / 2 + 20,
      'PRESS R TO RESTART EXPLORE MODE  ·  ESC TO RETURN',
      {
        fontFamily: EB_GARAMOND_FONT_FAMILY,
        fontSize: '24px',
        color: '#e6bd63',
      },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(11001);
    this.cameras.main.ignore([overlay, title, hint]);
    this.defeatPanel = this.add.container(0, 0, [overlay, title, hint]);
    this.cameras.main.ignore(this.defeatPanel);
  }

  private playWalking(): void {
    const key = WALK_KEYS[this.facing];
    this.dexios.setFlipX(false);
    this.dexios.setDisplaySize(PLAYER_HEIGHT, PLAYER_HEIGHT);
    if (this.dexios.anims.currentAnim?.key !== key) {
      this.dexios.play(key);
    }
  }

  private showIdle(): void {
    this.dexios.anims.stop();
    this.dexios.setFlipX(false);
    if (this.dexios.texture.key !== IDLE_KEYS[this.facing]) {
      this.dexios.setTexture(IDLE_KEYS[this.facing]);
    }
    this.dexios.setDisplaySize(PLAYER_HEIGHT, PLAYER_HEIGHT);
  }

  private updateEncounterTriggers(): void {
    if (this.jumping || this.transitioning || this.controlsLocked) {
      return;
    }
    for (const encounter of ENCOUNTERS) {
      if (this.session.completedEncounters.has(encounter.marker)) {
        continue;
      }
      const group = this.enemyGroups.get(encounter.marker);
      const marker = this.markers.get(encounter.marker);
      if (!group || !marker || !group.length) {
        continue;
      }
      if (Phaser.Math.Distance.Between(
        this.session.position.x,
        this.session.position.y,
        marker.x,
        marker.y,
      ) <= ENCOUNTER_RADIUS) {
        this.beginEncounter(encounter);
        return;
      }
    }
  }

  private isValidGround(position: WorldPosition): boolean {
    const width = this.mapData.width * this.mapData.tilewidth;
    const height = this.mapData.height * this.mapData.tileheight;
    return Number.isFinite(position.x) && Number.isFinite(position.y)
      && position.x >= PLAYER_BODY_WIDTH / 2 && position.x <= width - PLAYER_BODY_WIDTH / 2
      && position.y >= PLAYER_BODY_HEIGHT && position.y <= height
      && !this.collisionRects.some((rect) => this.bodyIntersects(position.x, position.y, rect))
      && (!this.isInHazard(position.x, position.y) || this.isOnPlatform(position.x, position.y));
  }

  // Falls back from the saved position to the last safe one, then to the spawn.
  private sanitizeSessionPosition(spawn: WorldPosition): void {
    const session = this.session;
    if (session.hp <= 0) {
      session.hp = 65;
    }
    if (!this.isValidGround(session.position)) {
      session.position = this.isValidGround(session.lastSafePosition)
        ? { ...session.lastSafePosition }
        : { ...spawn };
    }
    if (!this.isValidGround(session.lastSafePosition)) {
      session.lastSafePosition = { ...session.position };
    }
  }

  private beginEncounterScene(sceneKey: string): void {
    if (this.transitioning) {
      return;
    }
    this.transitioning = true;
    this.controlsLocked = true;
    saveExploreSession();
    this.cameras.main.fadeOut(180, 0, 0, 0);
    this.time.delayedCall(190, () => {
      this.scene.start(sceneKey, { origin: 'explore' });
    });
  }

  private beginEncounter(encounter: EncounterDefinition): void {
    if (this.transitioning) {
      return;
    }
    this.session.activeEncounterId = encounter.marker;
    this.session.encounterOrigin = { ...this.session.position };
    this.beginEncounterScene(encounter.sceneKey);
  }

  private sortDepths(): void {
    for (const tree of this.completedTrees) {
      tree.setDepth(tree.y + 0.5);
    }
    for (const group of this.enemyGroups.values()) {
      for (const enemy of group) {
        enemy.setDepth(enemy.y);
      }
    }
  }

  private updateHpHud(): void {
    this.hpLabel?.setText(`${this.session.hp}/65`);
    if (!this.hpFill) {
      return;
    }
    this.hpFill.clear();
    this.hpFill.fillStyle(0x68d391, 1)
      .fillRoundedRect(46, 64, 226 * this.session.hp / 65, 14, 6);
  }

  private isMoving(): boolean {
    return this.keys.left.isDown || this.keys.right.isDown || this.keys.up.isDown || this.keys.down.isDown;
  }

  private isInHazard(x: number, y: number): boolean {
    return this.hazardRects.some((rect) => (
      x >= rect.x && x <= rect.x + rect.width
      && y >= rect.y && y <= rect.y + rect.height
    ));
  }

  private isOnPlatform(x: number, y: number): boolean {
    return this.platformRects.some((rect) => (
      x >= rect.x && x <= rect.x + rect.width
      && y >= rect.y && y <= rect.y + rect.height
    ));
  }

  private bodyIntersects(x: number, y: number, rect: Rect): boolean {
    const left = x - PLAYER_BODY_WIDTH / 2;
    const right = x + PLAYER_BODY_WIDTH / 2;
    const top = y - PLAYER_BODY_HEIGHT;
    return left < rect.x + rect.width
      && right > rect.x
      && top < rect.y + rect.height
      && y > rect.y;
  }

  private toRect(object: TiledObject): Rect {
    return { x: object.x, y: object.y, width: object.width, height: object.height };
  }

  private getObjectLayer(name: string): TiledObject[] {
    const layer = this.mapData.layers.find((candidate) => candidate.name === name);
    if (!layer || layer.type !== 'objectgroup') {
      throw new Error(`The supplied Chapter 1 map is missing its ${name} object layer.`);
    }
    return layer.objects ?? [];
  }

  private onShutdown(): void {
    this.input.keyboard?.off('keydown', this.onEnterKeyDown, this);
    if (this.falling) {
      this.session.position = { ...this.session.lastSafePosition };
    }
    saveExploreSession();
    this.unbindMusic?.();
    this.music?.stop();
    this.music?.destroy();
    this.input.keyboard?.off('keydown', this.onJumpKeyDown, this);
    this.tweens.killTweensOf(this.dexios);
    this.time.removeAllEvents();
    this.enemyGroups.clear();
    this.completedTrees = [];
  }
}
