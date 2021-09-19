import { FC, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import useVRM from './hooks/useVRM';
import VRM from './components/VRM';
import './App.scss';
import CameraView from './components/CameraView';
import { loadFacemesh } from './utils/facemesh';
import Controls from './components/Controls';

const App: FC = () => {
  const webcamRef = useRef(null);
  const meshCanvasRef = useRef(null);
  const [vrm, loadVRM] = useVRM();

  const init = async () => {
    loadVRM('/vrms/AliciaSolid.vrm');
    await loadFacemesh();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div>
      <Canvas
        style={{
          height: '100vh',
          width: '100vw',
        }}
        className="fiber-canvas"
        camera={{
          fov: 30,
          near: 0.1,
          far: 20,
          position: [0, 1, 5],
          zoom: 1.8,
        }}
      >
        <directionalLight position={[1, 1, 1]} />
        <VRM webcamRef={webcamRef} meshCanvasRef={meshCanvasRef} vrm={vrm} />
        <Controls />
        <gridHelper />
        <axesHelper />
      </Canvas>
      <CameraView webcamRef={webcamRef} meshCanvasRef={meshCanvasRef} />
    </div>
  );
};

export default App;
