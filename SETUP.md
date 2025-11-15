# Everest App Setup Guide

This guide will help you set up the Everest mobile app for development.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier works)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your Project URL and anon/public key
4. Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Run Database Migrations

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it in the SQL Editor
4. This will create all necessary tables, indexes, and sample data

## Step 4: Create App Assets

You'll need to create placeholder images for the app. Create an `assets` folder and add:

- `icon.png` (1024x1024) - App icon
- `splash.png` (1284x2778) - Splash screen
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (48x48) - Web favicon

You can use any image editor or online tools to create these. For now, you can use simple colored squares as placeholders.

## Step 5: Start the Development Server

```bash
npm start
```

Then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan the QR code with Expo Go app on your physical device

## Project Structure

```
everest/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Main app tabs
│   │   ├── home.tsx
│   │   ├── journeys.tsx
│   │   └── profile.tsx
│   ├── journey/[id].tsx   # Journey detail screen
│   ├── progress/[id].tsx  # Progress tracking screen
│   └── _layout.tsx        # Root layout
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts           # Authentication functions
│   ├── journeys.ts       # Journey-related functions
│   └── health.ts         # Health data functions
├── components/           # Reusable components
│   └── HealthDataSync.tsx
├── types/                # TypeScript definitions
│   └── index.ts
└── supabase/            # Database migrations
    └── migrations/
        └── 001_initial_schema.sql
```

## Core Features Implemented

✅ User authentication (sign up, login, logout)
✅ User profile management (view and edit)
✅ Browse available journeys
✅ Start a journey
✅ View journey progress with visualizations
✅ Health data source connection structure
✅ Database schema with RLS policies

## Next Steps for Health Data Integration

The app structure is ready for health data integration. To connect actual health data sources:

1. **Google Fit**: Use `expo-google-fit` or Google Fit REST API
2. **Samsung Health**: Use Samsung Health SDK
3. **Garmin**: Use Garmin Connect API
4. **Apple Health**: Use `expo-health` (iOS only)

You'll need to:
- Implement OAuth flows for each service
- Create background sync jobs
- Update the `syncHealthData` function in `lib/health.ts`
- Automatically update journey progress when health data is synced

## Testing

1. Create a test account using the register screen
2. Browse available journeys
3. Start a journey
4. View your progress (currently shows 0% until health data is connected)

## Troubleshooting

- **"Module not found"**: Run `npm install` again
- **Supabase connection errors**: Check your `.env` file has correct credentials
- **Database errors**: Make sure you've run the migration SQL script
- **Icons not showing**: Make sure `@expo/vector-icons` is installed

## Development Notes

- The app uses Expo Router for file-based routing
- Authentication state is managed by Supabase
- All database queries use Row Level Security (RLS)
- Health data syncing is structured but needs actual API integration
- Journey progress updates need to be triggered by health data syncs

