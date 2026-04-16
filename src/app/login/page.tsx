'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authController } from '@/controllers/auth.controller';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if already logged in
    if (authController.isLoggedIn()) {
      router.push('/dashboard');
    }
  }, [router]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < 38; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
      });
    }

    let animFrame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.055 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await authController.adminLogin(email, password);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <>
      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }

        .lp {
          width: 52%;
          background: #1e2d3d;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          padding: clamp(2rem, 5vw, 4rem) clamp(2rem, 4vw, 3.5rem);
        }

        .lp-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .lp-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 65% 55% at 25% 40%, rgba(83,125,150,0.22) 0%, transparent 70%),
                      radial-gradient(ellipse 45% 45% at 80% 75%, rgba(30,45,61,0.5) 0%, transparent 60%);
        }

        .lp-body {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
        }

        .brand-icon {
          width: 46px;
          height: 46px;
          background: linear-gradient(135deg, #537D96 0%, #7bafc9 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(83,125,150,0.35);
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.4px;
        }

        .brand-sub {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.38);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .lp-headline {
          font-size: clamp(1.75rem, 3vw, 2.4rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -0.8px;
          margin-bottom: 14px;
        }

        .lp-headline span {
          background: linear-gradient(120deg, #7bafc9 0%, #a8d4e8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .lp-desc {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.75;
          margin-bottom: clamp(2rem, 4vw, 3rem);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 18px 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        .stat-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 5px;
        }

        .stat-lbl {
          font-size: 11px;
          color: rgba(255,255,255,0.38);
        }

        .stat-chg {
          font-size: 10.5px;
          color: #10b981;
          margin-top: 7px;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .rp {
          width: 48%;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem);
          position: relative;
        }

        .form-wrap {
          width: 100%;
          max-width: 370px;
        }

        .fh { margin-bottom: 32px; }

        .fh-eyebrow {
          font-size: 10.5px;
          font-weight: 700;
          color: #537D96;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .fh-eyebrow::before {
          content: '';
          width: 18px;
          height: 2px;
          background: #537D96;
          border-radius: 2px;
        }

        .fh-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.8px;
          margin-bottom: 8px;
        }

        .fh-sub {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #e8f0f5;
          border: 1px solid rgba(83,125,150,0.2);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #537D96;
          margin-bottom: 28px;
        }

        .admin-dot {
          width: 7px;
          height: 7px;
          background: #537D96;
          border-radius: 50%;
          animation: pulse 1.5s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .field { margin-bottom: 18px; }

        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 7px;
        }

        .input-shell { position: relative; }

        .input-ico {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .field-input {
          width: 100%;
          padding: 12px 13px 12px 40px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #1e293b;
          background: #ffffff;
          outline: none;
          transition: all 0.3s ease;
        }

        .field-input:focus {
          border-color: #537D96;
          box-shadow: 0 0 0 3px rgba(83,125,150,0.1);
        }

        .field-input.pr { padding-right: 42px; }

        .eye-btn {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          transition: color 0.3s ease;
        }

        .eye-btn:hover {
          color: #537D96;
        }

        .opts {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 26px;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
        }

        .remember input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #537D96;
        }

        .forgot {
          font-size: 13px;
          color: #537D96;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .forgot:hover {
          color: #3a617a;
        }

        .err-box {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 9px;
          padding: 11px 14px;
          color: #ef4444;
          font-size: 13px;
          margin-bottom: 18px;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .submit-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #1e2d3d 0%, #2d4a61 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(30,45,61,0.3);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Enhanced Spinner */
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid #fff;
          border-right: 2px solid #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Button Loading Text */
        .btn-text {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .loading-dots {
          display: flex;
          gap: 3px;
        }

        .loading-dots span {
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          animation: dotPulse 1.4s ease infinite;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 26px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .divider-txt {
          font-size: 11.5px;
          color: #94a3b8;
        }

        .demo-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 18px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .demo-box:hover {
          border-color: #537D96;
          box-shadow: 0 2px 8px rgba(83,125,150,0.1);
        }

        .demo-title {
          font-size: 10.5px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .demo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
        }

        .demo-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
          background: #1e2d3d;
          color: #fff;
        }

        .demo-creds {
          color: #475569;
          font-family: monospace;
        }

        .form-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 11.5px;
          color: #94a3b8;
        }

        @media (max-width: 900px) {
          .lp { display: none; }
          .rp { width: 100%; }
        }
      `}</style>

      <div className="login-root">
        <div className="lp">
          <canvas ref={canvasRef} className="lp-canvas" />
          <div className="lp-overlay" />
          <div className="lp-body">
            <div className="brand">
              <div className="brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div className="brand-name">EliteCRM</div>
                <div className="brand-sub">Enterprise</div>
              </div>
            </div>

            <h2 className="lp-headline">
              Real estate sales,<br />
              <span>intelligently managed.</span>
            </h2>
            <p className="lp-desc">
              A unified command center for admin teams — track leads, manage realtors, and close deals with full visibility.
            </p>

            <div className="stats-grid">
              {[
                { value: '$4.83M', label: 'Total Revenue', change: '+18.4%' },
                { value: '3,847', label: 'Active Leads', change: '+12.1%' },
                { value: '193', label: 'Closed Deals', change: '+8.9%' },
                { value: '284', label: 'Active Users', change: '+5.2%' },
              ].map((s) => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                  <div className="stat-chg">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    {s.change} vs last month
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rp">
          <div className="form-wrap">
            <div className="fh">
              <div className="fh-eyebrow">Admin Portal</div>
              <h1 className="fh-title">Welcome back</h1>
              <p className="fh-sub">Sign in to your EliteCRM admin workspace.</p>
            </div>

            <div className="admin-badge">
              <span className="admin-dot" />
              Administrator Access
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label">Email Address</label>
                <div className="input-shell">
                  <span className="input-ico">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="field-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@elitecrm.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Password</label>
                <div className="input-shell">
                  <span className="input-ico">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="field-input pr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    className="eye-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="opts">
                <label className="remember">
                  <input type="checkbox" disabled={isLoading} /> Remember me
                </label>
                <a href="#" className="forgot">Forgot password?</a>
              </div>

              {error && (
                <div className="err-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <div className="btn-text">
                    <div className="spinner" />
                    <span>Signing in</span>
                    <div className="loading-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  </div>
                ) : (
                  <>
                    Sign in to Dashboard
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-txt">Demo credentials</span>
              <div className="divider-line" />
            </div>

            <div 
              className="demo-box"
              onClick={() => {
                setEmail('admin@elitecrm.com');
                setPassword('admin123');
              }}
            >
              <div className="demo-title">Quick Access</div>
              <div className="demo-row">
                <span className="demo-badge">Admin</span>
                <span className="demo-creds">admin@elitecrm.com / admin123</span>
              </div>
            </div>

            <div className="form-footer">© 2025 EliteCRM Enterprise. All rights reserved.</div>
          </div>
        </div>
      </div>
    </>
  );
}