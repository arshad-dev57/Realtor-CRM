'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
  agencyName?: string;
  licenseNumber?: string;
  preferences?: any;
}

const roles = ['All', 'admin', 'realtor', 'buyer'];
const statuses = ['All', 'Active', 'Inactive', 'Pending'];

const roleColors: Record<string, { bg: string; color: string }> = {
  admin: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  realtor: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  buyer: { bg: 'rgba(59,126,255,0.1)', color: '#3b7eff' },
};

const statusColors: Record<string, { bg: string; color: string; dot: string }> = {
  Active: { bg: 'rgba(16,185,129,0.08)', color: '#10b981', dot: '#10b981' },
  Inactive: { bg: 'rgba(107,114,128,0.08)', color: '#9ca3af', dot: '#9ca3af' },
  Pending: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', dot: '#f59e0b' },
};

const avatarColors = ['#3b7eff', '#00d4aa', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#ec4899'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers();
      if (response.success) {
        setUsers(response.data.all || []);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await api.deleteUser(userId);
      if (response.success) {
        fetchUsers(); // Refresh list
        setSelected(new Set()); // Clear selection
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected user(s)?`)) return;
    
    for (const userId of selected) {
      await api.deleteUser(userId);
    }
    fetchUsers();
    setSelected(new Set());
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatus = (user: User) => {
    return user.isProfileComplete ? 'Active' : 'Pending';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Filter and sort users
  const filteredAndSorted = users
    .filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      const matchStatus = statusFilter === 'All' || getStatus(u) === statusFilter;
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortBy === 'role') return a.role.localeCompare(b.role) * dir;
      if (sortBy === 'date') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() * dir;
      return 0;
    });

  // Pagination logic
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSorted.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, sortBy, sortDir]);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelected(new Set()); // Clear selection on page change
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelected(new Set());
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelected(new Set());
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const toggleAll = () => {
    if (selected.size === currentUsers.length) setSelected(new Set());
    else setSelected(new Set(currentUsers.map(u => u._id)));
  };

  const toggleOne = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const SortIcon = ({ col }: { col: string }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ opacity: sortBy === col ? 1 : 0.3, transition: 'opacity 0.15s' }}>
      {sortBy === col && sortDir === 'desc'
        ? <polyline points="6 9 12 15 18 9" />
        : <polyline points="18 15 12 9 6 15" />}
    </svg>
  );

  if (loading) {
    return (
      <div className="page-enter">
        <Header title="Users" subtitle="Loading users..." />
        <div style={{ padding: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#537D96',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <Header title="Users" subtitle={`${users.length} total users — manage access and permissions`} />

      <div style={{ padding: '28px' }}>
        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#ef4444',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
        )}

        {/* Top stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Users', value: users.length, color: '#3b7eff' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#ef4444' },
            { label: 'Realtors', value: users.filter(u => u.role === 'realtor').length, color: '#f59e0b' },
            { label: 'Buyers', value: users.filter(u => u.role === 'buyer').length, color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{s.label}</p>
                <p className="font-display" style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.color, opacity: 0.8 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', flex: '1', minWidth: '200px', maxWidth: '300px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }} />
            </div>

            {/* Filters */}
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
              {roles.map(o => <option key={o} value={o}>{o === 'All' ? 'All Roles' : o}</option>)}
            </select>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
              {statuses.map(o => <option key={o} value={o}>{o === 'All' ? 'All Status' : o}</option>)}
            </select>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              {selected.size > 0 && (
                <button onClick={deleteSelected} style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Delete {selected.size} selected
                </button>
              )}
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add User
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', width: '40px' }}>
                    <input type="checkbox" checked={selected.size === currentUsers.length && currentUsers.length > 0} onChange={toggleAll}
                      style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                  </th>
                  {[
                    { label: 'User', col: 'name' },
                    { label: 'Role', col: 'role' },
                    { label: 'Contact', col: null },
                    { label: 'Status', col: null },
                    { label: 'Joined', col: 'date' },
                    { label: 'Actions', col: null },
                  ].map(h => (
                    <th key={h.label} onClick={h.col ? () => toggleSort(h.col!) : undefined}
                      style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: h.col ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {h.label}
                        {h.col && <SortIcon col={h.col} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, idx) => {
                  const status = getStatus(user);
                  return (
                    <tr key={user._id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input type="checkbox" checked={selected.has(user._id)} onChange={() => toggleOne(user._id)}
                          style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                            background: `linear-gradient(135deg, ${avatarColors[idx % avatarColors.length]}, ${avatarColors[(idx + 2) % avatarColors.length]})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700, color: 'white',
                          }}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1px' }}>{user.name}</p>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{user.email}</p>
                          </div>
                        </div>
                       </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: roleColors[user.role]?.bg, color: roleColors[user.role]?.color }}>
                          {user.role}
                        </span>
                       </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.phone}</p>
                          {user.agencyName && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.agencyName}</p>}
                        </div>
                       </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColors[status]?.dot, flexShrink: 0 }} />
                          <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: statusColors[status]?.bg, color: statusColors[status]?.color }}>
                            {status}
                          </span>
                        </div>
                       </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(user.createdAt)}</span>
                       </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(59,126,255,0.08)', border: '1px solid rgba(59,126,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3b7eff' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                          <button onClick={() => deleteUser(user._id)} style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                          </button>
                        </div>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {currentUsers.length === 0 && (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.3 }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p style={{ fontSize: '14px' }}>No users found matching your filters</p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{startIndex + 1}</strong> to <strong style={{ color: 'var(--text-primary)' }}>{Math.min(endIndex, totalItems)}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> users
                {selected.size > 0 && <span style={{ color: 'var(--accent)', marginLeft: '8px' }}>· {selected.size} selected</span>}
              </p>
              
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {/* Previous button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: currentPage === 1 ? 'var(--bg-elevated)' : 'white',
                    border: '1px solid var(--border)',
                    color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '12px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? goToPage(page) : null}
                    disabled={page === '...'}
                    style={{
                      minWidth: '32px',
                      height: '32px',
                      padding: '0 8px',
                      borderRadius: '6px',
                      background: currentPage === page ? 'var(--accent)' : 'white',
                      border: '1px solid var(--border)',
                      color: currentPage === page ? 'white' : 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: currentPage === page ? 700 : 400,
                      cursor: page === '...' ? 'default' : 'pointer',
                    }}
                  >
                    {page}
                  </button>
                ))}

                {/* Next button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: currentPage === totalPages ? 'var(--bg-elevated)' : 'white',
                    border: '1px solid var(--border)',
                    color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '12px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Items per page selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    // You can make this dynamic if needed
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'white',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}