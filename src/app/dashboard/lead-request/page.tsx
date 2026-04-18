'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/lib/api';

// Types for lead requests
interface LeadRequest {
  _id: string;
  realtorId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    agencyName?: string;
  };
  realtorName: string;
  realtorEmail: string;
  realtorPhone: string;
  country: string;
  city: string;
  location: string;
  area: string;
  propertyType: 'sale' | 'rent';
  propertyCategory: 'house' | 'apartment' | 'villa' | 'plot' | 'commercial';
  priceRange: string | null;
  additionalNote: string | null;
  status: 'pending' | 'approved' | 'rejected';
  adminRejectionReason: string | null;
  assignedLeads: string[];
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Pending' },
  approved: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Approved' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Rejected' },
};

const priorityColors = {
  high: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'High' },
  medium: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Medium' },
  low: { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af', label: 'Low' },
};

const propertyCategoryLabels: Record<string, string> = {
  house: 'House',
  apartment: 'Apartment',
  villa: 'Villa',
  plot: 'Plot',
  commercial: 'Commercial',
};

export default function LeadRequestsPage() {
  const [requests, setRequests] = useState<LeadRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeadRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchLeadRequests();
  }, [filter]);

  const fetchLeadRequests = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? undefined : filter;
      const response = await api.getAllLeadRequests(statusParam);
      
      if (response.success) {
        setRequests(response.data.requests || []);
      } else {
        setError(response.message || 'Failed to fetch lead requests');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await api.approveLeadRequest(id);
      if (response.success) {
        await fetchLeadRequests();
        setShowModal(false);
        setSelectedRequest(null);
      } else {
        setError(response.message || 'Failed to approve request');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    
    try {
      const response = await api.rejectLeadRequest(id, rejectionReason);
      if (response.success) {
        await fetchLeadRequests();
        setShowRejectModal(false);
        setShowModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
      } else {
        setError(response.message || 'Failed to reject request');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  const formatBudget = (priceRange: string | null) => {
    if (!priceRange) return 'Not specified';
    return priceRange;
  };

  const getPropertyTypeLabel = (type: string) => {
    return type === 'sale' ? 'For Sale' : 'For Rent';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRandomPriority = () => {
    const priorities = ['high', 'medium', 'low'];
    return priorities[Math.floor(Math.random() * priorities.length)] as 'high' | 'medium' | 'low';
  };

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalLeadsToAssign = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="page-enter">
        <Header title="Lead Requests" subtitle="Loading requests..." />
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
      <Header 
        title="Lead Requests" 
        subtitle={`${pendingCount} pending requests from realtors`} 
      />

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

        {/* Stats Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Requests', value: requests.length.toString(), color: '#537D96', icon: '📋' },
            { label: 'Pending', value: pendingCount.toString(), color: '#f59e0b', icon: '⏳' },
            { label: 'Approved', value: approvedCount.toString(), color: '#10b981', icon: '✓' },
            { label: 'Rejected', value: rejectedCount.toString(), color: '#ef4444', icon: '✗' },
          ].map(s => (
            <div key={s.label} style={{ 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>{s.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</p>
                </div>
                <span style={{ fontSize: '32px' }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All Requests' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              style={{
                padding: '10px 20px',
                background: filter === tab.value ? '#537D96' : 'transparent',
                color: filter === tab.value ? 'white' : '#537D96',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
              {tab.value === 'pending' && pendingCount > 0 && (
                <span style={{ 
                  marginLeft: '8px', 
                  background: filter === tab.value ? 'rgba(255,255,255,0.2)' : '#537D96',
                  color: filter === tab.value ? 'white' : 'white',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontSize: '11px'
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredRequests.map((request) => {
            const priority = getRandomPriority();
            return (
              <div
                key={request._id}
                style={{
                  background: 'white',
                  border: `1px solid ${request.status === 'pending' ? '#f59e0b' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s',
                  boxShadow: request.status === 'pending' ? '0 4px 12px rgba(245,158,11,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #537D96, #6B9AB3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '16px'
                    }}>
                      {getInitials(request.realtorName)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                        {request.realtorName}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>{request.realtorId?.agencyName || 'Independent Realtor'}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Requested: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: priorityColors[priority].bg,
                      color: priorityColors[priority].color,
                    }}>
                      {priorityColors[priority].label} Priority
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: statusColors[request.status].bg,
                      color: statusColors[request.status].color,
                    }}>
                      {statusColors[request.status].label}
                    </span>
                  </div>
                </div>

                {/* Location & Area */}
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    📍 {request.area}, {request.city}, {request.country}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Location: {request.location}
                  </p>
                </div>

                {/* Requirements */}
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px', 
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Property Type</p>
                      <p style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
                        {getPropertyTypeLabel(request.propertyType)} • {propertyCategoryLabels[request.propertyCategory]}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Budget Range</p>
                      <p style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                        {formatBudget(request.priceRange)}
                      </p>
                    </div>
                  </div>
                  {request.additionalNote && (
                    <div>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Additional Notes</p>
                      <p style={{ fontSize: '12px', color: '#475569' }}>{request.additionalNote}</p>
                    </div>
                  )}
                </div>

                {/* Rejection Reason (if rejected) */}
                {request.status === 'rejected' && request.adminRejectionReason && (
                  <div style={{
                    background: '#fef2f2',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #fecaca'
                  }}>
                    <p style={{ fontSize: '11px', color: '#ef4444', marginBottom: '4px', fontWeight: 600 }}>Rejection Reason</p>
                    <p style={{ fontSize: '12px', color: '#dc2626' }}>{request.adminRejectionReason}</p>
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#537D96' }}>1</span>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '5px' }}>Lead Requested</span>
                    </div>
                    {request.assignedLeads && request.assignedLeads.length > 0 && (
                      <div>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{request.assignedLeads.length}</span>
                        <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '5px' }}>Leads Assigned</span>
                      </div>
                    )}
                  </div>
                  
                  {request.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        style={{
                          padding: '8px 20px',
                          background: '#537D96',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '13px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#426a80')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#537D96')}
                      >
                        Review Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && !loading && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.3 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p style={{ fontSize: '14px' }}>No {filter !== 'all' ? filter : ''} requests found</p>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showModal && selectedRequest && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '85vh',
              overflow: 'auto',
              padding: '28px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Review Lead Request</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Realtor</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{selectedRequest.realtorName}</p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{selectedRequest.realtorId?.agencyName || 'Independent Realtor'}</p>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{selectedRequest.realtorEmail} | {selectedRequest.realtorPhone}</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Location</p>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <p><strong>Country:</strong> {selectedRequest.country}</p>
                  <p><strong>City:</strong> {selectedRequest.city}</p>
                  <p><strong>Location:</strong> {selectedRequest.location}</p>
                  <p><strong>Area:</strong> {selectedRequest.area}</p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Requirements</p>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <p><strong>Property Type:</strong> {getPropertyTypeLabel(selectedRequest.propertyType)}</p>
                  <p><strong>Category:</strong> {propertyCategoryLabels[selectedRequest.propertyCategory]}</p>
                  <p><strong>Budget:</strong> {formatBudget(selectedRequest.priceRange)}</p>
                  {selectedRequest.additionalNote && (
                    <p><strong>Notes:</strong> {selectedRequest.additionalNote}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowRejectModal(true);
                  }}
                  style={{
                    padding: '10px 24px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest._id)}
                  style={{
                    padding: '10px 24px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Approve Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal with Reason */}
        {showRejectModal && selectedRequest && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              padding: '28px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Reject Request</h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#1e293b' }}>
                  Reason for rejection <span style={{ color: '#ef4444' }}>*</span>
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this request..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  style={{
                    padding: '10px 24px',
                    background: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest._id)}
                  style={{
                    padding: '10px 24px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}