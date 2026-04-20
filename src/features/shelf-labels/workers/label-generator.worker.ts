import JSZip from 'jszip'
import { renderLabel } from '../lib/label-renderer'
import { LABEL_WIDTH, LABEL_HEIGHT } from '../lib/constants'
import type { WorkerInMessage, WorkerOutMessage } from '../lib/worker-protocol'
import type { LabelConfig } from '../lib/types'

const pad = (n: number) => n.toString().padStart(2, '0')

function fileName(c: LabelConfig): string {
  return `${c.zone}-${pad(c.row)}-${pad(c.rack)}-${pad(c.level)}-${pad(c.position)}.png`
}

function post(msg: WorkerOutMessage) {
  self.postMessage(msg)
}

async function generate(configs: LabelConfig[]) {
  try {
    const canvas = new OffscreenCanvas(LABEL_WIDTH, LABEL_HEIGHT)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      post({ type: 'error', message: 'Failed to get OffscreenCanvas context' })
      return
    }

    const zip = new JSZip()

    for (let i = 0; i < configs.length; i++) {
      renderLabel(ctx, configs[i])

      const blob = await canvas.convertToBlob({ type: 'image/png' })
      const buffer = await blob.arrayBuffer()
      zip.file(fileName(configs[i]), buffer)

      post({ type: 'progress', current: i + 1, total: configs.length })
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    post({ type: 'done', zipBlob })
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}

self.addEventListener('message', (e: MessageEvent<WorkerInMessage>) => {
  if (e.data.type === 'generate') {
    generate(e.data.configs)
  }
})
