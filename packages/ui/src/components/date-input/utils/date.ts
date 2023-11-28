import { format } from "date-fns";

export const formatToMiddleEndian = (date: Date) => format(date, "MM/dd/yyyy");
