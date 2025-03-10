import { format } from "date-fns";

export const formatToMiddleEndian = (date: Date) => format(date, "MM/dd/yyyy");

export const formatToRangeString = (dates: [Date, Date]) => {
  const fromDate = formatToMiddleEndian(dates[0]);
  const toDate = formatToMiddleEndian(dates[1]);

  return `${fromDate} - ${toDate}`;
};
