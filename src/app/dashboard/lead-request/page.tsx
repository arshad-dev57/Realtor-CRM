'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';

// Types for lead requests
interface LeadRequest {
  id: string;
  realtorName: string;
  realtorId: string;
  realtorAvatar: string;
  realtorAgency: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  requirements: {
    propertyType: string[];
    minBudget: number;
    maxBudget: number;
    locations: string[];
    preferredAreas: string[];
    clientType: 'buyer' | 'renter' | 'investor';
    urgency: 'immediate' | 'within_month' | 'within_quarter';
    additionalNotes: string;
  };
  leadCount: number;
  assignedLeads?: number;
}

// Mock data for lead requests
const mockRequests: LeadRequest[] = [
  {
    id: 'REQ001',
    realtorName: 'Jonathan Sterling',
    realtorId: 'REA001',
    realtorAvatar: 'JS',
    realtorAgency: 'Sterling Realty Group',
    requestDate: '2024-01-15',
    status: 'pending',
    priority: 'high',
    requirements: {
      propertyType: ['Luxury Condo', 'Penthouse'],
      minBudget: 2000000,
      maxBudget: 5000000,
      locations: ['Manhattan', 'Brooklyn'],
      preferredAreas: ['Downtown', 'SoHo', 'Tribeca'],
      clientType: 'buyer',
      urgency: 'immediate',
      additionalNotes: 'Client is pre-approved for financing up to $5M. Looking for 3+ bedrooms with city views.'
    },
    leadCount: 3,
  },
  {
    id: 'REQ002',
    realtorName: 'Diana Westbrook',
    realtorId: 'REA002',
    realtorAvatar: 'DW',
    realtorAgency: 'Westbrook Properties',
    requestDate: '2024-01-14',
    status: 'pending',
    priority: 'high',
    requirements: {
      propertyType: ['Single Family Home', 'Villa'],
      minBudget: 3000000,
      maxBudget: 8000000,
      locations: ['Beverly Hills', 'Bel Air', 'Hollywood Hills'],
      preferredAreas: ['Beverly Hills Post Office', 'The Flats'],
      clientType: 'buyer',
      urgency: 'immediate',
      additionalNotes: 'VIP client, wants ocean views and privacy. Ready to close within 30 days.'
    },
    leadCount: 2,
  },
  {
    id: 'REQ003',
    realtorName: 'Carlos Mendez',
    realtorId: 'REA003',
    realtorAvatar: 'CM',
    realtorAgency: 'Mendez & Associates',
    requestDate: '2024-01-13',
    status: 'pending',
    priority: 'medium',
    requirements: {
      propertyType: ['Waterfront', 'Condo'],
      minBudget: 500000,
      maxBudget: 1200000,
      locations: ['Miami', 'Fort Lauderdale'],
      preferredAreas: ['South Beach', 'Brickell', 'Coconut Grove'],
      clientType: 'buyer',
      urgency: 'within_month',
      additionalNotes: 'First-time home buyer, needs guidance. Prefers new construction.'
    },
    leadCount: 5,
  },
  {
    id: 'REQ004',
    realtorName: 'Richard Fontaine',
    realtorId: 'REA007',
    realtorAvatar: 'RF',
    realtorAgency: 'Fontaine International',
    requestDate: '2024-01-12',
    status: 'approved',
    priority: 'high',
    requirements: {
      propertyType: ['Commercial Space', 'Office'],
      minBudget: 10000000,
      maxBudget: 20000000,
      locations: ['Manhattan', 'Midtown'],
      preferredAreas: ['Times Square', 'Fifth Avenue'],
      clientType: 'investor',
      urgency: 'immediate',
      additionalNotes: 'Corporate client looking for prime retail space. Long-term lease or purchase.'
    },
    leadCount: 1,
    assignedLeads: 1,
  },
  {
    id: 'REQ005',
    realtorName: 'Yuki Tanaka',
    realtorId: 'REA006',
    realtorAvatar: 'YT',
    realtorAgency: 'Pacific Coast Realty',
    requestDate: '2024-01-11',
    status: 'rejected',
    priority: 'low',
    requirements: {
      propertyType: ['Studio', '1 Bedroom'],
      minBudget: 300000,
      maxBudget: 500000,
      locations: ['San Francisco'],
      preferredAreas: ['Mission District', 'Hayes Valley'],
      clientType: 'renter',
      urgency: 'within_quarter',
      additionalNotes: 'Budget too low for current market conditions.'
    },
    leadCount: 8,
  },
];

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

