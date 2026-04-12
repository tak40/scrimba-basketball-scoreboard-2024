import { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

export default function DishImage({
  image,
  alt,
  type = 'card', // 'card' | 'hero'
  className = ''
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Get appropriate image URL based on type
  const imageUrl = getOptimizedImageUrl(image, type === 'card' ? 'small' : 'large');

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Determine aspect ratio and height based on type
  const containerClasses = type === 'hero'
    ? 'w-full h-[280px]'
    : 'w-full aspect-square';

  const showPlaceholder = !imageUrl || hasError;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-ss-light-gray ${containerClasses} ${className}`}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Actual image or placeholder */}
      {isInView && (
        showPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ss-light-gray">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className="w-16 h-16 text-ss-border"
              fill="currentColor"
            >
              <circle cx="50" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M35 40 Q50 55 65 40" fill="none" stroke="currentColor" strokeWidth="2"/>
              <ellipse cx="50" cy="75" rx="30" ry="10" fill="none" stroke="currentColor" strokeWidth="2"/>
              <line x1="50" y1="60" x2="50" y2="65" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
          />
        )
      )}

      {/* Gradient overlay for hero images */}
      {type === 'hero' && !showPlaceholder && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
