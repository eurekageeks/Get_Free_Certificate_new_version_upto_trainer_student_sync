export type Tier = 'beginner' | 'intermediate' | 'advanced';
export type EnrollmentStatus = 'active' | 'completed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type UserRole = 'student' | 'admin' | 'trainer';
export type TrainingMode = 'online' | 'offline' | 'both';
export type AssignmentStatus = 'active' | 'completed' | 'upcoming' | 'cancelled';

export interface CourseModule {
  title: string;
  lessons: string[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tier: Tier;
  registration_fee: number;
  duration_hours: number;
  modules: CourseModule[];
  image_url: string;
  is_published: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  email: string;
  avatar_url: string;
  address: string;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainerProfile {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  address: string;
  profile_image_url: string;
  date_of_birth: string | null;
  skills: string[];
  mode_of_training: TrainingMode;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface CourseAssignment {
  id: string;
  trainer_id: string;
  course_id: string;
  schedule_start: string | null;
  schedule_end: string | null;
  schedule_days: string[];
  schedule_time: string;
  status: AssignmentStatus;
  assigned_by: string | null;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  trainer?: TrainerProfile;
}

export interface TopicProgress {
  id: string;
  assignment_id: string;
  enrollment_id: string | null;
  topic: string;
  module_index: number;
  lesson_index: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  type: string;
  channel: 'email' | 'whatsapp' | 'in_app';
  title: string;
  message: string;
  event: string;
  recipient: string;
  delivery_status: 'sent' | 'failed' | 'pending';
  read: boolean;
  sent_at: string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  course?: Course;
}

export interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string | null;
  amount: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: PaymentStatus;
  created_at: string;
  course?: Course;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  user_id: string;
  course_id: string;
  enrollment_id: string | null;
  user_name: string;
  course_name: string;
  issued_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export function formatCurrency(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export function formatFeeDisplay(fee: number): string {
  if (fee === 0) return 'Free';
  return formatCurrency(fee);
}

export const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string; border: string }> = {
  beginner: { label: 'Beginner', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  intermediate: { label: 'Intermediate', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  advanced: { label: 'Advanced', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};
