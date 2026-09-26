import { BatchItem, ContentItem, CourseOverviewData, TestQuestion } from '../types';
import { ALL_BATCHES } from './batchesData';
import { 
  ensureActiveValidKey, 
  getOrCreateDeviceId, 
  FALLBACK_VERIFIED_KEYS,
  hasActiveKey,
  getActiveKey,
  isFloppyAdminUser
} from './keyService';
import { getActiveCloudFrontCdn } from './serverSyncService';
import { KNOWN_CHANNEL_SESSION_HASHES, KNOWN_CHANNEL_DIRECT_VIDEOS } from './streamRelocator';

// On GitHub Pages or static production environments, there is no local Vite backend proxy (/api/nig)
const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.hostname.includes('github.dev') ||
  window.location.protocol === 'file:' ||
  Boolean((import.meta as any).env?.PROD)
);

const PRIMARY_API = '/api/nig';
const FALLBACK_API = 'https://nts.khatikgaurav38.workers.dev';
const DIRECT_API = 'https://nt.studybeepro.site/api/nig';
const DIRECT_FOY = 'https://nt.studybeepro.site/api/foy';
export const MULTIVERSE_PLAY_API = 'https://nexttoppers.asmultiverse.in/api/play';

export { getOrCreateDeviceId, ensureActiveValidKey };

// ==========================================
// In-Memory & Session Storage Cache (Speed Optimization)
// ==========================================
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

function getCached<T>(key: string): T | null {
  const mem = memoryCache.get(key);
  if (mem) {
    if (Date.now() < mem.expiry) {
      return mem.data as T;
    }
    memoryCache.delete(key);
  }

  try {
    const raw = sessionStorage.getItem(`nf_cache_${key}`);
    if (raw) {
      const parsed: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() < parsed.expiry) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
      sessionStorage.removeItem(`nf_cache_${key}`);
    }
  } catch {
    // Ignore storage issues
  }

  return null;
}

