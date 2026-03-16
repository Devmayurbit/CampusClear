# CDGI No-Dues System

## Overview

The CDGI No-Dues System is a full-stack web application designed for Chameli Devi Group of Institutions to manage student clearance processes. The system allows students to track their no-dues status across various departments (Library, Accounts, Hostel, Academic, Sports, IT Department) before graduation. Students can register, login, view their clearance status, and manage their profiles through a modern React-based interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using **React 18** with **TypeScript** and follows a modern component-based architecture:
- **UI Framework**: Utilizes shadcn/ui component library with Radix UI primitives for consistent, accessible components
- **Styling**: Tailwind CSS with a custom CDGI purple theme and CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management with custom hooks for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **File Structure**: Organized with `pages/`, `components/ui/`, `hooks/`, and `lib/` directories using path aliases

### Backend Architecture  
The server-side implements a **RESTful API** using **Express.js** with **TypeScript**:
- **Framework**: Express.js with custom middleware for logging and error handling
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Data Storage**: Abstract storage interface allowing for pluggable storage implementations (currently in-memory with MemStorage class)
- **File Uploads**: Multer middleware for handling profile photo uploads with validation
- **API Structure**: RESTful endpoints under `/api/` prefix for auth, profile, and clearance operations

### Database Design
Uses **Drizzle ORM** with **PostgreSQL** schema definition:
- **Students Table**: Comprehensive student information including enrollment details, contact info, and academic data
- **Departments Table**: Predefined departments with customizable colors and descriptions  
- **Clearances Table**: Junction table tracking clearance status per student-department combination with requirements tracking
- **Relationships**: Foreign key constraints maintaining data integrity between students, departments, and clearances

### Development Environment
- **Build Tool**: Vite for fast development and optimized production builds
- **TypeScript**: Strict type checking across client, server, and shared modules
- **Development Server**: Hot module replacement with Vite middleware integration
- **Shared Schema**: Common TypeScript types and validation schemas shared between client and server

## External Dependencies

### Core Libraries
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight React routing library  
- **react-hook-form**: Form state management with validation
- **zod**: Runtime type validation and schema definition
- **drizzle-orm**: Type-safe SQL ORM with PostgreSQL support

### UI Components & Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library for consistent iconography

### Backend Infrastructure
- **express**: Web application framework for Node.js
- **bcryptjs**: Password hashing library for security
- **jsonwebtoken**: JWT implementation for authentication tokens
- **multer**: File upload handling middleware
- **@neondatabase/serverless**: PostgreSQL database connector optimized for serverless

### Development Tools
- **vite**: Next-generation frontend build tool
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and introspection tools
- **@replit/vite-plugin-***: Replit-specific development plugins for error handling and debugging