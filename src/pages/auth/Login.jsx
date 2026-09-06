import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { isAdmin } from '../../auth/AdminRoute';
import { usePortal } from '../../portal/PortalContext';
import { parseUsername } from '../../portal/portalData';
import logo from '../../assets/logo.svg';
import './Auth.css';

const DEMO_EMAIL = 'demo@vedikshaya.com';
const DEMO_PASSWORD = 'demo1234';
const VIDEO_PLAYBACK_RATE = 0.7;
// A slow crossfade lingers long enough to notice the steam's swirl pattern
// "morph" between the two layers (they're different moments of the same
// clip). A quick, snappy handoff reads as a natural flicker instead.
const FADE_WINDOW = 0.4; // video-seconds from a loop boundary that count as "near the cut"
const TAIL_TRIM = 1.0; // seconds of the clip's tail (steam thinning out) to never show

// DR2024@apollohospital.com / PT1042@apollohospital.com style logins
const PORTAL_LIKE = /^(dr|pt)\d/i;

export default function Login() {
  const { login } = useAuth();
  const { portalLogin } = usePortal();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState('a');
  const videoARef = useRef(null);
  const videoBRef = useRef(null);

  // Two copies of the same clip, both looping natively and both always
  // playing forward (never seeked), offset by half the clip's duration.
  // Each one's jump-cut restart happens while it's the hidden layer, so the
  // visible layer is always mid-playback and the crossfade between them
  // reads as continuous motion with no stutter (seeking a compressed video
  // frame-by-frame, as a manual reverse-scrub would need, is not smooth).
  useEffect(() => {
    const a = videoARef.current;
    const b = videoBRef.current;
    if (!a || !b) return;

    let rafId;
    let offsetApplied = false;
    let active = 'a';

    const applyRate = () => {
      a.playbackRate = VIDEO_PLAYBACK_RATE;
      b.playbackRate = VIDEO_PLAYBACK_RATE;
    };
    applyRate();
    a.addEventListener('loadedmetadata', applyRate);
    b.addEventListener('loadedmetadata', applyRate);

    const tick = () => {
      if (!offsetApplied && a.duration) {
        b.currentTime = a.duration / 2;
        offsetApplied = true;
      }

      if (offsetApplied) {
        // Only "approaching the end" counts as unsafe — currentTime near 0
        // right after a restart is exactly what we want the hidden layer to
        // be doing, not a reason to switch away from the visible one. The
        // last TAIL_TRIM seconds (steam thinning out) never get shown at all
        // — we hand off before reaching them, so they only ever play while
        // this layer is hidden.
        const nearEnd = (v) => v.duration - TAIL_TRIM - v.currentTime < FADE_WINDOW;
        if (active === 'a' && nearEnd(a)) {
          active = 'b';
          setActiveVideo('b');
        } else if (active === 'b' && nearEnd(b)) {
          active = 'a';
          setActiveVideo('a');
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      a.removeEventListener('loadedmetadata', applyRate);
      b.removeEventListener('loadedmetadata', applyRate);
    };
  }, []);

  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const trimmed = email.trim();

      // Role-based portal login (DR####@domain / PT####@domain)
      if (PORTAL_LIKE.test(trimmed) || parseUsername(trimmed).valid) {
        if (!parseUsername(trimmed).valid) throw new Error('Invalid username format');
        const sess = await portalLogin(trimmed, password);
        navigate(sess.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', { replace: true });
        return;
      }

      const data = await login(trimmed, password);
      const redirectTo = isAdmin(data?.user) ? '/admin' : location.state?.from || '/home';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth auth--video">
      <video
        ref={videoARef}
        className={`auth__video ${activeVideo === 'a' ? 'auth__video--active' : ''}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/videos/brew-overhead-poster.jpg"
      >
        <source src="/videos/brew-overhead-v4.mp4" type="video/mp4" />
      </video>
      <video
        ref={videoBRef}
        className={`auth__video ${activeVideo === 'b' ? 'auth__video--active' : ''}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/videos/brew-overhead-v4.mp4" type="video/mp4" />
      </video>
      <div className="auth__video-overlay" />

      <div className="auth__card auth__card--glass">
        <div className="auth__brand">
          <img src={logo} alt="" className="auth__logo-img" aria-hidden="true" />
          <span className="auth__wordmark">
            Vediks<span>haya</span>
          </span>
        </div>

        <h1 className="auth__title">Welcome back</h1>

        {error && <div className="auth__error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="auth__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth__submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <div className="auth__divider">
          <span>or</span>
        </div>

        <button type="button" className="auth__demo-cta auth__demo-cta--light" onClick={fillDemoCredentials}>
          Use Demo Account
        </button>

        <p className="auth__switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        <Link to="/" className="auth__back">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
