import { supabase } from './supabase';

/**
 * Reset all user data - deletes health data and journey progress
 * WARNING: This is irreversible!
 */
export const resetAllUserData = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  console.log('Starting data reset for user:', user.id);

  // Delete all user journeys FIRST (including active ones)
  // First, check what exists
  const { data: journeysBeforeDelete } = await supabase
    .from('user_journeys')
    .select('id, is_active, journey_id')
    .eq('user_id', user.id);

  console.log('User journeys before delete:', journeysBeforeDelete?.length || 0, journeysBeforeDelete);

  // Delete all user journeys
  const { error: journeysError, data: deletedJourneys } = await supabase
    .from('user_journeys')
    .delete()
    .eq('user_id', user.id)
    .select();

  if (journeysError) {
    console.error('Error deleting user journeys:', journeysError);
    throw new Error(`Failed to delete journey progress: ${journeysError.message}`);
  }

  console.log('Deleted user journeys:', deletedJourneys?.length || 0);

  // Wait a moment for database to commit
  await new Promise(resolve => setTimeout(resolve, 200));

  // Verify deletion - try multiple times if needed
  let attempts = 0;
  let journeysAfterDelete: any[] = [];
  while (attempts < 3) {
    const { data } = await supabase
      .from('user_journeys')
      .select('id')
      .eq('user_id', user.id);
    
    journeysAfterDelete = data || [];
    
    if (journeysAfterDelete.length === 0) {
      break;
    }
    
    attempts++;
    console.log(`Verification attempt ${attempts}: ${journeysAfterDelete.length} journeys still exist`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  if (journeysAfterDelete.length > 0) {
    console.error('Journeys still exist after delete:', journeysAfterDelete);
    throw new Error(`Failed to delete all user journeys. ${journeysAfterDelete.length} still exist.`);
  }

  console.log('Verified: All user journeys deleted');

  // Delete all health data for the user
  const { error: healthError } = await supabase
    .from('health_data')
    .delete()
    .eq('user_id', user.id);

  if (healthError) {
    console.error('Error deleting health data:', healthError);
    throw new Error(`Failed to delete health data: ${healthError.message}`);
  }

  console.log('Deleted health data');

  // Delete all health data sources connections
  const { error: sourcesError } = await supabase
    .from('health_data_sources')
    .delete()
    .eq('user_id', user.id);

  if (sourcesError) {
    console.error('Error deleting health data sources:', sourcesError);
    // Don't throw - this is less critical
  }

  console.log('Data reset completed successfully');
};

