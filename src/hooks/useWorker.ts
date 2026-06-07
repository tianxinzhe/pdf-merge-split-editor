import { useCallback } from 'react'
import type { WorkerAction, WorkerResponse } from '../types'

type MessageHandler = (response: WorkerResponse) => void

export function useWorker(onMessage: MessageHandler) {
  const workerRef = useCallback(() => {
    const w = new Worker(
      new URL('../workers/pdf.worker.ts', import.meta.url),
      { type: 'module' },
    )
    w.onmessage = (e: MessageEvent<WorkerResponse>) => onMessage(e.data)
    w.onerror = (e) => onMessage({ type: 'ERROR', payload: { message: e.message } })
    return w
  }, [onMessage])

  let worker: Worker | null = null

  const getWorker = () => {
    if (!worker) worker = workerRef()
    return worker
  }

  const postAction = useCallback((action: WorkerAction) => {
    getWorker().postMessage(action)
  }, [])

  const registerSource = useCallback((id: string, binary: ArrayBuffer) => {
    getWorker().postMessage(
      { type: 'REGISTER_SOURCE', payload: { id, binary } },
      { transfer: [binary] },
    )
  }, [])

  return { postAction, registerSource }
}
