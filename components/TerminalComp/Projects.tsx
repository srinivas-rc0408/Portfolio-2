"use client";

import React, { useState, useEffect } from "react";
import SmartImage from "@/components/ui/SmartImage";
import { AnimatePresence, motion } from "framer-motion";
import { type Project } from "@/lib/portfolio-data";
import { CMS_UPDATED_EVENT, getItems } from "@/lib/cms";
import WindowDots from "@/components/WindowDots";

/** Public projects from the CMS store (private entries excluded), mapped to the card shape. */
function readPublicProjects(): Project[] {
  return getItems("projects").map((item) => ({
    name: item.title,
    description: item.description,
    imageUrl: item.imageUrl ?? "/images/logo.jpg",
    liveUrl: item.link ?? "#",
    githubUrl: item.githubUrl ?? "#",
    tech: item.tech ?? [],
  }));
}


// --- SVG Icons ---
const GitHubIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const ExternalLinkIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const TerminalIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM3 7v12h18V7H3zm6.5 6l-2-2 2-2L8 7.5 5.5 10 8 12.5 9.5 11zm6 2h-3v-2h3v2z" />
  </svg>
);

const ChevronLeftIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// --- The Main Projects Component ---
const Projects: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [projectsPerPage, setProjectsPerPage] = useState<number>(2);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  // Close the detail modal on Escape.
  useEffect(() => {
    if (!detailProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailProject(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailProject]);

  // CMS-backed data: re-read when the admin panel saves
  useEffect(() => {
    const read = () => setProjectsData(readPublicProjects());
    read();
    window.addEventListener(CMS_UPDATED_EVENT, read);
    return () => window.removeEventListener(CMS_UPDATED_EVENT, read);
  }, []);

  // Handle responsive projects per page
  useEffect(() => {
    const handleResize = (): void => {
      setProjectsPerPage(window.innerWidth < 768 ? 1 : 2);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(projectsData.length / projectsPerPage);

  // Get current projects to display
  const startIndex = currentPage * projectsPerPage;
  const currentProjects = projectsData.slice(
    startIndex,
    startIndex + projectsPerPage
  );

  const nextPage = (): void => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = (): void => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const copyCloneCommand = async (project: Project, globalIndex: number): Promise<void> => {
    const cloneCmd = `git clone ${project.githubUrl}.git`;
    try {
      await navigator.clipboard.writeText(cloneCmd);
      setCopiedIndex(globalIndex);
      window.setTimeout(() => {
        setCopiedIndex((prev) => (prev === globalIndex ? null : prev));
      }, 1200);
    } catch {
      // Fallback: best-effort selection-less copy (older browsers)
      const ta = document.createElement("textarea");
      ta.value = cloneCmd;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        setCopiedIndex(globalIndex);
        window.setTimeout(() => {
          setCopiedIndex((prev) => (prev === globalIndex ? null : prev));
        }, 1200);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <section
      className="text-white space-y-4 sm:space-y-8 max-w-7xl mx-auto p-3 sm:p-4"
      aria-label="Projects showcase"
    >
      {/* Header with terminal-style decoration */}
      <header className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-8">
        <TerminalIcon />
        <h2 className="text-lg sm:text-2xl text-white font-bold font-mono tracking-wider">
          ~/projects
        </h2>
        <div
          className="flex-1 h-px bg-gradient-to-r from-cyan-400/50 to-transparent"
          aria-hidden="true"
        ></div>
        <span className="text-white/60 text-xs sm:text-sm font-mono">
          {projectsData.length} repos
        </span>
      </header>

      {/* Page indicator - Mobile optimized */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <div
          className="flex items-center space-x-2 text-white font-mono"
          aria-live="polite"
        >
          {/* Compact prev/next beside the page indicator (mirrors the bottom nav) */}
          <button
            type="button"
            onClick={prevPage}
            disabled={currentPage === 0}
            aria-label="Previous page"
            className={`grid h-6 w-6 place-items-center rounded-md border transition-all duration-200 ${
              currentPage === 0
                ? "cursor-not-allowed border-gray-700/50 text-gray-600"
                : "border-[rgba(var(--theme-accent-rgb),0.4)] text-white hover:bg-[rgba(var(--theme-accent-rgb),0.15)] active:scale-90"
            }`}
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-xs sm:text-sm">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            aria-label="Next page"
            className={`grid h-6 w-6 place-items-center rounded-md border transition-all duration-200 ${
              currentPage === totalPages - 1
                ? "cursor-not-allowed border-gray-700/50 text-gray-600"
                : "border-[rgba(var(--theme-accent-rgb),0.4)] text-white hover:bg-[rgba(var(--theme-accent-rgb),0.15)] active:scale-90"
            }`}
          >
            <ChevronRightIcon />
          </button>
          <div
            className="flex space-x-1"
            role="tablist"
            aria-label="Page navigation"
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <div
                key={i}
                role="tab"
                aria-selected={i === currentPage}
                aria-label={`Page ${i + 1}`}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                  i === currentPage ? "bg-[var(--theme-accent)]" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-white/60 text-xs sm:text-sm font-mono">
          Showing {startIndex + 1}-
          {Math.min(startIndex + projectsPerPage, projectsData.length)} of{" "}
          {projectsData.length}
        </div>
      </div>

      {/* Grid container - Responsive: 1 column on mobile, 2 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 min-h-[400px] sm:min-h-[600px]">
        {currentProjects.map((project, index) => {
          const globalIndex = startIndex + index;
          return (
            <article
              key={globalIndex}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(globalIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Glassmorphism card */}
              <div className="backdrop-blur-md bg-gray-900/30 border border-blue-500/20 rounded-lg sm:rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-blue-500/10">
                {/* Terminal header bar */}
                <header className="bg-gray-800/50 px-3 sm:px-4 py-2 border-b border-blue-500/20 flex items-center space-x-2">
                  <WindowDots size="h-2 w-2 sm:h-3 sm:w-3" gap="gap-1 sm:gap-2" />
                  <div className="flex-1 text-center overflow-hidden">
                    <span className="text-white/70 text-xs font-mono block truncate">
                      {project.name.toLowerCase().replace(/\s+/g, "-")}
                    </span>
                  </div>
                </header>

                {/* Project Image with overlay */}
                <div className="relative h-40 sm:h-56 overflow-hidden">
                  <SmartImage
                    src={project.imageUrl}
                    alt={`${project.name} project screenshot`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"
                    aria-hidden="true"
                  ></div>

                  {/* Hover overlay with glitch effect */}
                  <div
                    className={`absolute inset-0 bg-blue-500/5 transition-all duration-300 ${
                      hoveredIndex === globalIndex ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-cyan-400/10"></div>
                  </div>
                </div>

                {/* Project Content - Mobile optimized */}
                <div className="p-4 sm:p-8 space-y-3 sm:space-y-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white text-base sm:text-xl mb-2 sm:mb-3 font-mono group-hover:text-white transition-colors leading-tight">
                      {project.name}
                    </h3>
                  </div>

                  {/* Tech stack badges - Mobile responsive */}
                  <div
                    className="flex flex-wrap gap-1 sm:gap-2"
                    role="list"
                    aria-label="Technologies used"
                  >
                    {project.tech.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        role="listitem"
                        className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs bg-blue-500/20 text-white rounded-full border border-blue-500/30 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <p className="line-clamp-3 text-gray-300 text-sm sm:text-base leading-relaxed">
                    {project.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDetailProject(project)}
                    className="inline-flex items-center gap-1 font-mono text-xs sm:text-sm text-[var(--theme-accent)] transition-all duration-200 hover:gap-2 hover:brightness-125"
                    aria-label={`View full details for ${project.name}`}
                  >
                    view details <span aria-hidden="true">→</span>
                  </button>

                  {/* Terminal-style command line - Mobile responsive */}
                  <div
                    className="bg-gray-800/50 rounded-md p-2 sm:p-4 font-mono text-xs sm:text-sm border border-gray-700/50 overflow-hidden cursor-pointer select-none hover:border-cyan-400/40 transition-colors"
                    role="code"
                    tabIndex={0}
                    aria-label={`Copy git clone command for ${project.name}`}
                    onClick={() => copyCloneCommand(project, globalIndex)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        copyCloneCommand(project, globalIndex);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2 text-white min-w-0">
                      <span
                        className="text-white flex-shrink-0"
                        aria-hidden="true"
                      >
                        $
                      </span>
                      <span className="text-gray-400 flex-shrink-0">
                        git clone
                      </span>
                      <span className="text-white min-w-0 flex-1 break-all sm:truncate">
                        {project.githubUrl}.git
                      </span>
                      <span className="flex items-center space-x-2 flex-shrink-0">
                        {copiedIndex === globalIndex ? (
                          <span className="text-white/80 text-[10px] sm:text-xs">
                            Copied!
                          </span>
                        ) : (
                          <span className="text-gray-400/80 text-[10px] sm:text-xs hidden sm:inline">
                            Click to copy
                          </span>
                        )}
                        <CopyIcon className={copiedIndex === globalIndex ? "text-white" : "text-gray-400"} />
                      </span>
                    </div>
                  </div>

                  {/* Links Section - Mobile optimized */}
                  <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-gray-700/30 space-y-2 sm:space-y-0">
                    <nav
                      className="flex space-x-4 sm:space-x-6"
                      aria-label="Project links"
                    >
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 sm:space-x-2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 font-mono text-sm sm:text-base"
                        aria-label={`View ${project.name} live demo`}
                      >
                        <ExternalLinkIcon />
                        <span>live</span>
                      </a>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 sm:space-x-2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 font-mono text-sm sm:text-base"
                        aria-label={`View ${project.name} source code on GitHub`}
                      >
                        <GitHubIcon />
                        <span>code</span>
                      </a>
                    </nav>

                    {/* Status indicator */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"
                        aria-hidden="true"
                      ></div>
                      <span className="text-white text-xs font-mono">
                        active
                      </span>
                    </div>
                  </footer>
                </div>
              </div>

              {/* Glow effect on hover */}
              <div
                className={`absolute inset-0 rounded-lg sm:rounded-xl transition-all duration-300 pointer-events-none ${
                  hoveredIndex === globalIndex
                    ? "shadow-xl sm:shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/20"
                    : ""
                }`}
                aria-hidden="true"
              ></div>
            </article>
          );
        })}
      </div>

      {/* Navigation Controls - Mobile responsive */}
      <nav
        className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-8 space-y-4 sm:space-y-0"
        aria-label="Pagination"
      >
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`flex items-center space-x-2 px-3 py-2 sm:px-4 rounded-lg border font-mono text-xs sm:text-sm transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start ${
            currentPage === 0
              ? "border-gray-700/50 text-gray-600 cursor-not-allowed"
              : "border-blue-500/30 text-white hover:border-cyan-400 hover:bg-blue-500/10 hover:scale-105"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
          <span>prev</span>
        </button>

        {/* Terminal-style page info - Mobile responsive */}
        <div
          className="px-3 py-2 sm:px-6 sm:py-3 bg-gray-900/30 backdrop-blur-sm border border-blue-500/20 rounded-lg w-full sm:w-auto"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-white">~/projects</span>
              <span className="text-gray-500" aria-hidden="true">
                $
              </span>
            <span className="text-gray-400 hidden sm:inline">
                srinivasrc.dev
              </span>
            </div>
            <div className="flex-1 hidden sm:block"></div>
            <span className="text-white/60">
              {startIndex + 1}-
              {Math.min(startIndex + projectsPerPage, projectsData.length)} of{" "}
              {projectsData.length}
            </span>
          </div>
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className={`flex items-center space-x-2 px-3 py-2 sm:px-4 rounded-lg border font-mono text-xs sm:text-sm transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start ${
            currentPage === totalPages - 1
              ? "border-gray-700/50 text-gray-600 cursor-not-allowed"
              : "border-blue-500/30 text-white hover:border-cyan-400 hover:bg-blue-500/10 hover:scale-105"
          }`}
          aria-label="Next page"
        >
          <span>next</span>
          <ChevronRightIcon />
        </button>
      </nav>

      {/* Detail modal — full project write-up on click */}
      <AnimatePresence>
        {detailProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => setDetailProject(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${detailProject.name} details`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/80 font-mono shadow-[0_0_60px_rgba(var(--theme-accent-rgb),0.18)] backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-44 shrink-0 overflow-hidden">
                <SmartImage
                  src={detailProject.imageUrl}
                  alt={`${detailProject.name} screenshot`}
                  fill
                  sizes="512px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <button
                  type="button"
                  onClick={() => setDetailProject(null)}
                  aria-label="Close details"
                  className="absolute right-3 top-3 rounded-md bg-black/50 p-1.5 text-white/80 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white">
                  {detailProject.name}
                </h3>
              </div>
              <div className="space-y-4 overflow-y-auto px-5 py-4">
                <div className="flex flex-wrap gap-1.5" aria-label="Tech stack">
                  {detailProject.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[rgba(var(--theme-accent-rgb),0.3)] bg-[rgba(var(--theme-accent-rgb),0.08)] px-2 py-0.5 text-[11px] text-white/90"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-gray-200">
                  {detailProject.description}
                </p>
                <div className="flex gap-3 pt-1">
                  <a
                    href={detailProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.5)] bg-[rgba(var(--theme-accent-rgb),0.12)] px-3 py-2 text-sm text-white transition-all hover:bg-[rgba(var(--theme-accent-rgb),0.22)] active:scale-95"
                  >
                    <GitHubIcon /> View Code
                  </a>
                  {detailProject.liveUrl && detailProject.liveUrl !== "#" && (
                    <a
                      href={detailProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white transition-all hover:bg-white/10 active:scale-95"
                    >
                      <ExternalLinkIcon /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
