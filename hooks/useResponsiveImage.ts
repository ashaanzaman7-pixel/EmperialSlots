
import React from 'react';
import { ImageSettings } from '../types';

export const useResponsiveImage = (settings?: ImageSettings) => {
  // Removed responsive logic (mobile/tablet/desktop/fixed) as requested.
  // This hook now simply returns the styles based on the base configuration.

  const getResponsiveStyle = () => {
    if (!settings) return {};

    // Ensure fallback values to prevent "undefinedpx" invalid CSS
    const positionX = settings.positionX || 0;
    const positionY = settings.positionY || 0;
    const scale = settings.scale || 1;
    const opacity = settings.opacity ?? 1;

    const baseStyle: React.CSSProperties = {
      transform: `translate(${positionX}px, ${positionY}px) scale(${scale})`,
      opacity: opacity,
      transition: 'all 0.3s ease-out',
    };

    return baseStyle;
  };

  return { getResponsiveStyle, currentSettings: settings };
};
