# Course Management REST API — University Assignment 2

A production-grade, modular **MVC (Model-View-Controller)** REST API built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**, featuring **JWT authentication**, **bcrypt password hashing**, relationship management, robust request validation, cascade delete protection, and comprehensive automated test coverage.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Folder Architecture (Modular MVC)](#folder-architecture-modular-mvc)
3. [Prerequisites](#prerequisites)
4. [Environment Configuration](#environment-configuration)
5. [MongoDB Setup Guide (Manual Steps)](#mongodb-setup-guide-manual-steps)
6. [Installation & Running](#installation--running)
7. [Running Automated Tests](#running-automated-tests)
8. [API Documentation & Endpoints](#api-documentation--endpoints)
9. [Consistent JSON Response Schema](#consistent-json-response-schema)
10. [Postman Testing & Five-Screenshot Evidence Checklist](#postman-testing--five-screenshot-evidence-checklist)

---

## 1. Project Overview

This project provides a complete backend system for managing educational courses and categories. Designed to adhere to university assignment criteria and real-world backend best practices, it includes:
- **Authentication**: User registration and login using JWT (`jsonwebtoken`) and salted bcrypt password hashing (`bcryptjs`). Passwords are never returned in responses.
- **Category Management**: Full CRUD operations with route protection and duplicate name prevention.
- **Course Management**: Full CRUD operations where each course references a validated Category ObjectId. Populated with category and creator details on retrieval.
- **Cascade Deletion Guard**: Prevents accidental deletion of a category if courses are still actively referencing it (returns HTTP 400 with a descriptive warning).
- **Centralized Error Handling**: Unified error handler and 404 router that safely intercept Mongoose `CastError` (malformed IDs), schema validation errors, duplicate keys (`11000`), malformed JSON syntax, and JWT expiration.
- **Automated Testing Suite**: Built with Jest and Supertest, utilizing an in-memory MongoDB runner for reliable, isolated CI/CD test execution.

---

## 2. Folder Architecture (Modular MVC)

The project strictly follows a decoupled MVC pattern with dedicated directories for models, controllers, routes, middleware, and configuration:

```
assignment2/
├── .env                          # Local environment variables (do not commit secrets)
├── .env.example                  # Template with documented environment variables
├── .gitignore                    # Prevents node_modules and .env from being tracked
├── package.json                  # Dependencies, scripts, and Jest configuration
├── postman_collection.json       # Exported Postman collection for all endpoints
├── README.md                     # Comprehensive documentation
├── src/
│   ├── app.js                    # Express app initialization, middlewares, and route mounting
│   ├── server.js                 # Server entry point and database connection listener
│   ├── config/
│   │   └── db.js                 # Mongoose MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile logic
│   │   ├── categoryController.js # Category CRUD and cascade delete prevention
│   │   └── courseController.js   # Course CRUD, category validation & population
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token verification and req.user binding
│   │   ├── errorHandler.js       # Centralized error handler & catch-all 404 handler
│   │   └── validateMiddleware.js # Input sanitizers, body validators & ObjectId checks
│   ├── models/
│   │   ├── User.js               # User schema with pre-save bcrypt hash & safe toJSON
│   │   ├── Category.js           # Category schema
│   │   └── Course.js             # Course schema referencing Category and User
│   ├── routes/
│   │   ├── authRoutes.js         # Routes mounted at /api/auth
│   │   ├── categoryRoutes.js     # Routes mounted at /api/categories
│   │   └── courseRoutes.js       # Routes mounted at /api/courses
│   └── utils/
│       ├── apiResponse.js        # Standardized JSON response generators (sendSuccess, sendError)
│       └── generateToken.js      # JWT signing utility
└── tests/
    ├── setup.js                  # In-memory MongoDB lifecycle setup & teardown
    ├── auth.test.js              # Registration, login, duplicate email, validation tests
    ├── categories.test.js        # Category CRUD, cascade guard, 401/404 tests
    ├── courses.test.js           # Course CRUD, foreign key checks, 401/404 tests
    └── errorHandling.test.js     # Malformed IDs, unknown routes, JWT tampering tests
```

---

## 3. Prerequisites

Before running the server, ensure you have:
1. **Node.js**: Version 18.x, 20.x, or higher installed (`node -v`).
2. **npm**: Version 9.x or higher (`npm -v`).
3. **MongoDB**: Either a local MongoDB instance or a free cloud cluster on MongoDB Atlas.
4. **Postman**: To import and run the included collection.

---

## 4. Environment Configuration

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your environment variables:

```ini
# Server listening port
PORT=5000

# MongoDB URI (Local or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/course_management_db

# Secret key used for signing JWT tokens (use a random string in production)
JWT_SECRET=super_secret_jwt_key_change_in_production_32char_minimum

# Token expiration duration
JWT_EXPIRES_IN=7d
```

> **Security Note:** Never commit `.env` containing production credentials to GitHub. `.gitignore` is already configured to exclude `.env`.

---

## 5. MongoDB Setup Guide (Manual Steps)

You can choose either **Option A (MongoDB Atlas - Cloud, Recommended)** or **Option B (Local MongoDB Community Server)**:

### Option A: MongoDB Atlas (Cloud - Free, No local installation required)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Shared Cluster**.
3. Under **Security > Database Access**, create a database user (e.g., username `admin`, password `yourStrongPassword`).
4. Under **Security > Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) for development.
5. In your cluster dashboard, click **Connect** > **Drivers** > **Node.js**.
6. Copy the connection string and paste it into `.env`:
   ```ini
   MONGODB_URI=mongodb+srv://admin:yourStrongPassword@cluster0.abcde.mongodb.net/course_management_db?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB Community Edition
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community) for your OS (Windows / macOS / Linux).
2. Start the MongoDB service:
   - **Windows**: Search for "Services" in Windows, find **MongoDB Server**, and click **Start** (or run `net start MongoDB` in admin terminal).
   - **macOS (Homebrew)**: Run `brew services start mongodb-community`.
   - **Linux**: Run `sudo systemctl start mongod`.
3. Set your `.env` connection string:
   ```ini
   MONGODB_URI=mongodb://127.0.0.1:27017/course_management_db
   ```

---

## 6. Installation & Running

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server

- **Development Mode (Auto-restarts with Nodemon on code changes)**:
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

Once started, the console will display:
```
===============================================
  Course Management REST API is running!
  Environment: development
  Local URL:   http://localhost:5000
  Health:      http://localhost:5000/api/health
===============================================
[MongoDB] Connected successfully to host: ...
```

---

## 7. Running Automated Tests

Run the full automated test suite containing over 30 test cases:

```bash
npm test
```

The tests cover:
- User registration (valid fields, duplicate email rejection, short password, invalid email format)
- User login (valid credentials, wrong password, nonexistent email, missing body)
- Password protection (confirming password hash is NEVER returned in responses)
- Category CRUD (creation, listing, lookup by ID, update, deletion)
- Category cascade guard (ensures category cannot be deleted while referenced by active courses)
- Course CRUD (creation with valid category, missing fields, nonexistent category rejection, lookup, update, deletion)
- Authentication enforcement (rejecting unauthenticated requests on protected routes with HTTP 401)
- Validation errors (HTTP 400 with field-level details)
- Malformed ObjectId handling (HTTP 400 CastError handling)
- Nonexistent resource ID handling (HTTP 404 for valid 24-character ObjectIds that don't exist)
- Unknown URL catch-all (HTTP 404)

---

## 8. API Documentation & Endpoints

**Base URL**: `http://localhost:5000`

### 8.1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user & issue JWT | `{ "name": "Jane", "email": "jane@edu.com", "password": "password123" }` |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT | `{ "email": "jane@edu.com", "password": "password123" }` |
| `GET` | `/api/auth/me` | Protected | Get logged-in user profile | None (`Authorization: Bearer <token>`) |

### 8.2. Category Routes (`/api/categories`)

| Method | Endpoint | Access | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/categories` | Protected | Create category | `{ "name": "Computer Science", "description": "Core CS" }` |
| `GET` | `/api/categories` | Public | Retrieve all categories | None |
| `GET` | `/api/categories/:id`| Public | Retrieve category by ID | None |
| `PUT` | `/api/categories/:id`| Protected | Update category | `{ "name": "CS & AI", "description": "Updated" }` |
| `DELETE`| `/api/categories/:id`| Protected | Delete category (blocked if courses exist) | None |

### 8.3. Course Routes (`/api/courses`)

| Method | Endpoint | Access | Description | Request Body / Query |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/courses` | Protected | Create course referencing a valid category | `{ "title": "DSA", "description": "Trees and Graphs", "category": "<categoryId>", "price": 49.99 }` |
| `GET` | `/api/courses` | Public | List all courses (populated with category) | Optional query: `?category=<id>` or `?search=DSA` |
| `GET` | `/api/courses/:id` | Public | Retrieve course by ID | None |
| `PUT` | `/api/courses/:id` | Protected | Update course fields | `{ "title": "Advanced DSA", "price": 59.99 }` |
| `DELETE`| `/api/courses/:id` | Protected | Delete course | None |

### 8.4. System Routes

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Welcome & API route index |
| `GET` | `/api/health` | Public | Service health & uptime status |

---

## 9. Consistent JSON Response Schema

All responses adhere to a consistent structure:

### Successful Response (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "671df89b9e1a2f3c4d5e6f7a",
    "title": "Data Structures & Algorithms",
    "description": "Comprehensive course on algorithms.",
    "category": {
      "_id": "671df87a9e1a2f3c4d5e6f70",
      "name": "Computer Science",
      "description": "Core computing fundamentals"
    },
    "price": 49.99,
    "instructor": "Jane Doe",
    "createdAt": "2026-10-27T11:00:00.000Z",
    "updatedAt": "2026-10-27T11:00:00.000Z"
  }
}
```

### Error Response (HTTP 400 / 401 / 404 / 409 / 500)
```json
{
  "success": false,
  "message": "Validation failed: Please provide all required fields correctly",
  "errors": [
    { "field": "title", "message": "Course title is required" },
    { "field": "category", "message": "Category ID is required" }
  ]
}
```

---

## 10. Postman Testing & Five-Screenshot Evidence Checklist

A complete Postman collection is included in the project root: `postman_collection.json`.

### How to Import Postman Collection:
1. Open Postman.
2. Click **Import** (top left).
3. Drag and drop `postman_collection.json` into Postman.
4. When you execute **Register User** or **Login User**, the test script **automatically saves the returned JWT token** to the `{{token}}` collection variable.
5. When you execute **Create Category** or **Create Course**, their IDs are automatically saved to `{{category_id}}` and `{{course_id}}` for immediate use in subsequent requests!

### Five-Screenshot Postman Evidence Checklist (For Assignment Submission):

| # | Test Scenario | Request Endpoint & Method | Headers & Body Highlights | Expected Response Status & Evidence |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **User Registration & Token Generation** | `POST /api/auth/register` | Body with `name`, `email`, `password` | **HTTP 201 Created**: JSON returns `token` and `user` object without exposing password hash. |
| **2** | **Category Creation (Protected)** | `POST /api/categories` | Header: `Authorization: Bearer {{token}}`<br>Body: `name`, `description` | **HTTP 201 Created**: Category is saved and returned with `_id` and timestamps. |
| **3** | **Course Creation with Category Reference** | `POST /api/courses` | Header: `Authorization: Bearer {{token}}`<br>Body with `title`, `description`, `category` | **HTTP 201 Created**: Course created; `category` field is populated with category details. |
| **4** | **Input Validation / Missing Fields Error** | `POST /api/courses` | Header: `Authorization: Bearer {{token}}`<br>Body: `{}` (empty JSON) | **HTTP 400 Bad Request**: Centralized error handler returns `errors` array indicating missing `title`, `description`, `category`. |
| **5** | **Cascade Delete Guard or 404 Handling** | `DELETE /api/categories/{{category_id}}` (while course exists)<br>*OR*<br>`GET /api/courses/654321098765432109876543` | Header: `Authorization: Bearer {{token}}` | **HTTP 400 Bad Request**: "Cannot delete category: It is referenced by active course(s)"<br>*OR*<br>**HTTP 404 Not Found**: Resource not found with ID. |
