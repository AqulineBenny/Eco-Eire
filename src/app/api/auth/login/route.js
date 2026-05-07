import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcrypt';  // Keep your bcrypt
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return Response.json({
        success: false,
        message: 'User not found'
      });
    }

    // Using bcrypt as you prefer
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return Response.json({
        success: false,
        message: 'Wrong password'
      });
    }

    // Set HTTP-only cookie for authentication
    cookies().set('userId', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    // Set a non-http cookie for client-side access to user role
    cookies().set('userRole', user.role || 'user', {
      httpOnly: false, // Client can read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    // Remove password before sending
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({
      success: false,
      message: 'Server error'
    });
  }
}