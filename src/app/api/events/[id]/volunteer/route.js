import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

/**
 * POST /api/events/[id]/volunteer
 * Adds a user as volunteer for an event
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { userId } = await request.json();

    const { db } = await connectToDatabase();

    // Add user to event volunteers if not already there
    const result = await db.collection('events').updateOne(
      {
        _id: new ObjectId(id),
        volunteers: { $ne: userId } // Prevent duplicates
      },
      {
        $push: { volunteers: userId }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({
        success: false,
        message: 'Event not found or already volunteered'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: 'Successfully volunteered for event'
    });

  } catch (error) {
    console.error('Volunteer for event error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}