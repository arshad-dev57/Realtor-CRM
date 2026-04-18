'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import AddLeadModal from '@/components/AddLeadModal';
import { api } from '@/lib/api';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  propertyType: string;
  budget: string;
  location: string;
  city?: string;
  country?: string;
  address?: string;
  status: string;
  priority: string;
  stage: string;
  score: number;
  assignedTo: { _id: string; name: string; email: string } | null;
  assignedToName: string;
  lastContact: string;
  createdAt: string;
  notes: string;
}

interface Realtor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  agencyName?: string;
}

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  Hot: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', dot: '#ef4444' },
  Warm: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', dot: '#f59e0b' },
  Cold: { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af', dot: '#9ca3af' },
};

const priorityConfig: Record<string, { bg: string; color: string }> = {
  High: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444' },
  Medium: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b' },
  Low: { bg: 'rgba(107,114,128,0.08)', color: '#9ca3af' },
};

const stageConfig: Record<string, { bg: string; color: string; border: string }> = {
  Prospecting: { bg: 'rgba(107,114,128,0.08)', color: '#9ca3af', border: 'rgba(107,114,128,0.2)' },
  Qualified: { bg: 'rgba(59,126,255,0.08)', color: '#3b7eff', border: 'rgba(59,126,255,0.2)' },
  Proposal: { bg: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
  Negotiation: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  'Closed Won': { bg: 'rgba(16,185,129,0.08)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
  'Closed Lost': { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' },
};

const sources = ['All', 'Referral', 'Website', 'Social Media', 'Cold Outreach', 'Events', 'Direct'];
const statuses = ['All', 'Hot', 'Warm', 'Cold'];
const stages = ['All', 'Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const priorities = ['All', 'High', 'Medium', 'Low'];

const pipelineStages = ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#9ca3af';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.3s ease' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color, minWidth: '28px', textAlign: 'right' }}>{score}</span>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [filteredRealtors, setFilteredRealtors] = useState<Realtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedRealtorId, setSelectedRealtorId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [realtorSearch, setRealtorSearch] = useState('');
  
  // Country & City Filters
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Search with button
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  
  const [sortBy, setSortBy] = useState('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    closedWon: 0,
    inNegotiation: 0
  });
  
  const itemsPerPage = 10;

  // Fetch leads when filters change
  useEffect(() => {
    fetchLeads();
  }, [currentPage, sourceFilter, statusFilter, stageFilter, priorityFilter, sortBy, sortDir, searchTerm, selectedCountry, selectedCity]);

  // Fetch realtors
  useEffect(() => {
    fetchRealtors();
    fetchUniqueLocations();
  }, []);

  // Filter realtors based on search
  useEffect(() => {
    if (realtorSearch.trim()) {
      setFilteredRealtors(
        realtors.filter(r => 
          r.name.toLowerCase().includes(realtorSearch.toLowerCase()) ||
          r.email.toLowerCase().includes(realtorSearch.toLowerCase()) ||
          (r.agencyName && r.agencyName.toLowerCase().includes(realtorSearch.toLowerCase()))
        )
      );
    } else {
      setFilteredRealtors(realtors);
    }
  }, [realtorSearch, realtors]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy === 'date' ? 'lastContact' : sortBy,
        sortOrder: sortDir
      };
      
      if (sourceFilter !== 'All') params.source = sourceFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (stageFilter !== 'All') params.stage = stageFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      if (searchTerm) params.search = searchTerm;
      if (selectedCountry) params.country = selectedCountry;
      if (selectedCity) params.city = selectedCity;
      
      const response = await api.getAllLeads(params);
      
      if (response.success) {
        setLeads(response.data.leads || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
        setStats(response.data.stats || {
          total: 0,
          hot: 0,
          warm: 0,
          closedWon: 0,
          inNegotiation: 0
        });
      } else {
        setError(response.message || 'Failed to fetch leads');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtors = async () => {
    try {
      const response = await api.getAllRealtors();
      if (response.success) {
        setRealtors(response.data || []);
        setFilteredRealtors(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching realtors:', err);
    }
  };
const fetchUniqueLocations = async () => {
  try {
    const response = await api.getAllLeads({ limit: 1000 });
    if (response.success) {
      const allLeads = response.data.leads || [];
      
      // Get unique countries
      const countrySet = new Set<string>();
      allLeads.forEach((lead: Lead) => {
        if (lead.country) countrySet.add(lead.country);
      });
      setCountries(Array.from(countrySet));
      
      // Get unique cities
      const citySet = new Set<string>();
      allLeads.forEach((lead: Lead) => {
        if (lead.city) citySet.add(lead.city);
      });
      setCities(Array.from(citySet));
    }
  } catch (err) {
    console.error('Error fetching locations:', err);
  }
};  const handleAssignLead = async () => {
    if (!selectedLead || !selectedRealtorId) return;
    
    setAssigning(true);
    try {
      const response = await api.assignLead(selectedLead._id, selectedRealtorId);
      if (response.success) {
        await fetchLeads();
        setShowAssignModal(false);
        setSelectedLead(null);
        setSelectedRealtorId('');
        setRealtorSearch('');
      } else {
        setError(response.message || 'Failed to assign lead');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setAssigning(false);
    }
  };

  const openAssignModal = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedRealtorId('');
    setRealtorSearch('');
    setShowAssignModal(true);
  };

  const openDetailsModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ col }: { col: string }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: sortBy === col ? 1 : 0.3 }}>
      {sortBy === col && sortDir === 'desc' ? <polyline points="6 9 12 15 18 9" /> : <polyline points="18 15 12 9 6 15" />}
    </svg>
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <div>
        <Header title="Leads" subtitle="Loading leads..." />
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
      <Header title="Leads" subtitle={`${stats.total} total leads — ${stats.hot} hot, ${stats.warm} warm in pipeline`} />

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Total Leads</p>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#3b7eff' }}>{stats.total}</p>
            </div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Hot Leads</p>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>{stats.hot}</p>
            </div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>☀️</span>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Warm Leads</p>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>{stats.warm}</p>
            </div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Closed Won</p>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{stats.closedWon}</p>
            </div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🤝</span>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>In Negotiation</p>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#8b5cf6' }}>{stats.inNegotiation}</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search with Button */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', minWidth: '250px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input 
                  value={searchInput} 
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by name, email, phone, location..."
                  style={{ background: 'none', border: 'none', outline: 'none', color: '#1e293b', fontSize: '13px', width: '100%' }} 
                />
              </div>
              <button
                onClick={handleSearch}
                style={{
                  padding: '8px 16px',
                  background: '#537D96',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Search
              </button>
            </div>

            {/* Country Filter */}
            <select 
              value={selectedCountry} 
              onChange={e => {
                setSelectedCountry(e.target.value);
                setSelectedCity('');
                setCurrentPage(1);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', color: '#475569', fontSize: '13px', cursor: 'pointer', minWidth: '120px' }}
            >
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* City Filter */}
            <select 
              value={selectedCity} 
              onChange={e => {
                setSelectedCity(e.target.value);
                setCurrentPage(1);
              }}
              disabled={!selectedCountry}
              style={{ background: selectedCountry ? '#f8fafc' : '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', color: '#475569', fontSize: '13px', cursor: selectedCountry ? 'pointer' : 'not-allowed', minWidth: '120px' }}
            >
              <option value="">All Cities</option>
              {cities.filter(c => !selectedCountry || true).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Source Filter */}
            <select 
              value={sourceFilter} 
              onChange={e => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
            >
              {sources.map(o => <option key={o} value={o}>{o === 'All' ? 'All Sources' : o}</option>)}
            </select>

            {/* Status Filter */}
            <select 
              value={statusFilter} 
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
            >
              {statuses.map(o => <option key={o} value={o}>{o === 'All' ? 'All Statuses' : o}</option>)}
            </select>

            {/* Stage Filter */}
            <select 
              value={stageFilter} 
              onChange={e => {
                setStageFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
            >
              {stages.map(o => <option key={o} value={o}>{o === 'All' ? 'All Stages' : o}</option>)}
            </select>

            {/* Priority Filter */}
            <select 
              value={priorityFilter} 
              onChange={e => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
            >
              {priorities.map(o => <option key={o} value={o}>{o === 'All' ? 'All Priorities' : o}</option>)}
            </select>

            {/* View Toggle */}
            <div style={{ display: 'flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <button 
                onClick={() => setViewMode('table')}
                style={{ 
                  padding: '8px 14px', 
                  background: viewMode === 'table' ? '#537D96' : 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: viewMode === 'table' ? 'white' : '#64748b', 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  transition: 'all 0.15s' 
                }}
              >
                Table
              </button>
              <button 
                onClick={() => setViewMode('pipeline')}
                style={{ 
                  padding: '8px 14px', 
                  background: viewMode === 'pipeline' ? '#537D96' : 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: viewMode === 'pipeline' ? 'white' : '#64748b', 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  transition: 'all 0.15s' 
                }}
              >
                Pipeline
              </button>
            </div>

            {/* New Lead Button */}
            <button 
              onClick={() => setShowAddModal(true)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 16px', 
                background: '#537D96', 
                border: 'none', 
                borderRadius: '8px', 
                color: 'white', 
                fontSize: '13px', 
                fontWeight: 600, 
                cursor: 'pointer', 
                marginLeft: 'auto' 
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Lead
            </button>
          </div>

          {/* Table View */}
          {viewMode === 'table' && (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      <th style={{ padding: '12px 16px', width: '40px' }}>
                        <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: '#537D96' }} />
                      </th>
                      <th onClick={() => toggleSort('name')} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Lead <SortIcon col="name" /></div>
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Source</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Property / Budget</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Priority</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Stage</th>
                      <th onClick={() => toggleSort('score')} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Score <SortIcon col="score" /></div>
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Assigned To</th>
                      <th onClick={() => toggleSort('date')} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Last Contact <SortIcon col="date" /></div>
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s', cursor: 'pointer' }} 
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} 
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        onClick={() => openDetailsModal(lead)}>
                        <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: '#537D96' }} />
                        </td>
                        <td style={{ padding: '14px 16px', minWidth: '200px' }}>
                          <div>
                            <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginBottom: '1px' }}>{lead.name}</p>
                            <p style={{ fontSize: '11.5px', color: '#64748b' }}>{lead.email}</p>
                            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{lead.phone}</p>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                            {lead.source}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', minWidth: '160px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b', marginBottom: '2px' }}>{lead.propertyType}</p>
                          <p style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 600 }}>{lead.budget}</p>
                          <p style={{ fontSize: '11px', color: '#64748b' }}>{lead.location}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusConfig[lead.status]?.dot }} />
                            <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: statusConfig[lead.status]?.bg, color: statusConfig[lead.status]?.color }}>
                              {lead.status}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: priorityConfig[lead.priority]?.bg, color: priorityConfig[lead.priority]?.color }}>
                            {lead.priority}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: stageConfig[lead.stage]?.bg, color: stageConfig[lead.stage]?.color, border: `1px solid ${stageConfig[lead.stage]?.border}` }}>
                            {lead.stage}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', minWidth: '120px' }}>
                          <ScoreBar score={lead.score} />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>
                            {lead.assignedTo?.name || lead.assignedToName || 'Unassigned'}
                          </p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(lead.lastContact)}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
  onClick={() => openAssignModal(lead)}
  style={{ 
    width: '28px', 
    height: '28px', 
    borderRadius: '6px', 
    background: 'rgba(59,126,255,0.08)', 
    border: '1px solid rgba(59,126,255,0.15)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer', 
    color: '#3b7eff'
  }}
  title="Assign to Realtor"
