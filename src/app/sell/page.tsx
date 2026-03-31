import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata = {
  title: "Sell Your Machine",
  description: "We offer fair valuations, fast payment and hassle-free removal of your used machinery.",
};

const features = [
  { title: "Fast Valuation", description: "One of our specialists can visit your site and provide a fast valuation. We can usually confirm a buy price on that day." },
  { title: "Multiple Purchase Options", description: "We can offer you multiple purchase options, from brokering through to outright purchase, based on your needs." },
  { title: "Speed of Payment", description: "You can expect prompt payment when we've agreed on the best buying option." },
  { title: "Removal & Storage", description: "We can remove the machine from your site quickly, freeing up space. If we are brokering a machine for you we can provide temporary storage until it is sold." },
  { title: "Brokering", description: "If we agree to broker a machine for you we create the photos, videos, and adverts, and promote them to our marketing database." },
];

export default function SellPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl mb-16">
        <h1 className="text-3xl font-light mb-4">Sell your used machine</h1>
        <p className="text-[var(--muted)] font-light leading-relaxed">
          We offer a fair and hassle-free experience for selling your used machinery. Our specialists
          can quickly value your machine and offer you purchase options — everything from same-day
          purchases to brokering and auctions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((f) => (
          <div key={f.title} className="p-6 border border-[var(--border)] rounded-xl">
            <h3 className="text-sm font-medium mb-2">{f.title}</h3>
            <p className="text-sm text-[var(--muted)] font-light">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="max-w-lg">
        <h2 className="text-xl font-light mb-6">Enquire about selling</h2>
        <EnquiryForm type="sell" />
      </div>
    </div>
  );
}
