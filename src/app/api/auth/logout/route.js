import { cookies } from 'next/headers';

export async function POST() {
  // Clear all auth cookies
  cookies().delete('userId');
  cookies().delete('userRole');

  return Response.json({
    success: true,
    message: 'Logged out successfully'
  });
}