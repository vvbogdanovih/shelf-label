'use client'

import { ZONES } from '@/lib/constants'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'

interface ZoneSelectorProps {
	value: string
	onChange: (value: string) => void
}

export default function ZoneSelector({ value, onChange }: ZoneSelectorProps) {
	return (
		<div className='flex flex-col gap-1.5'>
			<Label className='text-2xl'>Зона</Label>
			<Select value={value} onValueChange={v => v && onChange(v)}>
				<SelectTrigger className='w-full text-2xl p-4 min-h-10'>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{ZONES.map(zone => (
						<SelectItem key={zone} value={zone}>
							{zone}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
