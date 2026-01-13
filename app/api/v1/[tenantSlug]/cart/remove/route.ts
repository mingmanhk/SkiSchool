
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  const body = await request.json();
  const { cartItemId } = body;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    // RLS will ensure user owns the cart, but explicit check on cart parent_id is safer
    .eq('cart_id', (await supabase.from('cart_items').select('cart_id').eq('id', cartItemId).single()).data?.cart_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
