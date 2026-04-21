'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProperty?: any;
}

const propertyTypes = ['House', 'Condo', 'Townhome', 'Multi Family', 'Mobile', 'Farm', 'Land', 'Co-op', 'Condop'];
const listingTypes = ['For Sale', 'For Rent', 'Commercial'];
const stateOptions = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+'];
const bathroomOptions = ['1', '2', '3', '4', '5+'];
const garageOptions = ['0', '1', '2', '3', '4+'];
const storiesOptions = ['Single', 'Multi'];
const commercialUseOptions = ['Retail', 'Office', 'Industrial', 'Warehouse', 'Mixed-Use', 'Medical', 'Restaurant'];

const availableFeatures = [
  'Central AC', 'Hardwood Floors', 'Swimming Pool', 'Smart Home',
  'Security System', 'Garden', 'Parking', 'Pet Friendly',
  'Fireplace', 'Balcony', 'Elevator', 'Gym', 'Sauna', 'Wheelchair Access'
];

const commercialFeatures = [
  'Loading Dock', 'Sprinkler System', 'Security Cameras', 'Elevator',
  'Parking Garage', '24/7 Access', 'Kitchenette', 'Conference Room'
];

export default function AddPropertyModal({ isOpen, onClose, onSuccess, editProperty }: AddPropertyModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('House');
  const [listingType, setListingType] = useState('For Sale');
  const [salePrice, setSalePrice] = useState('');
  const [rentMinPrice, setRentMinPrice] = useState('');
  const [rentMaxPrice, setRentMaxPrice] = useState('');
  const [commercialPrice, setCommercialPrice] = useState('');
  
  // Location
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('NY');
  const [zipCode, setZipCode] = useState('');

  // Step 2: Property Details
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [squareFeet, setSquareFeet] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [garageSpaces, setGarageSpaces] = useState('2');
  const [yearBuilt, setYearBuilt] = useState('');
  const [stories, setStories] = useState('Single');
  const [propertyUse, setPropertyUse] = useState('Retail');
  const [buildingSize, setBuildingSize] = useState('');
  const [zoning, setZoning] = useState('');
  const [yearRenovated, setYearRenovated] = useState('');
  const [floodRisk, setFloodRisk] = useState('');
  const [floodFactor, setFloodFactor] = useState(1);

  // Step 3: Features & Images
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedCommercialFeatures, setSelectedCommercialFeatures] = useState<string[]>([]);
  
  // Images
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [bedroomImages, setBedroomImages] = useState<File[]>([]);
  const [bathroomImages, setBathroomImages] = useState<File[]>([]);
  const [kitchenImages, setKitchenImages] = useState<File[]>([]);
  const [livingImages, setLivingImages] = useState<File[]>([]);
  const [exteriorImages, setExteriorImages] = useState<File[]>([]);

  // Step 4: Additional Info
  const [description, setDescription] = useState('');
  const [principalInterest, setPrincipalInterest] = useState('');
  const [propertyTax, setPropertyTax] = useState('');
  const [homeInsurance, setHomeInsurance] = useState('');
  const [hoaFees, setHoaFees] = useState('');
  const [amenitiesCommunity, setAmenitiesCommunity] = useState('');
  const [amenitiesPark, setAmenitiesPark] = useState('');
  const [amenitiesPool, setAmenitiesPool] = useState('');
  const [veteransBenefits, setVeteransBenefits] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Handle edit mode
  useEffect(() => {
    if (editProperty && isOpen) {
      setTitle(editProperty.title || '');
      setPropertyType(editProperty.propertyType || 'House');
      setListingType(editProperty.type || 'For Sale');
      setAddress(editProperty.address || '');
      setCity(editProperty.city || '');
      setState(editProperty.state || 'NY');
      setBedrooms(editProperty.bedrooms?.toString() || '3');
      setBathrooms(editProperty.bathrooms?.toString() || '2');
      setSquareFeet(editProperty.squareFeet?.toString() || '');
      setDescription(editProperty.description || '');
    }
  }, [editProperty, isOpen]);

  const resetForm = () => {
    setTitle('');
    setPropertyType('House');
    setListingType('For Sale');
    setSalePrice('');
    setRentMinPrice('');
    setRentMaxPrice('');
    setCommercialPrice('');
    setAddress('');
    setCountry('');
    setCity('');
    setState('NY');
    setZipCode('');
    setBedrooms('3');
    setBathrooms('2');
    setSquareFeet('');
    setLotSize('');
    setGarageSpaces('2');
    setYearBuilt('');
    setStories('Single');
    setPropertyUse('Retail');
    setBuildingSize('');
    setZoning('');
    setYearRenovated('');
    setFloodRisk('');
    setFloodFactor(1);
    setSelectedFeatures([]);
    setSelectedCommercialFeatures([]);
    setMainImage(null);
    setMainImagePreview('');
    setBedroomImages([]);
    setBathroomImages([]);
    setKitchenImages([]);
    setLivingImages([]);
    setExteriorImages([]);
    setDescription('');
    setPrincipalInterest('');
    setPropertyTax('');
    setHomeInsurance('');
    setHoaFees('');
    setAmenitiesCommunity('');
    setAmenitiesPark('');
    setAmenitiesPool('');
    setVeteransBenefits(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = Array.from(e.target.files || []);
    if (type === 'main' && files[0]) {
      setMainImage(files[0]);
      setMainImagePreview(URL.createObjectURL(files[0]));
    } else if (type === 'bedroom') {
      setBedroomImages([...bedroomImages, ...files]);
    } else if (type === 'bathroom') {
      setBathroomImages([...bathroomImages, ...files]);
    } else if (type === 'kitchen') {
      setKitchenImages([...kitchenImages, ...files]);
    } else if (type === 'living') {
      setLivingImages([...livingImages, ...files]);
    } else if (type === 'exterior') {
      setExteriorImages([...exteriorImages, ...files]);
    }
  };

  const removeImage = (type: string, index: number) => {
    if (type === 'main') {
      setMainImage(null);
      setMainImagePreview('');
    } else if (type === 'bedroom') {
      setBedroomImages(bedroomImages.filter((_, i) => i !== index));
    } else if (type === 'bathroom') {
      setBathroomImages(bathroomImages.filter((_, i) => i !== index));
    } else if (type === 'kitchen') {
      setKitchenImages(kitchenImages.filter((_, i) => i !== index));
    } else if (type === 'living') {
      setLivingImages(livingImages.filter((_, i) => i !== index));
    } else if (type === 'exterior') {
      setExteriorImages(exteriorImages.filter((_, i) => i !== index));
    }
  };

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const toggleCommercialFeature = (feature: string) => {
    if (selectedCommercialFeatures.includes(feature)) {
      setSelectedCommercialFeatures(selectedCommercialFeatures.filter(f => f !== feature));
    } else {
      setSelectedCommercialFeatures([...selectedCommercialFeatures, feature]);
    }
  };

  const validateStep1 = (): boolean => {
    if (!title.trim()) { alert('Please enter property title'); return false; }
    if (!address.trim()) { alert('Please enter street address'); return false; }
    if (!city.trim()) { alert('Please select a city'); return false; }
    if (listingType === 'For Sale' && !salePrice) { alert('Please enter sale price'); return false; }
    if (listingType === 'For Rent' && (!rentMinPrice || !rentMaxPrice)) { alert('Please enter rent range'); return false; }
    if (listingType === 'Commercial' && !commercialPrice) { alert('Please enter commercial price'); return false; }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!squareFeet) { alert('Please enter square feet'); return false; }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!mainImage) { alert('Please upload a main image'); return false; }
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!description.trim()) { alert('Please enter property description'); return false; }
    return true;
  };

  const nextStep = () => {
    let isValid = true;
    if (currentStep === 0) isValid = validateStep1();
    if (currentStep === 1) isValid = validateStep2();
    if (currentStep === 2) isValid = validateStep3();
    if (currentStep === 3) isValid = validateStep4();
    
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getDisplayPrice = () => {
    if (listingType === 'For Sale') return salePrice ? `$${parseInt(salePrice).toLocaleString()}` : '$0';
    if (listingType === 'For Rent') return rentMinPrice && rentMaxPrice ? `$${parseInt(rentMinPrice).toLocaleString()} - $${parseInt(rentMaxPrice).toLocaleString()}/month` : '$0/month';
    return commercialPrice ? `$${parseInt(commercialPrice).toLocaleString()}` : '$0';
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) return;
    
    setSubmitting(true);
    
    try {
      let price = 0;
      let priceDisplay = '';
      
      if (listingType === 'For Sale') {
        price = parseInt(salePrice) || 0;
        priceDisplay = `$${price.toLocaleString()}`;
      } else if (listingType === 'For Rent') {
        price = parseInt(rentMinPrice) || 0;
        const maxRent = parseInt(rentMaxPrice) || 0;
        priceDisplay = maxRent > price ? `$${price.toLocaleString()} - $${maxRent.toLocaleString()}/month` : `$${price.toLocaleString()}/month`;
      } else {
        price = parseInt(commercialPrice) || 0;
        priceDisplay = `$${price.toLocaleString()}`;
      }

      const location = {
        address: address,
        city: city,
        state: state,
      };

      const area = {
        value: parseInt(squareFeet) || 0,
        unit: 'sqft',
        display: `${squareFeet || 0} sqft`
      };

      const amenities = {
        communityCenter: amenitiesCommunity,
        park: amenitiesPark,
        pool: amenitiesPool
      };

      const propertyData = {
        title,
        description,
        type: listingType,
        propertyType,
        price,
        priceDisplay,
        location,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        area,
        parking: parseInt(garageSpaces) || 0,
        features: selectedFeatures,
        amenities,
        isNew: true,
        status: 'available',
        lotSize,
        yearBuilt: parseInt(yearBuilt) || 0,
        stories,
        propertyUse,
        buildingSize,
        zoning,
        yearRenovated: parseInt(yearRenovated) || 0,
        floodRisk,
        floodFactor,
        veteransBenefits,
        principalInterest: parseInt(principalInterest) || 0,
        propertyTax: parseInt(propertyTax) || 0,
        homeInsurance: parseInt(homeInsurance) || 0,
        hoaFees: parseInt(hoaFees) || 0,
        commercialFeatures: selectedCommercialFeatures
      };

      const formData = new FormData();
      formData.append('propertyData', JSON.stringify(propertyData));
      
      if (mainImage) formData.append('mainImage', mainImage);
      bedroomImages.forEach(img => formData.append('bedroomImages', img));
      bathroomImages.forEach(img => formData.append('bathroomImages', img));
      kitchenImages.forEach(img => formData.append('kitchenImages', img));
      livingImages.forEach(img => formData.append('livingImages', img));
      exteriorImages.forEach(img => formData.append('exteriorImages', img));

      const response = await api.addPropertyWithImages(formData);
      
      if (response.success) {
        alert('Property added successfully!');
        onSuccess();
        onClose();
      } else {
        alert(response.message || 'Failed to add property');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // ✅ FIXED: Modal opens at top (not center)
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.7)', 
      display: 'flex', 
      alignItems: 'flex-start',  // ✅ Changed from 'center' to 'flex-start'
      justifyContent: 'center', 
      zIndex: 1000, 
      overflow: 'auto' 
    }} onClick={onClose}>
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        maxWidth: '800px', 
        width: '90%', 
        maxHeight: '90vh', 
        overflow: 'auto', 
        margin: '20px auto'  // ✅ Added margin top
      }} onClick={(e) => e.stopPropagation()}>
        {/* Rest of the content remains same */}
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Add New Property</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Step {currentStep + 1} of 5</p>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>

        {/* Stepper */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Basic Info', 'Property Details', 'Features & Images', 'Additional Info', 'Review'].map((label, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: currentStep >= idx ? '#537D96' : '#e2e8f0', color: currentStep >= idx ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>{idx + 1}</div>
              <span style={{ fontSize: '12px', fontWeight: currentStep === idx ? 600 : 400, color: currentStep === idx ? '#1e293b' : '#64748b' }}>{label}</span>
              {idx < 4 && <span style={{ color: '#cbd5e1' }}>→</span>}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{ padding: '24px' }}>
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>📋 Basic Information</h3>
              
              <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Property Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Modern Luxury Villa" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Property Type</label><select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>{propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Listing Type *</label><select value={listingType} onChange={(e) => setListingType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>{listingTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>

              {listingType === 'For Sale' && (<div><label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Sale Price *</label><input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="e.g., 850000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>)}
              
              {listingType === 'For Rent' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label>Min Rent *</label><input type="number" value={rentMinPrice} onChange={(e) => setRentMinPrice(e.target.value)} placeholder="e.g., 2000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                  <div><label>Max Rent *</label><input type="number" value={rentMaxPrice} onChange={(e) => setRentMaxPrice(e.target.value)} placeholder="e.g., 3000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                </div>
              )}

              {listingType === 'Commercial' && (<div><label>Commercial Price *</label><input type="number" value={commercialPrice} onChange={(e) => setCommercialPrice(e.target.value)} placeholder="e.g., 1500000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>)}

              <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '8px' }}>📍 Location</h3>
              <div><label>Street Address *</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 6435 Green Pedal Ln" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div><label>Country *</label><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Select Country" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                <div><label>City *</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                <div><label>State</label><select value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>{stateOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
            </div>
          )}

          {/* Step 2-5 remain same... */}
          {/* ... (rest of the steps remain unchanged) ... */}
          
          {/* Step 2: Property Details */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>🏠 Living Spaces</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label>Bedrooms</label><select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>{bedroomOptions.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                <div><label>Bathrooms</label><select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>{bathroomOptions.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>📐 Dimensions</h3>
              <div><label>Square Feet *</label><input type="number" value={squareFeet} onChange={(e) => setSquareFeet(e.target.value)} placeholder="e.g., 2817" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label>Lot Size</label><input type="text" value={lotSize} onChange={(e) => setLotSize(e.target.value)} placeholder="e.g., 5000 sqft" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>

              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>🚗 Parking & Construction</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label>Garage Spaces</label><select value={garageSpaces} onChange={(e) => setGarageSpaces(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>{garageOptions.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                <div><label>Year Built</label><input type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} placeholder="e.g., 2020" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              </div>

              {listingType === 'Commercial' ? (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>🏢 Commercial Details</h3>
                  <div><label>Property Use</label><select value={propertyUse} onChange={(e) => setPropertyUse(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>{commercialUseOptions.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                  <div><label>Building Size</label><input type="text" value={buildingSize} onChange={(e) => setBuildingSize(e.target.value)} placeholder="e.g., 10000 sqft" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                  <div><label>Zoning</label><input type="text" value={zoning} onChange={(e) => setZoning(e.target.value)} placeholder="e.g., Commercial C-1" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                  <div><label>Year Renovated</label><input type="number" value={yearRenovated} onChange={(e) => setYearRenovated(e.target.value)} placeholder="e.g., 2022" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                </>
              ) : (
                <div><label>Stories</label><select value={stories} onChange={(e) => setStories(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>{storiesOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              )}

              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>🌊 Neighborhood</h3>
              <div><label>Flood Risk</label><input type="text" value={floodRisk} onChange={(e) => setFloodRisk(e.target.value)} placeholder="e.g., FEMA Flood Risk x" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label>Flood Factor: {floodFactor}/10</label><input type="range" min="0" max="10" step="1" value={floodFactor} onChange={(e) => setFloodFactor(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
            </div>
          )}

          {/* Step 3: Features & Images */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div><h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>✨ Features & Amenities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{availableFeatures.map(f => (<button key={f} type="button" onClick={() => toggleFeature(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${selectedFeatures.includes(f) ? '#537D96' : '#e2e8f0'}`, background: selectedFeatures.includes(f) ? '#e8f0f5' : 'white', color: selectedFeatures.includes(f) ? '#537D96' : '#64748b', fontSize: '12px', cursor: 'pointer' }}>{f}</button>))}</div>
              </div>

              {listingType === 'Commercial' && (<div><h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>🏭 Commercial Features</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{commercialFeatures.map(f => (<button key={f} type="button" onClick={() => toggleCommercialFeature(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${selectedCommercialFeatures.includes(f) ? '#537D96' : '#e2e8f0'}`, background: selectedCommercialFeatures.includes(f) ? '#e8f0f5' : 'white', color: selectedCommercialFeatures.includes(f) ? '#537D96' : '#64748b', fontSize: '12px', cursor: 'pointer' }}>{f}</button>))}</div></div>)}

              <div><h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>📸 Property Photos</h3>
                <div style={{ marginBottom: '16px' }}><label style={{ fontWeight: 500 }}>Main Photo *</label><input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'main')} style={{ marginTop: '8px', display: 'block' }} />
                  {mainImagePreview && <img src={mainImagePreview} alt="Main" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />}
                </div>
                
                {['bedroom', 'bathroom', 'kitchen', 'living', 'exterior'].map((type) => (
                  <div key={type} style={{ marginBottom: '16px' }}>
                    <label style={{ fontWeight: 500, textTransform: 'capitalize' }}>{type} Photos</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, type)} style={{ marginTop: '8px', display: 'block' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {(type === 'bedroom' ? bedroomImages : type === 'bathroom' ? bathroomImages : type === 'kitchen' ? kitchenImages : type === 'living' ? livingImages : exteriorImages).map((img, idx) => (<div key={idx} style={{ position: 'relative' }}><img src={URL.createObjectURL(img)} alt={`${type} ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} /><button onClick={() => removeImage(type, idx)} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: 'red', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>×</button></div>))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div><label style={{ fontWeight: 500 }}>Property Description *</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the property in detail..." style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '8px' }} /></div>

              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>💰 Monthly Cost (Optional)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label>Principal & Interest</label><input type="number" value={principalInterest} onChange={(e) => setPrincipalInterest(e.target.value)} placeholder="e.g., 1858" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                <div><label>Property Tax</label><input type="number" value={propertyTax} onChange={(e) => setPropertyTax(e.target.value)} placeholder="e.g., 570" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                <div><label>Home Insurance</label><input type="number" value={homeInsurance} onChange={(e) => setHomeInsurance(e.target.value)} placeholder="e.g., 850" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                <div><label>HOA Fees</label><input type="number" value={hoaFees} onChange={(e) => setHoaFees(e.target.value)} placeholder="e.g., 200" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>🏞️ Amenities</h3>
              <div><label>Community Center</label><input type="text" value={amenitiesCommunity} onChange={(e) => setAmenitiesCommunity(e.target.value)} placeholder="e.g., Lake, Clubhouse" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label>Park</label><input type="text" value={amenitiesPark} onChange={(e) => setAmenitiesPark(e.target.value)} placeholder="e.g., Pond, Garden" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label>Pool</label><input type="text" value={amenitiesPool} onChange={(e) => setAmenitiesPool(e.target.value)} placeholder="e.g., Swimming Pool" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}><input type="checkbox" checked={veteransBenefits} onChange={(e) => setVeteransBenefits(e.target.checked)} /><label>Veterans Benefits Available</label></div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}><h4 style={{ fontWeight: 600, marginBottom: '8px' }}>🏠 Basic Information</h4><p>Title: {title || 'Not provided'}</p><p>Type: {propertyType} | Listing: {listingType}</p><p>Price: {getDisplayPrice()}</p></div>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}><h4 style={{ fontWeight: 600, marginBottom: '8px' }}>📍 Location</h4><p>{address}, {city}, {state}</p></div>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}><h4 style={{ fontWeight: 600, marginBottom: '8px' }}>📐 Property Details</h4><p>Bedrooms: {bedrooms} | Bathrooms: {bathrooms} | Sq Ft: {squareFeet || 'Not provided'}</p></div>
              {selectedFeatures.length > 0 && (<div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}><h4 style={{ fontWeight: 600, marginBottom: '8px' }}>✨ Features</h4><p>{selectedFeatures.join(', ')}</p></div>)}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}><h4 style={{ fontWeight: 600, marginBottom: '8px' }}>📸 Images</h4><p>Main Image: {mainImage ? '✓ Uploaded' : '✗ Not uploaded'}</p><p>Bedroom Photos: {bedroomImages.length} uploaded</p><p>Bathroom Photos: {bathroomImages.length} uploaded</p><p>Kitchen Photos: {kitchenImages.length} uploaded</p><p>Living Photos: {livingImages.length} uploaded</p><p>Exterior Photos: {exteriorImages.length} uploaded</p></div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={prevStep} disabled={currentStep === 0} style={{ padding: '10px 20px', background: currentStep === 0 ? '#e2e8f0' : 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', opacity: currentStep === 0 ? 0.5 : 1 }}>Back</button>
          {currentStep < 4 ? (<button onClick={nextStep} style={{ padding: '10px 24px', background: '#537D96', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Next</button>) : (<button onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 24px', background: '#537D96', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Submitting...' : 'Submit Property'}</button>)}
        </div>
      </div>
    </div>
  );
}