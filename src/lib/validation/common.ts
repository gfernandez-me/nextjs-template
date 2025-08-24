/**
 * Common validation utilities for the Epic 7 Gear Optimizer
 *
 * @see https://nextjs.org/docs/app/guides/forms
 */

import { z } from "zod";

/**
 * Common validation patterns used across the application
 */
export const commonValidators = {
  // Email validation with proper error message
  email: z.string().email("Please enter a valid email address"),

  // Password validation (minimum 8 chars, at least one letter and number)
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    ),

  // Name validation (letters, spaces, hyphens, apostrophes)
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[A-Za-z\s\-']+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  // Positive integer validation
  positiveInt: z.coerce.number().int().positive("Must be a positive number"),

  // Optional string with max length
  optionalString: (maxLength: number = 255) =>
    z.string().max(maxLength).optional(),
};

/**
 * Utility to create a form schema with common fields
 */
export function createFormSchema<T extends z.ZodRawShape>(
  shape: T
): z.ZodObject<T> {
  return z.object(shape);
}

// Re-export zod for convenience
export { z };
