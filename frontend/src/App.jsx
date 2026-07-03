import { useRef, useState } from "react";
import DrawingCanvas from "./components/DrawingCanvas";
import PredictionDisplay from "./components/PredictionDisplay";
import NetworkVisualizer from "./components/NetworkVisualizer";
import ProbabilityBars from "./components/ProbabilityBars";
import { usePrediction } from "./hooks/usePrediction";
import { useArchitecture } from "./hooks/useArchitecture";
import { fetchRandomDigit } from "./utils/fetchRandomDigit";

export default function App() {
  const { predict, result, loading, error, pulseId } = usePrediction();
  const architecture = useArchitecture();
  const [pixelGrid, setPixelGrid] = useState(null);
  const [trueLabel, setTrueLabel] = useState(null);
  const canvasRef = useRef(null);

  const handleRandomDigit = async () => {
    const data = await fetchRandomDigit();
    setTrueLabel(data.true_label);
    canvasRef.current?.loadExternalImage(data.image);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 py-10">
      <h1 className="text-3xl font-bold text-white tracking-wide">NeuroLens</h1>

      <div className="flex flex-col lg:flex-row items-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <DrawingCanvas
            ref={canvasRef}
            onPredict={predict}
            onPixelGrid={setPixelGrid}
            onStartDrawing={() => setTrueLabel(null)}
          />
          <button
            onClick={handleRandomDigit}
            className="px-4 py-2 bg-[#58C4DD] text-black font-medium rounded-md hover:opacity-90 transition"
          >
            Try Random Test Digit
          </button>
        </div>

        <NetworkVisualizer
          pixelGrid={pixelGrid}
          architecture={architecture}
          activations={result?.activations}
          prediction={result?.prediction}
          pulseId={pulseId}
        />

        <ProbabilityBars probabilities={result?.activations?.output} prediction={result?.prediction} />
      </div>

      <PredictionDisplay result={result} loading={loading} error={error} trueLabel={trueLabel} />
    </div>
  );
}