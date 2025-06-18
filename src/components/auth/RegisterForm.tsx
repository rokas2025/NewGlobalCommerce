'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icons } from '@/lib/icons'

import { authService } from '@/lib/auth/auth'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'
import { UserRole } from '@/lib/supabase/config'

export function RegisterForm() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: UserRole.CUSTOMER,
      agreeToTerms: false,
    },
  })

  const agreeToTerms = watch('agreeToTerms')
  const selectedRole = watch('role')

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
      })

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Show success message after registration
  if (success) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Icons.CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address. Please check your inbox and click
            the link to activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <Icons.Mail className="h-4 w-4" />
            <AlertDescription>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => setSuccess(false)}
              >
                try again
              </button>
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={() => router.push('/login')}>
            <Icons.ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">Create an account</CardTitle>
        <CardDescription className="text-center">
          Join Global Commerce and start your journey
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <Icons.AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              {...register('fullName')}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className="text-destructive text-sm">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <Select
              value={selectedRole}
              onValueChange={value => setValue('role', value as UserRole)}
            >
              <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.CUSTOMER}>
                  <div className="flex items-center space-x-2">
                    <Icons.User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Customer</div>
                      <div className="text-muted-foreground text-xs">
                        Browse and purchase products
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={UserRole.MANAGER}>
                  <div className="flex items-center space-x-2">
                    <Icons.Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Manager</div>
                      <div className="text-muted-foreground text-xs">
                        Manage products and orders
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={UserRole.ADMIN}>
                  <div className="flex items-center space-x-2">
                    <Icons.Shield className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Administrator</div>
                      <div className="text-muted-foreground text-xs">Full system access</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-destructive text-sm">{errors.role.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
            <div className="text-muted-foreground text-xs">
              Password must contain at least 8 characters with uppercase, lowercase, and numbers
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={agreeToTerms}
                onCheckedChange={checked => setValue('agreeToTerms', !!checked)}
                className={errors.agreeToTerms ? 'border-destructive' : ''}
              />
              <Label
                htmlFor="agreeToTerms"
                className="cursor-pointer text-sm leading-tight font-normal"
              >
                I agree to the{' '}
                <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-destructive text-sm">{errors.agreeToTerms.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid || !agreeToTerms}
          >
            {isLoading ? (
              <>
                <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Icons.UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">Or continue with</span>
            </div>
          </div>

          {/* Social Registration Buttons - Placeholder for future implementation */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" disabled>
              <Icons.Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" disabled>
              <Icons.Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <div className="text-muted-foreground w-full text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
