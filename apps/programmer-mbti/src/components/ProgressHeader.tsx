interface ProgressHeaderProps {
  current: number;
  total: number;
}

export function ProgressHeader({ current, total }: ProgressHeaderProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <header className="progress-header">
      <div>
        <p className="progress-kicker">Question {current}</p>
        <h2>
          {current} / {total}
        </h2>
      </div>
      <div aria-hidden="true" className="progress-track">
        <span className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </header>
  );
}
