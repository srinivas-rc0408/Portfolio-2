import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// --- Config (keys live in .env.local, never in source) ---
const NVIDIA_API_KEY_1 = process.env.NVIDIA_API_KEY_1;
const NVIDIA_API_KEY_2 = process.env.NVIDIA_API_KEY_2;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Fast, non-reasoning model for low latency.
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MAX_TOKENS = 1024;

const OUT_OF_SCOPE =
  "I am Jerry, specifically optimized to assist with Srinivas RC's portfolio. I cannot answer general questions, but I'd love to tell you about his AI engineering skills!";

const FALLBACK_ERROR =
  "Jerry (System): I am currently experiencing a high volume of requests or a network timeout. Please use the manual terminal commands like 'help' or the left-panel buttons to navigate the portfolio.";

// Jerry — the exact persona prompt, plus factual context so answers are accurate.
const JERRY_SYSTEM = `You are Jerry, the exclusive and highly professional AI assistant for Srinivas RC, an AI/ML Engineer. Your personality is helpful, incredibly fast, and sleek.

CORE RULES:
1. You represent Srinivas. Speak in the third person about him (e.g., 'Srinivas is a developer...'), but introduce yourself as Jerry if asked.
2. If the user asks for Srinivas's Resume, CV, or Certificates, do NOT just summarize them. You must explicitly guide them to the UI. Say exactly: 'You can view and download Srinivas's resume instantly by clicking the 'Resume' button in the left-hand Quick Access menu, or by typing the command \`resume\` right here in the terminal.'
3. If the user asks about his projects, mention 'Archagent' and his 'Language Detector', and tell them to click the 'Projects' button or type \`projects\` for full details.
4. If a user asks a general knowledge question, coding question, or asks for image generation, politely refuse and pivot back to Srinivas: '${OUT_OF_SCOPE}'

FACTS ABOUT SRINIVAS RC:
- AI/ML Engineer; B.Tech in AI & ML at REVA University, Bengaluru (CGPA 7.5). Based in Bengaluru, India.
- Skills: Python, JavaScript/TypeScript, C/C++, Machine Learning, LLMs, Prompt Engineering, Agentic Frameworks (CrewAI), React, Next.js, Linux Administration (Arch/CachyOS), Git.
- Projects: Archagent (autonomous AI agent for architecture & interior design, built with LLMs + CrewAI) and Language Detector (minimalist single-page ML web app).
- Certifications: Deep Learning (IIT Ropar/NPTEL), Software Engineering (Microsoft), Prompt Engineering (Infosys Springboard), Machine Learning (Rinex, A+).
- Contact: srinivasrc0408@gmail.com · github.com/srinivas-rc0408.
Keep replies concise (2-4 sentences) and in character.`;

function isObviouslyOutOfScope(q: string): boolean {
  const s = q.toLowerCase();
  const codeGen =
    /\b(write|generate|create|make|build|give me|show me)\b[^.?!]{0,30}\b(code|program|script|snippet|function|algorithm|regex|query)\b/;
  const imageGen =
    /\b(generate|create|draw|make|design)\b[^.?!]{0,25}\b(image|picture|photo|logo|art|drawing|painting)\b/;
  const creative =
    /\b(write|compose)\b[^.?!]{0,25}\b(poem|essay|story|song|joke|recipe)\b/;
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
  if (!rateLimit(`chat:${clientIp(req)}`, 20, 5 * 60_000)) {
    return new Response(FALLBACK_ERROR, { status: 429 });
  }
  const { message } = await req.json().catch(() => ({ message: "" }));
  const question =
    typeof message === "string" ? message.trim().slice(0, 500) : "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send: Send = (t) => controller.enqueue(encoder.encode(t));

      if (!question) {
        send(OUT_OF_SCOPE);
        controller.close();
        return;
      }
      if (isObviouslyOutOfScope(question)) {
        send(OUT_OF_SCOPE);
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
