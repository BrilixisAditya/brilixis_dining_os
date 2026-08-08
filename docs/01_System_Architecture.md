# System Architecture

```
                    Restaurant Operating System
────────────────────────────────────────────────────────────

            Frontend (React)

                    │
                    │ REST API / WebSocket
                    ▼

            Backend (Laravel)

                    │
                    ▼

              MySQL Database
```

## System Layers

The application is divided into three major layers.

### 1. Frontend

Responsible for:

- User Interface
- User Interaction
- Client-side Validation
- State Management
- Calling Backend APIs

### 2. Backend

Responsible for:

- Business Logic
- Authentication
- Authorization
- Validation
- Database Operations
- Notifications
- Real-time Events

### 3. Database

Responsible for:

- Persistent Storage
- Relationships
- Constraints
- Transactions

## Module Architecture

```
Restaurant Operating System

├── Authentication
├── Restaurant
├── Tables
├── Customers
├── Menu
├── Orders
├── Waiter Requests
├── Kitchen
├── Billing
├── Payments
├── Notifications
├── Feedback
├── Analytics
├── Reports
└── Settings
```

Every module owns its own business logic.

Modules should communicate through services or APIs instead of directly accessing each other's internal implementation.

## Ownership

Authentication
Owns:

- Login
- Logout
- OTP
- Access Token
- Permissions

---

Menu
Owns:

- Categories
- Menu Items
- Modifier Groups (Addons)
- Modifiers (Addon items)

---

Waiter
Owns:

- Assigned Tables
- Order Approval
- Order Modification
- Order Serving
- Bill Generation Workflow

---

Waiter Requests
Owns:

- Waiter Requests
- Request Types
- Request Status
- Request Priority
- Response Time
- Request History

---

Orders
Owns:

- Orders
- Order Items
- Order Status
- Order Item Modifiers

---

Billing
Owns:

- Bills
- Bill Items
- Taxes
- Discounts

---

Payments
Owns:

- Transactions
- Refunds
- Payment Status

## Dependency Direction

```
UI

↓

Pages

↓

Features

↓

Services

↓

API

↓

Laravel

↓

MySQL
```

## Communication

```
Customer places order

↓

Order Module

↓

Billing Module

↓

Kitchen Module

↓

Notification Module
```

## Design Principles

### Single Responsibility Principle (SRP)

Each class, component, or module should have only one reason to change.

---

### Separation of Concerns

UI, business logic, networking, and database operations should remain separate.

---

### Low Coupling

Modules should know as little as possible about each other.

---

### High Cohesion

Related logic should stay together.

---

### Reusability

Reusable components should not depend on specific pages.

---

### Scalability

Architecture should support future features without major restructuring.

## Data Flow

```
User

↓

React Component

↓

Hook

↓

Service

↓

API

↓

Laravel

↓

Service

↓

Repository

↓

Model

↓

MySQL
```

### Response

```
MySQL

↓

Model

↓

Repository

↓

Service

↓

API

↓

React

↓

UI Updated
```

## Real-time Flow (WebSockets)

```
Customer

↓

Order Created

↓

Laravel

↓

Broadcast Event

↓

WebSocket Server

↓

Kitchen Dashboard

↓

Waiter Dashboard

↓

Manager Dashboard

↓

Customer Tracking
```

### Waiter Request Module LifeCycle

```
Customer

↓

Request Water

↓

Waiter Requests Module

↓

Creates Request

↓

Status = Pending

↓

Waiter Dashboard

↓

Accept

↓

Status = Accepted

↓

Deliver Water

↓

Completed
```

## Architecture Rules

❌ SQL queries inside React

❌ Business logic inside UI components

❌ Components calling MySQL directly

❌ One giant Context for everything

❌ Copy-paste business logic

❌ API calls scattered across components

❌ Components larger than necessary without good reason
