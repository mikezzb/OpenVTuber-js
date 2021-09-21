import { VRM as ThreeVRM, VRMSchema } from '@pixiv/three-vrm';
import { RefObject, useRef, FC } from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import { AnnotatedPrediction } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';
import Webcam from 'react-webcam';
import { predictFace } from '../utils/facemesh';
import { face2quaternion } from '../utils/faces';
import { drawMesh } from '../utils/drawMesh';
import { drawKeypoints, getAngle, predictPose } from '../utils/poses';

type Props = {
  vrm: ThreeVRM | null;
  webcamRef: RefObject<Webcam>;
  meshCanvasRef: RefObject<HTMLCanvasElement>;
};

const VRM: FC<Props> = ({ vrm, webcamRef, meshCanvasRef }) => {
  const { scene } = useThree();
  const prevState = useRef<{
    face: AnnotatedPrediction[];
    angle: Record<string, any>;
  }>({ face: [], angle: {} });

  useFrame(async ({ clock, mouse }, delta) => {
    if (
      vrm &&
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Face Handling
      const predictions = await predictFace(webcamRef.current.video);
      if (predictions && (predictions[0] as any)?.annotations) {
        const annotations = (predictions[0] as any)?.annotations;
        vrm.humanoid
          .getBoneNode(VRMSchema.HumanoidBoneName.Head)
          .quaternion.slerp(face2quaternion(annotations), 0.1);
      }
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      meshCanvasRef.current.width = videoWidth;
      meshCanvasRef.current.height = videoHeight;
      const ctx = meshCanvasRef.current.getContext('2d');
      drawMesh(predictions, ctx);

      // Pose Handling
      const [{ keypoints }] = (await predictPose(webcamRef.current.video)) || [
        {},
      ];
      if (keypoints) {
        const poseParts: any = drawKeypoints(keypoints, ctx);

        if (poseParts.left_shoulder && poseParts.right_shoulder) {
          let angle = getAngle(
            poseParts.right_shoulder,
            poseParts.left_shoulder
          );
          if (angle !== null) {
            angle = -angle;
            prevState.current.angle.Spine = angle;
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Spine
            ).rotation.z = angle;
          }
        }
        if (poseParts.left_shoulder && poseParts.left_elbow) {
          let angle = getAngle(poseParts.left_elbow, poseParts.left_shoulder);
          if (angle !== null) {
            angle = Math.PI - angle;
            prevState.current.angle.RightUpperArm = angle;
            angle = angle - (prevState.current.angle.Spine || 0);
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightUpperArm
            ).rotation.z = angle;
          }
        }
        if (poseParts.left_wrist && poseParts.left_elbow) {
          let angle = getAngle(poseParts.left_wrist, poseParts.left_elbow);
          if (angle !== null) {
            angle = Math.PI - angle;
            prevState.current.angle.RightLowerArm = angle;
            angle = angle - (prevState.current.angle.RightUpperArm || 0);
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightLowerArm
            ).rotation.z = angle;
          }
        }
        if (poseParts.right_shoulder && poseParts.right_elbow) {
          let angle = getAngle(poseParts.right_elbow, poseParts.right_shoulder);
          if (angle !== null) {
            angle = angle * -1;
            prevState.current.angle.LeftUpperArm = angle;
            angle = angle - (prevState.current.angle.Spine || 0);
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftUpperArm
            ).rotation.z = angle;
          }
        }
        if (poseParts.right_wrist && poseParts.right_elbow) {
          let angle = getAngle(poseParts.right_wrist, poseParts.right_elbow);
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
