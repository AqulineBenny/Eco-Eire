import { moderateImage } from '@/lib/imageModeration';

/**
 * POST /api/moderate-image
 * Moderates an image using Google Vision API
 * Body: { image: "base64 encoded image" }
 */
export async function POST(request) {
  try {
    // Parse request body
    const { image } = await request.json();

    // Validate input
    if (!image) {
      return Response.json({
        success: false,
        message: 'No image provided'
      }, { status: 400 });
    }

    // Moderate the image using our service
    const moderationResult = await moderateImage(image);

    // Return results
    return Response.json({
      success: true,
      ...moderationResult
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return Response.json({
      success: false,
      message: 'Error moderating image'
    }, { status: 500 });
  }
}