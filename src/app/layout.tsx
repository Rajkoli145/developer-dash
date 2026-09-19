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
  // Auth pages (login/setup) render before any user exists; the fallback identity
  // is only cosmetic there. All protected pages get the real session user.
  let user = { name: "Owner", email: "" };
  try {
    const u = await getSessionUser();
    if (u) user = { name: u.name, email: u.email };
  } catch {
    /* database not reachable — render with fallback */
  }
  return (
    <html lang="en">
      <body>
        <AppShell user={user}>
          {children}
        </AppShell>
        <CommandPalette />
      </body>
    </html>
  );
}
