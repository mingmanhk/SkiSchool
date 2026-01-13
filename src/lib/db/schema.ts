
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const parent_profiles = pgTable('parent_profiles', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id),
  first_name: text('first_name'),
  last_name: text('last_name'),
  phone_number: text('phone_number'),
});

export const instructor_profiles = pgTable('instructor_profiles', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id),
  first_name: text('first_name'),
  last_name: text('last_name'),
  bio: text('bio'),
  photo_url: text('photo_url'),
});

export const students = pgTable('students', {
  id: uuid('id').primaryKey(),
  parent_id: uuid('parent_id').references(() => parent_profiles.id),
  first_name: text('first_name'),
  last_name: text('last_name'),
  date_of_birth: timestamp('date_of_birth'),
  skill_level: text('skill_level'),
});

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  age_group: text('age_group'),
  skill_level: text('skill_level'),
});

export const class_series = pgTable('class_series', {
  id: uuid('id').primaryKey(),
  program_id: uuid('program_id').references(() => programs.id),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  day_of_week: text('day_of_week'),
  start_time: text('start_time'),
  end_time: text('end_time'),
  max_students: text('max_students'),
});

export const class_occurrences = pgTable('class_occurrences', {
  id: uuid('id').primaryKey(),
  class_series_id: uuid('class_series_id').references(() => class_series.id),
  date: timestamp('date'),
});

export const class_instructors = pgTable('class_instructors', {
  id: uuid('id').primaryKey(),
  class_occurrence_id: uuid('class_occurrence_id').references(() => class_occurrences.id),
  instructor_id: uuid('instructor_id').references(() => instructor_profiles.id),
});

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey(),
  student_id: uuid('student_id').references(() => students.id),
  class_series_id: uuid('class_series_id').references(() => class_series.id),
  enrollment_date: timestamp('enrollment_date').defaultNow(),
});

export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey(),
  enrollment_id: uuid('enrollment_id').references(() => enrollments.id),
  class_occurrence_id: uuid('class_occurrence_id').references(() => class_occurrences.id),
  present: text('present'),
});

export const report_cards = pgTable('report_cards', {
  id: uuid('id').primaryKey(),
  enrollment_id: uuid('enrollment_id').references(() => enrollments.id),
  instructor_id: uuid('instructor_id').references(() => instructor_profiles.id),
  date: timestamp('date'),
  notes: text('notes'),
  skills: text('skills'),
});
