# AI BlogNest API

A secure MERN-compatible backend REST API for managing users, blog posts, categories, comments and analytics, with an optional Google Gemini AI content-generation endpoint.

## Technology

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Express Validator
- Helmet
- Morgan
- CORS
- Rate Limiting
- Google Gemini API (optional)

## Project Structure

```text
AI-BlogNest-API/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Analytics.js
│   ├── Category.js
│   ├── Comment.js
│   ├── Post.js
│   └── User.js
├── routes/
│   ├── aiRoutes.js
│   ├── analyticsRoutes.js
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── commentRoutes.js
│   └── postRoutes.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Copy `.env.example` to `.env` and set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/blognest
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
```

### 3. Start the server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Server:

```text
http://localhost:5000
```

## Main API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Posts

- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/posts/admin/all`

### Categories

- `GET /api/categories`
- `POST /api/categories` - Admin
- `PUT /api/categories/:id` - Admin
- `DELETE /api/categories/:id` - Admin

### Comments

- `GET /api/comments/post/:postId`
- `POST /api/comments`
- `DELETE /api/comments/:id`

### Analytics

- `GET /api/analytics/summary` - Admin
- `GET /api/analytics/events` - Admin

### AI

- `POST /api/ai/generate`

The AI endpoint requires `GEMINI_API_KEY`.

## Postman

Use:

```text
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

for protected routes.

## Notes

- The first registered account receives the normal `user` role.
- To create an admin for testing, update the user's `role` field to `admin` in MongoDB.
- Never commit `.env` or API keys to GitHub.
- The AI route uses the Gemini REST API and requires a Node version with built-in `fetch` support. Node.js 18+ is recommended for the AI endpoint.
