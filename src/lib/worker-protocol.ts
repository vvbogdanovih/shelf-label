import type { LabelConfig } from './types'

export type WorkerInMessage = {
  type: 'generate'
  configs: LabelConfig[]
}

export type WorkerOutMessage =
  | { type: 'progress'; current: number; total: number }
  | { type: 'done'; zipBlob: Blob }
  | { type: 'error'; message: string }
