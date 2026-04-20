import { useState, useEffect, useCallback } from 'react'
import type { ExchangeRatesResponse } from '../lib/types'

export function useExchangeRates() {
	const [data, setData] = useState<ExchangeRatesResponse | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchRates = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			const res = await fetch('/api/exchange-rates')
			if (!res.ok) throw new Error('Не вдалося завантажити курси')
			const json: ExchangeRatesResponse = await res.json()
			setData(json)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Невідома помилка')
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchRates()
	}, [fetchRates])

	return { data, isLoading, error, refetch: fetchRates }
}
