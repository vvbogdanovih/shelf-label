'use client'

import { useEffect, useRef } from 'react'

export default function WhatPage() {
	const iframeRef = useRef<HTMLIFrameElement>(null)

	useEffect(() => {
		// Force autoplay by loading the iframe after mount
		if (iframeRef.current) {
			iframeRef.current.src =
				'https://www.youtube.com/embed/NxzNuS40zdk?autoplay=1&loop=1&playlist=NxzNuS40zdk'
		}
	}, [])

	return (
		<div className='flex flex-1 items-center justify-center'>
			<span className='animate-spin-slow text-[8rem] leading-none select-none'>
				🐸
			</span>
			<iframe
				ref={iframeRef}
				width='0'
				height='0'
				allow='autoplay'
				style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
			/>
		</div>
	)
}
