"use client";

import React, { useState, useEffect } from "react";
import { TypewriterText, MatrixRain } from "@/components/TerminalComp/effects";

const Experience: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <MatrixRain />

      <div
        className={`relative z-10 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 transition-all duration-150 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Terminal header */}
        <div className="mb-6 sm:mb-8 border border-cyan-800 bg-black/50 backdrop-blur-sm rounded-lg p-3 sm:p-4">
          <div>
            <span className="text-white font-mono text-sm sm:text-base">
              <TypewriterText text="Loading experience..." delay={50} />
            </span>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-12">
          {/* Experience Section */}
          <section className="border border-cyan-800/30 bg-gradient-to-br from-cyan-900/10 to-black/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-150">
            <div className="flex items-center mb-4 sm:mb-6">
              <span className="text-white font-mono mr-2 sm:mr-4"></span>
              <h2 className="text-lg sm:text-2xl text-white font-bold font-mono tracking-wider">
                EXPERIENCE.log
              </h2>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              </div>
            </div>

            <div className="ml-3 sm:ml-6 border-l-2 border-cyan-800/30 pl-3 sm:pl-6 space-y-8">
              {/* Independent project work */}
              <div>
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-base sm:text-lg font-mono">
                      Independent Project Work
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Self-directed · Ongoing
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Bengaluru, Karnataka, India
                    </p>
                  </div>
                </div>

                {/* Nested entries with vertical timeline */}
                <ol className="relative border-l-2 border-cyan-800/30 ml-5 sm:ml-7 space-y-6">
                  {/* Archagent */}
                  <li className="pl-4 sm:pl-5 relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-cyan-400 ring-2 ring-black"
                    />
                    <h4 className="text-white font-semibold text-sm sm:text-base font-mono">
                      Archagent — Autonomous AI Agent
                    </h4>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Agentic systems
                    </p>

                    <ul className="mt-3 list-disc list-outside space-y-1 text-gray-300 text-sm sm:text-base ml-4 sm:ml-5">
                      <li>
                        Designed and built an autonomous AI agent that handles
                        architecture and interior design tasks end to end.
                      </li>
                      <li>
                        Applied agentic frameworks (CrewAI), LLM orchestration,
                        and prompt engineering to a real-world domain.
                      </li>
                    </ul>
                  </li>

                  {/* Language Detector */}
                  <li className="pl-4 sm:pl-5 relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-black border-2 border-cyan-700"
                    />
                    <h4 className="text-white font-semibold text-sm sm:text-base font-mono">
                      Language Detector — ML Web App
                    </h4>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Machine learning
                    </p>

                    <ul className="mt-3 list-disc list-outside space-y-1 text-gray-300 text-sm sm:text-base ml-4 sm:ml-5">
                      <li>
                        Built a minimalist, single-page language detection web
                        application requiring no login.
                      </li>
                      <li>
                        Focused on a friction-free user experience: paste text,
                        get the language — nothing else in the way.
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>

              {/* Open to opportunities */}
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-base sm:text-lg font-mono">
                      Open to Opportunities
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Internships · University placements
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      B.Tech AI &amp; ML · REVA University
                    </p>
                  </div>
                </div>

                <ul className="mt-3 list-disc list-outside space-y-1 text-gray-300 text-sm sm:text-base ml-9 sm:ml-12">
                  <li>
                    Seeking roles in AI engineering — building and deploying
                    applications powered by LLMs and agentic systems.
                  </li>
                  <li>
                    Comfortable across the stack that matters for applied AI:
                    Python, machine learning, prompt engineering, and Linux.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Status footer */}
          <div className="mt-8 sm:mt-12 border-t border-cyan-800/30 pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white/70 font-mono text-xs sm:text-sm space-y-2 sm:space-y-0">
              <span>Status: Ready for new challenges</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
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

export default Experience;
