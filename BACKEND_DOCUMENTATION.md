# Backend Technical Documentation

## Overview

This backend is a Node.js + Express application that provides user authentication, session management, note management, avatar upload, and password reset functionality.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- Celebrate/Joi for request validation
- Nodemailer for email sending
- Cloudinary for avatar uploads
- bcrypt for password hashing
- pino-http for request logging
- Helmet for security headers
- cookie-parser for cookie handling

## Project Structure

- `src/server.js` - application entry point
- `src/routes/` - route definitions
- `src/controllers/` - request handlers
- `src/models/` - Mongoose models
- `src/db/` - database connection
- `src/middleware/` - middleware functions
- `src/services/` - session/auth helper functions
- `src/utils/` - external service helpers (email, Cloudinary)
- `src/validations/` - request schemas
- `src/constants/` - shared constants
- `src/templates/` - email templates

## Entry Point

`src/server.js` configures the Express app and middleware:

- `cors` with allowed methods `GET`, `POST`, `PATCH`, `DELETE` and origin `*`
- `helmet` for security headers
- `pino-http` logger middleware
- `express.json()` for JSON request bodies
- `cookie-parser` for reading cookies
- route registration for auth, notes, and user APIs
- `notFoundHandler` and error handling middleware
- MongoDB connection via `connectMongoDB()`

## Database

### MongoDB Connection

- `src/db/connectMongoDB.js` connects via `process.env.MONGO_URL`
- synchronizes indexes for the `Note` model

### Models

#### User

Defined in `src/models/user.js`

Fields:
- `username` (optional, auto-filled from email if missing)
- `email` (required, unique)
- `password` (required)
- `avatar` (URL, default placeholder)
- timestamps

Behavior:
- `pre('save')` sets `username` to `email` if absent
- `toJSON()` removes `password` from serialized responses

#### Note

Defined in `src/models/note.js`

Fields:
- `title` (required)
- `content` (optional)
- `tag` (enum)
- `userId` (required, references `User`)
- timestamps

Indexes:
- compound index on `{ userId: 1, tag: 1 }`

#### Session

Defined in `src/models/session.js`

Fields:
- `userId` (required)
- `accessToken` (required)
- `refreshToken` (required)
- `accessTokenValidUntil` (required)
- `refreshTokenValidUntil` (required)

## Authentication and Session Flow

### Session creation

Implemented in `src/services/auth.js`

- generates `accessToken` and `refreshToken` as UUIDs
- stores tokens and expiration timestamps in `Session`
- sets cookies:
  - `accessToken`
  - `refreshToken`
  - `sessionId`
- cookies are `httpOnly`, `secure`, `sameSite: 'none'`

### Auth middleware

`src/middleware/authenticate.js` verifies:
- presence of `sessionId` and `accessToken`
- existence of session document
- access token expiration
- corresponding user existence
- attaches `req.user`

### Refresh flow

`POST /auth/refresh`

- verifies `sessionId` and `refreshToken` in cookies
- checks session validity and expiration
- deletes old session and issues a new one with fresh cookies

### Logout

`POST /auth/logout`

- deletes current session document if present
- clears auth cookies

## API Endpoints

### Auth routes (`src/routes/authRoutes.js`)

- `POST /auth/register`
  - request body: `{ email, password }`
  - creates user, creates session, sets cookies
  - response: created user object without password

- `POST /auth/login`
  - request body: `{ email, password }`
  - verifies credentials
  - deletes previous session, creates a new session, sets cookies
  - response: user object without password

- `POST /auth/refresh`
  - refresh session using cookies
  - response: `{ message: 'Session refreshed' }`

- `POST /auth/logout`
  - clears session and cookies
  - response: `204 No Content`

- `POST /auth/request-reset-email`
  - request body: `{ email }`
  - if email exists, sends reset link email
  - response: success message

- `POST /auth/reset-password`
  - request body: `{ token, password }`
  - verifies JWT reset token and updates password
  - deletes user sessions
  - response: success message

### Notes routes (`src/routes/notesRoutes.js`)

Protected by `authenticate`

- `GET /notes`
  - query params: `page`, `perPage`, `tag`, `search`
  - returns paginated notes for authenticated user

- `GET /notes/:noteId`
  - returns a single note by ID

- `POST /notes`
  - request body: `{ title, content?, tag? }`
  - creates a note for authenticated user

- `DELETE /notes/:noteId`
  - deletes the authenticated user's note by ID

- `PATCH /notes/:noteId`
  - request body may include `title`, `content`, `tag`
  - updates the authenticated user's note

### User routes (`src/routes/userRoutes.js`)

- `PATCH /users/me/avatar`
  - protected route
  - file: `avatar` field with image upload
  - uploads avatar to Cloudinary
  - updates user avatar URL
  - response: `{ url }`

## Validation

### Auth validation (`src/validations/authValidation.js`)

- registration: `email`, `password` (min 8)
- login: `email`, `password`
- request reset: `email`
- reset password: `token`, `password` (min 8)

### Notes validation (`src/validations/notesValidation.js`)

- pagination: `page`, `perPage`, optional `tag`, optional `search`
- create note: required `title`, optional `content`, optional `tag`
- note ID: valid MongoDB ObjectId
- update note: at least one of `title`, `content`, `tag`

## File Upload

- `src/middleware/multer.js` handles in-memory uploads
- accepts only image MIME types
- max file size: 2 MB
- avatar upload stored to Cloudinary with transformations and fixed folder

## Email Reset Flow

- `src/controllers/authController.js` generates JWT reset token containing `email` and `sub` (user ID)
- uses `src/templates/reset-password-email.html`
- sends email through SMTP transporter from `src/utils/sendMail.js`
- on reset, verifies token and updates hashed password

## Error Handling

- `src/middleware/notFoundHandler.js` returns `404` for unknown routes
- `src/middleware/errorHandler.js` handles `HttpError` and general errors
- uses Celebrate error middleware from `celebrate`

## Environment Variables

Required variables:

- `PORT`
- `MONGO_URL`
- `JWT_SECRET`
- `FRONTEND_DOMAIN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NODE_ENV`

## Notes

- The backend uses cookie-based session management rather than JWT access tokens.
- `refreshToken` expiration is set to 1 day, `accessToken` expiration is 15 minutes.
- CORS is currently configured to allow all origins (`*`).
- The default avatar is a placeholder URL if no avatar is uploaded.
