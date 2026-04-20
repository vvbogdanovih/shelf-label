import type { LabelConfig } from './types'
import { HEBREW_LABELS, toRoman, LABEL_WIDTH, LABEL_HEIGHT } from './constants'
import { encodeCode128B } from './code128'

const pad = (n: number) => n.toString().padStart(2, '0')

// ── Layout constants ──────────────────────────────────────────────

// Zone badge (top-left, or top-right in Hebrew)
const ZONE_W = 160
const ZONE_H = 230
const ZONE_LABEL_Y = 75
const ZONE_LABEL_SIZE = 36
const ZONE_LETTER_Y = 185
const ZONE_LETTER_SIZE = 126

// Full code (centered in top row)
const CODE_BASELINE_Y = 185
const CODE_PREFIX_SIZE = 157
const CODE_MAIN_SIZE = 230
const CODE_NARROW_SCALE = 0.82 // simulate "Arial Narrow"

// Arrow badge (bottom-left, or bottom-right in Hebrew)
const ARROW_W = 286
const ARROW_H = 381
const ARROW_BADGE_TOP = 500

// Arrow polygon (original SVG viewBox 86×135, scaled to 205×306)
const ARROW_DRAW_W = 205
const ARROW_DRAW_H = 306
const ARROW_POINTS: [number, number][] = [
  [86, 77], [55, 46], [55, 135], [31, 135],
  [31, 46], [0, 77], [0, 43], [43, 0], [86, 43],
]
const ARROW_SX = ARROW_DRAW_W / 86
const ARROW_SY = ARROW_DRAW_H / 135

// Columns
const COL_HEADER_Y = 340
const COL_VALUE_Y = 500
const COL_HEADER_SIZE = 75
const COL_VALUE_SIZE = 126
const COL_DIVIDER_W = 6
const COL_DIVIDER_Y1 = 300
const COL_DIVIDER_Y2 = 555

// Separator line
const SEP_Y = 570
const SEP_H = 6
const SEP_W = 1300

// Barcode
const BAR_Y = 600
const BAR_H = 250

// Barcode text
const BAR_TEXT_Y = 880
const BAR_TEXT_SIZE = 56

// ── Helpers ───────────────────────────────────────────────────────

function getPartialCode(c: LabelConfig): string {
  const fmt = c.hebrewMode ? toRoman : pad
  return `${fmt(c.row)}-${fmt(c.rack)}-${fmt(c.level)}-${fmt(c.position)}`
}

function getFullCode(c: LabelConfig): string {
  const fmt = c.hebrewMode ? toRoman : pad
  return `${c.zone}-${fmt(c.row)}-${fmt(c.rack)}-${fmt(c.level)}-${fmt(c.position)}`
}

function getBarcodeCode(c: LabelConfig): string {
  return `${c.zone}-${pad(c.row)}-${pad(c.rack)}-${pad(c.level)}-${pad(c.position)}`
}

// ── Drawing functions ─────────────────────────────────────────────

function drawZoneBadge(
  ctx: OffscreenCanvasRenderingContext2D,
  config: LabelConfig,
  hebrew: boolean,
) {
  const labels = hebrew
    ? { zone: HEBREW_LABELS.zone }
    : { zone: 'ЗОНА' }

  const x = hebrew ? LABEL_WIDTH - ZONE_W : 0

  // Black rectangle
  ctx.fillStyle = '#000'
  ctx.fillRect(x, 0, ZONE_W, ZONE_H)

  // Zone label ("ЗОНА" / Hebrew)
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${ZONE_LABEL_SIZE}px Arial, Helvetica, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(labels.zone, x + ZONE_W / 2, ZONE_LABEL_Y)

  // Zone letter
  ctx.font = `bold ${ZONE_LETTER_SIZE}px Arial, Helvetica, sans-serif`
  ctx.fillText(config.zone, x + ZONE_W / 2, ZONE_LETTER_Y)
}

function drawFullCode(
  ctx: OffscreenCanvasRenderingContext2D,
  config: LabelConfig,
) {
  const partialCode = getPartialCode(config)
  const prefix = `${config.zone}-`

  // Measure main (bold) text width
  ctx.font = `bold ${CODE_MAIN_SIZE}px Arial, Helvetica, sans-serif`
  const mainWidth = ctx.measureText(partialCode).width

  // Measure prefix width (narrow font simulated by horizontal scale)
  ctx.font = `${CODE_PREFIX_SIZE}px Arial, Helvetica, sans-serif`
  const prefixNaturalWidth = ctx.measureText(prefix).width
  const prefixWidth = prefixNaturalWidth * CODE_NARROW_SCALE

  const totalWidth = prefixWidth + mainWidth
  const centerX = LABEL_WIDTH / 2
  const startX = centerX - totalWidth / 2

  // Draw prefix (narrow)
  ctx.save()
  ctx.translate(startX, CODE_BASELINE_Y)
  ctx.scale(CODE_NARROW_SCALE, 1)
  ctx.fillStyle = '#000'
  ctx.font = `${CODE_PREFIX_SIZE}px Arial, Helvetica, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(prefix, 0, 0)
  ctx.restore()

  // Draw main code (bold)
  ctx.fillStyle = '#000'
  ctx.font = `bold ${CODE_MAIN_SIZE}px Arial, Helvetica, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(partialCode, startX + prefixWidth, CODE_BASELINE_Y)
}

