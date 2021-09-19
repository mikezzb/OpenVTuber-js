import { VRM as ThreeVRM } from '@pixiv/three-vrm';
import { RefObject, useRef, FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { AnnotatedPrediction } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';
import Webcam from 'react-webcam';
import { predictFace } from '../utils/facemesh';
import { face2quaternion } from '../utils/faces';
import { drawMesh } from '../utils';

type Props = {
  vrm: ThreeVRM | null;
  webcamRef: RefObject<Webcam>;
  meshCanvasRef: RefObject<HTMLCanvasElement>;
};

const VRM: FC<Props> = ({ vrm, webcamRef, meshCanvasRef }) => {
  const prevFaceRef = useRef<{
    face: AnnotatedPrediction[];
  }>({ face: [] });

  useFrame(async ({ clock, mouse }, delta) => {
    if (
      vrm &&
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const predictions = await predictFace(webcamRef.current.video);
      if (predictions && (predictions[0] as any)?.annotations) {
        const annotations = (predictions[0] as any)?.annotations;
        const head = vrm.humanoid.getBoneNode('head' as any);
        head.quaternion.slerp(face2quaternion(annotations), 0.1);
      }
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      meshCanvasRef.current.width = videoWidth;
      meshCanvasRef.current.height = videoHeight;
      const ctx = meshCanvasRef.current.getContext('2d');
      requestAnimationFrame(() => {
        drawMesh(predictions, ctx);
      });
      vrm.update(delta);
    }
  });

  return vrm && <primitive object={vrm.scene} />;
};

export default VRM;