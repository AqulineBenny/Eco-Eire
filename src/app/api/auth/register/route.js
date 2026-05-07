import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { name, email, password, eircode } = await request.json();

    const { db } = await connectToDatabase();

    // Check if user exists
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return Response.json({
        success: false,
        message: 'Email already used'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      name,
      email,
      password: hashedPassword,
      eircode,
      role: 'user',
      createdAt: new Date(),
      reportsCount: 0,
      volunteerHours: 0
    };

    // Insert user - this will create collection if it doesn't exist
    const result = await db.collection('users').insertOne(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      user: { ...userWithoutPassword, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Register error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    });
  }
}