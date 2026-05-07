import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

/**
 * POST /api/events/create
 * Creates a new community event
 */
export async function POST(request) {
  try {
    const eventData = await request.json();

    const { db } = await connectToDatabase();

    // Prepare event document
    const event = {
      ...eventData,
      date: new Date(eventData.date),
      volunteers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    const result = await db.collection('events').insertOne(event);

    return Response.json({
      success: true,
      event: { ...event, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Create event error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}