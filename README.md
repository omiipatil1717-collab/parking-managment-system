# SmartPark Campus — Smart Campus Parking Management System 🚗🎓

A centralized, enterprise-grade campus parking management and access control web application built for Indian universities and colleges (IITM Campus, Pune).

SmartPark Campus bridges students, faculty, staff, campus security guards, and estate administrators into a unified mobility platform with real-time verified occupancy, cryptographic digital QR passes, and automated barrier operations.

---

## 🌟 Key Architecture & Capabilities

### 1. Verification-First Occupancy Tracking
Unlike conventional parking systems that estimate occupancy based on assumptions, SmartPark Campus computes live availability strictly from **verified physical gate check-in and check-out events** logged by campus security personnel and optical ANPR sensors:
$$\text{Available Now} = \max(0, \text{Usable Capacity} - \text{Verified Active Sessions})$$
- Distinguishes **Total Configured Capacity**, **Usable Capacity** (excluding bays under maintenance/cordoned), **Physically Parked Sessions**, and **Advance Reservations**.
- Built-in discrepancy reconciliation tool for estate administrators with an immutable audit log.

### 2. Concurrency-Safe Reservation Engine
- Database row-locking and transaction isolation preventing capacity overselling.
- Space-specific conflict prevention for individual bay assignments (2W, 4W, EV Fast Charger, Accessible/Divyangjan, Faculty Reserved).
- Configurable booking windows (up to 8 hours duration, up to 3 days in advance).
- Strict validation of campus operating hours, vehicle ownership, and allowed vehicle categories.

### 3. Cryptographic Digital QR Passes & Gate ANPR Control
- Generates unique, unpredictable verification hashes for every confirmed reservation without exposing sensitive personal identifiable information (PII) in QR payloads.
- Atomic guard check-in and check-out workflows: validates booking time windows (with 30-min arrival grace), vehicle registration plates, and permitted sectors.
- Supports camera stream scanning with optical viewfinder, rapid simulator test passes, and manual code lookup.

### 4. Interactive Campus Mobility Map
- Rich interactive SVG campus map rendering all 5 university sectors:
  - **Zone A:** North Academic Quad (CSE, AI Labs, 4W & EV)
  - **Zone B:** Tech Park & Research Hub (Fast Charging EV Bays)
  - **Zone C:** Main Library Plaza (Solar Canopy, 2W & 4W)
  - **Zone D:** Faculty & Staff Enclave (Reserved Bays)
  - **Zone E:** Sports Arena (High-capacity 2-Wheeler Zone)
- Live color-coded occupancy badges (Emerald = Available, Amber = Fast Filling, Red = Full).

### 5. Multi-Persona Role-Based Access Control (RBAC)
Supports 6 dedicated roles with strict route guards:
1. **Student** — Reserve slots, manage 2W/4W vehicles, access digital QR tickets.
2. **Faculty** — Reserved parking bays in Zone D, priority EV charging access.
3. **Staff** — Campus mobility passes and administrative sector parking.
4. **Security Guard** — Dedicated Gate Terminal with barrier controls, camera QR scanner, and inbound/outbound event logs.
5. **Parking Manager** — Zone capacity management, bay maintenance cordoning, occupancy reconciliation, and analytics.
6. **Super Administrator** — Global campus settings, user role promotion, and immutable security audit logs.

*Includes a built-in interactive Persona Switcher banner allowing instant evaluation across all 6 roles with a single click.*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) + React 18 |
| **Language** | TypeScript (Strict type checking) |
| **Styling** | Tailwind CSS + shadcn/ui tokens + Lucide Icons |
| **State & Forms** | TanStack Query + React Hook Form + Zod Validation |
| **Charts** | Recharts (Hourly occupancy curves, zone allocation bars, fleet modal split) |
| **Visual Map** | Interactive Campus SVG Map with real-time telemetry |
| **QR Engine** | `qrcode.react` (High-definition generation) + Optical Scanner Viewfinder |
| **Database & Auth** | Supabase (PostgreSQL 15+, Row Level Security, Triggers, Realtime) |
| **Testing** | Vitest (Unit & engine tests) + Playwright (End-to-End browser tests) |
| **Localization** | Indian Standard Time (IST / `Asia/Kolkata`) + Indian Plate Formats (`MH 12 AB 1234`) |

