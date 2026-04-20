'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShelfLabelApp } from '@/features/shelf-labels'
import { WhatPage } from '@/features/what'

export default function Home() {
	return (
		<Tabs defaultValue={0} className='flex min-h-screen flex-col gap-0'>
			<TabsList
				variant='line'
				className='w-full h-10 justify-start border-b px-4 py-1'
			>
				<TabsTrigger value={0} className='flex-none px-3  text-lg'>
					Етикетки
				</TabsTrigger>
				<TabsTrigger value={1} className='flex-none px-3 text-lg'>
					В жодному випадку не натискати
				</TabsTrigger>
			</TabsList>
			<TabsContent value={0} className='flex flex-col'>
				<ShelfLabelApp />
			</TabsContent>
			<TabsContent value={1} className='flex flex-col'>
				<WhatPage />
			</TabsContent>
		</Tabs>
	)
}