>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
                            </button>
                            <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#00d4aa' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f59e0b' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan={11} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.3 }}>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <p style={{ fontSize: '14px' }}>No leads found</p>
                          <button 
                            onClick={() => setShowAddModal(true)}
                            style={{ marginTop: '12px', padding: '8px 16px', background: '#537D96', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            Add Your First Lead
                          </button>
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
                    Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> leads
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
                    
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? goToPage(page) : null}
                        disabled={page === '...'}
                        style={{
                          width: page === '...' ? '40px' : '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: currentPage === page ? '#537D96' : 'white',
                          border: '1px solid #e2e8f0',
                          color: currentPage === page ? 'white' : '#475569',
                          fontWeight: currentPage === page ? 700 : 400,
                          cursor: page === '...' ? 'default' : 'pointer'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                    
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
            </>
          )}

          {/* Pipeline View */}
          {viewMode === 'pipeline' && (
            <div style={{ padding: '20px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: '14px', minWidth: `${pipelineStages.length * 260}px` }}>
                {pipelineStages.map(stage => {
                  const stageLeads = leads.filter(l => l.stage === stage);
                  const cfg = stageConfig[stage];
                  return (
                    <div key={stage} style={{ flex: '1', minWidth: '240px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        marginBottom: '12px', 
                        padding: '10px 12px', 
                        background: cfg.bg, 
                        borderRadius: '10px', 
                        border: `1px solid ${cfg.border}` 
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage}</span>
                        <span style={{ 
                          width: '22px', 
                          height: '22px', 
                          borderRadius: '50%', 
                          background: cfg.color + '20', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          color: cfg.color 
                        }}>
                          {stageLeads.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stageLeads.map(lead => (
                          <div 
                            key={lead._id} 
                            style={{ 
                              background: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '10px', 
                              padding: '14px', 
                              cursor: 'pointer', 
                              transition: 'border-color 0.15s, transform 0.15s' 
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = cfg.color + '44';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            onClick={() => openDetailsModal(lead)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{lead.name}</p>
                              <span style={{ 
                                padding: '2px 7px', 
                                borderRadius: '4px', 
                                fontSize: '10px', 
                                fontWeight: 700, 
                                background: statusConfig[lead.status]?.bg, 
                                color: statusConfig[lead.status]?.color 
                              }}>
                                {lead.status}
                              </span>
                            </div>
                            <p style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 600, marginBottom: '6px' }}>{lead.budget}</p>
                            <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>{lead.propertyType} · {lead.location?.split(',')[0]}</p>
                            <ScoreBar score={lead.score} />
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '10.5px', color: '#64748b' }}>{lead.assignedTo?.name?.split(' ')[0] || lead.assignedToName?.split(' ')[0] || 'Unassigned'}</span>
                              <span style={{ fontSize: '10.5px', color: '#64748b' }}>{formatDate(lead.lastContact)}</span>
                            </div>
                          </div>
                        ))}
                        {stageLeads.length === 0 && (
                          <div style={{ 
                            padding: '24px', 
                            textAlign: 'center', 
                            color: '#64748b', 
                            fontSize: '12px', 
                            border: '2px dashed #e2e8f0', 
                            borderRadius: '10px' 
                          }}>
                            No leads
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination for Pipeline View */}
              {totalPages > 1 && (
                <div style={{ padding: '14px 20px', marginTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '6px' }}>
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
                  
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? goToPage(page) : null}
                      disabled={page === '...'}
                      style={{
                        width: page === '...' ? '40px' : '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: currentPage === page ? '#537D96' : 'white',
                        border: '1px solid #e2e8f0',
                        color: currentPage === page ? 'white' : '#475569',
                        fontWeight: currentPage === page ? 700 : 400,
                        cursor: page === '...' ? 'default' : 'pointer'
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Lead Modal with Search */}
      {showAssignModal && selectedLead && (
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
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Assign Lead to Realtor</h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedLead(null);
                  setRealtorSearch('');
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

            <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Lead Details</p>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{selectedLead.name}</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{selectedLead.propertyType} • {selectedLead.budget} • {selectedLead.location}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#1e293b' }}>Search Realtor</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', marginBottom: '16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={realtorSearch}
                  onChange={(e) => setRealtorSearch(e.target.value)}
                  placeholder="Search by name, email, or agency..."
                  style={{ background: 'none', border: 'none', outline: 'none', color: '#1e293b', fontSize: '13px', width: '100%' }}
                />
              </div>

              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                {filteredRealtors.length} realtors found
              </p>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                {filteredRealtors.map(realtor => (
                  <label
                    key={realtor._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: selectedRealtorId === realtor._id ? '#e8f0f5' : 'white',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRealtorId !== realtor._id) {
                        e.currentTarget.style.background = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRealtorId !== realtor._id) {
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="realtor"
                      value={realtor._id}
                      checked={selectedRealtorId === realtor._id}
                      onChange={() => setSelectedRealtorId(realtor._id)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: '#1e293b' }}>{realtor.name}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{realtor.email}</p>
                      {realtor.agencyName && (
                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>{realtor.agencyName}</p>
                      )}
                    </div>
                    {selectedRealtorId === realtor._id && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </label>
                ))}
                {filteredRealtors.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <p>No realtors found</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedLead(null);
                  setRealtorSearch('');
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
                onClick={handleAssignLead}
                disabled={!selectedRealtorId || assigning}
                style={{
                  padding: '10px 24px',
                  background: !selectedRealtorId || assigning ? '#94a3b8' : '#537D96',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !selectedRealtorId || assigning ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {assigning ? 'Assigning...' : 'Assign Lead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showDetailsModal && selectedLead && (
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
          zIndex: 1000,
          overflow: 'auto'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>Lead Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLead(null);
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

            {/* Lead Basic Info */}
            <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Lead Name</p>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{selectedLead.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: statusConfig[selectedLead.status]?.bg,
                    color: statusConfig[selectedLead.status]?.color
                  }}>
                    {selectedLead.status}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: priorityConfig[selectedLead.priority]?.bg,
                    color: priorityConfig[selectedLead.priority]?.color
                  }}>
                    {selectedLead.priority} Priority
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Email</p>
                  <p style={{ fontSize: '13px', color: '#1e293b' }}>{selectedLead.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Phone</p>
                  <p style={{ fontSize: '13px', color: '#1e293b' }}>{selectedLead.phone}</p>
                </div>
              </div>
            </div>

            {/* Property Requirements */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#1e293b' }}>🏠 Property Requirements</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Property Type</p>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{selectedLead.propertyType}</p>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Budget</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>{selectedLead.budget}</p>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Location</p>
                  <p style={{ fontSize: '13px', color: '#1e293b' }}>{selectedLead.location}</p>
                </div>
              </div>
              {selectedLead.address && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Address</p>
                  <p style={{ fontSize: '13px', color: '#1e293b' }}>{selectedLead.address}</p>
                </div>
              )}
            </div>

            {/* Lead Stage & Score */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#1e293b' }}>📊 Lead Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Stage</p>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: stageConfig[selectedLead.stage]?.bg,
                    color: stageConfig[selectedLead.stage]?.color,
                    border: `1px solid ${stageConfig[selectedLead.stage]?.border}`,
                    display: 'inline-block'
                  }}>
                    {selectedLead.stage}
                  </span>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Lead Score</p>
                  <ScoreBar score={selectedLead.score} />
                </div>
              </div>
            </div>

            {/* Assignment Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#1e293b' }}>👤 Assignment Info</h3>
              <div style={{ padding: '16px', background: selectedLead.assignedTo ? '#e8f0f5' : '#f8fafc', borderRadius: '12px' }}>
                {selectedLead.assignedTo || selectedLead.assignedToName ? (
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Assigned To</p>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#537D96' }}>
                      {selectedLead.assignedTo?.name || selectedLead.assignedToName}
                    </p>
                    {selectedLead.assignedTo?.email && (
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{selectedLead.assignedTo.email}</p>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Not assigned yet</p>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        openAssignModal(selectedLead);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#537D96',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      Assign to Realtor
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedLead.notes && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#1e293b' }}>📝 Notes</h3>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{selectedLead.notes}</p>
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#64748b' }}>Created At</p>
                <p style={{ fontSize: '12px', color: '#1e293b' }}>{formatDate(selectedLead.createdAt)}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#64748b' }}>Last Contact</p>
                <p style={{ fontSize: '12px', color: '#1e293b' }}>{formatDate(selectedLead.lastContact)}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#64748b' }}>Source</p>
                <p style={{ fontSize: '12px', color: '#1e293b' }}>{selectedLead.source}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  openAssignModal(selectedLead);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#537D96',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {selectedLead.assignedTo ? 'Reassign Lead' : 'Assign Lead'}
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#e2e8f0',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Edit Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      <AddLeadModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={fetchLeads}
      />
    </div>
  );
}