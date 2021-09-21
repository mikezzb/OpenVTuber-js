import * as poseDetection from '@tensorflow-models/pose-detection';
import { DRAWING_COLOR, VIDEO_SIZE } from '../config';

let net: poseDetection.PoseDetector;

const ADOPTION_POINT = 0.86;
const SCALE = 1;

export const loadPosenet = async () => {
  net = await poseDetection.createDetector(
    poseDetection.SupportedModels.PoseNet,
    {
      quantBytes: 4,
      inputResolution: VIDEO_SIZE,
      architecture: 'ResNet50',
      outputStride: 16,
    }
  );
  console.log(`posenet loaded`);
};

export const predictPose = async (input: HTMLVideoElement) => {
  if (net) {
    return await net.estimatePoses(input, {
      maxPoses: 1,
    });
  }
};

export const drawKeypoints = (keypoints: poseDetection.Keypoint[], ctx) => {
  const poseParts = {};
  keypoints.forEach(keypoint => {
    if (keypoint.score > ADOPTION_POINT) {
      const { y, x } = keypoint;
      poseParts[keypoint.name] = {
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

export const getAngle = (p2, p1) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};
