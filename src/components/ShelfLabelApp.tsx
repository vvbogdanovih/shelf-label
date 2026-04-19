'use client'

import { useState } from 'react'
import type { LabelConfig, LabelFormState } from '@/lib/types'
import { useLabelWorker } from '@/hooks/use-label-worker'
import LabelForm from './LabelForm'
import LabelPreview from './LabelPreview'

const initialState: LabelFormState = {
	zone: 'A',
	row: { from: 1, to: 1 },
	rack: { from: 1, to: 1 },
	level: { from: 1, to: 1 },
	position: { from: 1, to: 1 },
	arrowDirection: 'down',
	hebrewMode: false
}

function generateConfigs(state: LabelFormState): LabelConfig[] {
	const configs: LabelConfig[] = []
	for (let row = state.row.from; row <= state.row.to; row++) {
		for (let rack = state.rack.from; rack <= state.rack.to; rack++) {
			for (let level = state.level.from; level <= state.level.to; level++) {
				for (let pos = state.position.from; pos <= state.position.to; pos++) {
					configs.push({
						zone: state.zone,
						row,
						rack,
						level,
						position: pos,
						arrowDirection: state.arrowDirection,
						hebrewMode: state.hebrewMode
					})
				}
			}
		}
	}
	return configs
}

export default function ShelfLabelApp() {
	const [formState, setFormState] = useState<LabelFormState>(initialState)
	const { generate, isGenerating, progress } = useLabelWorker()

	const previewConfig: LabelConfig = {
		zone: formState.zone,
		row: formState.row.from,
		rack: formState.rack.from,
		level: formState.level.from,
		position: formState.position.from,
		arrowDirection: formState.arrowDirection,
		hebrewMode: formState.hebrewMode
	}

	const handleGenerate = () => {
		const configs = generateConfigs(formState)
		generate(configs, `labels-${formState.zone}.zip`)
	}

	return (
		<div className='flex min-h-screen flex-col lg:flex-row'>
			<aside className='w-full border-b border-gray-200 bg-white p-6 lg:w-80 lg:border-b-0 lg:border-r lg:shrink-0'>
				<LabelForm
					formState={formState}
					onChange={setFormState}
					onGenerate={handleGenerate}
					isGenerating={isGenerating}
					progress={progress}
				/>
			</aside>

			<main className='flex flex-1 flex-col items-center bg-gray-50 p-6 overflow-auto'>
				<div className='w-full max-w-4xl'>
					<h2 className='mb-4 text-lg font-semibold text-gray-900'>
						Прев&apos;ю етикетки
					</h2>
					<LabelPreview config={previewConfig} />
				</div>
			</main>
		</div>
	)
}
