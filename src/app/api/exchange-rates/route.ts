import { NextResponse } from 'next/server'
import type { BankRate, ExchangeRatesResponse } from '@/features/currency-exchange/lib/types'

const CURRENCY_CODES: Record<number, 'USD' | 'EUR'> = {
	840: 'USD',
	978: 'EUR'
}
const UAH_CODE = 980

let cache: { data: ExchangeRatesResponse; timestamp: number } | null = null
const bankCache: Record<string, { rates: BankRate[]; timestamp: number }> = {}
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

async function fetchMinfin(): Promise<BankRate[]> {
	const res = await fetch('https://minfin.com.ua/currency/', {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
			Accept: 'text/html'
		}
	})
	if (!res.ok) throw new Error(`HTTP ${res.status}`)

	const html = await res.text()

	// Extract all JSON-LD blocks and find the one with exchange rates
	const jsonLdBlocks = [...html.matchAll(
		/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
	)]
	if (jsonLdBlocks.length === 0) throw new Error('No JSON-LD data found')

	type RateItem = {
		'@type': string
		currency: string
		name: string
		description: string
		currentExchangeRate: { price: string; priceCurrency: string }
	}
	let items: RateItem[] = []
	for (const match of jsonLdBlocks) {
		const jsonLd = JSON.parse(match[1])
		if (jsonLd?.mainEntity?.itemListElement) {
			items = jsonLd.mainEntity.itemListElement
			break
		}
	}

	const rates: BankRate[] = []
	for (const ccy of ['USD', 'EUR'] as const) {
		const buyItem = items.find(
			i =>
				i.currency === ccy &&
				i.name === 'Средний курс валюты в банках' &&
				i.description === 'Курс покупки'
		)
		const sellItem = items.find(
			i =>
				i.currency === ccy &&
				i.name === 'Средний курс валюты в банках' &&
				i.description === 'Курс продажи'
		)
		if (buyItem && sellItem) {
			rates.push({
				bank: 'Мінфін',
				bankId: 'minfin',
				currency: ccy,
				buy: parseFloat(buyItem.currentExchangeRate.price),
				sell: parseFloat(sellItem.currentExchangeRate.price),
				rate: null
			})
		}
	}

	if (rates.length === 0) throw new Error('No rates parsed from JSON-LD')
	return rates
}

export async function GET() {
	if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
		return NextResponse.json(cache.data)
	}

	const errors: string[] = []
	const banks = [
		{ name: 'НБУ', id: 'nbu', fetch: fetchNbu },
		{ name: 'Монобанк', id: 'mono', fetch: fetchMono },
		{ name: 'ПриватБанк', id: 'privat', fetch: fetchPrivat },
		{ name: 'Мінфін', id: 'minfin', fetch: fetchMinfin },
	]

	const results = await Promise.allSettled(
		banks.map(b => {
			const cached = bankCache[b.id]
			if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
				return Promise.resolve(cached.rates)
			}
			return b.fetch()
		})
	)

	const rates: BankRate[] = []
	results.forEach((result, i) => {
		const bank = banks[i]
		if (result.status === 'fulfilled') {
			bankCache[bank.id] = { rates: result.value, timestamp: Date.now() }
			rates.push(...result.value)
		} else {
			// Use stale cache if available
			if (bankCache[bank.id]) {
				rates.push(...bankCache[bank.id].rates)
			} else {
				errors.push(`${bank.name}: ${result.reason?.message ?? 'Невідома помилка'}`)
			}
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
