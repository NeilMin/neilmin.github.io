interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <section className="hero-card">
      <p className="hero-kicker">SHIP Framework</p>
      <h1>程序员 MBTI</h1>
      <p className="hero-copy">基于 SHIP 四维框架的北美程序员工作人格测试</p>
      <button className="hero-button" type="button" onClick={onStart}>
        开始测试
      </button>
    </section>
  );
}
