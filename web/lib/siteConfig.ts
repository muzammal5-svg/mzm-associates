export const SITE = {
  name: "MZM Case Management",
  tagline: "Run your law practice with clarity",
  whatsapp: "+92 345 5421753",
  phone: "+92 345 5421753",
  email: "muhammad.zahid.muneer@outlook.com",
  address: "Chamber No#27 Haroon Ur Rasheed Block F-8 Markaz Near PSO Pump Islamabad",
  youtube: "https://www.youtube.com/@DailyDiaryMZM",
  trialDays: 7,
  social: {
    twitter: "",
    linkedin: "",
    youtube: "https://www.youtube.com/@DailyDiaryMZM",
  },
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
