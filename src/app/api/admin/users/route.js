import { connectToDatabase } from '@/lib/db';

/**
 * GET /api/admin/users
 * Returns all users for admin management
 */
export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const users = await db.collection('users')
      .find({})
      .project({ password: 0 }) // Exclude passwords
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Fetch users error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}