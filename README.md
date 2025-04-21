# UniHub Event Management

A modern event management system built with Next.js, React, and Supabase, designed for university events and activities.

## Features

- User Authentication with Google OAuth
- Event Creation and Management
- Event Registration System
- Real-time Notifications
- Admin Dashboard
- Responsive Design

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Authentication, Real-time subscriptions)
- **Authentication:** Google OAuth
- **Styling:** Tailwind CSS, Shadcn UI

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

## Environment Setup

1. Clone the repository
2. Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. Run the SQL migrations in your Supabase project:
   - Navigate to the SQL editor in your Supabase dashboard
   - Execute the migration files found in `/supabase/migrations`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
