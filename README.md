# 📚 ScholarFlow

> An intelligent academic article aggregator platform designed to help researchers and PhD students discover relevant scientific publications efficiently.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)

## Project overview

ScholarFlow is a full-stack web application that aggregates scientific publications from multiple academic sources (ArXiv, PubMed, CrossRef, CORE) and provides intelligent filtering, categorization, and personalized recommendations to help researchers stay updated with relevant publications in their field.

### Key Features

- **Intelligent search**: Full-text search powered by Elasticsearch
- **Advanced filtering**: Filter by date, citations, domain, journal impact factor
- **Visualizations**: Citation networks, trending topics, publication trends
- **Smart recommendations**: ML-based article suggestions based on user interests
- **Personal collections**: Organize articles in custom collections
- **Real-time notifications**: Get alerted when new relevant articles are published
- **Export options**: BibTeX, RIS, and annotated PDF exports
- **Dark mode**: Easy on the eyes during late-night research sessions

## Architecture

### Tech stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (relational data)
- Elasticsearch (full-text search)
- Redis (caching & queue management)
- Bull (job queue for scraping)
- JWT (authentication)

**Frontend:**
- React 18 + TypeScript
- Redux Toolkit (state management)
- React Query (data fetching)
- Tailwind CSS + Headless UI
- D3.js (data visualizations)
- Vite (build tool)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Jest + Supertest (testing)
- ESLint + Prettier (code quality)

### System Design

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Frontend  │ ───> │   Backend    │ ───> │   PostgreSQL    │
│   (React)   │ <─── │  (Node.js)   │ <─── │   Elasticsearch │
└─────────────┘      └──────────────┘      │     Redis       │
                             │              └─────────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │  Job Queue   │
                     │  (Scraping)  │
                     └──────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │ External APIs│
                     │ ArXiv/PubMed │
                     └──────────────┘
```

## Getting Started

### Prerequisites

- Node.js >= 20.x
- Docker & Docker Compose
- Git

### Installation


1. **Start infrastructure services (PostgreSQL, Redis, Elasticsearch)**

```bash
docker-compose up -d
```

2. **Setup Backend**

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

3. **Setup frontend**

```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/docs

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run tests with coverage
npm test -- --coverage
```

## Project Structure

```
scholarflow/
├── backend/          # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── jobs/         # Background jobs
│   │   └── utils/        # Helper functions
│   └── tests/        # Backend tests
│
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── features/     # Redux slices
│   │   ├── hooks/        # Custom React hooks
│   │   └── services/     # API clients
│   └── tests/        # Frontend tests
│
├── docker-compose.yml    # Docker services configuration
└── docs/                 # Additional documentation
```

## Configuration

### Environment variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/scholarflow
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 📚 API documentation

API documentation is available via Swagger UI at `/api/docs` when running the backend server.

### Key Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/articles` - List articles with filters
- `GET /api/v1/articles/:id` - Get article details
- `POST /api/v1/search` - Search articles
- `GET /api/v1/recommendations` - Get personalized recommendations
- `POST /api/v1/collections` - Create collection
- `GET /api/v1/collections` - List user collections

See [docs/API.md](./docs/API.md) for complete API reference.

## Development workflow

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Write clean, typed TypeScript code
- Follow ESLint rules
- Add tests for new features

3. **Run quality checks**
```bash
npm run lint
npm run format
npm test
```

4. **Commit with conventional commits**
```bash
git commit -m "feat: add article recommendation algorithm"
```

5. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

## Deployment

### Production build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist/ folder with a static server
```

### Deployment options

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, DigitalOcean App Platform
- **Database**: Railway PostgreSQL, Supabase, Neon
- **Search**: Elastic Cloud (free tier available)
