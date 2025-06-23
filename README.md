# Global Commerce - E-Commerce Platform

🚀 **Live Demo**: [Coming Soon - Deploy to Vercel]

A modern, AI-powered e-commerce platform built with Next.js 14, TypeScript, and Supabase.

## ✨ Features

- 🌍 **Multilingual Support** - Complete translation management with AI
- 🤖 **AI Integration** - Automated content generation and translations
- 📊 **Advanced Analytics** - Comprehensive dashboard and reporting
- 🏪 **Multi-Warehouse** - Sophisticated inventory management
- 💰 **Multi-Currency** - Real-time currency conversion
- 🔒 **Enterprise Security** - Role-based access with RLS
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **High Performance** - Serverless architecture

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React
- **State Management**: TanStack Query
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth with RLS
- **Storage**: Supabase Storage
- **AI**: OpenAI API
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/NewGlobalCommerce.git
   cd NewGlobalCommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Fill in your Supabase and OpenAI credentials
   ```

4. **Set up the database**
   ```bash
   # Push schema to Supabase
   npm run db:push
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 🔑 Default Login Credentials

The database is seeded with these demo users:

**Admin User**
- Email: `admin@globalcommerce.com` 
- Password: `admin123`
- Role: Full admin access

**Manager User**
- Email: `manager@globalcommerce.com`
- Password: `manager123` 
- Role: Product management

**Customer User**
- Email: `john.doe@example.com`
- Password: `customer123`
- Role: Limited customer access

### 💻 Windows PowerShell Commands

This project includes PowerShell-specific commands for Windows users:

```powershell
# Check environment files
Get-ChildItem -Name "*.env*"

# Start development server
npm run dev

# Database operations
npm run db:generate
npm run db:migrate  
npm run db:seed

# Code quality checks
npm run type-check
npm run lint
npm run format
```

📖 **See [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md) for complete setup instructions.**

## 📁 Project Structure

```
global-commerce/
├── src/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Utilities and configurations
│   │   ├── db/              # Database schema and connection
│   │   ├── supabase/        # Supabase clients
│   │   └── validations/     # Zod schemas
│   └── types/               # TypeScript type definitions
├── docs/                    # Project documentation
├── tasks/                   # Development tasks and PRD
├── drizzle/                 # Database migrations
└── public/                  # Static assets
```

## 🗄️ Database Schema

The platform uses a comprehensive **22-table** PostgreSQL schema with full relationships and indexes:

### **Core Tables (6)**
- `users`, `user_sessions` - User management and authentication
- `categories`, `products`, `product_categories`, `product_images` - Product catalog

### **E-commerce Tables (8)**
- `orders`, `order_items` - Order management
- `payments` - Payment processing
- `shipments`, `shipping_methods` - Shipping and logistics
- `warehouses`, `inventory` - Multi-warehouse inventory tracking

### **Advanced Features (8)**
- `languages`, `translations` - Multilingual content support
- `ai_generation_jobs` - AI content generation tracking
- `activity_logs`, `system_settings`, `notifications` - System management
- `support_tickets`, `support_ticket_messages` - Customer support
- `analytics_events` - User behavior tracking

### **Database Features**
- ✅ **22 tables** with proper relationships and foreign keys
- ✅ **10 enums** for data consistency
- ✅ **Comprehensive indexes** for performance optimization
- ✅ **JSONB fields** for flexible attribute storage
- ✅ **Migration system** with Drizzle ORM
- ✅ **Seed script** with sample development data

## 🔧 Available Scripts

### **Development**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server

### **Database**
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Drizzle Studio

### **Code Quality**
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript checks
- `npm run vercel:build` - Build for Vercel deployment

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub** (this repository)

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select this repository
   - Configure environment variables

3. **Environment Variables Required**:
   ```
   DATABASE_URL=your_supabase_database_url
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key (optional)
   ```

4. **Deploy** - Vercel will automatically deploy your application

### Custom Build Command

The project includes a custom build command that runs type checking and linting:

```bash
npm run vercel:build
```

## 📚 Documentation

- [Product Requirements Document](tasks/prd-global-commerce.md)
- [Development Tasks](tasks/tasks-prd-global-commerce-phase1.md)
- [UI Specifications](docs/ui-specifications.md)
- [Database Schema](docs/database-schema.md)
- [Development Roadmap](docs/roadmap.md)
- [Lithuanian Documentation](docs/dokumentacija-lietuviu.md)

## 🔐 Environment Setup

1. **Supabase Setup**
   - Create a new Supabase project
   - Run database migrations
   - Configure authentication

2. **OpenAI Setup** (Optional)
   - Get API key from OpenAI
   - Configure for AI features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- [Documentation](docs/)
- [Issues](https://github.com/[your-username]/NewGlobalCommerce/issues)
- [Discussions](https://github.com/[your-username]/NewGlobalCommerce/discussions)

---

**Global Commerce** - Building the future of e-commerce platforms with AI-powered automation and multilingual support.
