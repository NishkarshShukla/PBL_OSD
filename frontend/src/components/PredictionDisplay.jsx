export default function PredictionDisplay({ result, loading, error, trueLabel }) {
  if (loading) return <p className="text-slate-400">Thinking…</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;
  if (!result) return <p className="text-slate-400">Draw a digit to see a prediction</p>;

  const isCorrect = trueLabel !== null && trueLabel === result.prediction;

  return (
    <div className="text-center">
      <p className="text-6xl font-bold text-white">{result.prediction}</p>
      <p className="text-slate-400 mt-1">
        Confidence: {(result.confidence * 100).toFixed(1)}%
      </p>
      {trueLabel !== null && (
        <p className={`mt-1 text-sm ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
          True label: {trueLabel} {isCorrect ? "— correct ✓" : "— missed ✗"}
        </p>
      )}
    </div>
  );
}