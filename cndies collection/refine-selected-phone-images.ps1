Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

function Set-GraphicsQuality {
  param([System.Drawing.Graphics]$Graphics)
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
}

function Test-IsLightNeutralPixel {
  param([System.Drawing.Color]$Color)

  if ($Color.A -lt 16) {
    return $true
  }

  $maxChannel = [Math]::Max($Color.R, [Math]::Max($Color.G, $Color.B))
  $minChannel = [Math]::Min($Color.R, [Math]::Min($Color.G, $Color.B))

  return $maxChannel -ge 230 -and ($maxChannel - $minChannel) -le 28
}

function Remove-ConnectedBackground {
  param([System.Drawing.Bitmap]$Bitmap)

  $width = $Bitmap.Width
  $height = $Bitmap.Height
  $visited = New-Object 'bool[,]' $width, $height
  $queue = New-Object 'System.Collections.Generic.Queue[System.Drawing.Point]'

  function Enqueue-IfBackground {
    param([int]$X, [int]$Y)

    if ($X -lt 0 -or $X -ge $width -or $Y -lt 0 -or $Y -ge $height) {
      return
    }

    if ($visited[$X, $Y]) {
      return
    }

    $visited[$X, $Y] = $true
    $pixel = $Bitmap.GetPixel($X, $Y)
    if (Test-IsLightNeutralPixel -Color $pixel) {
      $queue.Enqueue([System.Drawing.Point]::new($X, $Y))
    }
  }

  for ($x = 0; $x -lt $width; $x++) {
    Enqueue-IfBackground -X $x -Y 0
    Enqueue-IfBackground -X $x -Y ($height - 1)
  }

  for ($y = 0; $y -lt $height; $y++) {
    Enqueue-IfBackground -X 0 -Y $y
    Enqueue-IfBackground -X ($width - 1) -Y $y
  }

  while ($queue.Count -gt 0) {
    $point = $queue.Dequeue()
    $pixel = $Bitmap.GetPixel($point.X, $point.Y)
    $Bitmap.SetPixel($point.X, $point.Y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))

    Enqueue-IfBackground -X ($point.X - 1) -Y $point.Y
    Enqueue-IfBackground -X ($point.X + 1) -Y $point.Y
    Enqueue-IfBackground -X $point.X -Y ($point.Y - 1)
    Enqueue-IfBackground -X $point.X -Y ($point.Y + 1)
  }
}

function Get-VisibleBounds {
  param([System.Drawing.Bitmap]$Bitmap)

  $left = $Bitmap.Width
  $top = $Bitmap.Height
  $right = -1
  $bottom = -1

  for ($x = 0; $x -lt $Bitmap.Width; $x++) {
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
      $pixel = $Bitmap.GetPixel($x, $y)
      if ($pixel.A -gt 16) {
        if ($x -lt $left) { $left = $x }
        if ($x -gt $right) { $right = $x }
        if ($y -lt $top) { $top = $y }
        if ($y -gt $bottom) { $bottom = $y }
      }
    }
  }

  if ($right -lt $left -or $bottom -lt $top) {
    return $null
  }

  return [System.Drawing.Rectangle]::new($left, $top, ($right - $left + 1), ($bottom - $top + 1))
}

function New-CropBitmap {
  param(
    [System.Drawing.Bitmap]$Source,
    [System.Drawing.Rectangle]$Crop
  )

  $bitmap = New-Object System.Drawing.Bitmap($Crop.Width, $Crop.Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-GraphicsQuality -Graphics $graphics
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.DrawImage(
    $Source,
    [System.Drawing.Rectangle]::new(0, 0, $Crop.Width, $Crop.Height),
    $Crop,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $graphics.Dispose()
  return $bitmap
}

function Save-NormalizedTransparentImage {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return
  }

  $source = [System.Drawing.Bitmap]::new($Path)

  try {
    Remove-ConnectedBackground -Bitmap $source
    $bounds = Get-VisibleBounds -Bitmap $source

    if ($null -eq $bounds) {
      Write-Warning ("Skipping {0}: no visible device bounds detected" -f $Path)
      return
    }

    $cropped = New-CropBitmap -Source $source -Crop $bounds

    try {
      $canvasWidth = 420
      $canvasHeight = 860
      $paddingX = 38
      $paddingTop = 32
      $paddingBottom = 38
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
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImage($cropped, $drawX, $drawY, $drawWidth, $drawHeight)
      $graphics.Dispose()

      $canvas.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
      $canvas.Dispose()
    }
    finally {
      $cropped.Dispose()
    }
  }
  finally {
    $source.Dispose()
  }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$models = @(
  "iphone-14",
  "iphone-15",
  "iphone-14-pro",
  "iphone-13-pro-max",
  "iphone-15-plus",
  "iphone-14-plus"
)

foreach ($slug in $models) {
  $folder = Join-Path $root ("assets/images/phones/" + $slug)
  Save-NormalizedTransparentImage -Path (Join-Path $folder "front.png")
  Save-NormalizedTransparentImage -Path (Join-Path $folder "back.png")
  Write-Output ("Refined {0}" -f $slug)
}
