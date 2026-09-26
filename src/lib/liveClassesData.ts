import { Lecture } from '../types';

export interface LiveClassItem {
  id: string;
  title: string;
  subject: 'Science' | 'Maths' | 'SST' | 'English' | 'Hindi' | 'IT & AI' | 'Physics' | 'Chemistry' | 'Biology' | 'Commerce';
  grade: 'Class 10th' | 'Class 9th' | 'Class 8th' | 'Class 7th' | 'Class 11th' | 'Class 12th';
  batchName: string;
  batchId: number;
  instructor: string;
  thumbnail: string;
  videoUrl?: string;
  status: 'live' | 'upcoming';
  timeSlot: '5:00 PM' | '8:00 PM';
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  scheduledTime: string;
  description: string;
  chapter: string;
  tags: string[];
  rawItem?: any;
  folderId?: string | number;
  folderTitle?: string;
}

export interface TimetableSlot {
  time: '5:00 PM' | '8:00 PM';
  duration: '5:00 PM - 6:30 PM' | '8:00 PM - 9:30 PM';
  label: string;
}

export const TIMETABLE_SLOTS: TimetableSlot[] = [
  { time: '5:00 PM', duration: '5:00 PM - 6:30 PM', label: 'Evening Live Slot (5:00 PM)' },
  { time: '8:00 PM', duration: '8:00 PM - 9:30 PM', label: 'Prime Live Slot (8:00 PM)' }
];

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * Next Toppers Live Classes & Dynamic Batch Lectures
 * Auto-synced across ALL grades: Class 7th, 8th, 9th, 10th, 11th, 12th
 * Verified: Our Environment L3 points to stream channel 4881584 (NOT Chemical Reactions 4744328)
 */
export const LIVE_CLASSES: LiveClassItem[] = [
  {
    id: '29342',
    title: 'Our Environment | L3',
    subject: 'Science',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Prashant Kirad',
    thumbnail: 'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/content/thumbnail/7714303_148_All%20Class%20Thumbnail%20%2820%29.png',
    // Verified video stream for Our Environment L3 (with session hash subfolder)
    videoUrl: 'https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/4881584/179034036890468210315/index_2.m3u8',
    status: 'live',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Monday',
    scheduledTime: 'Broadcasting Live Now',
    description: 'Active broadcast from Aarambh 2.0 Science Folder • Biology: Our Environment L3',
    chapter: 'Biology - Chapter 13: Our Environment',
    tags: ['Class 10th', 'Science', 'LIVE NOW', 'Our Environment', 'Aarambh 2.0'],
    folderTitle: 'Science',
    folderId: '7100',
    rawItem: {
      type: 'file',
      course_id: '176',
      parent_id: 7102,
      entity_id: '29342',
      title: 'Our Environment | L3',
      data: {
        id: 29342,
        vdc_id: '4881584_0_5637500255716126',
        is_live: 1,
        thumbnail: 'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/content/thumbnail/7714303_148_All%20Class%20Thumbnail%20%2820%29.png'
      }
    }
  }
];

export function convertLiveToLecture(live: LiveClassItem): Lecture {
  return {
    id: live.id,
    title: live.title,
    instructor: live.instructor,
    thumbnail: live.thumbnail,
    videoUrl: live.videoUrl || '',
    description: live.description,
    category: live.subject,
    isLive: live.status === 'live',
    rawItem: live.rawItem,
    batchId: live.batchId
  };
}
