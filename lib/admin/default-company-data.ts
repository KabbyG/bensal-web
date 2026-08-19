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
  // Contract-volume infographic from the profile. Years/series left as
  // `null` where the source did not state an exact figure.
  contractHistory: [
    { year: 2019, cleaning: 0, fumigation: 7 },
    { year: 2020, cleaning: 7, fumigation: 5 },
    { year: 2021, cleaning: 9, fumigation: null },
    { year: 2022, cleaning: 8, fumigation: 6 },
    { year: 2023, cleaning: null, fumigation: 6 },
    { year: 2024, cleaning: null, fumigation: 6 },
    { year: 2025, cleaning: 6, fumigation: 2 },
  ],
  logoUrl: "/brand/logo.png",
  logoInverseUrl: "/brand/logo-inverse.png",
  faviconUrl: "/brand/icon.png",
  seoTitle: "Bensal Investment Co. Ltd. | Cleaning, Fumigation & Supply — Tanzania",
  seoDescription:
    "Bensal Investment Co. Ltd. — Cleaning & Gardening, Fumigation & Pest Control, Electronics & ICT Equipment Supply, and Building Materials Supply across Tanzania since 2014.",
};
