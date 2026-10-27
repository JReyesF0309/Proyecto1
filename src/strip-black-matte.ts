import Phaser from 'phaser';

export default function stripBlackMattes(
  textures: Phaser.Textures.TextureManager,
  keys: string[],
): void {
  keys.forEach((key) => {
    const texture = textures.get(key);
    const source = texture.getSourceImage();
    if (!(source instanceof HTMLImageElement) && !(source instanceof HTMLCanvasElement)) {
      throw new Error(`No se pudo procesar la imagen ${key}`);
    }

    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error(`No se pudo preparar la imagen ${key}`);
    }
    context.drawImage(source, 0, 0);

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixelCount = canvas.width * canvas.height;
    const queue = new Uint32Array(pixelCount);
    let queueStart = 0;
    let queueEnd = 0;
    const enqueueMattePixel = (index: number): void => {
      const offset = index * 4;
      if (
        pixels.data[offset + 3] === 0
        || pixels.data[offset] > 24
        || pixels.data[offset + 1] > 24
        || pixels.data[offset + 2] > 24
      ) {
        return;
      }
      pixels.data[offset + 3] = 0;
      queue[queueEnd] = index;
      queueEnd += 1;
    };

    for (let x = 0; x < canvas.width; x += 1) {
      enqueueMattePixel(x);
      enqueueMattePixel((canvas.height - 1) * canvas.width + x);
    }
    for (let y = 0; y < canvas.height; y += 1) {
      enqueueMattePixel(y * canvas.width);
      enqueueMattePixel(y * canvas.width + canvas.width - 1);
    }
    while (queueStart < queueEnd) {
      const index = queue[queueStart];
      queueStart += 1;
      const x = index % canvas.width;
      const y = Math.floor(index / canvas.width);
      if (x > 0) enqueueMattePixel(index - 1);
      if (x + 1 < canvas.width) enqueueMattePixel(index + 1);
      if (y > 0) enqueueMattePixel(index - canvas.width);
      if (y + 1 < canvas.height) enqueueMattePixel(index + canvas.width);
    }

    context.putImageData(pixels, 0, 0);
    textures.remove(key);
    textures.addCanvas(key, canvas);
  });
}
