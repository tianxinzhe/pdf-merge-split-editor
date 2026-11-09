import { MultiFileMerger } from './MultiFileMerger'

interface ImageToPdfProps {
  onSendToEditor: (name: string, binary: ArrayBuffer) => void
}

/** Image → PDF page: the merger component restricted to image inputs. */
export function ImageToPdf({ onSendToEditor }: ImageToPdfProps) {
  return <MultiFileMerger imagesOnly onSendToEditor={onSendToEditor} />
}