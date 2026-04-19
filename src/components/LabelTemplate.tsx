'use client'

import type { LabelConfig } from '@/lib/types'
import Barcode from './Barcode'
import { cn } from '@/lib/utils'
import { ArrowUp } from './icons'
import { HEBREW_LABELS, toRoman } from '@/lib/constants'

const pad = (n: number) => n.toString().padStart(2, '0')

function getPartialCode(config: LabelConfig): string {
  const fmt = config.hebrewMode ? toRoman : pad
  return `${fmt(config.row)}-${fmt(config.rack)}-${fmt(config.level)}-${fmt(config.position)}`
}

function getFullCode(config: LabelConfig): string {
  const fmt = config.hebrewMode ? toRoman : pad
  return `${config.zone}-${fmt(config.row)}-${fmt(config.rack)}-${fmt(config.level)}-${fmt(config.position)}`
}

// Barcode always uses padded Arabic numerals (Code 128 compatibility)
function getBarcodeCode(config: LabelConfig): string {
  return `${config.zone}-${pad(config.row)}-${pad(config.rack)}-${pad(config.level)}-${pad(config.position)}`
}

interface LabelTemplateProps {
  config: LabelConfig
}

export default function LabelTemplate({ config }: LabelTemplateProps) {
  const fullCode = getFullCode(config)
  const partialCode = getPartialCode(config)
  const barcodeCode = getBarcodeCode(config)
  const hebrew = config.hebrewMode

  const labels = hebrew
    ? { zone: HEBREW_LABELS.zone, row: HEBREW_LABELS.row, rack: HEBREW_LABELS.rack, level: HEBREW_LABELS.level, position: HEBREW_LABELS.position }
    : { zone: 'ЗОНА', row: 'РЯД', rack: 'СТЕЛАЖ', level: 'РІВЕНЬ', position: 'МІСЦЕ' }

  const fmt = hebrew ? toRoman : pad

  return (
    <div
      style={{ width: 1772, height: 1181 }}
      className={cn('bg-white font-[Arial,Helvetica,sans-serif] flex flex-col', hebrew && 'direction-rtl')}
      dir={hebrew ? 'rtl' : 'ltr'}
    >
      {/* Top row: zone badge + full code */}
      <div className='flex items-center'>
        {/* Zone badge */}
        <div className='w-[160px] h-[230px] bg-black flex flex-col items-center justify-center shrink-0'>
          <span className='text-white font-bold text-[36px] leading-none font-["Greenwich",Arial,Helvetica,sans-serif]'>
            {labels.zone}
          </span>
          <span className='text-white font-bold text-[126px] leading-none mt-2'>
            {config.zone}
          </span>
        </div>
        {/* Full code */}
        <div className='flex items-center w-full justify-center' dir='ltr'>
          <span className='text-black text-[157px] leading-none font-["Arial Narrow",Arial,Helvetica,sans-serif]'>
            {config.zone}-
          </span>
          <span className='text-black font-bold text-[230px] leading-none'>
            {partialCode}
          </span>
        </div>
      </div>

      {/* Bottom row: arrow badge + barcode */}
      <div className='flex items-end h-full mb-[300px]'>
        {/* Arrow badge */}
        <div className='min-w-[286px] min-h-[381px] bg-black flex items-center justify-center'>
          <ArrowUp
            className={cn(
              'text-white fill-current w-[205px] h-[306px]',
              config.arrowDirection === 'down' ? 'rotate-180' : ''
            )}
          />
        </div>

        <div className='flex flex-col justify-center w-full'>
          {/* Columns */}
          <div className='flex pb-6 mb-6' dir='ltr'>
            {[
              { label: labels.row, value: fmt(config.row) },
              { label: labels.rack, value: fmt(config.rack) },
              { label: labels.level, value: fmt(config.level) },
              { label: labels.position, value: fmt(config.position) }
            ].map((col, i, arr) => {
              const isFirst = i === 0
              const isLast = i === arr.length - 1
              return (
                <div
                  key={col.label}
                  className={cn(
                    'flex flex-col items-center gap-2',
                    i > 0 && 'border-l-6 border-black',
                    isFirst && !isLast && 'pr-14',
                    !isFirst && !isLast && 'px-14',
                    isLast && !isFirst && 'pl-14'
                  )}
                >
                  <span className='text-[75px] leading-none'>{col.label}</span>
                  <span className='text-black font-extrabold text-[126px] leading-none'>
                    {col.value}
                  </span>
                </div>
              )
            })}
          </div>

          {/* separator */}
          <div className='max-w-[1300px] w-full bg-black min-h-1.5 h-1.5 mx-auto mb-6'></div>

          {/* Barcode + text */}
          <div className='flex-1 flex flex-col items-center max-h-[300px] mb-9'>
            <Barcode value={barcodeCode} className='w-full h-full' />
            <span className='text-black text-[56px] leading-none mt-4' dir='ltr'>
              {fullCode}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
