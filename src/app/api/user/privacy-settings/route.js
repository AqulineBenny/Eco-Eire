import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const userId = cookies().get('userId')?.value;
    if (!userId) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { privacySettings: 1, createdAt: 1 } }
    );

    const defaultSettings = {
      showNamePublic: false,
      showReportsPublic: true,
      emailNotifications: true,
      dataRetention: '1year',
      consentGiven: true,
      consentDate: user?.createdAt || new Date()
    };

    return Response.json({
      success: true,
      settings: user?.privacySettings || defaultSettings
    });
  } catch (error) {
    console.error('Fetch privacy settings error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userId = cookies().get('userId')?.value;
    const settings = await request.json();

    if (!userId) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { privacySettings: settings, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}