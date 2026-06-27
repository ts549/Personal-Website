'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Project {
  slug: string;
  title: string;
  description: string;
  writeUp?: string;
  tags?: string[];
}

// ─── ProjectModal ─────────────────────────────────────────────────────────────
interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.25s ease' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-700 px-6 py-5">
          <h2
            id="modal-title"
            className="text-2xl font-bold text-gray-900 dark:text-white leading-tight"
          >
            {project.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[60vh]">
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            {project.description}
          </p>
          {project.writeUp && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">About this project</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {project.writeUp}
              </p>
            </div>
          )}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-3 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ResumeSection ────────────────────────────────────────────────────────────
export function ResumeSection() {
  return (
    <section id="resume" className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Résumé</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-sm">A snapshot of my background and experience</p>

        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">

          {/* Header */}
          <div className="px-8 py-8 bg-indigo-600 text-white">
            <h3 className="text-2xl font-bold">Alex Johnson</h3>
            <p className="mt-1 text-indigo-200 text-sm">Full-Stack Developer · Open to Opportunities</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-indigo-100">
              <span>📧 alex.johnson@email.com</span>
              <span>🔗 linkedin.com/in/alexjohnson</span>
              <span>📍 San Francisco, CA</span>
            </div>
          </div>

          {/* Experience */}
          <div className="px-8 py-6">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Experience</h4>
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">Senior Software Engineer</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2023 – Present</p>
                </div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Acme Corp, San Francisco</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Led development of a microservices platform serving 2M+ users. Reduced API latency by 40% through caching strategies and query optimizations.</p>
              </div>
              <div>
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">Software Engineer</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2020 – 2023</p>
                </div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Beta Startup, Remote</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Built React-based dashboards and RESTful APIs. Shipped 3 major product features that increased user retention by 25%.</p>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="px-8 py-6">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Education</h4>
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">B.S. Computer Science</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">University of California, Berkeley</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">2016 – 2020</p>
            </div>
          </div>

          {/* Skills */}
          <div className="px-8 py-6">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {['TypeScript','React','Next.js','Node.js','PostgreSQL','Redis','Docker','AWS','TailwindCSS','GraphQL'].map((skill) => (
                <span key={skill} className="rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── BlogsSection ─────────────────────────────────────────────────────────────
const BLOG_POSTS = [
  {
    slug: 'building-scalable-apis',
    title: 'Building Scalable APIs with Node.js and Redis',
    date: 'June 10, 2026',
    excerpt: 'Explore how caching strategies with Redis can dramatically reduce database load and improve response times for high-traffic REST APIs.',
  },
  {
    slug: 'nextjs-app-router-deep-dive',
    title: 'Next.js App Router: A Deep Dive into Server Components',
    date: 'May 22, 2026',
    excerpt: 'React Server Components change how we think about data fetching. In this post we unpack how the App Router leverages them for faster page loads.',
  },
  {
    slug: 'accessible-design-systems',
    title: 'Designing for Everyone: Accessible Component Libraries',
    date: 'April 5, 2026',
    excerpt: 'Accessibility is not an afterthought. Learn the patterns — ARIA roles, keyboard navigation, focus management — that make component libraries truly inclusive.',
  },
];

export function BlogsSection() {
  return (
    <section id="blog" className="py-20 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Blog</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-sm">Thoughts on engineering, design, and the web</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Color bar accent */}
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="flex flex-col flex-1 p-6 gap-3">
                <time className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  {post.date}
                </time>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read more
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
