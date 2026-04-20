'use client'

import type { RangeValue } from '../lib/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

interface RangeInputProps {
	label: string
	value: RangeValue
	onChange: (value: RangeValue) => void
}

export default function RangeInput({ label, value, onChange }: RangeInputProps) {
	return (
		<div className='flex flex-col gap-2'>
			<Label className='text-2xl'>{label}</Label>
			<div className='flex items-center gap-2'>
				<Input
					type='number'
					min={1}
					max={99}
					value={value.from}
					onChange={e =>
						onChange({
							...value,
							from: Math.max(1, Math.min(99, parseInt(e.target.value) || 1))
						})
					}
					className='w-24 h-10 text-2xl text-center'
				/>
				<span className='text-muted-foreground'>—</span>
				<Input
					type='number'
					min={1}
					max={99}
					value={value.to}
					onChange={e =>
						onChange({
							...value,
							to: Math.max(1, Math.min(99, parseInt(e.target.value) || 1))
						})
					}
					className='w-24 h-10 text-2xl text-center'
				/>
			</div>
			<Slider
				min={1}
				max={99}
				value={[value.from, value.to]}
				onValueChange={v => {
					const [from, to] = v as number[]
					onChange({ from, to })
				}}
			/>
		</div>
	)
}
