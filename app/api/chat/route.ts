import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Config (keys live in .env.local, never in source) ---
const NVIDIA_API_KEY_1 = process.env.NVIDIA_API_KEY_1;
const NVIDIA_API_KEY_2 = process.env.NVIDIA_API_KEY_2;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL || "nvidia/llama-3.3-nemotron-super-49b-v1.5";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

// Exact string fired when a question falls outside the allowed scope.
const OUT_OF_SCOPE =
  "I am specifically optimized to function as Srinivas RC's professional portfolio assistant. I cannot assist with general inquiries, but I would be happy to answer any questions regarding his experience, technical skills, or projects.";

// --- Portfolio knowledge base (scoped context) ---
const CONTEXT_PARTS = {
  base: `You are Srinivas RC's AI assistant on his portfolio terminal. Srinivas RC is an AI / ML Engineer and Computer Science undergraduate (B.Tech AI & ML, REVA University, CGPA 7.5, Bengaluru, India). He builds and deploys web applications powered by Large Language Models (LLMs) and agentic systems, and is passionate about Linux system optimization (CachyOS).`,
  skills: `Tech: Python, JavaScript/TypeScript, C/C++, Machine Learning, Large Language Models (LLMs), Prompt Engineering, Agentic Frameworks (CrewAI), React, Next.js, Linux Administration (Arch / CachyOS), Git, Web Applications.`,
  projects: `Projects: 1) Archagent — an autonomous AI agent for architecture and interior design tasks, built with LLMs and agentic frameworks (CrewAI). 2) Language Detector — a minimalist single-page language-detection web app with machine learning under the hood.`,
  experience: `Experience: Independent AI/ML project work (Archagent, Language Detector). Core Member & Head of Media at the Yantra IoT Club, REVA University. Open to internships and university placements in AI engineering.`,
  contact: `Contact: Email srinivasrc0408@gmail.com. Phone +91 72049 54568. GitHub github.com/srinivas-rc0408. Location: Bengaluru, Karnataka, India.`,
  education: `Education: B.Tech in Artificial Intelligence & Machine Learning at REVA University, Bengaluru (CGPA 7.5). Certifications: Deep Learning (IIT Ropar / NPTEL), Software Engineering Fundamentals (Microsoft), Prompt Engineering (Infosys Springboard), Machine Learning (Rinex, Grade A+).`,
};

const SCOPE_RULES = `STRICT SCOPE: Only answer questions about Srinivas RC's professional profile, certifications, technical skills/stack, experience, education, or his software projects (Archagent, Language Detector). Reply in 2-3 short sentences. If the user asks you to write code, generate/draw images, write essays/poems/stories, translate text, solve homework/math, or anything unrelated to Srinivas RC's professional profile, you MUST reply with EXACTLY this text and nothing else: "${OUT_OF_SCOPE}"`;

function buildContext(question: string): string {
  const q = question.toLowerCase();
  const parts = [CONTEXT_PARTS.base];
  const add = (keys: string[], part: string) => {
    if (keys.some((k) => q.includes(k))) parts.push(part);
  };
  add(["skill", "tech", "stack", "know", "language", "tool", "framework", "python", "react"], CONTEXT_PARTS.skills);
  add(["project", "built", "portfolio", "github", "app", "archagent", "detector"], CONTEXT_PARTS.projects);
  add(["experience", "job", "work", "company", "placement", "internship", "role", "club"], CONTEXT_PARTS.experience);
  add(["contact", "reach", "email", "phone", "linkedin", "resume", "hire", "connect"], CONTEXT_PARTS.contact);
  add(["study", "education", "university", "college", "btech", "reva", "cgpa", "certif"], CONTEXT_PARTS.education);
  if (["who", "about srinivas", "tell me about", "introduce", "summary"].some((k) => q.includes(k))) {
    parts.push(CONTEXT_PARTS.skills, CONTEXT_PARTS.experience, CONTEXT_PARTS.projects);
  }
  return parts.join("\n") + "\n" + SCOPE_RULES;
}

