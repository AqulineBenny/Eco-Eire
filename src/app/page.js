export default function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* Logo - Smaller size */}
      <div style={{ marginTop: '10px', marginBottom: '20px' }}>
        <img 
          src="/logo.png" 
          alt="EcoÉire Logo" 
          style={{ 
            width: '140px', 
            height: 'auto',
            marginBottom: '10px'
          }} 
        />
      </div>
      <p style={{ fontSize: '18px', color: '#555', margin: '20px 0' }}>
        Report issues in your community and help keep Ireland clean.
      </p>
      
      <div style={{ marginTop: '40px' }}>
        <a 
          href="/report" 
          style={{
            backgroundColor: '#2e7d32',
            color: 'white',
            padding: '12px 30px',
            textDecoration: 'none',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          Report Issue
        </a>
        <a 
          href="/register" 
          style={{
            backgroundColor: 'white',
            color: '#2e7d32',
            padding: '12px 30px',
            textDecoration: 'none',
            borderRadius: '5px',
            border: '2px solid #2e7d32'
          }}
        >
          Join Now
        </a>
      </div>
      
      <div style={{ marginTop: '60px', padding: '0 20px' }}>
        <h2>How It Works</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px' }}>
          <div style={{ width: '200px' }}>
            <h3>1. Report</h3>
            <p>Report issues like potholes or rubbish</p>
          </div>
          <div style={{ width: '200px' }}>
            <h3>2. Volunteer</h3>
            <p>Join cleanup events in your area</p>
          </div>
          <div style={{ width: '200px' }}>
            <h3>3. Track</h3>
            <p>See issues getting fixed</p>
          </div>
        </div>
      </div>
    </div>
  );
}