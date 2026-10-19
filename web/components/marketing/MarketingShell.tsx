import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-offwhite">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
