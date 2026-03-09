// SmsProviderService: SMS abstraction using site-level keys via Twilio
import twilio from 'twilio'

export interface SmsPayload {
  tenantId: string
  to: string
  body: string
  tags?: Record<string, string>
}

export interface SmsResponse {
  providerMessageId: string
  status: string
}

function getClient(): twilio.Twilio {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set')
  }
  return twilio(accountSid, authToken)
}

function getFromNumber(): string {
  const from = process.env.TWILIO_FROM_NUMBER
  if (!from) {
    throw new Error('TWILIO_FROM_NUMBER must be set')
  }
  return from
}

export class SmsProviderService {
  async sendSms(payload: SmsPayload): Promise<SmsResponse> {
    const client = getClient()
    const from = getFromNumber()

    const message = await client.messages.create({
      to: payload.to,
      from,
      body: payload.body,
      // Tag with tenant_id in status callback URL if configured
      statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL
        ? `${process.env.TWILIO_STATUS_CALLBACK_URL}?tenantId=${payload.tenantId}`
        : undefined,
    })

    return {
      providerMessageId: message.sid,
      status: message.status,
    }
  }

  async sendSmsBatch(
    tenantId: string,
    messages: SmsPayload[],
  ): Promise<SmsResponse[]> {
    const results: SmsResponse[] = []
    const errors: Array<{ to: string; error: string }> = []

    // Send in batches of 10 with a small delay to avoid rate limits
    const BATCH_SIZE = 10
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.allSettled(
        batch.map((msg) => this.sendSms({ ...msg, tenantId })),
      )

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j]
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          const to = batch[j].to
          errors.push({ to, error: result.reason?.message ?? 'Unknown error' })
          results.push({ providerMessageId: '', status: 'failed' })
        }
      }

      // Small delay between batches
      if (i + BATCH_SIZE < messages.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    if (errors.length > 0) {
      console.error(
        `[SmsProviderService] ${errors.length} messages failed:`,
        errors,
      )
    }

    return results
  }
}
