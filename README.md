# Marketing Portal

A full-stack CRM built for college fest and society marketing teams. Manages sponsorship contacts, outreach templates, organization pipelines, and team access control — all in one place.

## Tech Stack

**Backend**
- Node.js + TypeScript, Express 5
- MongoDB with Mongoose
- JWT authentication, bcryptjs password hashing

**Frontend**
- React 19 + TypeScript, Vite
- Vanilla CSS with CSS custom properties
- Lucide React icons

**Infrastructure**
- Docker + Docker Compose

## Project Structure

```
.
├── server/                        # Express backend
│   └── src/
│       ├── features/              # Auth, contacts, organizations, team
│       │   └── {feature}/        # model, service, controller, routes, types
│       ├── shared/                # asyncHandler, errorHandler, tokenService
│       ├── config.ts              # Environment variable validation
│       ├── db.ts                  # MongoDB connection
│       └── server.ts              # Entry point
│
├── crm-app/                       # React frontend
│   └── src/
│       ├── features/              # Auth, contacts, organizations, team
│       │   └── {feature}/        # api, hook, components
│       ├── lib/                   # apiClient, utilities
│       ├── pages/                 # Full-page views
│       ├── components/            # Shared UI components
│       ├── modals/                # Overlay forms
│       ├── panes/                 # Detail slide-out views
│       └── types/                 # Global TypeScript interfaces
│
└── docker-compose.yml
```

## License

Copyright (c) 2026 Divyesh Mangla. Released under the [MIT License](./LICENSE).
