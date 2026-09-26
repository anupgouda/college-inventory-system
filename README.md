 r"""# 🏫 College Inventory Management System

A full-stack **College Inventory Management System** designed to digitize and centralize college inventory, procurement, asset, material movement, approval, and user-management workflows.

The system provides a responsive React frontend, Node.js/Express REST APIs, PostgreSQL persistence through Supabase, JWT authentication, role-based access control, protected routes, and isolated demo data.

---

## 🚀 Live Application

### 🌐 Frontend

**College Inventory Management System**

https://college-inventory-system.vercel.app/

### ⚙️ Backend API

**College Inventory Backend**

https://college-inventory-backend-vroz.onrender.com/

### 📦 GitHub Repository

https://github.com/anupgouda/college-inventory-system

---

# 📌 Project Overview

The College Inventory Management System is built to manage the complete flow of college inventory and procurement operations from a centralized web application.

The system covers:

- User authentication
- Role-based authorization
- Dashboard and inventory statistics
- Indent creation and approval
- Stock management
- Material checkout and return tracking
- Vendor management
- Quotation management
- Purchase order management
- Bill management
- Asset management
- Reports
- Notifications
- User management
- Demo environment with isolated demo data
- Production deployment

The application separates responsibilities by user role so that users can only access the modules and operations relevant to their responsibilities.

---

# ✨ Major Features

## 🔐 1. Authentication & Authorization

The application uses JWT-based authentication and protected API routes.

### Features

- Secure login
- Public registration for Faculty accounts
- Password hashing using `bcryptjs`
- JWT token generation
- JWT token verification
- Protected frontend routes
- Protected backend API routes
- Role-based authorization
- Active/inactive user accounts
- Authentication persistence using browser storage
- Automatic authenticated API requests
- User information stored with role and department

### Registration Security

Public registration always creates a **Faculty** account.

Privileged roles such as:

- Admin
- HOD
- IT
- Principal
- Store Manager

are assigned through the Admin User Management module rather than allowing users to select privileged roles during public registration.

---

# 👥 2. User Management

The Admin has a dedicated **User Management** module.

### Admin capabilities

- View all system users
- Create users
- Assign roles
- Assign departments
- Activate users
- Deactivate users
- Delete users
- View account status
- View Demo/Regular account type
- Prevent changing the current Admin account status
- Prevent deleting the current Admin account
- Prevent deactivating the last active Admin
- Prevent deleting the last active Admin

### Supported roles

- Admin
- HOD
- IT
- Principal
- Faculty
- Store Manager

### User Management API

```text
GET    /api/users
POST   /api/users
PATCH  /api/users/:id/status
DELETE /api/users/:id

All User Management endpoints require authentication and Admin authorization.

🎭 3. Role-Based Access Control

The system implements RBAC at both the frontend and backend.

Frontend role protection controls which pages and navigation items are visible.

Backend authorization provides the actual security boundary and rejects unauthorized API operations with HTTP 403.

Role Responsibilities
Role	Main Responsibilities
Admin	Full system access, user management, inventory, procurement, assets, approvals and configuration
HOD	Department requests, indent approval, asset/material operations
IT	Technical inventory, asset management and asset status operations
Principal	Higher-level approval workflows
Faculty	Inventory requests, material checkout and permitted inventory operations
Store Manager	Stock, vendors, quotations, purchase orders, bills and procurement
Permission Summary
| Module                | Admin | HOD |  IT | Principal | Faculty | Store Manager |
| --------------------- | :---: | :-: | :-: | :-------: | :-----: | :-----------: |
| Dashboard             |   ✅   |  ✅  |  ✅  |     ✅     |    ✅    |       ✅       |
| Indent View           |   ✅   |  ✅  |  ✅  |     ✅     |    ✅    |       ✅       |
| Create Indent         |   ✅   |  ✅  |  ❌  |     ❌     |    ❌    |       ✅       |
| Approve/Reject Indent |   ✅   |  ✅  |  ❌  |     ✅     |    ❌    |       ✅       |
| Delete Indent         |   ✅   |  ❌  |  ❌  |     ❌     |    ❌    |       ✅       |
| Stock View            |   ✅   |  ✅  |  ✅  |     ✅     |    ✅    |       ✅       |
| Create Stock          |   ✅   |  ❌  |  ✅  |     ❌     |    ❌    |       ✅       |
| Delete Stock          |   ✅   |  ❌  |  ❌  |     ❌     |    ❌    |       ✅       |
| Asset View            |   ✅   |  ✅  |  ✅  |     ✅     |    ✅    |       ✅       |
| Create/Update Asset   |   ✅   |  ✅  |  ✅  |     ❌     |    ❌    |       ✅       |
| Delete Asset          |   ✅   |  ❌  |  ✅  |     ❌     |    ❌    |       ✅       |
| Material Checkout     |   ✅   |  ✅  |  ✅  |     ❌     |    ✅    |       ✅       |
| Vendor Management     |   ✅   |  ❌  |  ❌  |     ❌     |    ❌    |       ✅       |
| Quotations            |   ✅   |  ❌  |  ❌  |     ❌     |    ❌    |       ✅       |
| Purchase Orders       |   ✅   |  ❌  |  ❌  |     ❌     |    ❌    |       ✅       |
| Bills                 |   ✅   |  ❌  |  ❌  |     ❌     |    ❌    |       ✅       |
| Reports               |   ✅   |  ✅  |  ✅  |     ✅     |    ✅    |       ✅       |
| User Management       |   ✅   |  ❌  |  ❌  |     ❌     |    ❌    |       ❌       |


Backend authorization remains authoritative even if a frontend page is accessed manually.

📊 4. Dashboard

The dashboard provides an overview of important inventory and procurement information.

Dashboard statistics
Pending approvals
Low-stock items
Open purchase orders
Total assets
Total vendors
Total stock

The dashboard uses authenticated API requests and returns data according to the logged-in environment.

📋 5. Indent Management

The Indent Management module handles inventory requests.

Features
Create inventory indents
Select department/branch
Add requested item descriptions
Specify quantities
View submitted indents
Track indent status
Approve indents
Reject indents
Delete indents according to role permissions
Department-level request workflow
Statuses
Pending
Approved
Rejected
Workflow
Create Indent
     ↓
Pending
     ↓
Approval
     ├── Approved
     └── Rejected
📦 6. Stock Management

Stock Entry manages inventory received and stored by the college.

Features
Add stock
Item name
Category
Quantity
Unit price
Automatic total price calculation
Storage location
Entry date
Invoice number
Purchase order reference
View stock
Delete stock according to permissions
🏢 7. Vendor Management

Vendor Master stores supplier information.

Features
Vendor code
Vendor name
Contact person
Email
Phone
GST number
Address
Create vendors
Update vendors
Delete vendors
Vendor references for quotations, purchase orders and bills
💰 8. Quotation Management

Quotation Master manages quotations received from vendors.

Features
Create quotations
Select vendor
Quotation number
Quotation date
Item name
Quantity
Unit price
Automatic total calculation
Valid-until date
Approve quotations
Reject quotations
Track quotation status
Update quotation records
Statuses
Pending
Approved
Rejected
Expired
🛒 9. Purchase Order Management

Purchase Order Management handles purchase orders created for vendors.

Features
Generate purchase orders
Unique PO number
Select vendor
Order date
Expected delivery date
Item name
Quantity
Unit price
Automatic total amount
Notes
Approval
Receiving
Cancellation
Status tracking
Statuses
Open
Approved
Received
Cancelled
Procurement relationship
Indent
   ↓
Quotation
   ↓
Purchase Order
   ↓
Bill
   ↓
Payment / Completion

Purchase orders can also be referenced by bills.

🧾 10. Bill Management

Bill Master manages vendor bills and payment status.

Features
Create bills
Bill number
Vendor reference
Purchase order reference
Bill date
Due date
Item name
Quantity
Unit price
Automatic total amount
Approve bills
Track payment status
Cancel bills
Update bill status
Statuses
Pending
Approved
Paid
Cancelled
🖥️ 11. Asset Management

Asset Master manages long-term college assets.

Features
Asset code
Asset name
Category
Department
Location
Quantity
Assigned user
Purchase date
Purchase price
Asset condition
Asset status
Description
Create assets
Update assets
Delete assets
Track maintenance status
Track disposed assets
Condition values
New
Good
Fair
Damaged
Status values
Available
Assigned
Under Maintenance
Disposed
🔄 12. Material Checkout

Material Checkout tracks materials issued to departments/users.

Features
Item name
Department
Quantity
Checkout date
Expected return date
Purpose
Checkout status
Return tracking
Overdue tracking
Checkout history
Status updates
Statuses
Checked Out
Returned
Overdue
📈 13. Reports

The Reports module provides authenticated inventory and procurement reporting.

Reports cover areas such as:

Indents
Stock
Material checkout
Assets
Vendors
Quotations
Purchase orders
Bills
Inventory activity
🔔 14. Notifications

The application includes notification support for system activities such as:

Inventory-related events
Approval-related events
Procurement-related events
System activity
⚙️ 15. Settings & Profile

The application includes settings and profile areas for authenticated users.

Profile
User information
Role
Department
Account information
Settings
Application settings
Authentication-related settings
User preferences
🧪 16. Demo Environment & Data Isolation

A separate demo environment is implemented using a dedicated PostgreSQL demo schema in the same Supabase database.

This keeps demo data isolated from normal production data.

Data separation
Normal/Admin User
       ↓
   public schema
       ↓
Production Data


Demo User
       ↓
   demo schema
       ↓
Demo Data

The backend determines the database environment from the authenticated JWT.

Demo isolation

Demo users work with:

Demo indents
Demo stock
Demo checkouts
Demo vendors
Demo quotations
Demo purchase orders
Demo bills
Demo assets

Demo operations do not modify normal production records.

The demo user itself remains stored in the main users table and is identified using the is_demo flag.

🏗️ System Architecture
### 🔎 Interactive Architecture Diagram

Explore the complete system architecture through an interactive Archify diagram:

👉 👉 **[Open Interactive Architecture Diagram](https://anupgouda.github.io/college-inventory-system/college-inventory-architecture.html)**

The diagram covers the frontend, backend REST API, JWT authentication, RBAC, inventory modules, procurement modules, PostgreSQL/Supabase, and demo data isolation.

The application follows a three-tier full-stack architecture.

                    ┌───────────────────────┐
                    │        USER           │
                    │     Web Browser       │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │       FRONTEND        │
                    │ React + TypeScript     │
                    │ Vite + Tailwind CSS   │
                    │ React Router           │
                    │                       │
                    │       Vercel          │
                    └───────────┬───────────┘
                                │
                         REST API + JWT
                                │
                                ▼
                    ┌───────────────────────┐
                    │        BACKEND        │
                    │ Node.js + Express     │
                    │ Authentication        │
                    │ Authorization         │
                    │ REST API Routes       │
                    │                       │
                    │       Render          │
                    └───────────┬───────────┘
                                │
                           SQL Queries
                                │
                                ▼
                    ┌───────────────────────┐
                    │       DATABASE        │
                    │ PostgreSQL / Supabase │
                    │                       │
                    │ Users                 │
                    │ Indents               │
                    │ Stock                 │
                    │ Checkouts             │
                    │ Vendors               │
                    │ Quotations            │
                    │ Purchase Orders       │
                    │ Bills                 │
                    │ Assets                │
                    └───────────────────────┘
🔄 Complete Application Flow
User Opens Application
        ↓
Login / Registration
        ↓
Credentials Verified
        ↓
Password Checked with bcrypt
        ↓
JWT Token Generated
        ↓
Frontend Stores Authentication State
        ↓
Protected Route Access
        ↓
Authenticated API Request
        ↓
Bearer JWT Sent to Backend
        ↓
JWT Verification
        ↓
Role Authorization
        ↓
Environment Selection
   ┌───────────────┐
   │               │
Normal User     Demo User
   │               │
   ▼               ▼
public schema   demo schema
   │               │
   └───────┬───────┘
           ↓
      PostgreSQL
           ↓
      API Response
           ↓
      Frontend Update
🗄️ Database Design

The application uses PostgreSQL, hosted in production using Supabase.

Main Tables
Table	Purpose
users	Authenticated users, roles, departments and account status
indents	Inventory requests and approval status
stock	Inventory stock entries
checkouts	Material checkout and return tracking
vendors	Vendor information
quotations	Vendor quotations
purchase_orders	Purchase orders
bills	Vendor bills and payment status
assets	College asset information
Demo Schema

The following operational tables also have isolated demo copies in the demo schema:

demo.indents
demo.stock
demo.checkouts
demo.vendors
demo.purchase_orders
demo.quotations
demo.bills
demo.assets

There is no separate demo.users table. Demo account information is maintained in the main users table.

🔗 Database Relationships
                    vendors
                   /   |    \
                  /    |     \
                 ▼     ▼      ▼
         quotations  purchase_orders
                              │
                              ▼
                            bills


users
  │
  └──► authentication + role authorization


indents
  │
  └──► approval workflow


assets
  │
  └──► departments / locations / assignments


checkouts
  │
  └──► issue / return / overdue tracking
🔌 REST API

All protected endpoints require:

Authorization: Bearer <JWT_TOKEN>
Authentication
POST /api/auth/login
POST /api/auth/register
Dashboard
GET /api/dashboard
GET /api/dashboard/pending-approvals
GET /api/dashboard/open-purchase-orders
GET /api/dashboard/low-stock
Users

Admin only:

GET    /api/users
POST   /api/users
PATCH  /api/users/:id/status
DELETE /api/users/:id
Indents
GET    /api/indents
POST   /api/indents
PATCH  /api/indents/:id
DELETE /api/indents/:id
Stock
GET    /api/stock
POST   /api/stock
DELETE /api/stock/:id
Material Checkout
GET    /api/checkouts
POST   /api/checkouts
PATCH  /api/checkouts/:id
DELETE /api/checkouts/:id
Vendors
GET    /api/vendors
POST   /api/vendors
PATCH  /api/vendors/:id
DELETE /api/vendors/:id
Quotations
GET    /api/quotations
POST   /api/quotations
PATCH  /api/quotations/:id
DELETE /api/quotations/:id
Purchase Orders
GET    /api/purchase-orders
POST   /api/purchase-orders
PATCH  /api/purchase-orders/:id
DELETE /api/purchase-orders

The purchase order route supports protected bulk deletion rather than an individual PO delete endpoint.

Bills
GET    /api/bills
POST   /api/bills
PATCH  /api/bills/:id
DELETE /api/bills/:id
Assets
GET    /api/assets
POST   /api/assets
PATCH  /api/assets/:id
DELETE /api/assets/:id
Reports
GET /api/reports
Health Check
GET /api/health

Example:

{
  "success": true,
  "message": "Backend is working"
}
🛡️ Backend Security

The backend implements multiple security layers.

Authentication
JWT
  ↓
Token Verification
  ↓
Authenticated User
Authorization
Authenticated User
        ↓
Role Check
        ↓
Allowed Role?
   ┌────┴────┐
  Yes        No
   ↓          ↓
Continue     403
Additional protections
Password hashing with bcrypt
JWT expiration
Protected API endpoints
Role authorization middleware
Active-account verification
Admin-only user management
Self-account protection
Last-Admin protection
Parameter validation
PostgreSQL constraints
Unique database fields
Demo/public data isolation
💻 Frontend Technology

The frontend is built with:

React
TypeScript
Vite
Tailwind CSS
React Router
Lucide React icons

The frontend includes:

Responsive layout
Sidebar navigation
Role-based navigation
Protected routes
Dashboard
Inventory modules
Procurement modules
User Management
Notifications
Settings
Profile
⚙️ Backend Technology

The backend is built with:

Node.js
Express.js
PostgreSQL driver (pg)
JWT (jsonwebtoken)
bcrypt (bcryptjs)
CORS
Morgan
dotenv
Nodemon for development
☁️ Deployment
Component	Platform
Frontend	Vercel
Backend	Render
Database	Supabase
Source Code	GitHub
Production URLs
Frontend:
https://college-inventory-system.vercel.app/

Backend:
https://college-inventory-backend-vroz.onrender.com/

GitHub:
https://github.com/anupgouda/college-inventory-system
📁 Project Structure
college-inventory-system/
│
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── assets.js
│   │   │   ├── bills.js
│   │   │   ├── checkouts.js
│   │   │   ├── dashboard.js
│   │   │   ├── indents.js
│   │   │   ├── purchaseOrders.js
│   │   │   ├── quotations.js
│   │   │   ├── reports.js
│   │   │   ├── stock.js
│   │   │   ├── users.js
│   │   │   └── vendors.js
│   │   │
│   │   ├── db.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── gat-logo.png
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header
│   │   │   ├── Sidebar
│   │   │   └── ...
│   │   │
│   │   ├── config/
│   │   │   └── api.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── Inventory/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── IndentMaster.tsx
│   │   │   │   ├── IndentApproval.tsx
│   │   │   │   ├── AssetMaster.tsx
│   │   │   │   ├── StockEntry.tsx
│   │   │   │   ├── MaterialCheckout.tsx
│   │   │   │   ├── VendorMaster.tsx
│   │   │   │   ├── QuotationMaster.tsx
│   │   │   │   ├── PurchaseOrder.tsx
│   │   │   │   ├── BillMaster.tsx
│   │   │   │   └── Reports.tsx
│   │   │   │
│   │   │   ├── Users.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Notifications.tsx
│   │   │
│   │   ├── utils/
│   │   │   └── api.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vercel.json
│
├── .gitignore
└── README.md
🧑‍💻 Local Development
1. Clone the repository
git clone https://github.com/anupgouda/college-inventory-system.git
cd college-inventory-system
2. Backend setup
cd backend
npm install

Create:

backend/.env

Example structure:

PORT=5001
DATABASE_URL=your_postgresql_connection_string
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_secure_jwt_secret

Do not commit .env files or secrets to GitHub.

Start backend:

npm run dev

Backend:

http://localhost:5001
3. Frontend setup

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

The frontend API configuration should point to the backend URL.

🔐 Environment Variables
Backend
PORT=5001
DATABASE_URL=your_database_url
FRONTEND_URL=your_frontend_url
JWT_SECRET=your_jwt_secret
Frontend
VITE_API_URL=your_backend_url

Never commit:

.env
.env.local
.env.production

or database passwords, JWT secrets, API keys, or authentication tokens.

🧪 Development & Verification

The system has been tested through:

Backend health endpoint
Authentication
JWT verification
Role-based authorization
Indent operations
Stock operations
Asset operations
Material checkout
Vendor permissions
Quotation permissions
Purchase order permissions
Bill permissions
User Management permissions
Demo data isolation
Frontend protected routes
Production deployment builds

Role verification included:

Admin
HOD
IT
Principal
Store Manager
Faculty

Unauthorized operations return appropriate HTTP 403 responses.

🔄 Git Workflow

After making changes:

git status

Review changes:

git diff

Stage:

git add .

Commit:

git commit -m "Describe your change"

Push:

git push origin main

The repository is connected to the deployed frontend/backend workflow.

📌 Current Project Status

The current implementation includes:

Core System
✅ React frontend
✅ Node.js/Express backend
✅ PostgreSQL database
✅ Supabase production database
✅ Vercel frontend deployment
✅ Render backend deployment
Authentication
✅ JWT login
✅ JWT protected APIs
✅ bcrypt password hashing
✅ Protected frontend routes
✅ Role-based authorization
✅ Active/inactive accounts
✅ Secure public registration
Inventory
✅ Dashboard
✅ Indent Master
✅ Indent Approval
✅ Stock Entry
✅ Material Checkout
✅ Asset Master
Procurement
✅ Vendor Master
✅ Quotation Master
✅ Purchase Order
✅ Bill Master
Administration
✅ User Management
✅ Role assignment
✅ Department assignment
✅ User activation/deactivation
✅ User deletion
✅ Admin protection rules
Reporting & System
✅ Reports
✅ Notifications
✅ Settings
✅ Profile
✅ Demo environment
✅ Demo data isolation
✅ Production deployment
🗺️ Complete Business Flow
                    USER
                      │
                      ▼
                Authentication
                      │
                      ▼
                Role Selection
                      │
          ┌───────────┴───────────┐
          │                       │
       Request                Administration
          │                       │
          ▼                       ▼
       Indent               User Management
          │
          ▼
     HOD / Principal
       Approval
          │
          ▼
      Procurement
          │
          ▼
      Quotation
          │
          ▼
    Purchase Order
          │
          ▼
       Delivery
          │
          ▼
        Stock
          │
          ▼
        Assets
          │
          ▼
   Material Checkout
          │
          ▼
    Return / Tracking
          │
          ▼
        Reports
🎯 Project Objective

The main objective of the College Inventory Management System is to replace fragmented or manual inventory and procurement processes with a centralized digital platform.

The system provides:

Centralized inventory records
Structured procurement workflows
Role-based responsibilities
Approval workflows
Persistent PostgreSQL storage
Secure authentication
Controlled user access
Asset tracking
Material movement tracking
Vendor and quotation management
Purchase order and bill tracking
Reporting
Demo-safe environment
Production-ready deployment architecture
👨‍💻 Project Repository

GitHub

https://github.com/anupgouda/college-inventory-system

# 📄 License

This project is developed as a college engineering project and may be used for educational and demonstration purposes.
