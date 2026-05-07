'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchUserData(parsedUser);
  }, [router]);

  const fetchUserData = async (userData) => {
    try {
      // Fetch user's reports
      const reportsResponse = await fetch(`/api/reports/list?userId=${userData._id || userData.id}`);
      const reportsData = await reportsResponse.json();
      if (reportsData.success) {
        setReports(reportsData.reports || []);
      }

      // Fetch all upcoming events (no userId needed)
      const eventsResponse = await fetch('/api/events');
      const eventsData = await eventsResponse.json();
      if (eventsData.success) {
        // Filter events to show only ones the user has joined
        const userEvents = eventsData.events.filter(event =>
          event.volunteers?.includes(userData._id || userData.id)
        );
        setEvents(userEvents || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '100px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2e7d32' }}>My Dashboard</h1>
        <p>Welcome back, <strong>{user.name}</strong>!</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        margin: '30px 0'
      }}>
        {/* Total Reports Card */}
        <div style={{
          backgroundColor: '#1c5c22',
          padding: '25px',
          borderRadius: '10px',
          border: '3px solid #4caf50',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Total Reports</h3>
          <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '10px 0' }}>
            {/* ✅ FIXED: Use reports.length as fallback if user.reportsCount is 0 but reports exist */}
            {(user.reportsCount || reports.length || 0)}
          </p>
          <small>Issues you've reported</small>
        </div>

        {/* Volunteer Hours Card */}
        <div style={{
          backgroundColor: '#0d47a1',
          padding: '25px',
          borderRadius: '10px',
          border: '3px solid #2196f3',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Volunteer Hours</h3>
          <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '10px 0' }}>
            {user.volunteerHours || 0}
          </p>
          <small>Hours contributed</small>
        </div>

        {/* Events Attended Card */}
        <div style={{
          backgroundColor: '#e65100',
          padding: '25px',
          borderRadius: '10px',
          border: '3px solid #ff9800',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Events</h3>
          <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '10px 0' }}>
            {events.length || 0}
          </p>
          <small>Events joined</small>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ margin: '40px 0' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <Link href="/report" style={{
            backgroundColor: '#2e7d32',
            color: 'white',
            padding: '12px 25px',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            + New Report
          </Link>
          <Link href="/events" style={{
            backgroundColor: '#ff9800',
            color: 'white',
            padding: '12px 25px',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            📅 Find Events
          </Link>
          <Link href="/map" style={{
            backgroundColor: '#2196f3',
            color: 'white',
            padding: '12px 25px',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            🗺️ View Map
          </Link>
        </div>
      </div>

      {/* My Reports Section */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Recent Reports</h2>
          <Link href="/report" style={{ color: '#2e7d32' }}>View All →</Link>
        </div>

        {reports.length > 0 ? (
          <div style={{ marginTop: '20px' }}>
            {reports.slice(0, 5).map((report) => (
              <div
                key={report._id}
                style={{
                  border: '1px solid #ef1515',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  backgroundColor: '#7a2222'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>{report.title}</h3>
                    <p style={{ margin: '5px 0' }}>Type: {report.issue_type}</p>
                    <p style={{ margin: '5px 0' }}>
                      Status: <span style={{
                        padding: '3px 8px',
                        borderRadius: '3px',
                        backgroundColor:
                          report.status === 'resolved' ? '#4caf50' :
                          report.status === 'in-review' ? '#2196f3' :
                          report.status === 'pending' ? '#ff9800' : '#f44336',
                        color: 'white'
                      }}>
                        {report.status}
                      </span>
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {report.images && report.images.length > 0 && (
                    <img
                      src={report.images[0].data}
                      alt="Report"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '5px'
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', margin: '40px 0', color: '#666' }}>
            No reports yet. <Link href="/report" style={{ color: '#2e7d32' }}>Create your first report!</Link>
          </p>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Upcoming Events</h2>
          <Link href="/events" style={{ color: '#2e7d32' }}>View All →</Link>
        </div>

        {events.length > 0 ? (
          <div style={{ marginTop: '20px' }}>
            {events.slice(0, 3).map((event) => (
              <div
                key={event._id}
                style={{
                  border: '1px solid #1bdad7',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  backgroundColor: '#12686b'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#8fc13e' }}>{event.title}</h3>
                <p style={{ margin: '5px 0' }}>📅 {new Date(event.date).toLocaleString()}</p>
                <p style={{ margin: '5px 0' }}>📍 {event.location}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', margin: '40px 0', color: '#666' }}>
            No events joined. <Link href="/events" style={{ color: '#2e7d32' }}>Find events near you!</Link>
          </p>
        )}
      </div>
    </div>
  );
}