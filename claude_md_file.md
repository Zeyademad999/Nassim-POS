# NASSIM-BARBER Project Documentation

## Project Overview

NASSIM-BARBER is a comprehensive full-stack barber shop management system that handles customer bookings, barber profiles, service management, expenses tracking, inventory management, tax configuration, and comprehensive reporting. The system includes both customer-facing features and admin dashboard functionality with real-time tax calculations and schedule management.

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
│   ├── barberScheduleRoutes.js    # NEW: Schedule management
│   ├── bookingRoutes.js
│   ├── customerRoutes.js
│   ├── expenseRoutes.js
│   ├── productRoutes.js
│   ├── receiptRoutes.js
│   ├── reportRoutes.js
│   ├── serviceRoutes.js
│   ├── settingsRoutes.js          # NEW: Tax & settings management
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
│   │   ├── CustomerBookingForm.jsx
│   │   ├── CustomerForm.jsx
│   │   ├── EditBookingForm.jsx
│   │   ├── EnhancedBookingForm.jsx    # NEW: Schedule-aware booking
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
│   │   ├── ManageSchedule.jsx         # NEW: Barber schedule management
│   │   ├── ManageServices.jsx
│   │   ├── ManageUsers.jsx
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx               # NEW: Tax & system settings
│   │   └── ViewReceipts.jsx
│   ├── styles/         # Admin-specific CSS files
│   │   ├── ManageSchedule.css         # NEW: Schedule styles
│   │   ├── Settings.css               # NEW: Settings styles
│   │   └── EnhancedBookingForm.css    # NEW: Enhanced booking styles
│   └── AdminRoutes.jsx # Admin routing configuration
├── components/         # Shared/POS components
│   ├── BillPanel.jsx
│   ├── CheckoutModal.jsx
│   ├── ProductCard.jsx
│   └── ServiceCard.jsx
├── context/           # React Context providers
│   ├── LanguageContext.jsx
│   ├── POSContext.jsx      # Updated with tax settings
│   └── ThemeContext.jsx
├── pages/
│   └── POS.jsx        # Point of Sale interface
├── styles/           # Component-specific CSS files
└── App.jsx           # Main application component
```

## Recent Updates & New Features

### Major Feature Additions

1. **Tax Management System** ⭐ NEW

   - Dynamic tax configuration through admin settings
   - Support for multiple taxes (VAT, Service Tax, etc.)
   - Real-time tax calculation in POS
   - Tax breakdown display in receipts and exports
   - Enable/disable taxes functionality

2. **Barber Schedule Management** ⭐ NEW

   - Weekly schedule configuration per barber
   - Working hours and break time setup
   - Time-off management (vacations, sick days)
   - Availability checking for bookings
   - Schedule-aware booking system

3. **Enhanced Settings Page** ⭐ NEW
   - Business information management
   - Tax rate configuration
   - System preferences
   - General settings categorization

### Enhanced Features

1. **Smart Booking System**

   - Real-time availability checking
   - Schedule integration
   - Time slot generation based on barber availability
   - Conflict detection and prevention

2. **Dynamic POS Tax Calculation**

   - Fetches current tax settings from database
   - Supports multiple concurrent taxes
   - Real-time tax rate updates
   - Tax refresh functionality

3. **Enhanced Receipt System**
   - Dynamic tax breakdown in PDFs
   - Multiple tax support in Excel exports
   - Detailed tax information in print receipts
   - Business information from settings

### Critical Bug Fixes

1. **Barber Specialties**: Implemented fetching specialties from services table instead of text input

   - Added `specialty_ids` column to barbers table
   - Updated API routes to handle service-based specialties
   - Created multi-select interface for specialty selection

2. **Booking Management**: Fixed manual booking creation and editing functionality

   - Resolved JavaScript error in BookingForm (toFixed on undefined)
   - Created CustomerBookingForm component for new bookings
   - Implemented EditBookingForm component for booking modifications
   - Fixed estimated cost calculations and form validation

3. **Tax Calculation**: Replaced hardcoded 8% tax with dynamic system
   - Tax rates now configurable through admin settings
   - Supports 0% tax when no taxes are enabled
   - Fallback mechanism for missing tax settings

## Database Schema Updates

### New Tables

```sql
-- Tax Settings Management
barber_schedules (
  id, barber_id, day_of_week, start_time, end_time,
  is_working, break_start, break_end, created_at, updated_at
)

