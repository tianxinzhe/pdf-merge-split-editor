import { useEffect, useRef } from 'react'

interface UseVisibilityOptions {
  onVisible: (id: string) => void
  onHidden: (id: string) => void
  rootMargin?: string
}

export function useIntersectionObserver(
  containerRef: React.RefObject<HTMLElement | null>,
  pageIds: string[],
  { onVisible, onHidden, rootMargin = '200px 0px 200px 0px' }: UseVisibilityOptions,
) {
  const callbacksRef = useRef({ onVisible, onHidden })
  callbacksRef.current = { onVisible, onHidden }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.pageId
          if (!id) continue
          if (entry.isIntersecting) {
            callbacksRef.current.onVisible(id)
          } else {
            callbacksRef.current.onHidden(id)
          }
        }
      },
      {
        root: container,
        rootMargin,
        threshold: 0.01,
      },
    )

    const cards = container.querySelectorAll<HTMLElement>('[data-page-id]')
    cards.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [containerRef, pageIds.join(',')])
}
