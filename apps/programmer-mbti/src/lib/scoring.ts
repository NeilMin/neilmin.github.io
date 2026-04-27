import { personalities } from "../data/personalities";
import { questions } from "../data/questions";
import type {
  AnswerMap,
  AssessmentResult,
  Dimension,
  DimensionScore,
  InvestigationPublicPole,
  LikertValue,
  ResultCode,
  ResultParts,
  ScorePole,
} from "./types";

const likertWeightMap: Record<LikertValue, number> = {
  1: 3,
  2: 2,
  3: 1,
  4: 0,
  5: -1,
  6: -2,
  7: -3,
};

const dimensionPoleOrder: Record<
  Dimension,
  { left: string; right: string }
> = {
  S: { left: "C", right: "T" },
  H: { left: "O", right: "A" },
  I: { left: "L", right: "P" },
  P: { left: "G", right: "W" },
};

export function getLikertWeight(value: LikertValue) {
  return likertWeightMap[value];
}

function toPublicPole(pole: ScorePole) {
  return pole === "R" ? "P" : pole;
}

function isDimensionComplete(
  dimension: Dimension,
  answers: AnswerMap
) {
  return questions
    .filter((question) => question.dimension === dimension)
    .every((question) => answers[question.id] !== undefined);
}

export function getResultCode(parts: ResultParts): ResultCode {
  return `${parts.source}${parts.hierarchy}${parts.investigation}${parts.purpose}` as ResultCode;
}

export function calculateDimensionScore(
  dimension: Dimension,
  answers: AnswerMap
): DimensionScore {
  const { left: leftPole, right: rightPole } = dimensionPoleOrder[dimension];
  const rawScore = questions
    .filter((question) => question.dimension === dimension)
    .reduce((sum, question) => {
      const value = answers[question.id];
      if (value === undefined) {
        return sum;
      }

      const orientation = toPublicPole(question.agreementPole) === leftPole ? 1 : -1;
      return sum + getLikertWeight(value) * orientation;
    }, 0);

  const leftPercent = Math.round(((rawScore + 15) / 30) * 100);
  const rightPercent = 100 - leftPercent;
  const winningPole = rawScore >= 0 ? leftPole : rightPole;
  const losingPole = rawScore >= 0 ? rightPole : leftPole;

  return {
    dimension,
    rawScore,
    leftPercent,
    rightPercent,
    winningPole,
    losingPole,
  };
}

export function calculateResultParts(answers: AnswerMap): ResultParts {
  const source = calculateDimensionScore("S", answers).winningPole as ResultParts["source"];
  const hierarchy = calculateDimensionScore("H", answers).winningPole as ResultParts["hierarchy"];
  const investigation = calculateDimensionScore("I", answers).winningPole as InvestigationPublicPole;
  const purpose = calculateDimensionScore("P", answers).winningPole as ResultParts["purpose"];

  return {
    source: toPublicPole(source) as ResultParts["source"],
    hierarchy: toPublicPole(hierarchy) as ResultParts["hierarchy"],
    investigation: toPublicPole(investigation) as InvestigationPublicPole,
    purpose: toPublicPole(purpose) as ResultParts["purpose"],
  };
}

export function isAssessmentComplete(answers: AnswerMap) {
  return ["S", "H", "I", "P"].every((dimension) =>
    isDimensionComplete(dimension as Dimension, answers)
  );
}

export function calculateAssessmentResult(
  answers: AnswerMap
): AssessmentResult | null {
  if (!isAssessmentComplete(answers)) {
    return null;
  }

  const dimensions = (["S", "H", "I", "P"] as Dimension[]).map((dimension) =>
    calculateDimensionScore(dimension, answers)
  );
  const parts = calculateResultParts(answers);
  const code = getResultCode(parts);
  const personality = personalities.find((item) => item.code === code);

  if (!personality) {
    throw new Error(`Missing personality payload for code ${code}`);
  }

  return {
    code,
    personality,
    dimensions,
  };
}
