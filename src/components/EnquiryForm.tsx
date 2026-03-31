"use client";

import { useState } from "react";

interface EnquiryFormProps {
  type: "buy" | "rent" | "sell" | "general";
  machineRef?: string;
  machineName?: string;
}

export function EnquiryForm({ type, machineRef, machineName }: EnquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = new FormData(e.currentTarget);
    const data = {
      type,
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      company: form.get("company"),
      phone: form.get("phone"),
      interestType: form.get("interestType"),
      machineRef,
      machineName,
      message: form.get("message"),
    };

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-light">Thank you, we will be in touch shortly!</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent)] transition-colors bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="firstName" placeholder="First name *" required className={inputClass} />
        <input name="lastName" placeholder="Last name" className={inputClass} />
      </div>
      <input name="email" type="email" placeholder="Email *" required className={inputClass} />
      <input name="company" placeholder="Company name" className={inputClass} />
      <input name="phone" type="tel" placeholder="Phone" className={inputClass} />

      {(type === "buy" || type === "rent") && machineRef && (
        <>
          <select name="interestType" className={inputClass} defaultValue={type === "buy" ? "Buying this machine" : "Renting this machine"}>
            <option>Buying this machine</option>
            <option>Renting this machine</option>
          </select>
          <input value={`${machineName} | ${machineRef}`} disabled className={inputClass + " text-[var(--muted)]"} />
        </>
      )}

      <textarea
        name="message"
        placeholder={type === "sell" ? "Machine details *" : type === "rent" ? "Machine requirements *" : "Message *"}
        required
        rows={4}
        className={inputClass + " resize-none"}
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-3 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--foreground)] transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send enquiry"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-500 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
