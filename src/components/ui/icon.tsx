import type { LucideIcon } from 'lucide-react'

import { iconVariants, type IconVariant } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface IconProps {
  icon: LucideIcon
  variant?: IconVariant
  className?: string
  size?: number
  strokeWidth?: number
}

export function Icon({
  icon: IconComponent,
  variant = 'default',
  className,
  size,
  strokeWidth,
  ...props
}: IconProps) {
  const variantProps = iconVariants[variant]

  return (
    <IconComponent
      size={size ?? variantProps.size}
      strokeWidth={strokeWidth ?? variantProps.strokeWidth}
      className={cn('flex-shrink-0', className)}
      {...props}
    />
  )
}

// Usage examples:
// <Icon icon={Home} variant="navigation" />
// <Icon icon={ShoppingCart} className="text-brand-600" />
// <Icon icon={Plus} variant="button" />
