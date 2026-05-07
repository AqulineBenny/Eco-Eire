'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    inReviewReports: 0,
    totalUsers: 0,
    totalVolunteerHours: 0
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      const [reportsRes, usersRes] = await Promise.all([
        fetch('/api/admin/reports'),
        fetch('/api/admin/users')
      ]);

      const reportsData = await reportsRes.json();
      const usersData = await usersRes.json();

      if (reportsData.success) {
        setReports(reportsData.reports);

        const total = reportsData.reports.length;
        const pending = reportsData.reports.filter(r => r.status === 'pending').length;
        const inReview = reportsData.reports.filter(r => r.status === 'in-review').length;
        const resolved = reportsData.reports.filter(r => r.status === 'resolved').length;

        setStats({
          totalReports: total,
          pendingReports: pending,
          inReviewReports: inReview,
          resolvedReports: resolved,
          totalUsers: usersData.users?.length || 0,
          totalVolunteerHours: usersData.users?.reduce((sum, u) => sum + (u.volunteerHours || 0), 0) || 0
        });
      }

      if (usersData.success) {
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...statusUpdate,
          updatedBy: user._id
        })
      });

      const data = await response.json();

      if (data.success) {
        setSelectedReport(null);
        setStatusUpdate({ status: '', comment: '' });
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (data.success) {
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '100px auto', padding: '20px' }}>
      <h1 style={{ color: '#2e7d32' }}>Admin Dashboard</h1>
      <p>Welcome, {user?.name} (Administrator)</p>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        margin: '30px 0'
      }}>
        <div style={{ backgroundColor: '#1b5e20', padding: '20px', borderRadius: '10px', border: '2px solid #4caf50' }}>
          <h3>Total Reports</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalReports}</p>
        </div>
        <div style={{ backgroundColor: '#bf360c', padding: '20px', borderRadius: '10px', border: '2px solid #ff9800' }}>
          <h3>Pending</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.pendingReports}</p>
        </div>
        <div style={{ backgroundColor: '#0d47a1', padding: '20px', borderRadius: '10px', border: '2px solid #2196f3' }}>
          <h3>In Review</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.inReviewReports}</p>
        </div>
        <div style={{ backgroundColor: '#1b5e20', padding: '20px', borderRadius: '10px', border: '2px solid #4caf50' }}>
          <h3>Resolved</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.resolvedReports}</p>
        </div>
        <div style={{ backgroundColor: '#4a148c', padding: '20px', borderRadius: '10px', border: '2px solid #9c27b0' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalUsers}</p>
        </div>
        <div style={{ backgroundColor: '#bf360c', padding: '20px', borderRadius: '10px', border: '2px solid #ff9800' }}>
          <h3>Volunteer Hours</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalVolunteerHours}</p>
        </div>
      </div>

      {/* Reports Management */}
      <div style={{ marginTop: '40px' }}>
        <h2>Manage Reports</h2>
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {reports.map((report) => (
            <div key={report._id} style={{ border: '1px solid #930808', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{report.title}</h3>
                  <p><strong>Type:</strong> {report.issue_type}</p>
                  <p><strong>Reported by:</strong> {report.userName || 'Unknown'}</p>
                  <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '3px',
                      backgroundColor: report.status === 'resolved' ? '#4caf50' : report.status === 'in-review' ? '#2196f3' : report.status === 'pending' ? '#ff9800' : '#f44336',
                      color: 'white'
                    }}>
                      {report.status}
                    </span>
                  </p>
                  <p><strong>Location:</strong> {report.location?.address}</p>
                </div>
                <button onClick={() => setSelectedReport(report)} style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
                  Update Status
                </button>
              </div>
              {report.images?.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <p><strong>Images:</strong></p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {report.images.map((img, idx) => (
                      <img key={idx} src={img.data} alt={`Report ${idx + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status Update Modal - COLORS FIXED FOR DROPDOWN */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1c5c22',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            border: '3px solid #4caf50'
          }}>
            <h2 style={{ color: '#4caf50', marginBottom: '20px' }}>Update Report Status</h2>
            <p style={{ color: '#ffffff' }}><strong style={{ color: '#4caf50' }}>Report:</strong> {selectedReport.title}</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ffffff' }}>New Status</label>
              <select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #4caf50',
                  borderRadius: '5px',
                  backgroundColor: '#ffffff',
                  color: '#333333'
                }}
              >
                <option value="" style={{ backgroundColor: '#ffffff', color: '#333333' }}>Select status</option>
                <option value="pending" style={{ backgroundColor: '#ffffff', color: '#ff9800' }}>Pending</option>
                <option value="in-review" style={{ backgroundColor: '#ffffff', color: '#2196f3' }}>In Review</option>
                <option value="resolved" style={{ backgroundColor: '#ffffff', color: '#4caf50' }}>Resolved</option>
                <option value="rejected" style={{ backgroundColor: '#ffffff', color: '#f44336' }}>Rejected</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ffffff' }}>Comment / Notes</label>
              <textarea
                value={statusUpdate.comment}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, comment: e.target.value })}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #4caf50',
                  borderRadius: '5px',
                  resize: 'vertical',
                  backgroundColor: '#ffffff',
                  color: '#333333'
                }}
                placeholder="Add notes about this update..."
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedReport(null)} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleStatusUpdate(selectedReport._id)} disabled={!statusUpdate.status} style={{ backgroundColor: statusUpdate.status ? '#2e7d32' : '#ccc', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: statusUpdate.status ? 'pointer' : 'not-allowed' }}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Users Management */}
      <div style={{ marginTop: '40px' }}>
        <h2>Manage Users</h2>
        <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
          {users.map((user) => (
            <div key={user._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p><strong>{user.name}</strong> ({user.email})</p>
                <p>Role: {user.role} | Reports: {user.reportsCount || 0} | Hours: {user.volunteerHours || 0}</p>
                <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                {user.status === 'suspended' ? (
                  <button onClick={() => handleUserAction(user._id, 'activate')} style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Activate</button>
                ) : (
                  <button onClick={() => handleUserAction(user._id, 'suspend')} style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Suspend</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}