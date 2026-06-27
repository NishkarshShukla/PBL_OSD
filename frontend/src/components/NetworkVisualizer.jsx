import { useMemo, useState, useEffect } from "react";
import { weightToColor, activationToFill, MANIM_GOLD } from "../utils/colors";

const WIDTH = 880;
const HEIGHT = 480;
const GRID_SIZE = 28;
const GRID_PIXEL = 5.5;
const GRID_X = 30;
const GRID_Y = (HEIGHT - GRID_SIZE * GRID_PIXEL) / 2;
const LAYER_X = { hidden1: 340, hidden2: 560, output: 780 };
const NODE_R = 9;
const STAGE_INTERVAL = 220; // ms between cascade steps

function layerPositions(count, x, height) {
  const padding = 36;
  const usable = height - padding * 2;
  const step = count > 1 ? usable / (count - 1) : 0;
  return Array.from({ length: count }, (_, i) => ({
    x,
    y: count > 1 ? padding + i * step : height / 2,
  }));
}

const maxAbs = (matrix) =>
  matrix.flat().reduce((m, w) => Math.max(m, Math.abs(w)), 0.0001);

export default function NetworkVisualizer({ pixelGrid, architecture, activations, prediction, pulseId }) {
  const hidden1Pos = useMemo(() => layerPositions(16, LAYER_X.hidden1, HEIGHT), []);
  const hidden2Pos = useMemo(() => layerPositions(16, LAYER_X.hidden2, HEIGHT), []);
  const outputPos = useMemo(() => layerPositions(10, LAYER_X.output, HEIGHT), []);

  // 0 = grid->h1 flowing, 1 = h1 lit + h1->h2 flowing,
  // 2 = h2 lit + h2->output flowing (winner path emphasized), 3 = output lit + winner pulses
  const [stage, setStage] = useState(3);

  useEffect(() => {
    if (!pulseId) return;
    setStage(0);
    const timers = [1, 2, 3].map((s) => setTimeout(() => setStage(s), s * STAGE_INTERVAL));
    return () => timers.forEach(clearTimeout);
  }, [pulseId]);

  const funnelLines = useMemo(() => {
    const lines = [];
    let seed = 42;
    const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    hidden1Pos.forEach((node) => {
      for (let i = 0; i < 4; i++) {
        lines.push({
          x1: GRID_X + rand() * GRID_SIZE * GRID_PIXEL,
          y1: GRID_Y + rand() * GRID_SIZE * GRID_PIXEL,
          x2: node.x,
          y2: node.y,
        });
      }
    });
    return lines;
  }, [hidden1Pos]);

  const hidden1Max = activations ? Math.max(...activations.hidden1, 0.0001) : 1;
  const hidden2Max = activations ? Math.max(...activations.hidden2, 0.0001) : 1;
  const outputMax = activations ? Math.max(...activations.output, 0.0001) : 1;

  const h1Revealed = stage >= 1;
  const h2Revealed = stage >= 2;
  const outRevealed = stage >= 3;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full max-w-4xl rounded-xl"
      style={{ background: "#000000" }}
    >
      <style>{`
        @keyframes dashflow { to { stroke-dashoffset: -28; } }
        .flow-edge { stroke-dasharray: 8 6; animation: dashflow 0.5s linear infinite; }
        @keyframes winnerPulse {
          0% { r: ${NODE_R + 3}; stroke-opacity: 0.9; }
          100% { r: ${NODE_R + 14}; stroke-opacity: 0; }
        }
        .winner-ring { animation: winnerPulse 1.6s ease-out infinite; }
        circle, line { transition: fill 0.35s ease-out, stroke-opacity 0.35s ease-out; }
      `}</style>

      <g>
        {pixelGrid &&
          pixelGrid.map((value, i) => {
            const row = Math.floor(i / GRID_SIZE);
            const col = i % GRID_SIZE;
            return (
              <rect key={i}
                x={GRID_X + col * GRID_PIXEL} y={GRID_Y + row * GRID_PIXEL}
                width={GRID_PIXEL} height={GRID_PIXEL}
                fill={`rgba(255,255,255,${value})`} />
            );
          })}
        <rect x={GRID_X} y={GRID_Y}
          width={GRID_SIZE * GRID_PIXEL} height={GRID_SIZE * GRID_PIXEL}
          fill="none" stroke="#2a2a2a" strokeWidth={1} />
      </g>

      <g>
        {funnelLines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#58C4DD"
            strokeOpacity={stage === 0 ? 0.35 : 0.06}
            strokeWidth={1}
            className={stage === 0 ? "flow-edge" : ""} />
        ))}
      </g>

      {architecture && (() => {
        const w = architecture.weights.fc2;
        const mx = maxAbs(w);
        return hidden2Pos.map((to, o) =>
          hidden1Pos.map((from, i) => {
            const { color, opacity, width } = weightToColor(w[o][i], mx);
            const flowing = stage === 1;
            return (
              <line key={`h1h2-${o}-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={color}
                strokeOpacity={flowing ? Math.min(opacity + 0.25, 1) : opacity}
                strokeWidth={width}
                className={flowing ? "flow-edge" : ""} />
            );
          })
        );
      })()}

      {architecture && (() => {
        const w = architecture.weights.fc3;
        const mx = maxAbs(w);
        return outputPos.map((to, o) =>
          hidden2Pos.map((from, i) => {
            const { color, opacity, width } = weightToColor(w[o][i], mx);
            const flowing = stage === 2;
            const isWinnerPath = o === prediction;
            const boosted = isWinnerPath ? Math.min(opacity + 0.35, 1) : opacity;
            return (
              <line key={`h2out-${o}-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={color}
                strokeOpacity={flowing ? Math.min(boosted + 0.2, 1) : boosted}
                strokeWidth={isWinnerPath ? width + 1 : width}
                className={flowing ? "flow-edge" : ""} />
            );
          })
        );
      })()}

      {hidden1Pos.map((pos, i) => (
        <circle key={`h1-${i}`} cx={pos.x} cy={pos.y} r={NODE_R}
          fill={h1Revealed && activations ? activationToFill(activations.hidden1[i], hidden1Max) : "#161616"}
          stroke="#94a3b8" strokeWidth={1.2} />
      ))}

      {hidden2Pos.map((pos, i) => (
        <circle key={`h2-${i}`} cx={pos.x} cy={pos.y} r={NODE_R}
          fill={h2Revealed && activations ? activationToFill(activations.hidden2[i], hidden2Max) : "#161616"}
          stroke="#94a3b8" strokeWidth={1.2} />
      ))}

      {outputPos.map((pos, i) => {
        const isWinner = prediction === i && outRevealed;
        return (
          <g key={`out-${i}`}>
            {isWinner && (
              <circle cx={pos.x} cy={pos.y} r={NODE_R + 3} fill="none"
                stroke={MANIM_GOLD} strokeWidth={2} className="winner-ring" />
            )}
            <circle cx={pos.x} cy={pos.y} r={isWinner ? NODE_R + 3 : NODE_R}
              fill={outRevealed && activations ? activationToFill(activations.output[i], outputMax) : "#161616"}
              stroke={isWinner ? MANIM_GOLD : "#94a3b8"}
              strokeWidth={isWinner ? 2.5 : 1.2} />
            <text x={pos.x + 24} y={pos.y + 4}
              fill={isWinner ? MANIM_GOLD : "#64748b"}
              fontSize={14} fontFamily="ui-sans-serif, system-ui">
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}