import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

/**
 * PUT /api/admin/reports/[id]/status
 * Updates report status
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { status, comment, updatedBy } = await request.json();

    const { db } = await connectToDatabase();

    const result = await db.collection('reports').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status,
            comment,
            updatedBy: new ObjectId(updatedBy),
            timestamp: new Date()
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({
        success: false,
        message: 'Report not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: 'Status updated'
    });

  } catch (error) {
    console.error('Update status error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}