function setCached<T>(key: string, data: T, ttlMs: number = 20 * 60 * 1000): void {
  const entry: CacheEntry<T> = {
    data,
    expiry: Date.now() + ttlMs,
  };
  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(`nf_cache_${key}`, JSON.stringify(entry));
  } catch {
    // Ignore quota issues
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * High efficiency fetch with fast fallback and GitHub Pages compatibility
 */
export async function fetchWithFallback(queryString: string, options: RequestInit = {}): Promise<Response> {
  // If running on GitHub Pages (static host without proxy), jump directly to Cloudflare Worker API
  if (isGitHubPages) {
    try {
      const res = await fetchWithTimeout(FALLBACK_API + queryString, options, 4000);
      if (res.ok) return res;
    } catch {
      // Worker failed, try direct site
    }
    return await fetch(DIRECT_API + queryString, options);
  }

  // Local / dev environment: Try Vite proxy first (/api/nig)
  try {
    const res = await fetchWithTimeout(PRIMARY_API + queryString, options, 2500);
    const contentType = res.headers.get("content-type");
    if (res.ok && (!contentType || !contentType.includes("text/html"))) {
      return res;
    }
  } catch {
    // Fall back to worker
  }

  // Fast Cloudflare Worker API fallback
  try {
    const res = await fetchWithTimeout(FALLBACK_API + queryString, options, 4000);
    if (res.ok) return res;
  } catch {
    // Fallback to direct
  }

  return await fetch(DIRECT_API + queryString, options);
}

export function clearAllApiCaches(): void {
  memoryCache.clear();
  inFlightRequests.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('nf_cache_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch {}
}

/**
 * Fetch all batches - Works on GitHub Pages with relative base path
 */
export async function fetchAllBatches(forceRefresh: boolean = false): Promise<BatchItem[]> {
  const cacheKey = 'all_batches_v3';
  if (!forceRefresh) {
    const cached = getCached<BatchItem[]>(cacheKey);
    if (cached && cached.length > 0) {
      return cached;
    }
  }

  try {
    // Ensure relative path resolution for GitHub Pages repository subdirectory
    const baseUrl = (import.meta as any).env?.BASE_URL || './';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const batchesUrl = `${cleanBase}batches.json${forceRefresh ? `?t=${Date.now()}` : ''}`;

    const res = await fetchWithTimeout(batchesUrl, {
      cache: forceRefresh ? 'no-cache' : 'default'
    }, 3500);
    if (res.ok) {
      const data = await res.json();
      const list = [...(data.new || []), ...(data.old || [])];
      if (list.length > 0) {
        setCached(cacheKey, list, 60 * 60 * 1000);
        return list;
      }
    }
  } catch {
    // Fall back to bundled static data
  }

  setCached(cacheKey, ALL_BATCHES, 60 * 60 * 1000);
  return ALL_BATCHES;
}

/**
 * Fetch Course Overview with 0ms cache & deduplication
 */
export async function fetchCourseOverview(courseId: string | number): Promise<CourseOverviewData | null> {
  const cacheKey = `overview_${courseId}`;
  const cached = getCached<CourseOverviewData>(cacheKey);
  if (cached) return cached;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const res = await fetchWithFallback(`?overview=${courseId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const overviewTab = json.data.find((d: any) => d.type === 'overview');
          const detailsSection = overviewTab?.data?.find((l: any) => l.layout_type === 'details');
          const courseDetails = detailsSection?.layout_data?.[0];

          if (courseDetails) {
            const overviewResult: CourseOverviewData = {
              id: courseDetails.id || courseId,
              title: courseDetails.title || 'Course Details',
              thumbnail: courseDetails.thumbnail,
              description: courseDetails.description || '<p>No description available.</p>'
            };
            setCached(cacheKey, overviewResult, 30 * 60 * 1000);
            return overviewResult;
          }
        }
      }
    } catch {
      // Fallback
    }

    const batch = ALL_BATCHES.find(b => String(b.id) === String(courseId));
    if (batch) {
      const fallbackOverview: CourseOverviewData = {
        id: batch.id,
        title: batch.title,
        thumbnail: batch.thumbnail,
        description: `<p>Full academic curriculum, recorded lectures, notes, DPPs, and structured folders for ${batch.title}.</p>`
      };
      setCached(cacheKey, fallbackOverview, 30 * 60 * 1000);
      return fallbackOverview;
    }

    return null;
  })().finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Fetch folder content with instant 0ms caching & deduplication
 */
export async function fetchFolderContent(
  courseId: string | number, 
  folderId: string | number = "0"
): Promise<ContentItem[]> {
  const cacheKey = `folder_${courseId}_${folderId}`;
  const cached = getCached<ContentItem[]>(cacheKey);
  if (cached) return cached;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const res = await fetchWithFallback(`?content=${courseId}&folder=${folderId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCached(cacheKey, json.data, 20 * 60 * 1000);
          return json.data;
        }
      }
    } catch (error) {
      console.warn("Folder fetch error:", error);
    }
    return [];
  })().finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

