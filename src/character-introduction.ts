import Phaser from 'phaser';
import dexiosPortrait from '../assets/dexios/dexios.PNG';
import furaiPortrait from '../assets/furai/furai.PNG';
import hazelFirePortrait from '../assets/hazel/hazel_fuego.png';
import hazelIcePortrait from '../assets/hazel/hazel_hielo.png';
import sahiraPortrait from '../assets/sahira/sahira.PNG';
import {
  EB_GARAMOND_FONT_FAMILY,
  GAME_CONFIG,
  GAME_FONT_FAMILY,
} from './game-config';
import type { CharacterId } from './game-config';
import stripBlackMattes from './strip-black-matte';

type IntroductionObject = Phaser.GameObjects.GameObject
  & Phaser.GameObjects.Components.Depth;

interface LabelMask {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IntroductionAsset {
  sourceKey: string;
  textureKey: string;
  asset: string;
  labelMasks: LabelMask[];
}

interface IntroductionTextBlock {
  text: string;
  color: string;
}

interface IntroductionDefinition {
  title: string;
  subtitle: string;
  color: string;
  paragraphs: IntroductionTextBlock[];
  previewTextureKey?: string;
}

const noMasks: LabelMask[] = [];

export const INTRODUCTION_ASSETS: Record<CharacterId, IntroductionAsset> = {
  dexios: {
    sourceKey: 'intro-source-dexios',
    textureKey: 'intro-dexios',
    asset: dexiosPortrait,
    labelMasks: [{ x: 0.63, y: 0.035, width: 0.36, height: 0.15 }],
  },
  furai: {
    sourceKey: 'intro-source-furai',
    textureKey: 'intro-furai',
    asset: furaiPortrait,
    labelMasks: [{ x: 0.67, y: 0.035, width: 0.32, height: 0.17 }],
  },
  sahira: {
    sourceKey: 'intro-source-sahira',
    textureKey: 'intro-sahira',
    asset: sahiraPortrait,
    labelMasks: [{ x: 0.58, y: 0.015, width: 0.41, height: 0.19 }],
  },
  hazel: {
    sourceKey: 'intro-source-hazel-ignis',
    textureKey: 'intro-hazel-ignis',
    asset: hazelFirePortrait,
    labelMasks: noMasks,
  },
};

const HAZEL_GLACIO_ASSET = {
  sourceKey: 'intro-source-hazel-glacio',
  textureKey: 'intro-hazel-glacio',
  asset: hazelIcePortrait,
};

const INTRODUCTIONS: Record<CharacterId, IntroductionDefinition> = {
  dexios: {
    title: 'Dexios',
    subtitle: 'The unstable Thunderbolt',
    color: '#ff777e',
    paragraphs: [
      {
        text: 'Dexios is a balanced fighter and potion-maker (not yet in this prototype). He gathers chaotic energy as he receives damage, which he can use to perform Chaotic Lightning, a very powerful attack that also inflicts self-damage.',
        color: '#ff777e',
      },
      {
        text: 'If he blocks normally, he receives only 5 damage. However, if his timing is perfect, he prevents all incoming damage and deals 5 damage back to the attacker for each successfully parried hit.',
        color: '#ffd0d0',
      },
    ],
  },
  furai: {
    title: 'Furai',
    subtitle: 'The errant Tiger',
    color: '#c59bff',
    paragraphs: [
      {
        text: 'Furai is a quick fighter. He gathers Spirit by attacking with Tiger Spear and performing counterattacks, allowing him to use his other two abilities. One of these abilities can strengthen his allies’ attacks.',
        color: '#d6bdff',
      },
      {
        text: 'If he blocks normally, he receives only 5 damage. However, if his timing is perfect, he prevents all incoming damage. If he perfectly blocks every attack in an enemy’s attack sequence, he performs a powerful counterattack dealing 20 damage.',
        color: '#eee4ff',
      },
    ],
  },
  sahira: {
    title: 'Sahira',
    subtitle: 'The desheran Champion',
    color: '#80e3a2',
    paragraphs: [
      {
        text: 'Sahira is a tank fighter. She does not deal much damage, but she has more Health than her allies and possesses abilities that can either heal or protect them.',
        color: '#a8f0bd',
      },
      {
        text: 'Her support abilities have a limited number of uses, so choose carefully when to activate them.',
        color: '#d2f6da',
      },
      {
        text: 'As long as she blocks in the correct direction during the defensive window, she prevents all incoming damage.',
        color: '#a8f0bd',
      },
    ],
  },
  hazel: {
    title: 'Hazel',
    subtitle: 'The elegant striker',
    color: '#ffe078',
    previewTextureKey: HAZEL_GLACIO_ASSET.textureKey,
    paragraphs: [
      {
        text: 'Hazel is a highly offensive fighter. She does not have many Health points and must perform Perfect Parries to prevent incoming damage. She has two elemental forms and can switch between them using a transformation ability.',
        color: '#ffe078',
      },
      {
        text: 'Ignis: Her flame ballet form can deal great damage to all enemies.',
        color: '#ffad66',
      },
      {
        text: 'Glacio: Her ice figure-skating form can deal huge damage to a single opponent.',
        color: '#9be8ff',
      },
    ],
  },
};

const HAZEL_GLACIO_INTRODUCTION_ASSET: IntroductionAsset = {
  ...HAZEL_GLACIO_ASSET,
  labelMasks: noMasks,
};

const PANEL_WIDTH = GAME_CONFIG.canvas.width * 0.8;
const PANEL_HEIGHT = GAME_CONFIG.canvas.height * 0.8;
const PANEL_X = (GAME_CONFIG.canvas.width - PANEL_WIDTH) / 2;
const PANEL_Y = (GAME_CONFIG.canvas.height - PANEL_HEIGHT) / 2;
const PANEL_RIGHT = PANEL_X + PANEL_WIDTH;
const PANEL_BOTTOM = PANEL_Y + PANEL_HEIGHT;
const GOLD = 0xe7bd65;

export function preloadCharacterIntroductionAssets(
  scene: Phaser.Scene,
): void {
  const assets = [
    ...Object.values(INTRODUCTION_ASSETS),
    HAZEL_GLACIO_INTRODUCTION_ASSET,
  ];
  assets.forEach(({ sourceKey, asset }) => {
    if (!scene.textures.exists(sourceKey)) {
      scene.load.image(sourceKey, asset);
    }
  });
}

export function createCharacterIntroductionTextures(
  textures: Phaser.Textures.TextureManager,
): void {
  const assets = [
    ...Object.values(INTRODUCTION_ASSETS),
    HAZEL_GLACIO_INTRODUCTION_ASSET,
  ].filter(({ textureKey }) => !textures.exists(textureKey));
  if (assets.length === 0) {
    return;
  }
  assets.forEach((asset) => {
    const sourceTexture = textures.get(asset.sourceKey);
    const source = sourceTexture.getSourceImage();
    if (!(source instanceof HTMLImageElement) && !(source instanceof HTMLCanvasElement)) {
      throw new Error(`Could not load introduction artwork for ${asset.textureKey}`);
    }
    const scale = Math.min(1, 1200 / Math.max(source.width, source.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error(`Could not prepare introduction artwork for ${asset.textureKey}`);
    }
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    asset.labelMasks.forEach((mask) => {
      context.fillRect(
        mask.x * canvas.width,
        mask.y * canvas.height,
        mask.width * canvas.width,
        mask.height * canvas.height,
      );
    });
    textures.addCanvas(asset.textureKey, canvas);
  });

  stripBlackMattes(textures, assets.map(({ textureKey }) => textureKey));
  assets.forEach(({ textureKey }) => {
    const source = textures.get(textureKey).getSourceImage();
    if (!(source instanceof HTMLCanvasElement)) {
      throw new Error(`Could not clean introduction artwork for ${textureKey}`);
    }
    const context = source.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error(`Could not inspect introduction artwork for ${textureKey}`);
    }
    const pixels = context.getImageData(0, 0, source.width, source.height);
    let left = source.width;
    let top = source.height;
    let right = -1;
    let bottom = -1;
    for (let y = 0; y < source.height; y += 1) {
      for (let x = 0; x < source.width; x += 1) {
        if (pixels.data[(y * source.width + x) * 4 + 3] === 0) {
          continue;
        }
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
    if (right < left || bottom < top) {
      throw new Error(`No visible artwork found for ${textureKey}`);
    }
    const cropped = document.createElement('canvas');
    cropped.width = right - left + 1;
    cropped.height = bottom - top + 1;
    const croppedContext = cropped.getContext('2d');
    if (!croppedContext) {
      throw new Error(`Could not crop introduction artwork for ${textureKey}`);
    }
    croppedContext.drawImage(
      source,
      left,
      top,
      cropped.width,
      cropped.height,
      0,
      0,
      cropped.width,
      cropped.height,
    );
    textures.remove(textureKey);
    textures.addCanvas(textureKey, cropped);
  });
}

export default class CharacterIntroduction {
  private readonly objects: Phaser.GameObjects.GameObject[] = [];
  private portrait!: Phaser.GameObjects.Image;
  private readonly textWidth: number;
  private blockingInput = true;
  private closing = false;
  private previewChanging = false;
  private portraitTextureKey: string;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly character: CharacterId,
    private readonly uiCamera: Phaser.Cameras.Scene2D.Camera,
    private readonly overlayCamera: Phaser.Cameras.Scene2D.Camera,
    private readonly onContinue: () => void,
  ) {
    const definition = INTRODUCTIONS[character];
    this.portraitTextureKey = INTRODUCTION_ASSETS[character].textureKey;
    this.textWidth = PANEL_RIGHT - 930 - 56;
    this.createPanel();
    this.createPortrait();
    this.createInformation(definition);
    if (character === 'hazel') {
      this.createHazelPreviewButton();
    }
    this.createContinueButton();
  }

  get isBlockingInput(): boolean {
    return this.blockingInput;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (this.closing) {
      return;
    }
    if (event.key === 'Enter' || event.code === 'Enter' || event.code === 'NumpadEnter') {
      this.close();
    } else if (this.character === 'hazel' && event.key.toLowerCase() === 'h') {
      this.toggleHazelPreview();
    }
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.objects);
    this.objects.forEach((object) => object.destroy());
    this.objects.length = 0;
    this.blockingInput = false;
  }

  private add<T extends IntroductionObject>(object: T, depth: number): T {
    object.setDepth(depth);
    this.scene.cameras.main.ignore(object);
    this.overlayCamera.ignore(object);
    this.objects.push(object);
    return object;
  }

  private createPanel(): void {
    this.add(
      this.scene.add.rectangle(
        GAME_CONFIG.canvas.width / 2,
        GAME_CONFIG.canvas.height / 2,
        GAME_CONFIG.canvas.width,
        GAME_CONFIG.canvas.height,
        0x000000,
        0.42,
      ),
      9900,
    );
    this.add(
      this.scene.add.rectangle(
        GAME_CONFIG.canvas.width / 2,
        GAME_CONFIG.canvas.height / 2,
        PANEL_WIDTH,
        PANEL_HEIGHT,
        0x05040a,
        0.9,
      ),
      9901,
    );
    this.add(
      this.scene.add.zone(
        GAME_CONFIG.canvas.width / 2,
        GAME_CONFIG.canvas.height / 2,
        GAME_CONFIG.canvas.width,
        GAME_CONFIG.canvas.height,
      ).setInteractive(),
      9902,
    );

    const ornament = this.scene.add.graphics();
    ornament.lineStyle(5, GOLD, 0.96);
    ornament.strokeRect(PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
    ornament.lineStyle(1, GOLD, 0.44);
    ornament.strokeRect(PANEL_X + 13, PANEL_Y + 13, PANEL_WIDTH - 26, PANEL_HEIGHT - 26);
    ornament.lineStyle(2, GOLD, 0.78);
    ornament.lineBetween(850, PANEL_Y + 56, 850, PANEL_BOTTOM - 56);
    ornament.lineBetween(850 - 12, PANEL_Y + 56, 850 + 12, PANEL_Y + 56);
    ornament.lineBetween(850 - 12, PANEL_BOTTOM - 56, 850 + 12, PANEL_BOTTOM - 56);
    this.add(ornament, 9903);
  }

  private createPortrait(): void {
    this.add(
      this.scene.add.ellipse(510, 480, 560, 740, 0x8c1685, 0.08),
      9903,
    );
    this.portrait = this.add(
      this.scene.add.image(510, 480, this.portraitTextureKey),
      9903,
    );
    this.fitPortrait();
  }

  private fitPortrait(): void {
    const texture = this.scene.textures.get(this.portraitTextureKey);
    const source = texture.getSourceImage();
    const scale = Math.min(570 / source.width, 660 / source.height);
    this.portrait.setPosition(510, 480).setScale(scale);
  }

  private createInformation(definition: IntroductionDefinition): void {
    let y = PANEL_Y + 64;
    const title = this.add(this.scene.add.text(930, y, definition.title, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '64px',
      color: definition.color,
      stroke: '#120d1b',
      strokeThickness: 5,
    }), 9904);
    y += title.height + 16;

    const subtitle = this.add(this.scene.add.text(930, y, definition.subtitle, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '36px',
      color: definition.color,
      stroke: '#120d1b',
      strokeThickness: 4,
      wordWrap: { width: this.textWidth },
    }), 9904);
    y += subtitle.height + 28;

    definition.paragraphs.forEach((paragraph, index) => {
      const text = this.add(this.scene.add.text(930, y, paragraph.text, {
        fontFamily: EB_GARAMOND_FONT_FAMILY,
        fontSize: '29px',
        color: paragraph.color,
        lineSpacing: 10,
        wordWrap: { width: this.textWidth },
      }), 9904);
      y += text.height + (index === definition.paragraphs.length - 1 ? 0 : 26);
    });
    if (y > PANEL_BOTTOM - 112) {
      throw new Error(`Character introduction text does not fit for ${this.character}`);
    }
  }

