# Everest - Physical Activity Gamification App

Everest is a mobile app that gamifies physical activity by allowing users to embark on virtual journeys (like climbing Mt. Everest or walking across the USA) based on their real-world health data.

## Features

- ✅ User authentication and profile management
- ✅ Browse and start virtual journeys
- ✅ Track progress with visual progress bars
- ✅ View journey statistics and details
- 🔄 Health data integration structure (ready for Google Fit, Samsung Health, Garmin, etc.)

## Tech Stack

- **Framework**: Expo (React Native) with Expo Router
- **Database & Auth**: Supabase
- **Language**: TypeScript
- **UI**: React Native with Material Icons

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase and create a `.env` file (see SETUP.md)

3. Run database migrations in Supabase SQL Editor

4. Start the development server:
```bash
npm start
```

## Project Structure

```
everest/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login & Register
│   ├── (tabs)/            # Main app (Home, Journeys, Profile)
│   ├── journey/[id].tsx   # Journey detail
│   └── progress/[id].tsx  # Progress tracking
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts           # Authentication
│   ├── journeys.ts       # Journey operations
│   └── health.ts         # Health data sync
├── components/           # Reusable components
├── types/                # TypeScript definitions
└── supabase/            # Database migrations
```

## User Flows

1. **Registration/Login**: Create account or sign in
2. **Profile**: View and edit user profile
3. **Browse Journeys**: See available virtual journeys
4. **Start Journey**: Begin tracking progress on a journey
5. **View Progress**: See distance completed, remaining, and statistics

## Next Steps

- Implement actual health data API integrations
- Add background sync for health data
- Create automatic journey progress updates
- Add more journey types and customization
- Implement achievements and badges

## License

MIT

