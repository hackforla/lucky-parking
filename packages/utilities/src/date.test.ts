import { formatToMiddleEndian, formatToRangeString } from "./date";

const MOCK_DATE_NOW = new Date("2023-06-01");

describe("Date Utilities", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(MOCK_DATE_NOW);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("formatToMiddleEndian", () => {
    it("formats to middle-endian date format ", () => {
      expect(formatToMiddleEndian(new Date())).toStrictEqual("06/01/2023");
      expect(formatToMiddleEndian(new Date("1994-11-08"))).toStrictEqual("11/08/1994");
      expect(formatToMiddleEndian(new Date("1999-12-31"))).toStrictEqual("12/31/1999");
      expect(formatToMiddleEndian(new Date("2123-07-02"))).toStrictEqual("07/02/2123");
    });
  });

  describe("formatToRangeString", () => {
    it("formats to date range string", () => {
      const dates1 = [new Date("2023-01-01"), new Date("2023-12-31")];
      const dates2 = [new Date("1994-11-08"), new Date("2012-07-25")];

      expect(formatToRangeString(dates1)).toStrictEqual("01/01/2023 - 12/31/2023");
      expect(formatToRangeString(dates2)).toStrictEqual("11/08/1994 - 07/25/2012");
    });
  });
});
