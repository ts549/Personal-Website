'use client';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { BlogMeta } from '@/lib/blogs';
import type { Experience } from '@/lib/experiences';
import type { Project } from '@/lib/projects';
import type { SocialButton } from '@/lib/social';
import ResumeTimeline from './components/ResumeTimeline';

const HATCH_BG: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(219, 234, 254, 0.55) 0 8px, rgba(255,255,255,0) 8px 18px)',
  backgroundColor: '#f6f9ff',
};

interface HomeClientProps {
  projects: Project[];
  blogs: BlogMeta[];
  experiences: Experience[];
  socialButtons: SocialButton[];
}

export default function HomeClient({ projects, blogs, experiences, socialButtons }: HomeClientProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const activeProject = activeIdx !== null ? projects[activeIdx] : null;
  const [openSocialSlug, setOpenSocialSlug] = useState<string | null>(null);
  // Track the most-recently-shown toggle so its content stays mounted during
  // the close transition (and so the panel reserves space on first render).
  const [lastShownSlug, setLastShownSlug] = useState<string | null>(
    () =>
      socialButtons.find((b) => b.kind === 'toggle')?.slug ?? null,
  );
  const displayedToggle = socialButtons.find(
    (b): b is Extract<SocialButton, { kind: 'toggle' }> =>
      b.kind === 'toggle' && b.slug === lastShownSlug,
  );

  const handleToggleClick = (slug: string) => {
    if (openSocialSlug === slug) {
      setOpenSocialSlug(null);
    } else {
      setOpenSocialSlug(slug);
      setLastShownSlug(slug);
    }
  };

  useEffect(() => {
    if (activeIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIdx(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIdx]);

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-gray-900 pt-20">
      {/* NAV — fixed across the top, contents centered to a 6xl gutter so they
          line up with the rest of the page rather than pinning to the viewport edges. */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-20 border-b border-gray-200 bg-[#F8F7F2]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto h-full px-8 flex items-center justify-between">
          <span className="font-semibold text-base tracking-tight text-[#556B4F]">Tao Sun</span>
          <div className="flex gap-6 text-sm text-[#556B4F]">
            <a href="#projects" className="hover:text-[#95A589] transition-colors">Projects</a>
            <a href="#blog" className="hover:text-[#95A589] transition-colors">Blog</a>
          </div>
        </div>
      </nav>

      {/* HERO — two columns */}
      <section className="flex flex-col md:flex-row md:items-center gap-10 px-8 pt-4 pb-16 max-w-6xl mx-auto min-h-[70vh]">
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-widest text-[#95A589] uppercase mb-4">
            Full-Stack Engineer · AI Research
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-[#556B4F] mb-6">
            &ldquo;The only way to do great work is to love what you do.&rdquo;
          </h1>
          <p className="text-base text-[#2D2A26] mb-8 max-w-lg leading-relaxed">
            I try to live by this quote every day. I believe the best work comes from building things you're genuinely passionate about.

            This is where I document my journey creating and shipping projects. Success or failure, each one is a step toward becoming a better engineer, builder, and founder.

            Follow along as I continue turning ideas into reality.
          </p>
          {/* Social icons + Gmail toggle */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex gap-3">
              {socialButtons.map((btn) => {
                const isOpen = btn.kind === 'toggle' && openSocialSlug === btn.slug;
                if (btn.kind === 'link') {
                  return (
                    <a
                      key={btn.slug}
                      href={btn.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={btn.slug}
                      className="w-11 h-11 inline-flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {/* biome-ignore lint/performance/noImgElement: small static social icon */}
                      <img src={btn.iconUrl} alt={btn.slug} className="w-full h-full object-contain" />
                    </a>
                  );
                }
                return (
                  <button
                    type="button"
                    key={btn.slug}
                    aria-label={`Toggle ${btn.slug}`}
                    aria-expanded={isOpen ? 'true' : 'false'}
                    onClick={() => handleToggleClick(btn.slug)}
                    className={
                      `w-11 h-11 inline-flex items-center justify-center p-1 cursor-pointer transition-colors ` +
                      (isOpen ? 'bg-gray-900' : 'bg-transparent hover:bg-gray-100')
                    }
                  >
                    {/* biome-ignore lint/performance/noImgElement: small static social icon */}
                    <img
                      src={btn.iconUrl}
                      alt={btn.slug}
                      className={`w-full h-full object-contain transition ${isOpen ? 'invert' : ''}`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Toggle content panel — space is always reserved; only opacity
                and a small Y offset change so nothing else in the column shifts. */}
            {displayedToggle && (
              <div
                className={`w-full transition-all duration-300 ease-out ${
                  openSocialSlug
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-1 pointer-events-none'
                }`}
              >
                <div className="px-4 py-3 border border-gray-200 bg-white text-sm font-mono text-gray-800">
                  {displayedToggle.content}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-80 flex flex-col items-center gap-6">
          <div
            data-testid="profile-avatar"
            className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden shrink-0"
            style={{ boxShadow: '0 0 0 4px #f3f4f6, 0 4px 24px 0 rgba(0,0,0,0.08)' }}
          >
            {/* biome-ignore lint/performance/noImgElement: small static avatar */}
            <img
              src="/Headshot.JPG"
              alt="Tao Sun"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 text-base">Tao Sun</p>
            <p className="text-sm text-gray-500">Boston, MA</p>
          </div>
        </div>
      </section>

      {/* RESUME */}
      {/* biome-ignore lint/correctness/useUniqueElementIds: stable anchor target for the nav link */}
      <section id="resume" data-testid="resume-section" className="px-8 pt-0 pb-12 max-w-6xl mx-auto">
        <ResumeTimeline experiences={experiences} />
      </section>

      {/* SELECTED WORK */}
      {/* biome-ignore lint/correctness/useUniqueElementIds: stable anchor target for the nav link */}
      <section id="projects" data-testid="projects-section" className="px-8 py-12 max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Projects and Works</h2>
          <span className="text-sm text-gray-400 font-mono">
            {String(projects.length).padStart(2, '0')} projects · tap to open
          </span>
        </div>
        <div className="border-t border-gray-200 mb-8" />
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500">
            No projects yet — drop a folder under <code>public/projects/&lt;slug&gt;/</code> to add one.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {projects.map((project, idx) => {
              const cardInner = (
                <>
                  <div
                    className="relative flex-1 border-b border-gray-200 overflow-hidden"
                    style={project.thumbnailUrl || project.pdfUrl ? undefined : HATCH_BG}
                  >
                    {project.thumbnailUrl ? (
                      // biome-ignore lint/performance/noImgElement: small static thumbnail, optimized at build
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : project.pdfUrl ? (
                      <iframe
                        src={`${project.pdfUrl}#page=1&view=Fit&toolbar=0&navpanes=0&scrollbar=0`}
                        title={`${project.title} preview`}
                        scrolling="no"
                        className="absolute -top-2 -left-2 pointer-events-none bg-white"
                        style={{ width: 'calc(100% + 1.25rem)', height: 'calc(100% + 1.25rem)' }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-semibold text-gray-900 text-base leading-tight mb-1">
                      {project.title}
                    </h3>
                    {project.oneLiner && (
                      <p className="text-xs text-gray-500 line-clamp-1">{project.oneLiner}</p>
                    )}
                  </div>
                </>
              );

              const cardClass =
                'group flex flex-col aspect-[3/4] border border-gray-200 bg-white cursor-pointer hover:shadow-md hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 text-left p-0';

              if (project.isPaper && project.pdfUrl) {
                return (
                  <a
                    key={project.slug}
                    data-testid="project-card"
                    href={project.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.title} paper PDF`}
                    className={cardClass}
                  >
                    {cardInner}
                  </a>
                );
              }

              return (
                <button
                  type="button"
                  key={project.slug}
                  data-testid="project-card"
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`Open ${project.title} project`}
                  className={cardClass}
                >
                  {cardInner}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* BLOGS */}
      {/* biome-ignore lint/correctness/useUniqueElementIds: stable anchor target for the nav link */}
      <section id="blog" data-testid="blog-section" className="px-8 py-12 max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Blog</h2>
          <span className="text-sm font-mono text-gray-400">notes and findings on AI engineering</span>
        </div>
        <div className="border-t border-gray-200 mb-8" />
        {blogs.length === 0 ? (
          <p className="text-sm text-gray-500">
            No writing yet — drop a folder under <code>public/blogs/&lt;slug&gt;/content.md</code> to add one.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <a
                key={blog.slug}
                href={`/blogs/${blog.slug}`}
                data-testid="blog-card"
                className="group flex flex-col border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-[#556B4F]"
              >
                <div
                  className="relative aspect-[4/3] border-b border-gray-200 overflow-hidden"
                  style={blog.thumbnailUrl ? undefined : HATCH_BG}
                >
                  {blog.thumbnailUrl && (
                    // biome-ignore lint/performance/noImgElement: small static thumbnail
                    <img
                      src={blog.thumbnailUrl}
                      alt={blog.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  {blog.date && (
                    <p className="text-xs font-mono tracking-widest uppercase text-gray-400 mb-3">
                      {blog.date}
                    </p>
                  )}
                  <h3 className="font-serif font-bold text-xl text-gray-900 leading-snug group-hover:text-[#556B4F] transition-colors">
                    {blog.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* PROJECT MODAL */}
      {activeProject && activeIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeProject.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveIdx(null); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setActiveIdx(null); }}
        >
          <div className="bg-white shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between px-10 pt-8 pb-6">
              <div>
                <p className="text-xs font-mono font-semibold text-blue-600 tracking-widest uppercase mb-3">
                  {String(activeIdx + 1).padStart(2, '0')}
                </p>
                <h2 className="text-3xl font-serif font-bold text-gray-900">
                  {activeProject.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setActiveIdx(null)}
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

            {/* Video (full-width, natural aspect) or hatched fallback */}
            <div className="mb-8">
              {activeProject.videoUrl ? (
                <video
                  src={activeProject.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="block w-full h-auto"
                />
              ) : (
                <div
                  className="relative aspect-video border-y border-gray-200 flex items-center justify-center overflow-hidden"
                  style={HATCH_BG}
                >
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-700">
                    {activeProject.slug} demo
                  </span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="px-10 pb-10">
              {activeProject.body && (
                <div className="mb-8">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: (props) => <h1 className="font-serif font-bold text-2xl text-gray-900 mt-6 mb-3 first:mt-0" {...props} />,
                      h2: (props) => <h2 className="font-serif font-bold text-xl text-gray-900 mt-6 mb-2 first:mt-0" {...props} />,
                      h3: (props) => <h3 className="font-serif font-semibold text-lg text-gray-900 mt-5 mb-2 first:mt-0" {...props} />,
                      p: (props) => <p className="text-base text-gray-700 leading-relaxed mb-4" {...props} />,
                      ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-1.5" {...props} />,
                      ol: (props) => <ol className="list-decimal pl-6 mb-4 space-y-1.5" {...props} />,
                      li: (props) => <li className="text-base text-gray-700 leading-relaxed" {...props} />,
                      blockquote: (props) => <blockquote className="border-l-2 border-gray-300 pl-4 italic text-gray-600 my-4" {...props} />,
                      pre: (props) => <pre className="font-mono text-sm bg-gray-100 p-4 mb-4 overflow-x-auto" {...props} />,
                      code: (props) => <code className="font-mono text-sm bg-gray-100 px-1 py-0.5" {...props} />,
                      a: (props) => <a className="text-blue-600 hover:text-blue-700 underline" {...props} />,
                      strong: (props) => <strong className="font-semibold text-gray-900" {...props} />,
                      em: (props) => <em className="italic" {...props} />,
                    }}
                  >
                    {activeProject.body}
                  </ReactMarkdown>
                </div>
              )}

              {activeProject.tech.length > 0 && (
                <>
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
                </>
              )}

            </div>
          </div>
        </div>
      )}

      <footer className="mt-24 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-8 flex items-center justify-between">
          <span className="font-serif text-[#556B4F]">Tao Sun</span>
          <div className="flex gap-6 text-xs font-mono text-[#556B4F]">
            {socialButtons
              .filter((btn) => btn.kind === 'link')
              .map((btn) => {
                const label =
                  btn.slug === 'x'
                    ? 'X'
                    : btn.slug.charAt(0).toUpperCase() + btn.slug.slice(1);
                return (
                  <a
                    key={btn.slug}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#95A589] transition-colors"
                  >
                    {label}
                  </a>
                );
              })}
          </div>
        </div>
      </footer>
    </main>
  );
}
