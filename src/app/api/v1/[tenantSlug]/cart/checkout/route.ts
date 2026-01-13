
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use latest API version
});

export async function POST(
  request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  const body = await request.json();
  const { cartId, successUrl, cancelUrl } = body;
  const supabase = await createClient();

  // 1. Fetch Cart & Items
  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select('*, class_occurrences(class_series(program_id, programs(name_en)))')
    .eq('cart_id', cartId);

  if (error || !cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty or not found' }, { status: 400 });
  }

  // 2. Create Stripe Line Items
  const line_items = cartItems.map((item: any) => ({
    price_data: {
      currency: item.currency.toLowerCase(),
      product_data: {
        name: item.class_occurrences.class_series.programs.name_en, // Fallback to English name for Stripe
        metadata: {
          class_occurrence_id: item.class_occurrence_id,
          student_id: item.student_id,
        },
      },
      unit_amount: item.unit_price_cents,
    },
    quantity: 1,
  }));

  // 3. Create Stripe Session
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      metadata: {
        cartId: cartId,
        tenantSlug: params.tenantSlug,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
