
import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
  const { to, body } = await request.json();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
