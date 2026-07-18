/**
 * Virtual filesystem and builtin command helpers for the portfolio terminal.
 * In-memory only; maps to portfolio sections and flavor content.
 */

export const HOME_DIR = [
  "about",
  "projects",
  "skills",
  "experience",
  "education",
  "certificates",
  "contact",
  "welcome",
  "README",
] as const;

export type HomeDirEntry = (typeof HOME_DIR)[number];

export const FILE_CONTENTS: Record<string, string> = {
  about:
    "About Srinivas RC — AI / ML Engineer. B.Tech AI & ML undergraduate building web applications powered by LLMs and agentic systems. Passionate about Linux (CachyOS). Type 'cd about' to open the full section.",
  projects:
    "Recent projects: Archagent (autonomous AI agent for architecture & interior design) and Language Detector (single-page ML web app). Type 'cd projects' to browse with links and descriptions.",
  skills:
    "Tech: Python, Machine Learning, Large Language Models (LLMs), Agentic Frameworks (CrewAI), Prompt Engineering, Linux Administration. Type 'cd skills' to see all.",
  experience:
    "Independent project work — building agentic AI systems and ML web apps. Open to internships and university placements. Type 'cd experience' for details.",
  contact:
    "Get in touch: email, GitHub. Type 'cd contact' for links and copy-paste.",
  education:
    "B.Tech in Artificial Intelligence & Machine Learning, REVA University. Type 'education' for details.",
  certificates:
    "Certifications and credentials. Type 'certificates' to view (managed via the admin panel).",
  welcome:
    "Hi, I'm Srinivas RC. Welcome to my portfolio terminal. Type 'help' or 'ls' for commands.",
  README:
    "Portfolio terminal — Srinivas RC. Commands: help, about, projects, skills, experience, education, certificates, contact, resume, ai <question>, play archman, admin, clear. Type 'help' for the full menu.",
};

/** Format ls -l style: permissions, fake size, date, name */
export function formatLsLong(entries: readonly string[]): string {
  const now = new Date();
  const mon = now.toLocaleString("en-US", { month: "short" });
  const day = now.getDate();
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return entries
    .map((name) => `drwxr-xr-x  2 srinivas srinivas 4096 ${mon} ${day} ${time} ${name}`)
    .join("\n");
}

/** Manual pages for the commands the terminal still ships. */
export const MAN_PAGES: Record<string, string> = {
  help: "help — Display list of available commands and short descriptions.",
  about: "about — Open the about section.",
  projects: "projects — Browse my AI and web projects.",
  skills: "skills — Show my technical stack.",
  experience: "experience — Show my professional experience.",
  education: "education — Show my academic background.",
  certificates: "certificates — Show my certifications.",
  contact: "contact — Show my contact information.",
  resume: "resume — View or download my resume PDF.",
  admin: "admin — Open the secure admin panel login.",
  play: "play archman — Launch ARCH-MAN, the terminal maze game.",
  ls: "ls [ -l | -a | -la ] — List directory contents. -l long format, -a include hidden.",
  cd: "cd [dir] — Change directory. Sections: about, projects, skills, experience, education, certificates, contact, welcome.",
  cat: "cat <file> — Print file contents. Files: about, projects, skills, experience, education, certificates, contact, welcome, README.",
  whoami: "whoami — Print current username.",
  hostname: "hostname — Print system hostname.",
  id: "id — Print user and group IDs.",
  uname: "uname [ -a ] — Print system info. -a for all.",
  date: "date — Print current date and time.",
  echo: "echo [text] — Print arguments.",
  history: "history — List recent commands.",
  man: "man <command> — Show manual for command.",
  clear: "clear — Clear terminal screen.",
  exit: "exit — Close tab (flavor).",
  ai: "ai <question> — Chat with portfolio AI assistant (rate limited).",
  neofetch: "neofetch — Display system info and ASCII logo.",
  sudo: "sudo <command> — Execute a command as another user.",
  touch: "touch <file> — Change file timestamps / create empty file.",
  mkdir: "mkdir <dir> — Make directories.",
  rm: "rm <file> — Remove files or directories.",
  rmdir: "rmdir <dir> — Remove empty directories.",
  mv: "mv <src> <dst> — Move (rename) files.",
  cp: "cp <src> <dst> — Copy files and directories.",
  vim: "vim <file> — Vi IMproved, a programmer's text editor.",
  vi: "vi <file> — A screen-oriented text editor.",
  nano: "nano <file> — Nano's ANOther editor, a small text editor.",
  emacs: "emacs <file> — The extensible, customizable text editor.",
  apt: "apt <command> — Package manager for Debian-based systems.",
  "apt-get": "apt-get <command> — APT package handling utility.",
  pacman: "pacman <command> — Package manager for Arch Linux.",
  yum: "yum <command> — Package manager for RPM-based systems.",
  halt: "halt — Halt the machine.",
  reboot: "reboot — Reboot the machine.",
  shutdown: "shutdown — Power off the machine.",
  poweroff: "poweroff — Power off the machine.",
};

/** Data backing the neofetch panel. */
export function getNeofetchData(user: string, host: string) {
  return {
    user: `${user}@${host}`,
    host,
    os: "Portfolio Terminal",
    kernel: "TypeScript (Next.js)",
    uptime: "Always on",
    shell: "/bin/bash",
    theme: "Green on dark",
  };
}
