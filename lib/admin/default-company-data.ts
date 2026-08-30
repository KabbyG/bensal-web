// Bensal Investment Co. Ltd.'s real company profile, sourced from
// info/BENPROFILE.pdf. This is the single source of truth for the
// `Company` singleton's initial content — used by `prisma/seed.ts` for
// fresh databases, and as the Company Settings form's fallback defaults
// when the row doesn't exist yet (e.g. seeding never ran in an
// environment), so an admin can bootstrap it with one click of "Save"
// instead of re-typing everything.
export const DEFAULT_COMPANY_DATA = {
  name: "Bensal Investment",
  legalName: "Bensal Investment Co. Ltd.",
  slogan:
    "From cleaning, gardening, and fumigation to electronics, ICT equipment, and building materials, Bensal delivers reliable supplies, procurement, and professional services to businesses, institutions, and customers across Tanzania — exactly when they need them.",
  description:
    "Bensal Investment Co. Ltd. is a privately owned company established in 2014 as a business corporation in Tanzania. The company basically deals with Cleaning & Gardening, Fumigation, Supply of Electronics, ICT Equipment, and Building Materials. It has more than 50 staff, including some professionals.",
  mission:
    "We are the best in Cleaning & Gardening, Fumigation, Supply of Electronics, ICT Equipment, and Building Materials that provide quality services for customer satisfaction in Tanzania.",
  vision:
    "We are well prepared to compete globally, extending the same quality and professionalism that has driven our growth across Tanzania.",
  foundedYear: 2014,
  staffCount: "50+",
  email: "md@bensal.co.tz",
  altEmails: ["benjamin.mtani66@gmail.com", "bensalinvestmentcoltd@gmail.com"],
  phone: "+255 716 575 253",
  altPhones: ["+255 692 484 800"],
  whatsapp: "255716575253",
  address: "IPS Building, Azikiwe Street",
  city: "Dar es Salaam",
  country: "Tanzania",
  mapEmbedUrl: "https://www.google.com/maps?q=IPS+Building+Azikiwe+Street+Dar+es+Salaam+Tanzania&output=embed",
  // Not specified in the source profile — reasonable East Africa business
  // defaults, editable by the admin once real hours are confirmed.
  businessHours: [
    { day: "Monday – Friday", open: "08:00", close: "17:00" },
    { day: "Saturday", open: "08:00", close: "13:00" },
    { day: "Sunday", open: "Closed", close: "" },
  ],
  // No social media links were found in the source material — placeholders
  // so the icons render; replace with real URLs via Admin > Company Settings.
  socials: { facebook: "#", instagram: "#", linkedin: "#" },
  stats: [
    { label: "Business Growth", value: 85, suffix: "%" },
    { label: "Business Sales", value: 80, suffix: "%" },
  ],
  branches: [
    "Dar es Salaam (Head Office)",
    "Morogoro",
    "Mbeya",
    "Dodoma",
    "Mwanza",
    "Pwani",
    "Tanga",
    "Arusha",
    "Kilimanjaro",
  ],
  // Contract-volume infographic — annual counts per service line, 2015
  // through the current pipeline year. Years/series left as `null` where a
  // figure isn't known.
  contractHistory: [
    { year: 2015, cleaning: 2, fumigation: 4, ictEquipment: 0, buildingMaterials: 1, cleaningProducts: 1 },
    { year: 2016, cleaning: 2, fumigation: 9, ictEquipment: 0, buildingMaterials: 5, cleaningProducts: 2 },
    { year: 2017, cleaning: 5, fumigation: 14, ictEquipment: 0, buildingMaterials: 8, cleaningProducts: 2 },
    { year: 2018, cleaning: 10, fumigation: 15, ictEquipment: 3, buildingMaterials: 7, cleaningProducts: 5 },
    { year: 2019, cleaning: 9, fumigation: 14, ictEquipment: 2, buildingMaterials: 5, cleaningProducts: 3 },
    { year: 2020, cleaning: 16, fumigation: 11, ictEquipment: 5, buildingMaterials: 9, cleaningProducts: 2 },
    { year: 2021, cleaning: 19, fumigation: 8, ictEquipment: 5, buildingMaterials: 9, cleaningProducts: 4 },
    { year: 2022, cleaning: 20, fumigation: 13, ictEquipment: 8, buildingMaterials: 7, cleaningProducts: 5 },
    { year: 2023, cleaning: 25, fumigation: 18, ictEquipment: 8, buildingMaterials: 12, cleaningProducts: 7 },
    { year: 2024, cleaning: 28, fumigation: 22, ictEquipment: 5, buildingMaterials: 12, cleaningProducts: 6 },
    { year: 2025, cleaning: 34, fumigation: 14, ictEquipment: 9, buildingMaterials: 8, cleaningProducts: 8 },
    { year: 2026, cleaning: 38, fumigation: 15, ictEquipment: 15, buildingMaterials: 13, cleaningProducts: 11 },
  ],
  logoUrl: "/brand/logo.png",
  logoInverseUrl: "/brand/logo-inverse.png",
  faviconUrl: "/brand/icon.png",
  heroImageUrl: "/brand/hero-hello1.png",
  overviewImageUrl: "/brand/overview-team.png",
  seoTitle: "Bensal Investment Co. Ltd. | Cleaning, Fumigation & Supply — Tanzania",
  seoDescription:
    "Bensal Investment Co. Ltd. — Cleaning & Gardening, Fumigation & Pest Control, Electronics & ICT Equipment Supply, and Building Materials Supply across Tanzania since 2014.",
};
