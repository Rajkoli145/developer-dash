"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, X } from "lucide-react";
import { NAV } from "@/lib/icons";
import { cn, initials } from "@/utils";
import SidebarSignOut from "./SidebarSignOut";

export default function Sidebar({ user, open, onClose }: { user: { name: string; email: string }; open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {open && <div className="backdrop mobile-only" onClick={onClose} />}
      <aside className={cn("sidebar", open && "open")}>
        <div className="mobile-only row spread" style={{ padding: "0 8px 8px" }}>
          <span className="brand-name">DevContext</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <Link href="/" className="brand" onClick={onClose}>
          <div className="brand-mark">DC</div>
          <div>
            <div className="brand-name">DevContext</div>
            <div className="brand-sub">Developer OS</div>
          </div>
        </Link>

        <nav className="nav-group">
          <div className="nav-label">Workspace</div>
          {NAV.slice(0, 1).map((item) => (
            <NavKey key={item.href} {...item} active={isActive(item.href)} onClose={onClose} />
          ))}
        </nav>

        <nav className="nav-group">
          <div className="nav-label">Work</div>
          {NAV.slice(1).map((item) => (
            <NavKey key={item.href} {...item} active={isActive(item.href)} onClose={onClose} />
          ))}
        </nav>

        <div className="sidebar-foot">
          <SidebarSignOut onClose={onClose} />
          <Link href="/settings" className={cn("nav-item", isActive("/settings") && "active")} onClick={onClose}>
            <span className="nav-ico"><Settings size={17} /></span>
            Settings
          </Link>
          <Link href="/settings" className="profile-chip" onClick={onClose}>
            <div className="avatar">{initials(user.name)}</div>
            <div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-mail">{user.email}</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

function NavKey({
  href, label, icon: Icon, active, onClose,
}: {
  href: string; label: string; icon: typeof NAV[number]["icon"]; active: boolean; onClose: () => void;
}) {
  return (
    <Link href={href} className={cn("nav-item", active && "active")} onClick={onClose}>
      <span className="nav-ico"><Icon size={17} /></span>
      {label}
    </Link>
  );
}
