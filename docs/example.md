# Complete Guide: Creating API Endpoints (Express + MongoDB)

## A Step-by-Step Beginner's Guide

---

## Table of Contents

1. [Introduction](#introduction)
2. [Project Setup](#project-setup)
3. [Step 1: Create a Database Model (Schema)](#step-1-create-a-database-model-schema)
4. [Step 2: Create Service Functions](#step-2-create-service-functions)
5. [Step 3: Write Unit Tests with Jest](#step-3-write-unit-tests-with-jest)
6. [Step 4: Create Express Routes](#step-4-create-express-routes)
7. [Step 5: Set Up the Express App](#step-5-set-up-the-express-app)
8. [Step 6: Start the Server](#step-6-start-the-server)
9. [Complete File Structure](#complete-file-structure)
10. [Testing Your API](#testing-your-api)
11. [Common Errors and Solutions](#common-errors-and-solutions)

---

## Introduction

This guide teaches you how to create REST API endpoints using the **MERN stack** (MongoDB, Express, React, Node.js). We'll build a blog posts API with full CRUD operations.

### What You'll Build

| HTTP Method | Endpoint | Purpose |
|-------------|----------|---------|
| GET | `/api/v1/posts` | Get all posts |
| GET | `/api/v1/posts/:id` | Get one post |
| POST | `/api/v1/posts` | Create a post |
| PATCH | `/api/v1/posts/:id` | Update a post |
| DELETE | `/api/v1/posts/:id` | Delete a post |

### Architecture Pattern (Data -> Service -> Route)

```text
Client Request -> Route Layer -> Service Layer -> Data Layer -> MongoDB

Route Layer:   Handles HTTP requests
Service Layer: Business logic
Data Layer:    Database operations
```

Each layer has one job. This makes code easier to test and maintain.

---

## Project Setup

### Prerequisites

Before starting, make sure you have installed:

- **Node.js** (v20.10.0)
- **Docker Desktop** (for running MongoDB)
- **VS Code** (recommended)
- **Git**

### Setup Step 0: Start MongoDB with Docker

Open a terminal and run:

```bash
# Pull and run MongoDB container
docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:6.0.4
```

This command:

- `-d` - Runs in background (detached mode)
- `--name dbserver` - Names the container `dbserver`
- `-p 27017:27017` - Maps port 27017 from container to your computer
- `--restart unless-stopped` - Auto-starts the database when Docker starts
- `mongo:6.0.4` - Uses MongoDB version 6.0.4

### Setup Step 1: Create Project Structure

```bash
# Create project folder
mkdir my-api
cd my-api

# Initialize npm project
npm init -y

# Create folder structure
mkdir -p src/db/models
mkdir -p src/services
mkdir -p src/routes
mkdir -p src/__tests__
```

Your folder structure should look like:

```text
my-api/
├── src/
│   ├── db/
│   │   ├── init.js
│   │   └── models/
│   │       └── post.js
│   ├── services/
│   │   └── posts.js
│   ├── routes/
│   │   └── posts.js
│   ├── __tests__/
│   │   └── posts.test.js
│   ├── app.js
│   └── index.js
├── package.json
├── .env
└── .gitignore
```

### Setup Step 2: Install Dependencies

```bash
# Core dependencies
npm install express@4.18.2 mongoose@8.0.2 dotenv@16.3.1 cors@2.8.5 body-parser@1.20.2

# Development dependencies
npm install --save-dev jest@29.7.0 nodemon@3.0.2 mongodb-memory-server@9.1.1
```

What each package does:

| Package | Purpose |
|---------|---------|
| express | Web framework for creating API routes |
| mongoose | Connects to MongoDB and creates data models |
| dotenv | Loads environment variables from `.env` file |
| cors | Allows frontend to call your API from different domains |
| body-parser | Parses JSON request bodies |
| jest | Testing framework |
| nodemon | Auto-restarts server when files change |
| mongodb-memory-server | In-memory database for testing |

### Setup Step 3: Configure package.json Scripts

Edit `package.json` and update the scripts section:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "NODE_OPTIONS=--experimental-vm-modules jest"
  }
}
```

### Setup Step 4: Create .env File

Create a `.env` file in your project root:

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/blog
```

Important: Add `.env` to `.gitignore` so you don't accidentally share credentials.

---

## Step 1: Create a Database Model (Schema)

A schema defines the structure of your data. Think of it like a blueprint for documents in your database.

### 1.1 Create Database Connection File

**File:** `src/db/init.js`

```javascript
import mongoose from 'mongoose'

export function initDatabase() {
  // Get database URL from environment variables
  const DATABASE_URL = process.env.DATABASE_URL

  // Listen for successful connection
  mongoose.connection.on('open', () => {
    console.info('Successfully connected to database:', DATABASE_URL)
  })

  // Listen for connection errors
  mongoose.connection.on('error', (err) => {
    console.error('Database connection error:', err)
  })

  // Connect to MongoDB
  const connection = mongoose.connect(DATABASE_URL)
  return connection
}
```

### 1.2 Create Post Model

**File:** `src/db/models/post.js`

```javascript
import mongoose, { Schema } from 'mongoose'

// Define the schema (blueprint for blog posts)
const postSchema = new Schema(
  {
    // Title - required field
    title: {
      type: String,
      required: true,        // Must be provided
      trim: true             // Removes whitespace from both ends
    },

    // Author - references the User model
    author: {
      type: Schema.Types.ObjectId,  // MongoDB Object ID
      ref: 'user',                   // References the 'user' collection
      required: true
    },

    // Content - optional field
    contents: {
      type: String,
      default: ''            // Empty string if not provided
    },

    // Tags - array of strings
    tags: [String],

  },
  {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
  }
)

// Create and export the model
// 'post' is the singular name - MongoDB will create a 'posts' collection
export const Post = mongoose.model('post', postSchema)
```

Understanding Schema Types:

| Type | Description | Example |
|------|-------------|---------|
| String | Text value | "Hello World" |
| Number | Numeric value | 42 |
| Boolean | True/false | true |
| Date | Date/time | 2024-01-01T00:00:00Z |
| ObjectId | Reference to another document | "507f1f77bcf86cd799439011" |
| [String] | Array of strings | ["react", "node"] |

---

## Step 2: Create Service Functions

Service functions contain the business logic. They talk to the database and perform CRUD operations.

**File:** `src/services/posts.js`

```javascript
import { Post } from '../db/models/post.js'

/**
 * Create a new blog post
 * @param {string} userId - ID of the logged-in user (from JWT)
 * @param {Object} postData - The post data (title, contents, tags)
 * @returns {Object} The created post
 */
export async function createPost(userId, { title, contents, tags }) {
  // Create a new Post instance
  const post = new Post({
    title,
    author: userId,      // Link to the user who created it
    contents,
    tags
  })

  // Save to database and return the saved document
  return await post.save()
}

/**
 * Get all posts with sorting options
 * @param {Object} options - Sorting options (sortBy, sortOrder)
 * @returns {Array} List of posts
 */
export async function listAllPosts(options = {}) {
  const { sortBy = 'createdAt', sortOrder = 'descending' } = options

  // Convert 'ascending' to 1, 'descending' to -1 for MongoDB
  const sortValue = sortOrder === 'ascending' ? 1 : -1

  // Find all posts, populate author info, apply sorting
  return await Post.find({})
    .populate('author', 'username')  // Replace author ID with actual user data
    .sort({ [sortBy]: sortValue })    // Sort by specified field
}

/**
 * Get a single post by ID
 * @param {string} postId - The post's MongoDB ID
 * @returns {Object|null} The post or null if not found
 */
export async function getPostById(postId) {
  return await Post.findById(postId)
    .populate('author', 'username')
}

/**
 * Update an existing post
 * @param {string} userId - ID of the logged-in user
 * @param {string} postId - ID of the post to update
 * @param {Object} updates - The fields to update
 * @returns {Object|null} The updated post or null
 */
export async function updatePost(userId, postId, { title, contents, tags }) {
  // Find post by ID AND ensure the current user is the author
  return await Post.findOneAndUpdate(
    { _id: postId, author: userId },  // Only update if user owns the post
    { $set: { title, contents, tags } },  // Update only specified fields
    { new: true }  // Return the updated document, not the original
  )
}

/**
 * Delete a post
 * @param {string} userId - ID of the logged-in user
 * @param {string} postId - ID of the post to delete
 * @returns {Object} Result with deletedCount property
 */
export async function deletePost(userId, postId) {
  // Only delete if the current user is the author
  return await Post.deleteOne({ _id: postId, author: userId })
}
```

Key Concepts Explained:

| Concept | Explanation |
|---------|-------------|
| populate() | Replaces an ObjectId reference with the actual document data |
| $set | MongoDB operator that updates only specified fields |
| { new: true } | Returns the updated document instead of the original |
| deleteOne() | Deletes the first document matching the filter |

---

## Step 3: Write Unit Tests with Jest

Testing ensures your service functions work correctly and continue to work when you make changes.

### 3.1 Configure Jest for ESM

**File:** `jest.config.json`

```json
{
  "testEnvironment": "node",
  "transform": {}
}
```

### 3.2 Create Test Setup

**File:** `src/__tests__/setup.js`

```javascript
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { initDatabase } from '../db/init.js'

let mongoServer

// Before all tests: start in-memory database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  process.env.DATABASE_URL = mongoServer.getUri()
  await initDatabase()
})

// After all tests: clean up
afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

// Before each test: clear database
beforeEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany()
  }
})
```

### 3.3 Write Post Tests

**File:** `src/__tests__/posts.test.js`

```javascript
import mongoose from 'mongoose'
import { createPost, listAllPosts, getPostById, updatePost, deletePost } from '../services/posts.js'
import { Post } from '../db/models/post.js'

// Import the setup (this runs before tests)
import './setup.js'

describe('Post Service Tests', () => {

  // Sample post data for testing
  const samplePost = {
    title: 'Test Post',
    contents: 'This is a test post content',
    tags: ['test', 'jest']
  }

  const userId = new mongoose.Types.ObjectId()  // Mock user ID

  describe('createPost()', () => {

    test('should create a post with all parameters', async () => {
      const createdPost = await createPost(userId, samplePost)

      // Verify the post was created with an ID
      expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId)
      expect(createdPost.title).toBe(samplePost.title)
      expect(createdPost.author.toString()).toBe(userId.toString())
    })

    test('should require a title', async () => {
      const invalidPost = { contents: 'No title here' }

      try {
        await createPost(userId, invalidPost)
        // If we get here, the test should fail
        expect(true).toBe(false)
      } catch (err) {
        // Expect a validation error
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      }
    })

    test('should auto-generate timestamps', async () => {
      const createdPost = await createPost(userId, samplePost)

      expect(createdPost.createdAt).toBeInstanceOf(Date)
      expect(createdPost.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('listAllPosts()', () => {

    test('should return empty array when no posts exist', async () => {
      const posts = await listAllPosts()
      expect(posts).toEqual([])
      expect(posts.length).toBe(0)
    })

    test('should return all posts', async () => {
      // Create 3 test posts
      await createPost(userId, { title: 'Post 1' })
      await createPost(userId, { title: 'Post 2' })
      await createPost(userId, { title: 'Post 3' })

      const posts = await listAllPosts()
      expect(posts.length).toBe(3)
    })

    test('should sort posts by newest first (default)', async () => {
      const post1 = await createPost(userId, { title: 'First' })

      // Wait a moment so timestamps are different
      await new Promise(resolve => setTimeout(resolve, 10))

      const post2 = await createPost(userId, { title: 'Second' })

      const posts = await listAllPosts()
      expect(posts[0].title).toBe('Second')  // Newest first
      expect(posts[1].title).toBe('First')
    })
  })

  describe('getPostById()', () => {

    test('should return a post by ID', async () => {
      const createdPost = await createPost(userId, samplePost)

      const foundPost = await getPostById(createdPost._id)

      expect(foundPost._id.toString()).toBe(createdPost._id.toString())
      expect(foundPost.title).toBe(samplePost.title)
    })

    test('should return null for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const foundPost = await getPostById(fakeId)

      expect(foundPost).toBeNull()
    })
  })

  describe('updatePost()', () => {

    test('should update a post', async () => {
      const createdPost = await createPost(userId, samplePost)

      const updated = await updatePost(userId, createdPost._id, {
        title: 'Updated Title'
      })

      expect(updated.title).toBe('Updated Title')
      expect(updated.contents).toBe(samplePost.contents)  // Unchanged
    })

    test('should not update if user is not the author', async () => {
      const createdPost = await createPost(userId, samplePost)
      const otherUserId = new mongoose.Types.ObjectId()

      const updated = await updatePost(otherUserId, createdPost._id, {
        title: 'Hacked Title'
      })

      expect(updated).toBeNull()  // Update fails
    })
  })

  describe('deletePost()', () => {

    test('should delete a post', async () => {
      const createdPost = await createPost(userId, samplePost)

      const result = await deletePost(userId, createdPost._id)

      expect(result.deletedCount).toBe(1)

      const checkPost = await Post.findById(createdPost._id)
      expect(checkPost).toBeNull()
    })

    test('should not delete if user is not the author', async () => {
      const createdPost = await createPost(userId, samplePost)
      const otherUserId = new mongoose.Types.ObjectId()

      const result = await deletePost(otherUserId, createdPost._id)

      expect(result.deletedCount).toBe(0)

      const checkPost = await Post.findById(createdPost._id)
      expect(checkPost).not.toBeNull()  // Post still exists
    })
  })
})
```

### 3.4 Run the Tests

```bash
npm test
```

```text
PASS  src/__tests__/posts.test.js
  Post Service Tests
    createPost()
      ✓ should create a post with all parameters
      ✓ should require a title
      ✓ should auto-generate timestamps
    listAllPosts()
      ✓ should return empty array when no posts exist
      ✓ should return all posts
      ✓ should sort posts by newest first (default)
    getPostById()
      ✓ should return a post by ID
      ✓ should return null for non-existent ID
    updatePost()
      ✓ should update a post
      ✓ should not update if user is not the author
    deletePost()
      ✓ should delete a post
      ✓ should not delete if user is not the author

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

---

## Step 4: Create Express Routes

Routes handle HTTP requests and call the appropriate service functions.

### 4.1 Install Additional Middleware

```bash
npm install express-jwt@8.4.1 bcrypt@5.1.1 jsonwebtoken@9.0.2
```

### 4.2 Create Authentication Middleware (Optional)

**File:** `src/middleware/jwt.js`

```javascript
import { expressjwt } from 'express-jwt'

// Middleware that requires a valid JWT
export const requireAuth = expressjwt({
  secret: () => process.env.JWT_SECRET,
  algorithms: ['HS256'],
})

// Middleware that optionally checks JWT (doesn't fail if missing)
export const optionalAuth = expressjwt({
  secret: () => process.env.JWT_SECRET,
  algorithms: ['HS256'],
  credentialsRequired: false,
})
```

### 4.3 Create Post Routes

**File:** `src/routes/posts.js`

```javascript
import {
  createPost,
  listAllPosts,
  getPostById,
  updatePost,
  deletePost
} from '../services/posts.js'
import { requireAuth } from '../middleware/jwt.js'

/**
 * Register all post-related routes
 * @param {Express} app - The Express application instance
 */
export function postsRoutes(app) {

  // GET /api/v1/posts - Get all posts (with optional filtering/sorting)
  app.get('/api/v1/posts', async (req, res) => {
    try {
      // Extract query parameters
      const { sortBy, sortOrder, author, tag } = req.query
      const options = { sortBy, sortOrder }

      // For now, just return all posts
      // (You can extend this to filter by author/tag)
      const posts = await listAllPosts(options)

      // Send JSON response
      return res.json(posts)

    } catch (err) {
      console.error('Error listing posts:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  })

  // GET /api/v1/posts/:id - Get a single post by ID
  app.get('/api/v1/posts/:id', async (req, res) => {
    try {
      const { id } = req.params
      const post = await getPostById(id)

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      return res.json(post)

    } catch (err) {
      console.error('Error getting post:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  })

  // POST /api/v1/posts - Create a new post (requires authentication)
  app.post('/api/v1/posts', requireAuth, async (req, res) => {
    try {
      // req.auth.sub contains the user ID from the JWT
      const userId = req.auth.sub
      const { title, contents, tags } = req.body

      const post = await createPost(userId, { title, contents, tags })

      // 201 Created status code
      return res.status(201).json(post)

    } catch (err) {
      console.error('Error creating post:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  })

  // PATCH /api/v1/posts/:id - Update a post (requires authentication)
  app.patch('/api/v1/posts/:id', requireAuth, async (req, res) => {
    try {
      const userId = req.auth.sub
      const { id } = req.params
      const { title, contents, tags } = req.body

      const post = await updatePost(userId, id, { title, contents, tags })

      if (!post) {
        return res.status(404).json({ error: 'Post not found or you are not the author' })
      }

      return res.json(post)

    } catch (err) {
      console.error('Error updating post:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  })

  // DELETE /api/v1/posts/:id - Delete a post (requires authentication)
  app.delete('/api/v1/posts/:id', requireAuth, async (req, res) => {
    try {
      const userId = req.auth.sub
      const { id } = req.params

      const result = await deletePost(userId, id)

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Post not found or you are not the author' })
      }

      // 204 No Content (successful deletion, no response body)
      return res.status(204).send()

    } catch (err) {
      console.error('Error deleting post:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  })
}
```

Understanding HTTP Status Codes:

| Status Code | Meaning | When to Use |
|-------------|---------|-------------|
| 200 OK | Success | GET, PATCH responses with body |
| 201 Created | Resource created | POST response |
| 204 No Content | Success, no body | DELETE response |
| 400 Bad Request | Invalid input | Missing required fields |
| 401 Unauthorized | Not authenticated | Missing/invalid JWT |
| 403 Forbidden | Authenticated but not allowed | Wrong user trying to edit |
| 404 Not Found | Resource doesn't exist | Post ID not found |
| 500 Internal Error | Server problem | Database connection error |

---

## Step 5: Set Up the Express App

**File:** `src/app.js`

```javascript
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { postsRoutes } from './routes/posts.js'

// Load environment variables from .env file
dotenv.config()

// Create Express application
const app = express()

// Middleware - runs for every request
app.use(cors())                    // Allow requests from different domains
app.use(bodyParser.json())         // Parse JSON request bodies

// Register our routes
postsRoutes(app)

// Export the app (so it can be used in index.js)
export { app }
```

What each middleware does:

| Middleware | Purpose |
|------------|---------|
| cors() | Allows your frontend (running on a different port) to call your API |
| bodyParser.json() | Automatically parses incoming JSON and puts it in req.body |

---

## Step 6: Start the Server

**File:** `src/index.js`

```javascript
import { app } from './app.js'
import { initDatabase } from './db/init.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Get port from environment or use 3000 as default
const PORT = process.env.PORT || 3000

// Function to start the server
async function startServer() {
  try {
    // Connect to database first
    await initDatabase()
    console.log('Database connected successfully')

    // Then start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
      console.log(`API endpoints available at http://localhost:${PORT}/api/v1/posts`)
    })

  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)  // Exit with error code
  }
}

// Start the server
startServer()
```

### Run the Server

Development mode (auto-restarts on changes):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Expected output:

```text
Database connected successfully
Server running on http://localhost:3000
API endpoints available at http://localhost:3000/api/v1/posts
```

---

## Complete File Structure

Here's the complete file structure with all the code we've written:

```text
my-api/
├── src/
│   ├── db/
│   │   ├── init.js                    # Database connection
│   │   └── models/
│   │       └── post.js                # Post schema
│   ├── services/
│   │   └── posts.js                   # Business logic
│   ├── routes/
│   │   └── posts.js                   # API route handlers
│   ├── middleware/
│   │   └── jwt.js                     # Authentication middleware
│   ├── __tests__/
│   │   ├── setup.js                   # Test configuration
│   │   └── posts.test.js              # Unit tests
│   ├── app.js                         # Express app setup
│   └── index.js                       # Server entry point
├── .env                               # Environment variables
├── .gitignore                         # Git ignore file
├── jest.config.json                   # Jest configuration
├── package.json                       # NPM dependencies
└── package-lock.json                  # Locked dependencies
```

---

## Testing Your API

### Using curl (Command Line)

```bash
# GET all posts
curl http://localhost:3000/api/v1/posts

# GET single post (replace ID with actual ID)
curl http://localhost:3000/api/v1/posts/507f1f77bcf86cd799439011

# POST create a new post (with JWT token)
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"My First Post","contents":"Hello World!","tags":["test"]}'

# PATCH update a post
curl -X PATCH http://localhost:3000/api/v1/posts/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Updated Title"}'

# DELETE a post
curl -X DELETE http://localhost:3000/api/v1/posts/POST_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Browser Console (JavaScript)

Open your browser's DevTools Console and run:

```javascript
// GET all posts
fetch('http://localhost:3000/api/v1/posts')
  .then(res => res.json())
  .then(console.log)

// POST create a post
fetch('http://localhost:3000/api/v1/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    title: 'Test from Browser',
    contents: 'This is a test',
    tags: ['browser', 'test']
  })
})
.then(res => res.json())
.then(console.log)
```

### Using Postman (GUI)

Download Postman from https://www.postman.com/

1. Create a new request.
2. Set the method (GET, POST, PATCH, DELETE).
3. Enter the URL: http://localhost:3000/api/v1/posts
4. For POST/PATCH, add a body (raw JSON).
5. For authenticated routes, add header: Authorization: Bearer YOUR_TOKEN
6. Click Send.

---

## Common Errors and Solutions

### Error: ECONNREFUSED - Cannot connect to MongoDB

Solution: Make sure Docker is running and the MongoDB container is started:

```bash
docker ps  # Check if dbserver is running
docker start dbserver  # Start if stopped
```

### Error: Cannot find module - Import issues

Solution: Make sure you're using ES modules. Add to `package.json`:

```json
{
  "type": "module"
}
```

### Error: JWT_SECRET is required - Missing environment variable

Solution: Add `JWT_SECRET` to your `.env` file:

```env
JWT_SECRET=your-super-secret-key-change-this-in-production
```

### Error: 401 Unauthorized - Missing or invalid JWT

Solution: You need to be logged in. First create a user and get a token.

```javascript
// Sign up
fetch('http://localhost:3000/api/v1/user/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'testuser', password: 'password123' })
})

// Login to get token
fetch('http://localhost:3000/api/v1/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'testuser', password: 'password123' })
})
.then(res => res.json())
.then(data => console.log('Token:', data.token))
```

### Error: ValidationError: Path title is required

Solution: You forgot to include the `title` field when creating a post. Always include required fields.

---

## Next Steps

Once you have mastered basic API endpoints, you can:

- Add filtering and pagination - Allow clients to filter by author/tag and paginate results
- Add input validation - Use libraries like joi or zod to validate request data
- Add logging - Use morgan or winston to log requests
- Add rate limiting - Prevent abuse with express-rate-limit
- Add API documentation - Use swagger-jsdoc to generate OpenAPI docs

---

## Summary

You've learned how to:

- Set up a Node.js project with Express and MongoDB
- Create Mongoose schemas to define your data structure
- Write service functions for business logic
- Write unit tests with Jest
- Create REST API routes with Express
- Add authentication middleware with JWT
- Start the server and test your API

This pattern (Data -> Service -> Route) is the foundation of professional backend development. Each layer has a single responsibility, making your code:

- Testable - Each layer can be tested in isolation
- Maintainable - Changes in one layer don't affect others
- Secure - Business logic is separated from HTTP handling
- Reusable - Service functions can be used by different routes

Happy coding.