"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/",           label: "Home",       accent: "#00e5ff" },
  { href: "/experience", label: "Experience", accent: "#a78bfa" },
  { href: "/projects",   label: "Projects",   accent: "#34d399" },
  { href: "/research",   label: "Research",   accent: "#fb923c" },
  { href: "/blog",       label: "Blog",       accent: "#f472b6" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = links.find(l => l.href === pathname) ?? links[0];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-md"
      style={{ background: "rgba(5,10,18,0.85)" }}>
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight"
          style={{ color: active.accent }}>
          rohan@sakeri:~$
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => {
            const isActive = pathname === l.href;
            return (
              <Link key={l.href} href={l.href}
                className="relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                style={{
                  color: isActive ? l.accent : "rgba(255,255,255,0.45)",
                }}>
                {isActive && (
                  <span className="absolute inset-0 rounded-md"
                    style={{ background: `${l.accent}12` }} />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
          <a href="https://github.com/sakeri-cyber" target="_blank" rel="noreferrer"
            className="ml-3 px-3 py-1.5 rounded-md text-sm font-medium border transition-all duration-200"
            style={{ borderColor: `${active.accent}40`, color: active.accent }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${active.accent}18`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            GitHub ↗
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white/50 text-xl" onClick={() => setOpen(o => !o)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] px-5 py-3 flex flex-col gap-2"
          style={{ background: "rgba(5,10,18,0.97)" }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium"
              style={{ color: pathname === l.href ? l.accent : "rgba(255,255,255,0.5)" }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
