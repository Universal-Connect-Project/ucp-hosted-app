import { Institution } from "../../models/institution";

export enum MatchType {
  DomainSimilarity = "domain similarity",
  ExactDomain = "exact domain",
  ExactNormalized = "exact normalized",
  ExactOriginal = "exact original",
  Missing = "missing data",
  NoMatch = "no match",
  Similarity = "similarity",
  StartsWith = "starts with",
}

export interface Match {
  averageTotalScore: number;
  institution: Institution;
  scoreBreakdown: Score[];
  top2AverageScore: number;
}

export interface Score {
  name: string;
  score: number;
  type: MatchType;
}
