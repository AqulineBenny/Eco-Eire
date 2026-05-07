'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eircode: ''
  });
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      eircode: parsedUser.eircode || ''
    });
    setLoading(false);
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '100px auto', padding: '20px' }}>
      <h1 style={{ color: '#2e7d32' }}>My Profile</h1>

      {message && (
        <div style={{
          backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
          color: message.type === 'success' ? '#2e7d32' : '#c62828',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        backgroundColor: '#1c5c22',
        padding: '30px',
        borderRadius: '10px',
        border: '3px solid #4caf50'
      }}>
        {!editing ? (
          // View Mode
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#ffffff' }}>Name</label>
              <p style={{ fontSize: '18px', color: '#ffffff' }}>{user.name}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#ffffff' }}>Email</label>
              <p style={{ fontSize: '18px', color: '#ffffff' }}>{user.email}</p>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#ffffff' }}>Eircode</label>
              <p style={{ fontSize: '18px', color: '#ffffff' }}>{user.eircode || 'Not provided'}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#ffffff' }}>Member Since</label>
              <p style={{ color: '#ffffff' }}>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#ffffff' }}>Account Type</label>
              <p style={{ color: '#ffffff' }}>{user.role === 'admin' ? 'Administrator' : 'Community Member'}</p>
            </div>

            <button
              onClick={() => setEditing(true)}
              style={{
                backgroundColor: '#2e7d32',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Edit Profile
            </button>

            <Link href="/settings/privacy" style={{
              backgroundColor: '#2196f3',
              color: 'white',
              padding: '12px 30px',
              borderRadius: '5px',
              textDecoration: 'none',
              display: 'inline-block'
            }}>
              Privacy Settings
            </Link>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ffffff' }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ffffff' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ffffff' }}>
                Eircode
              </label>
              <input
                type="text"
                name="eircode"
                value={formData.eircode}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div>
              <button
                type="submit"
                style={{
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user.name,
                    email: user.email,
                    eircode: user.eircode
                  });
                }}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}