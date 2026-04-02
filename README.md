# Agent — Ukrainian Service Marketplace

> Built on **One + Tamagui 2 + Supabase** — a full-stack, cross-platform platform for service requests and offers.

> **⚠️ v2-beta** - This stack is in active development. APIs may change.

A cross-platform app (web + iOS + Android) where users can:
- Post service **requests** (шукаю послугу) or **offers** (пропоную послугу)
- Browse and search listings by category
- Subscribe to categories and receive notifications
- Chat privately with listing owners
- Manage their own listings, subscriptions, and favorites

## Prerequisites

Before you begin, ensure you have:

- **Bun** - [Install Bun](https://bun.sh)
- **Supabase account** - [supabase.com](https://supabase.com)
- **Git** - For version control

For mobile development:

- **iOS**: macOS with Xcode 16+
- **Android**: Android Studio with JDK 17+

## Quick Start

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql` to create all tables
3. Go to **SQL Editor** and run `supabase/seed.sql` to add demo categories
4. Go to **Project Settings > API** and copy your URL and anon key

### 2. Configure environment

Copy `.env.development` and update the Supabase values:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. Start the app

```bash
bun install
bun dev          # start web dev server at http://localhost:8081
```

## Stack

- [One](https://onestack.dev) - Universal React framework (web + native)
- [Tamagui 2](https://tamagui.dev) - Universal UI components
- [Supabase](https://supabase.com) - Authentication, database (PostgreSQL), real-time chat, edge functions

## Project Structure

```
takeout-free/
├── app/                        # File-based routing (One router)
│   ├── (app)/                  # App routes
│   │   ├── auth/               # Login, signup, OAuth callback
│   │   └── home/               # Main pages
│   │       ├── (tabs)/feed/    # Home / search page
│   │       ├── search.tsx      # Search results
│   │       ├── categories.tsx  # Browse categories
│   │       ├── categories/[id] # Category detail with listings
│   │       ├── listing/[type]/[id] # Listing detail + actions
│   │       ├── chat/[id]       # Private chat
│   │       ├── subscriptions   # My subscriptions
│   │       ├── my-listings     # My requests & offers
│   │       └── settings/       # Profile & settings
│   └── api/                    # Server API routes
├── src/
│   ├── features/
│   │   ├── supabase/           # Supabase client, auth hooks, types
│   │   ├── services/           # Data hooks (categories, requests, offers, chat, etc.)
│   │   ├── app/                # Header, navigation
│   │   └── auth/ui/            # Profile modal
│   ├── interface/              # Reusable UI components
│   ├── tamagui/                # Theme configuration
│   └── constants/              # App constants
├── supabase/
│   ├── schema.sql              # Full database schema + RLS policies
│   ├── seed.sql                # Demo categories
│   ├── config.toml             # Supabase local config
│   └── functions/
│       ├── categorize/         # Edge function: auto-categorize user input
│       └── subscribe/          # Edge function: manage category subscriptions
└── assets/                     # Images, fonts, splash screens
```

## Common Commands

```bash
# development
bun dev                      # start web + mobile dev server
bun ios                      # run iOS simulator
bun android                  # run Android emulator

# code quality
bun check                    # typescript type checking
bun lint                     # run oxlint

# testing
bun test:unit                # unit tests
```

## Environment Configuration

### File Structure

- `.env.development` - Development defaults (committed)
- `.env` - Active environment (generated, gitignored)
- `.env.local` - Personal secrets/overrides (gitignored)

### Key Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# server
ONE_SERVER_URL=http://localhost:8081
```

## Supabase Edge Functions

### `categorize` (POST)
Analyzes user input text, determines if it's a service request or offer, identifies the category, extracts location and period, creates the listing, and auto-subscribes the user.

```json
{ "text": "Шукаю репетитора з математики в Києві", "userId": "uuid" }
```

### `subscribe` (POST)
Creates or updates a subscription to a category.

```json
{ "userId": "uuid", "categoryId": "uuid", "subscriptionType": "both", "notes": "уточнення" }
```

To deploy edge functions:
```bash
supabase functions deploy categorize
supabase functions deploy subscribe
```

## Authentication

Authentication is handled by Supabase Auth:
- **Email + Password** 
- **Magic Link** (passwordless email)
- **Google OAuth** (configure in Supabase Dashboard > Authentication > Providers)

## Features

- 🔍 **Service search** - Full-text search across requests and offers
- 📂 **Categories** - 8 categories for both requests and offers
- 🔔 **Subscriptions** - Subscribe to categories, get notified of new listings
- 💬 **Private chat** - Real-time messaging between users (Supabase Realtime)
- ⭐ **Favorites** - Save listings for later
- 🚩 **Reports** - Report inappropriate content
- 🔒 **Blocked users** - Block and manage blocked users
- 📱 **Cross-platform** - Works on web, iOS, and Android

## License

MIT


A full-stack, cross-platform starter kit for building modern web and mobile
applications with React Native.

## Prerequisites

Before you begin, ensure you have:

- **Bun** - [Install Bun](https://bun.sh)
- **Docker** - [Install Docker](https://docs.docker.com/get-docker/) (on macOS,
  we recommend [OrbStack](https://orbstack.dev) as a faster alternative)
- **Git** - For version control

For mobile development:

- **iOS**: macOS with Xcode 16+
- **Android**: Android Studio with JDK 17+

## Quick Start

```bash
bun install
bun backend      # start docker services (postgres, zero)
bun dev          # start web dev server at http://localhost:8092
```

## Stack

At a high level, the primary technologies used are:

- [One](https://onestack.dev) - Universal React framework
- [Zero](https://zero.rocicorp.dev) - Real-time sync
- [Tamagui](https://tamagui.dev) - Universal UI
- [Better Auth](https://www.better-auth.com) - Authentication
- [Drizzle ORM](https://orm.drizzle.team) - Database schema

## Project Structure

```
takeout-free/
├── app/                   # File-based routing (One router)
│   ├── (app)/             # Authenticated routes
│   │   ├── auth/          # Login flows
│   │   └── home/          # Main app tabs
│   └── api/               # API routes
├── src/
│   ├── features/          # Feature modules (auth, todo, theme)
│   ├── interface/         # Reusable UI components
│   ├── database/          # Database schema and migrations
│   ├── data/              # Zero schema, models, and queries
│   ├── zero/              # Real-time sync configuration
│   ├── server/            # Server-side code
│   └── tamagui/           # Theme configuration
├── scripts/               # CI/CD and helper scripts
├── docs/                  # Documentation
└── assets/                # Images, fonts, splash screens
```

## Common Commands

```bash
# development
bun dev                      # start web + mobile dev server
bun ios                      # run iOS simulator
bun android                  # run Android emulator
bun backend                  # start docker services

# code quality
bun check                    # typescript type checking
bun lint                     # run oxlint
bun lint:fix                 # auto-fix linting issues

# testing
bun test:unit                # unit tests
bun test:integration         # integration tests

# database
bun migrate                  # build and run migrations

# deployment
bun ci --dry-run             # run full CI pipeline without deploy
bun ci                       # full CI/CD with deployment
```

## Database

### Local Development

PostgreSQL runs in Docker on port 5444:

- Main database: `postgresql://user:password@localhost:5444/postgres`
- Zero sync databases: `zero_cvr` and `zero_cdb`

### Migrations

Update your schema in:

- `src/database/schema-public.ts` - Public tables (exposed to Zero/client)
- `src/database/schema-private.ts` - Private tables

Then run:

```bash
bun migrate
```

## Environment Configuration

### File Structure

- `.env.development` - Development defaults (committed)
- `.env` - Active environment (generated, gitignored)
- `.env.local` - Personal secrets/overrides (gitignored)
- `.env.production` - Production config (gitignored)
- `.env.production.example` - Production template (committed)

### Key Variables

```bash
# authentication
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=<url>

# server
ONE_SERVER_URL=<url>

# zero
ZERO_UPSTREAM_DB=<connection-string>
ZERO_CVR_DB=<connection-string>
ZERO_CHANGE_DB=<connection-string>

# storage (S3/R2)
CLOUDFLARE_R2_ENDPOINT=<endpoint>
CLOUDFLARE_R2_ACCESS_KEY=<key>
CLOUDFLARE_R2_SECRET_KEY=<secret>
```

See `.env.production.example` for complete production configuration.

## Mobile Apps

### iOS

```bash
bun ios          # run in simulator
```

Requires macOS, Xcode 16+, and iOS 17.0+ deployment target.

### Android

```bash
bun android      # run in emulator
```

Requires Android Studio, JDK 17+, and Android SDK 34+.

## Adding Features

### Data Models

1. Add schema to `src/database/schema-public.ts`
2. Run `bun migrate`
3. Add Zero model to `src/data/models/`
4. Run `bun zero:generate`
5. Use queries in your components

### UI Components

Reusable components live in `src/interface/`. Use components from there rather
than importing directly from Tamagui when possible.

### Icons

This project uses [Phosphor Icons](https://phosphoricons.com/). Icons are in
`src/interface/icons/phosphor/`.

## License

MIT
