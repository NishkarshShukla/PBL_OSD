// Manim's actual color constants — the engine 3b1b builds his videos with.
export const MANIM_BLUE = "#58C4DD";
export const MANIM_RED = "#FC6255";
export const MANIM_GOLD = "#FFD93B";

export function weightToColor(weight, maxAbs) {
  const norm = maxAbs > 0 ? Math.min(Math.abs(weight) / maxAbs, 1) : 0;
  return {
    color: weight >= 0 ? MANIM_BLUE : MANIM_RED,
    opacity: 0.12 + norm * 0.7,
    width: 0.5 + norm * 2.5,
  };
}

export function activationToFill(value, maxVal) {
  const norm = maxVal > 0 ? Math.min(value / maxVal, 1) : 0;
  const lightness = 12 + norm * 82; // dim charcoal -> near-white glow
  return `hsl(205, 20%, ${lightness}%)`;
}