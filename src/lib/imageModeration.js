import axios from 'axios';

/**
 * Moderates an image using Google Vision API
 * Detects faces, explicit content, text, and labels
 * @param {string} imageBase64 - Base64 encoded image data
 * @returns {Object} - Moderation results
 */
export async function moderateImage(imageBase64) {
  try {
    // Prepare request for Vision API
    // Remove data:image/xyz;base64, prefix if present
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Data
          },
          features: [
            { type: 'FACE_DETECTION', maxResults: 10 },     // Detect faces
            { type: 'LABEL_DETECTION', maxResults: 10 },    // Identify objects
            { type: 'SAFE_SEARCH_DETECTION' },              // Detect explicit content
            { type: 'TEXT_DETECTION' }                       // Detect text/license plates
          ]
        }
      ]
    };

    // Call Google Vision API
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      requestBody
    );

    const result = response.data.responses[0];

    // Check if image contains explicit content
    const isSafe = isImageSafe(result.safeSearchAnnotation);

    return {
      success: true,
      hasFaces: result.faceAnnotations?.length > 0,          // Whether faces were found
      faceCount: result.faceAnnotations?.length || 0,        // Number of faces
      faceAnnotations: result.faceAnnotations || [],         // Face locations for blurring
      safeSearch: result.safeSearchAnnotation || {},         // Explicit content ratings
      labels: result.labelAnnotations || [],                 // Detected objects
      textDetections: result.textAnnotations || [],          // Detected text
      isSafe,                                                 // Whether image is safe
      moderated: true
    };

  } catch (error) {
    console.error('Vision API error:', error);
    // Return safe default if API fails
    return {
      success: false,
      hasFaces: false,
      faceCount: 0,
      faceAnnotations: [],
      safeSearch: {},
      labels: [],
      textDetections: [],
      isSafe: true,
      moderated: false,
      error: error.message
    };
  }
}

/**
 * Determines if image is safe based on SafeSearch results
 * @param {Object} safeSearch - SafeSearch annotation from Vision API
 * @returns {boolean} - Whether image is safe
 */
function isImageSafe(safeSearch) {
  if (!safeSearch) return true;

  // Levels that indicate unsafe content
  const unsafeLevels = ['LIKELY', 'VERY_LIKELY'];

  return !(
    unsafeLevels.includes(safeSearch.adult) ||
    unsafeLevels.includes(safeSearch.violence) ||
    unsafeLevels.includes(safeSearch.racy)
  );
}

/**
 * Generates region data for blurring faces or license plates
 * @param {Array} regions - Array of face annotations or text annotations
 * @returns {Object} - Blurring instructions
 */
export function getBlurRegions(regions) {
  if (!regions || regions.length === 0) {
    return { needsBlurring: false, regions: [] };
  }

  // Convert Vision API bounding boxes to blur regions
  const blurRegions = regions.map(r => {
    const vertices = r.boundingPoly?.vertices || [];
    if (vertices.length >= 2) {
      return {
        x: vertices[0]?.x || 0,
        y: vertices[0]?.y || 0,
        width: (vertices[1]?.x || 0) - (vertices[0]?.x || 0),
        height: (vertices[2]?.y || 0) - (vertices[0]?.y || 0)
      };
    }
    return null;
  }).filter(r => r !== null);

  return {
    needsBlurring: blurRegions.length > 0,
    regions: blurRegions
  };
}