import { z } from 'zod'
import { Constants, Database } from '@/database.types'

const translationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  short_description: z.string().min(1, 'Short description is required'),
  detailed_description: z.string().min(1, 'Detailed description is required'),
})

const destinationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  deity: z.enum(Constants.public.Enums.Deity),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  live_feed: z.string().url('Must be a valid URL'),
  sampradaya: z.enum(Constants.public.Enums.Sampradaya),
  translations: z.object({
    en: translationSchema,
    hi: translationSchema,
    kn: translationSchema,
    ml: translationSchema,
    ta: translationSchema,
  }),
  images: z.array(z.string().url('Must be a valid URL')).min(1, 'At least one image is required'),
})

const eventTranslationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
})

const eventSchema = z.object({
  destination_id: z.string().min(1, 'Destination is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  date: z.string().optional(),
  daily: z.boolean(),
  isPopular: z.boolean(),
  event_image: z.string().url('Must be a valid URL').optional(),
  translations: z.object({
    en: eventTranslationSchema,
    hi: eventTranslationSchema,
    kn: eventTranslationSchema,
    ml: eventTranslationSchema,
    ta: eventTranslationSchema,
  }),
})

export type DestinationFormData = z.infer<typeof destinationSchema>
export type EventFormData = z.infer<typeof eventSchema>

export { destinationSchema, eventSchema } 