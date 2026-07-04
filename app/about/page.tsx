import React from 'react'
import { TAGLINE, SERVICE_AREAS } from '../../config/business'

export default function AboutPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-primary">About Utkal Pest Control</h1>
      <p className="mt-2 text-gray-700">Utkal Pest Control is a trusted eco-friendly pest control company serving households and businesses in local communities. Our certified technicians use safe, effective methods tailored to local conditions.</p>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Service Areas</h2>
        <p className="mt-2">We operate across the following areas: {SERVICE_AREAS.join(', ')}. If you're unsure whether we serve your area, contact us via the contact page.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Why Choose Us</h2>
        <ul className="mt-2 list-disc list-inside text-gray-700">
          <li>Professional certified technicians</li>
          <li>Eco-friendly and safe treatments</li>
          <li>Transparent pricing and guarantees</li>
          <li>Fast response time across our service areas</li>
        </ul>
      </section>
    </main>
  )
}