function drawArrowBadge(
  ctx: OffscreenCanvasRenderingContext2D,
  config: LabelConfig,
  hebrew: boolean,
) {
  const badgeX = hebrew ? LABEL_WIDTH - ARROW_W : 0
  const badgeY = ARROW_BADGE_TOP

  // Black rectangle
  ctx.fillStyle = '#000'
  ctx.fillRect(badgeX, badgeY, ARROW_W, ARROW_H)

  // Arrow polygon (white)
  const offsetX = badgeX + (ARROW_W - ARROW_DRAW_W) / 2
  const offsetY = badgeY + (ARROW_H - ARROW_DRAW_H) / 2

  ctx.save()
  ctx.fillStyle = '#fff'

  if (config.arrowDirection === 'down') {
    // Flip vertically: translate to center, scale -1 on Y
    ctx.translate(offsetX + ARROW_DRAW_W / 2, offsetY + ARROW_DRAW_H / 2)
    ctx.scale(1, -1)
    ctx.translate(-(offsetX + ARROW_DRAW_W / 2), -(offsetY + ARROW_DRAW_H / 2))
  }

  ctx.beginPath()
  for (let i = 0; i < ARROW_POINTS.length; i++) {
    const px = offsetX + ARROW_POINTS[i][0] * ARROW_SX
    const py = offsetY + ARROW_POINTS[i][1] * ARROW_SY
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawColumns(
  ctx: OffscreenCanvasRenderingContext2D,
  config: LabelConfig,
  hebrew: boolean,
  contentX: number,
  contentW: number,
) {
  const labels = hebrew
    ? [HEBREW_LABELS.row, HEBREW_LABELS.rack, HEBREW_LABELS.level, HEBREW_LABELS.position]
    : ['РЯД', 'СТЕЛАЖ', 'РІВЕНЬ', 'МІСЦЕ']

  const fmt = hebrew ? toRoman : pad
  const values = [
    fmt(config.row),
    fmt(config.rack),
    fmt(config.level),
    fmt(config.position),
  ]

  const colW = contentW / 4

  for (let i = 0; i < 4; i++) {
    const cx = contentX + colW * i + colW / 2

    // Vertical divider (before columns 1,2,3)
    if (i > 0) {
      const divX = contentX + colW * i
      ctx.fillStyle = '#000'
      ctx.fillRect(divX - COL_DIVIDER_W / 2, COL_DIVIDER_Y1, COL_DIVIDER_W, COL_DIVIDER_Y2 - COL_DIVIDER_Y1)
    }

    // Header
    ctx.fillStyle = '#000'
    ctx.font = `${COL_HEADER_SIZE}px Arial, Helvetica, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(labels[i], cx, COL_HEADER_Y)

    // Value
    ctx.font = `800 ${COL_VALUE_SIZE}px Arial, Helvetica, sans-serif`
    ctx.fillText(values[i], cx, COL_VALUE_Y)
  }
}

function drawSeparator(
  ctx: OffscreenCanvasRenderingContext2D,
  contentX: number,
  contentW: number,
) {
  const sepX = contentX + (contentW - SEP_W) / 2
  ctx.fillStyle = '#000'
  ctx.fillRect(sepX, SEP_Y, SEP_W, SEP_H)
}

function drawBarcode(
  ctx: OffscreenCanvasRenderingContext2D,
  config: LabelConfig,
  contentX: number,
  contentW: number,
) {
  const barcodeCode = getBarcodeCode(config)
  const bits = encodeCode128B(barcodeCode)

  const barcodeW = SEP_W // same width as separator
  const barcodeX = contentX + (contentW - barcodeW) / 2
  const moduleW = barcodeW / bits.length

  ctx.fillStyle = '#000'
  for (let i = 0; i < bits.length; i++) {
    if (bits[i]) {
      ctx.fillRect(barcodeX + i * moduleW, BAR_Y, moduleW, BAR_H)
    }
  }
}

function drawBarcodeText(
  ctx: OffscreenCanvasRenderingContext2D,
  config: LabelConfig,
  contentX: number,
  contentW: number,
) {
  const fullCode = getFullCode(config)
  const centerX = contentX + contentW / 2

  ctx.fillStyle = '#000'
  ctx.font = `${BAR_TEXT_SIZE}px Arial, Helvetica, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(fullCode, centerX, BAR_TEXT_Y)
}

// ── Main render function ──────────────────────────────────────────

export function renderLabel(
  ctx: OffscreenCanvasRenderingContext2D,
  config: LabelConfig,
): void {
  const hebrew = !!config.hebrewMode

  // Clear canvas
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, LABEL_WIDTH, LABEL_HEIGHT)

  // Content area (right of arrow badge, or left in Hebrew mode)
  const contentX = hebrew ? 0 : ARROW_W + 24
  const contentW = hebrew ? LABEL_WIDTH - ARROW_W - 24 : LABEL_WIDTH - ARROW_W - 24

  drawZoneBadge(ctx, config, hebrew)
  drawFullCode(ctx, config)
  drawArrowBadge(ctx, config, hebrew)
  drawColumns(ctx, config, hebrew, contentX, contentW)
  drawSeparator(ctx, contentX, contentW)
  drawBarcode(ctx, config, contentX, contentW)
  drawBarcodeText(ctx, config, contentX, contentW)
}
