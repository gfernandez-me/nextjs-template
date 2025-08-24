/**
 * User-related validation schemas for the Epic 7 Gear Optimizer
 * 
 * @see https://conform.guide/
 * @see https://nextjs.org/docs/app/guides/forms
 */

import { z } from "zod";
import { commonValidators, createFormSchema } from "./common";

/**
 * User registration schema
 */
export const userRegistrationSchema = createFormSchema({
  name: commonValidators.name,
  email: commonValidators.email,
  password: commonValidators.password,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * User login schema
 */
export const userLoginSchema = createFormSchema({
  email: commonValidators.email,
  password: z.string().min(1, "Password is required"),
});

/**
 * User profile update schema
 */
export const userProfileSchema = createFormSchema({
  name: commonValidators.name,
  email: commonValidators.email,
  image: commonValidators.optionalString(500),
});

/**
 * Password change schema
 */
export const passwordChangeSchema = createFormSchema({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: commonValidators.password,
  confirmNewPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

/**
 * Settings update schema
 */
export const userSettingsSchema = createFormSchema({
  fScoreIncludeMainStat: z.boolean().default(true),
  fScoreSubstatWeights: z.record(z.string(), z.number()).optional(),
  fScoreMainStatWeights: z.record(z.string(), z.number()).optional(),
  substatThresholds: z.record(z.string(), z.any()).optional(),
});

// Export types for use in components
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;

