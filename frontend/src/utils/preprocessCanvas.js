/**
 * Pulls the raw image data out of the canvas as a base64 PNG.
 * Actual resizing to 28x28 happens server-side in inference.py —
 * we just need to hand over a clean snapshot of what was drawn.
 */
export function canvasToBase64(canvas) {
  return canvas.toDataURL("image/png"); // "data:image/png;base64,...."
}

export function isCanvasBlank(canvas) {
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // every pixel white (255,255,255,255) => nothing drawn
  return !data.some((channel, i) => i % 4 !== 3 && channel !== 255);
}