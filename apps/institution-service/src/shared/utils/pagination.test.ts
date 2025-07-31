import { Request } from "express";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../const";
import { getPaginationOptions, parseSort, SortDirection } from "./pagination";

describe("pagination utilities", () => {
  describe("getPaginationOptions", () => {
    it("defaults to page 1, offset 0, and DEFAULT_PAGINATION_SIZE", () => {
      const req = {
        query: {},
      } as Request;

      const options = getPaginationOptions(req);
      expect(options.page).toBe(1);
      expect(options.offset).toBe(0);
      expect(options.limit).toBe(DEFAULT_PAGINATION_PAGE_SIZE);
    });

    it("parses offset, page, pageSize from request query", () => {
      const req = {
        query: {
          page: "2",
          pageSize: "20",
        },
      } as unknown as Request;

      const options = getPaginationOptions(req);
      expect(options.page).toBe(2);
      expect(options.offset).toBe(20);
      expect(options.limit).toBe(20);
    });
  });

  describe("parseSort", () => {
    it("parses sortBy string into column and direction", () => {
      const sortBy = `name:${SortDirection.ASC}`;
      const result = parseSort(sortBy);
      expect(result.column).toBe("name");
      expect(result.direction).toBe(SortDirection.ASC);
    });
  });
});
