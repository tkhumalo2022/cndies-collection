Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

function Ensure-Directory {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Set-GraphicsQuality {
  param([System.Drawing.Graphics]$Graphics)
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
}

function Save-Jpeg {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path,
    [long]$Quality = 90
  )

  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $encoder = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encoder.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
  $Bitmap.Save($Path, $codec, $encoder)
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$heroDir = Join-Path $root "assets/images/hero"
$sourcePath = Join-Path $heroDir "apple-hero-source.jpg"
$outputPath = Join-Path $heroDir "premium-hero-realistic.jpg"

Ensure-Directory -Path $heroDir

if (-not (Test-Path $sourcePath) -or ((Get-Item $sourcePath).Length -eq 0)) {
  Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" -OutFile $sourcePath
}

$source = [System.Drawing.Bitmap]::new($sourcePath)
$crop = [System.Drawing.Rectangle]::new(340, 70, 2140, 1470)
$canvas = New-Object System.Drawing.Bitmap(1420, 976)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
Set-GraphicsQuality -Graphics $graphics
$graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, 1420, 976), $crop, [System.Drawing.GraphicsUnit]::Pixel)
$graphics.Dispose()
$source.Dispose()

Save-Jpeg -Bitmap $canvas -Path $outputPath -Quality 90
$canvas.Dispose()
