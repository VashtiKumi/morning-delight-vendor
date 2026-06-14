# Morning Delight — Vendor App

Vendor portal for managing menu, viewing orders and tracking revenue.

## Quick Start

```bash
npm install
PORT=3001 npm start    # opens on http://localhost:3001
```

## Demo Credentials
- Email: `ama@demo.com`   Password: `demo123`
- Email: `kofi@demo.com`  Password: `demo123`
- Or register a new vendor account

## File Structure
```
src/
├── App.jsx                   ← Root component, session + screen flow
├── index.js
├── styles/global.css
├── utils/
│   ├── db.js                 ← Shared localStorage DB
│   └── constants.js
├── hooks/useToast.js
├── components/
│   ├── Loader.jsx            ← Green-themed loader with food thumbnails
│   ├── Sidebar.jsx           ← Sidebar with pending orders badge
│   └── Toasts.jsx
└── pages/
    ├── AuthPage.jsx          ← Login + vendor registration
    ├── OverviewPage.jsx      ← Stats cards + recent orders table
    ├── OrdersPage.jsx        ← All orders with status update dropdown
    ├── PreordersPage.jsx     ← Scheduled pre-orders view
    ├── MenuPage.jsx          ← Add/edit/delete items + drag-drop photo upload
    ├── AnalyticsPage.jsx     ← Revenue, delivered count, top items bar chart
    └── ProfilePage.jsx       ← Business info + MoMo number update
```

## Photo Uploads
Vendors upload food photos via drag-and-drop in Menu Management.
Photos are stored as base64 in localStorage and immediately visible to customers.
Max 2MB per photo.
