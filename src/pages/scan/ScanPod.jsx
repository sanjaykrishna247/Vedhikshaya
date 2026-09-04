import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconPod } from '../dashboard/icons';
import logo from '../../assets/logo.svg';
import './ScanPod.css';

export default function ScanPod() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('requesting'); // requesting | live | denied | detected
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('denied');
        setErrorMsg('Camera access is not supported in this browser.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('live');
      } catch (err) {
        setStatus('denied');
        setErrorMsg(err.name === 'NotAllowedError' ? 'Camera permission was denied.' : 'Could not access the camera.');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleDetect = () => {
    setStatus('detected');
  };

  const handleStartBrewing = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    navigate('/dashboard');
  };

  return (
    <div className="scan">
      <header className="scan__header">
        <Link to="/home" className="scan__brand">
          <img src={logo} alt="" className="scan__logo-img" aria-hidden="true" />
          <span className="scan__wordmark">
            Vediks<span>haya</span>
          </span>
        </Link>
        <Link to="/home" className="scan__cancel">
          Cancel
        </Link>
      </header>

      <main className="scan__main">
        <h1 className="scan__title">Scan the Pod</h1>
        <p className="scan__sub">Center the pod's label inside the frame.</p>

        <div className="scan__viewport">
          <video ref={videoRef} autoPlay playsInline muted className="scan__video" />

          {status === 'requesting' && (
            <div className="scan__overlay">
              <div className="scan__spinner" />
              <p>Requesting camera access…</p>
            </div>
          )}

          {status === 'denied' && (
            <div className="scan__overlay">
              <IconPod className="scan__overlay-icon" />
              <p>{errorMsg}</p>
              <p className="scan__overlay-hint">You can still continue with a demo pod below.</p>
            </div>
          )}

          {(status === 'live' || status === 'detected') && <div className="scan__frame" />}

          {status === 'detected' && (
            <div className="scan__result">
              <span className="scan__result-icon">
                <IconPod />
              </span>
              <div>
                <div className="scan__result-label">Pod Detected</div>
                <div className="scan__result-name">Dashamoola Kwatha</div>
              </div>
            </div>
          )}
        </div>

        <div className="scan__actions">
          {status !== 'detected' ? (
            <button className="scan__btn scan__btn--primary" onClick={handleDetect}>
              Simulate Scan
            </button>
          ) : (
            <button className="scan__btn scan__btn--primary" onClick={handleStartBrewing}>
              Start Brewing
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
