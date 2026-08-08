# Frontend Architecture

## 1. Frontend Layers

- Pages
- Layouts
- Features
- Components
- Hooks
- Services
- Contexts
- API Layer

## 2. State Classification

- Local State
- Shared UI State
- Authentication State
- Server State
- Form State

## 3. Planned Contexts

- AuthContext
- RestaurantContext
- CustomerSessionContext
- UIContext
- (Optional) NotificationContext

## 4. Data Flow Diagram

```
User
  ↓
Page
  ↓
Feature Component
  ↓
Hook
  ↓
Service
  ↓
API
  ↓
Laravel
  ↓
MySQL
```

## 5. Architecture Rules

- Components never call Laravel directly.
- Business logic belongs in services.
- Local UI state stays local.
- Context stores only shared application state.
- Features own feature-specific UI.
