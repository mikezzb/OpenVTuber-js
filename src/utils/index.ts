import { DRAWING_COLOR } from '../config';

// THREE

const Z_INDEX = 2;

export const euclideanDistance = (p1, p2) => {
  const x = p2[0] - p1[0];
  const y = p2[1] - p1[1];
  const z = p2[2] - p1[2];
  return Math.sqrt(x * x + y * y + z * z);
};

export const getOpenFactor = (
  annotations,
  lowerKey: string,
  upperKey: string,
  samples: number[],
  samplesLength: number
) => {
  let sum = 0;
  samples.forEach(index => {
    const lower = annotations[lowerKey][index][Z_INDEX];
    const upper = annotations[upperKey][index][Z_INDEX];
    sum += lower - upper;
  });
  return sum / samplesLength;
};

// CANVAS

export const drawLandmarks = (ctx, y, x, r = 3, color = DRAWING_COLOR) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
};

export const drawLine = (
  ctx,
  { y: y1, x: x1 },
  { y: y2, x: x2 },
  width = 1,
  color = DRAWING_COLOR,
  scale = 1
) => {
  ctx.beginPath();
  ctx.moveTo(x1 * scale, y1 * scale);
  ctx.lineTo(x2 * scale, y2 * scale);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
};
