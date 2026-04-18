'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import {
  CountrySelect,
  StateSelect,
  CitySelect,
} from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const propertyTypes = ['House', 'Condo', 'Townhome', 'Apartment', 'Villa', 'Commercial', 'Land'];
const sources = ['Referral', 'Website', 'Social Media', 'Cold Outreach', 'Events', 'Direct'];
const statuses = ['Hot', 'Warm', 'Cold'];
const priorities = ['High', 'Medium', 'Low'];

export default function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: 'House',
    budgetMin: '',
    budgetMax: '',
    address: '',
    source: 'Website',
    status: 'Warm',
    priority: 'Medium',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const locationParts = [];
      if (selectedCity?.name) locationParts.push(selectedCity.name);
      if (selectedState?.name) locationParts.push(selectedState.name);
      if (selectedCountry?.name) locationParts.push(selectedCountry.name);
      const location = locationParts.join(', ');
      
      let budgetDisplay = '';
      if (formData.budgetMin && formData.budgetMax) {
        budgetDisplay = `$${parseInt(formData.budgetMin).toLocaleString()} - $${parseInt(formData.budgetMax).toLocaleString()}`;
      } else if (formData.budgetMin) {
        budgetDisplay = `$${parseInt(formData.budgetMin).toLocaleString()}+`;
      }

      const leadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyType: formData.propertyType,
        budget: budgetDisplay,
        budgetMin: parseInt(formData.budgetMin) || 0,
        budgetMax: parseInt(formData.budgetMax) || 0,
        location: location,
        address: formData.address,
        source: formData.source,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes,
        stage: 'Prospecting'
      };

      const response = await api.createLead(leadData);
      
      if (response.success) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        alert(response.message || 'Failed to add lead');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      propertyType: 'House',
      budgetMin: '',
      budgetMax: '',
      address: '',
      source: 'Website',
      status: 'Warm',
      priority: 'Medium',
      notes: ''
    });
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '40px 16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '700px',
          width: '100%',
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '16px 16px 0 0',
          background: 'white',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1e293b' }}>Add New Lead</h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: '#f1f5f9',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              color: '#64748b'
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Basic Info */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: 0, color: '#334155' }}>📋 Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', background: 'white' }}
                  >
                    {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: 0, color: '#334155' }}>💰 Budget Range</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Min Budget ($)</label>
                  <input
                    type="number"
                    name="budgetMin"
                    value={formData.budgetMin}
                    onChange={handleChange}
                    placeholder="e.g., 500000"
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Max Budget ($)</label>
                  <input
                    type="number"
                    name="budgetMax"
                    value={formData.budgetMax}
                    onChange={handleChange}
                    placeholder="e.g., 800000"
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: 0, color: '#334155' }}>📍 Location</h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Country *</label>
                <CountrySelect
                  onChange={(e: any) => {
                    setSelectedCountry(e);
                    setSelectedState(null);
                    setSelectedCity(null);
                  }}
                  placeHolder="Select Country"
                  style={{ width: '100%' }}
                />
              </div>

              {selectedCountry && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>State/Province</label>
                  <StateSelect
                    countryid={selectedCountry.id}
                    onChange={(e: any) => {
                      setSelectedState(e);
                      setSelectedCity(null);
                    }}
                    placeHolder="Select State"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              {selectedCountry && selectedState && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>City</label>
                  <CitySelect
                    countryid={selectedCountry.id}
                    stateid={selectedState.id}
                    onChange={(e: any) => setSelectedCity(e)}
                    placeHolder="Select City"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main Street, Apartment 4B"
                  style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>

            {/* Lead Details */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: 0, color: '#334155' }}>🏷️ Lead Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', background: 'white' }}
                  >
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', background: 'white' }}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', background: 'white' }}
                  >
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#475569' }}>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any special requirements or notes about this lead..."
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                color: '#475569',
                transition: 'background 0.15s'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: '#537D96',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.15s'
              }}
            >
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}