import { useRef, useEffect, useState } from 'react';
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';
import { drawMesh } from '../utils';
import { DETECT_INTERVAL } from '../config';
import { loadFacemesh, predictFace } from '../utils/facemesh';

function MainPage() {
  const [loading, setLoading] = useState(true);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const init = async () => {
    await loadFacemesh();
    await detect();
    setLoading(false);
    setInterval(() => {
      detect();
    }, DETECT_INTERVAL);
  };

  const detect = async () => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const face = await predictFace(video);

      const ctx = canvasRef.current.getContext('2d');
      requestAnimationFrame(() => {
        drawMesh(face, ctx);
      });
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam ref={webcamRef} />
        <canvas ref={canvasRef} />
      </header>
      {loading && 'Loading...'}
    </div>
  );
}

export default MainPage;
