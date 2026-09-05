import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { IconPod } from '../dashboard/icons';
import { useKashaya } from '../../auth/KashayaContext';
import logo from '../../assets/logo.svg';
import './ScanPod.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function isUrl(text) {
  return /^https?:\/\//i.test(text);
}

// Some pods encode the kashaya name directly as plain text (or a small
// {"name": "..."} JSON payload); others encode a link to a hosted page
// (e.g. a me-qr.com "text" page) that displays the name in its content.
function extractPlainKashayaName(rawText) {
  const text = rawText.trim();
  if (!text) return '';
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.name === 'string' && parsed.name.trim()) {
        return parsed.name.trim();
      }
    } catch {
      // not JSON — fall through and use the raw text
    }
  }
  return text;
}

// The scanned URL can't be fetched directly from the browser (the target
// site won't send CORS headers for a random client), so the backend fetches
// it and pulls the name out of the page content.
async function resolveKashayaFromUrl(url) {
  const res = await fetch(`${API_BASE}/qr/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Could not read the pod name from that QR code.');
  }
  return data.name;
}

export default function ScanPod() {
  const navigate = useNavigate();
  const { setKashaya } = useKashaya();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [status, setStatus] = useState('requesting'); // requesting | live | denied | resolving | detected | resolve-error
  const [errorMsg, setErrorMsg] = useState('');
  const [detectedName, setDetectedName] = useState('');

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

  // Real-time QR scanning: sample video frames onto an offscreen canvas and
  // run jsQR against the pixel data until a code is found.
  useEffect(() => {
    if (status !== 'live') return undefined;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return undefined;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const SCAN_WIDTH = 400; // downscaled for faster decode; QR still reads fine

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
        const scale = SCAN_WIDTH / video.videoWidth;
        canvas.width = SCAN_WIDTH;
        canvas.height = video.videoHeight * scale;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          const raw = code.data.trim();
          if (isUrl(raw)) {
            setStatus('resolving');
            resolveKashayaFromUrl(raw)
              .then((name) => {
                setDetectedName(name);
                setStatus('detected');
              })
              .catch((err) => {
                setErrorMsg(err.message);
                setStatus('resolve-error');
              });
            return;
          }
          const name = extractPlainKashayaName(raw);
          if (name) {
            setDetectedName(name);
            setStatus('detected');
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status]);

  const handleStartBrewing = () => {
    if (detectedName) setKashaya(detectedName);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    navigate('/dashboard');
  };

  const handleScanAgain = () => {
    setDetectedName('');
    setErrorMsg('');
    setStatus('live');
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
        <span className="scan__eyebrow">
          <span className="scan__eyebrow-dot" /> Pod Scanner
        </span>
        <h1 className="scan__title">Scan the Pod</h1>
        <p className="scan__sub">
          {status === 'detected'
            ? 'Pod identified.'
            : status === 'resolving'
            ? 'Reading pod details…'
            : status === 'resolve-error'
            ? "Couldn't read the pod name."
            : "Center the pod's QR code inside the frame."}
        </p>

        <div className="scan__viewport">
          <video ref={videoRef} autoPlay playsInline muted className="scan__video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

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
            </div>
          )}

          {status === 'resolving' && (
            <div className="scan__overlay">
              <div className="scan__spinner" />
              <p>Reading pod details…</p>
            </div>
          )}

          {status === 'resolve-error' && (
            <div className="scan__overlay">
              <IconPod className="scan__overlay-icon" />
              <p>{errorMsg}</p>
            </div>
          )}

          {(status === 'live' || status === 'detected') && (
            <div className="scan__frame">
              <span className="scan__corner scan__corner--tl" />
              <span className="scan__corner scan__corner--tr" />
              <span className="scan__corner scan__corner--bl" />
              <span className="scan__corner scan__corner--br" />
            </div>
          )}

          {status === 'detected' && (
            <div className="scan__result">
              <span className="scan__result-icon">
                <IconPod />
              </span>
              <div>
                <div className="scan__result-label">Pod Detected</div>
                <div className="scan__result-name">{detectedName}</div>
              </div>
            </div>
          )}
        </div>

        <div className="scan__actions">
          {status === 'detected' ? (
            <button className="scan__btn scan__btn--primary" onClick={handleStartBrewing}>
              Start Brewing
            </button>
          ) : status === 'resolve-error' ? (
            <button className="scan__btn scan__btn--primary" onClick={handleScanAgain}>
              Try Again
            </button>
          ) : status === 'denied' ? (
            <Link to="/home" className="scan__btn scan__btn--primary">
              Back to Home
            </Link>
          ) : status === 'resolving' ? null : (
            <p className="scan__sub scan__sub--hint">Scanning automatically…</p>
          )}
          {status === 'detected' && (
            <button className="scan__btn scan__btn--ghost" onClick={handleScanAgain}>
              Scan Again
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
