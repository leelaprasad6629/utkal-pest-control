import dbConnect from '../../../lib/mongo'
import { Service } from '../../../models'

export async function GET() {
  await dbConnect()
  const services = await Service.find({}).lean()
  return new Response(JSON.stringify(services), { status: 200 })
}
