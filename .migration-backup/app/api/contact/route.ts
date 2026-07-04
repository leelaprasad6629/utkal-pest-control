import dbConnect from '../../../lib/mongo'
import { ContactMessage } from '../../../models'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = ContactSchema.parse(body)
    await dbConnect()
    const doc = await ContactMessage.create(parsed)

    // Send notification email if SMTP config exists
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const notifyTo = process.env.NOTIFY_EMAIL || process.env.SMTP_USER

    if (host && user && pass && notifyTo) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      })

      await transporter.sendMail({
        from: `${parsed.name} <${parsed.email}>`,
        to: notifyTo,
        subject: `New contact message from ${parsed.name}`,
        text: `Name: ${parsed.name}\nEmail: ${parsed.email}\nPhone: ${parsed.phone || ''}\n\nMessage:\n${parsed.message}`
      })
    }

    return new Response(JSON.stringify({ ok: true, id: doc._id }), { status: 201 })
  } catch (err: any) {
    console.error('Contact POST error', err)
    return new Response(JSON.stringify({ error: err?.message || 'Invalid' }), { status: 400 })
  }
}
