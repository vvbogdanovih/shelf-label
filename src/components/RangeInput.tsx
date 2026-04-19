'use client'

import type { RangeValue } from '@/lib/types'

interface RangeInputProps {
	label: string
	value: RangeValue
	onChange: (value: RangeValue) => void
}

export default function RangeInput({ label, value, onChange }: RangeInputProps) {
	return (
		<div className='flex flex-col gap-1.5'>
			<label className='text-sm font-medium text-gray-700'>{label}</label>
			<div className='flex items-center gap-2'>
				<input
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
					className='w-20 rounded-md border border-gray-300 px-3 py-2 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
				/>
				<span className='text-gray-400'>—</span>
				<input
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
					className='w-20 rounded-md border border-gray-300 px-3 py-2 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
				/>
			</div>
		</div>
	)
}
