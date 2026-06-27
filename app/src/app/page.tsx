'use client';
import { useEffect, useState } from 'react';
import ExperienceTimeline from './components/ExperienceTimeline';

const projects = [
  {
    id: 1,
    title: 'Revalve',
    category: 'Pricing Engine',
    description: 'AI-powered dynamic pricing platform for e-commerce merchants.',
    tech: ['Python', 'FastAPI', 'PyTorch', 'Postgres', 'React'],
    detail:
      'An AI-powered pricing tool that ingests historical sales, competitor signals, and demand elasticity to recommend optimal prices in real time. I founded it and built the model serving, the feedback loops, and the merchant-facing dashboard end to end.',
    imageLabel: 'revalve dashboard',
    liveUrl: '#',
    sourceUrl: '#',
  },
  {
    id: 2,
    title: 'Semantic Search Engine',
    category: 'Retrieval',
    description: 'Dense retrieval system with re-ranking for enterprise knowledge bases.',
    tech: ['Rust', 'FAISS', 'Transformers'],
    detail:
      'Indexed 50M+ documents with approximate nearest-neighbor search. Cut query latency by 40% through batched inference and quantized embeddings.',
    imageLabel: 'search results',
    liveUrl: '#',
    sourceUrl: '#',
  },
  {
    id: 3,
    title: 'Agent Eval Harness',
    category: 'Agent Tooling',
    description: 'Open-source framework for evaluating autonomous LLM agents.',
    tech: ['Python', 'TypeScript', 'Docker'],
    detail:
      'Reproducible sandboxed environments for tool-use and multi-step reasoning benchmarks. Used internally at three AI labs.',
    imageLabel: 'eval dashboard',
    liveUrl: '#',
    sourceUrl: '#',
  },
  {
    id: 4,
    title: 'Plumbing Monitor',
    category: 'Observability',
    description: 'Real-time observability dashboard for distributed ML pipelines.',
    tech: ['Go', 'Prometheus', 'React'],
    detail:
      'Unified metrics, traces, and logs for heterogeneous ML infrastructure. Reduced mean-time-to-detect production incidents by 60%.',
    imageLabel: 'metrics view',
    liveUrl: '#',
    sourceUrl: '#',
  },
  {
    id: 5,
    title: 'FineTune Studio',
    category: 'ML Platform',
    description: 'No-code interface for fine-tuning and deploying language models.',
    tech: ['Python', 'FastAPI', 'React'],
    detail:
      'Drag-and-drop dataset management, hyperparameter sweeps, and one-click deployment to cloud GPU clusters.',
    imageLabel: 'training run',
    liveUrl: '#',
    sourceUrl: '#',
  },
];

const blogs = [
  {
    id: 1,
    label: 'Essay',
    year: '2026',
    month: 'Apr',
    title: 'Why retrieval beats fine-tuning for most apps',
    summary:
      'When you actually need to teach a model new facts, and when a good index is all you want.',
    href: '#',
  },
  {
    id: 2,
    label: 'Case Study',
    year: '2026',
    month: 'Feb',
    title: "Building Revalve's pricing model",
    summary:
      'From a naive regression baseline to a model merchants actually trust with their margins.',
    href: '#',
  },
  {
    id: 3,
    label: 'Notes',
    year: '2026',
    month: 'Jan',
    title: 'Notes on multi-agent failure modes',
    summary:
      'The quiet ways agent systems go wrong, and the guardrails that caught them for me.',
    href: '#',
  },
];

