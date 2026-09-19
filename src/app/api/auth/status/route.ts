import { NextResponse } from "next/server";
import { isWorkspaceClaimed } from "@/lib/auth";

export async function GET() {
  try {
    return NextResponse.json({ claimed: await isWorkspaceClaimed() });
  } catch {
    // DB not reachable yet (e.g. cold start) — treat as unclaimed so /setup renders.
    return NextResponse.json({ claimed: false });
  }
}
