import { FC, useEffect, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
import useVRM from './hooks/useVRM';
import VRM from './components/VRM';
import './App.scss';
import CameraView from './components/CameraView';
import { loadFacemesh } from './utils/faces';
import Controls from './components/Controls';
import { loadPosenet } from './utils/poses';

const App: FC = () => {
  const webcamRef = useRef(null);
  const meshCanvasRef = useRef(null);
  const [vrm, loadVRM] = useVRM();

  const init = async () => {
    loadVRM(
      'https://raw.githubusercontent.com/mikezzb/OpenVTuber-js/master/public/vrms/AvatarSample_B.vrm'
    );
    loadFacemesh();
    loadPosenet();
    // await loadHandpose();
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
        pixelRatio={2}
        className="fiber-canvas"
        camera={{
          fov: 30,
          near: 0.1,
          far: 20,
          position: [0, 1, 5],
          zoom: 1.8,
        }}
      >
        <color attach="background" args={[0, 0, 0]} />
        <directionalLight />
        <VRM webcamRef={webcamRef} meshCanvasRef={meshCanvasRef} vrm={vrm} />
        <Controls />
      </Canvas>
      <CameraView webcamRef={webcamRef} meshCanvasRef={meshCanvasRef} />
    </div>
  );
};

export default App;
