'use client'

import type { ArrowDirection } from '@/lib/types'

interface ArrowSelectorProps {
	value: ArrowDirection
	onChange: (value: ArrowDirection) => void
}

export default function ArrowSelector({ value, onChange }: ArrowSelectorProps) {
	return (
		<div className='flex flex-col gap-1.5'>
			<label className='text-sm font-medium text-gray-700'>Напрямок стрілки</label>
			<div className='flex gap-2'>
				<button
					type='button'
					onClick={() => onChange('up')}
					className={`flex h-10 w-14 items-center justify-center rounded-md border-2 text-xl transition-colors ${
						value === 'up'
							? 'border-blue-500 bg-blue-50 text-blue-700'
							: 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
					}`}
				>
					<svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor'>
						<path d='M10 4 L3 14 L17 14 Z' />
					</svg>
				</button>
				<button
					type='button'
					onClick={() => onChange('down')}
					className={`flex h-10 w-14 items-center justify-center rounded-md border-2 text-xl transition-colors ${
						value === 'down'
							? 'border-blue-500 bg-blue-50 text-blue-700'
							: 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
					}`}
				>
					<svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor'>
						<path d='M10 16 L3 6 L17 6 Z' />
					</svg>
				</button>
			</div>
		</div>
	)
}
