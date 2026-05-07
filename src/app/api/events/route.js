import { connectToDatabase } from '@/lib/db';

/**
 * GET /api/events
 * Returns all upcoming events
 */
export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get current date for filtering
    const now = new Date();

    // Fetch upcoming events, sorted by date
    const events = await db.collection('events')
      .find({
        date: { $gte: now }, // Only future events
        status: 'upcoming'
      })
      .sort({ date: 1 }) // Soonest first
      .toArray();

    return Response.json({
      success: true,
      events
    });

  } catch (error) {
    console.error('Fetch events error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}