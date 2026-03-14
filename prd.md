# PRD: Brew & Bytes Coffee Shop POS (UMKM)

## 1. Overview
Brew & Bytes is a lightweight, premium Point of Sale system designed specifically for UMKM coffee shops. It prioritizes speed, ease of use, and reliability through offline-first capabilities.

## 2. User Roles
- **Admin**: Full system access (Store settings, User management, Financial reports).
- **Manager**: Manage inventory (products, categories, stock) and view daily branch reports.
- **Cashier**: Daily operations (Creating orders, searching products, processing QRIS/Cash payments).

## 3. Core Features
### 3.1 POS Terminal
- **Product Grid**: Visual grid of products categorized for quick access.
- **Search**: Instant product search (Real-time).
- **Cart**: Add/remove items, adjust quantities, apply discounts.
- **Checkout**: Support for multiple payment methods.

### 3.2 Offline Capability
- **PWA**: Installable on desktop/mobile browsers.
- **IndexedDB**: Local storage for product catalog and pending orders.
- **Background Sync**: Orders placed while offline automatically push to the server when online.

### 3.3 Payments
- **QRIS**: Modern scan-to-pay via Midtrans gateway.
- **Cash**: Traditional cash handling.

### 3.4 Management
- **Dashboard**: High-level sales and product performance analytics.
- **Product Management**: CRUD for products and categories with image support.
- **Inventory Tracking**: Basic manual stock updates and automatic deduction on sales.

## 4. Technical Constraints
- **Framework**: Laravel 12 + Inertia/React (Premium UI).
- **Persistence**: MySQL (Server), IndexedDB (Client).
- **Connectivity**: Fully functional offline; requires online briefly for sync and QRIS generation.
