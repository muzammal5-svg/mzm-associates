export const SITE = {
  name: "MZM Case Management",
  tagline: "Run your law practice with clarity",
  whatsapp: "+923001234567",
  email: "support@mzm.pk",
  trialDays: 7,
  social: { twitter: "", linkedin: "" },
};
export function whatsappLink(msg = "Hello") {
  const num = SITE.whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
