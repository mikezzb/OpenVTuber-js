import { VRM as ThreeVRM, VRMSchema } from '@pixiv/three-vrm';
import { RefObject, useRef, FC } from 'react';
import { useFrame } from 'react-three-fiber';
import { AnnotatedPrediction } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';
import Webcam from 'react-webcam';
import {
  face2quaternion,
  lipsOpenFactor,
  drawMesh,
  predictFace,
  getEyesOpen,
} from '../utils/faces';
import {
  drawConnectors,
  drawKeypoints,
  getAngle,
  predictPose,
} from '../utils/poses';

type Props = {
  vrm: ThreeVRM | null;
  webcamRef: RefObject<Webcam>;
  meshCanvasRef: RefObject<HTMLCanvasElement>;
};

const VRM: FC<Props> = ({ vrm, webcamRef, meshCanvasRef }) => {
  const prevState = useRef<{
    face: AnnotatedPrediction[];
    angle: Record<string, any>;
  }>({ face: [], angle: {} });

  useFrame(async ({ clock, mouse }, delta) => {
    if (vrm && webcamRef?.current) {
      // Face Handling
      const predictions = await predictFace(webcamRef.current.video);
      if (predictions && (predictions[0] as any)?.annotations) {
        const annotations = (predictions[0] as any)?.annotations;
        // Head
        vrm.humanoid
          .getBoneNode(VRMSchema.HumanoidBoneName.Head)
          .quaternion.slerp(face2quaternion(annotations), 0.1);
        // Lips
        vrm.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.A,
          lipsOpenFactor(annotations)
        );
        // Eyes
        const eyesOpen = getEyesOpen(predictions[0].scaledMesh as any);
        vrm.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.BlinkL,
          eyesOpen.left ? 1 : 0
        );
        vrm.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.BlinkR,
          eyesOpen.right ? 1 : 0
        );
      }
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      meshCanvasRef.current.width = videoWidth;
      meshCanvasRef.current.height = videoHeight;
      const ctx = meshCanvasRef.current.getContext('2d');
      drawMesh(predictions, ctx);

      // Hand Handling (DISABLED DUE TO ISSUE: https://github.com/tensorflow/tfjs/issues/2942)
      /*
      const handPredictions = await predictHands(webcamRef.current.video);
      if (handPredictions) {
        drawHands(handPredictions, ctx);
      }
      */

      /* Pose Handling
       * https://gist.github.com/atskimura/198e558e0eff94774892d4ee9e22f98e
       */
      const { keypoints } = (await predictPose(webcamRef.current.video)) || {};
      if (keypoints) {
        const poseParts: any = drawKeypoints(keypoints, ctx);
        drawConnectors(keypoints, ctx);

        if (poseParts.leftShoulder && poseParts.rightShoulder) {
          let angle = getAngle(poseParts.rightShoulder, poseParts.leftShoulder);
          if (angle !== null) {
            angle = -angle;
            prevState.current.angle.Spine = angle;
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Spine
            ).rotation.z = angle;
          }
        }
        if (poseParts.leftShoulder && poseParts.leftElbow) {
          let angle = getAngle(poseParts.leftElbow, poseParts.leftShoulder);
          if (angle !== null) {
            angle = Math.PI - angle;
            prevState.current.angle.RightUpperArm = angle;
            angle = angle - (prevState.current.angle.Spine || 0);
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightUpperArm
            ).rotation.z = angle;
          }
        }
        if (poseParts.leftWrist && poseParts.leftElbow) {
          let angle = getAngle(poseParts.leftWrist, poseParts.leftElbow);
          if (angle !== null) {
            angle = Math.PI - angle;
            prevState.current.angle.RightLowerArm = angle;
            angle = angle - (prevState.current.angle.RightUpperArm || 0);
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightLowerArm
            ).rotation.z = angle;
          }
        }
        if (poseParts.rightShoulder && poseParts.rightElbow) {
          let angle = getAngle(poseParts.rightElbow, poseParts.rightShoulder);
          if (angle !== null) {
            angle = angle * -1;
            prevState.current.angle.LeftUpperArm = angle;
            angle = angle - (prevState.current.angle.Spine || 0);
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftUpperArm
            ).rotation.z = angle;
          }
        }
        if (poseParts.rightWrist && poseParts.rightElbow) {
          let angle = getAngle(poseParts.rightWrist, poseParts.rightElbow);
          if (angle !== null) {
            angle = -angle;
            prevState.current.angle.LeftLowerArm = angle;
            angle = angle - (prevState.current.angle.LeftUpperArm || 0);
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftLowerArm
            ).rotation.z = angle;
          }
        }
      }

      vrm.update(delta);
    }
  });

  return vrm && <primitive object={vrm.scene} />;
};

export default VRM;
