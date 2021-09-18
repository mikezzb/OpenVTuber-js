import '@tensorflow/tfjs-backend-webgl';
import * as facemesh from '@tensorflow-models/face-landmarks-detection';
import { MediaPipeFaceMesh } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';

let net: MediaPipeFaceMesh;

export const loadFacemesh = async () => {
  net = await facemesh.load();
};

export const predictFace = async (input: HTMLVideoElement) => {
  return await net.estimateFaces({ input });
};
