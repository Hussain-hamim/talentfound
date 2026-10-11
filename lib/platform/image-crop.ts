export type CropPosition = { x: number; y: number };

/** Convert a normalized focal point into a square fully inside the source image. */
export function squareCrop(
  width: number,
  height: number,
  zoom: number,
  position: CropPosition,
) {
  const size = Math.min(width, height) / Math.max(1, zoom);
  return {
    x: Math.max(0, Math.min(width - size, position.x * width - size / 2)),
    y: Math.max(0, Math.min(height - size, position.y * height - size / 2)),
    size,
  };
}
