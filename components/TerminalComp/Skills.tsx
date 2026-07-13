"use client";

import React, { useState, useEffect } from "react";
import {
  skills as skillsData,
  skillCommands as terminalCommands,
  type SkillsCategory,
} from "@/lib/portfolio-data";

// Type definitions

interface CategoryConfig {
  key: keyof SkillsCategory;
  title: string;
  icon: React.ReactNode;
  skills: string[];
}

interface TerminalWindowProps {
  title: string;
  command: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

interface SkillBadgeProps {
  skill: string;
  delay?: number;
}

interface TypewriterResult {
  displayText: string;
  isComplete: boolean;
}


// --- Enhanced SVG Icons ---
const CodeIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M8.7 15.9L4.8 12l3.9-3.9c.39-.39.39-1.01 0-1.4s-1.01-.39-1.4 0l-4.59 4.59c-.39.39-.39 1.02 0 1.41l4.59 4.6c.39.39 1.01.39 1.4 0 .39-.39.39-1.01 0-1.41zm6.6 0l3.9-3.9-3.9-3.9c-.39-.39-.39-1.01 0-1.4s1.01-.39 1.4 0l4.59 4.59c.39.39.39 1.02 0 1.41l-4.59 4.6c-.39.39-1.01.39-1.4 0-.39-.39-.39-1.01 0-1.41z" />
  </svg>
);

const LayersIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z" />
  </svg>
);

const ToolIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
  </svg>
);

const BrainIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

// Typing animation hook
const useTypewriter = (text: string, speed: number = 50): TypewriterResult => {
  const [displayText, setDisplayText] = useState<string>("");
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    setDisplayText("");
    setIsComplete(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => prev + text.charAt(i));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Terminal window component
const TerminalWindow: React.FC<TerminalWindowProps> = ({
  title,
  command,
  children,
  isActive,
  onClick,
}) => {
  const { displayText, isComplete } = useTypewriter(command, 30);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      className={`relative overflow-hidden rounded-lg transition-all duration-500 cursor-pointer transform hover:scale-[1.02] ${
        isActive
          ? "bg-black/40 backdrop-blur-xl border border-cyan-400/50 shadow-lg shadow-cyan-400/20"
          : "bg-black/20 backdrop-blur-md border border-cyan-400/20 hover:border-cyan-400/40"
      }`}
      aria-label={`${title} skills terminal ${isActive ? "active" : ""}`}
      aria-pressed={isActive}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between p-3 bg-black/30 border-b border-cyan-400/20">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500/80"></div>
          </div>
          <span className="text-white text-sm font-mono ml-2">
            ~ {title}
          </span>
        </div>
        <div
          className={`w-2 h-2 rounded-full ${
            isActive ? "bg-cyan-400 animate-pulse" : "bg-cyan-400/30"
          }`}
          aria-hidden="true"
        ></div>
      </div>

      {/* Terminal content */}
      <div className="p-4 space-y-3">
        {/* Command line */}
        <div className="flex items-center space-x-2 text-white font-mono text-sm">
          <span className="text-white" aria-hidden="true">
            $
          </span>
          <span className={isActive ? "text-white" : "text-white/60"}>
            {isActive ? displayText : command}
          </span>
          {isActive && !isComplete && (
            <span
              className="w-2 h-4 bg-cyan-400 animate-pulse"
              aria-hidden="true"
            ></span>
          )}
        </div>

        {/* Skills output */}
        {isActive && isComplete && (
          <div
            className="space-y-2 animate-fade-in"
            role="region"
            aria-live="polite"
          >
            {children}
          </div>
        )}
      </div>

      {/* Glow effect */}
      {isActive && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-cyan-400/10 pointer-events-none"
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

// Skill badge component
const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span
      className={`inline-block transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } bg-gradient-to-r from-cyan-400/20 to-cyan-400/20 backdrop-blur-sm 
      text-white text-xs font-mono py-1.5 px-3 rounded-md border border-cyan-400/30
      hover:border-cyan-400/60 hover:bg-cyan-400/10 hover:text-white cursor-pointer
      hover:shadow-md hover:shadow-cyan-400/20`}
      role="listitem"
    >
      {skill}
    </span>
  );
};

// Matrix-like background effect
const MatrixBackground: React.FC = () => {
  // Generate random positions and delays once on component initialization
  const [particles] = useState(() =>
    [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 3,
      text: Math.random().toString(36).substring(7),
    }))
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden opacity-10"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-emerald-900/20"></div>
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute text-white font-mono text-xs animate-pulse"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`,
          }}
        >
          {particle.text}
        </div>
      ))}
    </div>
  );
};

// Main Skills component
const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] =
    useState<keyof SkillsCategory>("languages");
  const [terminalStarted, setTerminalStarted] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setTerminalStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const categories: CategoryConfig[] = [
    {
      key: "languages",
      title: "Languages",
      icon: <CodeIcon />,
      skills: skillsData.languages,
    },
    {
      key: "ai_ml",
      title: "AI / ML",
      icon: <BrainIcon />,
      skills: skillsData.ai_ml,
    },
    {
      key: "frameworks",
      title: "Frameworks / Agentic",
      icon: <LayersIcon />,
      skills: skillsData.frameworks,
    },
    {
      key: "tools",
      title: "OS & Tools",
      icon: <ToolIcon />,
      skills: skillsData.tools,
    },
  ];

  return (
    <section className="relative p-6" aria-label="Technical skills">
      <MatrixBackground />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1
            className={`text-4xl md:text-6xl font-bold font-mono transition-all duration-1000 ${
              terminalStarted
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-8"
            }`}
          >
            <span className="text-white" aria-hidden="true">
              {"<"}
            </span>
            <span className="text-white"> TECH STACK </span>
            <span className="text-white" aria-hidden="true">
              {"/>"}
            </span>
          </h1>
          <div
            className={`mt-4 text-white/80 font-mono transition-all duration-1000 delay-300 ${
              terminalStarted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-white" aria-hidden="true">
              $
            </span>{" "}
            ./skills --interactive --display-all
          </div>
        </header>

        {/* Terminal Windows Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="tablist"
          aria-label="Skill categories"
        >
          {categories.map((category, index) => (
            <div
              key={category.key}
              className={`transition-all duration-500 ${
                terminalStarted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
              role="tab"
              aria-selected={activeCategory === category.key}
            >
              <TerminalWindow
                title={category.title}
                command={terminalCommands[category.key]}
                isActive={activeCategory === category.key}
                onClick={() => setActiveCategory(category.key)}
              >
                <div className="flex items-center space-x-2 text-white mb-3">
                  {category.icon}
                  <span className="font-mono text-sm">
                    {category.title.toLowerCase()}_modules:
                  </span>
                </div>
                <div
                  className="flex flex-wrap gap-2"
                  role="list"
                  aria-label={`${category.title} skills`}
                >
                  {category.skills.map((skill, skillIndex) => (
                    <SkillBadge
                      key={skill}
                      skill={skill}
                      delay={skillIndex * 100}
                    />
                  ))}
                </div>
              </TerminalWindow>
            </div>
          ))}
        </div>

        <footer
          className={`text-center mt-12 transition-all duration-1000 delay-1000 ${
            terminalStarted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-white/60 font-mono text-sm">
            <span className="text-white" aria-hidden="true">
              └─$
            </span>{" "}
            Click on any terminal to explore skills
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};

export default Skills;
