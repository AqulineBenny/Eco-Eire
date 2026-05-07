import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const userId = cookies().get('userId')?.value;
    if (!userId) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const session = db.client.startSession();

    try {
      await session.withTransaction(async () => {
        await db.collection('reports').deleteMany({ userId });
        await db.collection('events').updateMany(
          { volunteers: userId },
          { $pull: { volunteers: userId } }
        );
        await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
      });
    } finally {
      await session.endSession();
    }

    cookies().delete('userId');
    cookies().delete('userRole');

    return Response.json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    console.error('Delete account error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}