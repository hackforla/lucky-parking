import { isSubstring } from "./string";

describe("String Utilities", () => {
  describe("isSubstring", () => {
    it("handles without case-sensitivity", () => {
      expect(isSubstring("", "")).toStrictEqual(true);

      expect(isSubstring("ABC", "a")).toStrictEqual(true);
      expect(isSubstring("ABC", "b")).toStrictEqual(true);
      expect(isSubstring("ABC", "c")).toStrictEqual(true);

      expect(isSubstring("ABC", "A")).toStrictEqual(true);
      expect(isSubstring("ABC", "B")).toStrictEqual(true);
      expect(isSubstring("ABC", "C")).toStrictEqual(true);

      expect(isSubstring("ABC", "d")).toStrictEqual(false);
      expect(isSubstring("ABC", "e")).toStrictEqual(false);

      expect(isSubstring("ABC", "D")).toStrictEqual(false);
      expect(isSubstring("ABC", "E")).toStrictEqual(false);
    });

    it("handles with case-sensitivity", () => {
      expect(isSubstring("", "", true)).toStrictEqual(true);

      expect(isSubstring("ABC", "a", true)).toStrictEqual(false);
      expect(isSubstring("ABC", "b", true)).toStrictEqual(false);
      expect(isSubstring("ABC", "c", true)).toStrictEqual(false);

      expect(isSubstring("abc", "a", true)).toStrictEqual(true);
      expect(isSubstring("abc", "b", true)).toStrictEqual(true);
      expect(isSubstring("abc", "c", true)).toStrictEqual(true);

      expect(isSubstring("ABC", "A", true)).toStrictEqual(true);
      expect(isSubstring("ABC", "B", true)).toStrictEqual(true);
      expect(isSubstring("ABC", "C", true)).toStrictEqual(true);

      expect(isSubstring("ABC", "d", true)).toStrictEqual(false);
      expect(isSubstring("ABC", "e", true)).toStrictEqual(false);

      expect(isSubstring("ABC", "D", true)).toStrictEqual(false);
      expect(isSubstring("ABC", "E", true)).toStrictEqual(false);
    });
  });
});
