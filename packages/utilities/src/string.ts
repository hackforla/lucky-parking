import _ from "lodash";

export const isSubstring = (string1: string, string2: string, isCaseSensitive = false) => {
  return isCaseSensitive ? string1.includes(string2) : _.toLower(string1).includes(_.toLower(string2));
};
