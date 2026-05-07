import { connectToDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const { db } = await connectToDatabase();

    // Get reports - if collection doesn't exist yet, it will be empty
    const reports = await db.collection('reports')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error('List reports error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    });
  }
}