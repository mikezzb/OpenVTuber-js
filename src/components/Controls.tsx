import React, { useRef } from 'react';
import { extend, ReactThreeFiber, useFrame, useThree } from 'react-three-fiber';
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
    }
  }
}

const Controls: React.FC = () => {
  const controls = useRef<OrbitControls>(null);
  const { camera, gl } = useThree();

  useFrame(() => controls.current?.update());

  return (
    <orbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      target={new Vector3(0, 1, 1)}
      screenSpacePanning
    />
  );
};

export default Controls;
