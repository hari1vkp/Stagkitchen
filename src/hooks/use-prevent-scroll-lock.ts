import { useEffect } from 'react';

export function usePreventScrollLock() {
  useEffect(() => {
    // Store original overflow style
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Create a MutationObserver to watch for changes to body styles
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          if (target === document.body) {
            // If body overflow is set to hidden, override it
            if (document.body.style.overflow === 'hidden') {
              document.body.style.overflow = 'auto';
            }
            // Reset any padding-right that might be added for scrollbar compensation
            if (document.body.style.paddingRight && document.body.style.paddingRight !== originalPaddingRight) {
              document.body.style.paddingRight = originalPaddingRight;
            }
          }
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Also watch for data attributes that Radix might add
    const dataObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName?.startsWith('data-')) {
          // Force body to remain scrollable
          if (document.body.style.overflow === 'hidden') {
            document.body.style.overflow = 'auto';
          }
        }
      });
    });

    dataObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked', 'data-radix-scroll-area-viewport']
    });

    return () => {
      observer.disconnect();
      dataObserver.disconnect();
      // Restore original styles
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);
}