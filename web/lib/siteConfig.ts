export const SITE = {
  name: "MZM Case Management",
  tagline: "Run your law practice with clarity",
  whatsapp: "+92 300 5421753",
  phone: "+92 300 5421753",
  email: "support@mzm.pk",
  trialDays: 7,
  social: { twitter: "", linkedin: "" },
  /** Set to true only after real reviews are added (see docs/landing-content.md). */
  SHOW_REVIEWS: false,
};
export function whatsappLink(msg = "Hello") {
  const num = SITE.whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
export function phoneLink() {
  const num = SITE.phone.replace(/[^0-9]/g, "");
  return `tel:${num}`;
}
