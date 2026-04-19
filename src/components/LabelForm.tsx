'use client'

import type { LabelFormState, ArrowDirection, RangeValue } from '@/lib/types'
import RangeInput from './RangeInput'
import ZoneSelector from './ZoneSelector'
import ArrowSelector from './ArrowSelector'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface LabelFormProps {
	formState: LabelFormState
	onChange: (state: LabelFormState) => void
	onGenerate: () => void
	isGenerating: boolean
	progress: number
}

function countLabels(state: LabelFormState): number {
	const rows = state.row.to - state.row.from + 1
	const racks = state.rack.to - state.rack.from + 1
	const levels = state.level.to - state.level.from + 1
	const positions = state.position.to - state.position.from + 1
	return Math.max(0, rows) * Math.max(0, racks) * Math.max(0, levels) * Math.max(0, positions)
}

export default function LabelForm({
	formState,
	onChange,
	onGenerate,
	isGenerating,
	progress
}: LabelFormProps) {
	const total = countLabels(formState)

	const updateField = <K extends keyof LabelFormState>(key: K, value: LabelFormState[K]) => {
		onChange({ ...formState, [key]: value })
	}

	return (
		<div className='flex flex-col gap-5'>
			<h2 className='text-2xl font-semibold'>Параметри етикеток</h2>

			<ZoneSelector value={formState.zone} onChange={v => updateField('zone', v)} />

			<RangeInput
				label='Ряд'
				value={formState.row}
				onChange={(v: RangeValue) => updateField('row', v)}
			/>
			<RangeInput
				label='Стелаж'
				value={formState.rack}
				onChange={(v: RangeValue) => updateField('rack', v)}
			/>
			<RangeInput
				label='Рівень'
				value={formState.level}
				onChange={(v: RangeValue) => updateField('level', v)}
			/>
			<RangeInput
				label='Місце'
				value={formState.position}
				onChange={(v: RangeValue) => updateField('position', v)}
			/>

			<ArrowSelector
				value={formState.arrowDirection}
				onChange={(v: ArrowDirection) => updateField('arrowDirection', v)}
			/>

			<div className='rounded-md bg-muted px-4 py-3'>
				<p className='text-xl text-muted-foreground'>
					Кількість етикеток: <span className='font-semibold text-foreground'>{total}</span>
				</p>
				{total > 1000 && (
					<p className='mt-1 text-xs text-amber-600'>
						Велика кількість етикеток. Генерація може зайняти деякий час.
					</p>
				)}
			</div>

			{isGenerating && <Progress value={progress} />}

			<Button  className='hover:shadow-lg transition-shadow text-2xl p-8' onClick={onGenerate} disabled={isGenerating || total === 0}>
				{isGenerating ? 'Генерація...' : 'Завантажити ZIP'}
			</Button>
		</div>
	)
}
