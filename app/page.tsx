import Link from 'next/link'

export default function Home() {
  return (
    <main className="p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Utkal Pest Control</h1>
        <p className="text-sm text-gray-600">Trusted, eco-friendly pest control across Odisha</p>
        <nav className="mt-4">
          <Link href="/services" className="mr-4 text-accent">Services</Link>
          <Link href="/about" className="mr-4">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <section className="bg-primary text-white p-6 rounded-lg">
        <h2 className="text-2xl font-semibold">Protect your home — Book a service</h2>
        <p className="mt-2">Get a free quote and quick booking. Mobile-first booking optimized for Odisha residents.</p>
        <div className="mt-4">
          <Link href="/quote" className="bg-white text-primary px-4 py-2 rounded-md">Get Free Quote</Link>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold">Our Services</h3>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <Link href="/services/residential-pest-control" className="p-4 border rounded">Residential</Link>
          <Link href="/services/commercial-pest-control" className="p-4 border rounded">Commercial</Link>
          <Link href="/services/termite-control" className="p-4 border rounded">Termite</Link>
          <Link href="/services/rodent-control" className="p-4 border rounded">Rodent</Link>
        </div>
      </section>

      <footer className="mt-12 text-sm text-gray-500">
        © Utkal Pest Control — Odisha
      </footer>
    </main>
  )
}
