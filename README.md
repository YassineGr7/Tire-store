# 🛞 TireStore — Inventory & Warehouse Management System

TireStore is a modern web application designed to streamline tire inventory tracking, multi-warehouse stock control, supplier/customer management, and transaction handling with PDF invoicing.

Built with **Laravel**, **Inertia.js**, and **React**, it offers a seamless single-page application (SPA) experience backed by a robust PHP backend.

---

## 🌟 Key Features

### 🔐 Authentication & Access Control
- **Dual Authentication Methods:** Classic Email/Password registration & login alongside **Google OAuth** (Laravel Socialite).
- **Route Protection:** Built-in middleware restricting administrative pages to authenticated users only.
- **User Profiles:** Dynamic avatars with Google profile image fallback and user initial badges.

### 🛞 Tire & Inventory Management
- **Stock Tracking:** Monitor tire inventories, specifications, and availability across locations.
- **Bulk Import:** Fast CSV/Excel import tools to batch-update tire stocks.
- **Brand Management:** Complete CRUD management for tire manufacturers and brands.

### 🏭 Warehouse & Stock Distribution
- **Multi-Warehouse Support:** Create and manage multiple warehouse locations.
- **Pivot Stock Control:** Attach or detach specific tire stock to/from distinct warehouses.
- **Detailed Warehouse Views:** Real-time stock counts per warehouse.

### 💸 Transactions & Invoicing
- **Sales & Purchases:** Record incoming stock from suppliers and outgoing sales to customers.
- **Automated Stock Adjustments:** Inventory levels update automatically based on transaction types.
- **Transaction Rollback:** Cancel transactions with automated stock reversal.
- **PDF Invoicing:** Generate and download PDF invoices for completed sales.

### 👥 Customer & Supplier Management (Contacts)
- Centralized directory for managing both customer profiles and supplier relationships.

---

## 🛠️ Tech Stack

- **Backend:** [Laravel 11](https://laravel.com/) (PHP)
- **Frontend Bridge:** [Inertia.js](https://inertiajs.com/)
- **Frontend Framework:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Tabler Icons](https://tabler.io/icons)
- **Database:** MySQL
- **Packages Used:** 
  - `laravel/socialite` (Google OAuth)
  - `barryvdh/laravel-dompdf` (PDF generation)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed on your machine:
- **PHP** >= 8.2
- **Composer**
- **Node.js** (v18+ recommended) & **NPM**
- **MySQL Database**

---

### Installation Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/tireStore.git](https://github.com/YOUR_USERNAME/tireStore.git)
   cd tireStore