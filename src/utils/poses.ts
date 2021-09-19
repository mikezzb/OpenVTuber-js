import * as posenet from '@tensorflow-models/posenet';
import { DRAWING_COLOR, VIDEO_SIZE } from '../config';

let net: posenet.PoseNet;

const ADOPTION_POINT = 0.42;
const SCALE = 2;

export const loadPosenet = async () => {
  net = await posenet.load({
    inputResolution: {
      height: VIDEO_SIZE.height * SCALE,
      width: VIDEO_SIZE.width * SCALE,
    },
    architecture: 'MobileNetV1',
    outputStride: 8,
  });
};

export const predictPose = async (input: HTMLVideoElement) => {
  if (net) {
    return await net.estimateSinglePose(input);
  }
};

export const drawKeypoints = (keypoints: posenet.Keypoint[], ctx) => {
  keypoints.forEach(keypoint => {
    if (keypoint.score > ADOPTION_POINT) {
      const { y, x } = keypoint.position;
      drawPoint(ctx, y * SCALE, x * SCALE, 3);
    }
  });
};

export function drawPoint(ctx, y, x, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = DRAWING_COLOR;
  ctx.fill();
}
