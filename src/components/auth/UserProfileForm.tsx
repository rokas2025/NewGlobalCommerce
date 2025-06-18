'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/lib/icons'

import { useAuth } from '@/hooks/useAuth'
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/validations/auth'

export function UserProfileForm() {
  const { user, updateProfile, isUpdatingProfile } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      avatarUrl: '',
    },
  })

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        avatarUrl: user.user_metadata?.avatar_url || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: UpdateProfileFormData) => {
    setError(null)
    setSuccess(false)

    try {
      await updateProfile({
        fullName: data.fullName,
        avatarUrl: data.avatarUrl || undefined,
      })
      setSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-muted-foreground flex items-center space-x-2">
            <Icons.Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and profile settings</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Success Alert */}
          {success && (
            <Alert>
              <Icons.CheckCircle className="h-4 w-4" />
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <Icons.AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(user.user_metadata?.full_name || user.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Profile Picture</h3>
              <p className="text-muted-foreground text-xs">
                Add a profile picture URL or upload an image
              </p>
            </div>
          </div>

          {/* Avatar URL Field */}
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              {...register('avatarUrl')}
              className={errors.avatarUrl ? 'border-destructive' : ''}
            />
            {errors.avatarUrl && (
              <p className="text-destructive text-sm">{errors.avatarUrl.message}</p>
            )}
          </div>

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

          {/* Email Field (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register('email')} disabled className="bg-muted" />
            <p className="text-muted-foreground text-xs">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>

          {/* User Role Display */}
          <div className="space-y-2">
            <Label>Account Type</Label>
            <div className="bg-muted/50 flex items-center space-x-2 rounded-md border p-3">
              {user.user_metadata?.role === 'admin' && (
                <Icons.Shield className="h-4 w-4 text-red-500" />
              )}
              {user.user_metadata?.role === 'manager' && (
                <Icons.Users className="h-4 w-4 text-blue-500" />
              )}
              {user.user_metadata?.role === 'customer' && (
                <Icons.User className="h-4 w-4 text-green-500" />
              )}
              <span className="font-medium capitalize">
                {user.user_metadata?.role || 'Customer'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUpdatingProfile || !isValid || !isDirty}
            className="w-full"
          >
            {isUpdatingProfile ? (
              <>
                <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Icons.Save className="mr-2 h-4 w-4" />
                Update Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
