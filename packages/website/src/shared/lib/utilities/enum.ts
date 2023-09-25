import _ from "lodash";

export const getNthEnum = (enums: Record<any, any>, index: number) => _.chain(enums).values().nth(index).value();

export const getFirstEnum = (enums: Record<any, any>) => getNthEnum(enums, 0);
