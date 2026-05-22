import type { ApplicationRole } from './applicationValidation'

type EmailEnv = {
  EMAIL_FROM?: string
  EMAIL_NOTIFICATION_TO?: string
  EMAIL_REPLY_TO?: string
  PUBLIC_SITE_URL?: string
  RESEND_API_KEY?: string
}

type ApplicationValues = Record<string, string | boolean>

type EmailResult =
  | {
      applicantEmailId?: string
      notificationEmailId?: string
      ok: true
      skipped?: boolean
    }
  | {
      message: string
      ok: false
    }

type ResendEmailResponse = {
  id?: string
  message?: string
  name?: string
}

type SendEmailOptions = {
  env: EmailEnv
  html: string
  idempotencyKey: string
  subject: string
  text: string
  to: string | string[]
}

type SendApplicationEmailOptions = {
  applicationId: string
  env: EmailEnv
  role: ApplicationRole
  values: ApplicationValues
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getString(values: ApplicationValues, key: string) {
  const value = values[key]
  return typeof value === 'string' ? value : ''
}

function parseEmailList(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
}

function getSiteUrl(env: EmailEnv) {
  return (env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
}

function shouldSkipEmail(env: EmailEnv) {
  return !env.RESEND_API_KEY || !env.EMAIL_FROM
}

async function sendResendEmail({
  env,
  html,
  idempotencyKey,
  subject,
  text,
  to,
}: SendEmailOptions) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new Error('Email service is not configured.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      html,
      reply_to: env.EMAIL_REPLY_TO || undefined,
      subject,
      text,
      to,
    }),
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
      'idempotency-key': idempotencyKey,
    },
    method: 'POST',
  })
  const body = (await response.json()) as ResendEmailResponse

  if (!response.ok || !body.id) {
    throw new Error(body.message || body.name || 'Email could not be sent.')
  }

  return body.id
}

function buildApplicantEmail({
  applicationId,
  env,
  role,
  values,
}: SendApplicationEmailOptions) {
  const fullName = getString(values, 'fullName')
  const siteUrl = getSiteUrl(env)
  const escapedName = escapeHtml(fullName)
  const escapedRole = escapeHtml(role)
  const escapedId = escapeHtml(applicationId)
  const siteLink = siteUrl
    ? `<p>You can visit the conference site at <a href="${siteUrl}">${siteUrl}</a>.</p>`
    : ''

  return {
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #20130d; line-height: 1.6;">
        <h1 style="color: #4f1512;">NHMUN'26 application received</h1>
        <p>Dear ${escapedName},</p>
        <p>Your ${escapedRole} application has been received by the NHMUN'26 team.</p>
        <p><strong>Reference ID:</strong> ${escapedId}</p>
        <p>Please keep this ID for any follow-up about your application.</p>
        ${siteLink}
        <p>NHMUN'26 Team</p>
      </div>
    `,
    subject: `NHMUN'26 application received - ${applicationId}`,
    text: [
      `Dear ${fullName},`,
      '',
      `Your ${role} application has been received by the NHMUN'26 team.`,
      `Reference ID: ${applicationId}`,
      '',
      'Please keep this ID for any follow-up about your application.',
      ...(siteUrl ? [`Conference site: ${siteUrl}`] : []),
      '',
      "NHMUN'26 Team",
    ].join('\n'),
  }
}

function buildNotificationEmail({
  applicationId,
  env,
  role,
  values,
}: SendApplicationEmailOptions) {
  const fullName = getString(values, 'fullName')
  const email = getString(values, 'email')
  const school = getString(values, 'school')
  const siteUrl = getSiteUrl(env)
  const adminUrl = siteUrl ? `${siteUrl}/admin` : ''
  const adminLink = adminUrl
    ? `<p><a href="${adminUrl}">Open admin panel</a></p>`
    : ''

  return {
    html: `
      <div style="font-family: Arial, sans-serif; color: #20130d; line-height: 1.6;">
        <h1>New NHMUN'26 application</h1>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Role:</strong> ${escapeHtml(role)}</p>
        <p><strong>School:</strong> ${escapeHtml(school)}</p>
        <p><strong>Reference ID:</strong> ${escapeHtml(applicationId)}</p>
        ${adminLink}
      </div>
    `,
    subject: `New NHMUN'26 ${role} application`,
    text: [
      "New NHMUN'26 application",
      '',
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Role: ${role}`,
      `School: ${school}`,
      `Reference ID: ${applicationId}`,
      ...(adminUrl ? [`Admin: ${adminUrl}`] : []),
    ].join('\n'),
  }
}

export async function sendApplicationEmails(
  options: SendApplicationEmailOptions,
): Promise<EmailResult> {
  if (shouldSkipEmail(options.env)) {
    return {
      ok: true,
      skipped: true,
    }
  }

  try {
    const applicant = buildApplicantEmail(options)
    const applicantEmailId = await sendResendEmail({
      env: options.env,
      html: applicant.html,
      idempotencyKey: `${options.applicationId}:applicant`,
      subject: applicant.subject,
      text: applicant.text,
      to: getString(options.values, 'email'),
    })

    const notificationRecipients = parseEmailList(
      options.env.EMAIL_NOTIFICATION_TO,
    )
    let notificationEmailId: string | undefined

    if (notificationRecipients.length > 0) {
      const notification = buildNotificationEmail(options)
      notificationEmailId = await sendResendEmail({
        env: options.env,
        html: notification.html,
        idempotencyKey: `${options.applicationId}:notification`,
        subject: notification.subject,
        text: notification.text,
        to: notificationRecipients,
      })
    }

    return {
      applicantEmailId,
      notificationEmailId,
      ok: true,
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : String(error),
      ok: false,
    }
  }
}
