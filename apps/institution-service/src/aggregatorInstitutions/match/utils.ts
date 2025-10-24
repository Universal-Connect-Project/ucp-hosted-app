import { distance } from "fastest-levenshtein";
import { Match, MatchType, Score } from "./const";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { Institution } from "../../models/institution";

export function normalizeInstitutionName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b(bank)\b(?!\s+(of|for|in))/g, "") // Remove "bank" but not "bank of" or "bank for"
    .replace(/ cu/g, "") // Remove "CU"
    .replace(/ credit union/g, "") // Remove "credit union"
    .replace(/\s+/g, " ")
    .trim();
}

export const calculateSimilarity = (str1: string, str2: string): number => {
  const stripped1 = str1.toLowerCase().replace(/ /g, "").replace(/-/g, "");
  const stripped2 = str2.toLowerCase().replace(/ /g, "").replace(/-/g, "");

  const longer = stripped1.length > stripped2.length ? stripped1 : stripped2;

  if (longer.length === 0) return 1.0;

  const editDistance = distance(stripped1, stripped2);

  return (longer.length - editDistance) / longer.length;
};

export const calculateNameScore = (
  aggregatorInstitutionName: string,
  ucpInstitutionName: string,
): Score => {
  const scoreName = "Name";

  if (!aggregatorInstitutionName || !ucpInstitutionName) {
    return { name: scoreName, score: 0, type: MatchType.Missing };
  }

  const normalizedAggregatorInstitutionName = normalizeInstitutionName(
    aggregatorInstitutionName,
  );
  const trimmedAggregatorInstitutionName = aggregatorInstitutionName
    .toLowerCase()
    .trim();

  const normalizedUcpName = normalizeInstitutionName(ucpInstitutionName);
  const trimmedUcpName = ucpInstitutionName.toLowerCase().trim();

  if (trimmedAggregatorInstitutionName === trimmedUcpName) {
    return { name: scoreName, score: 1.0, type: MatchType.ExactOriginal };
  }

  if (normalizedAggregatorInstitutionName === normalizedUcpName) {
    return { name: scoreName, score: 0.95, type: MatchType.ExactNormalized };
  }

  if (normalizedAggregatorInstitutionName && normalizedUcpName) {
    let similarity = calculateSimilarity(
      normalizedAggregatorInstitutionName,
      normalizedUcpName,
    );

    if (
      (normalizedAggregatorInstitutionName.includes("business") &&
        normalizedUcpName.includes("personal")) ||
      (normalizedAggregatorInstitutionName.includes("personal") &&
        normalizedUcpName.includes("business"))
    ) {
      similarity -= 0.1;
    }

    if (similarity >= 0.5) {
      return { name: scoreName, score: similarity, type: MatchType.Similarity };
    } else if (
      normalizedAggregatorInstitutionName.startsWith(normalizedUcpName) ||
      normalizedUcpName.startsWith(normalizedAggregatorInstitutionName)
    ) {
      return { name: scoreName, score: 0.4, type: MatchType.StartsWith };
    }
  }

  return { name: scoreName, score: 0, type: MatchType.NoMatch };
};

export const extractDomain = (url: string): string => {
  let domain = `${url}`;

  if (domain.includes(".")) {
    domain = domain.split(".")?.pop() as string;
  }

  if (domain.includes("/")) {
    domain = domain.split("/")[0];
  }

  return domain;
};

export const normalizeUrl = (url: string): string => {
  return url
    .toLowerCase()
    .trim()
    .replace(/http[s]?:\/\//, "")
    .replace(/\.com/, "")
    .replace(/\.net/, "")
    .replace(/\.org/, "")
    .replace(/www\./, "");
};

export const calculateUrlScore = (
  aggregatorUrl: string,
  ucpUrl: string,
): Score => {
  const scoreName = "URL";

  if (!aggregatorUrl || !ucpUrl) {
    return { name: scoreName, score: 0, type: MatchType.Missing };
  }

  if (aggregatorUrl.toLowerCase().trim() === ucpUrl.toLowerCase().trim()) {
    return { name: scoreName, score: 1.0, type: MatchType.ExactOriginal };
  }

  const normalizedAggregatorUrl = normalizeUrl(aggregatorUrl);
  const normalizedUcpUrl = normalizeUrl(ucpUrl);

  if (normalizedAggregatorUrl === normalizedUcpUrl) {
    return { name: scoreName, score: 0.95, type: MatchType.ExactNormalized };
  }

  const aggregatorDomain = extractDomain(normalizedAggregatorUrl);
  const ucpDomain = extractDomain(normalizedUcpUrl);

  if (aggregatorDomain === ucpDomain) {
    return { name: scoreName, score: 0.8, type: MatchType.ExactDomain };
  }

  const similarity = calculateSimilarity(
    normalizedAggregatorUrl,
    normalizedUcpUrl,
  );

  const domainSimilarity =
    calculateSimilarity(aggregatorDomain, ucpDomain) * 0.9;

  return similarity >= domainSimilarity
    ? { name: scoreName, score: similarity, type: MatchType.Similarity }
    : {
        name: scoreName,
        score: domainSimilarity,
        type: MatchType.DomainSimilarity,
      };
};

export const findPotentialMatches = (
  aggregatorInstitution: AggregatorInstitution,
  ucpInstitutions: Institution[],
): Match[] => {
  const maxResults = 5;

  const matches: Match[] = [];

  for (const ucpInstitution of ucpInstitutions) {
    const scores = [];

    if (aggregatorInstitution.name) {
      scores.push(
        calculateNameScore(aggregatorInstitution.name, ucpInstitution.name),
      );
    }

    if (aggregatorInstitution.url) {
      scores.push(
        calculateUrlScore(aggregatorInstitution.url, ucpInstitution.url),
      );
    }

    const sortedScores = scores
      .map((score) => score.score)
      .sort((a, b) => b - a);

    let topScoresAverage = sortedScores?.[0];

    if (sortedScores.length >= 2) {
      topScoresAverage = (sortedScores[0] + sortedScores[1]) / 2;
    }

    const averageTotalScore =
      sortedScores.reduce((accumulator, current) => accumulator + current, 0) /
      sortedScores.length;

    if (topScoresAverage > 0.49) {
      matches.push({
        averageTotalScore,
        institution: ucpInstitution,
        scoreBreakdown: scores,
        top2AverageScore: topScoresAverage,
      });
    }
  }

  // Sort by score (highest first) and return top results
  return matches
    .sort((a, b) => b.top2AverageScore - a.top2AverageScore)
    .slice(0, maxResults);
};
