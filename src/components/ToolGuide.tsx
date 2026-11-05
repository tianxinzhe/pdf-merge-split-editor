import type { GuideCopy } from '../i18n/types'

/**
 * Long-form explanatory copy under each tool.
 * Besides helping users, it gives AdSense more real text to scan for Auto ads.
 */
export function ToolGuide({ copy }: { copy: GuideCopy }) {
  return (
    <section className="mt-6 rounded-xl border border-gray-800 bg-gray-900/40 p-4">
      <h2 className="text-xs font-semibold text-gray-200">{copy.title}</h2>
      <p className="mt-2 text-[11px] leading-relaxed text-gray-400">{copy.intro}</p>
      <ul className="mt-2.5 space-y-1.5">
        {copy.tips.map(tip => (
          <li key={tip} className="flex gap-1.5 text-[11px] leading-relaxed text-gray-400">
            <span className="shrink-0 text-blue-400" aria-hidden>•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}