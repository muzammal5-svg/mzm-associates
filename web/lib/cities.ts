/**
 * Major Pakistani cities for the city select field.
 * Sorted alphabetically; Punjab cities first as they are most common for a Lahore firm.
 */
export const PK_CITIES: string[] = [
  // Punjab
  "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan",
  "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura", "Jhang",
  "Rahim Yar Khan", "Gujrat", "Kasur", "Okara", "Sahiwal",
  "Wah Cantonment", "Mandi Bahauddin", "Jhelum", "Chiniot", "Hafizabad",
  "Khanewal", "Muzaffargarh", "Vehari", "Attock", "Chakwal",
  "Toba Tek Singh", "Narowal", "Mianwali", "Bhakkar", "Layyah",
  // Sindh
  "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah",
  "Mirpur Khas", "Jacobabad", "Shikarpur", "Khairpur", "Dadu",
  // KPK
  "Peshawar", "Mardan", "Mingora", "Kohat", "Abbottabad",
  "Mansehra", "Dera Ismail Khan", "Swabi", "Nowshera", "Bannu",
  // Balochistan
  "Quetta", "Turbat", "Khuzdar", "Hub", "Chaman",
  // AJK / GB
  "Muzaffarabad", "Mirpur", "Gilgit", "Skardu",
  // Federal
  "Islamabad",
].sort();

export const PK_CITY_OPTIONS = PK_CITIES.map(c => ({ value: c, label: c }));
