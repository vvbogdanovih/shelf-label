'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { LabelConfig } from '../lib/types'
import type { WorkerInMessage, WorkerOutMessage } from '../lib/worker-protocol'

interface UseLabelWorkerReturn {
  generate: (configs: LabelConfig[], fileName: string) => void
  isGenerating: boolean
  progress: number
  error: string | null
}

export function useLabelWorker(): UseLabelWorkerReturn {
  const workerRef = useRef<Worker | null>(null)
  const fileNameRef = useRef<string>('labels.zip')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const handleMessage = useCallback((e: MessageEvent<WorkerOutMessage>) => {
    const msg = e.data
    switch (msg.type) {
      case 'progress':
        setProgress(Math.round((msg.current / msg.total) * 100))
        break
      case 'done': {
        const url = URL.createObjectURL(msg.zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileNameRef.current
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setIsGenerating(false)
        setProgress(0)
        break
      }
      case 'error':
        setError(msg.message)
        setIsGenerating(false)
        setProgress(0)
        alert(`Помилка генерації: ${msg.message}`)
        break
    }
  }, [])

  const generate = useCallback(
    (configs: LabelConfig[], fileName: string) => {
      // Terminate previous worker if any
      workerRef.current?.terminate()

      setIsGenerating(true)
      setProgress(0)
      setError(null)
      fileNameRef.current = fileName

      const worker = new Worker(
        new URL('../workers/label-generator.worker.ts', import.meta.url),
      )
      worker.addEventListener('message', handleMessage)
      worker.addEventListener('error', (e) => {
        setError(e.message)
        setIsGenerating(false)
        setProgress(0)
        alert(`Worker error: ${e.message}`)
      })
      workerRef.current = worker

      const message: WorkerInMessage = { type: 'generate', configs }
      worker.postMessage(message)
    },
    [handleMessage],
  )

  return { generate, isGenerating, progress, error }
}
