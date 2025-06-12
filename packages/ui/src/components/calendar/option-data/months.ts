export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type MONTHS_OPTION = {
  value: Month;
  text: string;
};

export const MONTH_NAMES: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTHS_RANGE: MONTHS_OPTION[] = [
  { value: 0, text: "January" },
  { value: 1, text: "February" },
  { value: 2, text: "March" },
  { value: 3, text: "April" },
  { value: 4, text: "May" },
  { value: 5, text: "June" },
  { value: 6, text: "July" },
  { value: 7, text: "August" },
  { value: 8, text: "September" },
  { value: 9, text: "October" },
  { value: 10, text: "November" },
  { value: 11, text: "December" },
];
