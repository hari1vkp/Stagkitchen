"use client";

import { useEffect, useRef, useState } from 'react';

interface ScrollTextAnimationProps {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'slideUp' | 'typewriter' | 'bounce';
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export default function ScrollTextAnimation({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.8,
  className = '',
  threshold = 0.1,
}: ScrollTextAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay * 1000);
        }
      },
      {
        threshold,
        rootMargin: '50px',
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay, threshold, hasAnimated]);

  const getAnimationClass = () => {
    const baseClass = 'transition-all ease-out';
    const durationClass = `duration-${Math.round(duration * 1000)}`;
    
    if (!isVisible) {
      switch (animation) {
        case 'fadeInUp':
          return `${baseClass} ${durationClass} opacity-0 translate-y-8`;
        case 'fadeInLeft':
          return `${baseClass} ${durationClass} opacity-0 -translate-x-8`;
        case 'fadeInRight':
          return `${baseClass} ${durationClass} opacity-0 translate-x-8`;
        case 'fadeIn':
          return `${baseClass} ${durationClass} opacity-0`;
        case 'slideUp':
          return `${baseClass} ${durationClass} opacity-0 translate-y-12 scale-95`;
        case 'typewriter':
          return `${baseClass} ${durationClass} opacity-0 scale-x-0 origin-left`;
        case 'bounce':
          return `${baseClass} ${durationClass} opacity-0 translate-y-8 scale-90`;
        default:
          return `${baseClass} ${durationClass} opacity-0 translate-y-8`;
      }
    } else {
      switch (animation) {
        case 'fadeInUp':
          return `${baseClass} ${durationClass} opacity-100 translate-y-0`;
        case 'fadeInLeft':
          return `${baseClass} ${durationClass} opacity-100 translate-x-0`;
        case 'fadeInRight':
          return `${baseClass} ${durationClass} opacity-100 translate-x-0`;
        case 'fadeIn':
          return `${baseClass} ${durationClass} opacity-100`;
        case 'slideUp':
          return `${baseClass} ${durationClass} opacity-100 translate-y-0 scale-100`;
        case 'typewriter':
          return `${baseClass} ${durationClass} opacity-100 scale-x-100`;
        case 'bounce':
          return `${baseClass} ${durationClass} opacity-100 translate-y-0 scale-100 animate-bounce-once`;
        default:
          return `${baseClass} ${durationClass} opacity-100 translate-y-0`;
      }
    }
  };

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClass()} ${className}`}
      style={{
        transitionDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
}