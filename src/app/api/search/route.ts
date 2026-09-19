import { NextResponse } from "next/server";
import { globalSearch } from "@/lib/search";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  try {
    const hits = await globalSearch(q);
    return NextResponse.json(hits);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
