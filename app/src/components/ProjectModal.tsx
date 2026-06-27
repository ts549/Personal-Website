'use client';
import { useEffect, useCallback } from 'react';

export interface Project {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  description: string;
  writeup: string;
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!project) return;
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [project, handleEsc]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          animation: 'slideUp 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{project.number}</span>
            <h2 className="font-serif text-[28px] font-bold mt-1" style={{ color: '#0f172a' }}>{project.name}</h2>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{project.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 flex items-center justify-center w-8 h-8 text-sm font-medium transition-colors hover:text-[#3b5bdb]"
            style={{ color: '#475569', border: '1px solid #e2e8f0', borderRadius: '4px' }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#475569' }}>{project.description}</p>
          <div className="pt-6" style={{ borderTop: '1px solid #e2e8f0' }}>
            <h3 className="font-serif text-lg font-bold mb-3" style={{ color: '#0f172a' }}>About this project</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{project.writeup}</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
