// Get optimized image URL - ALWAYS use full resolution for quality
export function getOptimizedImageUrl(imageData, size = 'full') {
  if (!imageData) return null;

  // Always prefer full resolution for best quality
  // Airtable's thumbnails are too small and look pixelated
  return imageData.full || imageData.large || imageData.url;
}

// Preload an image
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Check if image URL is valid
export async function isImageValid(url) {
  if (!url) return false;

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType?.startsWith('image/');
  } catch {
    return false;
  }
}
