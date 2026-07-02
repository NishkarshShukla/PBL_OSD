import { MANIM_BLUE, MANIM_GOLD } from "../utils/colors";

export default function ProbabilityBars({ probabilities, prediction }) {
  if (!probabilities) return null;
  const max = Math.max(...probabilities, 0.0001);

  return (
    <div className="flex flex-col gap-1.5 w-64">
      {probabilities.map((p, digit) => (
        <div key={digit} className="flex items-center gap-2">
          <span className="text-slate-400 text-sm w-3">{digit}</span>
          <div className="flex-1 h-3 bg-slate-800 rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-500 ease-out"
              style={{
                width: `${(p / max) * 100}%`,
                background: digit === prediction ? MANIM_GOLD : MANIM_BLUE,
              }}
            />
          </div>
          <span className="text-slate-500 text-xs w-10 text-right">
            {(p * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}