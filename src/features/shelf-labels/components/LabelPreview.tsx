'use client'

import { useEffect, useRef, useState } from 'react'
import type { LabelConfig } from '../lib/types'
import LabelTemplate from './LabelTemplate'

const LABEL_W = 1772
const LABEL_H = 1181

interface LabelPreviewProps {
	config: LabelConfig
}

export default function LabelPreview({ config }: LabelPreviewProps) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [scale, setScale] = useState(0.5)

	useEffect(() => {
		const el = wrapperRef.current
		if (!el) return

		const observer = new ResizeObserver(([entry]) => {
			const availableWidth = entry.contentRect.width
			setScale(availableWidth / LABEL_W)
		})

		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return (
		<div ref={wrapperRef} className='w-full'>
			<div
				className='overflow-hidden border border-gray-200 shadow-sm bg-white'
				style={{ width: LABEL_W * scale, height: LABEL_H * scale }}
			>
				<div
					style={{
						width: LABEL_W,
						height: LABEL_H,
						transform: `scale(${scale})`,
						transformOrigin: 'top left'
					}}
				>
					<LabelTemplate config={config} />
				</div>
			</div>
		</div>
	)
}
