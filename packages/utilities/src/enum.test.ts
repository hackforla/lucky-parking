import _ from "lodash";
import { getFirst, getNth } from "./enum";

enum MOCK_ENUM {
  FF = "Final Fantasy",
  FNAF = "Five Nights at Freddy's",
  GTA = "Grand Theft Auto",
  KH = "Kingdom Hearts",
  LOL = "League of Legends",
  OW = "Overwatch",
  VAL = "Valorant",
}

enum MOCK_EMPTY_ENUM {}

describe("Enum Utilities", () => {
  describe("getNth", () => {
    it("gets the nth enum", () => {
      _.each(_.range(0, _.size(MOCK_ENUM)), (n) => {
        expect(getNth(MOCK_ENUM, n)).toStrictEqual(_.nth(_.toArray(MOCK_ENUM), n));
      });
    });

    it("returns undefined for out-of-bounds nth", () => {
      expect(getNth(MOCK_ENUM, _.size(MOCK_ENUM))).toBeUndefined();
    });
  });

  describe("getFirst", () => {
    it("gets first enum", () => {
      expect(getFirst(MOCK_ENUM)).toStrictEqual(_.nth(_.toArray(MOCK_ENUM), 0));
    });

    it("returns undefined for empty enum", () => {
      expect(getFirst(MOCK_EMPTY_ENUM)).toBeUndefined();
    });
  });
});
