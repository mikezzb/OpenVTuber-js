import { FC, RefObject } from 'react';
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';
import './CameraView.scss';
import { VIDEO_SIZE } from '../config';

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
        width={VIDEO_SIZE.width}
        height={VIDEO_SIZE.height}
      />
      <canvas
        width={VIDEO_SIZE.width}
        height={VIDEO_SIZE.height}
        className="facemesh-canvas"
        ref={meshCanvasRef}
      />
    </>
  );
};

export default CameraView;
