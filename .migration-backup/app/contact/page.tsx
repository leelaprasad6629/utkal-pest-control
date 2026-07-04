'use client'

import React, { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      })
      if (res.ok) {
        setStatus('sent')
        setName('')
        setEmail('')
        setPhone('')
        setMessage('')
      } else {
        setStatus('error')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-primary">Contact Us</h1>
      <p className="mt-2 text-gray-700">Have a question or need a quote? Send us a message and we'll get back to you promptly.</p>

      <form className="mt-4 max-w-md" onSubmit={handleSubmit}>
        <label className="block mb-2">Name
          <input className="w-full border p-2 mt-1" value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label className="block mb-2">Email
          <input type="email" className="w-full border p-2 mt-1" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label className="block mb-2">Phone
          <input className="w-full border p-2 mt-1" value={phone} onChange={e => setPhone(e.target.value)} />
        </label>
        <label className="block mb-2">Message
          <textarea className="w-full border p-2 mt-1" value={message} onChange={e => setMessage(e.target.value)} required />
        </label>
        <div className="mt-4">
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </div>
        {status === 'sent' && <p className="mt-2 text-green-600">Message sent — we'll contact you soon.</p>}
        {status === 'error' && <p className="mt-2 text-red-600">Error sending message. Please try again later.</p>}
      </form>
    </main>
  )
}
