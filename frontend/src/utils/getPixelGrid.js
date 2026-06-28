/**
 * Downscales the drawing canvas to a 28x28 grayscale array (0-1)
 * purely so the visualizer can render the input pixels.
 * This is independent of inference.py's own preprocessing — it doesn't
 * need to match exactly, it just needs to look right.
 */
export function getPixelGrid(sourceCanvas, size = 28) {
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  const ctx = off.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(sourceCanvas, 0, 0, size, size);

  const { data } = ctx.getImageData(0, 0, size, size);
  const grid = new Array(size * size);
  for (let i = 0; i < size * size; i++) {
    const r = data[i * 4];
    grid[i] = (255 - r) / 255; // dark stroke on white -> bright value
  }
  return grid;
}