"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/products", label: "Products" },
  ];

  return (
    <aside className="w-56 border-r border-[var(--border)] bg-white min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <Link href="/admin" className="text-sm font-medium uppercase tracking-wider">
          Admin
        </Link>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              pathname.startsWith(link.href)
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t border-[var(--border)]">
        <Link href="/" className="block text-xs text-[var(--muted)] hover:text-[var(--foreground)] mb-3">
          &larr; View site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
