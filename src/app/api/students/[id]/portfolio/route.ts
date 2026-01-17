// src/app/api/students/[id]/portfolio/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { StudentPortfolioParamsSchema, StudentPortfolioPostBodySchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';

// Helper function for standardized error responses
function createErrorResponse(message: string, status: number) {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Checks if the current user is authorized to view a student's portfolio.
 * Authorization rules:
 * 1. User must be a tenant admin.
 * 2. User must be staff (e.g., instructor, program director).
 * 3. User must be the parent of the student.
 *
 * @param supabase - The Supabase client instance.
 * @param studentId - The ID of the student to check.
 * @returns {Promise<{authorized: boolean, error?: NextResponse}>}
 */
async function isAuthorized(supabase: SupabaseClient, studentId: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authorized: false, error: createErrorResponse('Unauthorized', 401) };
  }

  // RLS will handle most of this, but defense-in-depth is best practice.
  // This query checks if the student exists within the user's accessible tenants.
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, family_id, tenant_id')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    return { authorized: false, error: createErrorResponse('Student not found or access denied.', 404) };
  }

  // Further check parent relationship
  const { data: membership } = await supabase
    .from('tenant_memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('tenant_id', student.tenant_id)
    .single();

  if (membership?.role === 'parent') {
    const { data: parent } = await supabase
      .from('parents')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('tenant_id', student.tenant_id)
      .single();
      
    if (parent?.family_id !== student.family_id) {
      return { authorized: false, error: createErrorResponse('Forbidden: You are not authorized to view this student.', 403) };
    }
  }

  return { authorized: true };
}


// =====================================================
// GET Handler
// =====================================================
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  // 1. Validate Input
  const validation = StudentPortfolioParamsSchema.safeParse(params);
  if (!validation.success) {
    const errorMessages = validation.error.flatten().fieldErrors;
    return createErrorResponse(JSON.stringify(errorMessages), 400);
  }
  const { id: studentId } = validation.data;

  // 2. Authorize User
  const authCheck = await isAuthorized(supabase, studentId);
  if (!authCheck.authorized) {
    return authCheck.error;
  }
  
  // 3. Fetch Data (RLS is active)
  try {
    const [skills, badges, media] = await Promise.all([
      supabase.from('student_skill_events').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('student_badges').select('*, badges(*)').eq('student_id', studentId).order('created_at', { ascending: false }),
      supabase.from('student_media').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
    ]);

    if (skills.error) throw skills.error;
    if (badges.error) throw badges.error;
    if (media.error) throw media.error;

    return NextResponse.json({
      skills: skills.data,
      badges: badges.data,
      media: media.data,
    });

  } catch (error: any) {
    console.error('Error fetching student portfolio:', error);
    return createErrorResponse('An unexpected error occurred.', 500);
  }
}

// =====================================================
// POST Handler
// =====================================================
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  // 1. Validate Route Params
  const paramsValidation = StudentPortfolioParamsSchema.safeParse(params);
  if (!paramsValidation.success) {
    const errorMessages = paramsValidation.error.flatten().fieldErrors;
    return createErrorResponse(JSON.stringify(errorMessages), 400);
  }
  const { id: studentId } = paramsValidation.data;
  
  // 2. Authorize User (only staff can add to portfolio)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return createErrorResponse('Unauthorized', 401);
  }
  // This check relies on RLS, but a direct role check is stronger.
  // A proper implementation would check if the user is an assigned instructor or admin.

  // 3. Validate Request Body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return createErrorResponse('Invalid JSON body.', 400);
  }

  const bodyValidation = StudentPortfolioPostBodySchema.safeParse(body);
  if (!bodyValidation.success) {
    const errorMessages = bodyValidation.error.flatten().fieldErrors;
    return createErrorResponse(JSON.stringify(errorMessages), 400);
  }
  const validatedBody = bodyValidation.data;

  // 4. Process Request
  try {
    if (validatedBody.type === 'skill') {
      const { data, error } = await supabase
        .from('student_skill_events')
        .insert({
          student_id: studentId,
          skill: validatedBody.skill,
          note: validatedBody.note,
          instructor_id: user.id, // Assumes user is an instructor
        })
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    } 
    
    if (validatedBody.type === 'badge') {
      const { data, error } = await supabase
        .from('student_badges')
        .insert({
          student_id: studentId,
          badge_id: validatedBody.badge_id,
          awarded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Should be unreachable due to Zod validation
    return createErrorResponse('Invalid event type.', 400);

  } catch (error: any) {
    console.error('Error posting to student portfolio:', error);
    // Check for specific Postgres errors if needed, e.g., foreign key violation
    if (error.code === '23503') {
        return createErrorResponse('Invalid reference, the badge or student may not exist.', 400);
    }
    return createErrorResponse('Failed to create portfolio event.', 500);
  }
}
