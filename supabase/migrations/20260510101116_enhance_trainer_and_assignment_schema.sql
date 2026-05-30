/*
  # Enhance Trainer and Assignment Schema

  1. Changes
    - Add missing columns to trainers table: profile_image_url, mobile, date_of_birth
    - Add schedule columns to course_assignments: schedule_start, schedule_end, schedule_days, schedule_time
    - Add enrollment_id and module/lesson tracking to topic_progress
    - Add event, recipient, status, content to notifications for email/WhatsApp tracking

  2. Security
    - Add missing RLS policies for trainers to update own profile
    - Add policies for students to read course assignments
    - Add policies for trainers to manage topic progress

  3. Important Notes
    1. trainers table already exists with id, skills, mode_of_training, bio
    2. course_assignments already exists with trainer_id, course_id, status
    3. topic_progress already exists with assignment_id, topic, completed
    4. notifications already exists with user_id, type, channel, title, message
*/

-- Add missing columns to trainers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'profile_image_url') THEN
    ALTER TABLE trainers ADD COLUMN profile_image_url text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'mobile') THEN
    ALTER TABLE trainers ADD COLUMN mobile text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trainers' AND column_name = 'date_of_birth') THEN
    ALTER TABLE trainers ADD COLUMN date_of_birth date;
  END IF;
END $$;

-- Add schedule columns to course_assignments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_assignments' AND column_name = 'schedule_start') THEN
    ALTER TABLE course_assignments ADD COLUMN schedule_start timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_assignments' AND column_name = 'schedule_end') THEN
    ALTER TABLE course_assignments ADD COLUMN schedule_end timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_assignments' AND column_name = 'schedule_days') THEN
    ALTER TABLE course_assignments ADD COLUMN schedule_days text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_assignments' AND column_name = 'schedule_time') THEN
    ALTER TABLE course_assignments ADD COLUMN schedule_time text DEFAULT '';
  END IF;
END $$;

-- Add enrollment_id and module/lesson tracking to topic_progress
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_progress' AND column_name = 'enrollment_id') THEN
    ALTER TABLE topic_progress ADD COLUMN enrollment_id uuid REFERENCES enrollments(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_progress' AND column_name = 'module_index') THEN
    ALTER TABLE topic_progress ADD COLUMN module_index integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_progress' AND column_name = 'lesson_index') THEN
    ALTER TABLE topic_progress ADD COLUMN lesson_index integer DEFAULT 0;
  END IF;
END $$;

-- Add email/WhatsApp tracking columns to notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'event') THEN
    ALTER TABLE notifications ADD COLUMN event text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient') THEN
    ALTER TABLE notifications ADD COLUMN recipient text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'delivery_status') THEN
    ALTER TABLE notifications ADD COLUMN delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('sent', 'failed', 'pending'));
  END IF;
END $$;

-- Add missing RLS policies
-- Trainers can update own profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Trainers can update own profile' AND tablename = 'trainers') THEN
    CREATE POLICY "Trainers can update own profile"
      ON trainers FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Students can read course assignments for enrolled courses
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students read assignments for enrolled courses' AND tablename = 'course_assignments') THEN
    CREATE POLICY "Students read assignments for enrolled courses"
      ON course_assignments FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM enrollments
          WHERE enrollments.course_id = course_assignments.course_id
          AND enrollments.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Trainers can read topic progress for their assignments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Trainers read topic progress' AND tablename = 'topic_progress') THEN
    CREATE POLICY "Trainers read topic progress"
      ON topic_progress FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM course_assignments ca
          WHERE ca.id = topic_progress.assignment_id
          AND ca.trainer_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Trainers can update topic progress for their assignments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Trainers update topic progress' AND tablename = 'topic_progress') THEN
    CREATE POLICY "Trainers update topic progress"
      ON topic_progress FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM course_assignments ca
          WHERE ca.id = topic_progress.assignment_id
          AND ca.trainer_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM course_assignments ca
          WHERE ca.id = topic_progress.assignment_id
          AND ca.trainer_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Trainers can insert topic progress for their assignments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Trainers insert topic progress' AND tablename = 'topic_progress') THEN
    CREATE POLICY "Trainers insert topic progress"
      ON topic_progress FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM course_assignments ca
          WHERE ca.id = topic_progress.assignment_id
          AND ca.trainer_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Students can read own topic progress
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students read own topic progress' AND tablename = 'topic_progress') THEN
    CREATE POLICY "Students read own topic progress"
      ON topic_progress FOR SELECT
      TO authenticated
      USING (
        enrollment_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM enrollments e
          WHERE e.id = topic_progress.enrollment_id
          AND e.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_topic_progress_enrollment ON topic_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
