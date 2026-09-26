/**
 * CloudFront Stream Relocator and Enforcer
 * Handles auto-detection, query-param sanitization, and candidate relocation
 * across CloudFront CDN mirrors and quality levels (index_2, index_1, index, index_3).
 */

/**
 * CloudFront Stream Relocator and Enforcer
 * Handles auto-detection, query-param sanitization, and candidate relocation
 * across CloudFront CDN mirrors, session-hashed paths, and direct server MP4 streams.
 */

export interface StreamCandidate {
  label: string;
  url: string;
  quality: string;
  isPrimary?: boolean;
}

/**
 * Verified session subfolder hashes for Next Toppers channels on CloudFront.
 * CloudFront S3 bucket returns 403 AccessDenied if this session hash subfolder is omitted!
 */
export const KNOWN_CHANNEL_SESSION_HASHES: Record<string, string> = {
  // Class 10th Science
  '4881584': '179034036890468210315', // Our Environment | L3
  '4879254': '179025372970438210315', // Our Environment | L2
  '4876998': '179016738479518210315', // Our Environment | L1
  '4744328': '177652904649498210315', // Chemical Reactions & Equations - L2
  // Class 10th Maths
  '4882023': '179035273245351664920', // Triangles | L6
  '4874302': '179000549439651664920', // Triangles | L5
  '4872736': '178983219676101664920', // Triangles | L4
  '4871913': '178974595296791664920', // Triangles | L3
  '4867034': '178940277134391664920', // Triangles | L2
  '4865985': '178930376375471664920', // Triangles | L1
  '4745408': '177670074930851664920', // Real Numbers - L1
  // Class 10th SST
  '4745192': '177668871748251304992', // Development - L3
  // Class 10th English
  '4743413': '177642914867145703321', // A Letter to God - L1
};

/**
 * Direct server MP4 video links (normal videos from server) that play with 100% native stability
 */
export const KNOWN_CHANNEL_DIRECT_VIDEOS: Record<string, string> = {
  '4881584': 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4881584/1790347954_5848451452389154/179034036890468210315_720', // Our Environment L3
  '4882023': 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4882023/1790354985_6608697825353337/179035273245351664920_720', // Triangles L6
  '4879254': 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4879254/1790271477_8176999955741434/179025372970438210315_720',
  '4876998': 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4876998/1790184480_9504092967480232/179016738479518210315_720',
  '4874302': 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4874302/1790022743_3323109881288177/179000549439651664920_720',
  '4872736': 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4872736/1789837074_2154795626853901/178983219676101664920_720',
  '4871913': 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4871913/1789753772_7506439599068707/178974595296791664920_720',
  '4867034': 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4867034/1789403322_6402154194497692/178940277134391664920_720',
  '4865985': 'https://dylnd2lqy6eys.cloudfront.net/file_library/videos/download/4865985/1789304176_9919062865665918/178930376375471664920_720',
};

export function cleanStreamUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  // Strip off expired ?start= timestamps or temporary sessions that cause manifest desync
  try {
    const urlObj = new URL(rawUrl);
    if (urlObj.searchParams.has('start')) {
      urlObj.searchParams.delete('start');
    }
    return urlObj.toString();
  } catch {
    return rawUrl.split('?')[0];
  }
}

