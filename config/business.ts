export const BUSINESS_NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Utkal Pest Control'
export const TAGLINE = process.env.NEXT_PUBLIC_TAGLINE ?? 'Trusted, eco-friendly pest control near you'
export const SERVICE_AREAS = (process.env.NEXT_PUBLIC_SERVICE_AREAS ?? 'Your City').split(',').map(s => s.trim())
