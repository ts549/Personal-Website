'use client';
import { useRef } from 'react';

const experiences = [
  {
    company: 'Revalve',
    role: 'Founder & Engineer',
    dates: '2024 — Now',
    summary: 'Building an AI-powered pricing platform end to end — modeling, serving, and the merchant-facing dashboard.',
  },
  {
    company: 'Anthropic AI',
    role: 'ML Engineer',
    dates: 'Jan 2022 — Dec 2023',
    summary: 'Improved retrieval and ranking systems in production; cut query latency by 40%.',
  },
  {
    company: 'OpenAI',
    role: 'Research Engineer',
    dates: 'Mar 2020 — Dec 2021',
    summary: 'Worked on fine-tuning pipelines and evaluation frameworks for large language models.',
  },
  {
    company: 'Stripe',
    role: 'Software Engineer',
    dates: 'Jun 2018 — Feb 2020',
    summary: 'Built internal tooling and APIs for the payments infrastructure team.',
  },
  {
    company: 'Google',
    role: 'Software Engineer Intern',
    dates: 'May 2017 — Aug 2017',
    summary: 'Contributed to Search quality features and A/B testing infrastructure.',
  },
];

export default function ExperienceTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY + e.deltaX;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollRef.current.scrollLeft += 200;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollRef.current.scrollLeft -= 200;
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Résumé</span>
        <span className="text-xs text-gray-400">drag → →</span>
      </div>
      {/* Timeline line */}
      <div className="relative mb-2 px-1">
        <div className="h-px bg-gray-200 w-full" />
      </div>
      {/* Scrollable container */}
      <div className="relative">
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Experience timeline"
          className="flex flex-row gap-4 overflow-x-auto pb-2 focus:outline-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {experiences.map((exp, i) => (
            <div
              key={i}
              data-testid="timeline-item"
              tabIndex={0}
              className="flex-shrink-0 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md p-2"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 mb-2" />
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-0.5">{exp.dates}</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{exp.role}</p>
              <p className="text-xs text-blue-600 mb-1">{exp.company}</p>
              <p className="text-xs text-gray-500 leading-snug">{exp.summary}</p>
            </div>
          ))}
        </div>
        {/* Right fade gradient */}
        <div
          className="pointer-events-none absolute top-0 right-0 h-full w-12"
          style={{ background: 'linear-gradient(to right, transparent, #f3f4f6)' }}
        />
      </div>
    </div>
  );
}
