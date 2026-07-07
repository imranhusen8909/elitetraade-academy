import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://udewoogscrgjcnmuvbbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZXdvb2dzY3JnamNubXV2YmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDQyNjksImV4cCI6MjA5OTAyMDI2OX0.mMWW5OBAXZUM8rJw0VARDrLpgKHx50OctIdcgTU3FWE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);