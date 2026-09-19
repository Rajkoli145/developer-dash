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
  const user = await currentUser();
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
