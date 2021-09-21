import { DRAWING_COLOR } from '../config';

export const drawLandmarks = (ctx, y, x, r = 3) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = DRAWING_COLOR;
  ctx.fill();
};
