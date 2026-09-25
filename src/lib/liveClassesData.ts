import { Lecture } from '../types';

export interface LiveClassItem {
  id: string;
  title: string;
  subject: 'Science' | 'Maths' | 'SST' | 'English' | 'Hindi';
  grade: 'Class 10th' | 'Class 9th';
  batchName: string;
  batchId: number;
  instructor: string;
  thumbnail: string;
  videoUrl?: string;
  status: 'live' | 'upcoming';
  timeSlot: '5:00 PM' | '8:00 PM';
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  scheduledTime: string; // e.g. "Today, 5:00 PM - 6:30 PM"
  description: string;
  chapter: string;
  tags: string[];
}

export interface TimetableSlot {
  time: '5:00 PM' | '8:00 PM';
  duration: '5:00 PM - 6:30 PM' | '8:00 PM - 9:30 PM';
  label: string;
}

export const TIMETABLE_SLOTS: TimetableSlot[] = [
  { time: '5:00 PM', duration: '5:00 PM - 6:30 PM', label: 'Evening Slot 1 (5:00 PM)' },
  { time: '8:00 PM', duration: '8:00 PM - 9:30 PM', label: 'Prime Slot 2 (8:00 PM)' }
];

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

// Next Toppers Class 9 & Class 10 Official Timetable & Live Broadcast Schedule
// Strictly scheduled at 5:00 PM and 8:00 PM - NO fake live broadcasts, NO fake watching metrics
export const LIVE_CLASSES: LiveClassItem[] = [
  // ================= CLASS 10TH (AARAMBH 2.0 10TH BATCH 26-27 - ID: 176) =================
  {
    id: 'c10-mon-5pm',
    title: 'Chemical Reactions & Equations - Balancing & Redox Reactions',
    subject: 'Science',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Prashant Kirad',
    thumbnail: 'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/356423_125_10th%20aarambh%202.0%20banner%20app%202.jpg',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Monday',
    scheduledTime: 'Today, 5:00 PM - 6:30 PM',
    description: 'Live interactive problem solving on chemical equations, types of reactions, oxidation-reduction tricks, and board exam predictions.',
    chapter: 'Chapter 01 - Chemical Reactions and Equations',
    tags: ['Class 10th', 'Science', '5:00 PM Slot', 'CBSE 2026']
  },
  {
    id: 'c10-mon-8pm',
    title: 'Real Numbers - Fundamental Theorem of Arithmetic & Irrational Proofs',
    subject: 'Maths',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Shobhit Nirwan',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Monday',
    scheduledTime: 'Today, 8:00 PM - 9:30 PM',
    description: 'Master HCF & LCM word problems, prime factorization theorems, and step-by-step proofs for irrationality with full marks presentation.',
    chapter: 'Chapter 01 - Real Numbers',
    tags: ['Class 10th', 'Maths', '8:00 PM Slot', 'Proofs']
  },
  {
    id: 'c10-tue-5pm',
    title: 'Resources and Development - Classification & Soil Conservation',
    subject: 'SST',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Digraj Singh Rajput',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Tuesday',
    scheduledTime: 'Tomorrow, 5:00 PM - 6:30 PM',
    description: 'Detailed analysis of sustainable development, Agenda 21, land degradation factors, and India soil types mapping session.',
    chapter: 'Geography - Chapter 01: Resources and Development',
    tags: ['Class 10th', 'SST', 'Geography', '5:00 PM Slot']
  },
  {
    id: 'c10-tue-8pm',
    title: 'Light - Reflection and Refraction (Mirror Formula & Ray Diagrams)',
    subject: 'Science',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Prashant Kirad',
    thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Tuesday',
    scheduledTime: 'Tomorrow, 8:00 PM - 9:30 PM',
    description: 'Precision ray diagram practice for concave and convex mirrors, Cartesian sign convention rules, and numerical problem solving.',
    chapter: 'Physics - Chapter 09: Light Reflection & Refraction',
    tags: ['Class 10th', 'Science', 'Physics', '8:00 PM Slot']
  },
  {
    id: 'c10-wed-5pm',
    title: 'Power Sharing - Belgian Model vs Sri Lankan Majoritarianism',
    subject: 'SST',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Digraj Singh Rajput',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Wednesday',
    scheduledTime: 'Wednesday, 5:00 PM - 6:30 PM',
    description: 'In-depth comparative study of ethnic compositions, constitutional accommodations, and prudential vs moral reasons of power sharing.',
    chapter: 'Civics - Chapter 01: Power Sharing',
    tags: ['Class 10th', 'SST', 'Civics', '5:00 PM Slot']
  },
  {
    id: 'c10-wed-8pm',
    title: 'Polynomials - Geometric Meaning of Zeroes & Coefficients Relationship',
    subject: 'Maths',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Shobhit Nirwan',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Wednesday',
    scheduledTime: 'Wednesday, 8:00 PM - 9:30 PM',
    description: 'Live problem solving on zeroes of quadratic and cubic polynomials, sum & product verification, and previous 5 years board MCQs.',
    chapter: 'Chapter 02 - Polynomials',
    tags: ['Class 10th', 'Maths', 'Algebra', '8:00 PM Slot']
  },
  {
    id: 'c10-thu-5pm',
    title: 'Life Processes - Nutrition in Plants & Animals Live Walkthrough',
    subject: 'Science',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Prashant Kirad',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Thursday',
    scheduledTime: 'Thursday, 5:00 PM - 6:30 PM',
    description: 'Photosynthesis mechanisms, human alimentary canal diagram breakdown, digestive enzymes action, and NCERT exemplar live doubts.',
    chapter: 'Biology - Chapter 05: Life Processes',
    tags: ['Class 10th', 'Science', 'Biology', '5:00 PM Slot']
  },
  {
    id: 'c10-thu-8pm',
    title: 'Development - Income vs Other Goals & World Development Reports',
    subject: 'SST',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Digraj Singh Rajput',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Thursday',
    scheduledTime: 'Thursday, 8:00 PM - 9:30 PM',
    description: 'Human Development Index (HDI) parameters, per capita income calculation criteria, sustainability of development case studies.',
    chapter: 'Economics - Chapter 01: Development',
    tags: ['Class 10th', 'SST', 'Economics', '8:00 PM Slot']
  },
  {
    id: 'c10-fri-5pm',
    title: 'Acids, Bases and Salts - Indicators & Neutralization Experiments',
    subject: 'Science',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Prashant Kirad',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Friday',
    scheduledTime: 'Friday, 5:00 PM - 6:30 PM',
    description: 'Olfactory & synthetic indicators, metal reaction with acids, pH scale in daily life, and preparation of bleaching powder & baking soda.',
    chapter: 'Chemistry - Chapter 02: Acids, Bases and Salts',
    tags: ['Class 10th', 'Science', 'Chemistry', '5:00 PM Slot']
  },
  {
    id: 'c10-fri-8pm',
    title: 'Pair of Linear Equations in Two Variables - Graphical & Substitution Methods',
    subject: 'Maths',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Shobhit Nirwan',
    thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Friday',
    scheduledTime: 'Friday, 8:00 PM - 9:30 PM',
    description: 'Consistent vs inconsistent systems, algebraic elimination & substitution methods, speed word problems on upstream/downstream.',
    chapter: 'Chapter 03 - Pair of Linear Equations',
    tags: ['Class 10th', 'Maths', '8:00 PM Slot']
  },
  {
    id: 'c10-sat-5pm',
    title: 'English - A Letter to God & Dust of Snow (Extracted Q&A + Writing Skills)',
    subject: 'English',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Aarambh English Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Saturday',
    scheduledTime: 'Saturday, 5:00 PM - 6:30 PM',
    description: 'Deep dive into Lencho’s character irony, poetic devices in Frost’s poetry, formal letter writing format with perfect CBSE scoring tips.',
    chapter: 'First Flight - Prose & Poetry 01',
    tags: ['Class 10th', 'English', '5:00 PM Slot']
  },
  {
    id: 'c10-sat-8pm',
    title: 'Federalism - Key Features & Decentralization in India',
    subject: 'SST',
    grade: 'Class 10th',
    batchName: 'AARAMBH 2.0 10th BATCH 26-27',
    batchId: 176,
    instructor: 'Digraj Singh Rajput',
    thumbnail: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Saturday',
    scheduledTime: 'Saturday, 8:00 PM - 9:30 PM',
    description: 'Holding together vs coming together federations, Union/State/Concurrent lists, linguistic states creation, and Panchayati Raj 73rd amendment.',
    chapter: 'Civics - Chapter 02: Federalism',
    tags: ['Class 10th', 'SST', 'Civics', '8:00 PM Slot']
  },

  // ================= CLASS 9TH (AARAMBH 2.0 9TH BATCH 26-27 - ID: 178) =================
  {
    id: 'c9-mon-5pm',
    title: 'Matter in Our Surroundings - Physical Nature of Matter & Diffusion',
    subject: 'Science',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th Science Faculty',
    thumbnail: 'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/4330317_125_9th%20aarambh%202.0%20banner%20app%202.jpg',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Monday',
    scheduledTime: 'Today, 5:00 PM - 6:30 PM',
    description: 'States of matter comparison, intermolecular attraction forces, Brownian motion experiments, and temperature conversion formulas.',
    chapter: 'Chapter 01 - Matter in Our Surroundings',
    tags: ['Class 9th', 'Science', '5:00 PM Slot', 'Aarambh 9th']
  },
  {
    id: 'c9-mon-8pm',
    title: 'Number Systems - Rational vs Irrational Numbers & Real Line Representation',
    subject: 'Maths',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th Maths Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Monday',
    scheduledTime: 'Today, 8:00 PM - 9:30 PM',
    description: 'Representation of √x on number line, laws of rational exponents, and rationalizing denominators with algebraic conjugates.',
    chapter: 'Chapter 01 - Number Systems',
    tags: ['Class 9th', 'Maths', '8:00 PM Slot', 'Aarambh 9th']
  },
  {
    id: 'c9-tue-5pm',
    title: 'India - Size and Location (Latitudinal Extent & Standard Meridian)',
    subject: 'SST',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th SST Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Tuesday',
    scheduledTime: 'Tomorrow, 5:00 PM - 6:30 PM',
    description: 'Strategic location of India in South Asia, Indian Standard Time calculation (82°30’ E), neighboring countries map analysis.',
    chapter: 'Geography - Chapter 01: India - Size & Location',
    tags: ['Class 9th', 'SST', 'Geography', '5:00 PM Slot']
  },
  {
    id: 'c9-tue-8pm',
    title: 'The Fundamental Unit of Life - Cell Membrane, Cytoplasm & Organelles',
    subject: 'Science',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th Science Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Tuesday',
    scheduledTime: 'Tomorrow, 8:00 PM - 9:30 PM',
    description: 'Prokaryotic vs Eukaryotic cells, osmosis & hypotonic/hypertonic reactions, Mitochondria ATP synthesis, and Golgi apparatus.',
    chapter: 'Biology - Chapter 05: Fundamental Unit of Life',
    tags: ['Class 9th', 'Science', 'Biology', '8:00 PM Slot']
  },
  {
    id: 'c9-wed-5pm',
    title: 'Polynomials 9th - Factor Theorem & Remainder Theorem Verification',
    subject: 'Maths',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th Maths Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Wednesday',
    scheduledTime: 'Wednesday, 5:00 PM - 6:30 PM',
    description: 'Splitting middle term factoring method, algebraic identities expansions, and algebraic remainder calculation.',
    chapter: 'Chapter 02 - Polynomials',
    tags: ['Class 9th', 'Maths', '5:00 PM Slot']
  },
  {
    id: 'c9-wed-8pm',
    title: 'The French Revolution - Causes of the Revolution & Estates General',
    subject: 'SST',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th SST Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Wednesday',
    scheduledTime: 'Wednesday, 8:00 PM - 9:30 PM',
    description: 'Old Regime social order, subsistence crisis, storming of the Bastille, and declaration of the rights of man and citizen.',
    chapter: 'History - Chapter 01: The French Revolution',
    tags: ['Class 9th', 'SST', 'History', '8:00 PM Slot']
  },
  {
    id: 'c9-thu-5pm',
    title: 'Motion - Distance vs Displacement, Speed & Velocity Live Physics',
    subject: 'Science',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th Science Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Thursday',
    scheduledTime: 'Thursday, 5:00 PM - 6:30 PM',
    description: 'Uniform vs non-uniform motion, derivation of kinematic equations: v=u+at, s=ut+½at², v²=u²+2as with graphical methods.',
    chapter: 'Physics - Chapter 07: Motion',
    tags: ['Class 9th', 'Science', 'Physics', '5:00 PM Slot']
  },
  {
    id: 'c9-thu-8pm',
    title: 'What is Democracy? Why Democracy? - Features & Arguments',
    subject: 'SST',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th SST Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Thursday',
    scheduledTime: 'Thursday, 8:00 PM - 9:30 PM',
    description: 'Major decisions by elected leaders, free and fair electoral competition, rule of law, and broader meaning of democracy.',
    chapter: 'Civics - Chapter 01: What is Democracy? Why Democracy?',
    tags: ['Class 9th', 'SST', 'Civics', '8:00 PM Slot']
  },
  {
    id: 'c9-fri-5pm',
    title: 'Coordinate Geometry - Cartesian Plane, Coordinates & Quadrants',
    subject: 'Maths',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th Maths Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Friday',
    scheduledTime: 'Friday, 5:00 PM - 6:30 PM',
    description: 'Plotting points on Cartesian grid, abscissa and ordinate properties, identifying quadrants, and CBSE exam score tricks.',
    chapter: 'Chapter 03 - Coordinate Geometry',
    tags: ['Class 9th', 'Maths', '5:00 PM Slot']
  },
  {
    id: 'c9-fri-8pm',
    title: 'Is Matter Around Us Pure - Solutions, Colloids and Suspensions',
    subject: 'Science',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th Science Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Friday',
    scheduledTime: 'Friday, 8:00 PM - 9:30 PM',
    description: 'Tyndall effect live demonstrations, calculating concentration of solutions (mass percentage), and physical vs chemical changes.',
    chapter: 'Chemistry - Chapter 02: Is Matter Around Us Pure',
    tags: ['Class 9th', 'Science', 'Chemistry', '8:00 PM Slot']
  },
  {
    id: 'c9-sat-5pm',
    title: 'English - The Fun They Had & The Road Not Taken (Theme & Literary Analysis)',
    subject: 'English',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th English Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '5:00 PM',
    dayOfWeek: 'Saturday',
    scheduledTime: 'Saturday, 5:00 PM - 6:30 PM',
    description: 'Margie and Tommy’s futuristic tele-books discussion, Isaac Asimov’s central message, and Robert Frost’s metaphor of life choices.',
    chapter: 'Beehive - Chapter 01 & Poem 01',
    tags: ['Class 9th', 'English', '5:00 PM Slot']
  },
  {
    id: 'c9-sat-8pm',
    title: 'Physical Features of India - The Himalayan Mountains & Northern Plains',
    subject: 'SST',
    grade: 'Class 9th',
    batchName: 'AARAMBH 2.0 9th BATCH 26-27',
    batchId: 178,
    instructor: 'Aarambh 9th SST Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800&h=450',
    status: 'upcoming',
    timeSlot: '8:00 PM',
    dayOfWeek: 'Saturday',
    scheduledTime: 'Saturday, 8:00 PM - 9:30 PM',
    description: 'Plate tectonics theory, Himadri, Himachal & Shiwaliks mountain divisions, Bhabar, Terai, Bhangar, Khadar alluvial soil zones.',
    chapter: 'Geography - Chapter 02: Physical Features of India',
    tags: ['Class 9th', 'SST', 'Geography', '8:00 PM Slot']
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
    isLive: live.status === 'live'
  };
}
