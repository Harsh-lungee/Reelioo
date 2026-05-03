# Reelio Backend

Node.js + Express backend for Reelio.

## Folder Structure

```txt
backend/
  package.json
  .env
  server.js
  README.md
  src/
    config/
      cloudinary.js
      db.js
    data/
      mockData.js
    models/
      HireRequest.js
      Message.js
      User.js
    middleware/
      authMiddleware.js
    routes/
      authRoutes.js
      creatorRoutes.js
      hireRequestRoutes.js
      healthRoutes.js
      messageRoutes.js
      projectRoutes.js
      userRoutes.js
    utils/
      sanitizeUser.js
```

## Run

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` with your MongoDB Atlas connection string:

```txt
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/reelio?retryWrites=true&w=majority
JWT_SECRET=replace-this-with-a-long-random-secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

The API runs on:

```txt
https://reelioo.onrender.comhttps://reelioo.onrender.com
```

## Starter Endpoints

```txt
GET  /
GET  /api/health
POST /api/auth/signup
POST /api/auth/login
PUT  /api/users/profile
PUT  /api/users/profile-picture
GET  /api/users/search?q=&role=&location=&skill=
GET  /api/users/:id/profile
POST /api/users/:id/follow
POST /api/users/:id/unfollow
GET  /api/users/:id/followers
GET  /api/users/:id/following
GET  /api/creators
GET  /api/creators/top
GET  /api/creators/:id
POST /api/hire-requests
PATCH /api/hire-requests/:id/status
GET  /api/hire-requests/creator/:creatorId
GET  /api/hire-requests/client/:clientId
GET  /api/projects
POST /api/projects
GET  /api/messages
POST /api/messages
GET  /api/messages/conversation/:userId/:otherUserId
GET  /api/messages/inbox/:userId
POST /api/posts
GET  /api/posts/user/:userId
DELETE /api/posts/:id
```
