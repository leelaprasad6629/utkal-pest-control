import Link from 'next/link'

export default function ServicesPage() {
  return (
    <main className="p-4">
      <h2 className="text-2xl font-semibold">Services</h2>
      <div className="mt-4 grid grid-cols-1 gap-3">
        <Link href="/services/residential-pest-control" className="p-4 border rounded">Residential Pest Control</Link>
        <Link href="/services/commercial-pest-control" className="p-4 border rounded">Commercial Pest Control</Link>
        <Link href="/services/termite-control" className="p-4 border rounded">Termite Control</Link>
      </div>
    </main>
  )
}
