import { startOfToday, startOfYear, sub } from "date-fns";
import { RelativeDatePresets } from "@/shared/lib/constants/date";

export const calculateDateRange = (preset: RelativeDatePresets): [Date, Date] => {
  switch (preset) {
    case RelativeDatePresets.YEARS_1:
      return [sub(startOfToday(), { years: 1 }), startOfToday()];
    case RelativeDatePresets.YTD:
      return [startOfYear(startOfToday()), startOfToday()];
    case RelativeDatePresets.MONTHS_3:
      return [sub(startOfToday(), { months: 3 }), startOfToday()];
    case RelativeDatePresets.MONTHS_1:
      return [sub(startOfToday(), { months: 1 }), startOfToday()];

    /* istanbul ignore next */
    default:
      throw new Error(`Unhandled preset: ${preset}`);
  }
};
