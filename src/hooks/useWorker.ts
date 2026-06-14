import { useCallback, useEffect, useRef } from 'react'
import type { WorkerAction, WorkerResponse } from '../types'

type MessageHandler = (response: WorkerResponse) => void

export function useWorker(onMessage: MessageHandler) {
  const onMessageRef = useRef(onMessage)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => { onMessageRef.current = onMessage })

  useEffect(() => {
    const w = new Worker(
      new URL('../workers/pdf.worker.ts', import.meta.url),
      { type: 'module' },
    )
    w.onmessage = (e: MessageEvent<WorkerResponse>) => onMessageRef.current(e.data)
    w.onerror = (e) => onMessageRef.current({ type: 'ERROR', payload: { message: e.message } })
    workerRef.current = w
    return () => w.terminate()
  }, [])

  const postAction = useCallback((action: WorkerAction) => {
    workerRef.current?.postMessage(action)
  }, [])

  const registerSource = useCallback((id: string, binary: ArrayBuffer) => {
    workerRef.current?.postMessage(
      { type: 'REGISTER_SOURCE', payload: { id, binary } },
      { transfer: [binary] },
    )
  }, [])

  return { postAction, registerSource }
}
