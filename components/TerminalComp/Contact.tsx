import React, { useState, useEffect } from "react";
import WindowDots from "@/components/WindowDots";
import {
  socialLinks as socialLinkData,
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  RESUME_URL,
  FEEDBACK_EMAIL,
  FEEDBACK_SUBJECT,
  FEEDBACK_BODY,
} from "@/lib/portfolio-data";

// Type definitions
interface SocialLink {
  icon: React.FC;
  name: string;
  href: string;
  color: string;
}

// Pre-addressed feedback mail link (recipient + subject + prompt-filled body).
const FEEDBACK_MAILTO = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
  FEEDBACK_SUBJECT
)}&body=${encodeURIComponent(FEEDBACK_BODY)}`;

const SteamIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:scale-110"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="15.5" cy="8.5" r="2.5" />
    <circle cx="8.5" cy="15" r="2" />
    <path d="m13.7 10.5-4 3.2" />
  </svg>
);

const FeedbackIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:scale-110"
    aria-hidden="true"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
  </svg>
);

// --- Enhanced SVG Icons with hover effects ---
const MailIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:stroke-cyan-400 group-hover:scale-110"
    aria-hidden="true"
  >
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const LocationIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:stroke-cyan-400 group-hover:scale-110"
    aria-hidden="true"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const YoutubeIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:stroke-red-400 group-hover:scale-110"
    aria-hidden="true"
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const TwitterIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:stroke-blue-400 group-hover:scale-110"
    aria-hidden="true"
  >
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
);

const InstagramIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:stroke-pink-400 group-hover:scale-110"
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const LinkedinIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:stroke-blue-500 group-hover:scale-110"
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect width="4" height="12" x="2" y="9"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GithubIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:stroke-purple-400 group-hover:scale-110"
    aria-hidden="true"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const LeetcodeIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:stroke-yellow-400 group-hover:scale-110"
    aria-hidden="true"
  >
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" x2="20" y1="19" y2="19"></line>
  </svg>
);

const ResumeIcon: React.FC = () => (
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
    className="transition-all duration-300 group-hover:stroke-orange-400 group-hover:scale-110"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7,10 12,15 17,10"></polyline>
    <line x1="12" x2="12" y1="15" y2="3"></line>
  </svg>
);

// Enhanced Contact component with animations and mobile responsiveness
const Contact: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [headerVisible, setHeaderVisible] = useState<boolean>(false);
  const [contentVisible, setContentVisible] = useState<boolean>(false);
  const [socialsVisible, setSocialsVisible] = useState<boolean>(false);

  // Staggered entrance animations
  useEffect(() => {
    const timer1 = setTimeout(() => setMounted(true), 100);
    const timer2 = setTimeout(() => setHeaderVisible(true), 300);
    const timer3 = setTimeout(() => setContentVisible(true), 600);
    const timer4 = setTimeout(() => setSocialsVisible(true), 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleEmailClick = async (
    e: React.MouseEvent<HTMLDivElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
  };

  // Link metadata (name/href/color) is shared; icons stay local to this pane.
  const socialIcons: Record<string, React.FC> = {
    YouTube: YoutubeIcon,
    "Twitter / X": TwitterIcon,
    Instagram: InstagramIcon,
    "Instagram (Personal)": InstagramIcon,
    LinkedIn: LinkedinIcon,
    GitHub: GithubIcon,
    LeetCode: LeetcodeIcon,
    Steam: SteamIcon,
  };

  const socialLinks: SocialLink[] = socialLinkData
    .filter((link) => socialIcons[link.name])
    .map((link) => ({ ...link, icon: socialIcons[link.name] }));

  return (
    <div className="text-white max-w-5xl mx-auto p-3 sm:p-6 relative min-h-screen flex items-center">
      {/* Background gradient effects with animation */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-out ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 rounded-3xl blur-xl"></div>
        <div className="absolute -top-4 -left-4 w-24 h-24 sm:w-32 sm:h-32 bg-cyan-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 sm:w-40 sm:h-40 bg-cyan-400/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <article
        className={`relative w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
      >
        {/* Header with terminal styling - Animated */}
        <header
          className={`flex items-center mb-6 sm:mb-8 transition-all duration-500 ease-out ${headerVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
            }`}
        >
          <WindowDots
            size="h-2.5 w-2.5 sm:h-3 sm:w-3"
            gap="gap-1.5 sm:gap-2"
            className="mr-3 sm:mr-4"
          />
          <h2 className="text-lg sm:text-2xl font-mono text-white font-bold tracking-wider">
            <span className="text-gray-500">$</span> contact --connect
          </h2>
        </header>

        {/* Terminal cursor animation */}
        <div
          className={`mb-4 sm:mb-6 transition-all duration-500 ease-out delay-200 ${headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
            }`}
        >
          <p className="text-gray-300 font-mono text-xs sm:text-sm leading-relaxed">
            <span className="text-white">&gt;</span> Establishing secure
            connection...
            <span
              className="inline-block w-1.5 h-3 sm:w-2 sm:h-4 bg-cyan-400 ml-1 animate-pulse"
              aria-hidden="true"
            ></span>
          </p>
          <p className="text-gray-400 font-mono text-xs sm:text-sm mt-1 sm:mt-2">
            Ready to collaborate on innovative projects and opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* Direct Contact Section - Animated */}
          <section
            className={`space-y-4 sm:space-y-6 transition-all duration-600 ease-out ${contentVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-6"
              }`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-xl font-mono text-white font-semibold">
                {"//"} Direct.Contact
              </h3>
            </div>

            {/* Email with copy functionality */}
            <div
              onClick={handleEmailClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleEmailClick(
                    e as unknown as React.MouseEvent<HTMLDivElement>
                  );
                }
              }}
              className="group relative p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-400/20 active:scale-[0.98]"
              aria-label={`Click to copy email address: ${CONTACT_EMAIL}`}
            >
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-cyan-400/20 to-cyan-400/20 rounded-lg mr-3 sm:mr-4 group-hover:from-cyan-400/30 group-hover:to-cyan-400/30 transition-all duration-300">
                  <MailIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm font-mono">
                    EMAIL
                  </p>
                  <p className="text-white font-mono text-sm sm:text-base group-hover:text-white transition-colors duration-300 truncate">
                    {CONTACT_EMAIL}
                  </p>
                  {copiedEmail && (
                    <p
                      className="text-white text-xs font-mono animate-fade-in"
                      role="status"
                      aria-live="polite"
                    >
                      ✓ Copied to clipboard
                    </p>
                  )}
                </div>
                <div
                  className="text-gray-500 group-hover:text-white transition-colors duration-300 flex-shrink-0"
                  aria-hidden="true"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="group relative p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg mr-3 sm:mr-4 group-hover:from-blue-400/30 group-hover:to-purple-400/30 transition-all duration-300">
                  <LocationIcon />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-mono">
                    LOCATION
                  </p>
                  <p className="text-white font-mono text-sm sm:text-base group-hover:text-white transition-colors duration-300">
                    {CONTACT_LOCATION}
                  </p>
                </div>
              </div>
            </div>

            {/* Resume Button */}
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-orange-400/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-400/20 active:scale-[0.98] block"
              aria-label="Download resume (opens in new tab)"
            >
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-lg mr-3 sm:mr-4 group-hover:from-orange-400/30 group-hover:to-red-400/30 transition-all duration-300">
                  <ResumeIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm font-mono">
                    RESUME
                  </p>
                  <p className="text-white font-mono text-sm sm:text-base group-hover:text-orange-400 transition-colors duration-300">
                    Download CV
                  </p>
                </div>
                <div
                  className="text-gray-500 group-hover:text-orange-400 transition-colors duration-300 flex-shrink-0"
                  aria-hidden="true"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" x2="12" y1="15" y2="3"></line>
                  </svg>
                </div>
              </div>
            </a>
          </section>

          {/* Social Links Section - Animated */}
          <section
            className={`space-y-4 sm:space-y-6 transition-all duration-600 ease-out delay-300 ${socialsVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-6"
              }`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-xl font-mono text-white font-semibold">
                {"//"} Social.Links
              </h3>
            </div>

            <nav
              className="grid grid-cols-1 gap-3 sm:gap-4"
              aria-label="Social media links"
            >
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg hover:shadow-cyan-400/10 active:scale-[0.98] ${socialsVisible ? "animate-fade-in-up" : ""
                    }`}
                  style={{
                    animationDelay: `${index * 100 + 400}ms`,
                  }}
                  aria-label={`Visit ${social.name} profile (opens in new tab)`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="rounded-lg p-2 transition-all duration-300 group-hover:scale-110"
                      style={{
                        color: social.color,
                        background: `${social.color}1f`,
                        boxShadow: `0 0 0 1px ${social.color}33`,
                      }}
                    >
                      <social.icon />
                    </div>
                    <span className="font-mono text-sm sm:text-base text-white/80 transition-colors duration-300 group-hover:text-white">
                      {social.name}
                    </span>
                  </div>

                  {/* Hover effect overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"
                    aria-hidden="true"
                  ></div>
                </a>
              ))}
            </nav>
          </section>
        </div>

        {/* Feedback CTA — opens the mail app, pre-addressed with subject + body */}
        <a
          href={FEEDBACK_MAILTO}
          className={`group mt-6 sm:mt-8 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-[rgba(var(--theme-accent-rgb),0.4)] bg-[rgba(var(--theme-accent-rgb),0.08)] px-4 py-3 font-mono text-sm text-white transition-all duration-300 hover:bg-[rgba(var(--theme-accent-rgb),0.18)] hover:shadow-[0_0_18px_rgba(var(--theme-accent-rgb),0.35)] active:scale-[0.98] ${
            socialsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ color: "var(--theme-accent)", transitionDelay: "450ms" }}
          aria-label="Send feedback by email"
        >
          <FeedbackIcon />
          <span className="font-semibold">Send Feedback</span>
          <span className="text-white/50">— opens your mail app</span>
        </a>

        {/* Terminal status bar - Animated */}
        <footer
          className={`mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 transition-all duration-700 ease-out delay-500 ${socialsVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
            }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm font-mono space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-white">✓ Srinivas RC </span>
              <span
                className="text-gray-500 hidden sm:inline"
                aria-hidden="true"
              >
                |
              </span>
              <span className="text-gray-400">Response time: &lt;100ms</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                aria-hidden="true"
              ></div>
              <span className="text-gray-400">Online</span>
            </div>
          </div>
        </footer>
      </article>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Mobile touch improvements */
        @media (hover: none) {
          .group:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;
