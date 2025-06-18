import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password | Global Commerce',
  description: 'Reset your Global Commerce account password',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
