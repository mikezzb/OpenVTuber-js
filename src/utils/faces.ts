import * as THREE from 'three';
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
