'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  // State management
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxVolunteers: 10,
    category: 'cleanup'
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check login and fetch events on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchEvents();
  }, [router]);

  /**
   * Fetch all upcoming events
   */
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new community event
   */
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          createdBy: user._id,
          volunteers: [],
          status: 'upcoming'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Reset form and hide it
        setShowCreateForm(false);
        setNewEvent({
          title: '',
          description: '',
          date: '',
          location: '',
          maxVolunteers: 10,
          category: 'cleanup'
        });
        // Refresh events list
        fetchEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  /**
   * Sign up to volunteer for an event
   */
  const handleVolunteer = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh events to show updated volunteer count
        fetchEvents();
      }
    } catch (error) {
      console.error('Error volunteering:', error);
    }
  };

  /**
   * Log volunteer hours after event participation
   */
  const logVolunteerHours = async (eventId, hours) => {
    try {
      const response = await fetch('/api/volunteer/log-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          eventId,
          hours,
          date: new Date()
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Logged ${hours} volunteer hours!`);
        // Update user in localStorage
        const updatedUser = { ...user, volunteerHours: (user.volunteerHours || 0) + hours };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error logging hours:', error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '100px auto', padding: '20px' }}>
      {/* Header with create button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2e7d32' }}>Community Events</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {/* Event creation form */}
      {showCreateForm && (
        <div style={{
          padding: '30px',
          borderRadius: '10px',
          marginBottom: '40px'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Create New Event</h2>
          <form onSubmit={handleCreateEvent}>
            {/* Title field */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Event Title
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
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

            {/* Description field */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                required
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
            </div>

            {/* Date field */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
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

            {/* Location field */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Location
              </label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                required
                placeholder="Address or meeting point"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
            </div>

            {/* Category dropdown */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Category
              </label>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              >
                <option value="cleanup">Cleanup</option>
                <option value="planting">Tree Planting</option>
                <option value="recycling">Recycling Drive</option>
                <option value="awareness">Awareness Campaign</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Max volunteers field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Maximum Volunteers
              </label>
              <input
                type="number"
                value={newEvent.maxVolunteers}
                onChange={(e) => setNewEvent({ ...newEvent, maxVolunteers: parseInt(e.target.value) })}
                min="1"
                max="100"
                style={{
                  width: '100px',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              style={{
                backgroundColor: '#2e7d32',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Create Event
            </button>
          </form>
        </div>
      )}

      {/* Events list */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Upcoming Events</h2>
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {events.map((event) => (
            <div
              key={event._id}
              style={{
                border: '1px solid #1bdad7',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#12686b'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#8fc13e' }}>{event.title}</h3>
                  <p style={{ margin: '5px 0' }}>{event.description}</p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>📅 Date:</strong> {new Date(event.date).toLocaleString()}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>📍 Location:</strong> {event.location}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>👥 Volunteers:</strong> {event.volunteers?.length || 0}/{event.maxVolunteers}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>🏷️ Category:</strong> {event.category}
                  </p>
                </div>

                {/* Volunteer button or status */}
                <div>
                  {event.volunteers?.includes(user?._id) ? (
                    <div>
                      <span style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}>
                        ✓ Joined
                      </span>
                      {/* Log hours button after event */}
                      <button
                        onClick={() => {
                          const hours = prompt('Enter hours volunteered:', '2');
                          if (hours) logVolunteerHours(event._id, parseInt(hours));
                        }}
                        style={{
                          marginLeft: '10px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          padding: '5px 15px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Log Hours
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVolunteer(event._id)}
                      disabled={event.volunteers?.length >= event.maxVolunteers}
                      style={{
                        backgroundColor: event.volunteers?.length >= event.maxVolunteers ? '#ccc' : '#2e7d32',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: event.volunteers?.length >= event.maxVolunteers ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {event.volunteers?.length >= event.maxVolunteers ? 'Full' : 'Volunteer'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer hours summary */}
      <div>
        <h2>My Volunteer Hours</h2>
        <div style={{
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #36f33c',
          backgroundColor: '#4db056',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0' }}>
            {user?.volunteerHours || 0}
          </p>
          <p style={{ fontSize: '18px', color: '#444141' }}>Total Hours Contributed</p>
        </div>
      </div>
    </div>
  );
}