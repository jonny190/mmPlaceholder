"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="text-sm text-[var(--muted)]">Thanks! You&apos;re signed up.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
      <input
        name="email"
        type="email"
        placeholder="Your email"
        required
        className="flex-1 px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] bg-white"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="px-6 py-3 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--foreground)] transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "..." : "Sign up"}
      </button>
    </form>
  );
}
