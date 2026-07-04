'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingCreateSchema } from '../types/schemas'
import type { BookingCreateInput } from '../types/schemas'

export default function BookingSteps({ serviceId, serviceName }: { serviceId: string, serviceName: string }) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingCreateInput>({ resolver: zodResolver(bookingCreateSchema), defaultValues: { serviceId } as any })

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error('Failed')
      const booking = await res.json()
      // Redirect to confirmation
      window.location.href = `/booking/${booking._id}/confirmation`
    } catch (err) {
      console.error(err)
      alert('Error creating booking')
      setSubmitting(false)
    }
  }

  const next = () => setStep(s => Math.min(3, s + 1))
  const prev = () => setStep(s => Math.max(0, s - 1))

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-xl font-semibold">Booking — {serviceName}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 0 && (
          <div className="mt-4">
            <label className="block mb-2">Preferred date
              <input type="date" {...register('scheduledDate')} className="w-full border p-2 mt-1" />
              {errors.scheduledDate && <p className="text-red-600 text-sm">{errors.scheduledDate.message}</p>}
            </label>
            <label className="block mb-2">Time slot
              <select {...register('timeSlot')} className="w-full border p-2 mt-1">
                <option value="09:00-11:00">09:00-11:00</option>
                <option value="11:00-13:00">11:00-13:00</option>
                <option value="15:00-17:00">15:00-17:00</option>
              </select>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="mt-4">
            <label className="block mb-2">Address line 1
              <input {...register('address.line1' as const)} className="w-full border p-2 mt-1" />
            </label>
            <label className="block mb-2">City
              <input {...register('address.city' as const)} className="w-full border p-2 mt-1" />
            </label>
            <label className="block mb-2">State
              <input {...register('address.state' as const)} className="w-full border p-2 mt-1" />
            </label>
            <label className="block mb-2">Pincode
              <input {...register('address.pincode' as const)} className="w-full border p-2 mt-1" />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <h4 className="font-semibold">Review</h4>
            <div className="mt-2 text-sm text-gray-700">
              <p><strong>Service:</strong> {serviceName}</p>
              <p><strong>Date:</strong> {watch('scheduledDate')}</p>
              <p><strong>Time slot:</strong> {watch('timeSlot')}</p>
              <p><strong>Address:</strong> {watch('address')?.line1}, {watch('address')?.city}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {step > 0 && <button type="button" onClick={prev} className="px-3 py-2 border rounded">Back</button>}
          {step < 2 && <button type="button" onClick={next} className="px-3 py-2 bg-primary text-white rounded">Next</button>}
          {step === 2 && <button type="submit" disabled={submitting} className="px-3 py-2 bg-accent text-white rounded">{submitting ? 'Booking...' : 'Confirm & Pay'}</button>}
        </div>
      </form>
    </div>
  )
}
