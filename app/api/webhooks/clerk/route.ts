import dbConnect from '../../../../lib/mongo'
import { User } from '../../../../models'

export async function POST(request: Request) {
  // Clerk will POST webhook events here. The payload shape depends on the event
  // See Clerk webhook docs: https://docs.clerk.com/webhooks
  try {
    const body = await request.json()
    const eventType = body.type || body.event || body.event_type || ''
    // Handle user.created and user.updated events
    if (eventType.includes('user.created') || eventType.includes('user.updated') || (body?.object === 'user')) {
      // Extract user data depending on Clerk payload shape
      const user = body.data || body.user || body
      const clerkId = user?.id || user?.user_id || user?.userId
      const email = user?.primary_email_address || user?.email || (user?.emails && user.emails[0]?.email_address)
      const firstName = user?.first_name || user?.firstName || user?.firstName
      const lastName = user?.last_name || user?.lastName || user?.lastName
      const phone = user?.phone_number || (user?.phone_numbers && user.phone_numbers[0]?.phone_number) || undefined

      if (!clerkId) {
        console.warn('No clerkId found in webhook payload', user)
        return new Response('ignored', { status: 200 })
      }

      await dbConnect()

      // Upsert user record by clerkId or email
      const query: any = { clerkId }
      // If there's no existing record with clerkId, try matching by email
      const existing = await User.findOne(query)
      if (!existing && email) {
        const byEmail = await User.findOne({ email })
        if (byEmail) {
          byEmail.clerkId = clerkId
          if (firstName) byEmail.name = `${firstName}${lastName ? ' ' + lastName : ''}`
          if (phone) byEmail.phone = phone
          await byEmail.save()
          console.log('Linked existing user by email to clerkId', email, clerkId)
          return new Response('linked', { status: 200 })
        }
      }

      const update = {
        clerkId,
        email: email || undefined,
        name: (firstName || lastName) ? `${firstName || ''}${lastName ? ' ' + lastName : ''}` : undefined,
        phone: phone || undefined
      }

      // Remove undefined fields
      Object.keys(update).forEach(k => update[k] === undefined && delete update[k])

      const opts = { upsert: true, new: true, setDefaultsOnInsert: true }
      await User.findOneAndUpdate({ clerkId }, update, opts)
      console.log('Upserted user from Clerk webhook', clerkId)
      return new Response('ok', { status: 200 })
    }

    // Unhandled event types
    return new Response('unhandled', { status: 200 })
  } catch (err) {
    console.error('Error handling Clerk webhook', err)
    return new Response('error', { status: 500 })
  }
}
