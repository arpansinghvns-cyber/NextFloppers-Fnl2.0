import { BatchItem, ContentItem, CourseOverviewData, TestQuestion } from '../types';
import { ALL_BATCHES } from './batchesData';
import { ensureActiveValidKey, getOrCreateDeviceId, FALLBACK_VERIFIED_KEYS } from './keyService';

const PRIMARY_API = '/api/nig';
const FALLBACK_API = 'https://nts.khatikgaurav38.workers.dev';
const DIRECT_API = 'https://nt.studybeepro.site/api/nig';
const DIRECT_FOY = 'https://nt.studybeepro.site/api/foy';

function getCacheBuster() {
  return `&_t=${Date.now()}`;
}

export { getOrCreateDeviceId, ensureActiveValidKey };

export async function fetchWithFallback(queryString: string, options: RequestInit = {}): Promise<Response> {
  // 1. Try local proxy first (/api/nig)
  try {
    const res = await fetch(PRIMARY_API + queryString, options);
    const contentType = res.headers.get("content-type");
    if (res.ok && (!contentType || !contentType.includes("text/html"))) {
      return res;
    }
  } catch (err) {
    console.warn("Primary Vite proxy failed, trying direct & fallback...", err);
  }

  // 2. Try direct site API
  try {
    const res = await fetch(DIRECT_API + queryString, options);
    const contentType = res.headers.get("content-type");
    if (res.ok && (!contentType || !contentType.includes("text/html"))) {
      return res;
    }
  } catch (err) {
    console.warn("Direct site API failed, trying Cloudflare Worker...", err);
  }

  // 3. Fallback Cloudflare Worker API
  return await fetch(FALLBACK_API + queryString, options);
}

export async function fetchAllBatches(): Promise<BatchItem[]> {
  try {
    const res = await fetch('/batches.json');
    if (res.ok) {
      const data = await res.json();
      const list = [...(data.new || []), ...(data.old || [])];
      if (list.length > 0) return list;
    }
  } catch (e) {
    console.warn("Local batches.json failed, trying direct endpoint...", e);
  }

  try {
    const res = await fetch('https://nt.studybeepro.site/batches.json');
    if (res.ok) {
      const data = await res.json();
      const list = [...(data.new || []), ...(data.old || [])];
      if (list.length > 0) return list;
    }
  } catch (e) {
    console.warn("Remote batches.json failed, falling back to static cache", e);
  }

  return ALL_BATCHES;
}

