import { useState, useEffect } from 'react';
import { getYouTubeThumbnail, captureHLSFrame } from '../lib/thumbnailGenerator';

export const useThumbnail = (videoUrl: string, initialThumbnail?: string) => {
  const [thumbnail, setThumbnail] = useState<string | undefined>(initialThumbnail);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // If we already have a functional thumbnail, no need to generate
    if (initialThumbnail && initialThumbnail.startsWith('http')) {
      setThumbnail(initialThumbnail);
      return;
    }

    const generate = async () => {
      // 1. Try YouTube
      const ytThumb = getYouTubeThumbnail(videoUrl);
      if (ytThumb) {
        setThumbnail(ytThumb);
        return;
      }

      // 2. Try HLS Capture if it's an m3u8
      if (videoUrl.includes('.m3u8')) {
        setIsGenerating(true);
        try {
          // Check cache - use a more unique key to avoid collisions between similar URLs
          const cacheKey = `thumb_v3_${btoa(videoUrl).slice(-64)}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setThumbnail(cached);
          } else {
            const captured = await captureHLSFrame(videoUrl, 30); // Capture at 30s for stabilized classroom visual
            setThumbnail(captured);
            localStorage.setItem(cacheKey, captured);
          }
        } catch (err) {
          console.warn('Failed to generate HLS thumbnail:', err);
          // Fallback to a nice gradient or placeholder if needed
        } finally {
          setIsGenerating(false);
        }
      }
    };

    generate();
  }, [videoUrl, initialThumbnail]);

  return { thumbnail, isGenerating };
};
