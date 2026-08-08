<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/44dbf40f-9c0d-4ec6-b668-d4f52599e3f8

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Final Folder Structure v1

```
src/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── router/
│   ├── AppRoutes.tsx
│   ├── ProtectedRoute.tsx
│   └── routeConstants.ts
│
├── pages/
│
│   ├── customer/
│   │   ├── CustomerPage.tsx
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── waiter/
│   │   ├── WaiterPage.tsx
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── kitchen/
│   │   ├── KitchenPage.tsx
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── manager/
│   │   ├── ManagerPage.tsx
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── owner/
│   │   ├── OwnerPage.tsx
│   │   ├── components/
│   │   └── hooks/
│   │
│   └── login/
│       └── LoginPage.tsx
│
├── components/
│   ├── common/
│   ├── buttons/
│   ├── dialogs/
│   ├── cards/
│   └── forms/
│
├── contexts/
│   ├── AuthContext.tsx
│   ├── RestaurantContext.tsx
│   └── CustomerSessionContext.tsx
│
├── services/
│   ├── api/
│   │   ├── axios.ts
│   │   └── endpoints.ts
│   │
│   ├── auth.service.ts
│   ├── order.service.ts
│   ├── waiter.service.ts
│   ├── bill.service.ts
│   ├── customer.service.ts
│   ├── menu.service.ts
│   └── table.service.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   ├── useSocket.ts
│   └── useLocalStorage.ts
│
├── utils/
│
├── constants/
│
├── types/
│
├── App.tsx
├── main.tsx
└── index.css
```

- total users options upto 20
- total tables
-
