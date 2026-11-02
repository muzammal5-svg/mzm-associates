export interface DistrictData {
  name: string;
  province: string;
  tehsils: string[];
}

export interface CityData {
  name: string;
  district: string;
  tehsil?: string;
  province: string;
}

export const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
] as const;

export type PakistanProvince = (typeof PAKISTAN_PROVINCES)[number];

export const PAKISTAN_DISTRICTS_DATA: DistrictData[] = [
  // ─── Punjab ─────────────────────────────────────────────────────────────
  {
    name: "Attock",
    province: "Punjab",
    tehsils: ["Attock", "Fateh Jang", "Hassan Abdal", "Hazro", "Jand", "Pindi Gheb"],
  },
  {
    name: "Bahawalnagar",
    province: "Punjab",
    tehsils: ["Bahawalnagar", "Chishtian", "Fort Abbas", "Haroonabad", "Minchinabad"],
  },
  {
    name: "Bahawalpur",
    province: "Punjab",
    tehsils: ["Ahmadpur East", "Bahawalpur City", "Bahawalpur Sadar", "Hasilpur", "Khairpur Tamewali", "Yazman"],
  },
  {
    name: "Bhakkar",
    province: "Punjab",
    tehsils: ["Bhakkar", "Darya Khan", "Kallurkot", "Mankera"],
  },
  {
    name: "Chakwal",
    province: "Punjab",
    tehsils: ["Chakwal", "Choa Saidan Shah", "Kallar Kahar"],
  },
  {
    name: "Chiniot",
    province: "Punjab",
    tehsils: ["Chiniot", "Bhowana", "Lalian"],
  },
  {
    name: "Dera Ghazi Khan",
    province: "Punjab",
    tehsils: ["DG Khan", "De-Excluded Area DG Khan", "Kot Chutta"],
  },
  {
    name: "Faisalabad",
    province: "Punjab",
    tehsils: ["Faisalabad City", "Faisalabad Sadar", "Chak Jhumra", "Jaranwala", "Samundri", "Tandlianwala"],
  },
  {
    name: "Gujranwala",
    province: "Punjab",
    tehsils: ["Gujranwala City", "Gujranwala Sadar", "Kamoke", "Nowshera Virkan"],
  },
  {
    name: "Gujrat",
    province: "Punjab",
    tehsils: ["Gujrat", "Kharian", "Sarai Alamgir", "Jalalpur Jattan", "Kunjah"],
  },
  {
    name: "Hafizabad",
    province: "Punjab",
    tehsils: ["Hafizabad", "Pindi Bhattian"],
  },
  {
    name: "Jhang",
    province: "Punjab",
    tehsils: ["Jhang", "Shorkot", "Ahmadpur Sial", "Athara Hazari", "Mandi Shah Jehna"],
  },
  {
    name: "Jhelum",
    province: "Punjab",
    tehsils: ["Jhelum", "Dina", "Pind Dadan Khan", "Sohawa"],
  },
  {
    name: "Kasur",
    province: "Punjab",
    tehsils: ["Kasur", "Chunian", "Pattoki", "Kot Radha Kishan"],
  },
  {
    name: "Khanewal",
    province: "Punjab",
    tehsils: ["Khanewal", "Kabirwala", "Mian Channu", "Jahanian"],
  },
  {
    name: "Khushab",
    province: "Punjab",
    tehsils: ["Khushab", "Noorpur Thal", "Quaidabad", "Naushahra"],
  },
  {
    name: "Kot Addu",
    province: "Punjab",
    tehsils: ["Kot Addu", "Chowk Sarwar Shaheed"],
  },
  {
    name: "Lahore",
    province: "Punjab",
    tehsils: ["Lahore Cantt", "City Lahore", "Model Town", "Raiwind", "Shalimar"],
  },
  {
    name: "Layyah",
    province: "Punjab",
    tehsils: ["Layyah", "Chaubara", "Karor Lal Esan"],
  },
  {
    name: "Lodhran",
    province: "Punjab",
    tehsils: ["Lodhran", "Dunyapur", "Kahror Pacca"],
  },
  {
    name: "Mandi Bahauddin",
    province: "Punjab",
    tehsils: ["Mandi Bahauddin", "Malakwal", "Phalia"],
  },
  {
    name: "Mianwali",
    province: "Punjab",
    tehsils: ["Mianwali", "Isakhel", "Piplan"],
  },
  {
    name: "Multan",
    province: "Punjab",
    tehsils: ["Multan City", "Multan Sadar", "Shujabad", "Jalalpur Pirwala"],
  },
  {
    name: "Murree",
    province: "Punjab",
    tehsils: ["Murree", "Kotli Sattian"],
  },
  {
    name: "Muzaffargarh",
    province: "Punjab",
    tehsils: ["Muzaffargarh", "Alipur", "Jatoi"],
  },
  {
    name: "Nankana Sahib",
    province: "Punjab",
    tehsils: ["Nankana Sahib", "Sangla Hill", "Shah Kot"],
  },
  {
    name: "Narowal",
    province: "Punjab",
    tehsils: ["Narowal", "Shakargarh", "Zafarwal"],
  },
  {
    name: "Okara",
    province: "Punjab",
    tehsils: ["Okara", "Depalpur", "Renala Khurd"],
  },
  {
    name: "Pakpattan",
    province: "Punjab",
    tehsils: ["Pakpattan", "Arifwala"],
  },
  {
    name: "Rahim Yar Khan",
    province: "Punjab",
    tehsils: ["Rahim Yar Khan", "Khanpur", "Liaquatpur", "Sadiqabad"],
  },
  {
    name: "Rajanpur",
    province: "Punjab",
    tehsils: ["Rajanpur", "Jampur", "Rojhan", "De-Excluded Area Rajanpur"],
  },
  {
    name: "Rawalpindi",
    province: "Punjab",
    tehsils: ["Rawalpindi", "Gujar Khan", "Kahuta", "Kallar Syedan", "Taxila"],
  },
  {
    name: "Sahiwal",
    province: "Punjab",
    tehsils: ["Sahiwal", "Chichawatni"],
  },
  {
    name: "Sargodha",
    province: "Punjab",
    tehsils: ["Sargodha", "Bhalwal", "Kot Momin", "Sahiwal (Sargodha)", "Shahpur", "Sillanwali"],
  },
  {
    name: "Sheikhupura",
    province: "Punjab",
    tehsils: ["Sheikhupura", "Ferozewala", "Muridke", "Safdarabad", "Sharakpur"],
  },
  {
    name: "Sialkot",
    province: "Punjab",
    tehsils: ["Sialkot", "Daska", "Pasrur", "Sambrial"],
  },
  {
    name: "Talagang",
    province: "Punjab",
    tehsils: ["Talagang", "Lawa"],
  },
  {
    name: "Taunsa",
    province: "Punjab",
    tehsils: ["Taunsa", "Koh-e-Suleman", "Vehova"],
  },
  {
    name: "Toba Tek Singh",
    province: "Punjab",
    tehsils: ["Toba Tek Singh", "Gojra", "Kamalia", "Pir Mahal"],
  },
  {
    name: "Vehari",
    province: "Punjab",
    tehsils: ["Vehari", "Burewala", "Mailsi"],
  },
  {
    name: "Wazirabad",
    province: "Punjab",
    tehsils: ["Wazirabad", "Ali Pur Chatha"],
  },

  // ─── Sindh ──────────────────────────────────────────────────────────────
  {
    name: "Badin",
    province: "Sindh",
    tehsils: ["Badin", "Matli", "Shaheed Fazil Rahu (Golarchi)", "Talhar", "Tando Bago"],
  },
  {
    name: "Dadu",
    province: "Sindh",
    tehsils: ["Dadu", "Johi", "Mehar", "Khairpur Nathan Shah"],
  },
  {
    name: "Ghotki",
    province: "Sindh",
    tehsils: ["Mirpur Mathelo", "Ghotki", "Daharki", "Ubauro", "KhanGarh (Khanpur Mahar)"],
  },
  {
    name: "Hyderabad",
    province: "Sindh",
    tehsils: ["Hyderabad City", "Hyderabad Rural", "Latifabad", "Qasimabad"],
  },
  {
    name: "Jacobabad",
    province: "Sindh",
    tehsils: ["Jacobabad", "Garhi Khairo", "Thul"],
  },
  {
    name: "Jamshoro",
    province: "Sindh",
    tehsils: ["Kotri", "Sehwan", "Manjhand", "Thana Bula Khan"],
  },
  {
    name: "Karachi Central",
    province: "Sindh",
    tehsils: ["Karachi Central", "Liaquatabad", "Gulberg", "Nazimabad", "New Karachi", "North Nazimabad"],
  },
  {
    name: "Karachi East",
    province: "Sindh",
    tehsils: ["Karachi East", "Gulshan-e-Iqbal", "Jamshed Town", "Ferozabad", "Gulzar-e-Hijri"],
  },
  {
    name: "Karachi South",
    province: "Sindh",
    tehsils: ["Karachi South", "Saddar", "Arambagh", "Civil Lines", "Garden", "Lyari"],
  },
  {
    name: "Karachi West",
    province: "Sindh",
    tehsils: ["Karachi West", "Manghopir", "Mominabad", "Orangi", "Baldia"],
  },
  {
    name: "Kashmore",
    province: "Sindh",
    tehsils: ["Kashmore", "Kandhkot", "Tangwani"],
  },
  {
    name: "Keamari",
    province: "Sindh",
    tehsils: ["Keamari", "SITE", "Baldia", "Mauripur", "Harbour"],
  },
  {
    name: "Khairpur",
    province: "Sindh",
    tehsils: ["Khairpur", "Gambat", "Kot Diji", "Kingri", "Sobhodero", "Nara", "Thari Mirwah", "Faiz Ganj"],
  },
  {
    name: "Korangi",
    province: "Sindh",
    tehsils: ["Korangi", "Landhi", "Shah Faisal", "Model Colony"],
  },
  {
    name: "Kambar Shahdadkot",
    province: "Sindh",
    tehsils: ["Kambar", "Shahdadkot", "Mirokhan", "Nasirabad", "Qubo Saeed Khan", "Sijawal Junejo", "Warah"],
  },
  {
    name: "Larkana",
    province: "Sindh",
    tehsils: ["Larkana", "Ratodero", "Bakrani", "Dokri"],
  },
  {
    name: "Malir",
    province: "Sindh",
    tehsils: ["Malir", "Bin Qasim", "Gadap", "Ibrahim Hyderi", "Murad Memon", "Shah Murad"],
  },
  {
    name: "Matiari",
    province: "Sindh",
    tehsils: ["Matiari", "Hala", "Saeedabad"],
  },
  {
    name: "Mirpur Khas",
    province: "Sindh",
    tehsils: ["Mirpur Khas", "Digri", "Kot Ghulam Muhammad", "Jhuddo", "Sindhri", "Shujabad", "Hussain Bux Marri"],
  },
  {
    name: "Naushahro Feroze",
    province: "Sindh",
    tehsils: ["Naushahro Feroze", "Bhiria", "Kandiaro", "Mehrabpur", "Moro"],
  },
  {
    name: "Shaheed Benazirabad",
    province: "Sindh",
    tehsils: ["Nawabshah", "Daur", "Kazi Ahmed", "Sakrand"],
  },
  {
    name: "Sanghar",
    province: "Sindh",
    tehsils: ["Sanghar", "Jam Nawaz Ali", "Khipro", "Shahdadpur", "Sinjhoro", "Tando Adam"],
  },
  {
    name: "Shikarpur",
    province: "Sindh",
    tehsils: ["Shikarpur", "Garhi Yasin", "Khanpur", "Lakhi Ghulam Shah"],
  },
  {
    name: "Sujawal",
    province: "Sindh",
    tehsils: ["Sujawal", "Jati", "Mirpur Bathoro", "Shah Bandar", "Kharo Chan"],
  },
  {
    name: "Sukkur",
    province: "Sindh",
    tehsils: ["Sukkur City", "New Sukkur", "Rohri", "Pano Akil", "Salehpat"],
  },
  {
    name: "Tando Allahyar",
    province: "Sindh",
    tehsils: ["Tando Allahyar", "Chamber", "Jhando Mari"],
  },
  {
    name: "Tando Muhammad Khan",
    province: "Sindh",
    tehsils: ["Tando Muhammad Khan", "Bulri Shah Karim", "Tando Ghulam Hyder"],
  },
  {
    name: "Tharparkar",
    province: "Sindh",
    tehsils: ["Mithi", "Chachro", "Dahli", "Diplo", "Islamkot", "Kaloi", "Nagarparkar"],
  },
  {
    name: "Thatta",
    province: "Sindh",
    tehsils: ["Thatta", "Ghorabari", "Keti Bandar", "Mirpur Sakro"],
  },
  {
    name: "Umerkot",
    province: "Sindh",
    tehsils: ["Umerkot", "Kunri", "Pithoro", "Samaro"],
  },

  // ─── Khyber Pakhtunkhwa ─────────────────────────────────────────────────
  {
    name: "Abbottabad",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Abbottabad", "Havelian", "Lora", "Lower Tanawal"],
  },
  {
    name: "Bajaur",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Khar Bajaur", "Barang", "Nawagai", "Mamund", "Salarzai", "Utman Khel", "Chamarkand"],
  },
  {
    name: "Bannu",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Bannu", "Domel", "Bakkakhel", "Kakki", "Miryan", "Wazir"],
  },
  {
    name: "Battagram",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Battagram", "Allai"],
  },
  {
    name: "Buner",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Daggar", "Gagra", "Khudu Khel", "Mandanr", "Chagharzai", "Gadezai"],
  },
  {
    name: "Charsadda",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Charsadda", "Tangi", "Shabqadar"],
  },
  {
    name: "Chitral Lower",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Chitral", "Drosh"],
  },
  {
    name: "Chitral Upper",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Mastuj", "Mulkhow", "Torkhow", "Buni"],
  },
  {
    name: "Dera Ismail Khan",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["D.I. Khan", "Kulachi", "Paharpur", "Paroa", "Daraban", "Paniala"],
  },
  {
    name: "Dir Lower",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Timergara", "Lal Qila", "Samarbagh", "Adenzai (Chakdara)", "Munda", "Balambat", "Khall"],
  },
  {
    name: "Dir Upper",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Dir", "Sharingal", "Wari", "Barawal", "Lar Jam", "Kalkot"],
  },
  {
    name: "Hangu",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Hangu", "Thall"],
  },
  {
    name: "Haripur",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Haripur", "Ghazi", "Khanpur"],
  },
  {
    name: "Karak",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Karak", "Banda Daud Shah", "Takht-e-Nasrati"],
  },
  {
    name: "Khyber",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Bara", "Jamrud", "Landi Kotal", "Mulla Gori"],
  },
  {
    name: "Kohat",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Kohat", "Lachi", "Gumbat", "Dara Adam Khel"],
  },
  {
    name: "Kohistan Lower",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Bankad", "Pattan"],
  },
  {
    name: "Kohistan Upper",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Dasu", "Kandia", "Seo", "Harban Basha"],
  },
  {
    name: "Kolai-Palas",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Kolai", "Palas", "Batu Gera"],
  },
  {
    name: "Kurram",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Central Kurram", "Lower Kurram", "Upper Kurram"],
  },
  {
    name: "Malakand",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Batkhela", "Dargai", "Sam Ranizai"],
  },
  {
    name: "Mansehra",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Mansehra", "Balakot", "Oghi", "Baffa Pakhal", "Darband"],
  },
  {
    name: "Mardan",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Mardan", "Takht Bhai", "Katlang", "Rustam", "Garhi Kapura"],
  },
  {
    name: "Mohmand",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Halimzai", "Pandyali", "Prang Ghar", "Safi", "Upper Mohmand", "Ambar Utman Khel", "Baizai"],
  },
  {
    name: "North Waziristan",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Miran Shah", "Mir Ali", "Razmak", "Datta Khel", "Dossali", "Garyum", "Ghulam Khan", "Shewa", "Spinwam"],
  },
  {
    name: "Nowshera",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Nowshera", "Pabbi", "Jehangira"],
  },
  {
    name: "Orakzai",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Lower Orakzai", "Upper Orakzai", "Ismailzai", "Central Orakzai"],
  },
  {
    name: "Peshawar",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Peshawar City", "Shah Alam", "Saddar", "Chamkani", "Badaber", "Mathra", "Hassan Khel"],
  },
  {
    name: "Shangla",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Alpuri", "Besham", "Chakesar", "Martung", "Puran", "Bely Baba"],
  },
  {
    name: "South Waziristan Lower",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Wana", "Shakai", "Toi Khulla", "Birmil"],
  },
  {
    name: "South Waziristan Upper",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Ladha", "Makin", "Sararogha", "Serwekai", "Tiarza", "Shawal"],
  },
  {
    name: "Swabi",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Swabi", "Chota Lahor", "Topi", "Razzar"],
  },
  {
    name: "Swat",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Babuzai (Mingora)", "Barikot", "Behrain", "Charbagh", "Kabal", "Khwaza Khela", "Matta"],
  },
  {
    name: "Tank",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Tank", "Jandola"],
  },
  {
    name: "Torghar",
    province: "Khyber Pakhtunkhwa",
    tehsils: ["Judba", "Kandar Hassanzai"],
  },

  // ─── Balochistan ────────────────────────────────────────────────────────
  {
    name: "Awaran",
    province: "Balochistan",
    tehsils: ["Awaran", "Gishkore", "Jhal Jhao", "Korak Jahoo", "Mashkay"],
  },
  {
    name: "Barkhan",
    province: "Balochistan",
    tehsils: ["Barkhan"],
  },
  {
    name: "Chagai",
    province: "Balochistan",
    tehsils: ["Dalbandin", "Nok Kundi", "Taftan", "Chagai"],
  },
  {
    name: "Chaman",
    province: "Balochistan",
    tehsils: ["Chaman", "Saddar Chaman"],
  },
  {
    name: "Dera Bugti",
    province: "Balochistan",
    tehsils: ["Dera Bugti", "Phelan Bugti", "Sui", "Baiker"],
  },
  {
    name: "Duki",
    province: "Balochistan",
    tehsils: ["Duki"],
  },
  {
    name: "Gwadar",
    province: "Balochistan",
    tehsils: ["Gwadar", "Pasni", "Ormara", "Jiwani", "Suntsar"],
  },
  {
    name: "Harnai",
    province: "Balochistan",
    tehsils: ["Harnai", "Shahrag", "Khoast"],
  },
  {
    name: "Hub",
    province: "Balochistan",
    tehsils: ["Hub", "Gadani", "Sonmiani (Winder)", "Sakran", "Dureji"],
  },
  {
    name: "Jaffarabad",
    province: "Balochistan",
    tehsils: ["Dera Allah Yar", "Jhatpat", "Usta Mohammad"],
  },
  {
    name: "Jhal Magsi",
    province: "Balochistan",
    tehsils: ["Gandawa", "Jhal Magsi", "Mirpur"],
  },
  {
    name: "Kalat",
    province: "Balochistan",
    tehsils: ["Kalat", "Manguchar", "Johan", "Gazg"],
  },
  {
    name: "Kech (Turbat)",
    province: "Balochistan",
    tehsils: ["Turbat", "Mand", "Tump", "Buleda", "Dasht", "Zamuran", "Balnigor"],
  },
  {
    name: "Kharan",
    province: "Balochistan",
    tehsils: ["Kharan", "Sar-Kharan", "Tohumulk"],
  },
  {
    name: "Khuzdar",
    province: "Balochistan",
    tehsils: ["Khuzdar", "Nal", "Wadh", "Zehri", "Baghbana", "Aranji", "Moola", "Karakh", "Ornach"],
  },
  {
    name: "Killa Abdullah",
    province: "Balochistan",
    tehsils: ["Killa Abdullah", "Dobandi", "Gulistan"],
  },
  {
    name: "Killa Saifullah",
    province: "Balochistan",
    tehsils: ["Killa Saifullah", "Muslim Bagh", "Loiband", "Badini", "Kanmetharzai"],
  },
  {
    name: "Kohlu",
    province: "Balochistan",
    tehsils: ["Kohlu", "Maiwand", "Kahan", "Tamboo"],
  },
  {
    name: "Lasbela",
    province: "Balochistan",
    tehsils: ["Bela", "Uthal", "Kanraj", "Lakhra", "Liari"],
  },
  {
    name: "Lehri",
    province: "Balochistan",
    tehsils: ["Bakhtiarabad", "Bhag"],
  },
  {
    name: "Loralai",
    province: "Balochistan",
    tehsils: ["Loralai", "Bori", "Mekhtar"],
  },
  {
    name: "Mastung",
    province: "Balochistan",
    tehsils: ["Mastung", "Dasht", "Kardigap"],
  },
  {
    name: "Musakhel",
    province: "Balochistan",
    tehsils: ["Musakhel", "Kingri", "Toisar", "Drug"],
  },
  {
    name: "Nasirabad",
    province: "Balochistan",
    tehsils: ["Dera Murad Jamali", "Chattar", "Baba Kot", "Tamboo"],
  },
  {
    name: "Nushki",
    province: "Balochistan",
    tehsils: ["Nushki", "Dak"],
  },
  {
    name: "Panjgur",
    province: "Balochistan",
    tehsils: ["Panjgur", "Gowargo", "Gichk", "Paroom"],
  },
  {
    name: "Pishin",
    province: "Balochistan",
    tehsils: ["Pishin", "Barshore", "Karezat", "Hurramzai", "Bostan", "Surkhab"],
  },
  {
    name: "Quetta",
    province: "Balochistan",
    tehsils: ["Quetta City", "Saddar Quetta", "Panjpai", "Kuchlak"],
  },
  {
    name: "Sibi",
    province: "Balochistan",
    tehsils: ["Sibi", "Kutmandai", "Sangan"],
  },
  {
    name: "Sohbatpur",
    province: "Balochistan",
    tehsils: ["Sohbatpur", "Faridabad", "Sanhari", "Manjhipur"],
  },
  {
    name: "Surab",
    province: "Balochistan",
    tehsils: ["Surab"],
  },
  {
    name: "Usta Muhammad",
    province: "Balochistan",
    tehsils: ["Usta Muhammad", "Gandakha"],
  },
  {
    name: "Washuk",
    province: "Balochistan",
    tehsils: ["Washuk", "Besima", "Mashkel", "Nag", "Shahgori"],
  },
  {
    name: "Zhob",
    province: "Balochistan",
    tehsils: ["Zhob", "Sambaza", "Ashwat", "Qamar Din Karez"],
  },
  {
    name: "Ziarat",
    province: "Balochistan",
    tehsils: ["Ziarat", "Sinjawi"],
  },

  // ─── Islamabad Capital Territory ────────────────────────────────────────
  {
    name: "Islamabad",
    province: "Islamabad Capital Territory",
    tehsils: ["Islamabad", "Bhara Kahu", "Sihala", "Nilore", "Tarnol"],
  },

  // ─── Azad Jammu & Kashmir ───────────────────────────────────────────────
  {
    name: "Bagh",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Bagh", "Dhirkot", "Hari Ghel", "Rera"],
  },
  {
    name: "Bhimber",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Bhimber", "Barnala", "Samahni"],
  },
  {
    name: "Hattian Bala",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Hattian Bala", "Chikar", "Leepa"],
  },
  {
    name: "Haveli",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Forward Kahuta", "Khurshidabad", "Mumtazabad"],
  },
  {
    name: "Kotli",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Kotli", "Charhoi", "Fatehpur Thakiala", "Khuiratta", "Sehnsa"],
  },
  {
    name: "Mirpur",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Mirpur", "Dadyal"],
  },
  {
    name: "Muzaffarabad",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Muzaffarabad", "Naseerabad"],
  },
  {
    name: "Neelum",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Athmuqam", "Sharda"],
  },
  {
    name: "Poonch",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Rawalakot", "Abbaspur", "Hajira", "Thorar"],
  },
  {
    name: "Sudhanoti",
    province: "Azad Jammu & Kashmir",
    tehsils: ["Pallandri", "Baloch", "Mang", "Trarkhel"],
  },

  // ─── Gilgit-Baltistan ───────────────────────────────────────────────────
  {
    name: "Astore",
    province: "Gilgit-Baltistan",
    tehsils: ["Astore", "Shounter"],
  },
  {
    name: "Diamer",
    province: "Gilgit-Baltistan",
    tehsils: ["Chilas", "Darel", "Tangir"],
  },
  {
    name: "Ghanche",
    province: "Gilgit-Baltistan",
    tehsils: ["Khaplu", "Daghoni", "Mashabrum"],
  },
  {
    name: "Ghizer",
    province: "Gilgit-Baltistan",
    tehsils: ["Gupis", "Ishkoman", "Punial", "Yasin"],
  },
  {
    name: "Gilgit",
    province: "Gilgit-Baltistan",
    tehsils: ["Gilgit", "Danyor", "Juglot"],
  },
  {
    name: "Hunza",
    province: "Gilgit-Baltistan",
    tehsils: ["Aliabad", "Gojal", "Shinaki"],
  },
  {
    name: "Kharmang",
    province: "Gilgit-Baltistan",
    tehsils: ["Tolti"],
  },
  {
    name: "Nagar",
    province: "Gilgit-Baltistan",
    tehsils: ["Nagar I", "Nagar II"],
  },
  {
    name: "Roundu",
    province: "Gilgit-Baltistan",
    tehsils: ["Roundu"],
  },
  {
    name: "Shigar",
    province: "Gilgit-Baltistan",
    tehsils: ["Shigar"],
  },
  {
    name: "Skardu",
    province: "Gilgit-Baltistan",
    tehsils: ["Skardu", "Gultari", "Gamba"],
  },
];

