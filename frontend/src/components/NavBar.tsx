"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, BookOpen, MapPin, Vote } from "lucide-react";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/education", label: "EVM Guide", icon: BookOpen },
  { href: "/voting-day", label: "Voting Day", icon: MapPin },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full border-b border-orange-900/30 bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-orange-950/10"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" aria-label="Tamil Nadu Election 2026 — Go to home page" className="flex items-center gap-2 shrink-0">
          <div
            aria-hidden="true"
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-main to-brand-dark flex items-center justify-center shadow-lg shadow-orange-500/30"
          >
            <Vote size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-sm md:text-base text-white hidden sm:block">
            TN Election <span className="text-brand-main">2026</span>
          </span>
        </Link>

        {/* Primary navigation — always visible */}
        <nav role="navigation" aria-label="Main navigation">
          <ul className="flex items-center gap-1" role="list">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-main focus:ring-offset-2 focus:ring-offset-slate-950 ${
                      active
                        ? "bg-brand-main/20 text-brand-main border border-brand-main/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <span className="hidden md:inline">{label}</span>
                    {/* Always show label on small screens for accessibility */}
                    <span className="md:hidden text-xs">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