export async function fetchCourseOverview(courseId: string | number): Promise<CourseOverviewData | null> {
  try {
    const res = await fetchWithFallback(`?overview=${courseId}${getCacheBuster()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.success && json.data) {
      const overviewTab = json.data.find((d: any) => d.type === 'overview');
      const detailsSection = overviewTab?.data?.find((l: any) => l.layout_type === 'details');
      const courseDetails = detailsSection?.layout_data?.[0];

      if (courseDetails) {
        return {
          id: courseDetails.id || courseId,
          title: courseDetails.title || 'Course Details',
          thumbnail: courseDetails.thumbnail,
          description: courseDetails.description || '<p>No description available.</p>'
        };
      }
    }
  } catch (error) {
    console.error("Overview Fetch Error:", error);
  }

  // Fallback info from batch item
  const batch = ALL_BATCHES.find(b => String(b.id) === String(courseId));
  if (batch) {
    return {
      id: batch.id,
      title: batch.title,
      thumbnail: batch.thumbnail,
      description: `<p>Full academic curriculum, recorded lectures, notes, DPPs, and structured folders for ${batch.title}.</p>`
    };
  }

  return null;
}

export async function fetchFolderContent(courseId: string | number, folderId: string | number = "0"): Promise<ContentItem[]> {
  try {
    const res = await fetchWithFallback(`?content=${courseId}&folder=${folderId}${getCacheBuster()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (error) {
    console.error("Folder Content Fetch Error:", error);
  }

  return [];
}

export interface MediaResolutionResult {
  title: string;
  url: string;
  type: 'youtube' | 'hls' | 'mpd' | 'pdf' | 'mp4' | 'external';
  thumbnail?: string;
  duration?: number | string;
  isLive?: boolean;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * Deep search object for a media or PDF url
 */
function deepFindUrl(obj: any): string | null {
  if (!obj) return null;
  const commonKeys = ['file_url', 'url', 'link', 'pdf_link', 'videoUrl', 'aws_url', 'pdf_url'];
  for (const key of commonKeys) {
    if (obj[key] && typeof obj[key] === 'string' && obj[key].length > 5) {
      return obj[key];
    }
  }
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        const found = deepFindUrl(obj[key]);
        if (found) return found;
      }
    }
  }
  return null;
}

/**
 * Enforce media resolution without login
 * Resolves both CloudFront Video HLS (.m3u8) and CloudFront PDF (.pdf) files
 */
export async function resolveMediaContent(
  courseId: string | number,
  contentItem: ContentItem
): Promise<MediaResolutionResult | null> {
  const contentId = contentItem.entity_id;
  const data = contentItem.data || {};
  const devId = getOrCreateDeviceId();

  // 1. Direct file_url if present
  if (data.file_url && data.file_url.trim() !== '') {
    const url = data.file_url;
    const lower = url.toLowerCase();
    const ytId = extractYouTubeId(url);
    if (ytId || data.video_type === 1) {
      return {
        title: contentItem.title,
        url: ytId ? `https://www.youtube.com/watch?v=${ytId}` : url,
        type: 'youtube',
        thumbnail: data.thumbnail || undefined,
        duration: data.duration,
        isLive: data.is_live === 1
      };
    }
    if (lower.includes('.pdf') || data.file_type === 1) {
      return { title: contentItem.title, url, type: 'pdf', thumbnail: data.thumbnail || undefined };
    }
    if (lower.includes('.m3u8')) {
      return { title: contentItem.title, url, type: 'hls', thumbnail: data.thumbnail || undefined, duration: data.duration };
    }
    if (lower.includes('.mpd')) {
      return { title: contentItem.title, url, type: 'mpd', thumbnail: data.thumbnail || undefined, duration: data.duration };
    }
    return { title: contentItem.title, url, type: 'mp4', thumbnail: data.thumbnail || undefined };
  }

  // 2. Check if thumbnail indicates YouTube
  if (data.thumbnail && data.thumbnail.includes('i.ytimg.com/vi/')) {
    const ytMatch = data.thumbnail.match(/i\.ytimg\.com\/vi\/([^/]+)/);
    if (ytMatch && ytMatch[1]) {
      return {
        title: contentItem.title,
        url: `https://www.youtube.com/watch?v=${ytMatch[1]}`,
        type: 'youtube',
        thumbnail: data.thumbnail,
        duration: data.duration,
        isLive: data.is_live === 1
      };
    }
  }

  // 3. Resolve via /api/foy using auto-enforced valid key
  const activeKey = await ensureActiveValidKey();
  const keysToTry = [activeKey, ...FALLBACK_VERIFIED_KEYS];

  for (const testKey of keysToTry) {
    try {
      // Try local proxy /api/foy and fallback to direct https://nt.studybeepro.site/api/foy
      const endpoints = [
        `/api/foy?content_id=${contentId}&course_id=${courseId}&key=${testKey}&device_id=${devId}`,
        `${DIRECT_FOY}?content_id=${contentId}&course_id=${courseId}&key=${testKey}&device_id=${devId}`
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const result = await res.json();
            if (result.status === false && result.reason && result.reason.includes('Key')) {
              continue; // try next key
            }

            const mediaData = result.decryptedData || result.data || {};
            const hasDrmDetails = result.drm_details?.status === true && result.drm_details?.data?.link?.file_url;
            const finalUrl = hasDrmDetails ? result.drm_details.data.link.file_url : (mediaData.file_url || deepFindUrl(result));

            if (finalUrl && finalUrl.trim() !== '') {
              const lower = finalUrl.toLowerCase();
              const ytId = extractYouTubeId(finalUrl);

              if (data.file_type === 1 || mediaData.file_type === 1 || lower.includes('.pdf')) {
                return {
                  title: mediaData.title || contentItem.title,
                  url: finalUrl,
                  type: 'pdf',
                  thumbnail: mediaData.thumbnail || data.thumbnail || undefined
                };
              }

              if (ytId || mediaData.video_type === 1) {
                return {
                  title: mediaData.title || contentItem.title,
                  url: ytId ? `https://www.youtube.com/watch?v=${ytId}` : finalUrl,
                  type: 'youtube',
                  thumbnail: mediaData.thumbnail || data.thumbnail || undefined,
                  duration: mediaData.duration || data.duration,
                  isLive: mediaData.is_live === 1
                };
              }

              if (lower.includes('.m3u8')) {
                return {
                  title: mediaData.title || contentItem.title,
                  url: finalUrl,
                  type: 'hls',
                  thumbnail: mediaData.thumbnail || data.thumbnail || undefined,
                  duration: mediaData.duration || data.duration
                };
              }

              if (lower.includes('.mpd')) {
                return {
                  title: mediaData.title || contentItem.title,
                  url: finalUrl,
                  type: 'mpd',
                  thumbnail: mediaData.thumbnail || data.thumbnail || undefined
                };
              }

              return {
                title: mediaData.title || contentItem.title,
                url: finalUrl,
                type: 'mp4',
                thumbnail: mediaData.thumbnail || data.thumbnail || undefined
              };
            }
          }
        } catch {
          // try next endpoint
        }
      }
    } catch {
      // try next key
    }
  }

  // 4. Check if vdc_id gives HLS path structure
  if (data.vdc_id && typeof data.vdc_id === 'string') {
    const parts = data.vdc_id.split('_');
    if (parts.length >= 2) {
      const channelId = parts[0];
      // Candidate CloudFront HLS link
      const guessedUrl = `https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/${channelId}/index_2.m3u8`;
      return {
        title: contentItem.title,
        url: guessedUrl,
        type: 'hls',
        thumbnail: data.thumbnail || undefined,
        duration: data.duration
      };
    }
  }

  // 5. Fallback if dynamic_link exists
  if (data.dynamic_link) {
    return {
      title: contentItem.title,
      url: data.dynamic_link,
      type: 'external',
      thumbnail: data.thumbnail || undefined
    };
  }

  return null;
}

export async function fetchTestQuestions(testId: string | number): Promise<TestQuestion[]> {
  try {
    const res = await fetchWithFallback(`?test_data=${testId}${getCacheBuster()}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.sections?.[0]?.questions) {
        return json.data.sections[0].questions;
      }
    }
  } catch (e) {
    console.error("Test data fetch error:", e);
  }
  return [];
}
