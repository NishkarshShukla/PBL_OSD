import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";
import { canvasToBase64, isCanvasBlank } from "../utils/preprocessCanvas";
import { getPixelGrid } from "../utils/getPixelGrid";

const CANVAS_SIZE = 280;

const DrawingCanvas = forwardRef(function DrawingCanvas(
  { onPredict, onPixelGrid, onStartDrawing },
  ref
) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
  }, []);

  useImperativeHandle(ref, () => ({
    loadExternalImage(dataUrl) {
      const canvas = canvasRef.current;
      const visibleCtx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        // MNIST test images are white-digit-on-black; invert colors so it
        // matches our white-canvas / black-stroke drawing convention.
        const off = document.createElement("canvas");
        off.width = img.width;
        off.height = img.height;
        const offCtx = off.getContext("2d");
        offCtx.drawImage(img, 0, 0);
        const imgData = offCtx.getImageData(0, 0, off.width, off.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = 255 - d[i];
          d[i + 1] = 255 - d[i + 1];
          d[i + 2] = 255 - d[i + 2];
        }
        offCtx.putImageData(imgData, 0, 0);

        visibleCtx.fillStyle = "white";
        visibleCtx.fillRect(0, 0, canvas.width, canvas.height);
        visibleCtx.drawImage(off, 0, 0, canvas.width, canvas.height);

        onPredict(canvasToBase64(canvas), true);
        if (onPixelGrid) onPixelGrid(getPixelGrid(canvas));
      };
      img.src = dataUrl;
    },
  }));

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    if (onStartDrawing) onStartDrawing();
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (isCanvasBlank(canvas)) return;
    onPredict(canvasToBase64(canvas), true);
    if (onPixelGrid) onPixelGrid(getPixelGrid(canvas));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="border-2 border-slate-700 rounded-lg cursor-crosshair touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <button
        onClick={clearCanvas}
        className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition"
      >
        Clear
      </button>
    </div>
  );
});

export default DrawingCanvas;