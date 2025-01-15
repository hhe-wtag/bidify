import { z } from 'zod'

const itemValidationSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters')
    .nonempty('Title is required')
    .trim(),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description cannot exceed 1000 characters')
    .nonempty('Description is required')
    .trim(),

  startingBid: z
    .number()
    .min(0, 'Starting bid must be a positive number')
    .nonnegative('Starting bid cannot be negative')
    .finite('Starting bid must be a finite number')
    .refine((value) => value !== undefined, 'Starting bid is required'),

  categoryId: z.string().optional(),

  status: z
    .enum(['active', 'sold', 'canceled'], {
      errorMap: () => ({ message: 'Invalid status value' }),
    })
    .default('active'),

  endTime: z
    .string()
    .nonempty('End time is required')
    .or(z.date())
    .refine((value) => {
      const endDate = new Date(value)
      const currentDate = new Date()
      const twelveHoursLater = new Date(currentDate.getTime() + 12 * 60 * 60 * 1000) // 12 hours in milliseconds

      return endDate > twelveHoursLater
    }, 'End time must be at least 12 hours in the future'),

  minimumBidIncrement: z
    .number()
    .min(10, 'Minimum bid increment must be at least 10')
    .finite('Minimum bid increment must be a finite number')
    .refine((value) => value !== undefined, 'Minimum bid increment is required'),
})

export type ItemFormValues = z.infer<typeof itemValidationSchema>

export default itemValidationSchema