// Deterministic guard for the most unambiguous out-of-scope requests.
function isObviouslyOutOfScope(q: string): boolean {
  const s = q.toLowerCase();
  const codeGen = /\b(write|generate|create|make|build|give me|show me)\b[^.?!]{0,30}\b(code|program|script|snippet|function|algorithm|regex|query)\b/;
  const imageGen = /\b(generate|create|draw|make|design)\b[^.?!]{0,25}\b(image|picture|photo|logo|art|drawing|painting)\b/;
  const creative = /\b(write|compose)\b[^.?!]{0,25}\b(poem|essay|story|song|joke|recipe)\b/;
  return codeGen.test(s) || imageGen.test(s) || creative.test(s);
}

/** Strip nemotron reasoning traces and tidy whitespace. */
function cleanReply(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*(assistant|answer)\s*:\s*/i, "")
    .trim();
}

function isRateLimit(msg: string): boolean {
  return /429|too many requests|quota|rate limit|overloaded/i.test(msg);
}

// --- Tier 1 & 2: NVIDIA (OpenAI-compatible) ---
async function callNvidia(
  key: string,
  system: string,
  user: string
): Promise<string> {
  const res = await fetch(NVIDIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        // Nemotron reasoning toggle — "off" gives direct, fast answers.
        { role: "system", content: `detailed thinking off\n\n${system}` },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      top_p: 0.95,
      max_tokens: 300,
      stream: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`NVIDIA ${res.status}: ${body.slice(0, 160)}`);
  }
  const data = await res.json();
  const msg = data?.choices?.[0]?.message ?? {};
  const text = cleanReply(msg.content ?? "");
  if (!text) throw new Error("NVIDIA empty response");
  return text;
}

// --- Tier 3: Google Gemini ---
async function callGemini(system: string, user: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("Gemini key not configured");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { maxOutputTokens: 220, temperature: 0.4 },
    systemInstruction: system,
  });
  const result = await model.startChat({ history: [] }).sendMessage(user);
  const text = cleanReply(result.response.text());
  if (!text) throw new Error("Gemini empty response");
  return text;
}

export async function POST(request: NextRequest) {
  const { message } = await request.json().catch(() => ({ message: "" }));
  const question = typeof message === "string" ? message.trim() : "";

  if (!question) {
    return NextResponse.json(
      { error: "No message provided", success: false },
      { status: 400 }
    );
  }

  // Fast deterministic scope guard.
  if (isObviouslyOutOfScope(question)) {
    return NextResponse.json({ response: OUT_OF_SCOPE, success: true, tier: "guard" });
  }

  const system = buildContext(question);

  // Three-tier fallback: NVIDIA key1 → NVIDIA key2 → Gemini.
  const tiers: { name: string; run: () => Promise<string> }[] = [];
  if (NVIDIA_API_KEY_1) {
    const key = NVIDIA_API_KEY_1;
    tiers.push({ name: "nvidia-1", run: () => callNvidia(key, system, question) });
  }
  if (NVIDIA_API_KEY_2) {
    const key = NVIDIA_API_KEY_2;
    tiers.push({ name: "nvidia-2", run: () => callNvidia(key, system, question) });
  }
  if (GEMINI_API_KEY)
    tiers.push({ name: "gemini", run: () => callGemini(system, question) });

  if (tiers.length === 0) {
    return NextResponse.json(
      { error: "No AI provider configured", success: false },
      { status: 500 }
    );
  }

  const errors: string[] = [];
  for (const tier of tiers) {
    try {
      const response = await tier.run();
      return NextResponse.json({ response, success: true, tier: tier.name });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${tier.name}: ${msg}`);
      console.error(`AI tier ${tier.name} failed:`, msg);
      // Rate limit or any error → fall through to the next tier.
    }
  }

  // Every tier exhausted.
  const rateLimited = errors.some(isRateLimit);
  return NextResponse.json(
    {
      error: rateLimited
        ? "All AI providers are rate-limited right now. Please try again in a few minutes."
        : "AI temporarily unavailable across all providers.",
      success: false,
    },
    { status: rateLimited ? 429 : 502 }
  );
}
