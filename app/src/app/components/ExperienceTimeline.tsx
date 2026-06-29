'use client';
import { useEffect, useRef, useState } from 'react';

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
  // Mutable drag state — kept in a ref so move events don't re-render.
  const drag = useRef({ active: false, startX: 0, startScrollLeft: 0 });
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Pin to the rightmost experience on mount.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: scrollRef.current.scrollLeft,
    };
    setIsGrabbing(true);
    scrollRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !scrollRef.current) return;
    // Drag delta: positive when the pointer moves RIGHT. To make content move
    // with the pointer (drag left → content slides left), scrollLeft moves in
    // the opposite direction.
    const delta = e.clientX - drag.current.startX;
    scrollRef.current.scrollLeft = drag.current.startScrollLeft - delta;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setIsGrabbing(false);
    if (scrollRef.current?.hasPointerCapture(e.pointerId)) {
      scrollRef.current.releasePointerCapture(e.pointerId);
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
        <span className="text-xs text-gray-400">click + drag</span>
      </div>
      <div className="relative mb-2 px-1">
        <div className="h-px bg-gray-200 w-full" />
      </div>
      <div className="relative">
        <section
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={handleKeyDown}
          aria-label="Experience timeline"
          // Right padding = (half the container width - half an item width) so
          // the last item ends up centered when scrolled to scrollLeft = max.
          // calc(50% - 5.5rem) where 5.5rem = w-44/2 = half a card.
          className={`flex flex-row gap-4 overflow-x-auto pb-2 pr-[calc(50%-5.5rem)] focus:outline-none select-none touch-pan-y ${
            isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {experiences.map((exp) => (
            <div
              key={exp.company}
              data-testid="timeline-item"
              className="shrink-0 w-44 rounded-md p-2 pointer-events-none"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 mb-2" />
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-0.5">{exp.dates}</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{exp.role}</p>
              <p className="text-xs text-blue-600 mb-1">{exp.company}</p>
              <p className="text-xs text-gray-500 leading-snug">{exp.summary}</p>
            </div>
          ))}
        </section>
        <div
          className="pointer-events-none absolute top-0 right-0 h-full w-12"
          style={{ background: 'linear-gradient(to right, transparent, #f3f4f6)' }}
        />
      </div>
    </div>
  );
}
