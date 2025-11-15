# Creating Test Users for Friends Feature

To create test users with journeys and health data, follow these steps:

## Step 1: Create Users in Supabase Auth

Go to your Supabase Dashboard → Authentication → Users → Add User

Create the following 5 test users:

1. **Sarah Johnson**
   - Email: `sarah.johnson@test.com`
   - Password: `TestPassword123!`
   - Full Name: `Sarah Johnson`

2. **Mike Chen**
   - Email: `mike.chen@test.com`
   - Password: `TestPassword123!`
   - Full Name: `Mike Chen`

3. **Emma Wilson**
   - Email: `emma.wilson@test.com`
   - Password: `TestPassword123!`
   - Full Name: `Emma Wilson`

4. **David Martinez**
   - Email: `david.martinez@test.com`
   - Password: `TestPassword123!`
   - Full Name: `David Martinez`

5. **Lisa Anderson**
   - Email: `lisa.anderson@test.com`
   - Password: `TestPassword123!`
   - Full Name: `Lisa Anderson`

## Step 2: Run SQL Scripts

After creating the users, run these SQL scripts in order:

1. `add_friends_schema.sql` - Creates the friends table and RLS policies
2. `create_test_users.sql` - Adds profiles, journeys, and health data for test users

The `create_test_users.sql` script will:
- Create/update profiles for each test user
- Assign each user an active journey:
  - Sarah: Mount Everest Base Camp (45km progress)
  - Mike: Pacific Crest Trail (1,250km progress) - Premium
  - Emma: Appalachian Trail (980km progress)
  - David: Camino de Santiago (320km progress)
  - Lisa: Great Wall of China (3,500km progress) - Premium
- Add health data for the last 5 days for each user

## Notes

- The test users will have realistic progress on their journeys
- Each user has health data showing steps, distance, elevation, and calories
- The script is idempotent and can be run multiple times safely

