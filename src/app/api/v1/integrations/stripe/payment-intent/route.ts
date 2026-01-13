
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Get User's School ID
  const { data: userProfile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .single();

  if (!userProfile?.school_id) {
    return NextResponse.json({ error: 'No school associated' }, { status: 403 });
  }

  // 2. Fetch Tenant's Stripe Key from Vault
  const { data: integration } = await supabase
    .from('school_integrations')
    .select('stripe_secret_key')
    .eq('school_id', userProfile.school_id)
    .single();

  if (!integration?.stripe_secret_key) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  // 3. Initialize Tenant-Scoped Stripe Client
  const stripe = new Stripe(integration.stripe_secret_key, {
    apiVersion: '2023-10-16',
  });

  try {
    const body = await request.json();
    
    // Create Payment Intent (Example)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount,
      currency: body.currency,
      metadata: {
        schoolId: userProfile.school_id,
        userId: user.id
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