  private createHazelPreviewButton(): void {
    const x = 510;
    const y = PANEL_BOTTOM - 75;
    const width = 320;
    const height = 58;
    const background = this.scene.add.graphics();
    background.fillStyle(0x21182b, 0.98);
    background.fillRoundedRect(x - width / 2, y - height / 2, width, height, 12);
    background.lineStyle(3, GOLD, 1);
    background.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 12);
    this.add(background, 9905);
    const badge = this.scene.add.graphics();
    badge.fillStyle(GOLD, 1);
    badge.fillRoundedRect(x - 139, y - 20, 42, 40, 7);
    this.add(badge, 9906);
    this.add(this.scene.add.text(x - 118, y, 'H', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '24px',
      color: '#21182b',
      align: 'center',
    }).setOrigin(0.5), 9907);
    this.add(this.scene.add.text(x + 35, y, 'CAMBIAR FORMA', {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: '22px',
      color: '#f5d47d',
      align: 'center',
    }).setOrigin(0.5), 9907);
    const zone = this.add(
      this.scene.add.zone(x, y, width, height)
        .setInteractive({ useHandCursor: true }),
      9908,
    );
    zone.on('pointerdown', () => this.toggleHazelPreview());
  }

  private createContinueButton(): void {
    this.createButton(
      PANEL_RIGHT - 185,
      PANEL_BOTTOM - 64,
      250,
      62,
      'CONTINUAR',
      28,
      () => this.close(),
    );
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    fontSize: number,
    onClick: () => void,
  ): void {
    const background = this.scene.add.graphics();
    background.fillStyle(0x21182b, 0.98);
    background.fillRoundedRect(x - width / 2, y - height / 2, width, height, 12);
    background.lineStyle(3, GOLD, 1);
    background.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 12);
    this.add(background, 9905);
    this.add(this.scene.add.text(x, y, label, {
      fontFamily: GAME_FONT_FAMILY,
      fontSize: `${fontSize}px`,
      color: '#f5d47d',
      align: 'center',
    }).setOrigin(0.5), 9906);
    const zone = this.add(
      this.scene.add.zone(x, y, width, height)
        .setInteractive({ useHandCursor: true }),
      9907,
    );
    zone.on('pointerdown', onClick);
  }

  private toggleHazelPreview(): void {
    if (this.closing || this.previewChanging) {
      return;
    }
    const definition = INTRODUCTIONS.hazel;
    if (!definition.previewTextureKey) {
      throw new Error('Hazel introduction is missing its Glacio preview artwork');
    }
    const nextTextureKey = this.portraitTextureKey === INTRODUCTION_ASSETS.hazel.textureKey
      ? definition.previewTextureKey
      : INTRODUCTION_ASSETS.hazel.textureKey;
    this.previewChanging = true;
    this.scene.tweens.add({
      targets: this.portrait,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        this.portraitTextureKey = nextTextureKey;
        this.portrait.setTexture(this.portraitTextureKey);
        this.fitPortrait();
        this.scene.tweens.add({
          targets: this.portrait,
          alpha: 1,
          duration: 130,
          onComplete: () => {
            this.previewChanging = false;
          },
        });
      },
    });
  }

  private close(): void {
    if (this.closing) {
      return;
    }
    this.closing = true;
    this.scene.tweens.killTweensOf(this.portrait);
    this.scene.tweens.add({
      targets: this.objects,
      alpha: 0,
      duration: 180,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.objects.forEach((object) => object.destroy());
        this.objects.length = 0;
        this.blockingInput = false;
        this.onContinue();
      },
    });
  }
}
