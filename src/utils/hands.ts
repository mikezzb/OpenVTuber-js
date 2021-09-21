import * as handpose from '@tensorflow-models/handpose';
import { drawLandmarks } from '.';

// MODEL

let net: handpose.HandPose;

export const loadHandpose = async () => {
  net = await handpose.load();
};

export const predictHands = async (input: HTMLVideoElement) => {
  if (net) {
    return net.estimateHands(input);
  }
};

// VRM

// CANVAS

export const drawHands = (predictions: handpose.AnnotatedPrediction[], ctx) => {
  predictions.forEach(prediction => {
    const landmarks = prediction.landmarks;
    Object.values(landmarks).forEach(landmark =>
      drawLandmarks(ctx, landmark[1], landmark[0])
    );
  });
};
