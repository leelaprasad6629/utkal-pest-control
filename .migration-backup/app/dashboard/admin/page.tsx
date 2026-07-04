import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../../../lib/mongo'
import { User } from '../../../../models'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  await dbConnect()
  const user = await User.findOne({ clerkId: userId }).lean()
  if (!user || user.role !== 'admin') {
    // Not authorized
    redirect('/')
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">Admin Overview</h3>
      <p className="mt-2 text-sm text-gray-600">Dummy charts and statistics will be placed here.</p>
    </div>
  )
}
