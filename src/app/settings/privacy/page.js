'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacySettings() {
  // State management
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    showNamePublic: false,      // Show name on public reports
    showReportsPublic: true,     // Make reports publicly visible
    emailNotifications: true,    // Receive email updates
    dataRetention: '1year',      // How long to keep data
    consentGiven: true,          // GDPR consent
    consentDate: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Check login and load settings on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadPrivacySettings();
  }, [router]);

  /**
   * Load user's privacy settings from database
   */
  const loadPrivacySettings = async () => {
    try {
      const response = await fetch('/api/user/privacy-settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save privacy settings
   */
  const saveSettings = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Error saving settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Request data export (GDPR right to access)
   */
  const requestDataExport = async () => {
    try {
      const response = await fetch('/api/user/export-data', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Your data export has been requested. You will receive an email with your data within 24 hours.'
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error requesting data export' });
    }
  };

  /**
   * Request account deletion (GDPR right to erasure)
   */
  const requestAccountDeletion = async () => {
    // Double confirmation for safety
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
      return;
    }

    if (!confirm('This will delete all your reports, volunteer hours, and personal data. Continue?')) {
      return;
    }

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        // Clear local storage and redirect to home
        localStorage.removeItem('user');
        router.push('/');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting account' });
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '100px auto', padding: '20px' }}>
      <h1 style={{ color: '#2e7d32' }}>Privacy & Data Settings</h1>

      {/* Message display */}
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

      {/* Privacy Preferences Section */}
      <div style={{
        backgroundColor: '#f9f9f960',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h2>Privacy Preferences</h2>

        <div style={{ margin: '20px 0' }}>
          {/* Show name publicly checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input
              type="checkbox"
              checked={settings.showNamePublic}
              onChange={(e) => setSettings({ ...settings, showNamePublic: e.target.checked })}
            />
            <span>Show my name publicly on reports</span>
          </label>

          {/* Show reports publicly checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input
              type="checkbox"
              checked={settings.showReportsPublic}
              onChange={(e) => setSettings({ ...settings, showReportsPublic: e.target.checked })}
            />
            <span>Make my reports publicly visible</span>
          </label>

          {/* Email notifications checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            />
            <span>Receive email notifications about report updates</span>
          </label>
        </div>

        {/* Data retention dropdown */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Data Retention Period
          </label>
          <select
            value={settings.dataRetention}
            onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
            style={{
              width: '200px',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          >
            <option value="6months">6 months</option>
            <option value="1year">1 year</option>
            <option value="2years">2 years</option>
            <option value="indefinite">Indefinite</option>
          </select>
        </div>

        {/* Save button */}
        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            backgroundColor: saving ? '#ccc' : '#2e7d32',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Data Export Section (GDPR Article 15) */}
      <div style={{
        backgroundColor: '#90a3b8',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h2>Your Data</h2>
        <p style={{ marginBottom: '20px', color: '#444141' }}>
          Under GDPR, you have the right to access and export your data.
        </p>

        <button
          onClick={requestDataExport}
          style={{
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Export My Data
        </button>
      </div>

      {/* Account Deletion Section (GDPR Article 17 - Right to Erasure) */}
      <div style={{
        backgroundColor: '#ffebee',
        padding: '30px',
        borderRadius: '10px'
      }}>
        <h2 style={{ color: '#c62828' }}>Delete Account</h2>
        <p style={{ marginBottom: '20px', color: '#444141' }}>
          Once you delete your account, all your data will be permanently removed. This action cannot be undone.
        </p>

        <button
          onClick={requestAccountDeletion}
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
          Delete My Account
        </button>
      </div>

      {/* GDPR Compliance Notice */}
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#e8f5e9',
        borderRadius: '10px',
        fontSize: '14px',
        color: '#444141'
      }}>
        <p><strong>GDPR Compliance Notice:</strong></p>
        <p>EcoÉire is committed to protecting your privacy. We collect only the data necessary to provide our services. Your data is processed in accordance with the General Data Protection Regulation (GDPR) and the Irish Data Protection Act 2018.</p>
        <p>For any privacy concerns, please contact our Data Protection Officer at privacy@ecoeire.ie</p>
      </div>
    </div>
  );
}