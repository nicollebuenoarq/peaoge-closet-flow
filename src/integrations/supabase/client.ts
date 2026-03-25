import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zkwddwunqommlgidtxig.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dW7AUSgiWw4ApJYmpRUBIQ_jW_144qA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
