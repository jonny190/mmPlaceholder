import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata = {
  title: "Rent a Machine",
  description: "Flexible short and long-term machine rental with full support.",
};

const features = [
  { title: "Fast Delivery & Collection", description: "With our fast delivery and collection options, you can increase or decrease capacity rapidly, depending on your needs." },
  { title: "Weekly Rental Option", description: "After an initial period, machines can be rented on a weekly basis. Machines can be rented for a short-term project or an extended rental period." },
  { title: "Specialist Checked", description: "You can rent with confidence, knowing that our machines have been checked by our specialists in advance." },
  { title: "Fully Supported", description: "Our rental service includes machine support in case of any issues that may arise during your rental period." },
];

export default function RentPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl mb-16">
        <h1 className="text-3xl font-light mb-4">Rent a machine</h1>
        <p className="text-[var(--muted)] font-light leading-relaxed">
          Some machines can be rented on a short-term or long-term basis. After a minimum period,
          machines can be rented weekly and returned with a week&apos;s notice. We will take care of
          delivery, collection and support, so you can scale your capabilities up and down as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {features.map((f) => (
          <div key={f.title} className="p-6 border border-[var(--border)] rounded-xl">
            <h3 className="text-sm font-medium mb-2">{f.title}</h3>
            <p className="text-sm text-[var(--muted)] font-light">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="max-w-lg">
        <h2 className="text-xl font-light mb-6">Enquire about renting</h2>
        <EnquiryForm type="rent" />
      </div>
    </div>
  );
}
