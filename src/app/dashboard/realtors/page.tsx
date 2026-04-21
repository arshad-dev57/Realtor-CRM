'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/lib/api';

interface Realtor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  agencyName?: string;
  licenseNumber?: string;
  serviceCountry?: string;
  serviceCity?: string;
  isProfileComplete: boolean;
  createdAt: string;
  totalSales?: number;
  totalVolume?: number;
  activeListing?: number;
  rating?: number;
  tier?: string;
  profilePhoto?: string;
}

const tierConfig: Record<string, { bg: string; color: string; border: string }> = {
  Platinum: { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  Gold: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  Silver: { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.2)' },
};

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  Active: { bg: 'rgba(16,185,129,0.08)', color: '#10b981', dot: '#10b981' },
  Inactive: { bg: 'rgba(107,114,128,0.08)', color: '#9ca3af', dot: '#9ca3af' },
  Pending: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', dot: '#f59e0b' },
};

const avatarColors = ['#3b7eff', '#00d4aa', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24"
          fill={s <= Math.floor(rating) ? '#f59e0b' : s - 0.5 <= rating ? 'url(#half)' : 'none'}
          stroke="#f59e0b" strokeWidth="1.5">
          <defs>
            <linearGradient id="half" x1="0" y1="0" x2="1" y2="0">
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', marginLeft: '2px' }}>{rating}</span>
    </div>
  );
}

