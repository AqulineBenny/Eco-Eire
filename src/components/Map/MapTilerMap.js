'use client';
import { useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

export default function MapTilerMap({ 
  reports = [], 
  onLocationSelect, 
  selectedLocation,
  height = '500px' 
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const markersRef = useRef([]);
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [mapStyle, setMapStyle] = useState('streets');

  const styles = {
    streets: maptilersdk.MapStyle.STREETS,
    satellite: maptilersdk.MapStyle.SATELLITE,
    hybrid: maptilersdk.MapStyle.HYBRID,
  };

  // Helper function to escape HTML
  const escapeHtml = (str) => {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    
    if (!apiKey) {
      console.error('MapTiler API key is missing!');
      return;
    }

    maptilersdk.config.apiKey = apiKey;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: styles[mapStyle],
      center: [-6.2603, 53.3498],
      zoom: 12,
    });

    // Add navigation controls (zoom in/out) - ONLY ONCE
    map.current.addControl(new maptilersdk.NavigationControl(), 'top-right');
    
    // Add geolocation control
    map.current.addControl(new maptilersdk.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    // Map click handler for location selection
    map.current.on('click', (e) => {
      if (onLocationSelect) {
        const { lng, lat } = e.lngLat;
        onLocationSelect({
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          coordinates: { lat, lng }
        });
      }
    });

    setMapInitialized(true);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Change map style (Streets/Satellite/Hybrid)
  const changeMapStyle = (style) => {
    if (!map.current) return;
    map.current.setStyle(styles[style]);
    setMapStyle(style);
  };

  // Handle markers when reports change
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each report
    reports.forEach(report => {
      if (report.location?.coordinates) {
        const { lat, lng } = report.location.coordinates;
        
        // Styled popup with colors
        const popupHTML = `
          <div style="max-width: 250px; padding: 12px; font-family: Arial, sans-serif;">
            <h3 style="margin:0 0 10px 0; color:#2e7d32; font-size:16px; border-bottom:2px solid #4caf50; padding-bottom:5px;">
              📍 ${escapeHtml(report.title)}
            </h3>
            <p style="margin:8px 0; color:#555;">
              <strong style="color:#2e7d32;">🗂️ Type:</strong> 
              <span style="background:#f0f0f0; padding:2px 8px; border-radius:12px; font-size:13px;">
                ${escapeHtml(report.issue_type)}
              </span>
            </p>
            <p style="margin:8px 0;">
              <strong style="color:#2e7d32;">📊 Status:</strong> 
              <span style="
                display: inline-block;
                padding:4px 12px;
                border-radius:20px;
                font-size:12px;
                font-weight:bold;
                background-color: ${
                  report.status === 'resolved' ? '#4caf50' :
                  report.status === 'in-review' ? '#2196f3' :
                  report.status === 'pending' ? '#ff9800' : '#f44336'
                };
                color: white;
              ">
                ${escapeHtml(report.status).toUpperCase()}
              </span>
            </p>
            <p style="margin:8px 0; color:#555; font-size:12px;">
              📅 ${new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        `;

        const marker = new maptilersdk.Marker({
          color: getMarkerColor(report.issue_type, report.status)
        })
          .setLngLat([lng, lat])
          .setPopup(new maptilersdk.Popup({ offset: 25 }).setHTML(popupHTML))
          .addTo(map.current);

        markersRef.current.push(marker);
      }
    });
  }, [reports, mapInitialized]);

  // Add marker on map when location is selected (for report creation)
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    // Remove existing selection marker
    if (window.selectedMarker) {
      window.selectedMarker.remove();
    }

    if (selectedLocation?.coordinates) {
      window.selectedMarker = new maptilersdk.Marker({
        color: '#2e7d32',
        draggable: false
      })
        .setLngLat([selectedLocation.coordinates.lng, selectedLocation.coordinates.lat])
        .addTo(map.current);

      map.current.flyTo({
        center: [selectedLocation.coordinates.lng, selectedLocation.coordinates.lat],
        zoom: 16,
        essential: true
      });
    }
  }, [selectedLocation, mapInitialized]);

  // Search function - adds a marker at searched location
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    if (!apiKey || !map.current) return;

    setSearching(true);

    try {
      const encodedQuery = encodeURIComponent(searchValue);
      const url = `https://api.maptiler.com/geocoding/${encodedQuery}.json?key=${apiKey}&limit=5&country=IE&fuzzyMatch=true`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        
        // Remove existing search marker
        if (window.searchMarker) {
          window.searchMarker.remove();
        }
        
        // Add marker at searched location (BLUE for search results)
        window.searchMarker = new maptilersdk.Marker({
          color: '#2196f3',
          draggable: false
        })
          .setLngLat([lng, lat])
          .setPopup(new maptilersdk.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <strong>🔍 Searched Location</strong><br/>
              ${feature.place_name}
            </div>
          `))
          .addTo(map.current);
        
        map.current.flyTo({
          center: [lng, lat],
          zoom: 16,
          essential: true
        });
        
        if (onLocationSelect) {
          onLocationSelect({
            address: feature.place_name,
            coordinates: { lat, lng }
          });
        }
        
        setSearchValue('');
        
      } else {
        alert('Location not found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for location. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const getMarkerColor = (type, status) => {
    const colors = {
      pothole: '#FF0000',
      graffiti: '#FFA500',
      rubbish: '#FFFF00',
      'illegal-dumping': '#800080',
      'street-light': '#0000FF',
      other: '#808080'
    };
    
    const statusColors = {
      pending: '#FFA500',
      'in-review': '#0000FF',
      resolved: '#00FF00',
      rejected: '#FF0000'
    };

    return statusColors[status] || colors[type] || '#FF0000';
  };

  return (
    <div style={{ position: 'relative', height }}>
      {/* Search Box - Positioned to avoid navbar overlap */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '10px',
          zIndex: 1000,
          background: 'white',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          gap: '8px',
          minWidth: '280px'
        }}
      >
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for a place in Ireland..."
          style={{
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            flex: 1,
            outline: 'none'
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e);
            }
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          style={{
            padding: '10px 16px',
            backgroundColor: searching ? '#81c784' : '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: searching ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {searching ? '...' : 'Search'}
        </button>
      </div>

      {/* Map Style Toggle Buttons */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'white',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          onClick={() => changeMapStyle('streets')}
          style={{
            padding: '8px 16px',
            backgroundColor: mapStyle === 'streets' ? '#2e7d32' : '#f0f0f0',
            color: mapStyle === 'streets' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🗺️ Streets
        </button>
        <button
          onClick={() => changeMapStyle('satellite')}
          style={{
            padding: '8px 16px',
            backgroundColor: mapStyle === 'satellite' ? '#2e7d32' : '#f0f0f0',
            color: mapStyle === 'satellite' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🛰️ Satellite
        </button>
        <button
          onClick={() => changeMapStyle('hybrid')}
          style={{
            padding: '8px 16px',
            backgroundColor: mapStyle === 'hybrid' ? '#2e7d32' : '#f0f0f0',
            color: mapStyle === 'hybrid' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🌍 Hybrid
        </button>
      </div>
      
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: height,
          borderRadius: '8px'
        }} 
      />
    </div>
  );
}