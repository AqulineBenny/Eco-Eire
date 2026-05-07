'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const IssueMap = dynamic(() => import('@/components/Map/MapTilerMap'), { ssr: false });

export default function PublicMapPage() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports/public');
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.issue_type === filter;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '100px auto', padding: '20px' }}>
      <h1 style={{ color: '#2e7d32' }}>Community Issues Map</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        View all reported issues in your community. Click on markers for details.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter by type:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        >
          <option value="all">All Issues</option>
          <option value="pothole">Potholes</option>
          <option value="graffiti">Graffiti</option>
          <option value="rubbish">Rubbish</option>
          <option value="illegal-dumping">Illegal Dumping</option>
          <option value="street-light">Broken Street Lights</option>
        </select>
      </div>

      <IssueMap
        reports={filteredReports}
        height="600px"
      />

      <div style={{ marginTop: '20px' }}>
        <p><strong>Total visible reports:</strong> {filteredReports.length}</p>
      </div>
    </div>
  );
}