---

## 🗄️ Database Schema & Migrations

The database migration file is located at:
`supabase/migrations/20261029000001_init_smartpark.sql`

Core tables:
- `profiles` — User account details linked to Supabase Auth (`student`, `faculty`, `staff`, `security_guard`, `parking_manager`, `super_admin`).
- `vehicles` — Registered campus vehicles with Indian registration plates and type constraints (`two_wheeler`, `four_wheeler`, `electric_vehicle`, `accessible`).
- `parking_zones` — Campus sectors with operational hours, geolocation coordinates, and capacity limits.
- `parking_spaces` — Individual numbered bays (`A-01`, `B-EV-01`) with spatial layout and out-of-service maintenance flags.
- `reservations` — Digital booking passes with unique reservation codes (`SPK-YYYYMMDD-XXXX`) and QR token hashes.
- `parking_sessions` — Active and completed physical parking sessions created upon gate scan.
- `gate_events` — Immutable ledger of all optical scans, approvals, and security denials.
- `notifications` — Real-time user alerts for check-ins, reminders, and overstay warnings.
- `audit_logs` — Tamper-evident administrative action log.
- `campus_settings` — Global rules: max booking hours, advance booking days, cancellation cutoff, and grace periods.

---

## 🚀 Getting Started & Launching the Application

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ (Node v24 supported)
- **npm**: v9+

### 2. Installation
Install project dependencies:
```bash
npm install
```

### 3. Environment Setup
Copy the environment template:
```bash
cp .env.example .env.local
```
*(SmartPark Campus runs out of the box with embedded high-fidelity local state. To connect your live Supabase project, simply provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).*

### 4. Running the Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Running the Automated Test Suite
Run unit tests with Vitest:
```bash
npm run test
```

Run Playwright End-to-End tests:
```bash
npm run test:e2e
```

### 6. Building for Production
Create an optimized production build:
```bash
npm run build
npm run start
```

---

## 🗺️ Route Index

### Public Routes
- `/` — Public Landing Page (Live occupancy counters, interactive map preview, how it works, FAQ)
- `/login` — Campus login with 1-click persona quick fill
- `/register` — Safe user registration (Restricted to non-privileged roles)
- `/forgot-password` — Password recovery portal

### Student & Faculty Routes
- `/dashboard` — Personal mobility dashboard (Live session alert, active passes, zone telemetry)
- `/parking` — Campus parking areas and interactive SVG map
- `/parking/[zoneId]` — Individual bay slot visualizer & reservation booking engine
- `/vehicles` — Vehicle management (Add/edit/remove Indian registration plates)
- `/reservations` — Master list of active and past passes with status filtering
- `/reservations/[reservationId]` — Printable digital QR parking pass with gate instructions
- `/history` — Complete ledger of past entry and exit sessions with IST timestamps
- `/notifications` — System announcements and gate check-in alerts
- `/profile` — Campus identity profile and persona switcher

### Security Guard Routes
- `/guard` — Security Guard Console (Active gate station selector, inbound/outbound metrics)
- `/guard/scan` — Optical camera & manual pass code scanner with barrier controls
- `/guard/entries` — Inbound vehicle entry ledger
- `/guard/exits` — Outbound vehicle departure ledger

### Parking Administrator Routes
- `/admin` — Executive Operations Dashboard with Recharts analytics
- `/admin/zones` — Zone capacity and operating hours editor
- `/admin/spaces` — Individual bay manager with maintenance/cordon toggles
- `/admin/reservations` — Master reservations ledger with administrative revocation
- `/admin/users` — Campus user directory and role promotion
- `/admin/guards` — Security guard shifts and gate barrier roster
- `/admin/sessions` — Live parked vehicles and discrepancy reconciliation tool
- `/admin/analytics` — Hourly utilization curves and fleet modal share charts
- `/admin/reports` — Exportable CSV mobility and gate security reports
- `/admin/audit-logs` — Immutable administrative audit ledger
- `/admin/settings` — Campus parking policies and buffer timers

---

## 🛡️ License & Compliance
Built for academic and enterprise deployments at IITM Campus. All vehicle data, audit logs, and access credentials comply with campus cybersecurity and data privacy regulations.

# parking-managment-system
