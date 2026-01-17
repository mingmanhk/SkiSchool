
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get active cart
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('parent_id', user.id)
    .eq('status', 'ACTIVE')
    .single();

  if (!cart) return NextResponse.json({ items: [] });

  const { data: items, error } = await supabase
    .from('cart_items')
    .select('*, class_occurrences(*, class_series(programs(*))), students(*)')
    .eq('cart_id', cart.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items });
}
