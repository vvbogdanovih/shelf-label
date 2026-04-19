'use client'

import type { LabelConfig } from '@/lib/types'
import Barcode from './Barcode'
import { ArrowBigUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const pad = (n: number) => n.toString().padStart(2, '0')

function getFullCode(config: LabelConfig): string {
  return `${config.zone}-${pad(config.row)}-${pad(config.rack)}-${pad(config.level)}-${pad(config.position)}`
}

interface LabelTemplateProps {
  config: LabelConfig
}

export default function LabelTemplate({ config }: LabelTemplateProps) {
  const fullCode = getFullCode(config)

  return (
    <div
      style={{ width: 1772, height: 1181 }}
      className='bg-white font-[Arial,Helvetica,sans-serif]  flex flex-col'
    >
      {/* Top row: zone badge + full code */}
      <div className='flex items-center '>
        {/* Zone badge */}
        <div className='w-[200px] h-[200px] bg-black flex flex-col items-center justify-center shrink-0'>
          <span className='text-white font-bold text-[36px] leading-none'>ЗОНА</span>
          <span className='text-white font-bold text-[90px] leading-none mt-2'>
            {config.zone}
          </span>
        </div>
        {/* Full code */}
        <span className='text-black font-bold text-[120px] leading-none'>{fullCode}</span>
      </div>

      {/* Columns: РЯД | СТЕЛАЖ | РІВЕНЬ | МІСЦЕ */}
      <div className='flex mt-6 border-b-6  pb-6 pl-[390px]'>
        {[
          { label: 'РЯД', value: pad(config.row) },
          { label: 'СТЕЛАЖ', value: pad(config.rack) },
          { label: 'РІВЕНЬ', value: pad(config.level) },
          { label: 'МІСЦЕ', value: pad(config.position) }
        ].map((col, i) => (
          <div
            key={col.label}
            className={`flex-1 flex flex-col items-center gap-2  ${i > 0 ? 'border-l-6 ' : ''
              }`}
          >
            <span className=' text-[75px] leading-none'>{col.label}</span>
            <span className='text-black font-bold text-[123px] leading-none'>
              {col.value}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom row: arrow badge + barcode */}
      <div className='flex items-end  h-full mb-[300px]'>
        {/* Arrow badge */}
        <div className='w-[286px] h-[381px] bg-black flex items-center justify-center shrink-0'>

          <ArrowBigUp className={cn('w-full h-full text-white fill-current', config.arrowDirection === 'down' ? 'rotate-180' : '')} />
        </div>

        {/* Barcode + text */}
        <div className='flex-1 flex flex-col items-center h-[300px]'>
          <Barcode value={fullCode} className='w-full h-full' />
          <span className='text-black  text-[56px] leading-none mt-4'>{fullCode}</span>
        </div>
      </div>
    </div>
  )
}
