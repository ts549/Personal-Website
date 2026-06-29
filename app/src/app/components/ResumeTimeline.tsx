'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Experience } from '@/lib/experiences';

interface Props {
  experiences: Experience[];
}

/**
 * Vertical resume timeline. Three columns per row:
 *   - date (right-aligned, mono, gray)
 *   - icon (square, on the timeline line, with a dot)
 *   - description (markdown body)
 */
export default function ResumeTimeline({ experiences }: Props) {
  if (experiences.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No experiences yet — add a folder under <code>public/experiences/&lt;slug&gt;/</code> with date.txt, description.txt, and icon.png.
      </p>
    );
  }

  // date col 8rem, gap-6 = 1.5rem → line at 9.5rem.
  const LINE_LEFT = '9.5rem';

  return (
    <div className="relative">
      <div
        className="absolute top-3 bottom-3 w-px bg-gray-200"
        style={{ left: LINE_LEFT }}
      />

      <div className="flex flex-col">
        {experiences.map((exp) => (
          <div
            key={exp.slug}
            data-testid="experience-item"
            className="relative grid grid-cols-[8rem_5rem_1fr] gap-6 py-6 first:pt-2 last:pb-2"
          >
            <div className="text-right pt-1.5">
              <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
                {exp.date}
              </span>
            </div>

            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute top-2 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white"
                style={{ left: '-0.3125rem' }}
              />
              <div className="ml-6 w-16 h-16 flex items-center justify-center overflow-hidden">
                {exp.logoUrl ? (
                  // biome-ignore lint/performance/noImgElement: small static logo
                  <img
                    src={exp.logoUrl}
                    alt={exp.slug}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] font-mono font-semibold tracking-widest text-gray-400">
                    {exp.slug.slice(0, 4).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-0.5 min-w-0">
              {exp.body && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: (props) => (
                      <p className="text-base text-gray-700 leading-relaxed mb-3 last:mb-0" {...props} />
                    ),
                    a: (props) => (
                      <a
                        className="text-blue-600 underline decoration-blue-300 hover:decoration-blue-600 transition-colors"
                        {...props}
                      />
                    ),
                    ol: (props) => (
                      <ol className="list-decimal pl-6 mb-3 space-y-1 marker:text-gray-400" {...props} />
                    ),
                    ul: (props) => (
                      <ul className="list-disc pl-6 mb-3 space-y-1 marker:text-gray-400" {...props} />
                    ),
                    li: (props) => (
                      <li className="text-base text-gray-700 leading-relaxed" {...props} />
                    ),
                    strong: (props) => <strong className="font-semibold text-gray-900" {...props} />,
                    em: (props) => <em className="italic" {...props} />,
                  }}
                >
                  {exp.body}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
