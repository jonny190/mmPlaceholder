import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">MM</span>
              </div>
              <span className="text-sm font-light tracking-[2px] uppercase">Moving Machines</span>
            </div>
            <p className="text-sm text-[var(--muted)] max-w-xs">
              Specialists in buying, selling and renting used food processing and packing machinery.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider mb-3">Services</h4>
              <div className="flex flex-col gap-2">
                <Link href="/buy" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Buy</Link>
                <Link href="/sell" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Sell</Link>
                <Link href="/rent" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Rent</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider mb-3">Company</h4>
              <div className="flex flex-col gap-2">
                <Link href="/contact" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Contact</Link>
                <Link href="/privacy-policy" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[var(--border)] text-xs text-[var(--muted)]">
          &copy; {new Date().getFullYear()} Moving Machines Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
