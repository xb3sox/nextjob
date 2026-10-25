import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export type ImageFormat = 'avif' | 'webp' | 'png' | 'jpg' | 'jpeg';

export interface ArtDirectionSource {
  media: string;
  src: string;
  width?: number;
  height?: number;
  widths?: number[];
  formats?: ImageFormat[];
  sizes?: string;
}

export interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'placeholder'> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string | number;
  sizes?: string;
  widths?: number[];
  priority?: boolean;
  formats?: ImageFormat[];
  artDirection?: ArtDirectionSource[];
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  className?: string;
  pictureClassName?: string;
  style?: React.CSSProperties;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const DEFAULT_DEVICE_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048];
export const DEFAULT_FORMATS: ImageFormat[] = ['avif', 'webp'];

/**
 * Helper to construct a URL for a given format and optional width.
 * If the source URL already contains query parameters or extension, it transforms it accordingly.
 */
export function getOptimizedImageUrl(
  baseSrc: string,
  format?: ImageFormat,
  width?: number
): string {
  if (!baseSrc) return '';

  let url: string;

  // Handle data URLs or blobs directly
  if (baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
    return baseSrc;
  }

  // Check if URL has existing query parameters or path extension
  const [path, queryString] = baseSrc.split('?');

  if (format) {
    const extIndex = path.lastIndexOf('.');
    if (extIndex !== -1 && !path.slice(extIndex).includes('/')) {
      const basePath = path.slice(0, extIndex);
      url = `${basePath}.${format}`;
    } else {
      url = `${path}.${format}`;
    }
  } else {
    url = path;
  }

  const params = new URLSearchParams(queryString || '');
  if (width) {
    params.set('w', width.toString());
  }

  const finalQuery = params.toString();
  return finalQuery ? `${url}?${finalQuery}` : url;
}

/**
 * Helper to generate srcset string for a set of widths and format.
 */
export function generateSrcSet(
  baseSrc: string,
  format?: ImageFormat,
  widths: number[] = DEFAULT_DEVICE_WIDTHS
): string {
  return widths.map((w) => `${getOptimizedImageUrl(baseSrc, format, w)} ${w}w`).join(', ');
}

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      aspectRatio,
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      widths = DEFAULT_DEVICE_WIDTHS,
      priority = false,
      formats = DEFAULT_FORMATS,
      artDirection,
      placeholder = 'empty',
      blurDataURL,
      className,
      pictureClassName,
      style,
      onLoad,
      onError,
      ...restProps
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true);
      if (onLoad) onLoad(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(true);
      if (onError) onError(e);
    };

    // Calculate aspect ratio string to prevent Layout Shift (CLS)
    let calculatedAspectRatio: string | undefined;
    if (aspectRatio) {
      calculatedAspectRatio = typeof aspectRatio === 'number' ? `${aspectRatio}` : aspectRatio;
    } else if (width && height && !Number.isNaN(Number(width)) && !Number.isNaN(Number(height))) {
      calculatedAspectRatio = `${width} / ${height}`;
    }

    // Default blur placeholder if requested but no blurDataURL provided
    const defaultBlurDataURL =
      'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"%3E%3Crect width="100%" height="100%" fill="%23334155"/%3E%3C/svg%3E';

    const effectiveBlurUrl = blurDataURL || defaultBlurDataURL;

    const blurStyle: React.CSSProperties =
      placeholder === 'blur' && !isLoaded
        ? {
            backgroundImage: `url("${effectiveBlurUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transition: 'filter 0.3s ease-out, opacity 0.3s ease-out',
          }
        : {
            filter: 'blur(0px)',
            transition: 'filter 0.3s ease-out, opacity 0.3s ease-out',
          };

    const combinedStyle: React.CSSProperties = {
      ...(calculatedAspectRatio ? { aspectRatio: calculatedAspectRatio } : {}),
      ...blurStyle,
      ...style,
    };

    const defaultSrcSet = generateSrcSet(src, undefined, widths);

    return (
      <picture className={cn('inline-block overflow-hidden relative', pictureClassName)}>
        {/* Art Direction Sources */}
        {artDirection?.map((art) => {
          const artFormats = art.formats || formats;
          const artWidths = art.widths || widths;
          const artSizes = art.sizes || sizes;

          return (
            <React.Fragment key={`art-${art.media}-${art.src}`}>
              {artFormats.map((fmt) => (
                <source
                  key={`art-${art.media}-${fmt}`}
                  media={art.media}
                  type={`image/${fmt}`}
                  srcSet={generateSrcSet(art.src, fmt, artWidths)}
                  sizes={artSizes}
                  width={art.width}
                  height={art.height}
                />
              ))}
              <source
                media={art.media}
                srcSet={generateSrcSet(art.src, undefined, artWidths)}
                sizes={artSizes}
                width={art.width}
                height={art.height}
              />
            </React.Fragment>
          );
        })}

        {/* Standard Format Sources (AVIF, WebP, etc.) */}
        {formats.map((fmt) => (
          <source
            key={fmt}
            type={`image/${fmt}`}
            srcSet={generateSrcSet(src, fmt, widths)}
            sizes={sizes}
            width={width}
            height={height}
          />
        ))}

        {/* Fallback Image */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          width={width}
          height={height}
          srcSet={defaultSrcSet}
          sizes={sizes}
          loading={(priority ? 'eager' : 'lazy') as 'eager' | 'lazy'}
          fetchPriority={(priority ? 'high' : 'auto') as 'high' | 'auto' | 'low'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={combinedStyle}
          className={cn(
            'w-full h-auto object-cover transition-all duration-300',
            placeholder === 'blur' && !isLoaded && 'scale-105 blur-md',
            placeholder === 'blur' && isLoaded && 'scale-100 blur-0',
            hasError && 'opacity-50 grayscale',
            className
          )}
          {...restProps}
        />
      </picture>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';
