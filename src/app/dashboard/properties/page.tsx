'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/lib/api';
import AddPropertyModal from '@/components/AddPropertyModal';

interface Property {
  _id: string;
  title: string;
  propertyTitle: string;
  description?: string;
  type: string;
  listingType: string;
  priceDisplay: string;
  price: number;
  location: string;
  city: string;
  state: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  area: string;
  parking: number;
  garageSpaces: number;
  imageUrl: string;
  mainImage: string;
  images: string[];
  status: string;
  isNew: boolean;
  createdAt: string;
  views: number;
  inquiries: number;
  features: string[];
  amenities: any;
  realtorName?: string;
  realtorEmail?: string;
  yearBuilt?: number;
  lotSize?: number;
}

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  available: { bg: 'rgba(16,185,129,0.08)', color: '#10b981', dot: '#10b981' },
  sold: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', dot: '#ef4444' },
  pending: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', dot: '#f59e0b' },
};

const typeConfig: Record<string, { bg: string; color: string }> = {
  'For Sale': { bg: 'rgba(59,126,255,0.08)', color: '#3b7eff' },
  'For Rent': { bg: 'rgba(16,185,129,0.08)', color: '#10b981' },
  'Commercial': { bg: 'rgba(139,92,246,0.08)', color: '#8b5cf6' },
};

