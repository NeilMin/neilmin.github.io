import { likertScale } from "../data/questions";
import type { LikertValue } from "../lib/types";

interface LikertScaleProps {
  name: string;
  value?: LikertValue;
  onChange: (value: LikertValue) => void;
}

export function LikertScale({ name, value, onChange }: LikertScaleProps) {
  return (
    <fieldset className="likert-scale">
      <legend className="sr-only">likert scale</legend>
      {likertScale.map((item, index) => (
        <label
          key={item.value}
          className={`likert-option likert-option--${index + 1}`}
        >
          <input
            checked={value === item.value}
            name={name}
            onChange={() => onChange(item.value)}
            type="radio"
            value={item.value}
          />
          <span>{item.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
