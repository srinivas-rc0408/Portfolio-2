# 🖥️ Portfolio.sh

A modern, interactive terminal-themed portfolio website built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Features a unique terminal interface with matrix-style animations and AI-powered chat functionality.

[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](http://localhost:3000/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

## 🌟 Features

- **Terminal Interface**: Unique command-line style navigation system
- **Matrix Animations**: Cyberpunk-inspired visual effects with falling code
- **AI Chat Integration**: Powered by Google Gemini AI for interactive conversations
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices
- **SEO Optimized**: Enhanced with custom sitemap.xml and robots.txt for better search engine visibility
- **Type-Safe**: Built with TypeScript for robust code quality
- **Modern Stack**: Leveraging the latest Next.js 16 App Router and React 19
- **Dark Theme**: Eye-friendly terminal-inspired dark mode
- **Smooth Animations**: Typewriter effects, hover animations, and transitions

## 🚀 Live Demo

Visit the live site: [Your Vercel URL](http://localhost:3000/)

## 📸 Screenshots

<!-- Add screenshots of your portfolio here -->

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16.0](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 19.2](https://react.dev/) - Latest React with enhanced performance
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) - Utility-first CSS framework

### Backend & AI

- **API Routes**: Next.js API routes for server-side logic
- **AI Integration**: [Google Generative AI (Gemini)](https://ai.google.dev/) - AI-powered chat functionality

### Development Tools

- **Linting**: ESLint with Next.js config
- **PostCSS**: Modern CSS processing with Tailwind

## 📁 Project Structure

```
portfolio.sh/
├── app/                          # Next.js App Router directory
│   ├── about/                    # About page
│   │   └── page.tsx
│   ├── api/                      # API routes
│   │   └── chat/                 # AI chat endpoint
│   │       └── route.ts
│   ├── contact/                  # Contact page
│   │   └── page.tsx
│   ├── projects/                 # Projects showcase page
│   │   └── page.tsx
│   ├── skills/                   # Skills page
│   │   └── page.tsx
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Home page
│   ├── robots.ts                 # SEO: robots.txt configuration
│   └── sitemap.ts                # SEO: sitemap.xml generation
├── components/                   # React components
│   ├── IdentityComp.tsx          # Identity/profile component
│   ├── TerminalComp.tsx          # Main terminal component
│   └── TerminalComp/             # Terminal sub-components
│       ├── About.tsx             # About section component
│       ├── Contact.tsx           # Contact section component
│       ├── Projects.tsx          # Projects section component
│       └── Skills.tsx            # Skills section component
├── public/                       # Static assets
│   ├── css/                      # Additional CSS files
│   │   ├── IdentityComp.css
│   │   └── TerminalComp.css
│   ├── images/                   # Image assets
│   └── manifest.json             # PWA manifest
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
├── package.json                  # Project dependencies
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google Gemini API key (for AI chat feature)

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/anupPradhan0/portfolio.sh.git
cd portfolio.sh
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## 🎨 Key Components

### Terminal Interface

The main terminal component provides an interactive command-line experience with features like:

- Command history navigation
- Tab completion
- Custom command handlers
- Matrix rain background effect

### AI Chat Integration

Powered by Google Gemini AI, the chat feature allows visitors to:

- Ask questions about my work and experience
- Get instant responses
- Have natural conversations

### SEO Optimization

Enhanced search engine visibility through:

- **sitemap.ts**: Dynamically generates sitemap.xml with all pages
- **robots.ts**: Configures web crawler access and sitemap location
- Metadata optimization in layout.tsx
- Semantic HTML structure

## 🌐 SEO Features

This portfolio includes dedicated SEO optimization files:

### `app/sitemap.ts`

- Automatically generates sitemap.xml
- Lists all pages with their URLs and metadata
- Helps search engines discover and index content
- Updates dynamically based on routes

### `app/robots.ts`

- Configures which pages search engines can crawl
- Points to the sitemap.xml location
- Optimizes crawling efficiency
- Follows SEO best practices

### Additional SEO Enhancements

- Meta tags for description, keywords, and Open Graph
- Structured data for better search results
- Optimized page titles and descriptions
- Semantic HTML5 elements

## 🚢 Deployment

This project is deployed on **Vercel** for optimal performance and seamless CI/CD.

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/anupPradhan0/portfolio.sh)

### Manual Deployment

1. **Install Vercel CLI** (if not already installed)

```bash
npm install -g vercel
```

2. **Deploy**

```bash
vercel
```

3. **Set environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY`

## 🎯 Features Breakdown

### Responsive Design

- Mobile-first approach
- Breakpoints for mobile, tablet, and desktop
- Touch-friendly interface
- Optimized typography scaling

### Animations

- Typewriter text effects
- Matrix-style falling code
- Smooth page transitions
- Hover effects and micro-interactions

### Performance

- Next.js 16 App Router for optimal loading
- React 19 with enhanced rendering
- Code splitting and lazy loading
- Optimized images and assets

## 📱 Pages Overview

- **Home (`/`)**: Terminal interface with navigation commands
- **About (`/about`)**: Personal background, education, and current focus
- **Skills (`/skills`)**: Technical skills organized by category
- **Projects (`/projects`)**: Portfolio of completed projects
- **Contact (`/contact`)**: Contact information and social links

## 🤝 Connect With Me

- **GitHub**: [@srinivas-rc0408](https://github.com/srinivas-rc0408)
- **YouTube**: [@morscode7](https://www.youtube.com/@morscode7)
- **Email**: [srinivasrc0408@gmail.com](mailto:srinivasrc0408@gmail.com)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by classic terminal interfaces and cyberpunk aesthetics
- Built with modern web technologies
- AI chat powered by Google Gemini
- Deployed on Vercel's edge network

## 💡 Future Enhancements

- [ ] Add blog section with MDX support
- [ ] Implement dark/light theme toggle
- [ ] Add more terminal commands
- [ ] Integrate analytics dashboard
- [ ] Add project filtering and search
- [ ] Implement PWA features for offline access
- [ ] Add more AI chat personalities

## 🐛 Bug Reports

Found a bug? Please open an issue on [GitHub Issues](https://github.com/anupPradhan0/portfolio.sh/issues).

## ⭐ Show Your Support

If you like this project, please consider giving it a ⭐ on GitHub!

---

**White-labeled portfolio of Srinivas RC — original terminal portfolio built by [Anup Pradhan](https://github.com/anupPradhan0) (MIT licensed)**

_Last Updated: November 2025_
