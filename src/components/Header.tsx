"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">MM</span>
          </div>
          <span className="text-[var(--foreground)] text-sm font-light tracking-[3px] uppercase">
            Moving Machines
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/buy" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Buy</Link>
          <Link href="/sell" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Sell</Link>
          <Link href="/rent" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Rent</Link>
          <Link href="/contact" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Contact</Link>
        </nav>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-[var(--border)] bg-white px-6 py-4 flex flex-col gap-4">
          <Link href="/buy" className="text-sm text-[var(--muted)]" onClick={() => setMenuOpen(false)}>Buy</Link>
          <Link href="/sell" className="text-sm text-[var(--muted)]" onClick={() => setMenuOpen(false)}>Sell</Link>
          <Link href="/rent" className="text-sm text-[var(--muted)]" onClick={() => setMenuOpen(false)}>Rent</Link>
          <Link href="/contact" className="text-sm text-[var(--muted)]" onClick={() => setMenuOpen(false)}>Contact</Link>
        </nav>
      )}
    </header>
  );
}
