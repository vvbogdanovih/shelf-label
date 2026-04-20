'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRightLeft, RefreshCw } from 'lucide-react'
import { CURRENCIES, type Currency, type Direction } from '../lib/constants'

interface AmountInputProps {
	amount: number
	onAmountChange: (amount: number) => void
	currency: Currency
	onCurrencyChange: (currency: Currency) => void
	direction: Direction
	onDirectionChange: (direction: Direction) => void
	onRefresh: () => void
	updatedAt: string | null
	isLoading: boolean
}

export default function AmountInput({
	amount,
	onAmountChange,
	currency,
	onCurrencyChange,
	direction,
	onDirectionChange,
	onRefresh,
	updatedAt,
	isLoading
}: AmountInputProps) {
	const fromLabel = direction === 'from-foreign' ? currency : 'UAH'
	const toLabel = direction === 'from-foreign' ? 'UAH' : currency

	return (
		<div className='flex flex-col gap-4'>
			<div>
				<label className='mb-1.5 block text-xl font-medium text-foreground'>Сума</label>
				<Input
					className='text-xl!'
					type='number'
					value={amount}
					onChange={e => onAmountChange(Number(e.target.value) || 0)}
					min={0}
					placeholder='Введіть суму'
				/>
			</div>
			<div>
				<label className='mb-1.5 block text-xl font-medium text-foreground'>Валюта</label>
				<div className='flex gap-1'>
					{CURRENCIES.map(c => (
						<Button
							key={c}
							variant={currency === c ? 'default' : 'outline'}
							size='sm'
							onClick={() => onCurrencyChange(c)}
						>
							{c}
						</Button>
					))}
				</div>
			</div>
			<div>
				<label className='mb-1.5 block text-xl font-medium text-foreground'>
					Напрямок
				</label>
				<Button
					variant='outline'
					className='w-full justify-center gap-2'
					onClick={() =>
						onDirectionChange(
							direction === 'from-foreign' ? 'to-foreign' : 'from-foreign'
						)
					}
				>
					{fromLabel} <ArrowRightLeft className='size-4' /> {toLabel}
				</Button>
			</div>
			<Button onClick={onRefresh} disabled={isLoading} variant='outline'>
				<RefreshCw className={isLoading ? 'animate-spin' : ''} />
				Оновити
			</Button>
			{updatedAt && (
				<p className='text-xl text-muted-foreground'>
					Оновлено: {new Date(updatedAt).toLocaleTimeString('uk-UA')}
				</p>
			)}
		</div>
	)
}
