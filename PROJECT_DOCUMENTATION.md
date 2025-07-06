# Figma Clone - Project Documentation

## 🎨 Project Overview

**Figma Clone** is a collaborative design and prototyping web application built with modern web technologies. This project aims to replicate core Figma functionalities including real-time collaboration, design tools, and user management.

### 🚀 Key Features
- **Real-time Collaboration** - Multiple users can work simultaneously
- **Design Tools** - Vector graphics, shapes, text, and drawing capabilities
- **User Authentication** - Secure sign-in/sign-up with NextAuth.js
- **Room Management** - Create and manage collaborative workspaces
- **Modern UI** - Beautiful, responsive interface with Tailwind CSS

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.3.5** - React framework with App Router
- **React 19.0.0** - UI library with latest features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Modern utility-first CSS framework

### Backend & Database
- **PostgreSQL** - Primary database (hosted on Neon)
- **Prisma 6.11.1** - Database ORM and query builder
- **NextAuth.js 5.0.0-beta** - Authentication solution

### Development Tools
- **ESLint 9** - Code linting and formatting
- **Prettier** - Code formatting
- **Turbo** - Fast development server

### Security & Validation
- **Zod 3.25.74** - Schema validation
- **bcryptjs 3.0.2** - Password hashing

---

## 📁 Project Structure

```
figma-clone/
├── prisma/
│   └── schema.prisma           # Database schema definition
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts    # NextAuth API routes
│   │   ├── layout.tsx          # Root layout component
│   │   └── page.tsx            # Landing page
│   ├── server/                 # Server-side code
│   │   ├── auth/
│   │   │   ├── config.ts       # NextAuth configuration
│   │   │   └── index.ts        # Auth exports
│   │   ├── schemas/
│   │   │   └── auth.ts         # Zod validation schemas
│   │   └── db.ts               # Prisma client configuration
│   ├── styles/
│   │   └── globals.css         # Global CSS styles
│   └── env.js                  # Environment variables validation
├── .env                        # Environment variables
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
└── eslint.config.mjs           # ESLint configuration
```

---

## 🗄️ Database Schema

### Core Models

#### **User Model**
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  ownedRooms    Room[]    @relation("RoomOwner")
  roomInvites   RoomInvite[]
}
```

#### **Room Model** (Collaboration Workspaces)
```prisma
model Room {
  id          String       @id @default(cuid())
  owner       User         @relation("RoomOwner", fields: [ownerId], references: [id])
  ownerId     String
  createdAt   DateTime     @default(now())
  title       String       @default("Untitled")
  roomInvites RoomInvite[]
}
```

#### **Authentication Models**
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification

---

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Authentication
AUTH_SECRET="your-auth-secret"

# Database
DATABASE_URL="postgresql://user:password@host:port/database"
DATABASE_URL_UNPOOLED="postgresql://user:password@host:port/database"

# Liveblocks (Real-time Collaboration)
LIVEBLOCKS_PUBLIC_KEY="your-public-key"
LIVEBLOCKS_SECRET_KEY="your-secret-key"

# PostgreSQL Connection Details
PGHOST="your-host"
PGUSER="your-username"
PGDATABASE="your-database"
PGPASSWORD="your-password"
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd figma-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   ```
   http://localhost:3000
   ```

---

## 📝 Available Scripts

### Development
- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run preview` - Build and start production server

### Database Management
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:migrate` - Deploy migrations

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking
- `npm run check` - Run linting and type checking
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting

---

## 🔐 Authentication Flow

### NextAuth.js Configuration
- **Provider**: Credentials (email/password)
- **Session Strategy**: JWT
- **Database Adapter**: Prisma
- **Password Hashing**: bcryptjs

### Authentication Features
- User registration with email/password
- Secure password hashing
- JWT-based sessions
- Database session persistence
- Type-safe session management

---

## 🎨 Frontend Architecture

### App Router Structure
- **Layout**: Root layout with Inter font and global styles
- **Pages**: File-based routing with Next.js App Router
- **Components**: Reusable React components
- **Styling**: Tailwind CSS with utility classes

### Key Pages
- **Landing Page** (`/`) - Hero section with features and CTA
- **Authentication** - Sign in/sign up forms
- **Dashboard** - User workspace and projects
- **Collaboration Rooms** - Real-time design workspaces

---

## 🔄 Real-time Collaboration

### Liveblocks Integration
- Real-time cursors and presence
- Collaborative editing
- Room-based collaboration
- Conflict resolution

### Expected Features
- Live cursor tracking
- Real-time shape manipulation
- Collaborative drawing
- User presence indicators
- Room management

---

## 🛡️ Security Features

### Data Validation
- **Zod schemas** for runtime validation
- **TypeScript** for compile-time safety
- **Input sanitization** for user data

### Authentication Security
- **Password hashing** with bcryptjs
- **Secure sessions** with NextAuth.js
- **Environment variable validation**
- **CSRF protection** built-in

---

## 🚀 Deployment Considerations

### Database
- **Neon PostgreSQL** - Serverless PostgreSQL
- **Connection pooling** configured
- **Environment-specific URLs**

### Hosting Recommendations
- **Vercel** - Optimized for Next.js
- **Railway** - Database and app hosting
- **Netlify** - Static site deployment

---

## 📈 Future Enhancements

### Planned Features
- [ ] Advanced drawing tools (pen, bezier curves)
- [ ] Layer management system
- [ ] Export functionality (PNG, SVG, PDF)
- [ ] Team collaboration features
- [ ] Plugin system
- [ ] Version history
- [ ] Comments and feedback system
- [ ] Mobile responsive design tools

### Technical Improvements
- [ ] Performance optimization
- [ ] Offline capability
- [ ] Advanced caching strategies
- [ ] Microservices architecture
- [ ] Advanced real-time features

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes with proper typing
4. Run tests and linting
5. Submit a pull request

### Code Standards
- **TypeScript** for all new code
- **ESLint** configuration compliance
- **Prettier** formatting
- **Conventional commits** for git messages

---

## 📞 Support & Documentation

### Useful Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Project Status
- **Version**: 0.1.0
- **Status**: In Development
- **License**: Private

---

*Generated on ${new Date().toLocaleDateString()} by Project Analysis Tool*
