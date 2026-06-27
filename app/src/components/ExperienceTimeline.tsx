'use client';
import { useRef, useCallback } from 'react';

const EXPERIENCES = [
  {
    company: 'Revalve',
    role: 'Founder & Engineer',
    dates: '2024 — Now',
    summary: 'Building an AI-powered pricing platform end to end — modeling, serving, and the merchant-facing dashboard.',
  },
  {
    company: 'Stealth AI',
    role: 'ML Engineer',
    dates: 'Jan 2022 — Dec 2023',
    summary: 'Owned retrieval and ranking systems in production; cut query latency by 40%.',
  },
  {
    company: 'DataCo',
    role: 'Software Engineer',
    dates: 'Jun 2020 — Dec 2021',
    summary: 'Built data pipelines and APIs serving 10M+ daily events across multiple product lines.',
  },
  {
    company: 'OpenLab',
    role: 'Research Engineer',
    dates: 'Sep 2018 — May 2020',
    summary: 'Developed NLP models for document classification; published two conference papers.',
  },
  {
    company: 'ByteStart',
    role: 'Frontend Engineer',
    dates: 'Jun 2017 — Aug 2018',
    summary: 'Shipped React-based dashboards for B2B SaaS clients; led accessibility audit initiative.',
  },
];

export default function ExperienceTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY + e.deltaX;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollRef.current.scrollLeft += 200;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollRef.current.scrollLeft -= 200;
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Résumé</span>
        <span className="text-xs text-gray-400">drag ← →</span>
      </div>

      {/* Timeline line */}
      <div className="relative mb-2">
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
          className="flex flex-row gap-6 overflow-x-auto pb-4 focus:outline-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {EXPERIENCES.map((exp, i) => (
            <div
              key={i}
              data-testid="timeline-item"
              tabIndex={0}
              className="flex-shrink-0 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 mb-2" />
              <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">{exp.dates}</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">{exp.role}</p>
              <p className="text-xs text-blue-600 font-medium mb-1">{exp.company}</p>
              <p className="text-xs text-gray-500 leading-snug">{exp.summary}</p>
            </div>
          ))}
        </div>
        {/* Gradient fade right edge */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
}
