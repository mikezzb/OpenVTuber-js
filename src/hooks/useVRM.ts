import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm';
import { useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ARM_ROTATE_DEGREE = 1.2;

const useVRM = (): [VRM | null, (_: string) => void] => {
  const { current: loader } = useRef(new GLTFLoader());
  const [vrm, setVRM] = useState<VRM | null>(null);

  const loadVRM = (url: string): void => {
    loader.load(url, gltf => {
      VRM.from(gltf).then(vrm => {
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        vrm.scene.rotateY(Math.PI);
        vrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.LeftUpperArm
        ).rotation.z = ARM_ROTATE_DEGREE;
        vrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.RightUpperArm
        ).rotation.z = -ARM_ROTATE_DEGREE;
        setVRM(vrm);
      });
    });
  };

  return [vrm, loadVRM];
};

export default useVRM;