export default function Home() {
  const [activeProject, setActiveProject] = useState<(typeof projects)[0] | null>(null);

  // Esc-to-close for the project modal.
  useEffect(() => {
    if (!activeProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProject(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeProject]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-gray-50">
        <span className="font-semibold text-base tracking-tight">Sam Carter</span>
        <div className="flex gap-6 text-sm text-gray-700">
          <a href="#work" className="hover:text-gray-900 transition-colors">Work</a>
          <a href="#blogs" className="hover:text-gray-900 transition-colors">Writing</a>
        </div>
      </nav>

      {/* HERO — two columns */}
      <section className="flex flex-col md:flex-row items-start gap-10 px-8 py-16 max-w-6xl mx-auto min-h-[80vh]">
        {/* LEFT — existing hero copy */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-4">
            Full-Stack Engineer · AI Research
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-gray-900 mb-6">
            I build AI products from research to production — and founded{' '}
            <em>Revalve</em>, an AI-powered pricing tool.
          </h1>
          <p className="text-base text-gray-600 mb-8 max-w-lg leading-relaxed">
            A selection of projects, writing, and a résumé. Mostly retrieval systems,
            agents, and the unglamorous plumbing that makes them reliable.
          </p>
          <div className="flex gap-4">
            <a
              href="#work"
              className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
            >
              View work
            </a>
            <a
              href="mailto:taosun549@gmail.com"
              className="px-6 py-3 border border-gray-300 text-gray-800 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
            >
              Get in touch
            </a>
          </div>
        </div>

        {/* RIGHT — profile + timeline */}
        <div className="w-full md:w-80 flex flex-col items-center gap-6 pt-4">
          {/* Profile avatar */}
          <div
            data-testid="profile-avatar"
            className="w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-dashed border-gray-300 shadow-md flex flex-col items-center justify-center bg-gray-100 text-gray-400 flex-shrink-0"
            style={{ boxShadow: '0 0 0 4px #f3f4f6, 0 4px 24px 0 rgba(0,0,0,0.08)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-xs text-center leading-tight">profile photo<br />
              <span className="text-blue-500 underline cursor-pointer">or browse files</span>
            </span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 text-base">Sam Carter</p>
            <p className="text-sm text-gray-500">San Francisco · AI Engineer</p>
          </div>

          {/* Experience timeline */}
          <div className="w-full">
            <ExperienceTimeline />
          </div>
        </div>
      </section>

      {/* SELECTED WORK */}
      {/* biome-ignore lint/correctness/useUniqueElementIds: stable anchor target for the nav link */}
      <section id="work" data-testid="projects-section" className="px-8 py-12 max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Selected work</h2>
          <span className="text-sm text-gray-400 font-mono">
            {String(projects.length).padStart(2, '0')} projects · tap to open
          </span>
        </div>
        <div className="border-t border-gray-200 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              data-testid="project-card"
              onClick={() => setActiveProject(project)}
              onKeyDown={(e) => e.key === 'Enter' && setActiveProject(project)}
              tabIndex={0}
              role="button"
              aria-label={`Open ${project.title} project`}
              className="group flex flex-col aspect-[3/4] border border-gray-200 p-5 bg-white cursor-pointer hover:shadow-md hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-mono text-gray-400">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </div>
              <div className="flex-1" />
              <div>
                <h3 className="font-serif font-semibold text-gray-900 text-base leading-tight mb-1">
                  {project.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOGS */}
      {/* biome-ignore lint/correctness/useUniqueElementIds: stable anchor target for the nav link */}
      <section id="blogs" data-testid="blogs-section" className="px-8 py-12 max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Writing</h2>
          <span className="text-sm font-mono text-gray-400">notes on AI engineering</span>
        </div>
        <div className="border-t border-gray-200 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              data-testid="blog-card"
              className="flex flex-col border border-gray-200 bg-white hover:shadow-md transition-shadow"
            >
              <div
                className="relative aspect-[4/3] border-b border-gray-200 overflow-hidden"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(219, 234, 254, 0.55) 0 8px, rgba(255,255,255,0) 8px 18px)',
                  backgroundColor: '#f6f9ff',
                }}
              >
                <span className="absolute bottom-3 left-3 px-2 py-1 bg-white border border-gray-200 text-[10px] font-mono font-semibold tracking-widest uppercase text-gray-700">
                  {blog.label}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs font-mono tracking-widest uppercase text-gray-400 mb-3">
                  {blog.year} · {blog.month}
                </p>
                <h3 className="font-serif font-bold text-xl text-gray-900 leading-snug mb-3">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">
                  {blog.summary}
                </p>
                <a
                  href={blog.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Read
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PROJECT MODAL */}
      {activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeProject.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveProject(null); }}
        >
          <div className="bg-white shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between px-10 pt-8 pb-6">
              <div>
                <p className="text-xs font-mono font-semibold text-blue-600 tracking-widest uppercase mb-3">
                  {String(activeProject.id).padStart(2, '0')} · {activeProject.category}
                </p>
                <h2 className="text-3xl font-serif font-bold text-gray-900">
                  {activeProject.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setActiveProject(null)}
                className="inline-flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 text-xs font-mono text-gray-600 hover:bg-gray-100 transition-colors"
              >
                ESC
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Hatched image placeholder */}
            <div className="mx-10 mb-8">
              <div
                className="relative aspect-[16/9] border border-gray-200 flex items-center justify-center overflow-hidden"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(219, 234, 254, 0.55) 0 8px, rgba(255,255,255,0) 8px 18px)',
                  backgroundColor: '#f6f9ff',
                }}
              >
                <span className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-700">
                  {activeProject.imageLabel}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-10 pb-10">
              <p className="text-base text-gray-700 leading-relaxed mb-8">
                {activeProject.detail}
              </p>

              <p className="text-xs font-mono font-semibold tracking-widest text-gray-400 uppercase mb-3">
                Stack
              </p>
              <div className="flex gap-2 flex-wrap mb-8">
                {activeProject.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono text-gray-700 border border-gray-300 rounded px-2.5 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <a
                  href={activeProject.liveUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                >
                  Live
                  <svg
                    aria-hidden="true"
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </a>
                <a
                  href={activeProject.sourceUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-300 text-gray-800 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  Source
                  <svg
                    aria-hidden="true"
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
