import {
  calculateNameScore,
  calculateSimilarity,
  calculateUrlScore,
  extractDomain,
  findPotentialMatches,
  normalizeInstitutionName,
  normalizeUrl,
} from "./utils";
import { MatchType, Score } from "./const";
import { AggregatorInstitution } from "../../../models/aggregatorInstitution";
import { Institution } from "../../../models/institution";

const createExpectScore =
  (name: string) =>
  (
    result: Score,
    expected: { score: number; type: string },
    shouldExpectExactScore: boolean,
  ) => {
    if (shouldExpectExactScore) {
      expect(result.score).toBe(expected.score);
    } else {
      expect(result.score).toBeCloseTo(expected.score);
    }
    expect(result.name).toBe(name);
    expect(result.type).toBe(expected.type);
  };

describe("match institutions", () => {
  describe("normalizeInstitutionName", () => {
    it("should normalize institution names", () => {
      const testCases = [
        [" Federal Credit Union Test ", "federal test"],
        ["Test CU", "test"],
      ];

      for (const [input, expected] of testCases) {
        expect(normalizeInstitutionName(input)).toBe(expected);
      }
    });

    it("keeps bank of, in, and for, but not bank", () => {
      const testCases = [
        ["Bank of America", "bank of america"],
        ["Bank for Savings", "bank for savings"],
        ["Bank in the City", "bank in the city"],
        ["Test Bank", "test"],
      ];

      for (const [input, expected] of testCases) {
        expect(normalizeInstitutionName(input)).toBe(expected);
      }
    });
  });

  describe("calculateSimilarity", () => {
    it("should calculate similarity between two strings", () => {
      const testCases: [string, string, number][] = [
        ["kitten", "sitting", (7 - 3) / 7],
        ["flaw", "lawn", 0.5],
        ["", "", 1.0],
        ["a", "", 0.0],
        ["", "a", 0.0],
        ["abc", "abc", 1.0],
      ];

      for (const [str1, str2, expected] of testCases) {
        expect(calculateSimilarity(str1, str2)).toBeCloseTo(expected);
      }
    });
  });

  describe("calculateNameScore", () => {
    const expectNameScore = createExpectScore("Name");

    it("returns 0 if either name is missing", () => {
      expectNameScore(
        calculateNameScore("", "Test"),
        { score: 0, type: MatchType.Missing },
        true,
      );
      expectNameScore(
        calculateNameScore("Test", ""),
        { score: 0, type: MatchType.Missing },
        true,
      );
      expectNameScore(
        calculateNameScore("", ""),
        { score: 0, type: MatchType.Missing },
        true,
      );
    });

    it("returns 1 if the trimmed and lowercased names are identical", () => {
      expectNameScore(
        calculateNameScore("  Bank of America  ", "bank of america"),
        { score: 1.0, type: MatchType.ExactOriginal },
        true,
      );
    });

    it("returns 0.95 if the normalized names are identical", () => {
      expectNameScore(
        calculateNameScore("Bank of America CU", "Bank of America"),
        { score: 0.95, type: MatchType.ExactNormalized },
        true,
      );
    });

    it("returns a similarity score if its at least .5", () => {
      const score = calculateNameScore("abcd", "ab");
      expectNameScore(score, { score: 0.5, type: MatchType.Similarity }, true);
    });

    it("returns 0 if the similarity score is less than .5", () => {
      const score = calculateNameScore("abc", "b");
      expectNameScore(score, { score: 0, type: MatchType.NoMatch }, true);
    });

    it("returns .4 if one name starts with the other", () => {
      expectNameScore(
        calculateNameScore("abcdef", "ab"),
        { score: 0.4, type: MatchType.StartsWith },
        true,
      );
      expectNameScore(
        calculateNameScore("ab", "abcdef"),
        { score: 0.4, type: MatchType.StartsWith },
        true,
      );
    });

    it("decreases score by 0.1 if one name includes 'business' and the other 'personal'", () => {
      expectNameScore(
        calculateNameScore(
          "abcdefghijklmnop Personal",
          "abcdefghijklmnop Business",
        ),
        { score: 0.608, type: MatchType.Similarity },
        false,
      );

      expectNameScore(
        calculateNameScore(
          "abcdefghijklmnop Business",
          "abcdefghijklmnop Personal",
        ),
        { score: 0.608, type: MatchType.Similarity },
        false,
      );
    });
  });

  describe("normalizeUrl", () => {
    it("should remove http, https, www, and common TLDs", () => {
      const testCases = [
        ["http://www.example.com", "example"],
        ["https://example.net", "example"],
        ["http://example.org", "example"],
        ["www.example.com", "example"],
        ["example.com", "example"],
        ["example.net", "example"],
        ["example.org", "example"],
        ["example", "example"],
      ];

      for (const [input, expected] of testCases) {
        expect(normalizeUrl(input)).toBe(expected);
      }
    });
  });

  describe("extractDomain", () => {
    it("should extract the domain from a normalized URL", () => {
      const testCases = [
        ["http://www.example.com/path", "example"],
        ["https://subdomain.subdomain.example.net/anotherpath", "example"],
        ["http://example.org", "example"],
        ["www.example.com", "example"],
        ["example.com/path", "example"],
        ["example.net", "example"],
        ["example.org/some/page", "example"],
        ["example", "example"],
      ];

      for (const [input, expected] of testCases) {
        expect(extractDomain(normalizeUrl(input))).toBe(expected);
      }
    });
  });

  describe("calculateUrlScore", () => {
    const expectUrlScore = createExpectScore("URL");

    it("returns 0 if either URL is missing", () => {
      expectUrlScore(
        calculateUrlScore("", "http://example.com"),
        {
          score: 0,
          type: MatchType.Missing,
        },
        true,
      );
      expectUrlScore(
        calculateUrlScore("http://example.com", ""),
        {
          score: 0,
          type: MatchType.Missing,
        },
        true,
      );
      expectUrlScore(
        calculateUrlScore("", ""),
        {
          score: 0,
          type: MatchType.Missing,
        },
        true,
      );
    });

    it("returns 1 if the trimmed and lowercased original URLs are identical", () => {
      expectUrlScore(
        calculateUrlScore("http://www.Example.com ", "http://www.example.com"),
        {
          score: 1.0,
          type: MatchType.ExactOriginal,
        },
        true,
      );
    });

    it("returns .95 if the normalized URLs are identical", () => {
      expectUrlScore(
        calculateUrlScore("http://www.example.com", "example.com"),
        {
          score: 0.95,
          type: MatchType.ExactNormalized,
        },
        true,
      );
    });

    it("returns .8 if the domains are identical", () => {
      expectUrlScore(
        calculateUrlScore("http://subdomain.example.com", "example.com"),
        {
          score: 0.8,
          type: MatchType.ExactDomain,
        },
        true,
      );
    });

    it("uses a similarity score of the normalized URLs if they are closer than the domains", () => {
      const first = "http://subdomain.example.com";
      const second = "subdomain.examplezzzz.com";
      const similarity = calculateSimilarity(
        normalizeUrl(first),
        normalizeUrl(second),
      );

      const score = calculateUrlScore(
        "http://subdomain.example.com",
        "subdomain.examplezzzz.com",
      );
      expectUrlScore(
        score,
        { score: similarity, type: MatchType.Similarity },
        true,
      );
    });

    it("multiplies the similarity score by .9 if the domains are closer than the regular urls", () => {
      const first = "http://subdomain.example.com";
      const second = "examplez.com";
      const domainSimilarity = calculateSimilarity(
        extractDomain(normalizeUrl(first)),
        extractDomain(normalizeUrl(second)),
      );

      const score = calculateUrlScore(
        "http://subdomain.example.com",
        "examplez.com",
      );
      expectUrlScore(
        score,
        { score: domainSimilarity * 0.9, type: MatchType.DomainSimilarity },
        false,
      );
    });
  });

  describe("findPotentialMatches", () => {
    it("returns the expected matches format and sorts by the top 2 average scores", () => {
      const aggregatorInstitution = {
        id: "1",
        name: "Bank of America",
        url: "http://www.bankofamerica.com",
      } as AggregatorInstitution;

      const ucpInstitutions = [
        {
          name: "Bank of America CU",
          url: "test",
        },
        {
          name: "Bank of America",
          url: "http://www.bankofamerica.com",
        },
      ] as Institution[];

      const matches = findPotentialMatches(
        aggregatorInstitution,
        ucpInstitutions,
      );

      expect(matches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            averageTotalScore: 1.0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            institution: expect.objectContaining({ name: "Bank of America" }),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            scoreBreakdown: expect.arrayContaining([
              { name: "Name", score: 1.0, type: MatchType.ExactOriginal },
              { name: "URL", score: 1.0, type: MatchType.ExactOriginal },
            ]),
            top2AverageScore: 1.0,
          }),
        ]),
      );
    });

    it("doesn't include matches with a score under .5", () => {
      const aggregatorInstitution = {
        id: "1",
        name: "Bank of America",
        url: "http://www.bankofamerica.com",
      } as AggregatorInstitution;

      const ucpInstitutions = [
        {
          name: "Wells Fargo",
          url: "http://www.wellsfargo.com",
        },
        {
          name: "Chase",
          url: "http://www.chase.com",
        },
      ] as Institution[];

      const matches = findPotentialMatches(
        aggregatorInstitution,
        ucpInstitutions,
      );

      expect(matches.length).toBe(0);
    });

    it("only returns 5 matches max", () => {
      const aggregatorInstitution = {
        name: "Test Institution",
        url: "http://www.testinstitution.com",
      } as AggregatorInstitution;

      const ucpInstitutions: Institution[] = [];

      for (let i = 0; i < 10; i++) {
        ucpInstitutions.push({
          id: `test-institution-${i}`,
          name: `Test Institution ${i}`,
          url: `http://www.testinstitution${i}.com`,
        } as Institution);
      }

      const matches = findPotentialMatches(
        aggregatorInstitution,
        ucpInstitutions,
      );

      expect(matches.length).toBe(5);
    });
  });
});
