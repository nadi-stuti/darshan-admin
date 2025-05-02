# Darshan Admin Dashboard

A Next.js admin dashboard for managing destinations, events, and user data.

## Features

- Email and password authentication
- Dashboard for managing destinations with translations and images
- Event management with multilingual descriptions
- User requests and saved places tracking
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd darshan-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js app directory containing all pages and layouts
- `lib/` - Utility functions and configurations
- `public/` - Static assets
- `database.types.ts` - TypeScript types for the database schema

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Authentication

The dashboard uses Supabase authentication. To access the dashboard:

1. Navigate to `/login`
2. Enter your admin credentials
3. You'll be redirected to the dashboard upon successful login

## Database Schema

The application uses the following main tables:

- `users` - User accounts
- `destinations` - Temple destinations
- `destination_translations` - Multilingual content for destinations
- `destination_images` - Images for destinations
- `events` - Temple events
- `event_translations` - Multilingual content for events
- `user_requests` - User requests and feedback
- `saved_places` - User saved destinations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 