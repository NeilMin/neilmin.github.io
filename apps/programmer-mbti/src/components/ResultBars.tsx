import { dimensions } from "../data/dimensions";
import type { DimensionScore } from "../lib/types";

interface ResultBarsProps {
  scores: DimensionScore[];
}

export function ResultBars({ scores }: ResultBarsProps) {
  return (
    <section className="result-bars">
      {scores.map((score) => {
        const definition = dimensions.find((item) => item.id === score.dimension);

        if (!definition) {
          return null;
        }

        return (
          <article key={score.dimension} className="result-bar-card">
            <div className="result-bar-top">
              <div>
                <p className="result-bar-kicker">{definition.name}</p>
                <h3>{definition.label}</h3>
              </div>
              <p className="result-bar-score">
                {score.leftPercent}% {definition.leftPole.label} / {score.rightPercent}%{" "}
                {definition.rightPole.label}
              </p>
            </div>
            <div aria-hidden="true" className="result-track">
              <span className="result-track-left" style={{ width: `${score.leftPercent}%` }} />
            </div>
          </article>
        );
      })}
    </section>
  );
}