export function generateStreamCandidates(initialUrl: string): StreamCandidate[] {
  if (!initialUrl) return [];

  const candidates: StreamCandidate[] = [];
  const cleanUrl = cleanStreamUrl(initialUrl);

  // 1. Direct server MP4 video link or download url
  const isDirectMp4 = cleanUrl.includes('.mp4') || cleanUrl.includes('/videos/download/');
  if (isDirectMp4) {
    // Check if we can derive the verified HLS stream from this download URL
    const dlMatch = cleanUrl.match(/\/videos\/download\/(\d+)\/[^/]+\/([^_/]+)/);
    if (dlMatch) {
      const channelId = dlMatch[1];
      const sessionHash = dlMatch[2];
      candidates.push({
        label: 'Adaptive CloudFront HLS Stream (480p)',
        url: `https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/${channelId}/${sessionHash}/index_2.m3u8`,
        quality: '480p Adaptive',
        isPrimary: true
      });
      candidates.push({
        label: 'High Definition HLS (720p)',
        url: `https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/${channelId}/${sessionHash}/index_1.m3u8`,
        quality: '720p HD'
      });
      candidates.push({
        label: 'Full HD HLS (1080p)',
        url: `https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/${channelId}/${sessionHash}/index_3.m3u8`,
        quality: '1080p FHD'
      });
    }
    candidates.push({
      label: 'Direct Server Video Stream',
      url: cleanUrl,
      quality: 'Direct Source',
      isPrimary: !dlMatch
    });
    return candidates;
  }

  const isHls = cleanUrl.includes('.m3u8');
  if (!isHls) {
    return [{ label: 'Direct Media Stream', url: cleanUrl, quality: 'Auto', isPrimary: true }];
  }

  // Check if URL is an incomplete CloudFront URL lacking the session hash (e.g. .../4881584/index_2.m3u8)
  const incompleteMatch = cleanUrl.match(/\/channel_vod_non_drm_hls\/(\d+)\/(index[^/]*\.m3u8)/);
  if (incompleteMatch) {
    const channelId = incompleteMatch[1];
    const indexFile = incompleteMatch[2];
    const sessionHash = KNOWN_CHANNEL_SESSION_HASHES[channelId];

    if (sessionHash) {
      const fixedHls = `https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/${channelId}/${sessionHash}/${indexFile}`;
      candidates.push({
        label: 'Verified HLS Stream (480p Auto)',
        url: fixedHls,
        quality: '480p',
        isPrimary: true
      });
      candidates.push({
        label: 'HD HLS Stream (720p)',
        url: `https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/${channelId}/${sessionHash}/index_1.m3u8`,
        quality: '720p'
      });
    }
  }

  const isDbil3 = cleanUrl.includes('dbil3go8szhu6.cloudfront.net');

  // dbil3go8szhu6 complete session-hashed URLs
  if (isDbil3 && !incompleteMatch) {
    const baseFolder = cleanUrl.substring(0, cleanUrl.lastIndexOf('/') + 1);

    // Always put the exact verified URL as candidate 0
    candidates.push({
      label: 'Verified Direct Stream (Auto Adaptive)',
      url: cleanUrl,
      quality: 'Adaptive Auto',
      isPrimary: true
    });

    if (cleanUrl !== `${baseFolder}index_2.m3u8`) {
      candidates.push({
        label: 'CloudFront Stream 1 (Fast 480p)',
        url: `${baseFolder}index_2.m3u8`,
        quality: '480p'
      });
    }

    if (cleanUrl !== `${baseFolder}index_1.m3u8`) {
      candidates.push({
        label: 'CloudFront Stream 2 (HD 720p)',
        url: `${baseFolder}index_1.m3u8`,
        quality: '720p'
      });
    }

    if (cleanUrl !== `${baseFolder}index_3.m3u8`) {
      candidates.push({
        label: 'CloudFront Stream 3 (1080p)',
        url: `${baseFolder}index_3.m3u8`,
        quality: '1080p'
      });
    }

    // Check if channel has a known direct server MP4 video
    const chanMatch = cleanUrl.match(/\/(\d+)\//);
    if (chanMatch && chanMatch[1] && KNOWN_CHANNEL_DIRECT_VIDEOS[chanMatch[1]]) {
      candidates.push({
        label: 'Server Normal Video (MP4)',
        url: KNOWN_CHANNEL_DIRECT_VIDEOS[chanMatch[1]],
        quality: 'Direct MP4'
      });
    }

    return candidates;
  }

  // d1oxe6vjn5slmc or generic CloudFront HLS endpoints
  if (cleanUrl.includes('index_2.m3u8')) {
    candidates.push({
      label: 'Relocated Stream (Clean 480p)',
      url: cleanUrl,
      quality: '480p',
      isPrimary: true
    });
    candidates.push({
      label: 'Master Playlist (Adaptive)',
      url: cleanUrl.replace('index_2.m3u8', 'index.m3u8'),
      quality: 'Adaptive Auto'
    });
    candidates.push({
      label: 'High Definition (720p)',
      url: cleanUrl.replace('index_2.m3u8', 'index_1.m3u8'),
      quality: '720p'
    });
  } else if (cleanUrl.includes('index.m3u8')) {
    candidates.push({
      label: 'Master Stream (Adaptive)',
      url: cleanUrl,
      quality: 'Adaptive Auto',
      isPrimary: true
    });
    candidates.push({
      label: 'Optimized Level 2 (480p)',
      url: cleanUrl.replace('index.m3u8', 'index_2.m3u8'),
      quality: '480p'
    });
    candidates.push({
      label: 'Optimized Level 1 (720p)',
      url: cleanUrl.replace('index.m3u8', 'index_1.m3u8'),
      quality: '720p'
    });
  } else if (cleanUrl.includes('index_1.m3u8')) {
    candidates.push({
      label: 'High Definition (720p)',
      url: cleanUrl,
      quality: '720p',
      isPrimary: true
    });
    candidates.push({
      label: 'Standard Definition (480p)',
      url: cleanUrl.replace('index_1.m3u8', 'index_2.m3u8'),
      quality: '480p'
    });
    candidates.push({
      label: 'Master Playlist',
      url: cleanUrl.replace('index_1.m3u8', 'index.m3u8'),
      quality: 'Adaptive Auto'
    });
  } else {
    candidates.push({
      label: 'Enforced Direct Stream',
      url: cleanUrl,
      quality: 'Direct',
      isPrimary: true
    });
  }

  // StudyBee & StudyPanda gateways
  candidates.push({
    label: 'StudyBee Pro Verified Node',
    url: `https://nt.studybeepro.site/api/foy?stream_url=${encodeURIComponent(cleanUrl)}`,
    quality: 'StudyBee Relay'
  });
  candidates.push({
    label: 'StudyPanda Live Node',
    url: `https://studypanda.live/nt/api/foy?stream_url=${encodeURIComponent(cleanUrl)}`,
    quality: 'StudyPanda Relay'
  });

  // If initial URL had query parameters, also keep that as an explicit candidate
  if (initialUrl !== cleanUrl) {
    candidates.push({
      label: 'Timestamp Offset Stream (Source)',
      url: initialUrl,
      quality: 'Custom'
    });
  }

  return candidates;
}

/**
 * Fast ping check to verify if a candidate URL returns 200 OK
 */
export async function probeCandidateUrl(url: string, timeoutMs: number = 3000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-100' },
      signal: controller.signal
    });
    clearTimeout(timer);
    return res.ok || res.status === 206;
  } catch {
    clearTimeout(timer);
    return false;
  }
}
