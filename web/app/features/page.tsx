import { MarketingShell } from "@/components/marketing/MarketingShell";

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-heading font-bold text-center">Features</h1>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {["Daily cause list","Hearing history & previous dates","10-day reminders + push","Clients & documents","Decided cases archive","Urdu & English with RTL"].map((f) => (
            <div key={f} className="card"><h3 className="font-semibold">{f}</h3><p className="text-sm text-muted mt-1">Truthful product capability.</p></div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
