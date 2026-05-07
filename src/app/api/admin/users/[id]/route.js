import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

/**
 * PUT /api/admin/users/[id]
 * Updates user status (suspend/activate)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { action } = await request.json();

    const { db } = await connectToDatabase();

    let update = {};
    if (action === 'suspend') {
      update = { $set: { status: 'suspended', suspendedAt: new Date() } };
    } else if (action === 'activate') {
      update = { $set: { status: 'active' }, $unset: { suspendedAt: "" } };
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      update
    );

    if (result.matchedCount === 0) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: `User ${action}ed successfully`
    });

  } catch (error) {
    console.error('Update user error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Deletes a user (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { db } = await connectToDatabase();

    // Delete user and all their reports
    const session = db.client.startSession();

    try {
      await session.withTransaction(async () => {
        await db.collection('users').deleteOne({ _id: new ObjectId(id) });
        await db.collection('reports').deleteMany({ userId: id });
      });
    } finally {
      await session.endSession();
    }

    return Response.json({
      success: true,
      message: 'User and associated data deleted'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}