import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ posts: getAllPosts() });
}
