import type React from 'react';
import { useScrollAnimation } from '../../hooks/use-scroll-animation';

export type AnimationVariant =
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-up'
  | 'none';

export interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationVariant;
  distance?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  className?: string;
  as?: React.ElementType;
  'data-testid'?: string;
  id?: string;
}

export function AnimatedSection({
  children,
  animation = 'slide-up',
  distance = 24,
  duration = 600,
  delay = 0,
  threshold = 0.15,
  rootMargin = '0px 0px -50px 0px',
  once = true,
  className = '',
  as: Component = 'section',
  'data-testid': testId,
  id,
}: AnimatedSectionProps) {
  const { ref, isVisible, prefersReducedMotion } = useScrollAnimation<HTMLElement>({
    threshold,
    rootMargin,
    triggerOnce: once,
  });

  const getInitialTransform = (): string => {
    if (prefersReducedMotion || animation === 'none' || animation === 'fade-in') return 'none';

    switch (animation) {
      case 'slide-up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'slide-down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'slide-left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'slide-right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'scale-up':
        return 'scale3d(0.95, 0.95, 1)';
      default:
        return 'none';
    }
  };

  const shouldAnimate = !prefersReducedMotion && animation !== 'none';

  return (
    <Component
      ref={ref}
      id={id}
      data-testid={testId}
      className={`scroll-gpu scroll-reveal-base ${isVisible ? 'scroll-reveal-visible' : ''} ${className}`}
      style={{
        opacity: isVisible || prefersReducedMotion ? 1 : 0,
        transform: isVisible || prefersReducedMotion ? 'none' : getInitialTransform(),
        transitionProperty: shouldAnimate ? 'opacity, transform' : 'none',
        transitionDuration: shouldAnimate ? `${duration}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: shouldAnimate ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </Component>
  );
}
