# AI Text Platform

A full-stack AI text processing platform with Next.js frontend, Node.js backend API, and Python ML microservice.

## Features

- **Frontend**: React + TypeScript + Next.js with role-based routing
- **Backend**: Node.js + Express with JWT authentication and MVC architecture
- **ML Service**: Python FastAPI with pretrained NLP models
- **Database**: MongoDB with Mongoose ODM
- **Security**: Comprehensive authentication, authorization, and input validation
- **AI Features**: Grammar checking, translation, text humanization, and plagiarism detection

## Architecture

```
ai-text-platform/
├── frontend/             # Next.js React application
│   ├── app/             # Next.js 14 app directory
│   ├── components/      # Reusable UI components
│   ├── lib/            # Utilities and API client
│   ├── hooks/          # Custom React hooks
│   ├── public/         # Static assets
│   └── package.json
├── backend/             # Node.js Express API
│   ├── controllers/    # Request handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── middleware/     # Auth & validation
│   ├── config/         # Database config
│   └── package.json
├── ml-service/         # Python FastAPI ML service
│   ├── app/
│   │   ├── main.py     # FastAPI application
│   │   ├── routers/    # API endpoints
│   │   ├── services/   # ML model services
│   │   └── models/     # Pydantic schemas
│   └── requirements.txt
└── package.json        # Monorepo root
```

## Project Structure

```
├── controllers/          # Request handlers
│   ├── AuthController.js
│   ├── AIController.js
│   ├── HistoryController.js
│   ├── AdminController.js
│   └── AdminSettingsController.js
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── History.js
│   └── AppSettings.js
├── routes/              # API routes
│   ├── auth.js
│   ├── ai.js
│   ├── history.js
│   └── admin.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   ├── adminOnly.js
│   └── errorHandler.js
├── config/              # Configuration files
│   └── database.js
├── app.js               # Express app setup
├── server.js            # Server entry point
├── package.json
├── .env.example
└── README.md
```

## Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running locally or remote connection)
- **Python** (v3.8 or higher) - for ML services

### Quick Setup

1. **Clone and install all dependencies**
   ```bash
   git clone <repository-url>
   cd ai-text-platform
   npm run install:all
   ```

2. **Set up environment variables**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB URI and JWT secret

   # Frontend environment (optional)
   cp frontend/.env.example frontend/.env.local
   ```

3. **Start all services**
   ```bash
   npm run dev
   ```

This will start all three services concurrently:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`
- **ML Service:** `http://localhost:8001`

### Manual Setup

If you prefer to set up each service individually:

```bash
# Install dependencies
npm install                    # Root dependencies
cd frontend && npm install     # Frontend dependencies
cd ../backend && npm install   # Backend dependencies
cd ../ml-service && pip install -r requirements.txt

# Start services in separate terminals
cd ml-service && python run.py                    # Terminal 1
cd ../backend && npm run dev                      # Terminal 2
cd ../frontend && npm run dev                     # Terminal 3
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (protected)

### AI Processing (via ML Microservice)
All AI endpoints proxy requests to the Python FastAPI ML service:

- `POST /api/ai/grammar` - Check grammar using LanguageTool (protected)
- `POST /api/ai/translate` - Translate text using MarianMT models (protected)
- `POST /api/ai/humanize` - Humanize text with tone adaptation (protected)
- `POST /api/ai/plagiarism` - Check plagiarism using TF-IDF + cosine similarity (protected)

#### Supported Languages (Translation)
- English ↔ Spanish (en-es, es-en)
- English ↔ Hindi (en-hi, hi-en)
- English ↔ Korean (en-ko, ko-en)

#### Supported Tones (Humanization)
- **Professional**: Formal, business-appropriate language
- **Casual**: Conversational, friendly tone
- **Academic**: Scholarly, formal academic writing
- **Creative**: Imaginative, engaging expression

### History
- `GET /api/history/my` - Get user history (protected)

### Admin (Admin only)
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/block/:userId` - Block/unblock user
- `GET /api/admin/settings` - Get app settings
- `PUT /api/admin/settings` - Update app settings

### Health Check
- `GET /health` - Server health status

## Data Models

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: String (enum: "user", "admin", default: "user")
- `isBlocked`: Boolean (default: false)
- `createdAt`: Date

### History
- `userId`: ObjectId (ref: User)
- `actionType`: String (enum: "grammar", "translate", "humanize", "plagiarism")
- `inputText`: String
- `outputText`: String
- `metaData`: Object
- `createdAt`: Date

### AppSettings
- `grammarEnabled`: Boolean (default: true)
- `translationEnabled`: Boolean (default: true)
- `humanizeEnabled`: Boolean (default: true)
- `plagiarismEnabled`: Boolean (default: true)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "Error stack (development only)"
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Mongoose schema validation
- **CORS**: Configured for specific client URL
- **Helmet**: Security headers
- **Rate Limiting**: Ready for implementation
- **Role-based Access**: Admin-only routes protection

## Development

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Testing
```bash
npm test
```

### Code Quality
```bash
npm run lint
npm run lint:fix
```

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a production MongoDB URI
3. Set a strong, unique `JWT_SECRET`
4. Configure proper CORS settings
5. Set up process manager (PM2) for production
6. Enable HTTPS in production

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Create descriptive commit messages

## License

MIT License