export enum ViolationTypeCategories {
  "NO PARK/STREET CLEAN" = "No Park / Street Clean",
  "DISPLAY OF PLATES" = "Display of Tags",
  "RED ZONE" = "Red Zone",
  "METER EXPIRATION" = "Meter Exp",
  "PREFERENTIAL PARKING" = "Preferential Parking",
}

export const violationTypeBarData = [
  { index_key: "No Park / Street Clean", count: 0 },
  { index_key: "Display of Tags", count: 0 },
  { index_key: "Red Zone", count: 0 },
  { index_key: "Meter Exp", count: 0 },
  { index_key: "Preferential Parking", count: 0 },
];

export const dayOfWeekBarData = [
  { index_key: "Saturday", count: 0 },
  { index_key: "Friday", count: 0 },
  { index_key: "Thursday", count: 0 },
  { index_key: "Wednesday", count: 0 },
  { index_key: "Tuesday", count: 0 },
  { index_key: "Monday", count: 0 },
  { index_key: "Sunday", count: 0 },
];
