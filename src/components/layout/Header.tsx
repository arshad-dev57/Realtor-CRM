'use client';

import NotificationBell from '@/components/NotificationBell';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      background: 'var(--bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div>
        <h1 className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Date */}
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
          {dateStr}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '7px 12px',
          width: '200px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '13px', width: '100%',
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '1px 5px', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border)' }}>⌘K</span>
        </div>

        {/* ✅ Notification Bell Component - Replace the old notification button */}
        <NotificationBell />

        {/* Live indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: 'var(--success)', display: 'block',
            boxShadow: '0 0 6px var(--success)',
          }} className="badge-live" />
          <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>Live</span>
        </div>
      </div>
    </header>
  );
}