import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/mongo'
import { User } from '@/models'
import { redirect } from 'next/navigation'

export default async function TechnicianPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  await dbConnect()
  const user = await User.findOne({ clerkId: userId }).lean<{ role?: string }>()
  if (!user || user.role !== 'technician') {
    // Not authorized
    redirect('/')
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">Technician Dashboard</h3>
      <p className="mt-2 text-sm text-gray-600">Assigned jobs and job details will appear here.</p>
    </div>
  )
}
