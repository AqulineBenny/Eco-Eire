import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

/**
 * POST /api/volunteer/log-hours
 * Logs volunteer hours for a user
 */
export async function POST(request) {
  try {
    const { userId, eventId, hours, date } = await request.json();

    const { db } = await connectToDatabase();

    // Update user's total volunteer hours
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { volunteerHours: hours },
        $push: {
          volunteerHistory: {
            eventId: new ObjectId(eventId),
            hours,
            date: new Date(date),
            loggedAt: new Date()
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: 'Hours logged successfully'
    });

  } catch (error) {
    console.error('Log hours error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}