/**
 * All prominent cities and towns in Pakistan mapped to their District & Province.
 * Sorted for quick search and selection.
 */
export const PAKISTAN_CITIES: CityData[] = [
  // Major metropolitan cities first
  { name: "Karachi", district: "Karachi South", tehsil: "Saddar", province: "Sindh" },
  { name: "Lahore", district: "Lahore", tehsil: "City Lahore", province: "Punjab" },
  { name: "Faisalabad", district: "Faisalabad", tehsil: "Faisalabad City", province: "Punjab" },
  { name: "Rawalpindi", district: "Rawalpindi", tehsil: "Rawalpindi", province: "Punjab" },
  { name: "Islamabad", district: "Islamabad", tehsil: "Islamabad", province: "Islamabad Capital Territory" },
  { name: "Gujranwala", district: "Gujranwala", tehsil: "Gujranwala City", province: "Punjab" },
  { name: "Peshawar", district: "Peshawar", tehsil: "Peshawar City", province: "Khyber Pakhtunkhwa" },
  { name: "Multan", district: "Multan", tehsil: "Multan City", province: "Punjab" },
  { name: "Hyderabad", district: "Hyderabad", tehsil: "Hyderabad City", province: "Sindh" },
  { name: "Quetta", district: "Quetta", tehsil: "Quetta City", province: "Balochistan" },

  // Punjab Cities & Towns
  { name: "Abbottabad", district: "Abbottabad", tehsil: "Abbottabad", province: "Khyber Pakhtunkhwa" },
  { name: "Ahmadpur East", district: "Bahawalpur", tehsil: "Ahmadpur East", province: "Punjab" },
  { name: "Ali Pur", district: "Muzaffargarh", tehsil: "Alipur", province: "Punjab" },
  { name: "Ali Pur Chatha", district: "Wazirabad", tehsil: "Ali Pur Chatha", province: "Punjab" },
  { name: "Arifwala", district: "Pakpattan", tehsil: "Arifwala", province: "Punjab" },
  { name: "Attock", district: "Attock", tehsil: "Attock", province: "Punjab" },
  { name: "Bahawalnagar", district: "Bahawalnagar", tehsil: "Bahawalnagar", province: "Punjab" },
  { name: "Bahawalpur", district: "Bahawalpur", tehsil: "Bahawalpur City", province: "Punjab" },
  { name: "Bhakkar", district: "Bhakkar", tehsil: "Bhakkar", province: "Punjab" },
  { name: "Bhalwal", district: "Sargodha", tehsil: "Bhalwal", province: "Punjab" },
  { name: "Bhowana", district: "Chiniot", tehsil: "Bhowana", province: "Punjab" },
  { name: "Burewala", district: "Vehari", tehsil: "Burewala", province: "Punjab" },
  { name: "Chak Jhumra", district: "Faisalabad", tehsil: "Chak Jhumra", province: "Punjab" },
  { name: "Chakwal", district: "Chakwal", tehsil: "Chakwal", province: "Punjab" },
  { name: "Chichawatni", district: "Sahiwal", tehsil: "Chichawatni", province: "Punjab" },
  { name: "Chiniot", district: "Chiniot", tehsil: "Chiniot", province: "Punjab" },
  { name: "Chishtian", district: "Bahawalnagar", tehsil: "Chishtian", province: "Punjab" },
  { name: "Choa Saidan Shah", district: "Chakwal", tehsil: "Choa Saidan Shah", province: "Punjab" },
  { name: "Chunian", district: "Kasur", tehsil: "Chunian", province: "Punjab" },
  { name: "Daska", district: "Sialkot", tehsil: "Daska", province: "Punjab" },
  { name: "Depalpur", district: "Okara", tehsil: "Depalpur", province: "Punjab" },
  { name: "Dera Ghazi Khan", district: "Dera Ghazi Khan", tehsil: "DG Khan", province: "Punjab" },
  { name: "Dina", district: "Jhelum", tehsil: "Dina", province: "Punjab" },
  { name: "Dunyapur", district: "Lodhran", tehsil: "Dunyapur", province: "Punjab" },
  { name: "Fateh Jang", district: "Attock", tehsil: "Fateh Jang", province: "Punjab" },
  { name: "Gojra", district: "Toba Tek Singh", tehsil: "Gojra", province: "Punjab" },
  { name: "Gujar Khan", district: "Rawalpindi", tehsil: "Gujar Khan", province: "Punjab" },
  { name: "Gujrat", district: "Gujrat", tehsil: "Gujrat", province: "Punjab" },
  { name: "Hafizabad", district: "Hafizabad", tehsil: "Hafizabad", province: "Punjab" },
  { name: "Haroonabad", district: "Bahawalnagar", tehsil: "Haroonabad", province: "Punjab" },
  { name: "Hasilpur", district: "Bahawalpur", tehsil: "Hasilpur", province: "Punjab" },
  { name: "Hassan Abdal", district: "Attock", tehsil: "Hassan Abdal", province: "Punjab" },
  { name: "Haveli Lakha", district: "Okara", tehsil: "Depalpur", province: "Punjab" },
  { name: "Hazro", district: "Attock", tehsil: "Hazro", province: "Punjab" },
  { name: "Jahanian", district: "Khanewal", tehsil: "Jahanian", province: "Punjab" },
  { name: "Jalalpur Jattan", district: "Gujrat", tehsil: "Jalalpur Jattan", province: "Punjab" },
  { name: "Jalalpur Pirwala", district: "Multan", tehsil: "Jalalpur Pirwala", province: "Punjab" },
  { name: "Jampur", district: "Rajanpur", tehsil: "Jampur", province: "Punjab" },
  { name: "Jand", district: "Attock", tehsil: "Jand", province: "Punjab" },
  { name: "Jaranwala", district: "Faisalabad", tehsil: "Jaranwala", province: "Punjab" },
  { name: "Jatoi", district: "Muzaffargarh", tehsil: "Jatoi", province: "Punjab" },
  { name: "Jhang", district: "Jhang", tehsil: "Jhang", province: "Punjab" },
  { name: "Jhelum", district: "Jhelum", tehsil: "Jhelum", province: "Punjab" },
  { name: "Kabirwala", district: "Khanewal", tehsil: "Kabirwala", province: "Punjab" },
  { name: "Kahror Pacca", district: "Lodhran", tehsil: "Kahror Pacca", province: "Punjab" },
  { name: "Kahuta", district: "Rawalpindi", tehsil: "Kahuta", province: "Punjab" },
  { name: "Kallar Kahar", district: "Chakwal", tehsil: "Kallar Kahar", province: "Punjab" },
  { name: "Kallar Syedan", district: "Rawalpindi", tehsil: "Kallar Syedan", province: "Punjab" },
  { name: "Kamalia", district: "Toba Tek Singh", tehsil: "Kamalia", province: "Punjab" },
  { name: "Kamoke", district: "Gujranwala", tehsil: "Kamoke", province: "Punjab" },
  { name: "Kasur", district: "Kasur", tehsil: "Kasur", province: "Punjab" },
  { name: "Khairpur Tamewali", district: "Bahawalpur", tehsil: "Khairpur Tamewali", province: "Punjab" },
  { name: "Khanewal", district: "Khanewal", tehsil: "Khanewal", province: "Punjab" },
  { name: "Khanpur", district: "Rahim Yar Khan", tehsil: "Khanpur", province: "Punjab" },
  { name: "Kharian", district: "Gujrat", tehsil: "Kharian", province: "Punjab" },
  { name: "Khushab", district: "Khushab", tehsil: "Khushab", province: "Punjab" },
  { name: "Kot Addu", district: "Kot Addu", tehsil: "Kot Addu", province: "Punjab" },
  { name: "Kot Momin", district: "Sargodha", tehsil: "Kot Momin", province: "Punjab" },
  { name: "Kot Radha Kishan", district: "Kasur", tehsil: "Kot Radha Kishan", province: "Punjab" },
  { name: "Kunjah", district: "Gujrat", tehsil: "Kunjah", province: "Punjab" },
  { name: "Lawa", district: "Talagang", tehsil: "Lawa", province: "Punjab" },
  { name: "Layyah", district: "Layyah", tehsil: "Layyah", province: "Punjab" },
  { name: "Liaquatpur", district: "Rahim Yar Khan", tehsil: "Liaquatpur", province: "Punjab" },
  { name: "Lodhran", district: "Lodhran", tehsil: "Lodhran", province: "Punjab" },
  { name: "Mailsi", district: "Vehari", tehsil: "Mailsi", province: "Punjab" },
  { name: "Malakwal", district: "Mandi Bahauddin", tehsil: "Malakwal", province: "Punjab" },
  { name: "Mandi Bahauddin", district: "Mandi Bahauddin", tehsil: "Mandi Bahauddin", province: "Punjab" },
  { name: "Mian Channu", district: "Khanewal", tehsil: "Mian Channu", province: "Punjab" },
  { name: "Mianwali", district: "Mianwali", tehsil: "Mianwali", province: "Punjab" },
  { name: "Minchinabad", district: "Bahawalnagar", tehsil: "Minchinabad", province: "Punjab" },
  { name: "Muridke", district: "Sheikhupura", tehsil: "Muridke", province: "Punjab" },
  { name: "Murree", district: "Murree", tehsil: "Murree", province: "Punjab" },
  { name: "Muzaffargarh", district: "Muzaffargarh", tehsil: "Muzaffargarh", province: "Punjab" },
  { name: "Nankana Sahib", district: "Nankana Sahib", tehsil: "Nankana Sahib", province: "Punjab" },
  { name: "Narowal", district: "Narowal", tehsil: "Narowal", province: "Punjab" },
  { name: "Nowshera Virkan", district: "Gujranwala", tehsil: "Nowshera Virkan", province: "Punjab" },
  { name: "Okara", district: "Okara", tehsil: "Okara", province: "Punjab" },
  { name: "Pakpattan", district: "Pakpattan", tehsil: "Pakpattan", province: "Punjab" },
  { name: "Pasrur", district: "Sialkot", tehsil: "Pasrur", province: "Punjab" },
  { name: "Pattoki", district: "Kasur", tehsil: "Pattoki", province: "Punjab" },
  { name: "Phalia", district: "Mandi Bahauddin", tehsil: "Phalia", province: "Punjab" },
  { name: "Pind Dadan Khan", district: "Jhelum", tehsil: "Pind Dadan Khan", province: "Punjab" },
  { name: "Pindi Bhattian", district: "Hafizabad", tehsil: "Pindi Bhattian", province: "Punjab" },
  { name: "Pindi Gheb", district: "Attock", tehsil: "Pindi Gheb", province: "Punjab" },
  { name: "Pir Mahal", district: "Toba Tek Singh", tehsil: "Pir Mahal", province: "Punjab" },
  { name: "Quaidabad", district: "Khushab", tehsil: "Quaidabad", province: "Punjab" },
  { name: "Rahim Yar Khan", district: "Rahim Yar Khan", tehsil: "Rahim Yar Khan", province: "Punjab" },
  { name: "Raiwind", district: "Lahore", tehsil: "Raiwind", province: "Punjab" },
  { name: "Rajanpur", district: "Rajanpur", tehsil: "Rajanpur", province: "Punjab" },
  { name: "Renala Khurd", district: "Okara", tehsil: "Renala Khurd", province: "Punjab" },
  { name: "Rojhan", district: "Rajanpur", tehsil: "Rojhan", province: "Punjab" },
  { name: "Sadiqabad", district: "Rahim Yar Khan", tehsil: "Sadiqabad", province: "Punjab" },
  { name: "Sahiwal", district: "Sahiwal", tehsil: "Sahiwal", province: "Punjab" },
  { name: "Sambrial", district: "Sialkot", tehsil: "Sambrial", province: "Punjab" },
  { name: "Samundri", district: "Faisalabad", tehsil: "Samundri", province: "Punjab" },
  { name: "Sangla Hill", district: "Nankana Sahib", tehsil: "Sangla Hill", province: "Punjab" },
  { name: "Sarai Alamgir", district: "Gujrat", tehsil: "Sarai Alamgir", province: "Punjab" },
  { name: "Sargodha", district: "Sargodha", tehsil: "Sargodha", province: "Punjab" },
  { name: "Shahkot", district: "Nankana Sahib", tehsil: "Shah Kot", province: "Punjab" },
  { name: "Shahpur", district: "Sargodha", tehsil: "Shahpur", province: "Punjab" },
  { name: "Shakargarh", district: "Narowal", tehsil: "Shakargarh", province: "Punjab" },
  { name: "Sheikhupura", district: "Sheikhupura", tehsil: "Sheikhupura", province: "Punjab" },
  { name: "Shorkot", district: "Jhang", tehsil: "Shorkot", province: "Punjab" },
  { name: "Shujabad", district: "Multan", tehsil: "Shujabad", province: "Punjab" },
  { name: "Sialkot", district: "Sialkot", tehsil: "Sialkot", province: "Punjab" },
  { name: "Sillanwali", district: "Sargodha", tehsil: "Sillanwali", province: "Punjab" },
  { name: "Sohawa", district: "Jhelum", tehsil: "Sohawa", province: "Punjab" },
  { name: "Talagang", district: "Talagang", tehsil: "Talagang", province: "Punjab" },
  { name: "Tandlianwala", district: "Faisalabad", tehsil: "Tandlianwala", province: "Punjab" },
  { name: "Taunsa", district: "Taunsa", tehsil: "Taunsa", province: "Punjab" },
  { name: "Taxila", district: "Rawalpindi", tehsil: "Taxila", province: "Punjab" },
  { name: "Toba Tek Singh", district: "Toba Tek Singh", tehsil: "Toba Tek Singh", province: "Punjab" },
  { name: "Vehari", district: "Vehari", tehsil: "Vehari", province: "Punjab" },
  { name: "Wah Cantt", district: "Rawalpindi", tehsil: "Taxila", province: "Punjab" },
  { name: "Wazirabad", district: "Wazirabad", tehsil: "Wazirabad", province: "Punjab" },
  { name: "Yazman", district: "Bahawalpur", tehsil: "Yazman", province: "Punjab" },
  { name: "Zafarwal", district: "Narowal", tehsil: "Zafarwal", province: "Punjab" },

  // Sindh Cities & Towns
  { name: "Badin", district: "Badin", tehsil: "Badin", province: "Sindh" },
  { name: "Chamber", district: "Tando Allahyar", tehsil: "Chamber", province: "Sindh" },
  { name: "Dadu", district: "Dadu", tehsil: "Dadu", province: "Sindh" },
  { name: "Daharki", district: "Ghotki", tehsil: "Daharki", province: "Sindh" },
  { name: "Digri", district: "Mirpur Khas", tehsil: "Digri", province: "Sindh" },
  { name: "Gambat", district: "Khairpur", tehsil: "Gambat", province: "Sindh" },
  { name: "Ghotki", district: "Ghotki", tehsil: "Ghotki", province: "Sindh" },
  { name: "Hala", district: "Matiari", tehsil: "Hala", province: "Sindh" },
  { name: "Jacobabad", district: "Jacobabad", tehsil: "Jacobabad", province: "Sindh" },
  { name: "Jamshoro", district: "Jamshoro", tehsil: "Kotri", province: "Sindh" },
  { name: "Kambar", district: "Kambar Shahdadkot", tehsil: "Kambar", province: "Sindh" },
  { name: "Kandhkot", district: "Kashmore", tehsil: "Kandhkot", province: "Sindh" },
  { name: "Kandiaro", district: "Naushahro Feroze", tehsil: "Kandiaro", province: "Sindh" },
  { name: "Kashmore", district: "Kashmore", tehsil: "Kashmore", province: "Sindh" },
  { name: "Khairpur", district: "Khairpur", tehsil: "Khairpur", province: "Sindh" },
  { name: "Khipro", district: "Sanghar", tehsil: "Khipro", province: "Sindh" },
  { name: "Kot Diji", district: "Khairpur", tehsil: "Kot Diji", province: "Sindh" },
  { name: "Kotri", district: "Jamshoro", tehsil: "Kotri", province: "Sindh" },
  { name: "Kunri", district: "Umerkot", tehsil: "Kunri", province: "Sindh" },
  { name: "Larkana", district: "Larkana", tehsil: "Larkana", province: "Sindh" },
  { name: "Matli", district: "Badin", tehsil: "Matli", province: "Sindh" },
  { name: "Mehar", district: "Dadu", tehsil: "Mehar", province: "Sindh" },
  { name: "Mehrabpur", district: "Naushahro Feroze", tehsil: "Mehrabpur", province: "Sindh" },
  { name: "Mirpur Khas", district: "Mirpur Khas", tehsil: "Mirpur Khas", province: "Sindh" },
  { name: "Mirpur Mathelo", district: "Ghotki", tehsil: "Mirpur Mathelo", province: "Sindh" },
  { name: "Mithi", district: "Tharparkar", tehsil: "Mithi", province: "Sindh" },
  { name: "Moro", district: "Naushahro Feroze", tehsil: "Moro", province: "Sindh" },
  { name: "Naushahro Feroze", district: "Naushahro Feroze", tehsil: "Naushahro Feroze", province: "Sindh" },
  { name: "Nawabshah", district: "Shaheed Benazirabad", tehsil: "Nawabshah", province: "Sindh" },
  { name: "Pano Akil", district: "Sukkur", tehsil: "Pano Akil", province: "Sindh" },
  { name: "Ratodero", district: "Larkana", tehsil: "Ratodero", province: "Sindh" },
  { name: "Rohri", district: "Sukkur", tehsil: "Rohri", province: "Sindh" },
  { name: "Sanghar", district: "Sanghar", tehsil: "Sanghar", province: "Sindh" },
  { name: "Sehwan", district: "Jamshoro", tehsil: "Sehwan", province: "Sindh" },
  { name: "Shahdadkot", district: "Kambar Shahdadkot", tehsil: "Shahdadkot", province: "Sindh" },
  { name: "Shahdadpur", district: "Sanghar", tehsil: "Shahdadpur", province: "Sindh" },
  { name: "Shikarpur", district: "Shikarpur", tehsil: "Shikarpur", province: "Sindh" },
  { name: "Sujawal", district: "Sujawal", tehsil: "Sujawal", province: "Sindh" },
  { name: "Sukkur", district: "Sukkur", tehsil: "Sukkur City", province: "Sindh" },
  { name: "Tando Adam", district: "Sanghar", tehsil: "Tando Adam", province: "Sindh" },
  { name: "Tando Allahyar", district: "Tando Allahyar", tehsil: "Tando Allahyar", province: "Sindh" },
  { name: "Tando Muhammad Khan", district: "Tando Muhammad Khan", tehsil: "Tando Muhammad Khan", province: "Sindh" },
  { name: "Thul", district: "Jacobabad", tehsil: "Thul", province: "Sindh" },
  { name: "Thatta", district: "Thatta", tehsil: "Thatta", province: "Sindh" },
  { name: "Umerkot", district: "Umerkot", tehsil: "Umerkot", province: "Sindh" },

  // Khyber Pakhtunkhwa Cities & Towns
  { name: "Alpuri", district: "Shangla", tehsil: "Alpuri", province: "Khyber Pakhtunkhwa" },
  { name: "Bannu", district: "Bannu", tehsil: "Bannu", province: "Khyber Pakhtunkhwa" },
  { name: "Batkhela", district: "Malakand", tehsil: "Batkhela", province: "Khyber Pakhtunkhwa" },
  { name: "Battagram", district: "Battagram", tehsil: "Battagram", province: "Khyber Pakhtunkhwa" },
  { name: "Chakdara", district: "Dir Lower", tehsil: "Adenzai (Chakdara)", province: "Khyber Pakhtunkhwa" },
  { name: "Charsadda", district: "Charsadda", tehsil: "Charsadda", province: "Khyber Pakhtunkhwa" },
  { name: "Chitral", district: "Chitral Lower", tehsil: "Chitral", province: "Khyber Pakhtunkhwa" },
  { name: "Dera Ismail Khan", district: "Dera Ismail Khan", tehsil: "D.I. Khan", province: "Khyber Pakhtunkhwa" },
  { name: "Dir", district: "Dir Upper", tehsil: "Dir", province: "Khyber Pakhtunkhwa" },
  { name: "Hangu", district: "Hangu", tehsil: "Hangu", province: "Khyber Pakhtunkhwa" },
  { name: "Haripur", district: "Haripur", tehsil: "Haripur", province: "Khyber Pakhtunkhwa" },
  { name: "Havelian", district: "Abbottabad", tehsil: "Havelian", province: "Khyber Pakhtunkhwa" },
  { name: "Jamrud", district: "Khyber", tehsil: "Jamrud", province: "Khyber Pakhtunkhwa" },
  { name: "Karak", district: "Karak", tehsil: "Karak", province: "Khyber Pakhtunkhwa" },
  { name: "Kohat", district: "Kohat", tehsil: "Kohat", province: "Khyber Pakhtunkhwa" },
  { name: "Kulachi", district: "Dera Ismail Khan", tehsil: "Kulachi", province: "Khyber Pakhtunkhwa" },
  { name: "Landi Kotal", district: "Khyber", tehsil: "Landi Kotal", province: "Khyber Pakhtunkhwa" },
  { name: "Mansehra", district: "Mansehra", tehsil: "Mansehra", province: "Khyber Pakhtunkhwa" },
  { name: "Mardan", district: "Mardan", tehsil: "Mardan", province: "Khyber Pakhtunkhwa" },
  { name: "Mingora (Swat)", district: "Swat", tehsil: "Babuzai (Mingora)", province: "Khyber Pakhtunkhwa" },
  { name: "Miran Shah", district: "North Waziristan", tehsil: "Miran Shah", province: "Khyber Pakhtunkhwa" },
  { name: "Nowshera", district: "Nowshera", tehsil: "Nowshera", province: "Khyber Pakhtunkhwa" },
  { name: "Pabbi", district: "Nowshera", tehsil: "Pabbi", province: "Khyber Pakhtunkhwa" },
  { name: "Risalpur", district: "Nowshera", tehsil: "Nowshera", province: "Khyber Pakhtunkhwa" },
  { name: "Shabqadar", district: "Charsadda", tehsil: "Shabqadar", province: "Khyber Pakhtunkhwa" },
  { name: "Swabi", district: "Swabi", tehsil: "Swabi", province: "Khyber Pakhtunkhwa" },
  { name: "Takht Bhai", district: "Mardan", tehsil: "Takht Bhai", province: "Khyber Pakhtunkhwa" },
  { name: "Tank", district: "Tank", tehsil: "Tank", province: "Khyber Pakhtunkhwa" },
  { name: "Timergara", district: "Dir Lower", tehsil: "Timergara", province: "Khyber Pakhtunkhwa" },
  { name: "Topi", district: "Swabi", tehsil: "Topi", province: "Khyber Pakhtunkhwa" },
  { name: "Wana", district: "South Waziristan Lower", tehsil: "Wana", province: "Khyber Pakhtunkhwa" },

  // Balochistan Cities & Towns
  { name: "Bela", district: "Lasbela", tehsil: "Bela", province: "Balochistan" },
  { name: "Chaman", district: "Chaman", tehsil: "Chaman", province: "Balochistan" },
  { name: "Dalbandin", district: "Chagai", tehsil: "Dalbandin", province: "Balochistan" },
  { name: "Dera Allah Yar", district: "Jaffarabad", tehsil: "Dera Allah Yar", province: "Balochistan" },
  { name: "Dera Bugti", district: "Dera Bugti", tehsil: "Dera Bugti", province: "Balochistan" },
  { name: "Dera Murad Jamali", district: "Nasirabad", tehsil: "Dera Murad Jamali", province: "Balochistan" },
  { name: "Duki", district: "Duki", tehsil: "Duki", province: "Balochistan" },
  { name: "Gadani", district: "Hub", tehsil: "Gadani", province: "Balochistan" },
  { name: "Gwadar", district: "Gwadar", tehsil: "Gwadar", province: "Balochistan" },
  { name: "Harnai", district: "Harnai", tehsil: "Harnai", province: "Balochistan" },
  { name: "Hub", district: "Hub", tehsil: "Hub", province: "Balochistan" },
  { name: "Kalat", district: "Kalat", tehsil: "Kalat", province: "Balochistan" },
  { name: "Kharan", district: "Kharan", tehsil: "Kharan", province: "Balochistan" },
  { name: "Khuzdar", district: "Khuzdar", tehsil: "Khuzdar", province: "Balochistan" },
  { name: "Killa Abdullah", district: "Killa Abdullah", tehsil: "Killa Abdullah", province: "Balochistan" },
  { name: "Killa Saifullah", district: "Killa Saifullah", tehsil: "Killa Saifullah", province: "Balochistan" },
  { name: "Kohlu", district: "Kohlu", tehsil: "Kohlu", province: "Balochistan" },
  { name: "Loralai", district: "Loralai", tehsil: "Loralai", province: "Balochistan" },
  { name: "Mastung", district: "Mastung", tehsil: "Mastung", province: "Balochistan" },
  { name: "Muslim Bagh", district: "Killa Saifullah", tehsil: "Muslim Bagh", province: "Balochistan" },
  { name: "Nushki", district: "Nushki", tehsil: "Nushki", province: "Balochistan" },
  { name: "Ormara", district: "Gwadar", tehsil: "Ormara", province: "Balochistan" },
  { name: "Panjgur", district: "Panjgur", tehsil: "Panjgur", province: "Balochistan" },
  { name: "Pasni", district: "Gwadar", tehsil: "Pasni", province: "Balochistan" },
  { name: "Pishin", district: "Pishin", tehsil: "Pishin", province: "Balochistan" },
  { name: "Sibi", district: "Sibi", tehsil: "Sibi", province: "Balochistan" },
  { name: "Sui", district: "Dera Bugti", tehsil: "Sui", province: "Balochistan" },
  { name: "Surab", district: "Surab", tehsil: "Surab", province: "Balochistan" },
  { name: "Turbat", district: "Kech (Turbat)", tehsil: "Turbat", province: "Balochistan" },
  { name: "Usta Muhammad", district: "Usta Muhammad", tehsil: "Usta Muhammad", province: "Balochistan" },
  { name: "Uthal", district: "Lasbela", tehsil: "Uthal", province: "Balochistan" },
  { name: "Zhob", district: "Zhob", tehsil: "Zhob", province: "Balochistan" },
  { name: "Ziarat", district: "Ziarat", tehsil: "Ziarat", province: "Balochistan" },

  // Azad Jammu & Kashmir Cities & Towns
  { name: "Bagh", district: "Bagh", tehsil: "Bagh", province: "Azad Jammu & Kashmir" },
  { name: "Bhimber", district: "Bhimber", tehsil: "Bhimber", province: "Azad Jammu & Kashmir" },
  { name: "Dadyal", district: "Mirpur", tehsil: "Dadyal", province: "Azad Jammu & Kashmir" },
  { name: "Hattian Bala", district: "Hattian Bala", tehsil: "Hattian Bala", province: "Azad Jammu & Kashmir" },
  { name: "Kotli", district: "Kotli", tehsil: "Kotli", province: "Azad Jammu & Kashmir" },
  { name: "Mirpur (AJK)", district: "Mirpur", tehsil: "Mirpur", province: "Azad Jammu & Kashmir" },
  { name: "Muzaffarabad", district: "Muzaffarabad", tehsil: "Muzaffarabad", province: "Azad Jammu & Kashmir" },
  { name: "Pallandri", district: "Sudhanoti", tehsil: "Pallandri", province: "Azad Jammu & Kashmir" },
  { name: "Rawalakot", district: "Poonch", tehsil: "Rawalakot", province: "Azad Jammu & Kashmir" },
  { name: "Sharda", district: "Neelum", tehsil: "Sharda", province: "Azad Jammu & Kashmir" },

  // Gilgit-Baltistan Cities & Towns
  { name: "Aliabad", district: "Hunza", tehsil: "Aliabad", province: "Gilgit-Baltistan" },
  { name: "Astore", district: "Astore", tehsil: "Astore", province: "Gilgit-Baltistan" },
  { name: "Chilas", district: "Diamer", tehsil: "Chilas", province: "Gilgit-Baltistan" },
  { name: "Gilgit", district: "Gilgit", tehsil: "Gilgit", province: "Gilgit-Baltistan" },
  { name: "Khaplu", district: "Ghanche", tehsil: "Khaplu", province: "Gilgit-Baltistan" },
  { name: "Skardu", district: "Skardu", tehsil: "Skardu", province: "Gilgit-Baltistan" },
];

