Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

function New-RoundedRectanglePath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2

  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Set-HighQualityGraphics {
  param([System.Drawing.Graphics]$Graphics)

  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $Graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
}

function Save-Bitmap {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )

  $directory = Split-Path -Parent $Path
  if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Bitmap.Dispose()
}

function Draw-Glow {
  param(
    [System.Drawing.Graphics]$Graphics,
    [int]$X,
    [int]$Y,
    [int]$Width,
    [int]$Height,
    [System.Drawing.Color]$Color
  )

  $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush(([System.Drawing.Drawing2D.GraphicsPath]::new()))
}

function Draw-PhoneFront {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [System.Drawing.Color]$FrameColor,
    [System.Drawing.Color]$AccentColor
  )

  $outerPath = New-RoundedRectanglePath -X $X -Y $Y -Width $Width -Height $Height -Radius 34
  $innerPath = New-RoundedRectanglePath -X ($X + 12) -Y ($Y + 12) -Width ($Width - 24) -Height ($Height - 24) -Radius 28

  $frameBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    ([System.Drawing.PointF]::new($X, $Y)),
    ([System.Drawing.PointF]::new($X + $Width, $Y + $Height)),
    $FrameColor,
    [System.Drawing.Color]::FromArgb(255, 20, 28, 45)
  )
  $screenBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    ([System.Drawing.PointF]::new($X, $Y + 12)),
    ([System.Drawing.PointF]::new($X + $Width, $Y + $Height)),
    [System.Drawing.Color]::FromArgb(255, 17, 34, 66),
    [System.Drawing.Color]::FromArgb(255, 7, 10, 19)
  )
  $outlinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 214, 230, 255), 2)
  $accentPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, $AccentColor.R, $AccentColor.G, $AccentColor.B), 5)

  $Graphics.FillPath($frameBrush, $outerPath)
  $Graphics.FillPath($screenBrush, $innerPath)
  $Graphics.DrawPath($outlinePen, $outerPath)

  $notchBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 4, 6, 12))
  $Graphics.FillRoundedRectangle($notchBrush, $X + ($Width / 2) - 56, $Y + 22, 112, 18, 9)

  $Graphics.DrawLine($accentPen, $X + 34, $Y + 74, $X + 34, $Y + $Height - 76)

  $glowBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    ([System.Drawing.PointF]::new($X + 30, $Y + 140)),
    ([System.Drawing.PointF]::new($X + $Width - 30, $Y + $Height - 110)),
    [System.Drawing.Color]::FromArgb(105, 72, 204, 255),
    [System.Drawing.Color]::FromArgb(105, 138, 125, 255)
  )
  $Graphics.FillEllipse($glowBrush, $X + 35, $Y + 130, $Width - 70, $Height - 240)

  $highlightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 255, 255, 255))
  $Graphics.FillRectangle($highlightBrush, $X + 26, $Y + 28, 8, $Height - 56)

  $notchBrush.Dispose()
  $frameBrush.Dispose()
  $screenBrush.Dispose()
  $outlinePen.Dispose()
  $accentPen.Dispose()
  $glowBrush.Dispose()
  $highlightBrush.Dispose()
  $outerPath.Dispose()
  $innerPath.Dispose()
}

function Draw-PhoneBack {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [System.Drawing.Color]$FrameColor
  )

  $outerPath = New-RoundedRectanglePath -X $X -Y $Y -Width $Width -Height $Height -Radius 34
  $backBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    ([System.Drawing.PointF]::new($X, $Y)),
    ([System.Drawing.PointF]::new($X + $Width, $Y + $Height)),
    $FrameColor,
    [System.Drawing.Color]::FromArgb(255, 10, 16, 28)
  )
  $outlinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 214, 230, 255), 2)
  $cameraPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 255, 255, 255), 2)
  $lensBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 20, 34))
  $flashBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 235, 180))
  $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 255, 255, 255))

  $Graphics.FillPath($backBrush, $outerPath)
  $Graphics.DrawPath($outlinePen, $outerPath)
  $Graphics.FillRectangle($accentBrush, $X + 26, $Y + 28, 8, $Height - 56)

  $cameraIsland = New-RoundedRectanglePath -X ($X + 26) -Y ($Y + 28) -Width 108 -Height 108 -Radius 24
  $cameraBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(95, 10, 15, 28))
  $Graphics.FillPath($cameraBrush, $cameraIsland)

  foreach ($lens in @(
      @{ X = $X + 42; Y = $Y + 42 },
      @{ X = $X + 84; Y = $Y + 42 },
      @{ X = $X + 42; Y = $Y + 84 }
    )) {
    $Graphics.FillEllipse($lensBrush, $lens.X, $lens.Y, 28, 28)
    $Graphics.DrawEllipse($cameraPen, $lens.X, $lens.Y, 28, 28)
  }

  $Graphics.FillEllipse($flashBrush, $X + 90, $Y + 90, 14, 14)

  $backBrush.Dispose()
  $outlinePen.Dispose()
  $cameraPen.Dispose()
  $lensBrush.Dispose()
  $flashBrush.Dispose()
  $accentBrush.Dispose()
  $cameraBrush.Dispose()
  $outerPath.Dispose()
  $cameraIsland.Dispose()
}

