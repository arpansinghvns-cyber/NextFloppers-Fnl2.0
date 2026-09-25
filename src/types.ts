export interface Lecture {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
  category: string;
  isLive?: boolean;
}

export type Category = 'All' | 'Science' | 'Maths' | 'English' | 'IT' | 'Hindi' | 'SST';

export interface BatchItem {
  id: number | string;
  title: string;
  thumbnail: string;
  category?: string;
  tag?: string;
}

export interface ContentCount {
  free?: number;
  paid?: number;
  total?: number;
  direct?: number;
}

export interface ContentItemData {
  id?: number;
  title?: string;
  parent_id?: number;
  thumbnail?: string | null;
  duration?: number;
  created_at?: number;
  file_url?: string;
  file_type?: number; // 1 = PDF, 2 = Video
  video_type?: number; // 1 = YouTube, 2 = CloudFront/HLS/MPD
  is_live?: number;
  vdc_id?: string | null;
  dynamic_link?: string;
  content_counts?: {
    folders?: ContentCount;
    video?: ContentCount;
    pdf?: ContentCount;
    test?: ContentCount;
    notes?: ContentCount;
  };
}

export interface ContentItem {
  type: 'folder' | 'file' | 'test';
  course_id: string;
  parent_id: number | string;
  entity_id: string;
  title: string;
  data?: ContentItemData;
}

export interface CourseOverviewData {
  id: number | string;
  title: string;
  thumbnail?: string;
  description?: string;
}

export interface QuestionOption {
  key: string;
  label: string;
}

export type ThemeId = 'amber' | 'cyber' | 'purple' | 'emerald' | 'crimson';
export type FontId = 'syne' | 'space' | 'outfit' | 'jakarta' | 'mono' | 'inter';

export interface FlopperNote {
  id: string;
  title: string;
  content: string;
  subject?: string;
  updatedAt: string;
}

export type FlopperTier = 'initiate' | 'crusher' | 'demon' | 'hunter' | 'overlord';

export interface FlopperUser {
  flopperId: string;
  name: string;
  email?: string;
  tier: FlopperTier;
  avatar: string;
  karmaXp: number;
  streakDays: number;
  savedNotes: FlopperNote[];
  enrolledBatches: string[];
  bookmarks: string[];
  isExclusivePassActive: boolean;
  theme: ThemeId;
  font: FontId;
  joinedAt: string;
}

export interface TestQuestion {
  question_group_id: string | number;
  mark_per_question: number;
  negative_marks: number;
  languages: {
    english: {
      question_text: string;
      option_a?: string;
      option_b?: string;
      option_c?: string;
      option_d?: string;
      option_e?: string;
    };
  };
}
