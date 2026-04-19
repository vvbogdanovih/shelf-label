import { ZONE_TO_LATIN } from './constants'

/**
 * Code128B bar/space width patterns (values 0-105).
 * Each string is 6 digits: alternating bar,space,bar,space,bar,space widths.
 * Total modules per symbol = 11.
 */
const PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', // 0-4
  '131222', '122213', '122312', '132212', '221213', // 5-9
  '221312', '231212', '112232', '122132', '122231', // 10-14
  '113222', '123122', '123221', '223211', '221132', // 15-19
  '221231', '213212', '223112', '312131', '311222', // 20-24
  '321122', '321221', '312212', '322112', '322211', // 25-29
  '212123', '212321', '232121', '111323', '131123', // 30-34
  '131321', '112313', '132113', '132311', '211313', // 35-39
  '231113', '231311', '112133', '112331', '132131', // 40-44
  '113123', '113321', '133121', '313121', '211331', // 45-49
  '231131', '213113', '213311', '213131', '311123', // 50-54
  '311321', '331121', '312113', '312311', '332111', // 55-59
  '314111', '221411', '431111', '111224', '111422', // 60-64
  '121124', '121421', '141122', '141221', '112214', // 65-69
  '112412', '122114', '122411', '142112', '142211', // 70-74
  '241211', '221114', '413111', '241112', '134111', // 75-79
  '111242', '121142', '121241', '114212', '124112', // 80-84
  '124211', '411212', '421112', '421211', '212141', // 85-89
  '214121', '412121', '111143', '111341', '131141', // 90-94
  '114113', '114311', '411113', '411311', '113141', // 95-99
  '114131', '311141', '411131',                      // 100-102
  '211412', '211214', '211232',                      // 103=START_A, 104=START_B, 105=START_C
]

/** STOP symbol: 7 elements, 13 modules */
const STOP_PATTERN = '2331112'

const START_B = 104

function expandPattern(widths: string): boolean[] {
  const bits: boolean[] = []
  for (let i = 0; i < widths.length; i++) {
    const w = parseInt(widths[i])
    const isBar = i % 2 === 0
    for (let j = 0; j < w; j++) {
      bits.push(isBar)
    }
  }
  return bits
}

function toLatin(text: string): string {
  return text
    .split('')
    .map(ch => ZONE_TO_LATIN[ch] || ch)
    .join('')
}

/**
 * Encode a string as Code128B barcode.
 * Converts Cyrillic zone letters to Latin automatically.
 * Returns array of bits (true = black bar, false = white space).
 */
export function encodeCode128B(text: string): boolean[] {
  const latin = toLatin(text)

  const values: number[] = [START_B]
  for (const ch of latin) {
    const code = ch.charCodeAt(0)
    if (code < 32 || code > 127) {
      throw new Error(`Character '${ch}' (code ${code}) not supported in Code128B`)
    }
    values.push(code - 32)
  }

  // Checksum: (startValue + sum(position * value)) mod 103
  let checksum = values[0]
  for (let i = 1; i < values.length; i++) {
    checksum += i * values[i]
  }
  checksum %= 103
  values.push(checksum)

  // Expand all symbols to bits
  const bits: boolean[] = []
  for (const val of values) {
    bits.push(...expandPattern(PATTERNS[val]))
  }
  // Add STOP
  bits.push(...expandPattern(STOP_PATTERN))

  return bits
}
