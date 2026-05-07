import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export async function PUT(request) {
  try {
    const userId = cookies().get('userId')?.value;
    if (!userId) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, email, eircode } = await request.json();
    
    if (!name || !email) {
      return Response.json({ success: false, message: 'Name and email are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Check if email is already taken by another user
    const existingUser = await db.collection('users').findOne({
      email,
      _id: { $ne: new ObjectId(userId) }
    });
    
    if (existingUser) {
      return Response.json({ success: false, message: 'Email already in use' }, { status: 400 });
    }
    
    // Update user
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { name, email, eircode: eircode || '', updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    // Get updated user
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );
    
    return Response.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}