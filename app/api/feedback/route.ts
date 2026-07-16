import { NextRequest, NextResponse } from "next/server";
import {
  addFeedback,
  getFeedback,
  setFeedbackStarred,
  deleteFeedback,
} from "@/lib/db";
import { getSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

/** Public: submit feedback. Name + message required; email optional. */
export async function POST(req: NextRequest) {
  // 5 submissions / 10 min per IP — enough for real users, blocks spam.
  if (!rateLimit(`feedback:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Too many submissions — please try again later." },
      { status: 429 }
    );
  }
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json(
      { error: "Please write your feedback before sending." },
      { status: 400 }
    );
  }
  if (name.length > 100 || email.length > 254 || message.length > 2000) {
    return NextResponse.json({ error: "Input too long." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That email doesn't look valid — fix it or leave it empty." },
      { status: 400 }
    );
  }

  try {
    await addFeedback(name, email || null, message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("feedback POST error:", e);
    return NextResponse.json(
      { error: "Could not save your feedback. Please try again." },
      { status: 500 }
    );
  }
}

/** Admin: list all feedback (newest first). */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(
      { feedback: await getFeedback() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("feedback GET error:", e);
    return NextResponse.json({ error: "Failed to load feedback" }, { status: 500 });
  }
}

/** Admin: star / unstar an entry. */
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (typeof body.id !== "string" || typeof body.starred !== "boolean") {
    return NextResponse.json({ error: "id and starred required" }, { status: 400 });
  }
  try {
    await setFeedbackStarred(body.id, body.starred);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("feedback PATCH error:", e);
    return NextResponse.json({ error: "Could not update" }, { status: 500 });
  }
}

/** Admin: delete an entry. */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const fid = new URL(req.url).searchParams.get("id");
  if (!fid) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    await deleteFeedback(fid);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("feedback DELETE error:", e);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
