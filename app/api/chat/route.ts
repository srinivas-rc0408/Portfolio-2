import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Edge runtime: no cold-boot lambda spin-up, streams from the nearest region.
// (Only web APIs are used below — fetch, ReadableStream, TextEncoder.)
export const runtime = "edge";

// --- Config (keys live in .env.local, never in source) ---
const NVIDIA_API_KEY_1 = process.env.NVIDIA_API_KEY_1;
const NVIDIA_API_KEY_2 = process.env.NVIDIA_API_KEY_2;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Fast, non-reasoning model tier for low latency.
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MAX_TOKENS = 800;

// Sent instantly when the user asks Jerry for a heavy computational task.
const HEAVY_DECLINE =
  "I am optimized to be a lightweight portfolio assistant for Srinivas, so I cannot execute heavy computational tasks right now. But I can tell you all about the code Srinivas writes!";

// Shown when the input is empty (direct API hit — the terminal greets locally).
const EMPTY_PROMPT =
  "I am Jerry, Srinivas RC's personal AI assistant! Ask me about his skills, projects, or experience.";

// The flagship question gets one exact, pre-approved answer — served instantly
// (no LLM round-trip) and also pinned in the system prompt for paraphrases.
const WHY_CHOOSE_ANSWER =
  "Srinivas combines a strong academic foundation (7.5 CGPA in AI/ML) with practical expertise in building agentic systems and highly optimized web applications. He is a fast learner, deeply passionate about AI engineering, and consistently delivers clean, production-ready code.";

const FALLBACK_ERROR =
  "Jerry (System): I am currently experiencing network latency. Please use the manual terminal commands or the Left Panel to navigate the portfolio.";

// Shown when a single IP exceeds 200 AI requests in an hour.
const RATE_LIMIT_MESSAGE =
  "Jerry is taking a quick break to cool his servers 🧊 — you've asked a lot of great questions! Please try again in a little while, or explore the portfolio with the terminal commands meanwhile.";

// Jerry — persona + behavior rules + a factual grounding block for accuracy.
const JERRY_SYSTEM = `You are Jerry, the personal and customized AI assistant built by Srinivas RC, an AI/ML Engineer. Your personality is sharp, lightning-fast, cool, and highly professional.

YOUR PRIMARY DIRECTIVE:
Promote Srinivas RC accurately. He is a strong AI/ML engineer (CGPA 7.5) who builds agentic systems and LLM-powered, production-ready web apps.

ANSWERING MAJOR-TOPIC QUESTIONS (his projects / skills / experience, asked broadly):
Give a crisp, well-structured SUMMARY of the key items — 3 to 5 short lines, no fluff — using the KNOWLEDGE BASE below. THEN finish with exactly one closing line naming the matching section:
- Projects  -> "For detailed info, visit the Projects section at the top."
- Skills    -> "For detailed info, visit the Skills section at the top."
- Experience-> "For detailed info, visit the Experience section at the top."
Do NOT just tell them to check the section without summarizing first — always summarize, then point them there.

ANSWERING SPECIFIC QUESTIONS:
If the user asks about ONE specific project (e.g. "tell me about ArchAgent" or "what is the travel planner?"), give a focused, accurate 2-4 sentence description of THAT project only, from the KNOWLEDGE BASE. Answer exactly what was asked — don't dump everything.

RESUME / CV: If asked, tell them it opens right here in the viewer — click the Resume/CV button on the left, or type \`resume\`.

SECONDARY DIRECTIVE (general knowledge): You may answer simple fundamental questions (basic math, science, fun facts, greetings) in one crisp, friendly line.

FLAGSHIP QUESTION:
If asked 'Why choose Srinivas R C?' (or any variation of why to pick/hire/choose him), respond with EXACTLY: '${WHY_CHOOSE_ANSWER}'

GUARDRAILS:
1. Never pretend to be Srinivas. You are Jerry — speak of him in the third person.
2. Refuse heavy tasks (massive code blocks, complex logic puzzles) politely: '${HEAVY_DECLINE}'
3. Never invent facts that are not in the KNOWLEDGE BASE.

=== KNOWLEDGE BASE (ground truth) ===
PROFILE: AI/ML Engineer; B.Tech in AI & ML at REVA University, Bengaluru; CGPA 7.5; graduating 2027. Based in Bengaluru, India.

PROJECTS (11+ total; flagship first):
- ArchAgent — AI architectural design platform. Turns text design briefs into 3D renders, panoramic views, and itemised cost estimates via a 4-stage Google Gemini prompt-chaining pipeline; combines Gemini (design reasoning) + Hugging Face FLUX (images) + an interactive Three.js 3D viewer, with Supabase auth/storage and 1-click jsPDF report export. (React, TypeScript, Gemini, FLUX, Three.js, Supabase)
- AI Travel Planner — generates personalised day-by-day itineraries from destination/budget/preferences using structured Gemini JSON prompts; integrates Gemini, Google OAuth, Places API and Firebase Firestore; plots every stop on interactive React Leaflet maps.
- AI Finance Assistant — Next.js personal-finance assistant with dashboard/portfolio/transactions modules, a Prisma relational DB (5+ models), Inngest serverless background jobs, and prompt-engineered LLM answers.
- Health Risk MLOps — end-to-end MLOps pipeline (training, evaluation, deployment) with MLflow versioning and monitoring.
- Bank Churn Prediction — 85%+ accuracy Random Forest churn system with a real-time Streamlit UI.
- Bangalore Smart-Toll System — full-stack toll platform (React/TS + Express + MongoDB), live fare calculation, fleet analytics, PDF audit exports.
- Others: NLP Language Detector & Translator, Mini Translator, Managing AD Channels (NLP/ML), Flappy Duck AI (PID-controlled autopilot game), Billing System (Java/OOP), Notes Sharing Platform (Next.js, OTP auth).

SKILLS:
- Languages: Python, TypeScript, JavaScript, Java, C, C++, SQL.
- AI/ML & LLMs: Machine Learning, Deep Learning, NLP, LLM integration (Google Gemini, Hugging Face), Prompt Engineering, Agentic AI, Feature Engineering, MLOps.
- Frameworks/Libraries: React, Next.js, Vite, Tailwind CSS, Three.js, Scikit-learn, Pandas, NumPy, TensorFlow, OpenCV, MLflow, Streamlit.
- Cloud/Data/APIs: Firebase (Firestore, OAuth), Supabase, Prisma, Inngest, Google Places API, REST APIs.
- OS/Tools: Linux (Arch, Ubuntu), Git/GitHub, VS Code. He actively explores open-source frameworks, plugins, and developer tooling on GitHub.

EXPERIENCE:
- Core Member & Head of Media, Yantra IoT Club (REVA University) — leads digital outreach; ran 2 technical workshops and career panels for 100+ students.
- Independent AI/ML Engineering & Open-Source Exploration — ships full-stack AI products end to end (11+ projects); open to AI/ML internships and placements.

CERTIFICATIONS: Deep Learning (IIT Ropar/NPTEL), Software Engineering (Microsoft), LLM-Driven AI Engineering Bootcamp (REVA University), Prompt Engineering (Infosys Springboard), Machine Learning (Rinex, Grade A+).

Keep every answer accurate and concise.`;

