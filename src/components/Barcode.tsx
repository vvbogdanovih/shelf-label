'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { ZONE_TO_LATIN } from '@/lib/constants'

interface BarcodeProps {
	value: string
	className?: string
}

function toLatin(text: string): string {
	return text
		.split('')
		.map(ch => ZONE_TO_LATIN[ch] || ch)
		.join('')
}

export default function Barcode({ value, className }: BarcodeProps) {
	const svgRef = useRef<SVGSVGElement>(null)

	useEffect(() => {
		if (svgRef.current) {
			JsBarcode(svgRef.current, toLatin(value), {
				format: 'CODE128',
				displayValue: false,
				margin: 0,
				background: 'transparent',
				lineColor: '#000000'
			})
		}
	}, [value])

	return <svg ref={svgRef} className={className} />
}
