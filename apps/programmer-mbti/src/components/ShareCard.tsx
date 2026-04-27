import type { AssessmentResult } from "../lib/types";

interface ShareCardProps {
  result: AssessmentResult;
}

export function ShareCard({ result }: ShareCardProps) {
  return (
    <div className="share-card" data-testid="share-card">
      <p className="share-card-kicker">Programmer MBTI</p>
      <h2>{result.code}</h2>
      <p className="share-card-title">{result.personality.title}</p>
      <p className="share-card-quote">{result.personality.quote}</p>
    </div>
  );
}
