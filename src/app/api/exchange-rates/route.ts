import { NextResponse } from 'next/server'
import type { BankRate, ExchangeRatesResponse } from '@/features/currency-exchange/lib/types'

const CURRENCY_CODES: Record<number, 'USD' | 'EUR'> = {
	840: 'USD',
	978: 'EUR'
}
const UAH_CODE = 980

let cache: { data: ExchangeRatesResponse; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

async function fetchNbu(): Promise<BankRate[]> {
	const res = await fetch(
		'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'
	)
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	const data: Array<{ r030: number; txt: string; rate: number; cc: string }> = await res.json()
	return data
		.filter(r => r.cc === 'USD' || r.cc === 'EUR')
		.map(r => ({
			bank: 'НБУ',
			bankId: 'nbu',
			currency: r.cc as 'USD' | 'EUR',
			buy: null,
			sell: null,
			rate: r.rate
		}))
}

async function fetchMono(): Promise<BankRate[]> {
	const res = await fetch('https://api.monobank.ua/bank/currency')
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	const data: Array<{
		currencyCodeA: number
		currencyCodeB: number
		rateBuy: number
		rateSell: number
		rateCross: number
	}> = await res.json()
	return data
		.filter(r => r.currencyCodeB === UAH_CODE && CURRENCY_CODES[r.currencyCodeA])
		.map(r => ({
			bank: 'Монобанк',
			bankId: 'mono',
			currency: CURRENCY_CODES[r.currencyCodeA],
			buy: r.rateBuy || null,
			sell: r.rateSell || null,
			rate: null
		}))
}

async function fetchPrivat(): Promise<BankRate[]> {
	const res = await fetch(
		'https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5'
	)
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	const data: Array<{ ccy: string; base_ccy: string; buy: string; sale: string }> =
		await res.json()
	return data
		.filter(r => (r.ccy === 'USD' || r.ccy === 'EUR') && r.base_ccy === 'UAH')
		.map(r => ({
			bank: 'ПриватБанк',
			bankId: 'privat',
			currency: r.ccy as 'USD' | 'EUR',
			buy: parseFloat(r.buy),
			sell: parseFloat(r.sale),
			rate: null
		}))
}

async function fetchPumb(): Promise<BankRate[]> {
	// Fetch the rates block which contains inline rate data in data-currency-* attributes
	const res = await fetch('https://about.pumb.ua/en/block/item/2753', {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
		}
	})
	if (!res.ok) throw new Error(`HTTP ${res.status}`)

	const html = await res.text()
	const rates: BankRate[] = []

	for (const ccy of ['USD', 'EUR'] as const) {
		const buyMatch = html.match(
			new RegExp(`data-currency-${ccy}Buy[^>]*>([\\d.]+)<`)
		)
		const sellMatch = html.match(
			new RegExp(`data-currency-${ccy}Sell[^>]*>([\\d.]+)<`)
		)
		if (buyMatch && sellMatch) {
			rates.push({
				bank: 'ПУМБ',
				bankId: 'pumb',
				currency: ccy,
				buy: parseFloat(buyMatch[1]),
				sell: parseFloat(sellMatch[1]),
				rate: null
			})
		}
	}

	if (rates.length === 0) throw new Error('No rates parsed from HTML')
	return rates
}

export async function GET() {
	if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
		return NextResponse.json(cache.data)
	}

	const errors: string[] = []
	const bankNames = ['НБУ', 'Монобанк', 'ПриватБанк', 'ПУМБ']
	const results = await Promise.allSettled([
		fetchNbu(),
		fetchMono(),
		fetchPrivat(),
		fetchPumb()
	])

	const rates: BankRate[] = []
	results.forEach((result, i) => {
		if (result.status === 'fulfilled') {
			rates.push(...result.value)
		} else {
			errors.push(`${bankNames[i]}: ${result.reason?.message ?? 'Невідома помилка'}`)
		}
	})

	const data: ExchangeRatesResponse = {
		rates,
		updatedAt: new Date().toISOString(),
		errors
	}

	cache = { data, timestamp: Date.now() }
	return NextResponse.json(data)
}
