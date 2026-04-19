'use client'

import type { ArrowDirection } from '@/lib/types'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface ArrowSelectorProps {
	value: ArrowDirection
	onChange: (value: ArrowDirection) => void
}

export default function ArrowSelector({ value, onChange }: ArrowSelectorProps) {
	return (
		<div className='flex flex-col gap-1.5'>
			<Label className='text-2xl'>Напрямок стрілки</Label>
			<div className='flex gap-2'>
				<Button
					variant={value === 'up' ? 'default' : 'outline'}
					className='text-2xl p-6'
					size='icon-lg'
					onClick={() => onChange('up')}
				>
					<ArrowUp />
				</Button>
				<Button
					variant={value === 'down' ? 'default' : 'outline'}
					className='text-2xl p-6'
					size='icon-lg'
					onClick={() => onChange('down')}
				>
					<ArrowDown />
				</Button>
			</div>
		</div>
	)
}
