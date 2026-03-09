// EmailService: Transactional emails via SendGrid (site-level key)
import sgMail from '@sendgrid/mail'

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  from?: string
  replyTo?: string
  tags?: Record<string, string>
}

export interface EmailResponse {
  messageId: string
  status: string
}

const DEFAULT_FROM = process.env.SENDGRID_FROM_EMAIL ?? 'noreply@skischoolos.com'

function getClient(): void {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) throw new Error('SENDGRID_API_KEY is not configured')
  sgMail.setApiKey(apiKey)
}

export class EmailService {
  async sendEmail(
    _tenantId: string, // Reserved for tagging/metering
    options: EmailOptions,
  ): Promise<EmailResponse> {
    getClient()

    const [response] = await sgMail.send({
      to: options.to,
      from: options.from ?? DEFAULT_FROM,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
      customArgs: _tenantId ? { tenantId: _tenantId } : undefined,
    })

    return {
      messageId: response.headers['x-message-id'] as string ?? '',
      status: String(response.statusCode),
    }
  }

  async sendVerificationEmail(
    tenantId: string,
    email: string,
    _token: string,
    verificationUrl: string,
  ): Promise<void> {
    await this.sendEmail(tenantId, {
      to: email,
      subject: 'Verify your email address',
      html: `
        <h2>Verify your email</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Verify Email</a></p>
        <p>This link expires in 1 hour.</p>
      `,
      text: `Verify your email: ${verificationUrl}`,
    })
  }

  async sendVerificationEmailForHistorical(
    tenantId: string,
    email: string,
    _token: string,
    verificationUrl: string,
  ): Promise<void> {
    await this.sendEmail(tenantId, {
      to: email,
      subject: 'Verify your email to access your account',
      html: `
        <h2>Welcome back!</h2>
        <p>We found an existing record for this email address. Please verify your identity to continue:</p>
        <p><a href="${verificationUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Verify & Continue</a></p>
        <p>This link expires in 1 hour.</p>
      `,
      text: `Verify your email to continue: ${verificationUrl}`,
    })
  }

  async sendPasswordlessLoginEmail(
    tenantId: string,
    email: string,
    magicLink: string,
  ): Promise<void> {
    await this.sendEmail(tenantId, {
      to: email,
      subject: 'Your sign-in link',
      html: `
        <h2>Sign in to your account</h2>
        <p>Click the link below to sign in. This link expires in 15 minutes.</p>
        <p><a href="${magicLink}" style="background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Sign In</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
      text: `Sign in here: ${magicLink}`,
    })
  }

  async sendEnrollmentConfirmation(
    tenantId: string,
    parentEmail: string,
    data: {
      parentName: string
      studentName: string
      programName: string
      schoolName: string
    },
  ): Promise<void> {
    await this.sendEmail(tenantId, {
      to: parentEmail,
      subject: `Enrollment Confirmed — ${data.programName}`,
      html: `
        <h2>Enrollment Confirmed!</h2>
        <p>Hi ${data.parentName},</p>
        <p>Your child <strong>${data.studentName}</strong> has been successfully enrolled in <strong>${data.programName}</strong> at ${data.schoolName}.</p>
        <p>We look forward to seeing you on the slopes!</p>
      `,
      text: `Hi ${data.parentName}, ${data.studentName} has been enrolled in ${data.programName} at ${data.schoolName}.`,
    })
  }
}
