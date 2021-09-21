import '@tensorflow/tfjs-backend-webgl';
import * as facemesh from '@tensorflow-models/face-landmarks-detection';
import { MediaPipeFaceMesh } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';

import * as THREE from 'three';
import faceGeo from './faceGeo.json';
import { drawLandmarks } from '.';

// MODEL

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

// VRM

const Z_INDEX = 2;

export const face2quaternion = annotations => {
  const faces = annotations.silhouette;
  const x1 = new THREE.Vector3().fromArray(faces[9]);
  const x2 = new THREE.Vector3().fromArray(faces[27]);
  const y1 = new THREE.Vector3().fromArray(faces[18]);
  const y2 = new THREE.Vector3().fromArray(faces[0]);
  const xaxis = x2.sub(x1).normalize();
  const yaxis = y2.sub(y1).normalize();
  const zaxis = new THREE.Vector3().crossVectors(xaxis, yaxis);
  const mat = new THREE.Matrix4()
    .makeBasis(xaxis, yaxis, zaxis)
    .premultiply(new THREE.Matrix4().makeRotationZ(Math.PI));
  return new THREE.Quaternion().setFromRotationMatrix(mat);
};

export const lipsOpenFactor = annotations => {
  const lower = annotations.lipsLowerInner[5][Z_INDEX];
  const upper = annotations.lipsUpperInner[5][Z_INDEX];
  return lower - upper;
};

// CANVAS

// https://github.com/spite/FaceMeshFaceGeometry/blob/master/js/geometry.js
export const FACES = faceGeo;

const drawPath = (ctx, points, closePath) => {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }
  if (closePath) {
    region.closePath();
  }
  ctx.strokeStyle = 'grey';
  ctx.stroke(region);
};

export const drawMesh = (predictions, ctx) => {
  if (predictions?.length > 0) {
    predictions.forEach(prediction => {
      const keypoints = prediction.scaledMesh;
      for (let i = 0; i < FACES.length / 3; i++) {
        const points = [FACES[i * 3], FACES[i * 3 + 1], FACES[i * 3 + 2]].map(
          index => keypoints[index]
        );
        drawPath(ctx, points, true);
      }
      keypoints.forEach(point => {
        drawLandmarks(ctx, point[1], point[0], 1);
      });
    });
  }
};