const propertyTypeOptions = ['All', 'House', 'Condo', 'Townhome', 'Multi Family', 'Land'];
const listingTypeOptions = ['All', 'For Sale', 'For Rent', 'Commercial'];
const statusOptions = ['All', 'available', 'sold', 'pending'];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState('All');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);  // ✅ Add Modal State
  const itemsPerPage = 12;

  useEffect(() => {
    fetchProperties();
  }, [currentPage, listingTypeFilter, propertyTypeFilter, statusFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (listingTypeFilter !== 'All') params.listingType = listingTypeFilter;
      if (propertyTypeFilter !== 'All') params.propertyType = propertyTypeFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      
      const queryString = new URLSearchParams(params).toString();
      const response = await api.getAllProperties(queryString);
      
      if (response.success) {
        setProperties(response.data.properties || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      } else {
        setError(response.message || 'Failed to fetch properties');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setShowDetailsModal(true);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.available;
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
      <div className="page-enter">
        <Header title="Properties" subtitle="Loading properties..." />
        <div style={{ padding: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#537D96', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <Header title="Properties" subtitle={`${totalItems} total properties — manage all real estate listings`} />

      <div style={{ padding: '28px' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Properties', value: totalItems, color: '#3b7eff', icon: '🏠' },
            { label: 'For Sale', value: properties.filter(p => p.type === 'For Sale').length, color: '#3b7eff', icon: '💰' },
            { label: 'For Rent', value: properties.filter(p => p.type === 'For Rent').length, color: '#10b981', icon: '🔑' },
            { label: 'Commercial', value: properties.filter(p => p.type === 'Commercial').length, color: '#8b5cf6', icon: '🏢' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</p>
                  <p className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</p>
                </div>
                <span style={{ fontSize: '32px' }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', flex: '1', minWidth: '200px', maxWidth: '300px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search properties..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }} />
            </div>

            <select value={listingTypeFilter} onChange={(e) => { setListingTypeFilter(e.target.value); setCurrentPage(1); }} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
              {listingTypeOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'All Types' : o}</option>)}
            </select>

            <select value={propertyTypeFilter} onChange={(e) => { setPropertyTypeFilter(e.target.value); setCurrentPage(1); }} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
              {propertyTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>

            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
              {statusOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'All Status' : o}</option>)}
            </select>

            <div style={{ display: 'flex', gap: '0', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginLeft: 'auto' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '8px 12px', background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button onClick={() => setViewMode('list')} style={{ padding: '8px 12px', background: viewMode === 'list' ? 'var(--accent)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? 'white' : 'var(--text-muted)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>

            {/* ✅ ADD PROPERTY BUTTON - YAHAN ADD KARO */}
            <button 
              onClick={() => setShowAddModal(true)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 16px', 
                background: 'var(--accent)', 
                border: 'none', 
                borderRadius: '8px', 
                color: 'white', 
                fontSize: '13px', 
                fontWeight: 600, 
                cursor: 'pointer' 
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Property
            </button>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {properties.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase())).map((property) => (
                <div key={property._id} onClick={() => handleViewDetails(property)} style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer'
                }}>
                  <div style={{ position: 'relative', height: '200px', background: '#e2e8f0' }}>
                    {property.imageUrl ? <img src={property.imageUrl} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🏠</div>}
                    {property.isNew && <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>NEW</span>}
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: typeConfig[property.type]?.bg || 'rgba(0,0,0,0.6)', color: typeConfig[property.type]?.color || 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{property.type}</span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{property.title || property.propertyTitle}</h3>
                      {getStatusBadge(property.status)}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{property.location || `${property.city}, ${property.state}`}</p>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#00d4aa', marginBottom: '12px' }}>{property.priceDisplay || formatPrice(property.price)}</p>
                    <div style={{ display: 'flex', gap: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{property.bedrooms} beds</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{property.bathrooms} baths</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{property.squareFeet || property.area?.split(' ')[0] || 0} sqft</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Property</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Location</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Beds/Baths</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase())).map((property) => (
                    <tr key={property._id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => handleViewDetails(property)}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {property.imageUrl ? <img src={property.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🏠</span>}
                          </div>
                          <div><p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{property.title || property.propertyTitle}</p><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{property.address || 'Address not specified'}</p></div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: typeConfig[property.type]?.bg, color: typeConfig[property.type]?.color }}>{property.type}</span></td>
                      <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{property.location || `${property.city}, ${property.state}`}</span></td>
                      <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{property.bedrooms} / {property.bathrooms}</span></td>
                      <td style={{ padding: '14px 16px' }}><span className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: '#00d4aa' }}>{property.priceDisplay || formatPrice(property.price)}</span></td>
                      <td style={{ padding: '14px 16px' }}>{getStatusBadge(property.status)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(59,126,255,0.08)', border: '1px solid rgba(59,126,255,0.15)', cursor: 'pointer', color: '#3b7eff' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          </button>
                          <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)', cursor: 'pointer', color: '#00d4aa' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {properties.length === 0 && !loading && (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.3 }}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              <p style={{ fontSize: '14px' }}>No properties found</p>
              <button onClick={() => setShowAddModal(true)} style={{ marginTop: '12px', padding: '8px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Add Your First Property</button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing <strong>{properties.length}</strong> of <strong>{totalItems}</strong> properties</p>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} style={{ padding: '6px 12px', borderRadius: '6px', background: 'white', border: '1px solid var(--border)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>Previous</button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (currentPage <= 3) pageNum = i + 1; else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = currentPage - 2 + i;
                  return (<button key={i} onClick={() => goToPage(pageNum)} style={{ width: '32px', height: '32px', borderRadius: '6px', background: currentPage === pageNum ? 'var(--accent)' : 'white', border: '1px solid var(--border)', color: currentPage === pageNum ? 'white' : 'var(--text-primary)', fontWeight: currentPage === pageNum ? 700 : 400, cursor: 'pointer' }}>{pageNum}</button>);
                })}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: '6px 12px', borderRadius: '6px', background: 'white', border: '1px solid var(--border)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Details Modal */}
      {showDetailsModal && selectedProperty && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto' }} onClick={() => setShowDetailsModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '800px', width: '90%', maxHeight: '85vh', overflow: 'auto', margin: '20px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', height: '300px', background: '#e2e8f0' }}>
              {selectedProperty.imageUrl ? <img src={selectedProperty.imageUrl} alt={selectedProperty.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>🏠</div>}
              <button onClick={() => setShowDetailsModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
              {selectedProperty.isNew && <span style={{ position: 'absolute', bottom: '16px', left: '16px', background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>NEW</span>}
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div><h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{selectedProperty.title || selectedProperty.propertyTitle}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{selectedProperty.location || `${selectedProperty.city}, ${selectedProperty.state}`}</p></div>
                {getStatusBadge(selectedProperty.status)}
              </div>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#00d4aa', marginBottom: '20px' }}>{selectedProperty.priceDisplay || formatPrice(selectedProperty.price)}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
                <div><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bedrooms</p><p style={{ fontSize: '18px', fontWeight: 700 }}>{selectedProperty.bedrooms}</p></div>
                <div><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bathrooms</p><p style={{ fontSize: '18px', fontWeight: 700 }}>{selectedProperty.bathrooms}</p></div>
                <div><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Square Feet</p><p style={{ fontSize: '18px', fontWeight: 700 }}>{selectedProperty.squareFeet || selectedProperty.area?.split(' ')[0] || 0}</p></div>
                <div><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Parking</p><p style={{ fontSize: '18px', fontWeight: 700 }}>{selectedProperty.parking || selectedProperty.garageSpaces || 0}</p></div>
              </div>
              
              {selectedProperty.description && (<div style={{ marginBottom: '20px' }}><h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Description</h3><p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedProperty.description}</p></div>)}
              
              {selectedProperty.features && selectedProperty.features.length > 0 && (<div><h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Features</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{selectedProperty.features.map((f, i) => (<span key={i} style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '20px', fontSize: '12px' }}>{f}</span>))}</div></div>)}
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <button style={{ flex: 1, padding: '12px', background: '#537D96', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Edit Property</button>
                <button style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Delete Property</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ADD PROPERTY MODAL - YAHAN ADD KARO */}
      <AddPropertyModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={fetchProperties}
      />
    </div>
  );
}