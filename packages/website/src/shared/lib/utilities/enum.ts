import _ from "lodash";

export const getNth = (enums: Record<any, any>, index: number) => _.chain(enums).values().nth(index).value();

export const getFirst = (enums: Record<any, any>) => getNth(enums, 0);
