
// Image optimization service to improve loading times

// Configuration for different image sizes
export const imageSizes = {
  thumbnail: { width: 100, height: 100 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 }
};

// Get optimal image size based on device
export const getOptimalImageSize = (
  originalWidth: number,
  originalHeight: number,
  targetSize: keyof typeof imageSizes = 'medium'
): { width: number; height: number } => {
  const maxDimensions = imageSizes[targetSize];
  
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight;
  
  let width = maxDimensions.width;
  let height = maxDimensions.height;
  
  // Maintain aspect ratio
  if (width / height > aspectRatio) {
    width = height * aspectRatio;
  } else {
    height = width / aspectRatio;
  }
  
  return { 
    width: Math.round(width), 
    height: Math.round(height)
  };
};

// Generate optimized image URL with dimensions
export const getOptimizedImageUrl = (
  url: string,
  size: keyof typeof imageSizes = 'medium'
): string => {
  // For external image optimization services like Cloudinary or Imgix
  // you would return a transformed URL here
  
  // For now, we'll just append a size parameter for demonstration
  return `${url}?size=${size}`;
};

// Function to preload important images
export const preloadCriticalImages = (imageUrls: string[]): void => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Lazy load images that are not immediately visible
export const setupLazyLoading = (): void => {
  // Check if IntersectionObserver is available
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    // Simply load all images immediately
    const lazyImages = document.querySelectorAll('[data-src]');
    lazyImages.forEach(img => {
      const image = img as HTMLImageElement;
      if (image.dataset.src) {
        image.src = image.dataset.src;
        image.removeAttribute('data-src');
      }
    });
  }
};

// Component to render an optimized image
export const OptimizedImage = (props: {
  src: string;
  alt: string;
  size?: keyof typeof imageSizes;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
}) => {
  const { src, alt, size = 'medium', width, height, className = '', lazy = true } = props;
  
  // Determine final dimensions
  const dimensions = width && height 
    ? { width, height } 
    : getOptimalImageSize(width || 800, height || 600, size);
  
  // Generate optimized URL
  const optimizedSrc = getOptimizedImageUrl(src, size);
  
  if (lazy) {
    // Return image with data-src for lazy loading
    return {
      tag: 'img',
      attributes: {
        'data-src': optimizedSrc,
        src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', // Tiny transparent placeholder
        alt,
        width: dimensions.width,
        height: dimensions.height,
        className: `transition-opacity duration-300 opacity-0 onload="this.classList.add('opacity-100')" ${className}`,
        loading: 'lazy'
      }
    };
  } else {
    // Return image without lazy loading for critical images
    return {
      tag: 'img',
      attributes: {
        src: optimizedSrc,
        alt,
        width: dimensions.width,
        height: dimensions.height,
        className
      }
    };
  }
};

// Add image optimization to the window load event
window.addEventListener('load', () => {
  // Set up lazy loading for images with data-src attribute
  setupLazyLoading();
});