Update-TypeData -TypeName System.Drawing.Graphics -MemberType ScriptMethod -MemberName FillRoundedRectangle -Value {
  param($Brush, $X, $Y, $Width, $Height, $Radius)
  $path = New-RoundedRectanglePath -X $X -Y $Y -Width $Width -Height $Height -Radius $Radius
  $this.FillPath($Brush, $path)
  $path.Dispose()
} -Force

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function New-Canvas {
  param([int]$Width, [int]$Height, [System.Drawing.Color]$Background)
  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-HighQualityGraphics -Graphics $graphics
  $graphics.Clear($Background)
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Draw-BackgroundOrbs {
  param([System.Drawing.Graphics]$Graphics, [int]$Width, [int]$Height)

  $cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(48, 72, 204, 255))
  $violetBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(58, 138, 125, 255))
  $highlightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 255, 255, 255))

  $Graphics.FillEllipse($cyanBrush, -80, -40, 420, 420)
  $Graphics.FillEllipse($violetBrush, $Width - 380, $Height - 320, 460, 460)
  $Graphics.FillEllipse($highlightBrush, $Width - 290, 40, 180, 180)

  $gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(16, 255, 255, 255), 1)
  for ($x = 0; $x -lt $Width; $x += 90) {
    $Graphics.DrawLine($gridPen, $x, 0, $x, $Height)
  }
  for ($y = 0; $y -lt $Height; $y += 90) {
    $Graphics.DrawLine($gridPen, 0, $y, $Width, $y)
  }

  $cyanBrush.Dispose()
  $violetBrush.Dispose()
  $highlightBrush.Dispose()
  $gridPen.Dispose()
}

function Draw-Title {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$LineOne,
    [string]$LineTwo,
    [string]$Subtitle,
    [float]$X,
    [float]$Y
  )

  $titleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 34, [System.Drawing.FontStyle]::Bold)
  $subFont = New-Object System.Drawing.Font("Segoe UI", 17, [System.Drawing.FontStyle]::Regular)
  $eyebrowFont = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
  $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 247, 255))
  $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 190, 220))
  $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(195, 247, 255))

  $Graphics.DrawString("CNDIE'S COLLECTION", $eyebrowFont, $accentBrush, $X, $Y)
  $Graphics.DrawString($LineOne, $titleFont, $whiteBrush, $X, $Y + 36)
  $Graphics.DrawString($LineTwo, $titleFont, $whiteBrush, $X, $Y + 82)
  $Graphics.DrawString($Subtitle, $subFont, $mutedBrush, $X, $Y + 150)

  $titleFont.Dispose()
  $subFont.Dispose()
  $eyebrowFont.Dispose()
  $whiteBrush.Dispose()
  $mutedBrush.Dispose()
  $accentBrush.Dispose()
}

