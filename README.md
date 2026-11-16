# 🏠 Stayora - Premium Property Booking Platform

A production-level full-stack property booking platform built with modern technologies. Experience premium accommodations with a clean, trustworthy, and highly interactive interface.

## 🚀 Features

### Core Functionality
- **Authentication System** - JWT-based auth with refresh tokens
- **Property Listings** - Create, manage, and browse properties
- **Advanced Search** - Location, dates, guests, filters, and map integration
- **Booking System** - Real-time availability and secure reservations
- **Reviews & Ratings** - Comprehensive review system
- **Wishlist** - Save and manage favorite properties
- **User Dashboard** - Manage bookings, properties, and profile
- **Admin Panel** - Platform management and analytics

### Technical Features
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Live availability and notifications
- **Map Integration** - Interactive property locations
- **Image Optimization** - Fast loading with Next.js Image
- **SEO Optimized** - Server-side rendering and metadata
- **Security** - Rate limiting, CORS, Helmet protection
- **Performance** - Optimized queries and caching

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **Axios** - API client
- **React Hook Form** - Form handling
- **Mapbox** - Interactive maps

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **PostgreSQL** - Primary database
- **Prisma ORM** - Database toolkit
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Winston** - Logging
- **Zod** - Schema validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **ESLint & Prettier** - Code quality
- **GitHub Actions** - CI/CD (coming soon)

## 🏗️ Project Structure

```
stayora/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── prisma/          # Database schema & seeds
│   ├── logs/                # Application logs
│   └── Dockerfile
├── frontend/stayora/        # Next.js frontend
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities & API client
│   └── Dockerfile
├── docker-compose.yml       # Development environment
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd stayora
```

### 2. Environment Setup

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Frontend (.env.local)**
```bash
cd frontend/stayora
cp .env.local.example .env.local
# Add your Mapbox token and API URL
```

### 3. Docker Development (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Manual Setup (Alternative)

**Database Setup**
```bash
# Start PostgreSQL (or use your existing instance)
docker run --name stayora-postgres -e POSTGRES_DB=stayora -e POSTGRES_USER=stayora_user -e POSTGRES_PASSWORD=stayora_password -p 5432:5432 -d postgres:15-alpine
```

**Backend Setup**
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

**Frontend Setup**
```bash
cd frontend/stayora
npm install
npm run dev
```

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

## 🔐 Test Accounts

After running the seed script, you can use these test accounts:

```
Admin: admin@stayora.com / password123
Host:  host@stayora.com / password123
Guest: guest@stayora.com / password123
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - Authentication and profiles
- **Properties** - Accommodation listings
- **Bookings** - Reservations and stays
- **Reviews** - Ratings and feedback
- **Amenities** - Property features
- **Wishlists** - Saved properties

## 🔧 Development

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

## 🚀 Deployment

### Production Environment Variables

**Backend**
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Frontend**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend/stayora
npm run test
```

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Image Optimization**: Next.js Image with WebP/AVIF
- **Code Splitting**: Automatic route-based splitting
- **Caching**: API response caching and static asset optimization

## 🔒 Security

- **Authentication**: JWT with HTTP-only cookies
- **Authorization**: Role-based access control
- **Rate Limiting**: API endpoint protection
- **CORS**: Configured for production
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **SQL Injection**: Prisma ORM protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from modern booking platforms
- Icons by Lucide React
- Images from Unsplash
- Built with love and modern web technologies

---

**Built with ❤️ for the modern web**