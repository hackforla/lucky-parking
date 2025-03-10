import { RelativeDatePresets } from "@/shared/lib/constants/date";
import { calculateDateRange } from "./date";

const MOCK_DATE_NOW = new Date("2023-06-01");

describe("Date Utilities", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(MOCK_DATE_NOW);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("calculateDateRange", () => {
    it("calculates one year to now", () => {
      const dates = calculateDateRange(RelativeDatePresets.YEARS_1);
      expect(dates).toStrictEqual([new Date("2022-06-01"), new Date()]);
    });

    it("calculates year to now", () => {
      const dates = calculateDateRange(RelativeDatePresets.YTD);
      expect(dates).toStrictEqual([new Date("2023-01-01"), new Date()]);
    });

    it("calculates three months to now", () => {
      const dates = calculateDateRange(RelativeDatePresets.MONTHS_3);
      expect(dates).toStrictEqual([new Date("2023-03-01"), new Date()]);
    });

    it("calculates one month to now", () => {
      const dates = calculateDateRange(RelativeDatePresets.MONTHS_1);
      expect(dates).toStrictEqual([new Date("2023-05-01"), new Date()]);
    });
  });
});
