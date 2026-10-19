import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { SITE, whatsappLink } from "@/lib/siteConfig";

export function PublicFooter() {
  return (
    <footer className="bg-navy text-navy-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Logo size="sm" variant="full" />
          <p className="mt-3 text-sm text-navy-200">{SITE.tagline}</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/welcome">Home</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/refund-policy">Refund</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 md:px-6 py-4 text-center text-xs text-navy-300">
        © {new Date().getFullYear()} {SITE.name}. <a href={whatsappLink()} className="underline">WhatsApp</a> · {SITE.email}
      </div>
    </footer>
  );
}
