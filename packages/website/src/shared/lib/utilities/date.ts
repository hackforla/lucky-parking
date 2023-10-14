import { format, startOfToday, startOfYear, sub } from "date-fns";
import { RelativeDatePresets } from "@/shared/lib/constants/date";

export const calculateDateRange = (preset: RelativeDatePresets) => {
  switch (preset) {
    case RelativeDatePresets.YEARS_1:
      return [sub(startOfToday(), { years: 1 }), startOfToday()];
    case RelativeDatePresets.YTD:
      return [startOfYear(startOfToday()), startOfToday()];
    case RelativeDatePresets.MONTHS_3:
      return [sub(startOfToday(), { months: 3 }), startOfToday()];
    case RelativeDatePresets.MONTHS_1:
      return [sub(startOfToday(), { months: 1 }), startOfToday()];
    default:
      return null;
  }
};

export const formatToMiddleEndian = (date: Date) => format(date, "MM/dd/yyyy");

export const formatToRange = (dates: Date[]) => {
  const fromDate = formatToMiddleEndian(dates[0]);
  const toDate = formatToMiddleEndian(dates[1]);

  return `${fromDate} - ${toDate}`;
};
