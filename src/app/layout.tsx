import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import CommandPalette from "@/components/CommandPalette";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DevContext — Developer OS",
  description: "Project intelligence and work-tracking for developers. Keep every piece of context in one place.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Signed-in → full app shell (sidebar + topbar + command palette).
  // No session → bare render: middleware only lets /login and /setup through,
  // so the shell (and every workspace page) stays hidden until you sign in.
  let user: { name: string; email: string } | null = null;
  try {
    const u = await getSessionUser();
    if (u) user = { name: u.name, email: u.email };
  } catch {
    /* database not reachable — treat as signed out */
  }

  return (
    <html lang="en">
      <body>
        {user ? (
          <CommandPalette>
            <AppShell user={user}>{children}</AppShell>
          </CommandPalette>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
