import type { BankRate } from '../lib/types'
import type { Currency, Direction } from '../lib/constants'

interface RatesTableProps {
	rates: BankRate[]
	amount: number
	currency: Currency
	direction: Direction
	isLoading: boolean
}

function formatNumber(value: number): string {
	return value.toLocaleString('uk-UA', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})
}

function formatRate(value: number): string {
	return value.toFixed(4)
}

export default function RatesTable({
	rates,
	amount,
	currency,
	direction,
	isLoading
}: RatesTableProps) {
	const filtered = rates.filter(r => r.currency === currency)

	if (isLoading) {
		return (
			<div className='grid gap-4 sm:grid-cols-2'>
				{Array.from({ length: 4 }, (_, i) => (
					<div key={i} className='h-48 animate-pulse rounded-xl bg-muted' />
				))}
			</div>
		)
	}

	if (filtered.length === 0) {
		return <p className='text-muted-foreground'>Немає даних</p>
	}

	return (
		<div className='grid gap-4 sm:grid-cols-2'>
			{filtered.map(rate => (
				<BankCard
					key={rate.bankId}
					rate={rate}
					amount={amount}
					currency={currency}
					direction={direction}
				/>
			))}
		</div>
	)
}

function BankCard({
	rate,
	amount,
	currency,
	direction
}: {
	rate: BankRate
	amount: number
	currency: Currency
	direction: Direction
}) {
	const isNbu = rate.rate !== null
	const fromForeign = direction === 'from-foreign'

	return (
		<div className='rounded-xl border border-border bg-card p-4'>
			<h3 className='mb-3 text-base font-semibold text-foreground'>{rate.bank}</h3>
			{isNbu ? (
				<>
					<div className='mb-1 flex justify-between text-sm text-muted-foreground'>
						<span>Офіційний курс</span>
						<span className='font-mono'>{formatRate(rate.rate!)}</span>
					</div>
					<div className='mt-3 rounded-lg bg-muted/50 p-3'>
						{fromForeign ? (
							<>
								<p className='text-sm text-muted-foreground'>
									{amount} {currency} =
								</p>
								<p className='text-xl font-semibold text-foreground'>
									{formatNumber(amount * rate.rate!)} ₴
								</p>
							</>
						) : (
							<>
								<p className='text-sm text-muted-foreground'>
									{amount} ₴ =
								</p>
								<p className='text-xl font-semibold text-foreground'>
									{formatNumber(amount / rate.rate!)} {currency}
								</p>
							</>
						)}
					</div>
				</>
			) : (
				<>
					<div className='mb-3 grid grid-cols-2 gap-2 text-sm'>
						<div>
							<span className='text-muted-foreground'>Купівля</span>
							<p className='font-mono font-medium'>
								{rate.buy ? formatRate(rate.buy) : '—'}
							</p>
						</div>
						<div>
							<span className='text-muted-foreground'>Продаж</span>
							<p className='font-mono font-medium'>
								{rate.sell ? formatRate(rate.sell) : '—'}
							</p>
						</div>
					</div>
					{fromForeign ? (
						<div className='space-y-2'>
							{rate.buy && (
								<div className='rounded-lg bg-muted/50 p-3'>
									<p className='text-xs text-muted-foreground'>
										Продам {amount} {currency}
									</p>
									<p className='text-lg font-semibold text-foreground'>
										{formatNumber(amount * rate.buy)} ₴
									</p>
								</div>
							)}
							{rate.sell && (
								<div className='rounded-lg bg-muted/50 p-3'>
									<p className='text-xs text-muted-foreground'>
										Куплю {amount} {currency}
									</p>
									<p className='text-lg font-semibold text-foreground'>
										{formatNumber(amount * rate.sell)} ₴
									</p>
								</div>
							)}
						</div>
					) : (
						<div className='space-y-2'>
							{rate.buy && (
								<div className='rounded-lg bg-muted/50 p-3'>
									<p className='text-xs text-muted-foreground'>
										Продам {amount} ₴
									</p>
									<p className='text-lg font-semibold text-foreground'>
										{formatNumber(amount / rate.buy)} {currency}
									</p>
								</div>
							)}
							{rate.sell && (
								<div className='rounded-lg bg-muted/50 p-3'>
									<p className='text-xs text-muted-foreground'>
										Куплю на {amount} ₴
									</p>
									<p className='text-lg font-semibold text-foreground'>
										{formatNumber(amount / rate.sell)} {currency}
									</p>
								</div>
							)}
						</div>
					)}
				</>
			)}
		</div>
	)
}
