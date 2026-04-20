export const BANKS = {
	nbu: 'НБУ',
	mono: 'Монобанк',
	privat: 'ПриватБанк',
	pumb: 'ПУМБ'
} as const

export const CURRENCIES = ['USD', 'EUR'] as const
export type Currency = (typeof CURRENCIES)[number]

export type Direction = 'from-foreign' | 'to-foreign'
