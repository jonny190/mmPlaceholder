export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-light mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-[var(--muted)] font-light">
        <p>
          Moving Machines Ltd is committed to protecting your privacy. This policy explains how we
          collect, use and safeguard your personal information.
        </p>
        <h2 className="text-lg font-medium text-[var(--foreground)]">Information We Collect</h2>
        <p>
          We collect information you provide through our enquiry and contact forms, including your
          name, email address, phone number, and company name. We also collect email addresses from
          our mailing list signup.
        </p>
        <h2 className="text-lg font-medium text-[var(--foreground)]">How We Use Your Information</h2>
        <p>
          We use your information to respond to enquiries, provide quotes and valuations, and send
          updates about new machines in stock (if you have subscribed to our mailing list).
        </p>
        <h2 className="text-lg font-medium text-[var(--foreground)]">Cookies</h2>
        <p>
          This website uses essential cookies for authentication and session management. We do not
          use tracking or advertising cookies.
        </p>
        <h2 className="text-lg font-medium text-[var(--foreground)]">Contact</h2>
        <p>
          If you have any questions about this privacy policy, please contact us at{" "}
          <a href="mailto:info@movingmachinesltd.com" className="underline">info@movingmachinesltd.com</a>.
        </p>
      </div>
    </div>
  );
}
