# ERP System

A modern ERP (Enterprise Resource Planning) web application built with Next.js, React, Hono, and MongoDB. It provides modules for managing customers, enquiries, quotations, purchase orders, supplier delivery challans, companies, and user authentication/authorization.

## Features

- **User Authentication & Authorization**: Role-based access (admin, manager, employee, etc.) with granular privileges.
- **Customer Management**: Add, edit, view, and manage customers, including file attachments (PDF, DOC, XLS, images, etc.).
- **Enquiries**: Track customer requirements, upload related files, and manage enquiry lifecycle.
- **Quotations**: Generate, edit, and export quotations linked to enquiries and customers.
- **Purchase Orders**: Manage purchase orders with itemized details and filters.
- **Supplier Delivery Challans (DCs)**: Track supplier DCs with work order management.
- **Company Management**: Store and manage company details.
- **File Upload/Download**: Secure file upload/download for customer attachments (max 10MB, type-restricted).
- **PDF/Excel Export**: Export data and documents as PDF or Excel.
- **Responsive UI**: Built with React, Tailwind CSS, and Radix UI for a modern, responsive experience.

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS, Radix UI, React Query, Zod
- **Backend**: Hono (API routes), MongoDB (Mongoose ODM)
- **Authentication**: JWT, HTTP-only cookies
- **File Handling**: Multer, Node.js fs
- **PDF/Excel**: @react-pdf/renderer, xlsx-js-style

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd erp
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `.example.env` to `.env` and update values as needed:
     ```bash
     cp .example.env .env
     ```
   - Required variables:
     - `MONGODB_URI` (MongoDB connection string)
     - `NEXT_PUBLIC_APP_MOCK_API` (set to `false` for production)
     - Listing page limits, debounce delay, etc.
4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Access modules from the sidebar: Customers, Enquiries, Quotations, Purchase Orders, Supplier DCs, Companies, Settings.
- Use the file manager in the customer details page to upload/download/delete attachments.
- Export quotations/enquiries as PDF or Excel.
- Manage users and roles from the settings (admin only).

## File Upload/Download
- Allowed types: PDF, DOC, DOCX, XLS, XLSX, images (JPG, PNG, GIF), TXT, CSV
- Max file size: 10MB per file
- Files are stored in `/uploads/customers/` on the server

## Authentication
- JWT-based authentication with HTTP-only cookies
- Role-based access control (admin, manager, employee, etc.)
- Register/login via `/register` and `/login` routes

## Database
- MongoDB (see `MONGODB_URI` in `.env`)
- Models: Customer, Enquiry, Quotation, PurchaseOrder, SupplierDc, Company, User

## Scripts
- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm start` – Start production server
- `npm run lint` – Lint codebase

## Contributing
1. Fork the repo and create your branch from `main`.
2. Make your changes and add tests if applicable.
3. Run `npm run lint` and ensure all checks pass.
4. Submit a pull request.
