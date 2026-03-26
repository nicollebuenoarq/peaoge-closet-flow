import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zkwddwunqommlgidtxig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprd2Rkd3VucW9tbWxnaWR0eGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzYzNjIsImV4cCI6MjA5MDA1MjM2Mn0.InzghOBB5_2Bp4BD5oABDDUTAeoVeE0X1u7mzAVPA7g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