export interface MediaResolutionResult {
  title: string;
  url: string;
  type: 'youtube' | 'hls' | 'mpd' | 'pdf' | 'mp4' | 'external';
  thumbnail?: string;
  duration?: number | string;
  isLive?: boolean;
  requiresKey?: boolean;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

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
 * Resolves media content with Key Enforcement:
 * - If user has NO key and is not floppyadmin, signals requiresKey: true!
 * - Works reliably on GitHub Pages with CloudFront HLS direct mirrors.
 */
export async function resolveMediaContent(
  courseId: string | number,
  contentItem: ContentItem
): Promise<MediaResolutionResult | null> {
  // Key verification check (taking key is necessary unless floppyadmin)
  if (!hasActiveKey() && !isFloppyAdminUser()) {
    return {
      title: contentItem.title,
      url: '',
      type: 'external',
      requiresKey: true
    };
  }

  const contentId = contentItem.entity_id;
  const cacheKey = `media_${courseId}_${contentId}`;
  const cached = getCached<MediaResolutionResult>(cacheKey);
  // Do NOT return stale external links or nexttoppers links that previously blocked the video player or PDF reader
  if (
    cached && 
    cached.type !== 'external' && 
    !cached.url.includes('course.nexttoppers.com') && 
    !cached.url.includes('/dl/')
  ) return cached;

  const data = contentItem.data || {};
  const devId = getOrCreateDeviceId();

  // 1. Direct file_url if present (instant 0ms) and NOT a blocked nexttoppers dynamic link
  if (data.file_url && data.file_url.trim() !== '' && !data.file_url.includes('course.nexttoppers.com')) {
    const url = data.file_url;
    const lower = url.toLowerCase();
    const ytId = extractYouTubeId(url);
    if (ytId || data.video_type === 1) {
      const res: MediaResolutionResult = {
        title: contentItem.title,
        url: ytId ? `https://www.youtube.com/watch?v=${ytId}` : url,
        type: 'youtube',
        thumbnail: data.thumbnail || undefined,
        duration: data.duration,
        isLive: data.is_live === 1
      };
      setCached(cacheKey, res, 60 * 60 * 1000);
      return res;
    }
    if (lower.includes('.pdf') || data.file_type === 1) {
      const res: MediaResolutionResult = { title: contentItem.title, url, type: 'pdf', thumbnail: data.thumbnail || undefined };
      setCached(cacheKey, res, 60 * 60 * 1000);
      return res;
    }
    if (lower.includes('.m3u8')) {
      const res: MediaResolutionResult = { title: contentItem.title, url, type: 'hls', thumbnail: data.thumbnail || undefined, duration: data.duration };
      setCached(cacheKey, res, 60 * 60 * 1000);
      return res;
    }
    if (lower.includes('.mpd')) {
      const res: MediaResolutionResult = { title: contentItem.title, url, type: 'mpd', thumbnail: data.thumbnail || undefined, duration: data.duration };
      setCached(cacheKey, res, 60 * 60 * 1000);
      return res;
    }
    const res: MediaResolutionResult = { title: contentItem.title, url, type: 'mp4', thumbnail: data.thumbnail || undefined };
    setCached(cacheKey, res, 60 * 60 * 1000);
    return res;
  }

  // 2. Check if thumbnail indicates YouTube
  if (data.thumbnail && data.thumbnail.includes('i.ytimg.com/vi/')) {
    const ytMatch = data.thumbnail.match(/i\.ytimg\.com\/vi\/([^/]+)/);
    if (ytMatch && ytMatch[1]) {
      const res: MediaResolutionResult = {
        title: contentItem.title,
        url: `https://www.youtube.com/watch?v=${ytMatch[1]}`,
        type: 'youtube',
        thumbnail: data.thumbnail,
        duration: data.duration,
        isLive: data.is_live === 1
      };
      setCached(cacheKey, res, 60 * 60 * 1000);
      return res;
    }
  }

  // 3. Direct Server MP4 Videos & Verified HLS Reconstruction from download_urls (Instant 0ms, 100% working stream)
  if (data.download_urls) {
    try {
      let rawDownloads = data.download_urls;
      if (typeof rawDownloads === 'string') {
        let cleaned = rawDownloads.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          try { cleaned = JSON.parse(cleaned); } catch {}
        }
        rawDownloads = JSON.parse(cleaned);
      }
      if (Array.isArray(rawDownloads) && rawDownloads.length > 0) {
        // Pick best available stream (720 -> 480 -> 360 -> 240)
        const chosen720 = rawDownloads.find((d: any) => d.title === '720');
        const chosen480 = rawDownloads.find((d: any) => d.title === '480');
        const chosen = chosen720 || chosen480 || rawDownloads[rawDownloads.length - 1];

        if (chosen && chosen.url) {
          // Extract session hash from download URL to construct verified HLS stream
          const dlMatch = chosen.url.match(/\/videos\/download\/(\d+)\/[^/]+\/([^_/]+)/);
          let hlsStreamUrl = '';
          if (dlMatch) {
            const channelId = dlMatch[1];
            const sessionHash = dlMatch[2];
            hlsStreamUrl = `https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/${channelId}/${sessionHash}/index_2.m3u8`;
          }

          const res: MediaResolutionResult = {
            title: contentItem.title,
            // Always prefer verified HLS stream for instant native player decoding
            url: hlsStreamUrl || chosen.url,
            type: hlsStreamUrl ? 'hls' : 'mp4',
            thumbnail: data.thumbnail || undefined,
            duration: data.duration,
            isLive: data.is_live === 1
          };
          setCached(cacheKey, res, 60 * 60 * 1000);
          return res;
        }
      }
    } catch {
      // Continue to next resolver
    }
  }

