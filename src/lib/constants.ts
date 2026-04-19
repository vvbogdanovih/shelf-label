export const LABEL_WIDTH = 1772
export const LABEL_HEIGHT = 1181

export const ZONES = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
	'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
]

// Zone badge
export const BADGE_X = 60
export const BADGE_Y = 60
export const BADGE_WIDTH = 200
export const BADGE_HEIGHT = 200
export const BADGE_RADIUS = 20

// Full code text (e.g. "A-01-01-01-01")
export const CODE_X = 300
export const CODE_Y = 120
export const CODE_FONT_SIZE = 120

// Column headers & values
export const COLUMNS_Y_HEADER = 310
export const COLUMNS_Y_VALUE = 420
export const COLUMN_FONT_SIZE_HEADER = 48
export const COLUMN_FONT_SIZE_VALUE = 100

export const COLUMNS = [
	{ label: 'РЯД', x: 60, width: 400 },
	{ label: 'СТЕЛАЖ', x: 460, width: 440 },
	{ label: 'РІВЕНЬ', x: 900, width: 440 },
	{ label: 'МІСЦЕ', x: 1340, width: 400 }
] as const

// Divider lines between columns
export const DIVIDER_Y_START = 280
export const DIVIDER_Y_END = 500
export const DIVIDER_X_POSITIONS = [460, 900, 1340]

// Horizontal separator
export const SEPARATOR_Y = 540
export const SEPARATOR_X_START = 60
export const SEPARATOR_X_END = 1712

// Arrow badge (bottom-left)
export const ARROW_BADGE_X = 60
export const ARROW_BADGE_Y = 600
export const ARROW_BADGE_WIDTH = 200
export const ARROW_BADGE_HEIGHT = 200

// Barcode area
export const BARCODE_X = 340
export const BARCODE_Y = 600
export const BARCODE_WIDTH = 1350
export const BARCODE_HEIGHT = 360
export const BARCODE_TEXT_Y = 1000
export const BARCODE_TEXT_FONT_SIZE = 56

// Fonts
export const FONT_FAMILY = 'Arial, Helvetica, sans-serif'

// Cyrillic to Latin mapping for barcode (Code 128 only supports ASCII)
export const ZONE_TO_LATIN: Record<string, string> = {
	А: 'A',
	Б: 'B',
	В: 'V',
	Г: 'G',
	Д: 'D',
	Е: 'E',
	Є: 'YE',
	Ж: 'ZH',
	З: 'Z',
	И: 'Y',
	І: 'I',
	Ї: 'YI',
	Й: 'J',
	К: 'K',
	Л: 'L',
	М: 'M',
	Н: 'N',
	О: 'O',
	П: 'P',
	Р: 'R',
	С: 'S',
	Т: 'T',
	У: 'U',
	Ф: 'F',
	Х: 'KH',
	Ц: 'TS',
	Ч: 'CH',
	Ш: 'SH',
	Щ: 'SC',
	Ь: 'X',
	Ю: 'YU',
	Я: 'YA'
}

// Hebrew translations
export const HEBREW_LABELS = {
	zone: 'אֵזוֹר',
	row: 'שׁוּרָה',
	rack: 'מַדָּף',
	level: 'רָמָה',
	position: 'מָקוֹם',
} as const

// Roman numeral conversion
export function toRoman(num: number): string {
	const pairs: [number, string][] = [
		[90, 'XC'], [50, 'L'], [40, 'XL'],
		[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
	]
	let result = ''
	let remaining = num
	for (const [value, symbol] of pairs) {
		while (remaining >= value) {
			result += symbol
			remaining -= value
		}
	}
	return result
}
