import { supabase } from './supabase';

export async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check if we can query the events table
    const { data, error } = await supabase
      .from('events')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return false;
    }

    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
} 