export const LOCATION_OPTIONS = {
  "Metro Manila": [
    "Caloocan",
    "Las Piñas",
    "Makati",
    "Malabon",
    "Mandaluyong",
    "Manila",
    "Marikina",
    "Muntinlupa",
    "Navotas",
    "Parañaque",
    "Pasay",
    "Pasig",
    "Quezon City",
    "San Juan",
    "Taguig",
    "Valenzuela",
  ],
  Cavite: [
    "Bacoor",
    "Cavite City",
    "Dasmariñas",
    "General Trias",
    "Imus",
    "Tagaytay",
    "Trece Martires",
  ],
  Laguna: [
    "Biñan",
    "Cabuyao",
    "Calamba",
    "San Pablo",
    "San Pedro",
    "Santa Rosa",
  ],
  Batangas: [
    "Batangas City",
    "Lipa",
    "Santo Tomas",
    "Tanauan",
  ],
  Bulacan: [
    "Baliwag",
    "Malolos",
    "Meycauayan",
    "San Jose del Monte",
  ],
  Pampanga: [
    "Angeles",
    "City of San Fernando",
    "Mabalacat",
  ],
  Cebu: [
    "Cebu City",
    "Danao",
    "Lapu-Lapu",
    "Mandaue",
    "Talisay",
  ],
  "Davao del Sur": [
    "Davao City",
    "Digos",
  ],
} as const;

export type ProvinceOption = keyof typeof LOCATION_OPTIONS;

export const PROVINCE_OPTIONS = Object.keys(LOCATION_OPTIONS).map(
  (province) => ({
    label: province,
    value: province,
  })
);
