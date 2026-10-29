$ErrorActionPreference = 'Stop'

$normalizer = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class CharacterSpriteNormalizer
{
    public static void Normalize(
        string sourcePath,
        string destinationPath,
        int canvasSize,
        int groundBaselineY,
        float targetVisibleHeight,
        float maxVisibleWidth)
    {
        using (var original = new Bitmap(sourcePath))
        using (var source = new Bitmap(original.Width, original.Height, PixelFormat.Format32bppArgb))
        {
            using (var graphics = Graphics.FromImage(source))
            {
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.DrawImage(original, 0, 0, original.Width, original.Height);
            }

            var rectangle = new Rectangle(0, 0, source.Width, source.Height);
            var data = source.LockBits(rectangle, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            var stride = data.Stride;
            var pixels = new byte[Math.Abs(stride) * source.Height];
            var sourceLocked = true;
            try
            {
                Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);
                var queue = new int[source.Width * source.Height];
                var queueStart = 0;
                var queueEnd = 0;

                Action<int> enqueueMattePixel = index =>
                {
                    var offset = index * 4;
                    if (
                        pixels[offset + 3] == 0
                        || pixels[offset] > 24
                        || pixels[offset + 1] > 24
                        || pixels[offset + 2] > 24)
                    {
                        return;
                    }

                    pixels[offset + 3] = 0;
                    queue[queueEnd++] = index;
                };

                for (var x = 0; x < source.Width; x++)
                {
                    enqueueMattePixel(x);
                    enqueueMattePixel((source.Height - 1) * source.Width + x);
                }

                for (var y = 0; y < source.Height; y++)
                {
                    enqueueMattePixel(y * source.Width);
                    enqueueMattePixel(y * source.Width + source.Width - 1);
                }

                while (queueStart < queueEnd)
                {
                    var index = queue[queueStart++];
                    var x = index % source.Width;
                    var y = index / source.Width;
                    if (x > 0) enqueueMattePixel(index - 1);
                    if (x + 1 < source.Width) enqueueMattePixel(index + 1);
                    if (y > 0) enqueueMattePixel(index - source.Width);
                    if (y + 1 < source.Height) enqueueMattePixel(index + source.Width);
                }

                var left = source.Width;
                var top = source.Height;
                var right = -1;
                var bottom = -1;
                for (var y = 0; y < source.Height; y++)
                {
                    for (var x = 0; x < source.Width; x++)
                    {
                        if (pixels[y * stride + x * 4 + 3] <= 8) continue;
                        left = Math.Min(left, x);
                        top = Math.Min(top, y);
                        right = Math.Max(right, x + 1);
                        bottom = Math.Max(bottom, y + 1);
                    }
                }

                if (right <= left || bottom <= top)
                {
                    throw new InvalidOperationException("The sprite has no visible pixels: " + sourcePath);
                }

                Marshal.Copy(pixels, 0, data.Scan0, pixels.Length);
                source.UnlockBits(data);
                sourceLocked = false;
                var visibleWidth = right - left;
                var visibleHeight = bottom - top;
                var scale = Math.Min(
                    targetVisibleHeight / visibleHeight,
                    maxVisibleWidth / visibleWidth);
                var destinationWidth = visibleWidth * scale;
                var destinationHeight = visibleHeight * scale;
                var destination = new RectangleF(
                    (canvasSize - destinationWidth) / 2,
                    groundBaselineY - destinationHeight,
                    destinationWidth,
                    destinationHeight);
                var sourceRectangle = new RectangleF(left, top, visibleWidth, visibleHeight);

                using (var canvas = new Bitmap(canvasSize, canvasSize, PixelFormat.Format32bppArgb))
                using (var graphics = Graphics.FromImage(canvas))
                {
                    graphics.Clear(Color.Transparent);
                    graphics.CompositingMode = CompositingMode.SourceCopy;
                    graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    graphics.DrawImage(source, destination, sourceRectangle, GraphicsUnit.Pixel);
                    canvas.Save(destinationPath, ImageFormat.Png);
                }
            }
            finally
            {
                if (sourceLocked) source.UnlockBits(data);
            }
        }
    }
}
'@

Add-Type -TypeDefinition $normalizer -ReferencedAssemblies System.Drawing

$assetGroups = @{
    dexios = @(
        'dexios_abajo.png', 'dexios_arriba.png', 'dexios_ataque.png', 'dexios_base.png',
        'dexios_blanco.png', 'dexios_derecha.png', 'dexios_herido.png',
        'dexios_izquierda.png', 'dexios_salto.png', 'dexios_rojo.png'
    )
    furai = @(
        'furai_abajo.png', 'furai_arriba.png', 'furai_ataque.png', 'furai_base.png',
        'furai_derecha.png', 'furai_herido.png', 'furai_izquierda.png',
        'furai_salto.png', 'furai_romper.png', 'furai_tigre.png'
    )
    sahira = @(
        'sahira_abajo.png', 'sahira_arriba.png', 'sahira_ataque.png', 'sahira_base.png',
        'sahira_derecha.png', 'sahira_herida.png', 'sahira_izquierda.png',
        'sahira_cura.png', 'sahira_salto.png'
    )
    hazel = @(
        'hazel__fuego_base.png', 'hazel__fuego_arriba.png', 'hazel__fuego_abajo.png',
        'hazel__fuego_derecha.png', 'hazel__fuego_izquierda.png', 'hazel__fuego_salto.png',
        'hazel_fuego_herida.png',         'hazel_fuego_ataque_dance.png', 'hazel_fuego_dance.png',
        'hazel_hielo_base.png', 'hazel_hielo_arriba.png', 'hazel_hielo_abajo.png',
        'hazel_hielo_derecha.png', 'hazel_hielo_izquierda.png', 'hazelo_hielo_salto.png',
        'hazel_hielo_herida.png', 'hazel_hielo_ataque_shards.png', 'hazel_hielo_shards.png', 'hazel_cambio.png'
    )
    iobrontes = @(
        'iobrontes_armadura.png', 'iobrontes_abajo.png', 'iobrontes_arriba.png',
        'iobrontes_base.png', 'iobrontes_derecha.png', 'iobrontes_herido.png',
        'iobrontes_izquierda.png', 'iobrontes_wtt.png'
    )
    kosmelys = @(
        'kosmelys_base.png', 'kosmelys_derecha.png', 'kosmelys_izquierda.png',
        'kosmelys_arriba.png', 'kosmelys_escudo.png', 'kosmelys_mr.png',
        'kosmelys_herida.png'
    )
}

$assetRoot = Join-Path $PSScriptRoot '..\assets'
$canvasSize = 1536
$groundBaselineY = 1320
$referenceVisibleHeight = 1120
$maxVisibleWidth = 1408

foreach ($character in $assetGroups.Keys) {
    $sourceDirectory = Join-Path $assetRoot $character
    $destinationDirectory = Join-Path $assetRoot "normalized\$character"
    [System.IO.Directory]::CreateDirectory($destinationDirectory) | Out-Null

    foreach ($filename in $assetGroups[$character]) {
        $sourcePath = Join-Path $sourceDirectory $filename
        $destinationPath = Join-Path $destinationDirectory $filename
        if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
            throw "Required sprite not found: $sourcePath"
        }

        [CharacterSpriteNormalizer]::Normalize(
            $sourcePath,
            $destinationPath,
            $canvasSize,
            $groundBaselineY,
            $referenceVisibleHeight,
            $maxVisibleWidth)
    }
}
