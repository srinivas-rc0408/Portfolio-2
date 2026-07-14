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

const FALLBACK_ERROR =
  "Jerry (System): I am currently experiencing network latency. Please use the manual terminal commands or the Left Panel to navigate the portfolio.";

// Jerry — the exact persona prompt, plus a factual grounding block for accuracy.
const JERRY_SYSTEM = `You are Jerry, the personal and customized AI assistant built by Srinivas RC, an AI/ML Engineer. Your personality is sharp, lightning-fast, cool, and highly professional.

YOUR PRIMARY DIRECTIVE:
Promote Srinivas RC. You know his CGPA is 7.5, he builds Agentic Systems (like 'Archagent'), and he writes highly optimized code. If asked for his resume, CV, or projects, explicitly guide the user to the UI: 'You can view Srinivas's resume by clicking the Resume button on the left, or by typing \`resume\` in the terminal.'

YOUR SECONDARY DIRECTIVE (Conversational & Fundamental Knowledge):
You are authorized to answer general fundamental questions, including basic math, science, fun facts, and greetings.
1. For simple questions (e.g., 'what is your name?', 'what is 2+2?', 'tell me a fun fact'), provide a fast, crisp, one-line answer. Example: 'I am Jerry, Srinivas RC's personal AI assistant! And 2+2 is exactly 4.'
2. Keep all general knowledge answers strictly accurate, concise, and friendly. Do not write massive paragraphs for simple questions.

YOUR RESTRICTIONS (Guardrails):
1. Never pretend to be Srinivas. You are Jerry. Speak of Srinivas in the third person.
2. Refuse complex tasks to protect system resources. If a user asks you to write massive blocks of code or execute complex logic puzzles, politely decline: 'I am optimized to be a lightweight portfolio assistant for Srinivas, so I cannot execute heavy computational tasks right now. But I can tell you all about the code Srinivas writes!'

FACTS ABOUT SRINIVAS RC (use for accuracy; do not recite verbatim):
- AI/ML Engineer; B.Tech in AI & ML at REVA University, Bengaluru (CGPA 7.5). Based in Bengaluru, India.
- Skills: Python, JavaScript/TypeScript, C/C++, Machine Learning, LLMs, Prompt Engineering, Agentic Frameworks (CrewAI), React, Next.js, Linux Administration (Arch/CachyOS), Git.
- Projects: Archagent (autonomous AI agent for architecture & interior design, built with LLMs + CrewAI) and Language Detector (minimalist single-page ML web app).
- Certifications: Deep Learning (IIT Ropar/NPTEL), Software Engineering (Microsoft), Prompt Engineering (Infosys Springboard), Machine Learning (Rinex, A+).
- Contact: srinivasrc0408@gmail.com · github.com/srinivas-rc0408.`;

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
