import dbConnect from '../lib/mongo'
import { User } from '../models'

async function linkAdmin() {
  const email = process.env.ADMIN_EMAIL
  const clerkId = process.env.ADMIN_CLERK_ID
  if (!email || !clerkId) {
    console.error('Please set ADMIN_EMAIL and ADMIN_CLERK_ID in the environment when running this script.')
    process.exit(1)
  }

  await dbConnect()
  const user = await User.findOne({ email })
  if (!user) {
    console.error('No user found with email', email)
    process.exit(1)
  }

  user.clerkId = clerkId
  await user.save()
  console.log('Updated user', email, 'with clerkId', clerkId)
  process.exit(0)
}

linkAdmin().catch(err => {
  console.error(err)
  process.exit(1)
})