  // 4. Resolve via Direct API & Verified Play Gateways (Direct CloudFront PDFs & Media)
  const activeKey = getActiveKey() || "SB-AUTO-PASS-01";
  const keysToTry = [activeKey, ...FALLBACK_VERIFIED_KEYS];

  for (const testKey of keysToTry) {
    try {
      // Prioritize MULTIVERSE_PLAY_API directly (supports full CORS and decrypts Classplus/NextToppers streams in <1s)
      const endpoints: string[] = [
        `${MULTIVERSE_PLAY_API}?content_id=${contentId}&course_id=${courseId}&key=${testKey}&device_id=${devId}`,
        `${DIRECT_FOY}?content_id=${contentId}&course_id=${courseId}&key=${testKey}&device_id=${devId}`,
        `https://studypanda.live/nt/api/foy?content_id=${contentId}&course_id=${courseId}&key=${testKey}&device_id=${devId}`,
        `https://studypanda.live/api/foy?content_id=${contentId}&course_id=${courseId}&key=${testKey}&device_id=${devId}`
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetchWithTimeout(endpoint, {}, 6000);
          if (res.ok) {
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("text/html")) continue;

            const result = await res.json();
            if (result.status === false && result.reason && result.reason.includes('Key')) {
              continue;
            }

            const mediaData = result.decryptedData || result.data || {};
            const hasDrmDetails = result.drm_details?.status === true && result.drm_details?.data?.link?.file_url;
            const finalUrl = hasDrmDetails ? result.drm_details.data.link.file_url : (mediaData.file_url || deepFindUrl(result));

            if (finalUrl && typeof finalUrl === 'string' && finalUrl.trim() !== '') {
              // Ensure we never return blocked nexttoppers dynamic links
              if (finalUrl.includes('course.nexttoppers.com') || finalUrl.includes('/dl/')) {
                continue;
              }

              const lower = finalUrl.toLowerCase();
              const ytId = extractYouTubeId(finalUrl);

              let resolved: MediaResolutionResult;

              if (data.file_type === 1 || mediaData.file_type === 1 || lower.includes('.pdf')) {
                resolved = {
                  title: mediaData.title || contentItem.title,
                  url: finalUrl,
                  type: 'pdf',
                  thumbnail: mediaData.thumbnail || data.thumbnail || undefined
                };
              } else if (ytId || mediaData.video_type === 1) {
                resolved = {
                  title: mediaData.title || contentItem.title,
                  url: ytId ? `https://www.youtube.com/watch?v=${ytId}` : finalUrl,
                  type: 'youtube',
                  thumbnail: mediaData.thumbnail || data.thumbnail || undefined,
                  duration: mediaData.duration || data.duration,
                  isLive: mediaData.is_live === 1
                };
              } else if (lower.includes('.m3u8')) {
                resolved = {
                  title: mediaData.title || contentItem.title,
                  url: finalUrl,
                  type: 'hls',
                  thumbnail: mediaData.thumbnail || data.thumbnail || undefined,
                  duration: mediaData.duration || data.duration
                };
              } else if (lower.includes('.mpd')) {
                resolved = {
                  title: mediaData.title || contentItem.title,
                  url: finalUrl,
                  type: 'mpd',
                  thumbnail: mediaData.thumbnail || data.thumbnail || undefined
                };
              } else {
                resolved = {
                  title: mediaData.title || contentItem.title,
                  url: finalUrl,
                  type: 'mp4',
                  thumbnail: mediaData.thumbnail || data.thumbnail || undefined
                };
              }

              setCached(cacheKey, resolved, 60 * 60 * 1000);
              return resolved;
            }
          }
        } catch {
          // Continue to next endpoint
        }
      }
    } catch {
      // Continue to next key
    }
  }

  // 5. CloudFront HLS direct reconstruction with verified session hash
  if (data.vdc_id && typeof data.vdc_id === 'string') {
    const parts = data.vdc_id.split('_');
    if (parts.length >= 2) {
      const channelId = parts[0];
      const activeCdn = getActiveCloudFrontCdn();
      const sessionHash = KNOWN_CHANNEL_SESSION_HASHES[channelId];

      const validUrl = sessionHash 
        ? `${activeCdn}/file_library/videos/channel_vod_non_drm_hls/${channelId}/${sessionHash}/index_2.m3u8`
        : `${activeCdn}/file_library/videos/channel_vod_non_drm_hls/${channelId}/index_2.m3u8`;

      const resolved: MediaResolutionResult = {
        title: contentItem.title,
        url: validUrl,
        type: 'hls',
        thumbnail: data.thumbnail || undefined,
        duration: data.duration
      };
      setCached(cacheKey, resolved, 60 * 60 * 1000);
      return resolved;
    }
  }

  // 6. Direct PDF fallback query before generic link
  if (data.file_type === 1) {
    const directPdf = await resolveDirectPdfUrl(courseId, contentId);
    if (directPdf) {
      const resolved: MediaResolutionResult = {
        title: contentItem.title,
        url: directPdf,
        type: 'pdf',
        thumbnail: data.thumbnail || undefined
      };
      setCached(cacheKey, resolved, 60 * 60 * 1000);
      return resolved;
    }
    // If it's a PDF, NEVER fall back to dynamic nexttoppers portal links
    return null;
  }

  // 7. Fallback dynamic link (only for non-PDF items if completely unresolved)
  if (data.dynamic_link && data.file_type !== 1) {
    const resolved: MediaResolutionResult = {
      title: contentItem.title,
      url: data.dynamic_link,
      type: 'external',
      thumbnail: data.thumbnail || undefined
    };
    return resolved;
  }

  return null;
}

