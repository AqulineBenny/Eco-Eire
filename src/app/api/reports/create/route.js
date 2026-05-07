import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const report = await request.json();

    const { db } = await connectToDatabase();

    // Prepare report data
    const reportData = {
      ...report,
      createdAt: new Date(report.createdAt || Date.now()),
      updatedAt: new Date(report.updatedAt || Date.now()),
      statusHistory: report.statusHistory || []
    };

    // Handle statusHistory timestamp if it exists
    if (reportData.statusHistory && reportData.statusHistory.length > 0) {
      reportData.statusHistory[0].timestamp = new Date(reportData.statusHistory[0].timestamp || Date.now());
    }

    // Insert report into reports collection
    const result = await db.collection('reports').insertOne(reportData);

    // Increment user's report count
    if (report.userId) {
      const updateResult = await db.collection('users').updateOne(
        { _id: new ObjectId(report.userId) },
        { $inc: { reportsCount: 1 } }
      );
      console.log('User report count updated:', updateResult.modifiedCount);
    }

    // Return success with created report
    return Response.json({
      success: true,
      report: { ...reportData, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Create report error:', error);
    return Response.json({
      success: false,
      message: 'Server error: ' + error.message
    }, { status: 500 });
  }
}