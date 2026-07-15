import React, { useState, useEffect } from "react";
import { TypewriterText, MatrixRain } from "@/components/TerminalComp/effects";
import {
  DEFAULT_SUMMARY,
  SETTINGS_UPDATED_EVENT,
  loadSettings,
} from "@/lib/cms";

// Enhanced SVG Icons with hover animations - Mobile responsive
const CodeIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 sm:w-8 sm:h-8 mb-1.5 sm:mb-2 text-white group-hover:text-white transition-all duration-300 group-hover:scale-110"
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const SystemIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 sm:w-8 sm:h-8 mb-1.5 sm:mb-2 text-white group-hover:text-white transition-all duration-300 group-hover:scale-110"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);


const About: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  // Admin-editable professional summary (falls back to the built-in default).
  const [summary, setSummary] = useState<string>(DEFAULT_SUMMARY);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 0);
    const syncSummary = () =>
      setSummary(loadSettings().summary?.trim() || DEFAULT_SUMMARY);
    syncSummary();
    window.addEventListener(SETTINGS_UPDATED_EVENT, syncSummary);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, syncSummary);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Matrix background effect */}
      <MatrixRain />

      {/* Main content - Mobile responsive container */}
      <div
        className={`relative z-10 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 transition-all duration-1000 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Terminal header - Mobile responsive */}
        <div className="mb-6 sm:mb-8 border border-cyan-800 bg-black/50 backdrop-blur-sm rounded-lg p-3 sm:p-4">
          <div>
            <span className="text-white font-mono text-sm sm:text-base">
              <TypewriterText text="Loading developer profile..." delay={50} />
            </span>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {/* About Me Section - Mobile optimized */}
          <section className="border border-cyan-800/30 bg-gradient-to-br from-cyan-900/10 to-black/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-cyan-900/20 hover:shadow-cyan-900/40 transition-all duration-500">
            <div className="flex items-center mb-4 sm:mb-6">
              <span className="text-white font-mono mr-2 sm:mr-4"></span>
              <h2 className="text-lg sm:text-2xl text-white font-bold font-mono tracking-wider">
                ABOUT_ME.exe
              </h2>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="ml-3 sm:ml-6 border-l-2 border-cyan-800/30 pl-3 sm:pl-6">
              <p className="whitespace-pre-line text-gray-300 leading-relaxed text-sm sm:text-base font-light">
                {summary}
              </p>

              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
                {[
                  "Python",
                  "Machine Learning",
                  "Deep Learning",
                  "LLMs",
                  "Agentic AI",
                  "MLOps",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 sm:px-3 bg-cyan-900/30 border border-cyan-800/50 rounded-full text-white text-xs sm:text-sm font-mono hover:bg-cyan-800/30 transition-colors duration-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Education Section - Mobile optimized */}
          <section className="border border-cyan-800/30 bg-gradient-to-br from-cyan-900/10 to-black/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-cyan-900/20 hover:shadow-cyan-900/40 transition-all duration-500">
            <div className="flex items-center mb-4 sm:mb-6">
              <span className="text-white font-mono mr-2 sm:mr-4"></span>
              <h2 className="text-lg sm:text-2xl text-white font-bold font-mono tracking-wider">
                EDUCATION.log
              </h2>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="ml-3 sm:ml-6 border-l-2 border-cyan-800/30 pl-3 sm:pl-6 space-y-6">
              {/* REVA University */}
              <div className="border-b border-cyan-800/20 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-white font-semibold text-base sm:text-lg font-mono">
                    REVA University, Bengaluru
                  </h3>
                  <span className="text-gray-400 text-sm font-mono">
                    2023 — 2027
                  </span>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  B.Tech in Artificial Intelligence &amp; Machine Learning.
                </p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-cyan-900/30 border border-cyan-800/50 rounded-full text-white text-xs font-mono">
                    CGPA: 7.5
                  </span>
                </div>
              </div>

              {/* PUC */}
              <div className="border-b border-cyan-800/20 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-white font-semibold text-base sm:text-lg font-mono">
                    MES College — PUC (PCMB)
                  </h3>
                  <span className="text-gray-400 text-sm font-mono">2023</span>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  Pre-University, PCMB. Bengaluru.
                </p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-cyan-900/30 border border-cyan-800/50 rounded-full text-white text-xs font-mono">
                    82.5%
                  </span>
                </div>
              </div>

              {/* ICSE */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-white font-semibold text-base sm:text-lg font-mono">
                    Mount Senoria School — ICSE (Class X)
                  </h3>
                  <span className="text-gray-400 text-sm font-mono">2021</span>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  Bengaluru.
                </p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-cyan-900/30 border border-cyan-800/50 rounded-full text-white text-xs font-mono">
                    88.8%
                  </span>
                </div>
              </div>
            </div>
          </section>


          {/* Current focus - Mobile responsive grid */}
          <section>
            <div className="flex items-center mb-6 sm:mb-8">
              <span className="text-white font-mono mr-2 sm:mr-4"></span>
              <h2 className="text-lg sm:text-2xl text-white font-bold font-mono tracking-wider">
                CURRENT_FOCUS.log
              </h2>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Responsive grid: 1 column on mobile, 2 on tablet+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Agentic AI systems card */}
              <div className="group border border-cyan-800/40 bg-gradient-to-br from-cyan-900/20 to-black/80 backdrop-blur-sm p-3 sm:p-5 rounded-xl hover:border-cyan-400/60 transition-all duration-500 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl hover:shadow-cyan-900/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <CodeIcon />
                  </div>
                  <h3 className="font-bold text-white text-base sm:text-lg mb-2 font-mono">
                    Agentic AI Systems
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    Building autonomous agents with{" "}
                    <span className="text-white font-semibold">LLMs</span> and{" "}
                    <span className="text-white font-semibold">
                      agentic frameworks
                    </span>
                    , and constantly exploring the{" "}
                    <span className="text-white font-semibold">
                      open-source ecosystem
                    </span>{" "}
                    on GitHub — new frameworks, plugins, and developer tooling —
                    then turning those experiments into production-grade,
                    AI-powered web applications.
                  </p>
                </div>
              </div>

              {/* System design + automation card */}
              <div className="group border border-cyan-800/40 bg-gradient-to-br from-cyan-900/20 to-black/80 backdrop-blur-sm p-3 sm:p-5 rounded-xl hover:border-cyan-400/60 transition-all duration-500 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl hover:shadow-cyan-900/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <SystemIcon />
                  </div>
                  <h3 className="font-bold text-white text-base sm:text-lg mb-2 font-mono">
                    Linux System Optimization
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    Daily-driving and tuning{" "}
                    <span className="text-white font-semibold">
                      CachyOS
                    </span>{" "}
                    (Arch Linux), digging into system administration and
                    performance optimization, and using AI tooling to automate
                    repetitive work from my day-to-day flow.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Status footer - Mobile responsive */}
          <div className="mt-8 sm:mt-12 border-t border-cyan-800/30 pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white/70 font-mono text-xs sm:text-sm space-y-2 sm:space-y-0">
              <span>Status: Ready for new challenges</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes matrix-fall {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
};

export default About;