function Generate-Logo {
  $canvas = New-Canvas -Width 768 -Height 768 -Background ([System.Drawing.Color]::Transparent)
  $bitmap = $canvas.Bitmap
  $graphics = $canvas.Graphics

  $graphics.Clear([System.Drawing.Color]::Transparent)
  $path = New-RoundedRectanglePath -X 84 -Y 84 -Width 600 -Height 600 -Radius 150
  $fill = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    ([System.Drawing.PointF]::new(84, 84)),
    ([System.Drawing.PointF]::new(684, 684)),
    [System.Drawing.Color]::FromArgb(255, 72, 204, 255),
    [System.Drawing.Color]::FromArgb(255, 138, 125, 255)
  )
  $outline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 255, 255, 255), 6)
  $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(48, 0, 0, 0))
  $font = New-Object System.Drawing.Font("Segoe UI Semibold", 188, [System.Drawing.FontStyle]::Bold)
  $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))

  $graphics.TranslateTransform(0, 12)
  $graphics.FillPath($shadowBrush, $path)
  $graphics.ResetTransform()
  Set-HighQualityGraphics -Graphics $graphics

  $graphics.FillPath($fill, $path)
  $graphics.DrawPath($outline, $path)
  $graphics.DrawString("CC", $font, $textBrush, 170, 220)

  $fill.Dispose()
  $outline.Dispose()
  $shadowBrush.Dispose()
  $font.Dispose()
  $textBrush.Dispose()
  $path.Dispose()
  $graphics.Dispose()

  Save-Bitmap -Bitmap $bitmap -Path (Join-Path $root "assets/images/logo/logo-mark.png")
}

function Generate-Hero {
  $canvas = New-Canvas -Width 1400 -Height 980 -Background ([System.Drawing.Color]::FromArgb(255, 4, 7, 14))
  $bitmap = $canvas.Bitmap
  $graphics = $canvas.Graphics

  Draw-BackgroundOrbs -Graphics $graphics -Width 1400 -Height 980

  $panelPath = New-RoundedRectanglePath -X 72 -Y 92 -Width 1256 -Height 796 -Radius 44
  $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(108, 10, 18, 36))
  $panelOutline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(48, 173, 197, 255), 2)
  $graphics.FillPath($panelBrush, $panelPath)
  $graphics.DrawPath($panelOutline, $panelPath)

  Draw-Title -Graphics $graphics -LineOne "Premium iPhones." -LineTwo "Trusted locally." -Subtitle "Brand new and pre-owned devices with premium presentation and smart pricing." -X 118 -Y 154

  $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(42, 72, 204, 255))
  $badgeText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 245, 247, 255))
  $badgeFont = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
  $graphics.FillRoundedRectangle($badgeBrush, 118, 352, 228, 46, 23)
  $graphics.DrawString("Free Delivery Available", $badgeFont, $badgeText, 140, 364)

  Draw-PhoneBack -Graphics $graphics -X 700 -Y 210 -Width 218 -Height 460 -FrameColor ([System.Drawing.Color]::FromArgb(255, 44, 70, 122))
  Draw-PhoneBack -Graphics $graphics -X 1010 -Y 240 -Width 198 -Height 420 -FrameColor ([System.Drawing.Color]::FromArgb(255, 60, 44, 110))
  Draw-PhoneFront -Graphics $graphics -X 828 -Y 174 -Width 236 -Height 500 -FrameColor ([System.Drawing.Color]::FromArgb(255, 32, 46, 78)) -AccentColor ([System.Drawing.Color]::FromArgb(255, 72, 204, 255))

  $miniPanelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(118, 9, 15, 30))
  $miniPanelPath = New-RoundedRectanglePath -X 116 -Y 478 -Width 338 -Height 168 -Radius 28
  $miniOutline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(38, 170, 192, 255), 2)
  $miniTitleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 18, [System.Drawing.FontStyle]::Bold)
  $miniBodyFont = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Regular)
  $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 247, 255))
  $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 190, 220))

  $graphics.FillPath($miniPanelBrush, $miniPanelPath)
  $graphics.DrawPath($miniOutline, $miniPanelPath)
  $graphics.DrawString("Smart Phones. Smart Prices.", $miniTitleFont, $whiteBrush, 146, 520)
  $graphics.DrawString("Richards Bay & Meer En See", $miniBodyFont, $mutedBrush, 146, 566)
  $graphics.DrawString("WhatsApp: 078 134 7169", $miniBodyFont, $mutedBrush, 146, 598)

  $graphics.Dispose()

  $panelPath.Dispose()
  $panelBrush.Dispose()
  $panelOutline.Dispose()
  $badgeBrush.Dispose()
  $badgeText.Dispose()
  $badgeFont.Dispose()
  $miniPanelBrush.Dispose()
  $miniPanelPath.Dispose()
  $miniOutline.Dispose()
  $miniTitleFont.Dispose()
  $miniBodyFont.Dispose()
  $whiteBrush.Dispose()
  $mutedBrush.Dispose()

  Save-Bitmap -Bitmap $bitmap -Path (Join-Path $root "assets/images/hero/premium-hero.png")
}