export default function LeadRequestsPage() {
  const [requests, setRequests] = useState<LeadRequest[]>(mockRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeadRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'approved', assignedLeads: req.leadCount } : req
    ));
    setShowModal(false);
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'rejected' } : req
    ));
    setShowModal(false);
  };

  const formatBudget = (min: number, max: number) => {
    return `$${(min / 1000000).toFixed(1)}M - $${(max / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="page-enter">
      <Header 
        title="Lead Requests" 
        subtitle={`${pendingCount} pending requests from realtors`} 
      />

      <div style={{ padding: '28px' }}>
        {/* Stats Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Requests', value: requests.length.toString(), color: '#537D96', icon: '📋' },
            { label: 'Pending', value: pendingCount.toString(), color: '#f59e0b', icon: '⏳' },
            { label: 'Approved', value: requests.filter(r => r.status === 'approved').length.toString(), color: '#10b981', icon: '✓' },
            { label: 'Leads to Assign', value: requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.leadCount, 0).toString(), color: '#3b82f6', icon: '👥' },
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
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
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
          {filteredRequests.map((request) => (
            <div
              key={request.id}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
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
                    {request.realtorAvatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                      {request.realtorName}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>{request.realtorAgency}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      Requested: {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: priorityColors[request.priority].bg,
                    color: priorityColors[request.priority].color,
                  }}>
                    {priorityColors[request.priority].label} Priority
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

              {/* Requirements */}
              <div style={{ 
                background: '#f8fafc', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Property Type</p>
                    <p style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
                      {request.requirements.propertyType.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Budget Range</p>
                    <p style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                      {formatBudget(request.requirements.minBudget, request.requirements.maxBudget)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Client Type</p>
                    <p style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500, textTransform: 'capitalize' }}>
                      {request.requirements.clientType}
                    </p>
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Preferred Locations</p>
                  <p style={{ fontSize: '13px', color: '#1e293b' }}>
                    {request.requirements.locations.join(' • ')}
                  </p>
                </div>
                {request.requirements.additionalNotes && (
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Additional Notes</p>
                    <p style={{ fontSize: '12px', color: '#475569' }}>{request.requirements.additionalNotes}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#537D96' }}>{request.leadCount}</span>
                    <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '5px' }}>Leads Requested</span>
                  </div>
                  {request.assignedLeads && (
                    <div>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{request.assignedLeads}</span>
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
          ))}
        </div>

        {/* Modal for Reviewing Request */}
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
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '28px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Review Lead Request</h2>
                <button
                  onClick={() => setShowModal(false)}
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
                <p style={{ fontSize: '13px', color: '#64748b' }}>{selectedRequest.realtorAgency}</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Requirements</p>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <p><strong>Property Type:</strong> {selectedRequest.requirements.propertyType.join(', ')}</p>
                  <p><strong>Budget:</strong> {formatBudget(selectedRequest.requirements.minBudget, selectedRequest.requirements.maxBudget)}</p>
                  <p><strong>Locations:</strong> {selectedRequest.requirements.locations.join(', ')}</p>
                  <p><strong>Urgency:</strong> {selectedRequest.requirements.urgency.replace('_', ' ')}</p>
                  <p><strong>Notes:</strong> {selectedRequest.requirements.additionalNotes}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
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
                  onClick={() => handleApprove(selectedRequest.id)}
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
                  Approve & Assign {selectedRequest.leadCount} Lead{selectedRequest.leadCount > 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}