function isObviouslyOutOfScope(q: string): boolean {
  const s = q.toLowerCase();
  const codeGen =
    /\b(write|generate|create|make|build|give me|show me)\b[^.?!]{0,30}\b(code|program|script|snippet|function|algorithm|regex|query)\b/;
  const imageGen =
    /\b(generate|create|draw|make|design)\b[^.?!]{0,25}\b(image|picture|photo|logo|art|drawing|painting)\b/;
  // Long-form creative writing is declined; short friendly asks (jokes,
  // fun facts) are allowed through — Jerry's secondary directive covers them.
  const creative =
    /\b(write|compose)\b[^.?!]{0,25}\b(poem|essay|story|song|recipe)\b/;
  return codeGen.test(s) || imageGen.test(s) || creative.test(s);
}

type Send = (text: string) => void;

/** NVIDIA (OpenAI-compatible) streaming. Throws only if no token was sent. */
async function streamNvidia(
  key: string,
  user: string,
  send: Send
): Promise<void> {
  const res = await fetch(NVIDIA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        { role: "system", content: JERRY_SYSTEM },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      top_p: 0.95,
      max_tokens: MAX_TOKENS,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`NVIDIA ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sentAny = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const json = JSON.parse(data);
          const token: string = json?.choices?.[0]?.delta?.content ?? "";
          if (token) {
            send(token);
            sentAny = true;
          }
        } catch {
          /* ignore keep-alive / partial json */
        }
      }
    }
  } catch (e) {
    if (!sentAny) throw e; // let the caller fall back
  }
  if (!sentAny) throw new Error("NVIDIA empty stream");
}

/** Google Gemini streaming. Throws only if no token was sent. */
async function streamGemini(user: string, send: Send): Promise<void> {
  if (!GEMINI_API_KEY) throw new Error("Gemini key not configured");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.4 },
    systemInstruction: JERRY_SYSTEM,
  });
  const result = await model.generateContentStream(user);
  let sentAny = false;
  for await (const chunk of result.stream) {
    const token = chunk.text();
    if (token) {
      send(token);
      sentAny = true;
    }
  }
  if (!sentAny) throw new Error("Gemini empty stream");
}

export async function POST(req: NextRequest) {
  // 20 questions / 5 min per IP — protects the upstream API keys from abuse.
  // Max 200 AI requests per IP per hour — protects the upstream API quotas.
  if (!rateLimit(`chat:${clientIp(req)}`, 200, 60 * 60_000)) {
    return new Response(RATE_LIMIT_MESSAGE, { status: 429 });
  }
  const { message } = await req.json().catch(() => ({ message: "" }));
  const question =
    typeof message === "string" ? message.trim().slice(0, 500) : "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send: Send = (t) => controller.enqueue(encoder.encode(t));

      if (!question) {
        send(EMPTY_PROMPT);
        controller.close();
        return;
      }
      // Heavy code/image/creative generation is declined instantly (guardrail #2).
      if (isObviouslyOutOfScope(question)) {
        send(HEAVY_DECLINE);
        controller.close();
        return;
      }
      // Flagship question → the exact approved answer, zero latency.
      if (/why\s+(should\s+\w+\s+)?(choose|pick|hire|select)\s+srinivas/i.test(question)) {
        send(WHY_CHOOSE_ANSWER);
        controller.close();
        return;
      }

      const tiers: (() => Promise<void>)[] = [];
      if (NVIDIA_API_KEY_1) {
        const k = NVIDIA_API_KEY_1;
        tiers.push(() => streamNvidia(k, question, send));
      }
      if (NVIDIA_API_KEY_2) {
        const k = NVIDIA_API_KEY_2;
        tiers.push(() => streamNvidia(k, question, send));
      }
      if (GEMINI_API_KEY) tiers.push(() => streamGemini(question, send));

      for (const tier of tiers) {
        try {
          await tier(); // resolves once fully streamed (or partial sent)
          controller.close();
          return;
        } catch (e) {
          console.error("AI tier failed:", e instanceof Error ? e.message : e);
          // no tokens were sent → try the next tier
        }
      }

      send(FALLBACK_ERROR);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
