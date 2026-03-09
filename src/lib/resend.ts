import { Resend } from 'resend'
import { ReactElement } from 'react'

const resendApiKey = process.env.RESEND_API_KEY

// Instance singleton
export const resend = resendApiKey && resendApiKey !== 're_dev_placeholder_replace_with_real_key'
  ? new Resend(resendApiKey)
  : null

interface SendEmailOptions {
  to: string
  subject: string
  react: ReactElement
  from?: string
}

interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

export async function sendEmail({ to, subject, react, from }: SendEmailOptions): Promise<SendEmailResult> {
  // Mode dry-run en développement si pas de clé Resend
  if (!resend) {
    console.warn('[Resend] Clé API absente ou placeholder — email simulé.')
    console.warn(`[Resend] TO: ${to} | SUBJECT: ${subject}`)
    return { success: true, id: 'dry-run-' + Date.now() }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from ?? 'Styliste.com <noreply@styliste.com>',
      to,
      subject,
      react,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return { success: false, error: message }
  }
}
