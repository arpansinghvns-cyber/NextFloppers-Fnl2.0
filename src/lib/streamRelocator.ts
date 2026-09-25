/**
 * CloudFront Stream Relocator and Enforcer
 * Handles auto-detection, query-param sanitization, and candidate relocation
 * across CloudFront CDN mirrors and quality levels (index_2, index_1, index, index_3).
 */

export interface StreamCandidate {
  label: string;
  url: string;
  quality: string;
  isPrimary?: boolean;
}

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

  const isHls = cleanUrl.includes('.m3u8');
  if (!isHls) {
    return [{ label: 'Direct Media Stream', url: cleanUrl, quality: 'Auto', isPrimary: true }];
  }

  const isDbil3 = cleanUrl.includes('dbil3go8szhu6.cloudfront.net');
  const isD1oxe = cleanUrl.includes('d1oxe6vjn5slmc.cloudfront.net');

  // dbil3go8szhu6 index.m3u8 returns 403 AccessDenied, but index_2 and index_1 return 200!
  if (isDbil3) {
    const baseFolder = cleanUrl.substring(0, cleanUrl.lastIndexOf('/') + 1);
    candidates.push({
      label: 'CloudFront Stream 1 (Fast 480p)',
      url: `${baseFolder}index_2.m3u8`,
      quality: '480p',
      isPrimary: true
    });
    candidates.push({
      label: 'CloudFront Stream 2 (HD 720p)',
      url: `${baseFolder}index_1.m3u8`,
      quality: '720p'
    });
    candidates.push({
      label: 'CloudFront Stream 3 (1080p)',
      url: `${baseFolder}index_3.m3u8`,
      quality: '1080p'
    });
    // Add original if different
    if (!candidates.some(c => c.url === cleanUrl)) {
      candidates.push({
        label: 'Original Transmission Link',
        url: cleanUrl,
        quality: 'Source'
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
