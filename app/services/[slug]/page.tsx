import dbConnect from '../../../../lib/mongo'
import { Service } from '../../../../models'

interface Props {
  params: { slug: string }
}

export default async function ServiceDetail({ params }: Props) {
  await dbConnect()
  const svc = await Service.findOne({ slug: params.slug }).lean()
  if (!svc) return (<div className="p-4">Service not found</div>)
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">{svc.name}</h1>
      <p className="mt-2">{svc.description}</p>
      <p className="mt-2 font-semibold">Starting at ₹{svc.basePrice}</p>
      <div className="mt-4">
        <a href="/quote" className="bg-accent text-white px-4 py-2 rounded">Book Now</a>
      </div>
    </main>
  )
}
