import { YEAR_OPTIONS } from "../option-data/years";

export const getMinMaxYear = (YEARS: YEAR_OPTIONS[]): [number, number] => {
  let min = Infinity;
  let max = -Infinity;
  YEARS.forEach((ele: YEAR_OPTIONS) => {
    min = Math.min(ele.value, min);
    max = Math.max(ele.value, max);
  });
  return [min, max];
};