/**
 * Helper to get all districts, optionally filtered by province.
 */
export function getDistricts(province?: string): DistrictData[] {
  if (!province) return PAKISTAN_DISTRICTS_DATA;
  return PAKISTAN_DISTRICTS_DATA.filter(
    (d) => d.province.toLowerCase() === province.toLowerCase()
  );
}

/**
 * Helper to find district by name.
 */
export function getDistrictByName(districtName: string): DistrictData | undefined {
  if (!districtName) return undefined;
  return PAKISTAN_DISTRICTS_DATA.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase().trim()
  );
}

/**
 * Helper to get tehsils for a specific district.
 */
export function getTehsilsForDistrict(districtName: string): string[] {
  const district = getDistrictByName(districtName);
  return district ? district.tehsils : [];
}

/**
 * Search cities with fast substring / fuzzy match.
 */
export function searchPakistanCities(query: string, maxResults = 30): CityData[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return PAKISTAN_CITIES.slice(0, maxResults);

  const matched: CityData[] = [];
  const startsWith: CityData[] = [];
  const contains: CityData[] = [];

  for (const city of PAKISTAN_CITIES) {
    const cName = city.name.toLowerCase();
    const dName = city.district.toLowerCase();

    if (cName.startsWith(clean)) {
      startsWith.push(city);
    } else if (cName.includes(clean) || dName.includes(clean)) {
      contains.push(city);
    }
  }

  return [...startsWith, ...contains].slice(0, maxResults);
}

/**
 * Match a city name to its details (case-insensitive).
 */
export function findCity(cityName: string): CityData | undefined {
  if (!cityName) return undefined;
  const target = cityName.trim().toLowerCase();
  return PAKISTAN_CITIES.find((c) => c.name.toLowerCase() === target);
}
