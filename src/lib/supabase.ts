import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ldbthhnykxrbpnhuvdxj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_38L4KLMsMoKPeDQMCpodRQ_NfxE7Y8Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_PROJECT_ID = 'ldbthhnykxrbpnhuvdxj';
export const SUPABASE_SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`;

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.from('orders').select('id').limit(1);
    if (!error) {
      return { connected: true, tablesExist: true };
    }
    // Check if error is because table doesn't exist
    if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
      return {
        connected: true,
        tablesExist: false,
        error: 'جداول قاعدة البيانات غير منشأة بعد في Supabase',
      };
    }
    return {
      connected: false,
      tablesExist: false,
      error: error.message,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل الاتصال بقاعدة البيانات';
    return {
      connected: false,
      tablesExist: false,
      error: message,
    };
  }
}
