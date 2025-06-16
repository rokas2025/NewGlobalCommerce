import { z } from "zod"

// Common validation patterns
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const requiredStringSchema = z
  .string()
  .min(1, "This field is required")
  .trim()

export const optionalStringSchema = z
  .string()
  .optional()
  .transform(val => val === "" ? undefined : val)

export const positiveNumberSchema = z
  .number()
  .positive("Value must be greater than 0")

export const nonNegativeNumberSchema = z
  .number()
  .min(0, "Value cannot be negative")

export const uuidSchema = z
  .string()
  .uuid("Invalid ID format")

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
  .min(1, "Slug is required")

export const skuSchema = z
  .string()
  .regex(/^[A-Z0-9-_]{3,20}$/, "SKU must be 3-20 characters, uppercase letters, numbers, hyphens and underscores only")
  .min(1, "SKU is required")

// Phone number validation
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
  .optional()

// URL validation
export const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .optional()
  .or(z.literal(""))
  .transform(val => val === "" ? undefined : val) 