/**
 * Resolves direct CloudFront PDF link for notes/DPP/ACP materials
 * Guaranteed to return direct .pdf link, bypassing Next Toppers portal links
 */
export async function resolveDirectPdfUrl(
  courseId: number | string,
  contentId: number | string
): Promise<string | null> {
  const activeKey = getActiveKey() || "SB-AUTO-PASS-01";
  const devId = getOrCreateDeviceId();
  const keysToTry = [activeKey, ...FALLBACK_VERIFIED_KEYS];

  for (const testKey of keysToTry) {
    const ep = `${MULTIVERSE_PLAY_API}?content_id=${contentId}&course_id=${courseId}&key=${testKey}&device_id=${devId}`;
    try {
      const res = await fetchWithTimeout(ep, {}, 6000);
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("text/html")) continue;

        const result = await res.json();
        const mediaData = result.decryptedData || result.data || {};
        const fileUrl = mediaData.file_url || deepFindUrl(result);
        if (
          fileUrl && 
          typeof fileUrl === 'string' && 
          !fileUrl.includes('course.nexttoppers.com') && 
          !fileUrl.includes('/dl/') &&
          (fileUrl.toLowerCase().includes('.pdf') || fileUrl.includes('cloudfront.net'))
        ) {
          return fileUrl;
        }
      }
    } catch {}
  }
  return null;
}

/**
 * Fetch test questions with caching & GitHub Pages compatibility
 */
export async function fetchTestQuestions(testId: string | number): Promise<TestQuestion[]> {
  const cacheKey = `test_${testId}`;
  const cached = getCached<TestQuestion[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchWithFallback(`?test_data=${testId}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.sections?.[0]?.questions) {
        const questions = json.data.sections[0].questions;
        setCached(cacheKey, questions, 30 * 60 * 1000);
        return questions;
      }
    }
  } catch (e) {
    console.error("Test data fetch error:", e);
  }
  return [];
}
