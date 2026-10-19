import { MarketingShell } from "@/components/marketing/MarketingShell";

export default function FaqPage() {
  const faqs = [
    { q: "What payment methods are supported?", a: "Bank transfer, JazzCash, Easypaisa and other manual methods." },
    { q: "Is there a free trial?", a: "Yes, 7 days by default." },
    { q: "Does it support Urdu?", a: "Yes, full Urdu/RTL support." },
  ];
  return (
    <MarketingShell>
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-heading font-bold text-center">FAQ</h1>
        <div className="mt-8 space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="card">
              <h3 className="font-semibold">{f.q}</h3>
              <p className="text-sm text-muted mt-1">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
