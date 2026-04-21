'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/lib/api';

interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  planName: string;
  createdAt: string;
}

interface SalesStats {
  totalRevenue: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
  topUsers: {
    userId: string;
    name: string;
    email: string;
    totalPaid: number;
  }[];
}

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  completed: { bg: 'rgba(16,185,129,0.08)', color: '#10b981', dot: '#10b981' },
  pending: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', dot: '#f59e0b' },
  failed: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', dot: '#ef4444' },
  refunded: { bg: 'rgba(107,114,128,0.08)', color: '#9ca3af', dot: '#9ca3af' },
};

export default function SalesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
    fetchSalesStats();
  }, [currentPage, filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await api.getPayments(params);
      if (response.success) {
        setPayments(response.data.payments || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.message || 'Failed to fetch payments');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesStats = async () => {
    try {
      const response = await api.getSalesStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching sales stats:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: config.dot }} />
        <span style={{
          padding: '3px 9px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 500,
          background: config.bg,
          color: config.color,
          textTransform: 'capitalize'
        }}>
          {status}
        </span>
      </div>
    );
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Sales" subtitle="Loading sales data..." />
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
    <div>
      <Header title="Sales & Revenue" subtitle="Track your earnings and payment history" />

      <div style={{ padding: '28px' }}>
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

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Revenue', value: stats ? formatCurrency(stats.totalRevenue) : '$0', color: '#3b7eff', icon: '💰' },
            { label: 'Total Payments', value: stats?.totalPayments?.toString() || '0', color: '#10b981', icon: '💳' },
            { label: 'Completed', value: stats?.completedPayments?.toString() || '0', color: '#10b981', icon: '✅' },
            { label: 'Pending', value: stats?.pendingPayments?.toString() || '0', color: '#f59e0b', icon: '⏳' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</p>
                  <p className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</p>
                </div>
                <span style={{ fontSize: '32px' }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Revenue Chart (Simple) */}
        {/* {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Monthly Revenue</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', overflowX: 'auto', paddingBottom: '8px' }}>
              {stats.monthlyRevenue.map((item, idx) => {
                const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1);
                const height = (item.revenue / maxRevenue) * 160;
                return (
                  <div key={idx} style={{ flex: '1', minWidth: '60px', textAlign: 'center' }}>
                    <div style={{ height: `${height}px`, background: '#537D96', borderRadius: '4px', marginBottom: '8px', transition: 'height 0.3s' }} />
                    <p style={{ fontSize: '11px', color: '#64748b' }}>{item.month}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>{formatCurrency(item.revenue)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )} */}

        {/* Top Users Section - COMMENTED OUT */}
        {/* {stats?.topUsers && stats.topUsers.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>User</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Email</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontSize: '12px', color: '#64748b' }}>Total Paid</th>
                   </tr>
                </thead>
                <tbody>
                  {stats.topUsers.map((user, idx) => (
                    <tr key={user.userId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontSize: '13px', fontWeight: 500 }}>{user.name}</td>
                      <td style={{ padding: '10px', fontSize: '12px', color: '#64748b' }}>{user.email}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#10b981' }}>{formatCurrency(user.totalPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}

        {/* Payments Table */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'completed', 'pending', 'failed', 'refunded'].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setFilter(status as any);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: filter === status ? '#537D96' : '#f1f5f9',
                    color: filter === status ? 'white' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Plan</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Transaction ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Date</th>
                 </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div>
                        <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{payment.userId?.name || 'Unknown'}</p>
                        <p style={{ fontSize: '11.5px', color: '#64748b' }}>{payment.userId?.email || 'No email'}</p>
                      </div>
                     </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        {payment.planName || 'Pro Plan'}
                      </span>
                     </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(payment.amount)}</p>
                     </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(payment.status)}
                     </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{payment.transactionId?.slice(0, 12)}...</p>
                     </td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(payment.createdAt)}</p>
                     </td>
                   </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.3 }}>
                        <path d="M3 10h18M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                        <rect x="8" y="14" width="8" height="2" />
                      </svg>
                      <p style={{ fontSize: '14px' }}>No payments found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </p>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    color: '#475569'
                  }}
                >
                  Previous
                </button>
                <span style={{ padding: '6px 12px', fontSize: '13px', color: '#1e293b' }}>{currentPage}</span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    color: '#475569'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}