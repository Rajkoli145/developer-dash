import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import CommandPalette from "@/components/CommandPalette";
import { currentUser } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DevContext — Developer OS",
  description: "Project intelligence and work-tracking for developers. Keep every piece of context in one place.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Build-time prerenders (and rare DB outages) fall back to a neutral identity
  // so the shell still renders; every runtime page uses the real DB user.
  let user = { name: "Owner", email: "" };
  try {
    const u = await currentUser();
    user = { name: u.name, email: u.email };
  } catch {
    /* database not reachable — render with fallback */
  }
  return (
    <html lang="en">
      <body>
        <AppShell user={{ name: user.name, email: user.email }}>
          {children}
        </AppShell>
        <CommandPalette />
      </body>
    </html>
  );
}
