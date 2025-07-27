# Project Context for Claude

## Project Overview

NASSIM-BARBER is a full-stack barber shop management system that handles customer bookings, barber profiles, service management, expenses tracking, and comprehensive reporting. The system includes both customer-facing features and admin dashboard functionality.

## Tech Stack

**Backend:**

- Node.js with Express.js
- Database: SQLite (nassim-barber.db)
- Authentication system
- RESTful API architecture

**Frontend:**

- React.js with JSX
- CSS for styling (component-specific stylesheets)
- Context API for state management (LanguageContext, POSContext, ThemeContext)
- Responsive design

**Development Tools:**

- Vite (build tool and dev server)
- ESLint for code linting
- Package management with npm/yarn

## Project Structure

### Backend (`/backend`)

```
backend/
├── controllers/          # Request handlers
│   ├── authController.js
│   └── serviceController.js
├── models/
│   └── initDB.js        # Database initialization
├── routes/              # API endpoints
│   ├── authRoutes.js
│   ├── barberRoutes.js
│   ├── bookingRoutes.js
│   ├── customerRoutes.js
│   ├── expenseRoutes.js
│   ├── productRoutes.js
│   ├── receiptRoutes.js
│   ├── reportRoutes.js
│   ├── serviceRoutes.js
│   ├── supplierRoutes.js
│   └── transactionRoutes.js
├── utils/
│   └── db.js           # Database utilities
└── server.js           # Main server file
```

### Frontend (`/frontend/src`)

```
src/
├── admin-dashboard/     # Admin panel components and pages
│   ├── components/      # Reusable admin components
│   │   ├── BarberForm.jsx
│   │   ├── BarberProfiles.jsx
│   │   ├── BarbersSection.jsx
│   │   ├── BookingForm.jsx
│   │   ├── CustomerForm.jsx
│   │   ├── ReceiptModal.jsx
│   │   ├── ReceiptTable.jsx
│   │   ├── ReportCard.jsx
│   │   ├── ServiceForm.jsx
│   │   └── Sidebar.jsx
│   ├── pages/          # Admin page components
│   │   ├── AdminDashboard.jsx
│   │   ├── BookingManagement.jsx
│   │   ├── Login.jsx
│   │   ├── ManageBarbers.jsx
│   │   ├── ManageCustomers.jsx
│   │   ├── ManageExpenses.jsx
│   │   ├── ManageProducts.jsx
│   │   ├── ManageServices.jsx
│   │   ├── ManageUsers.jsx
│   │   ├── Reports.jsx
│   │   └── ViewReceipts.jsx
│   └── styles/         # Admin-specific CSS files
├── components/         # Shared/POS components
│   ├── BillPanel.jsx
│   ├── CheckoutModal.jsx
│   ├── ProductCard.jsx
│   └── ServiceCard.jsx
├── context/           # React Context providers
│   ├── LanguageContext.jsx
│   ├── POSContext.jsx
│   └── ThemeContext.jsx
├── pages/
│   └── POS.jsx        # Point of Sale interface
└── styles/           # Component-specific CSS files
```

## Code Conventions

### JavaScript/JSX

- Use functional components with React hooks
- Prefer const/let over var
- Use camelCase for variables and functions
- Use PascalCase for React components
- Include .jsx extension for React components
- Follow consistent indentation (2 spaces)

### CSS

- Component-specific stylesheets (ComponentName.css)
- Use semantic class names
- Responsive design principles
- Consistent color scheme and spacing

### API Routes

- RESTful conventions (GET, POST, PUT, DELETE)
- Consistent endpoint naming
- Proper error handling and status codes
- Authentication middleware where needed

## Key Features

### Admin Dashboard

- Comprehensive management system for all business aspects
- Real-time reporting and analytics
- User authentication and authorization
- CRUD operations for all entities

### Point of Sale (POS)

- Customer-facing interface for services and products
- Bill generation and checkout process
- Receipt management

### Core Entities

- **Barbers**: Profile management, scheduling
- **Customers**: Customer database and history
- **Services**: Service catalog with pricing
- **Products**: Inventory and product management
- **Bookings**: Appointment scheduling system
- **Expenses**: Business expense tracking
- **Reports**: Business analytics and insights
- **Receipts**: Transaction records

## Database

- SQLite database (nassim-barber.db)
- Database initialization in models/initDB.js
- Database utilities in utils/db.js

## Important Notes

- Authentication is implemented for admin access
- The system (currently only the POS not the admin system and not all admin system compnents) supports both Arabic and English (LanguageContext)
- Theme switching capability (ThemeContext)
- Responsive design for mobile and desktop
- Real-time data updates across components
- Proper error handling throughout the application

## Development Guidelines

- Always handle errors gracefully
- Use context for global state management
- Maintain consistent styling across components
- Follow RESTful API conventions
- Implement proper validation on both frontend and backend
- Keep components modular and reusable
- Use semantic HTML for accessibility
- Send to me what to edit in details and specifying what to edit to achieve the task without issues, no need to send full file(s) unless i ask you to do so or the code file is small so no harm if you sent it all updated or whatever
