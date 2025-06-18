import { z } from 'zod'
import { UserRole, supabaseConfig } from '@/lib/supabase/config'

// Sign up validation schema
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(supabaseConfig.auth.security.minPasswordLength, 
      `Password must be at least ${supabaseConfig.auth.security.minPasswordLength} characters long`)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters long')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  role: z
    .nativeEnum(UserRole)
    .optional()
    .default(UserRole.CUSTOMER),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Sign in validation schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z
    .boolean()
    .optional()
    .default(false),
})

// Reset password validation schema
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

// Update password validation schema
export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(supabaseConfig.auth.security.minPasswordLength, 
      `Password must be at least ${supabaseConfig.auth.security.minPasswordLength} characters long`)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmNewPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
})

// Update profile validation schema
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters long')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  avatarUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
})

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required'),
  email: z
    .string()
    .email('Please enter a valid email address'),
})

// Type exports for forms
export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>

// Form field configurations for reusability
export const authFormFields = {
  email: {
    name: 'email' as const,
    type: 'email',
    placeholder: 'Enter your email address',
    label: 'Email Address',
    autoComplete: 'email',
  },
  password: {
    name: 'password' as const,
    type: 'password',
    placeholder: 'Enter your password',
    label: 'Password',
    autoComplete: 'current-password',
  },
  newPassword: {
    name: 'newPassword' as const,
    type: 'password',
    placeholder: 'Enter your new password',
    label: 'New Password',
    autoComplete: 'new-password',
  },
  confirmPassword: {
    name: 'confirmPassword' as const,
    type: 'password',
    placeholder: 'Confirm your password',
    label: 'Confirm Password',
    autoComplete: 'new-password',
  },
  fullName: {
    name: 'fullName' as const,
    type: 'text',
    placeholder: 'Enter your full name',
    label: 'Full Name',
    autoComplete: 'name',
  },
} as const 