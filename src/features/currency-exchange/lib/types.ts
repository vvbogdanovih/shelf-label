export interface BankRate {
	bank: string
	bankId: string
	currency: 'USD' | 'EUR'
	buy: number | null
	sell: number | null
	rate: number | null
}

export interface ExchangeRatesResponse {
	rates: BankRate[]
	updatedAt: string
	errors: string[]
}