export default function RealtorsPage() {
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState('totalVolume');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch realtors from API
  useEffect(() => {
    fetchRealtors();
  }, []);

  const fetchRealtors = async () => {
    try {
      setLoading(true);
      const response = await api.getAllRealtors();
      if (response.success) {
        setRealtors(response.data || []);
        setStats(response.stats || {});
      } else {
        setError(response.message || 'Failed to fetch realtors');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatus = (realtor: Realtor) => {
    return realtor.isProfileComplete ? 'Active' : 'Pending';
  };

  const getTier = (realtor: Realtor) => {
    return realtor.tier || 'Silver';
  };

  const fmt = (n: number) => {
    if (!n) return '$0';
    return n >= 1000000 ? '$' + (n / 1000000).toFixed(1) + 'M' : '$' + (n / 1000).toFixed(0) + 'K';
  };

  const uniqueAreas = ['All', ...Array.from(new Set(realtors.map(r => r.serviceCity || 'Unknown')))];

  const filtered = realtors
    .filter(r => {
      const q = search.toLowerCase();
      const matchSearch = r.name.toLowerCase().includes(q) || 
        r.email.toLowerCase().includes(q) ||
        (r.agencyName && r.agencyName.toLowerCase().includes(q)) ||
        (r.licenseNumber && r.licenseNumber.toLowerCase().includes(q));
      const matchTier = tierFilter === 'All' || getTier(r) === tierFilter;
      const matchStatus = statusFilter === 'All' || getStatus(r) === statusFilter;
      const matchArea = areaFilter === 'All' || (r.serviceCity && r.serviceCity.includes(areaFilter));
      return matchSearch && matchTier && matchStatus && matchArea;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortBy === 'totalVolume') return ((a.totalVolume || 0) - (b.totalVolume || 0)) * dir;
      if (sortBy === 'totalSales') return ((a.totalSales || 0) - (b.totalSales || 0)) * dir;
      if (sortBy === 'rating') return ((a.rating || 0) - (b.rating || 0)) * dir;
      return 0;
    });

  // Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRealtors = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, tierFilter, statusFilter, areaFilter, sortBy, sortDir]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelected(new Set());
    }
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ opacity: sortBy === col ? 1 : 0.3 }}>
      {sortBy === col && sortDir === 'desc' ? <polyline points="6 9 12 15 18 9" /> : <polyline points="18 15 12 9 6 15" />}
    </svg>
  );

  if (loading) {
    return (
      <div className="page-enter">
        <Header title="Realtors" subtitle="Loading realtors..." />
        <div style={{ padding: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#537D96',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <Header title="Realtors" subtitle={`${realtors.length} registered realtors — ${fmt(stats.totalVolume)} total portfolio value`} />

      <div style={{ padding: '28px' }}>
        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '20px', color: '#ef4444', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Portfolio', value: fmt(stats.totalVolume), color: '#3b7eff', sub: 'Combined volume' },
            { label: 'Total Sales', value: (stats.totalSales || 0).toString(), color: '#00d4aa', sub: 'All time closed' },
            { label: 'Active Realtors', value: (stats.activeCount || 0).toString(), color: '#10b981', sub: `of ${realtors.length} total` },
            { label: 'Platinum Tier', value: (stats.platinumCount || 0).toString(), color: '#a78bfa', sub: 'Top performers' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</p>
              <p className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: s.color, marginBottom: '2px' }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Table Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', flex: '1', minWidth: '180px', maxWidth: '280px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search realtors..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }} />
            </div>

            <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
              {['All', 'Platinum', 'Gold', 'Silver'].map(o => <option key={o} value={o}>{o === 'All' ? 'All Tiers' : o}</option>)}
            </select>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
              {['All', 'Active', 'Inactive', 'Pending'].map(o => <option key={o} value={o}>{o === 'All' ? 'All Status' : o}</option>)}
            </select>

            <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
              {uniqueAreas.map(o => <option key={o} value={o}>{o}</option>)}
            </select>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: '0', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              {(['table', 'grid'] as const).map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  style={{ padding: '8px 12px', background: viewMode === v ? 'var(--accent)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === v ? 'white' : 'var(--text-muted)' }}>
                  {v === 'table' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="9" x2="9" y2="21" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                  )}
                </button>
              ))}
            </div>

            {/* <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Realtor
            </button> */}
          </div>

          {viewMode === 'table' ? (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 16px', width: '40px' }}>
                        <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: 'var(--accent)' }} />
                      </th>
                      {[
                        { label: 'Realtor', col: 'name' },
                        { label: 'Agency / Area', col: null },
                        { label: 'License', col: null },
                        { label: 'Tier', col: null },
                        { label: 'Rating', col: 'rating' },
                        { label: 'Total Sales', col: 'totalSales' },
                        { label: 'Portfolio Value', col: 'totalVolume' },
                        { label: 'Active Listings', col: null },
                        { label: 'Status', col: null },
                        { label: 'Actions', col: null },
                      ].map(h => (
                        <th key={h.label} onClick={h.col ? () => toggleSort(h.col!) : undefined}
                          style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: h.col ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {h.label}
                            {h.col && <SortIcon col={h.col} />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentRealtors.map((r, idx) => (
                      <tr key={r._id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: 'var(--accent)' }} />
                        </td>
                        <td style={{ padding: '14px 16px', minWidth: '220px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                              background: `linear-gradient(135deg, ${avatarColors[idx % avatarColors.length]}, ${avatarColors[(idx + 3) % avatarColors.length]})`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 700, color: 'white',
                            }}>
                              {getInitials(r.name)}
                            </div>
                            <div>
                              <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1px' }}>{r.name}</p>
                              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', minWidth: '180px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>{r.agencyName || 'N/A'}</p>
                          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{r.serviceCity || 'N/A'}, {r.serviceCountry || 'N/A'}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: '5px', border: '1px solid var(--border)' }}>
                            {r.licenseNumber || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: tierConfig[getTier(r)]?.bg, color: tierConfig[getTier(r)]?.color, border: `1px solid ${tierConfig[getTier(r)]?.border}` }}>
                            {getTier(r)}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <StarRating rating={r.rating || 0} />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.totalSales || 0}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="font-display" style={{ fontSize: '14px', fontWeight: 700, color: '#00d4aa' }}>{fmt(r.totalVolume || 0)}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="font-display" style={{ fontSize: '15px', fontWeight: 700 }}>{r.activeListing || 0}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusConfig[getStatus(r)]?.dot }} />
                            <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: statusConfig[getStatus(r)]?.bg, color: statusConfig[getStatus(r)]?.color }}>
                              {getStatus(r)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(59,126,255,0.08)', border: '1px solid rgba(59,126,255,0.15)', cursor: 'pointer', color: '#3b7eff' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            <button style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)', cursor: 'pointer', color: '#00d4aa' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> realtors
                  </p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: 'white', border: '1px solid var(--border)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => goToPage(i + 1)}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', background: currentPage === i + 1 ? 'var(--accent)' : 'white', border: '1px solid var(--border)', color: currentPage === i + 1 ? 'white' : 'var(--text-primary)', fontWeight: currentPage === i + 1 ? 700 : 400 }}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: 'white', border: '1px solid var(--border)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Grid View with Pagination
            <>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {currentRealtors.map((r, idx) => (
                  <div key={r._id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `linear-gradient(135deg, ${avatarColors[idx % avatarColors.length]}, ${avatarColors[(idx + 3) % avatarColors.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white' }}>
                          {getInitials(r.name)}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.serviceCity || 'N/A'}</p>
                        </div>
                      </div>
                      <span style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, background: tierConfig[getTier(r)]?.bg, color: tierConfig[getTier(r)]?.color }}>
                        {getTier(r)}
                      </span>
                    </div>
                    <StarRating rating={r.rating || 0} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                      <div style={{ background: 'var(--bg-card)', borderRadius: '8px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total Sales</p>
                        <p className="font-display" style={{ fontSize: '16px', fontWeight: 700 }}>{r.totalSales || 0}</p>
                      </div>
                      <div style={{ background: 'var(--bg-card)', borderRadius: '8px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Volume</p>
                        <p className="font-display" style={{ fontSize: '16px', fontWeight: 700, color: '#00d4aa' }}>{fmt(r.totalVolume || 0)}</p>
                      </div>
                      <div style={{ background: 'var(--bg-card)', borderRadius: '8px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Active</p>
                        <p className="font-display" style={{ fontSize: '16px', fontWeight: 700 }}>{r.activeListing || 0}</p>
                      </div>
                      <div style={{ background: 'var(--bg-card)', borderRadius: '8px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Status</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusConfig[getStatus(r)]?.dot }} />
                          <span style={{ fontSize: '12px', fontWeight: 500 }}>{getStatus(r)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Footer for Grid View */}
              {totalPages > 1 && (
                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                    style={{ padding: '6px 12px', borderRadius: '6px', background: 'white', border: '1px solid var(--border)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => goToPage(i + 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '6px', background: currentPage === i + 1 ? 'var(--accent)' : 'white', border: '1px solid var(--border)', color: currentPage === i + 1 ? 'white' : 'var(--text-primary)' }}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                    style={{ padding: '6px 12px', borderRadius: '6px', background: 'white', border: '1px solid var(--border)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}