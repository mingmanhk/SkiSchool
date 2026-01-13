
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Fetch Skills
  const { data: skills, error: skillsError } = await supabase
    .from('student_skill_events')
    .select('*')
    .eq('student_id', params.id)
    .order('created_at', { ascending: false });

  if (skillsError) {
    return new NextResponse(JSON.stringify({ error: skillsError.message }), { status: 500 });
  }

  // Fetch Badges
  const { data: badges, error: badgesError } = await supabase
    .from('student_badges')
    .select('*, badges(*)') // Join with badges definition
    .eq('student_id', params.id)
    .order('created_at', { ascending: false });

  if (badgesError) {
    return new NextResponse(JSON.stringify({ error: badgesError.message }), { status: 500 });
  }

  // Fetch Media
  const { data: media, error: mediaError } = await supabase
    .from('student_media')
    .select('*')
    .eq('student_id', params.id)
    .order('created_at', { ascending: false });
    
  if (mediaError) {
    return new NextResponse(JSON.stringify({ error: mediaError.message }), { status: 500 });
  }

  return NextResponse.json({
    skills,
    badges,
    media
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();

    if (body.type === 'skill') {
        const { skill, note } = body;
        const { data, error } = await supabase
            .from('student_skill_events')
            .insert({
                student_id: params.id,
                skill: skill,
                // note: note, // Assuming a note field exists or we just use skill for now
                instructor_id: user.id
            })
            .select()
            .single();
        
        if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
        return NextResponse.json(data);
    } 
    
    if (body.type === 'badge') {
        const { badge_id } = body;
        const { data, error } = await supabase
            .from('student_badges')
            .insert({
                student_id: params.id,
                badge_id: badge_id,
                awarded_by: user.id
            })
            .select()
            .single();

        if (error) return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
        return NextResponse.json(data);
    }

    return new NextResponse(JSON.stringify({ error: 'Invalid type' }), { status: 400 });
}
