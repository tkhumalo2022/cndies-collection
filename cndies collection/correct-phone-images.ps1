Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

function Set-GraphicsQuality {
  param([System.Drawing.Graphics]$Graphics)
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
}

function Get-BackgroundReference {
  param([System.Drawing.Bitmap]$Bitmap)

  $points = @(
    @{ X = 0; Y = 0 },
    @{ X = $Bitmap.Width - 1; Y = 0 },
    @{ X = 0; Y = $Bitmap.Height - 1 },
    @{ X = $Bitmap.Width - 1; Y = $Bitmap.Height - 1 }
  )

  $totalR = 0
  $totalG = 0
  $totalB = 0

  foreach ($point in $points) {
    $sample = $Bitmap.GetPixel($point.X, $point.Y)
    $totalR += $sample.R
    $totalG += $sample.G
    $totalB += $sample.B
  }

  return [System.Drawing.Color]::FromArgb(
    [int][Math]::Round($totalR / $points.Count),
    [int][Math]::Round($totalG / $points.Count),
    [int][Math]::Round($totalB / $points.Count)
  )
}

function Test-IsBackgroundPixel {
  param(
    [System.Drawing.Color]$Color,
    [System.Drawing.Color]$Background,
    [int]$Tolerance = 24
  )

  if ($Color.A -lt 16) {
    return $true
  }

  $delta = [Math]::Abs($Color.R - $Background.R) +
    [Math]::Abs($Color.G - $Background.G) +
    [Math]::Abs($Color.B - $Background.B)

  return $delta -le ($Tolerance * 3)
}