barber_time_off (
  id, barber_id, start_date, end_date, reason,
  notes, created_at
)

tax_settings (
  id, tax_name, tax_rate, is_enabled,
  description, created_at, updated_at
)

general_settings (
  id, setting_key, setting_value, setting_type,
  description, category, created_at, updated_at
)
```

### Enhanced Existing Tables

- Added `specialty_ids` column to barbers table for service-based specialties
- Enhanced barber routes to fetch and display specialty names from services

## API Endpoints

### New Endpoints

**Schedule Management:**

- `GET /api/barber-schedule/:barberId` - Get barber schedule and time-off
- `PUT /api/barber-schedule/:barberId/schedule` - Update weekly schedule
- `POST /api/barber-schedule/:barberId/time-off` - Add time-off period
- `DELETE /api/barber-schedule/:barberId/time-off/:timeOffId` - Remove time-off
- `GET /api/barber-schedule/:barberId/availability/:date` - Check availability

**Settings Management:**

- `GET /api/settings/taxes` - Get all tax settings
- `GET /api/settings/taxes/enabled` - Get enabled taxes for POS
- `POST /api/settings/taxes` - Create new tax setting
- `PUT /api/settings/taxes/:id` - Update tax setting
- `DELETE /api/settings/taxes/:id` - Delete tax setting
- `GET /api/settings/general` - Get general settings
- `PUT /api/settings/general/:key` - Update general setting
- `POST /api/settings/general` - Create new general setting

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
- CSS custom properties for theming

### API Routes

- RESTful conventions (GET, POST, PUT, DELETE)
- Consistent endpoint naming
- Proper error handling and status codes
- Authentication middleware where needed
- Database transaction handling for complex operations

## Key Features

### Admin Dashboard

- Comprehensive management system for all business aspects
- Real-time reporting and analytics
- User authentication and authorization
- CRUD operations for all entities
- Default landing page: Reports
- Access to POS system for admin users
- **NEW**: Tax and schedule management

### Point of Sale (POS)

- Customer-facing interface for services and products
- Bill generation and checkout process
- Receipt management
- Multi-language support (Arabic/English)
- Admin access available through sidebar navigation
- **NEW**: Dynamic tax calculation based on settings
- **NEW**: Real-time tax breakdown display

### Schedule Management ⭐ NEW

- Weekly schedule configuration for each barber
- Working hours setup (start time, end time, break times)
- Time-off management (vacations, sick days, personal time)
- Availability checking for booking system
- Integration with booking management

### Tax Management ⭐ NEW

- Configurable tax rates through admin interface
- Support for multiple concurrent taxes
- Enable/disable individual taxes
- Real-time tax calculation in POS
- Dynamic tax display in receipts and exports
- Business information management

### Core Entities

- **Barbers**: Profile management with service-based specialties and schedules
- **Customers**: Customer database and history with booking capabilities
- **Services**: Service catalog with pricing and descriptions
- **Products**: Inventory and product management with categories
- **Bookings**: Appointment scheduling system with availability checking
- **Expenses**: Business expense tracking with categories
- **Reports**: Business analytics and insights
- **Receipts**: Transaction records with dynamic tax information
- **Settings**: System configuration and tax management

## Database

- SQLite database (nassim-barber.db)
- Database initialization in models/initDB.js
- Database utilities in utils/db.js
- Comprehensive indexing for performance
- Foreign key relationships for data integrity
- **NEW**: Tax and schedule management tables

## Navigation Structure

```
Admin Dashboard:
├── Reports (Default landing page)
├── Bookings Management
├── Customer Management
├── Barber Management
├── Schedule Management     # NEW
├── Service Management
├── Product Management
├── Expense Management
├── Receipt Management
├── Settings               # NEW
│   ├── Tax Configuration
│   └── Business Information
└── POS Access (External link)
```

## Important Features

### Authentication & Authorization

- Role-based access control
- Admin and staff user management
- Session management
- Secure API endpoints

### Multi-language Support

- Arabic and English language support
- RTL (Right-to-Left) layout support
- Contextual translations
- Language switching capability

### Real-time Updates

- Dynamic tax calculation
- Live availability checking
- Real-time data synchronization
- Automatic refresh mechanisms

### Responsive Design

- Mobile and desktop compatibility
- Touch-friendly interfaces
- Adaptive layouts
- Consistent user experience

### Data Export & Reporting

- PDF generation with dynamic tax information
- Excel export with detailed breakdowns
- Print-friendly receipts
- Comprehensive business reports

## Development Guidelines

### Best Practices

- Always handle errors gracefully
- Use context for global state management
- Maintain consistent styling across components
- Follow RESTful API conventions
- Implement proper validation on both frontend and backend
- Keep components modular and reusable
- Use semantic HTML for accessibility

### Testing Guidelines

- Test booking functionality thoroughly due to schedule integration
- Ensure barber specialty selection works with services integration
- Verify tax calculations with multiple tax scenarios
- Test schedule availability checking
- Validate all CRUD operations

### Code Quality

- Use TypeScript-like JSDoc comments for better documentation
- Implement proper error boundaries
- Follow consistent naming conventions
- Use proper Git commit messages
- Regular code reviews and refactoring

## Component Dependencies

### Schedule Management Components

- `ManageSchedule.jsx` - Main schedule management page
- `EnhancedBookingForm.jsx` - Schedule-aware booking form
- Barber availability checking integration

### Tax Management Components

- `Settings.jsx` - Main settings page with tax configuration
- Updated `BillPanel.jsx` - Dynamic tax display
- Updated `CheckoutModal.jsx` - Tax breakdown in receipts
- Updated `POSContext.jsx` - Tax settings state management

### Booking System Components

- `BookingManagement.jsx` - Main booking management page
- `CustomerBookingForm.jsx` - Form for creating new bookings
- `EditBookingForm.jsx` - Form for editing existing bookings
- `EnhancedBookingForm.jsx` - Schedule-integrated booking form

### Barber Management Components

- `ManageBarbers.jsx` - Main barber management with service-based specialties
- `BarberForm.jsx` - Form for adding/editing barbers
- `BarberProfiles.jsx` - Display component for barber profiles

### Navigation & Layout

- `Sidebar.jsx` - Admin navigation with schedule and settings links
- `AdminRoutes.jsx` - Routing configuration with new pages
- `App.jsx` - Main app with footer and role-based routing

## Recent Configuration Changes

### Database Configuration

- Added tax_settings table with rate management
- Added general_settings table for business information
- Added barber_schedules table for weekly schedules
- Added barber_time_off table for vacation management
- Enhanced indexes for better performance

### API Configuration

- Integrated settings routes for tax management
- Added schedule management endpoints
- Enhanced transaction routes with dynamic tax calculation
- Improved error handling and validation

### Frontend Configuration

- Updated POS context with tax settings integration
- Enhanced components with schedule awareness
- Added real-time tax calculation
- Improved responsive design for mobile devices

## Deployment Notes

### Environment Setup

- Ensure SQLite database is properly initialized
- Verify all API routes are registered
- Check that tax settings are properly configured
- Test schedule management functionality
- Validate multi-language support

### Production Considerations

- Database backup procedures
- Error logging and monitoring
- Performance optimization
- Security considerations
- Regular maintenance schedules

## Future Enhancement Ideas

### Potential Features

- SMS notifications for appointments
- Online booking system for customers
- Loyalty program integration
- Advanced reporting with charts
- Multi-location support
- Integration with payment gateways
- Mobile app development
- Advanced inventory tracking

### Technical Improvements

- TypeScript migration
- Unit and integration testing
- Progressive Web App (PWA) features
- Real-time notifications
- API rate limiting
- Database optimization
- Caching strategies

---

**Last Updated**: August 2025  
**Version**: 2.0.0  
**New Features**: Tax Management System, Barber Schedule Management, Enhanced Settings Page  
**Contributors**: Development Team  
**Status**: Production Ready with Enhanced Features
