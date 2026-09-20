# 🏫 College Inventory Management System

A full-stack web-based inventory and procurement management system designed for colleges to manage **assets, stock, vendors, quotations, purchase orders, bills, material checkout, indents, approvals, and reports** from a centralized platform.

The system provides **JWT authentication, role-based access control, REST APIs, and PostgreSQL-based persistent storage**, with a responsive React frontend.

---

## 🚀 Live Demo

### 🌐 Frontend

[College Inventory Management System](https://college-inventory-system.vercel.app)

### ⚙️ Backend API

[College Inventory Backend](https://college-inventory-backend-vroz.onrender.com)

### 📦 GitHub Repository

[GitHub - College Inventory System](https://github.com/anupgouda/college-inventory-system)

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend

- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt
- CORS
- Morgan

### Database

- PostgreSQL
- Supabase

### Deployment

- Vercel — Frontend
- Render — Backend
- Supabase — Database

---

## 📌 Project Overview

The College Inventory Management System is designed to digitize and centralize college inventory and procurement operations.

The platform allows authorized users to manage inventory requests, procurement workflows, vendors, quotations, purchase orders, bills, assets, stock, material movement, and reports.

The system also provides role-based permissions so that different users can access and perform operations according to their responsibilities.


---

## ✨ Features & Modules

### 🔐 Authentication & Authorization

- Secure user login
- JWT-based authentication
- Protected application routes
- Role-based access control
- Password hashing using bcrypt
- Authorized API requests
- Session persistence using authentication tokens

### 📊 Dashboard

The dashboard provides an overview of the college inventory system, including:

- Inventory statistics
- Pending approvals
- Open purchase orders
- Low-stock information
- Quick access to major inventory modules

### 📋 Indent Management

- Create inventory indents
- View submitted indents
- Track indent status
- Approve or reject indents
- Department-wise inventory requests

### 📦 Stock Management

- Add new stock entries
- Track item quantities
- Store unit prices
- Calculate total values
- Track storage locations
- Maintain invoice and purchase order references

### 🏢 Vendor Management

- Add vendors
- Maintain vendor codes
- Store contact information
- Manage GST details
- Update vendor information
- Delete vendors

### 💰 Quotation Management

- Create quotations
- Select vendors
- Manage quotation items
- Track quotation quantities and prices
- Calculate quotation totals
- Approve quotations
- Reject quotations
- Track quotation status

### 🛒 Purchase Order Management

- Create purchase orders
- Assign vendors
- Manage order items
- Track quantities and prices
- Set expected delivery dates
- Approve purchase orders
- Receive purchase orders
- Cancel purchase orders
- Track purchase order status

### 🧾 Bill Management

- Create bills
- Link bills with vendors
- Link bills with purchase orders
- Track bill dates and due dates
- Manage bill items
- Approve bills
- Track payment status
- Cancel bills

### 🖥️ Asset Management

- Register college assets
- Generate unique asset codes
- Assign assets to departments
- Track asset locations
- Track asset conditions
- Assign assets to users
- Manage asset availability
- Track maintenance status
- Dispose assets when required

### 🔄 Material Checkout

- Issue materials to departments/users
- Track checkout dates
- Set expected return dates
- Track returned materials
- Track overdue materials
- Maintain checkout history

### 📈 Reports

The system provides reports for:

- Indents
- Indent approvals
- Stock entries
- Material checkout
- Assets
- Vendors
- Purchase orders
- Quotations
- Bills

### 🔔 Notifications

- Inventory-related notifications
- Approval notifications
- Procurement-related notifications
- System activity notifications

### ⚙️ Settings & Profile

- User profile management
- Application settings
- Authentication settings
- User preferences


---

## 👥 User Roles & Permissions

The system uses **role-based access control (RBAC)** to control access to inventory and procurement operations.

| Role | Main Responsibilities |
|---|---|
| **Admin** | Full system access, user management, inventory, procurement, assets, approvals and configuration |
| **HOD** | Department-level requests, indent approvals and material operations |
| **IT** | Asset management, technical inventory and asset status management |
| **Principal** | Higher-level approval workflows |
| **Faculty** | Material checkout and inventory-related operations |
| **Store Manager** | Stock, vendors, quotations, purchase orders, bills and procurement operations |

### Permission Model

```text
                         ┌─────────────────┐
                         │      Admin      │
                         │   Full Access   │
                         └────────┬────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
         HOD / IT            Principal          Store Manager
             │                    │                    │
             ▼                    ▼                    ▼
       Department &          Approval           Procurement &
       Asset Operations      Workflows          Inventory
             │
             ▼
          Faculty
             │
             ▼
       Material Operations




```markdown id="t3q3qp"
## 🏗️ System Architecture

The application follows a three-tier full-stack architecture.

```text
┌─────────────────────────────────────────────┐
│                  USER                       │
│              Web Browser                    │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│               FRONTEND                      │
│                                             │
│        React + TypeScript + Vite            │
│              Tailwind CSS                   │
│              React Router                   │
│                                             │
│               Vercel                        │
└──────────────────────┬──────────────────────┘
                       │
                  REST API / JWT
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                BACKEND                      │
│                                             │
│          Node.js + Express.js               │
│                                             │
│       Authentication & Authorization        │
│             REST API Routes                 │
│                                             │
│                Render                       │
└──────────────────────┬──────────────────────┘
                       │
                    SQL Queries
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                DATABASE                     │
│                                             │
│            PostgreSQL / Supabase            │
│                                             │
│  Users • Indents • Stock • Assets • Vendors │
│  Quotations • Purchase Orders • Bills       │
│  Checkouts                                  │
└─────────────────────────────────────────────┘


Application Flow :

User Login
    ↓
JWT Authentication
    ↓
Protected Frontend Routes
    ↓
Authenticated API Request
    ↓
JWT Verification
    ↓
Role Authorization
    ↓
Express Route
    ↓
PostgreSQL Query
    ↓
Database Response
    ↓
Frontend UI Update

---



## 🗄️ Database Design

The system uses **PostgreSQL** as the primary relational database, hosted in production using **Supabase**.

### Main Tables

| Table | Purpose |
|---|---|
| `users` | Stores authenticated users, roles and departments |
| `indents` | Stores inventory requests |
| `stock` | Stores stock and inventory entries |
| `checkouts` | Tracks material checkout and returns |
| `vendors` | Stores vendor information |
| `quotations` | Stores vendor quotations |
| `purchase_orders` | Stores purchase orders |
| `bills` | Stores bills and payment status |
| `assets` | Stores college asset information |

### Database Relationships

```text
vendors
   │
   ├──────────────► quotations
   │
   ├──────────────► purchase_orders
   │                       │
   │                       ▼
   └──────────────────► bills
                           
users
   │
   └──────────────► role-based access

assets
   │
   └──────────────► departments / locations

indents
   │
   └──────────────► approval workflow

checkouts
   │
   └──────────────► material return tracking


🔌 REST API

Authentication
POST /api/auth/login
POST /api/auth/register

Dashboard
GET /api/dashboard
GET /api/dashboard/pending-approvals
GET /api/dashboard/open-purchase-orders
GET /api/dashboard/low-stock

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
DELETE /api/purchase-orders/:id

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

Example response:

{
  "success": true,
  "message": "Backend is working"
}


```markdown
## 📁 Project Structure

```text
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
│   │   ├── config/
│   │   ├── pages/
│   │   │   └── Inventory/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vercel.json
│
├── .gitignore
└── README.md