function New-CropBitmap {
  param(
    [System.Drawing.Bitmap]$Source,
    [System.Drawing.Rectangle]$Crop
  )

  $bitmap = New-Object System.Drawing.Bitmap($Crop.Width, $Crop.Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-GraphicsQuality -Graphics $graphics
  $graphics.DrawImage(
    $Source,
    [System.Drawing.Rectangle]::new(0, 0, $Crop.Width, $Crop.Height),
    $Crop,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $graphics.Dispose()
  return $bitmap
}

function Get-RightDeviceBounds {
  param([System.Drawing.Bitmap]$Bitmap)

  $background = Get-BackgroundReference -Bitmap $Bitmap
  $bandTop = [int][Math]::Round($Bitmap.Height * 0.16)
  $bandBottom = [int][Math]::Round($Bitmap.Height * 0.84)
  $bandHeight = $bandBottom - $bandTop + 1
  $minimumActivePixels = [int][Math]::Max(10, [Math]::Round($bandHeight * 0.12))
  $columnCounts = New-Object int[] $Bitmap.Width

  for ($x = 0; $x -lt $Bitmap.Width; $x++) {
    $active = 0
    for ($y = $bandTop; $y -le $bandBottom; $y++) {
      if (-not (Test-IsBackgroundPixel -Color $Bitmap.GetPixel($x, $y) -Background $background)) {
        $active++
      }
    }
    $columnCounts[$x] = $active
  }

  $rightEdge = -1
  for ($x = $Bitmap.Width - 1; $x -ge 0; $x--) {
    if ($columnCounts[$x] -ge $minimumActivePixels) {
      $rightEdge = $x
      break
    }
  }

  if ($rightEdge -lt 0) {
    return [System.Drawing.Rectangle]::new(0, 0, $Bitmap.Width, $Bitmap.Height)
  }

  $gapLimit = 5
  $gapCount = 0
  $leftEdge = $rightEdge

  for ($x = $rightEdge; $x -ge 0; $x--) {
    if ($columnCounts[$x] -ge $minimumActivePixels) {
      $leftEdge = $x
      $gapCount = 0
      continue
    }

    $gapCount++
    if ($gapCount -gt $gapLimit) {
      break
    }
  }

  $detectedWidth = [Math]::Max(1, $rightEdge - $leftEdge + 1)
  $horizontalMarginLeft = [int][Math]::Round([Math]::Max(18, $detectedWidth * 0.18))
  $horizontalMarginRight = [int][Math]::Round([Math]::Max(12, $detectedWidth * 0.08))
  $cropLeft = [Math]::Max(0, $leftEdge - $horizontalMarginLeft)
  $cropRight = [Math]::Min($Bitmap.Width - 1, $rightEdge + $horizontalMarginRight)

  $top = $Bitmap.Height - 1
  $bottom = 0
  $foundPixels = $false

  for ($x = $cropLeft; $x -le $cropRight; $x++) {
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
      if (-not (Test-IsBackgroundPixel -Color $Bitmap.GetPixel($x, $y) -Background $background)) {
        $top = [Math]::Min($top, $y)
        $bottom = [Math]::Max($bottom, $y)
        $foundPixels = $true
      }
    }
  }

  if (-not $foundPixels) {
    return [System.Drawing.Rectangle]::new($cropLeft, 0, ($cropRight - $cropLeft + 1), $Bitmap.Height)
  }

  $detectedHeight = [Math]::Max(1, $bottom - $top + 1)
  $verticalMargin = [int][Math]::Round([Math]::Max(18, $detectedHeight * 0.05))
  $cropTop = [Math]::Max(0, $top - $verticalMargin)
  $cropBottom = [Math]::Min($Bitmap.Height - 1, $bottom + $verticalMargin)

  return [System.Drawing.Rectangle]::new(
    $cropLeft,
    $cropTop,
    ($cropRight - $cropLeft + 1),
    ($cropBottom - $cropTop + 1)
  )
}

function Save-NormalizedPhone {
  param(
    [System.Drawing.Bitmap]$Source,
    [System.Drawing.Rectangle]$Crop,
    [string]$Destination
  )

  $cropped = New-CropBitmap -Source $Source -Crop $Crop

  try {
    $canvasWidth = 420
    $canvasHeight = 860
    $paddingX = 34
    $paddingTop = 28
    $paddingBottom = 34
    $innerWidth = $canvasWidth - ($paddingX * 2)
    $innerHeight = $canvasHeight - $paddingTop - $paddingBottom

    $scale = [Math]::Min($innerWidth / $cropped.Width, $innerHeight / $cropped.Height)
    $drawWidth = [int][Math]::Round($cropped.Width * $scale)
    $drawHeight = [int][Math]::Round($cropped.Height * $scale)
    $drawX = [int][Math]::Round(($canvasWidth - $drawWidth) / 2)
    $drawY = [int][Math]::Round($paddingTop + (($innerHeight - $drawHeight) / 2))

    $canvas = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    Set-GraphicsQuality -Graphics $graphics
    $graphics.Clear([System.Drawing.Color]::FromArgb(244, 247, 251))
    $graphics.DrawImage($cropped, $drawX, $drawY, $drawWidth, $drawHeight)
    $graphics.Dispose()

    $canvas.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
  }
  finally {
    $cropped.Dispose()
  }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceDir = Join-Path $root "assets/images/phones/_sources"

$models = @(
  "iphone-7",
  "iphone-7-plus",
  "iphone-8",
  "iphone-8-plus",
  "iphone-x",
  "iphone-xr",
  "iphone-xs",
  "iphone-xs-max",
  "iphone-11",
  "iphone-11-pro",
  "iphone-11-pro-max",
  "iphone-12",
  "iphone-12-pro",
  "iphone-12-pro-max",
  "iphone-13-pro",
  "iphone-13-pro-max",
  "iphone-14",
  "iphone-14-plus",
  "iphone-14-pro",
  "iphone-14-pro-max",
  "iphone-15",
  "iphone-15-plus",
  "iphone-15-pro"
)

foreach ($slug in $models) {
  $sourcePath = Join-Path $sourceDir ($slug + ".jpg")
  $folder = Join-Path $root ("assets/images/phones/" + $slug)
  $frontPath = Join-Path $folder "front.png"
  $backPath = Join-Path $folder "back.png"

  if (-not (Test-Path $sourcePath)) {
    Write-Warning ("Skipping {0}: missing source image" -f $slug)
    continue
  }

  $source = [System.Drawing.Bitmap]::new($sourcePath)

  try {
    $frontCrop = Get-RightDeviceBounds -Bitmap $source
    Save-NormalizedPhone -Source $source -Crop $frontCrop -Destination $frontPath
    Copy-Item -LiteralPath $frontPath -Destination $backPath -Force
  }
  finally {
    $source.Dispose()
  }

  Write-Output ("Corrected {0}" -f $slug)
}
