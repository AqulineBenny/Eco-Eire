import { connectToDatabase } from '@/lib/db';

/**
 * GET /api/admin/reports
 * Returns all reports with user details for admin
 */
export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const reports = await db.collection('reports')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $addFields: {
            userName: { $arrayElemAt: ['$user.name', 0] },
            userEmail: { $arrayElemAt: ['$user.email', 0] }
          }
        },
        {
          $project: { user: 0 }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    return Response.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error('Fetch admin reports error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}