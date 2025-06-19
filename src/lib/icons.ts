// Centralized icon exports for Global Commerce
// This file provides a single source of truth for all icons used in the application

export {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  Banknote,
  // Dashboard & Analytics
  BarChart3,
  // Communication & Notifications
  Bell,
  BellRing,
  BoxSelect,
  Boxes,
  Brain,
  // Time & Calendar
  Calendar,
  // Status & Feedback
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Cloud,
  CloudDownload,
  CloudUpload,
  Cog,
  Copy,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Edit,
  Edit2,
  Euro,
  ExternalLink,
  Eye,
  EyeOff,
  // File & Data
  File,
  FileText,
  Filter,
  Folder,
  FolderOpen,
  Globe,
  Heart,
  HelpCircle,
  Home,
  Image,
  ImagePlus,
  Info,
  Key,
  LineChart,
  Link,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  // Location & Shipping
  MapPin,
  Maximize2,
  // Navigation & UI
  Menu,
  MessageSquare,
  Minimize2,
  Minus,
  Monitor,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Package,
  Package2,
  Palette,
  Phone,
  PieChart,
  Plane,
  // Product Management
  Plus,
  QrCode,
  Receipt,
  RefreshCw,
  Save,
  Scan,
  Search,
  Send,
  Server,
  // Settings & Configuration
  Settings,
  Shield,
  ShieldCheck,
  Ship,
  ShoppingBag,
  // E-commerce Specific
  ShoppingCart,
  Sliders,
  Sparkles,
  Star,
  Sun,
  Tag,
  Tags,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Unlink,
  Unlock,
  Upload,
  // User & Authentication
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  // Inventory & Warehouse
  Warehouse,
  X,
  XCircle,
  X as XIcon,
  // Miscellaneous
  Zap,
} from 'lucide-react'

// Icon size presets for consistent usage
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const

// Common icon props for consistent styling
export const iconProps = {
  size: iconSizes.md,
  strokeWidth: 2,
} as const

// Icon variants for different contexts
export const iconVariants = {
  default: {
    size: iconSizes.md,
    strokeWidth: 2,
  },
  small: {
    size: iconSizes.sm,
    strokeWidth: 2,
  },
  large: {
    size: iconSizes.lg,
    strokeWidth: 1.5,
  },
  button: {
    size: iconSizes.sm,
    strokeWidth: 2,
  },
  navigation: {
    size: iconSizes.md,
    strokeWidth: 1.5,
  },
} as const

export type IconSize = keyof typeof iconSizes
export type IconVariant = keyof typeof iconVariants

// Icons object for component usage
import * as LucideIcons from 'lucide-react'

export const Icons = {
  ...LucideIcons,
  // Add missing icons that might be used
  ArrowUpDown: LucideIcons.ArrowUpDown,
  ArrowUp: LucideIcons.ArrowUp,
  ArrowDown: LucideIcons.ArrowDown,
  Trash: LucideIcons.Trash2,
  Wifi: LucideIcons.Wifi,
  Bug: LucideIcons.Bug,
  Lightbulb: LucideIcons.Lightbulb,
  RotateCcw: LucideIcons.RotateCcw,
  MessageCircle: LucideIcons.MessageCircle,
  Github: LucideIcons.Github,
  Play: LucideIcons.Play,
}
