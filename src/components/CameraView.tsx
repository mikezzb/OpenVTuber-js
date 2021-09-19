import { FC, RefObject } from 'react';
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';
import './CameraView.scss';

type Props = {
  webcamRef: RefObject<Webcam>;
  meshCanvasRef: RefObject<HTMLCanvasElement>;
};

const CameraView: FC<Props> = ({ webcamRef, meshCanvasRef }) => {
  return (
    <>
      <Webcam
        onUserMediaError={e => alert(e)}
        audio={false}
        className="webcam-video"
        ref={webcamRef}
      />
      <canvas
        width={320}
        height={240}
        className="facemesh-canvas"
        ref={meshCanvasRef}
      />
    </>
  );
};

export default CameraView;
