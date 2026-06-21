# Property Rent Management ERP Lite (Gazipur Cantonment Board)

You are a Senior Software Architect, Senior Full Stack Engineer, UI/UX Expert, Database Architect, Security Engineer, and DevOps Engineer.

Build a Production-Ready Property Rent Management ERP Lite for Gazipur Cantonment Board using modern enterprise architecture and best practices.

## Tech Stack

Frontend:

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* Shadcn UI
* React Hook Form
* Zod
* TanStack Table
* Tanstack query
* Zustand
* axios

Backend:

* Next.js Route Handlers
* Prisma ORM
* PostgreSQL

make sure use moduler prattern 


Authentication:


* JWT Session


Storage:

* cloudenary

Validation:

* Zod


Logging:

* Audit Trail
* Activity Logs

Deployment:

* Vercel
* supabase 


---

# Project Goal

Develop a Property Rent Management ERP Lite for a single organization.

This is NOT multi-company.

The system will manage:

* Properties
* Buildings
* Flats
* Tenants
* Lease Agreements
* Rent Invoices
* Payments
* Expenses
* Reports
* Notifications

Focus on MVP only.

Avoid unnecessary enterprise modules.

---

# User Roles

 this app hase 3 role super admin platfrom full access , 
 one is shop woner, or flat woner, manager 

 USER
 SUPER_ADMIN
 MANAGER

---

# Core Modules

## 1. Authentication & Authorization

Features:

* Login
* Logout
* Role Based Access
* Protected Routes
* Middleware Security
* Session Management

Database Tables:

* users

---

## 2. Property Management

Features:

* Create Property
* Update Property
* Delete Property
* View Property
* Property Search
* Property Status

Property Fields:

* Property Code
* Property Name
* Address
* Description
* Status

---

## 3. Unit / Flat Management

Features:

* Add Unit
* Update Unit
* Delete Unit
* View Unit
* Unit Availability

Fields:

* Unit Number
* Floor
* Unit Type
* Monthly Rent
* Size
* Status

Status:

* Vacant
* Occupied
* Reserved

---

## 4. Tenant Management

Features:

* Add Tenant
* Edit Tenant
* Delete Tenant
* Search Tenant
* Tenant Profile

Fields:

* Full Name
* Phone
* Email
* NID Number
* Address
* Emergency Contact
* Photo
* Documents

Document Upload:

* NID
* Passport
* Agreement

Store files in S3.

---

## 5. Lease Agreement Management

Features:

* Create Lease
* Renew Lease
* Terminate Lease
* Lease History

Fields:

* Lease Number
* Tenant
* Property
* Unit
* Start Date
* End Date
* Monthly Rent
* Security Deposit
* Notes

Rules:

* One active lease per unit.
* Occupied units cannot have another active lease.

---

## 6. Billing / Rent Invoice

Features:

* Generate Monthly Invoice
* Manual Invoice
* View Invoice
* Invoice PDF
* Download Invoice

Fields:

* Invoice Number
* Tenant
* Lease
* Rent Amount
* Utility Charges
* Service Charges
* Due Date
* Status

Status:

* Draft
* Unpaid
* Partial
* Paid
* Overdue

Invoice Generation:

* Monthly Cron Job
* Auto Invoice Creation

---

## 7. Payment Collection

Features:

* Record Payment
* Partial Payment
* Full Payment
* Payment History
* Receipt Generation

Payment Methods:

* Cash
* Bank Transfer
* Mobile Banking

Fields:

* Amount
* Date
* Method
* Reference Number
* Notes

Rules:

* Prevent overpayment.
* Update invoice status automatically.

---

## 8. Expense Tracking

Features:

* Add Expense
* Edit Expense
* Delete Expense
* Expense Reports

Categories:

* Maintenance
* Utility
* Cleaning
* Security
* Miscellaneous

Fields:

* Expense Title
* Category
* Amount
* Date
* Notes

---

## 9. Dashboard & Reports

Dashboard KPIs:

* Total Properties
* Total Units
* Occupied Units
* Vacant Units
* Active Tenants
* Active Leases
* Monthly Revenue
* Collected Revenue
* Outstanding Revenue
* Monthly Expenses
* Net Profit

Charts:

* Revenue Trend
* Expense Trend
* Occupancy Rate
* Collection Rate

Reports:

* Tenant Report
* Lease Report
* Invoice Report
* Payment Report
* Expense Report

Export:

* PDF
* Excel

---

## 10. Notification System

In-App Notifications

Events:

* Lease Expiry
* Rent Due
* Overdue Invoice
* New Tenant
* Payment Received

Notification Center:

* Read
* Unread
* Mark All Read

---

# Database Design

Create complete Prisma schema with:

* User
* Role
* Permission
* Property
* Unit
* Tenant
* Lease
* Invoice
* Payment
* Expense
* Notification
* ActivityLog

Use:

* UUID Primary Keys
* Proper Indexes
* Soft Delete
* Audit Fields

Audit Fields:

* createdAt
* updatedAt
* createdBy
* updatedBy

---

# Security Requirements

Implement:

* RBAC
* Route Protection
* API Authorization
* Input Validation
* SQL Injection Protection
* XSS Protection
* CSRF Protection
* Rate Limiting
* Secure Password Hashing

---

# Folder Structure

Use enterprise modular architecture:

src/
├── app
├── modules
│ ├── auth
│ ├── users
│ ├── properties
│ ├── units
│ ├── tenants
│ ├── leases
│ ├── invoices
│ ├── payments
│ ├── expenses
│ ├── notifications
│ └── dashboard
├── components
├── hooks
├── providers
├── services
├── lib
├── types
├── utils
└── prisma

Each module must contain:

* controllers
* services
* validations
* types
* hooks
* components
* actions

---

# UI Requirements

Use modern SaaS design.

Requirements:

* Responsive Design
* Mobile Friendly
* Clean Dashboard
* Professional Tables
* Search & Filters
* Pagination
* Dark Mode
* Loading Skeletons
* Empty States
* Error States

Design Inspiration:

* Stripe
* Linear
* Notion
* Vercel

---

# Deliverables

Generate:

1. Full System Architecture
2. Complete Prisma Schema
3. Database ER Diagram
4. Folder Structure
5. RBAC Design
6. API Design
7. Validation Schemas
8. Dashboard Design
9. Page Structure
10. Reusable Components
11. Development Roadmap
12. Production Deployment Guide

Follow enterprise-grade coding standards and scalability best practices.
