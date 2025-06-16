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

4. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

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

The platform uses a comprehensive 27-table PostgreSQL schema:

- **Core**: Users, Products, Categories, Orders
- **Inventory**: Warehouses, Stock tracking
- **Multilingual**: Languages, Translations
- **AI**: Content generation tracking
- **System**: Logs, Settings, Notifications

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
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
