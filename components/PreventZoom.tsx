'use client';

import { useEffect } from 'react';

export default function PreventZoom() {
  useEffect(() => {
    // Prevent pinch zoom ONLY (allow single-finger swipes)
    const preventPinchZoom = (e: TouchEvent) => {
      // Only prevent if there are 2 or more touches (pinch gesture)
      if (e.touches.length > 1) {
        e.preventDefault();
      }
      // Single touch is allowed - this preserves swipe gestures
    };

    // Prevent double-tap zoom, but allow single tap
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      // Only prevent if it's within 300ms and not on an input/button
      const target = e.target as HTMLElement;
      const isInteractive = target.tagName === 'INPUT' ||
                           target.tagName === 'BUTTON' ||
                           target.tagName === 'A' ||
                           target.closest('button') !== null ||
                           target.closest('a') !== null;

      if (now - lastTouchEnd <= 300 && !isInteractive) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Prevent iOS gesture events (pinch/rotate)
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    // Add event listeners with passive: false to allow preventDefault
    document.addEventListener('touchmove', preventPinchZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
    document.addEventListener('gesturestart', preventGesture);
    document.addEventListener('gesturechange', preventGesture);
    document.addEventListener('gestureend', preventGesture);

    // Cleanup
    return () => {
      document.removeEventListener('touchmove', preventPinchZoom);
      document.removeEventListener('touchend', preventDoubleTapZoom);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  return null;
}