function Generate-StoreBanner {
  $canvas = New-Canvas -Width 1600 -Height 560 -Background ([System.Drawing.Color]::FromArgb(255, 5, 8, 15))
  $bitmap = $canvas.Bitmap
  $graphics = $canvas.Graphics

  Draw-BackgroundOrbs -Graphics $graphics -Width 1600 -Height 560

  $panel = New-RoundedRectanglePath -X 48 -Y 54 -Width 1504 -Height 452 -Radius 40
  $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(112, 10, 18, 36))
  $outline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(44, 173, 197, 255), 2)
  $graphics.FillPath($panelBrush, $panel)
  $graphics.DrawPath($outline, $panel)

  Draw-Title -Graphics $graphics -LineOne "Free delivery in" -LineTwo "Richards Bay & Meer En See" -Subtitle "R70 delivery to other areas. Fully tested devices. Trusted seller." -X 110 -Y 120

  Draw-PhoneFront -Graphics $graphics -X 1130 -Y 118 -Width 178 -Height 360 -FrameColor ([System.Drawing.Color]::FromArgb(255, 26, 38, 66)) -AccentColor ([System.Drawing.Color]::FromArgb(255, 138, 125, 255))
  Draw-PhoneBack -Graphics $graphics -X 1320 -Y 144 -Width 162 -Height 332 -FrameColor ([System.Drawing.Color]::FromArgb(255, 56, 42, 98))

  $graphics.Dispose()
  $panel.Dispose()
  $panelBrush.Dispose()
  $outline.Dispose()

  Save-Bitmap -Bitmap $bitmap -Path (Join-Path $root "assets/images/banners/store-banner.png")
}

function Generate-ContactBanner {
  $canvas = New-Canvas -Width 1600 -Height 560 -Background ([System.Drawing.Color]::FromArgb(255, 5, 8, 15))
  $bitmap = $canvas.Bitmap
  $graphics = $canvas.Graphics

  Draw-BackgroundOrbs -Graphics $graphics -Width 1600 -Height 560

  $panel = New-RoundedRectanglePath -X 48 -Y 54 -Width 1504 -Height 452 -Radius 40
  $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(112, 10, 18, 36))
  $outline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(44, 173, 197, 255), 2)
  $graphics.FillPath($panelBrush, $panel)
  $graphics.DrawPath($outline, $panel)

  Draw-Title -Graphics $graphics -LineOne "Chat before" -LineTwo "making payment" -Subtitle "Reference must include your full name and iPhone model." -X 110 -Y 120

  $calloutBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(118, 9, 15, 30))
  $calloutPath = New-RoundedRectanglePath -X 120 -Y 314 -Width 530 -Height 116 -Radius 28
  $calloutTitle = New-Object System.Drawing.Font("Segoe UI Semibold", 17, [System.Drawing.FontStyle]::Bold)
  $calloutBody = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Regular)
  $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 247, 255))
  $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 190, 220))

  $graphics.FillPath($calloutBrush, $calloutPath)
  $graphics.DrawString("Capitec Bank", $calloutTitle, $whiteBrush, 150, 344)
  $graphics.DrawString("Account No: 2115946185", $calloutBody, $mutedBrush, 150, 378)

  Draw-PhoneFront -Graphics $graphics -X 1155 -Y 112 -Width 184 -Height 370 -FrameColor ([System.Drawing.Color]::FromArgb(255, 26, 38, 66)) -AccentColor ([System.Drawing.Color]::FromArgb(255, 72, 204, 255))
  Draw-PhoneBack -Graphics $graphics -X 1346 -Y 138 -Width 164 -Height 338 -FrameColor ([System.Drawing.Color]::FromArgb(255, 44, 70, 122))

  $graphics.Dispose()
  $panel.Dispose()
  $panelBrush.Dispose()
  $outline.Dispose()
  $calloutBrush.Dispose()
  $calloutPath.Dispose()
  $calloutTitle.Dispose()
  $calloutBody.Dispose()
  $whiteBrush.Dispose()
  $mutedBrush.Dispose()

  Save-Bitmap -Bitmap $bitmap -Path (Join-Path $root "assets/images/banners/contact-banner.png")
}

Generate-Logo
Generate-Hero
Generate-StoreBanner
Generate-ContactBanner
