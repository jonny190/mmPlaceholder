import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Moving Machines Ltd.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-lg">
        <h1 className="text-3xl font-light mb-4">Contact us</h1>
        <p className="text-[var(--muted)] font-light mb-8">
          Have a question? Get in touch and our team will get back to you.
        </p>
        <EnquiryForm type="general" />
      </div>
    </div>
  );
}
