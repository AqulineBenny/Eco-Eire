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
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const reports = await db.collection('reports').find({ userId }).toArray();
    const events = await db.collection('events').find({ volunteers: userId }).toArray();

    const userData = { profile: user, reports, events, exportedAt: new Date().toISOString() };
    return Response.json({ success: true, data: userData });
  } catch (error) {
    console.error('Export data error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}