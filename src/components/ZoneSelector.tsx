'use client'

import { ZONES } from '@/lib/constants'

interface ZoneSelectorProps {
	value: string
	onChange: (value: string) => void
}

export default function ZoneSelector({ value, onChange }: ZoneSelectorProps) {
	return (
		<div className='flex flex-col gap-1.5'>
			<label className='text-sm font-medium text-gray-700'>Зона</label>
			<select
				value={value}
				onChange={e => onChange(e.target.value)}
				className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
			>
				{ZONES.map(zone => (
					<option key={zone} value={zone}>
						{zone}
					</option>
				))}
			</select>
		</div>
	)
}
