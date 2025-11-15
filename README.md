# Everest - Physical Activity Gamification App

Everest is a mobile app that gamifies physical activity by allowing users to embark on virtual journeys (like climbing Mt. Everest or walking across the USA) based on their real-world health data. Track your steps, distance, and elevation to complete epic adventures!

## Features

### Core Features
- ✅ **User Authentication**: Secure registration and login with Supabase Auth
- ✅ **Profile Management**: Upload profile pictures, set unit preferences (metric/imperial), and manage account settings
- ✅ **Virtual Journeys**: Browse and start epic virtual journeys based on real-world challenges
- ✅ **Progress Tracking**: Visual progress bars with gradient styling showing distance/altitude completed
- ✅ **Journey Milestones**: Track progress through key milestones along each journey
- ✅ **Multiple Active Journeys**: Start and track multiple journeys simultaneously
- ✅ **Activity Dashboard**: View comprehensive health data including steps, distance, elevation, and calories
- ✅ **Health Data Sync**: Manual data refresh with incremental updates (ready for API integrations)

### Journey Features
- ✅ **Journey Categories**: Distance-based journeys (e.g., Pacific Crest Trail) and Altitude-based journeys (e.g., Mount Everest Base Camp)
- ✅ **Premium Journeys**: Special premium journeys available for purchase
- ✅ **Journey Images**: Beautiful stock imagery for each journey
- ✅ **Journey Filters**: Filter journeys by premium/free status and category (distance/altitude)
- ✅ **Detailed Progress**: View progress statistics, days active, average per day, and milestone completion

### Social Features
- ✅ **Friends System**: Search for users, send friend requests, and manage friends
- ✅ **Friend Profiles**: View friends' journeys, milestones, and activity summaries
- ✅ **Activity Sharing**: See friends' progress and accomplishments

### UI/UX Features
- ✅ **Gradient Buttons**: Beautiful gradient-styled buttons throughout the app
- ✅ **Gradient Progress Bars**: Smooth gradient progress indicators
- ✅ **Web App Support**: Responsive web version with max-width container (800px) for better presentation
- ✅ **Modern Design**: Clean, modern interface with Material Icons
- ✅ **Smooth Animations**: Loading states and smooth transitions

## Tech Stack

- **Framework**: Expo (React Native) with Expo Router for file-based navigation
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **Language**: TypeScript
- **UI Components**: React Native with Material Icons
- **Gradients**: expo-linear-gradient for beautiful button and progress bar styling
- **Storage**: Supabase Storage for profile pictures
- **Platforms**: iOS, Android, and Web

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

1. **Install dependencies:**
```bash
npm install
```

2. **Set up Supabase:**
   - Create a Supabase project
   - Create a `.env` file with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run database migrations:**
   - Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor
   - Run additional migration scripts as needed (see `supabase/` directory)

4. **Start the development server:**
```bash
npm start
```

## Project Structure

```
everest/
├── app/                          # Expo Router screens
│   ├── (auth)/                  # Authentication screens
│   │   ├── login.tsx           # Login screen
│   │   └── register.tsx         # Registration screen
│   ├── (tabs)/                  # Main app with tab navigation
│   │   ├── home.tsx            # Dashboard with active journeys
│   │   ├── journeys.tsx         # Journey explorer with filters
│   │   ├── activity.tsx        # Health data activity page
│   │   ├── friends.tsx         # Friends search and management
│   │   ├── profile.tsx         # User profile and settings
│   │   ├── journey/[id].tsx    # Journey detail page
│   │   ├── progress/[id].tsx   # Journey progress tracking
│   │   ├── payment/[id].tsx    # Premium journey purchase
│   │   └── friend/[id].tsx     # Friend profile view
│   └── _layout.tsx             # Root layout with web container
├── components/                   # Reusable components
│   ├── GradientButton.tsx      # Gradient-styled button component
│   └── HealthDataSync.tsx      # Health data sync component
├── lib/                         # Utility functions
│   ├── supabase.ts            # Supabase client configuration
│   ├── auth.ts                # Authentication helpers
│   ├── journeys.ts            # Journey operations
│   ├── health.ts              # Health data management
│   ├── friends.ts             # Friend management
│   ├── storage.ts             # File storage (profile pictures)
│   └── reset.ts               # Data reset utilities
├── types/                       # TypeScript type definitions
│   └── index.ts               # Shared types
└── supabase/                   # Database migrations and scripts
    ├── migrations/            # Database schema migrations
    ├── populate_milestones.sql # Journey milestones data
    ├── add_premium_journeys.sql # Premium journey setup
    ├── add_journey_categories.sql # Journey categories
    └── ...                    # Additional migration scripts
```

