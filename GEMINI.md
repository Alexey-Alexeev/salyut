# GEMINI.md

## Project Overview

This is a full-stack e-commerce application for selling fireworks, named "FireWorks". It's built with a modern tech stack, featuring a Next.js frontend and a Supabase backend. The application is designed to be responsive and SEO-friendly, with a separate admin panel for managing products, orders, and customers.

**Key Technologies:**

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **UI Components:** Radix UI
- **Notifications:** Sonner

## Building and Running

### Prerequisites

- Node.js (v18.x or higher)
- npm

### Setup

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the following variables:

    ```env
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    DATABASE_URL=your_database_connection_string

    # Telegram Bot Configuration (for order notifications)
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token
    TELEGRAM_CHAT_ID=your_telegram_chat_id
    TELEGRAM_ADMIN_USER_ID=your_telegram_user_id

    # Cloudflare Stream Configuration (for video reviews)
    CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
    CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

    # Next.js Configuration
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    ```

3.  **Set up the database:**
    Run the following command to apply the database schema:
    ```bash
    npx drizzle-kit push
    ```

### Running the application

- **Development:**

  ```bash
  npm run dev
  ```

  The application will be available at `http://localhost:3000`.

- **Production:**
  ```bash
  npm run build
  npm run start
  ```

### Database Commands

- **Generate migrations:**
  ```bash
  npm run db:generate
  ```
- **Apply migrations:**
  ```bash
  npm run db:migrate
  ```
- **Push schema changes:**
  ```bash
  npm run db:push
  ```
- **Seed the database:**
  ```bash
  npm run db:seed
  ```

## Development Conventions

- **Code Style:** The project uses ESLint and Prettier for code formatting and linting. Run `npm run lint` to check for issues.
- **Branching:** (TODO: Add branching strategy if available)
- **Commits:** (TODO: Add commit message conventions if available)
- **Testing:** (TODO: Add testing strategy and commands if available)
