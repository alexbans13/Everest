# Everest - Gamified Walking App

A mobile app built with Expo that gamifies walking and physical activities by tracking progress through virtual journeys like climbing Mount Everest or walking Route 66.

## Tech Stack

- **Framework**: Expo (React Native)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI**: React Native Paper
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Notifications**: Expo Notifications

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/schema.sql` to create all tables and RLS policies
4. Run the SQL from `supabase/seed.sql` to seed initial journey data (Mt. Everest and Route 66)

### 3. Configure Environment

The Supabase credentials are already configured in `lib/supabase.ts`:
- Project URL: `https://doquvglaefcnrsveqbjz.supabase.co`
- Anon Key: Already set

### 4. Run the App

```bash
# Start the Expo development server
npm start

# Run on Android
npm run android

# Run on iOS (requires macOS)
npm run ios

# Run on web
npm run web
```

## Features

- **User Authentication**: Sign up and sign in with Supabase Auth
- **Journey Selection**: Choose from available journeys (Mt. Everest, Route 66)
- **Progress Tracking**: Track distance traveled, percentage complete, and remaining distance
- **Milestones**: Achieve milestones along your journey with descriptions
- **Health Data Integration**: Connect to Google Fit, Samsung Health, or Apple Health (placeholders for now)
- **Push Notifications**: Receive notifications when milestones are achieved
- **Manual Refresh**: Button to manually refresh health data for testing

## Project Structure

```
Everest/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── lib/                   # Utilities and config
│   ├── supabase.ts        # Supabase client
│   ├── health-api.ts      # Health API abstraction
│   └── notifications.ts   # Push notifications
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── supabase/              # Database migrations and seeds
```

## Health API Integration

The app includes placeholder implementations for:
- Google Fit API
- Samsung Health API
- Apple Health (iOS only)

To implement actual integrations:
1. Set up OAuth for Google Fit
2. Install Samsung Health SDK
3. Configure HealthKit permissions for Apple Health
4. Update the functions in `lib/health-api.ts`

Currently, the app uses mock data in development mode for testing.

## Database Schema

The app uses the following main tables:
- `profiles` - User profiles
- `journeys` - Available journeys
- `milestones` - Milestones for each journey
- `user_journeys` - User's active/completed journeys
- `user_milestones` - Achieved milestones
- `health_sources` - Connected health API sources

## Next Steps

1. Run the database migrations in Supabase
2. Test the authentication flow
3. Start a journey and test progress tracking
4. Implement actual health API integrations
5. Configure push notifications for production

## Notes

- The app requests notification permissions on startup
- Health data syncs automatically when the app opens (if a health source is connected)
- Manual refresh button is available in the Active Journey screen for testing
- Milestone achievements trigger push notifications

