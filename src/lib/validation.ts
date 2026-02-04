import { z } from 'zod';

// Hello log validation schema
export const helloLogSchema = z.object({
  name: z.string().max(100, 'Name must be 100 characters or less').optional().nullable(),
  location: z.string().max(200, 'Location must be 200 characters or less').optional().nullable(),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional().nullable(),
  rating: z.enum(['positive', 'neutral', 'negative']).optional().nullable(),
  difficulty_rating: z.number().min(1).max(5).optional().nullable(),
  no_name_flag: z.boolean().optional(),
  linked_to: z.string().uuid().optional().nullable(),
  hello_type: z.string().max(50, 'Hello type must be 50 characters or less').optional().nullable(),
});

export type ValidatedHelloLog = z.infer<typeof helloLogSchema>;

// Person log validation schema
export const personLogSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
  tags: z.array(z.string().max(50, 'Each tag must be 50 characters or less')).max(20, 'Maximum 20 tags allowed').optional().nullable(),
});

export type ValidatedPersonLog = z.infer<typeof personLogSchema>;

// Challenge completion validation schema
export const challengeCompletionSchema = z.object({
  challenge_day: z.number().int().min(1).max(365),
  challenge_tag: z.string().max(100, 'Challenge tag must be 100 characters or less'),
  interaction_name: z.string().max(100, 'Name must be 100 characters or less').optional().nullable(),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional().nullable(),
  rating: z.enum(['positive', 'neutral', 'negative']),
  difficulty_rating: z.number().min(1).max(5).optional().nullable(),
});

export type ValidatedChallengeCompletion = z.infer<typeof challengeCompletionSchema>;

// Profile update validation schema
export const profileUpdateSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username must be 50 characters or less').optional(),
  profile_picture: z.string().max(255).optional().nullable(),
  hide_from_leaderboard: z.boolean().optional(),
  timezone_preference: z.string().max(20).optional().nullable(),
  timezone_auto_detect: z.boolean().optional(),
});

export type ValidatedProfileUpdate = z.infer<typeof profileUpdateSchema>;

// User progress validation schema (for why_here and other user-input fields)
export const userProgressInputSchema = z.object({
  why_here: z.string().max(500, 'Response must be 500 characters or less').optional().nullable(),
  username: z.string().max(50, 'Username must be 50 characters or less').optional().nullable(),
});

export type ValidatedUserProgressInput = z.infer<typeof userProgressInputSchema>;

// Helper function to safely validate and return validated data or throw descriptive error
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.errors[0];
    throw new Error(firstError?.message || 'Validation failed');
  }
  return result.data;
}

// Helper function to safely validate and return result object
export function validateSafe<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || 'Validation failed' };
  }
  return { success: true, data: result.data };
}
