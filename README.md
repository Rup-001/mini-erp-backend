# Mini ERP — Backend API

TypeScript/Express REST API for inventory and sales management with JWT authentication and role-based access control.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (LTS) |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Auth | JWT + bcrypt |
| Validation | Zod |
| File Upload | Multer |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Logging | Winston + Morgan |
| Process Manager | PM2 |

## Prerequisites

- **Node.js** v18+ (LTS recommended)
- **MongoDB** running locally or a remote connection string
- **npm** or **yarn**

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set JWT_SECRET and MONGO_URI if needed

# 3. Seed demo data (users, products, sample sales)
npm run seed

# 4. Start development server
npm run dev
```

Server runs at **http://localhost:5000**

## Environment Variables

Create a `.env` file in the `backend/` root:

```ini
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mini-erp
JWT_SECRET=your_strong_secret_here
JWT_ACCESS_EXPIRATION_MINUTES=60
UPLOAD_DIR=public/uploads/products
MAX_FILE_SIZE_MB=5
CLIENT_URL=http://localhost:5173
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | `development` / `production` / `test` | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | — (required) |
| `JWT_SECRET` | Secret for signing JWT tokens | — (required) |
| `JWT_ACCESS_EXPIRATION_MINUTES` | Token expiry in minutes | `60` |
| `UPLOAD_DIR` | Product image upload directory | `public/uploads/products` |
| `MAX_FILE_SIZE_MB` | Max upload file size (MB) | `5` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start with hot-reload (ts-node-dev) |
| `build` | `npm run build` | Compile TypeScript to `dist/` |
| `start` | `npm start` | Run compiled production build |
| `seed` | `npm run seed` | Reset DB and insert demo data |

## Demo Data (Seed)

Running `npm run seed` clears existing data and creates:

### Users (3 roles)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mini-erp.com | Admin@123 |
| Manager | manager@mini-erp.com | Manager@123 |
| Employee | employee@mini-erp.com | Employee@123 |

### Products (12 items)

- Categories: Electronics, Stationery, Accessories
- Includes **low-stock** items (stock < 5) for dashboard testing
- Includes **out-of-stock** item (Webcam HD — 0 units)

### Sales (4 sample transactions)

- Created via the real transactional `createSale` service
- Stock is properly decremented
- Spread across Admin, Manager, and Employee users

## API Documentation

### Swagger UI

Start the server, then open:

**http://localhost:5000/api/v1/docs**

All endpoints are documented with request/response schemas, query parameters, and auth requirements.

### Postman Collection

Import these files into Postman:

```
postman/
├── Mini-ERP.postman_collection.json      # All API endpoints
└── Mini-ERP-Local.postman_environment.json  # Local env variables
```

**How to use:**

1. Import both the collection and environment into Postman
2. Select the **Mini ERP - Local** environment
3. Run **Auth → Login (Admin)** — the JWT token is saved automatically
4. Run any other request — Bearer auth is applied via collection variable `{{accessToken}}`
5. `productId` and `saleId` are auto-populated from list responses

The collection also includes **RBAC test** requests to verify 403 responses for unauthorized roles.

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login, returns `{ user, accessToken }` |
| GET | `/auth/me` | JWT | Current user profile |

### Products

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/products` | `product:read` | List with `?search=&category=&page=&limit=&sortBy=` |
| GET | `/products/:id` | `product:read` | Single product |
| POST | `/products` | `product:create` | Create (multipart, **image required**) |
| PATCH | `/products/:id` | `product:update` | Partial update (image optional) |
| DELETE | `/products/:id` | `product:delete` | Delete (Admin only) |

### Sales

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/sales` | `sale:create` | Create sale `{ items: [{ productId, quantity }] }` |
| GET | `/sales` | `sale:read` | List with `?page=&limit=&from=&to=` |
| GET | `/sales/:id` | `sale:read` | Single sale detail |

### Dashboard

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/dashboard/stats` | `dashboard:read` | `{ totalProducts, totalSales, totalRevenue, lowStockProducts }` |

## Response Format

Every endpoint returns a consistent envelope:

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products fetched successfully",
  "data": {
    "results": [],
    "pagination": { "page": 1, "limit": 10, "totalPages": 1, "totalResults": 5 }
  }
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Insufficient stock for SKU-1002",
  "errors": [{ "field": "items[0].quantity", "message": "Only 3 left in stock" }]
}
```

## Role & Permission Matrix

| Permission | Admin | Manager | Employee |
|---|:---:|:---:|:---:|
| `product:create` | ✅ | ✅ | ❌ |
| `product:read` | ✅ | ✅ | ✅ |
| `product:update` | ✅ | ✅ | ❌ |
| `product:delete` | ✅ | ❌ | ❌ |
| `sale:create` | ✅ | ✅ | ✅ |
| `sale:read` | ✅ | ✅ | ✅ |
| `dashboard:read` | ✅ | ✅ | ✅ |

## Project Structure

```
backend/
├── src/
│   ├── config/          # env, db, logger, passport, roles
│   ├── common/          # ApiError, ApiResponse, catchAsync, QueryBuilder
│   ├── middlewares/     # auth, rbac, validate, upload, error
│   ├── modules/
│   │   ├── auth/        # login, me
│   │   ├── user/        # User model
│   │   ├── product/     # CRUD + image upload
│   │   ├── sale/        # transactional sale creation
│   │   └── dashboard/   # aggregation stats
│   ├── docs/            # Swagger definitions
│   ├── routes/          # route mounting + swagger UI
│   ├── scripts/         # seed.ts
│   ├── app.ts
│   └── server.ts
├── postman/             # Postman collection + environment
├── public/uploads/      # Product images (dev)
├── ecosystem.config.json
├── .env.example
└── package.json
```


## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Config validation error` | Check `.env` has `MONGO_URI` and `JWT_SECRET` |
| `MongoDB connection error` | Ensure MongoDB is running on the URI port |
| `401 Unauthorized` | Token expired — re-login; default expiry is 60 min |
| `403 Forbidden` | User role lacks permission — check matrix above |
| `400 Product image is required` | POST `/products` must include `image` file in form-data |
| Swagger shows empty | Ensure server is running; docs are at `/api/v1/docs` |
| `Transaction numbers are only allowed on a replica set` | Local standalone MongoDB doesn't support transactions. Sale API auto-falls back in dev. For production, use MongoDB replica set or Atlas |