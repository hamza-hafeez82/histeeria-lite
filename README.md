<div align="center">
  <img src="public/assets/images/logo.png" alt="Histeeria Logo" width="120" />
  <h1>Histeeria</h1>
  <p><strong>A modern, high-performance social networking platform built with PHP and Supabase.</strong></p>
</div>

## Overview

Histeeria is a lightweight yet powerful social media engine featuring real-time interactions, persistent state management, and a premium UI/UX. Engineered for speed and scalability, the architecture uses a vanilla PHP routing layer connected directly to a Supabase PostgreSQL backend.

## Core Features

- **Robust Authentication:** Secure JWT-based authentication, password recovery, and email verification powered by Supabase Auth.
- **Dynamic Feed Engine:** Instagram-style post feed supporting images and videos with auto-playing scroll observation and interactive overlays.
- **Social Graph:** Persistent follower/following mechanics with real-time profile statistics.
- **Real-Time Search:** Debounced global user discovery leveraging ILIKE indexing.
- **Premium Design System:** Fully responsive, dark-mode first UI using modern CSS variables, glassmorphism, and smooth micro-animations.

## 🛠 Tech Stack

- **Backend / Routing:** PHP 8.2+
- **Database / Auth / Storage:** Supabase (PostgreSQL)
- **Frontend / Styling:** Vanilla JavaScript, Native CSS3 (CSS Variables)
- **Icons:** Lucide Icons

## Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hamza-hafeez82/histeeria-lite.git
   cd histeeria-lite
   ```

2. **Configure Environment:**
   Create an `.env` file at the root of the project with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Initialize Database:**
   Run the `sql/schema.sql` file in your Supabase SQL Editor to provision the necessary tables, storage buckets, and RLS policies.

4. **Run the local development server:**
   ```bash
   php -S localhost:8000 -t public
   ```

## Deployment (Railway)

Histeeria is pre-configured for zero-downtime deployment on [Railway](https://railway.app). The included `nixpacks.toml` automatically provisions the PHP 8 runtime and serves the application from the `public` directory.

1. Connect your GitHub repository to a new Railway project.
2. Railway will automatically detect the `nixpacks.toml` file and build the app.
3. Add your `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables in the Railway dashboard.
4. Deploy!

## Security

Row Level Security (RLS) is strictly enforced at the database level. Client-side requests are authenticated via Supabase JWTs. All password storage and session management are handled securely by GoTrue.

## License

This project is licensed under the MIT License.

## Built With ❤️ by Hamza Hafeez