## User Flows

### Authentication
1. **Registration**: Create a new account with email and password
2. **Login**: Sign in with existing credentials
3. **Profile Setup**: Upload profile picture and set preferences

### Journey Management
1. **Browse Journeys**: Explore available journeys with filters (premium/free, distance/altitude)
2. **View Journey Details**: See journey description, milestones, and requirements
3. **Start Journey**: Begin tracking progress (premium journeys require purchase)
4. **Track Progress**: View real-time progress with visual indicators
5. **View Milestones**: See which milestones are reached and progress toward next ones

### Activity Tracking
1. **View Activity**: See comprehensive health data summary (steps, distance, elevation, calories)
2. **Refresh Data**: Manually sync and update health data
3. **Daily Breakdown**: View activity data by day

### Social Features
1. **Search Friends**: Search for users by name or email
2. **Send Friend Requests**: Add friends to your network
3. **View Friend Profiles**: See friends' journeys, progress, and activity summaries
4. **Manage Friends**: Accept requests and remove friends

### Profile Management
1. **Edit Profile**: Update name and unit preferences
2. **Upload Picture**: Change profile picture
3. **Reset Data**: Clear all user data for testing (development feature)

## Database Schema

### Core Tables
- **profiles**: User profile information
- **journeys**: Available virtual journeys
- **journey_milestones**: Milestones for each journey
- **user_journeys**: User's journey progress and status
- **health_data**: Daily health activity data
- **health_data_sources**: Connected health data sources
- **friends**: Friend relationships and requests

### Key Features
- Row Level Security (RLS) for data protection
- Automatic timestamp tracking
- Support for multiple active journeys per user
- Journey categories (distance/altitude)
- Premium journey flags

## Available Journeys

### Distance Journeys
- **Pacific Crest Trail** (Premium): 4,265 km through California, Oregon, and Washington
- **Appalachian Trail**: 3,500 km from Georgia to Maine
- **Camino de Santiago**: 800 km pilgrimage route
- **Great Wall of China** (Premium): 21,196 km along the historic wall
- **Trans-Siberian Railway**: 9,289 km across Russia
- **Route 66**: 3,940 km iconic American highway

### Altitude Journeys
- **Mount Everest Base Camp**: 8,848 m elevation challenge

## Development

### Running the App
```bash
# Start Expo development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

### Database Migrations
All SQL migration scripts are in the `supabase/` directory. Run them in order:
1. `migrations/001_initial_schema.sql` - Core schema
2. Additional migration scripts as needed

### Testing
- Test users can be created using `supabase/create_test_users.sql`
- Use the "Reset All Data" feature in the profile for testing

## Web App Features

The app includes web support with:
- **Responsive Design**: Max-width container (800px) for better presentation
- **Tab Navigation**: Consistent bottom tab bar across all screens
- **Touch-Friendly**: Optimized for both mouse and touch interactions

## Next Steps / Roadmap

- [ ] Implement actual health data API integrations (Google Fit, Samsung Health, Garmin, Apple Health)
- [ ] Add background sync for automatic health data updates
- [ ] Create push notifications for milestone achievements
- [ ] Add more journey types and customization options
- [ ] Implement achievements and badges system
- [ ] Add journey sharing and social features
- [ ] Create journey leaderboards
- [ ] Add journey completion certificates
- [ ] Implement journey recommendations based on activity

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT
