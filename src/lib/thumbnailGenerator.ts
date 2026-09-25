import Hls from 'hls.js';

export const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getYouTubeThumbnail = (url: string) => {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : null;
};

/**
 * Capture a frame from an HLS stream.
 * Note: Requires the server to have appropriate CORS headers.
 */
export const captureHLSFrame = async (url: string, seekTime: number = 10): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    
    const cleanup = () => {
      video.pause();
      video.src = "";
      video.load();
      video.remove();
    };

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = seekTime;
      });
      
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            resolve(dataUrl);
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        } catch (err) {
          reject(err);
        } finally {
          hls.destroy();
          cleanup();
        }
      };

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          hls.destroy();
          cleanup();
          reject(new Error(`HLS Error: ${data.details}`));
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native HLS
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = seekTime;
      });
      video.addEventListener('seeked', () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            resolve(dataUrl);
          }
        } catch (err) {
          reject(err);
        } finally {
          cleanup();
        }
      });
    } else {
      reject(new Error('HLS not supported in this browser'));
    }

    // Safety timeout
    setTimeout(() => {
      cleanup();
      reject(new Error('Thumbnail generation timed out'));
    }, 15000);
  });
};
