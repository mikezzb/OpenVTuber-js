import '@tensorflow/tfjs-backend-webgl';
import * as facemesh from '@tensorflow-models/face-landmarks-detection';
import { MediaPipeFaceMesh } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';
let net: MediaPipeFaceMesh;

export const loadFacemesh = async () => {
  net = await facemesh.load(facemesh.SupportedPackages.mediapipeFacemesh, {
    maxFaces: 1,
  });
};

export const predictFace = async (input: HTMLVideoElement) => {
  if (net) {
    return await net.estimateFaces({ input });
  }
};
