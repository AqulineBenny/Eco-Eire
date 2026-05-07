import { connectToDatabase } from '@/lib/db';

/**
 * GET /api/reports/public
 * Returns all public reports for map display
 * Filters out rejected reports for public view
 */
export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch all reports except rejected ones
    // Sort by newest first
    const reports = await db.collection('reports')
      .find({
        status: { $ne: 'rejected' } // Exclude rejected reports
      })
      .sort({ createdAt: -1 })
      .limit(500) // Limit for performance
      .toArray();

    return Response.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error('Fetch public reports error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}