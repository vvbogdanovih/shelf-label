'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import type { LabelConfig, LabelFormState } from '@/lib/types'
import LabelForm from './LabelForm'
import LabelPreview from './LabelPreview'
import LabelTemplate from './LabelTemplate'

const pad = (n: number) => n.toString().padStart(2, '0')

const initialState: LabelFormState = {
	zone: 'A',
	row: { from: 1, to: 1 },
	rack: { from: 1, to: 1 },
	level: { from: 1, to: 1 },
	position: { from: 1, to: 1 },
	arrowDirection: 'down'
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
						arrowDirection: state.arrowDirection
					})
				}
			}
		}
	}
	return configs
}

export default function ShelfLabelApp() {
	const [formState, setFormState] = useState<LabelFormState>(initialState)
	const [isGenerating, setIsGenerating] = useState(false)
	const [progress, setProgress] = useState(0)
	const [renderConfig, setRenderConfig] = useState<LabelConfig | null>(null)
	const hiddenRef = useRef<HTMLDivElement>(null)

	const previewConfig: LabelConfig = {
		zone: formState.zone,
		row: formState.row.from,
		rack: formState.rack.from,
		level: formState.level.from,
		position: formState.position.from,
		arrowDirection: formState.arrowDirection
	}

	const captureLabel = useCallback(async (): Promise<string> => {
		if (!hiddenRef.current) throw new Error('Hidden render container not found')
		// Wait for DOM to update (barcode SVG etc.)
		await new Promise(r => setTimeout(r, 100))
		return toPng(hiddenRef.current, { width: 1772, height: 1181, pixelRatio: 1 })
	}, [])

	const handleGenerate = async () => {
		setIsGenerating(true)
		setProgress(0)

		try {
			const configs = generateConfigs(formState)
			const zip = new JSZip()

			for (let i = 0; i < configs.length; i++) {
				const config = configs[i]
				setRenderConfig(config)
				// Wait for React to render the new config
				await new Promise(r => setTimeout(r, 150))

				const dataUrl = await captureLabel()
				const base64 = dataUrl.split(',')[1]
				const fileName = `${config.zone}-${pad(config.row)}-${pad(config.rack)}-${pad(config.level)}-${pad(config.position)}.png`
				zip.file(fileName, base64, { base64: true })

				setProgress(Math.round(((i + 1) / configs.length) * 100))
			}

			const blob = await zip.generateAsync({ type: 'blob' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `labels-${formState.zone}.zip`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
		} catch (err) {
			console.error(err)
			alert('Помилка генерації')
		} finally {
			setIsGenerating(false)
			setProgress(0)
			setRenderConfig(null)
		}
	}

	return (
		<div className='flex min-h-screen flex-col lg:flex-row'>
			{/* Sidebar form */}
			<aside className='w-full border-b border-gray-200 bg-white p-6 lg:w-80 lg:border-b-0 lg:border-r lg:shrink-0'>
				<LabelForm
					formState={formState}
					onChange={setFormState}
					onGenerate={handleGenerate}
					isGenerating={isGenerating}
					progress={progress}
				/>
			</aside>

			{/* Preview area */}
			<main className='flex flex-1 flex-col items-center bg-gray-50 p-6 overflow-auto'>
				<div className='w-full max-w-4xl'>
					<h2 className='mb-4 text-lg font-semibold text-gray-900'>
						Прев&apos;ю етикетки
					</h2>
					<LabelPreview config={previewConfig} />
				</div>
			</main>

			{/* Hidden container for capturing PNGs during generation */}
			<div
				className='fixed pointer-events-none'
				style={{ left: '-9999px', top: 0 }}
				aria-hidden='true'
			>
				{renderConfig && (
					<div ref={hiddenRef}>
						<LabelTemplate config={renderConfig} />
					</div>
				)}
			</div>
		</div>
	)
}
