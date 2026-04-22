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

function Get-GsmarenaBigPicUrl {
  param([string]$ModelName)

  $query = [System.Uri]::EscapeDataString($ModelName)
  $html = & curl.exe -L "https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=$query"
  if (-not $html) {
    throw "Could not fetch search results for $ModelName"
  }

  $pattern = '<img src=(?<src>https://fdn2\.gsmarena\.com/vv/bigpic/[^ ]+)[^>]*><strong><span>Apple<br>(?<name>[^<]+)</span>'
  $matches = [System.Text.RegularExpressions.Regex]::Matches(
    $html,
    $pattern,
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  foreach ($match in $matches) {
    if ($match.Groups["name"].Value.Trim() -eq $ModelName) {
      return $match.Groups["src"].Value.Trim()
    }
  }

  throw "Could not find a product image URL for $ModelName"
}

function Remove-WhiteBackground {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$Threshold = 244
  )

  for ($x = 0; $x -lt $Bitmap.Width; $x++) {
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
      $color = $Bitmap.GetPixel($x, $y)
      if ($color.R -ge $Threshold -and $color.G -ge $Threshold -and $color.B -ge $Threshold) {
        $Bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $color.R, $color.G, $color.B))
      }
    }
  }
}

function Save-CropAsPng {
  param(
    [System.Drawing.Bitmap]$Source,
    [System.Drawing.Rectangle]$Crop,
    [string]$Destination
  )

  $bitmap = New-Object System.Drawing.Bitmap($Crop.Width, $Crop.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-GraphicsQuality -Graphics $graphics
  $graphics.DrawImage(
    $Source,
    [System.Drawing.Rectangle]::new(0, 0, $Crop.Width, $Crop.Height),
    $Crop,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $graphics.Dispose()

  Remove-WhiteBackground -Bitmap $bitmap
  $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$heroSourceDir = Join-Path $root "assets/images/phones/_sources"
Ensure-Directory -Path $heroSourceDir

$models = @(
  @{ Slug = "iphone-7"; Name = "iPhone 7" },
  @{ Slug = "iphone-7-plus"; Name = "iPhone 7 Plus" },
  @{ Slug = "iphone-8"; Name = "iPhone 8" },
  @{ Slug = "iphone-8-plus"; Name = "iPhone 8 Plus" },
  @{ Slug = "iphone-x"; Name = "iPhone X" },
  @{ Slug = "iphone-xr"; Name = "iPhone XR" },
  @{ Slug = "iphone-xs"; Name = "iPhone XS" },
  @{ Slug = "iphone-xs-max"; Name = "iPhone XS Max" },
  @{ Slug = "iphone-11"; Name = "iPhone 11" },
  @{ Slug = "iphone-11-pro"; Name = "iPhone 11 Pro" },
  @{ Slug = "iphone-11-pro-max"; Name = "iPhone 11 Pro Max" },
  @{ Slug = "iphone-12"; Name = "iPhone 12" },
  @{ Slug = "iphone-12-pro"; Name = "iPhone 12 Pro" },
  @{ Slug = "iphone-12-pro-max"; Name = "iPhone 12 Pro Max" },
  @{ Slug = "iphone-13"; Name = "iPhone 13" },
  @{ Slug = "iphone-13-pro"; Name = "iPhone 13 Pro" },
  @{ Slug = "iphone-13-pro-max"; Name = "iPhone 13 Pro Max" },
  @{ Slug = "iphone-14"; Name = "iPhone 14" },
  @{ Slug = "iphone-14-plus"; Name = "iPhone 14 Plus" },
  @{ Slug = "iphone-14-pro"; Name = "iPhone 14 Pro" },
  @{ Slug = "iphone-14-pro-max"; Name = "iPhone 14 Pro Max" },
  @{ Slug = "iphone-15"; Name = "iPhone 15" },
  @{ Slug = "iphone-15-plus"; Name = "iPhone 15 Plus" },
  @{ Slug = "iphone-15-pro"; Name = "iPhone 15 Pro" },
  @{ Slug = "iphone-15-pro-max"; Name = "iPhone 15 Pro Max" }
)

foreach ($model in $models) {
  $folder = Join-Path $root ("assets/images/phones/" + $model.Slug)
  Ensure-Directory -Path $folder

  $sourcePath = Join-Path $heroSourceDir ($model.Slug + ".jpg")
  $frontPath = Join-Path $folder "front.png"
  $backPath = Join-Path $folder "back.png"

  $sourceUrl = Get-GsmarenaBigPicUrl -ModelName $model.Name
  Invoke-WebRequest -Uri $sourceUrl -OutFile $sourcePath

  $source = [System.Drawing.Bitmap]::new($sourcePath)
  try {
    $width = $source.Width
    $height = $source.Height
    $backWidth = [int][Math]::Round($width * 0.42)
    $frontWidth = [int][Math]::Round($width * 0.46)

    $backCrop = [System.Drawing.Rectangle]::new(0, 0, $backWidth, $height)
    $frontCrop = [System.Drawing.Rectangle]::new($width - $frontWidth, 0, $frontWidth, $height)

    Save-CropAsPng -Source $source -Crop $frontCrop -Destination $frontPath
    Save-CropAsPng -Source $source -Crop $backCrop -Destination $backPath
  }
  finally {
    $source.Dispose()
  }

  Write-Output ("Imported {0}" -f $model.Name)
}
