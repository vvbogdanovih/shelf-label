'use client'

import { useState } from 'react'
import { useExchangeRates } from '../hooks/use-exchange-rates'
import type { Currency, Direction } from '../lib/constants'
import AmountInput from './AmountInput'
import RatesTable from './RatesTable'

export default function CurrencyExchangeApp() {
	const [amount, setAmount] = useState(100)
	const [currency, setCurrency] = useState<Currency>('USD')
	const [direction, setDirection] = useState<Direction>('from-foreign')
	const { data, isLoading, error, refetch } = useExchangeRates()

	return (
		<div className='flex flex-1 flex-col lg:flex-row'>
			<aside className='w-full border-b border-border bg-card p-6 lg:w-80 lg:border-b-0 lg:border-r lg:shrink-0'>
				<AmountInput
					amount={amount}
					onAmountChange={setAmount}
					currency={currency}
					onCurrencyChange={setCurrency}
					direction={direction}
					onDirectionChange={setDirection}
					onRefresh={refetch}
					updatedAt={data?.updatedAt ?? null}
					isLoading={isLoading}
				/>
			</aside>
			<main className='flex flex-1 flex-col items-center overflow-auto bg-muted/50 p-6'>
				<div className='w-full max-w-4xl'>
					<h2 className='mb-4 text-lg font-semibold text-foreground'>Курси валют</h2>
					{error && <p className='mb-4 text-destructive'>{error}</p>}
					<RatesTable
						rates={data?.rates ?? []}
						amount={amount}
						currency={currency}
						direction={direction}
						isLoading={isLoading}
					/>
					{data?.errors && data.errors.length > 0 && (
						<div className='mt-4 text-sm text-muted-foreground'>
							<p>Деякі банки недоступні:</p>
							<ul className='list-disc pl-4'>
								{data.errors.map((err, i) => (
									<li key={i}>{err}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}
