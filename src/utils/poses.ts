import * as posenet from '@tensorflow-models/posenet';
import { DRAWING_COLOR, VIDEO_SIZE } from '../config';

// MODEL

let net: posenet.PoseNet;

const ADOPTION_POINT = 0.86;
const SCALE = 2;

export const loadPosenet = async () => {
  net = await posenet.load({
    inputResolution: {
      height: VIDEO_SIZE.height * SCALE,
      width: VIDEO_SIZE.width * SCALE,
    },
    architecture: 'ResNet50',
    outputStride: 32,
  });
};

export const predictPose = async (input: HTMLVideoElement) => {
  if (net) {
    return await net.estimateSinglePose(input);
  }
};

// VRM

export const getAngle = (p2, p1) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

// CANVAS

export const drawKeypoints = (keypoints: posenet.Keypoint[], ctx) => {
  const poseParts = {};
  keypoints.forEach(keypoint => {
    if (keypoint.score > ADOPTION_POINT) {
      const { y, x } = keypoint.position;
      poseParts[keypoint.part] = {
        x: VIDEO_SIZE.width - x,
        y: VIDEO_SIZE.height - y,
      };
      drawPoint(ctx, y * SCALE, x * SCALE, 3);
    }
  });
  return poseParts;
};

export function drawPoint(ctx, y, x, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = DRAWING_COLOR;
  ctx.fill();
}
