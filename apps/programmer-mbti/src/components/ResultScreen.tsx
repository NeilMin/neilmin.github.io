import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import type { AssessmentResult } from "../lib/types";
import { ResultBars } from "./ResultBars";
import { ShareCard } from "./ShareCard";

interface ResultScreenProps {
  result: AssessmentResult;
  onRestart: () => void;
}

export function ResultScreen({ result, onRestart }: ResultScreenProps) {
  const { personality } = result;
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!shareCardRef.current || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${result.code}-programmer-mbti.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="result-shell">
      <div className="result-hero">
        <p className="result-kicker">{personality.group}</p>
        <h1 className="result-code">{result.code}</h1>
        <h2 className="result-title">{personality.title}</h2>
        <p className="result-quote">“{personality.quote}”</p>
      </div>

      <ResultBars scores={result.dimensions} />

      <div className="result-grid">
        <article className="result-card">
          <h3>长描述</h3>
          <p>{personality.description}</p>
        </article>
        <article className="result-card">
          <h3>核心优势</h3>
          <p>{personality.strengths}</p>
        </article>
        <article className="result-card">
          <h3>致命风险</h3>
          <p>{personality.risks}</p>
        </article>
        <article className="result-card">
          <h3>适宜环境</h3>
          <p>{personality.environment}</p>
        </article>
      </div>

      <article className="result-card result-card--lifestyle">
        <h3>生活与社交侧写</h3>
        <p>{personality.lifestyle}</p>
      </article>

      <div className="result-actions">
        <button className="question-button" onClick={handleExport} type="button">
          {isExporting ? "导出中..." : "保存结果图"}
        </button>
        <button
          className="question-button question-button--secondary"
          onClick={onRestart}
          type="button"
        >
          重新测试
        </button>
      </div>

      <div ref={shareCardRef}>
        <ShareCard result={result} />
      </div>
    </section>
  );
}
